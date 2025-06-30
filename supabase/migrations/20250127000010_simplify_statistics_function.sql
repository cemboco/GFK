/*
  # Simplify Statistics Function to Fix Type Errors

  Problem: Complex return types causing "structure of query does not match function result type"
  Solution: Create simple functions that return basic data types
*/

-- Drop the complex function first
DROP FUNCTION IF EXISTS public.calculate_gfk_level(UUID, BOOLEAN);

-- Create a simple function for basic user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id_param UUID DEFAULT NULL)
RETURNS TABLE(
  total_transformations INTEGER,
  current_level TEXT,
  weekly_activity INTEGER,
  monthly_activity INTEGER,
  last_activity TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(up.total_transformations, 0)::INTEGER,
    CASE 
      WHEN COALESCE(up.total_transformations, 0) < 10 THEN 'Anfänger'
      WHEN COALESCE(up.total_transformations, 0) < 25 THEN 'Lernender'
      WHEN COALESCE(up.total_transformations, 0) < 50 THEN 'Fortgeschritten'
      WHEN COALESCE(up.total_transformations, 0) < 100 THEN 'Profi'
      WHEN COALESCE(up.total_transformations, 0) < 200 THEN 'Experte'
      ELSE 'GFK Meister'
    END::TEXT,
    COALESCE(COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '7 days'), 0)::INTEGER,
    COALESCE(COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '30 days'), 0)::INTEGER,
    up.last_activity
  FROM user_progress up
  LEFT JOIN messages m ON up.user_id = m.user_id
  WHERE up.user_id = COALESCE(user_id_param, auth.uid())
  GROUP BY up.total_transformations, up.last_activity;
END;
$$;

-- Create a simple function for global statistics
CREATE OR REPLACE FUNCTION public.get_global_stats()
RETURNS TABLE(
  total_users INTEGER,
  total_transformations INTEGER,
  avg_transformations_per_user NUMERIC,
  most_active_level TEXT
) 
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT up.user_id)::INTEGER,
    COALESCE(SUM(up.total_transformations), 0)::INTEGER,
    CASE 
      WHEN COUNT(DISTINCT up.user_id) > 0 THEN 
        (COALESCE(SUM(up.total_transformations), 0)::NUMERIC / COUNT(DISTINCT up.user_id))::NUMERIC(10,2)
      ELSE 0::NUMERIC(10,2)
    END,
    CASE 
      WHEN COUNT(*) > 0 THEN
        (SELECT 
          CASE 
            WHEN avg_transformations < 10 THEN 'Anfänger'
            WHEN avg_transformations < 25 THEN 'Lernender'
            WHEN avg_transformations < 50 THEN 'Fortgeschritten'
            WHEN avg_transformations < 100 THEN 'Profi'
            WHEN avg_transformations < 200 THEN 'Experte'
            ELSE 'GFK Meister'
          END
        FROM (
          SELECT AVG(total_transformations) as avg_transformations
          FROM user_progress
        ) sub)
      ELSE 'Anfänger'
    END::TEXT
  FROM user_progress up;
END;
$$;

-- Create a simple function for user progress
CREATE OR REPLACE FUNCTION public.get_user_progress(user_id_param UUID DEFAULT NULL)
RETURNS TABLE(
  level_name TEXT,
  progress_percentage INTEGER,
  next_level TEXT,
  transformations_needed INTEGER
) 
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  user_transformations INTEGER;
  current_level_name TEXT;
BEGIN
  -- Get user's total transformations
  SELECT COALESCE(total_transformations, 0) INTO user_transformations
  FROM user_progress 
  WHERE user_id = COALESCE(user_id_param, auth.uid());

  -- Determine current level
  current_level_name := CASE 
    WHEN user_transformations < 10 THEN 'Anfänger'
    WHEN user_transformations < 25 THEN 'Lernender'
    WHEN user_transformations < 50 THEN 'Fortgeschritten'
    WHEN user_transformations < 100 THEN 'Profi'
    WHEN user_transformations < 200 THEN 'Experte'
    ELSE 'GFK Meister'
  END;

  RETURN QUERY
  SELECT 
    current_level_name::TEXT,
    CASE 
      WHEN current_level_name = 'Anfänger' THEN (user_transformations * 100) / 10
      WHEN current_level_name = 'Lernender' THEN ((user_transformations - 10) * 100) / 15
      WHEN current_level_name = 'Fortgeschritten' THEN ((user_transformations - 25) * 100) / 25
      WHEN current_level_name = 'Profi' THEN ((user_transformations - 50) * 100) / 50
      WHEN current_level_name = 'Experte' THEN ((user_transformations - 100) * 100) / 100
      ELSE 100
    END::INTEGER,
    CASE 
      WHEN current_level_name = 'Anfänger' THEN 'Lernender'
      WHEN current_level_name = 'Lernender' THEN 'Fortgeschritten'
      WHEN current_level_name = 'Fortgeschritten' THEN 'Profi'
      WHEN current_level_name = 'Profi' THEN 'Experte'
      WHEN current_level_name = 'Experte' THEN 'GFK Meister'
      ELSE 'Maximales Level erreicht'
    END::TEXT,
    CASE 
      WHEN current_level_name = 'Anfänger' THEN 10 - user_transformations
      WHEN current_level_name = 'Lernender' THEN 25 - user_transformations
      WHEN current_level_name = 'Fortgeschritten' THEN 50 - user_transformations
      WHEN current_level_name = 'Profi' THEN 100 - user_transformations
      WHEN current_level_name = 'Experte' THEN 200 - user_transformations
      ELSE 0
    END::INTEGER;
END;
$$; 