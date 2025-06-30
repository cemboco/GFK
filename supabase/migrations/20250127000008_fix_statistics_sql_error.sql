/*
  # Fix SQL Error in calculate_gfk_level Function

  Problem: "column "m.created_at" must appear in the GROUP BY clause or be used in an aggregate function"
  Solution: Remove the problematic window function and use a simpler approach for avg_daily_usage
*/

-- Fix the calculate_gfk_level function
CREATE OR REPLACE FUNCTION public.calculate_gfk_level(
  user_id_param UUID DEFAULT NULL,
  include_stats BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  level_name VARCHAR(50),
  progress INTEGER,
  total_transformations INTEGER,
  weekly_activity INTEGER,
  monthly_activity INTEGER,
  avg_daily_usage DECIMAL(5,2),
  consistency_score INTEGER,
  quality_score INTEGER,
  last_activity TIMESTAMPTZ,
  days_since_last_activity INTEGER,
  level_details JSONB
) 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  user_stats RECORD;
  level_info RECORD;
  activity_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    up.total_transformations,
    up.current_level,
    up.last_activity,
    COUNT(m.id) as total_messages,
    COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '7 days') as weekly_messages,
    COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '30 days') as monthly_messages,
    CASE 
      WHEN COUNT(m.id) > 0 THEN 
        ROUND(COUNT(m.id)::DECIMAL / GREATEST(DATE_PART('day', NOW() - MIN(m.created_at)), 1), 2)
      ELSE 0 
    END as avg_daily_usage,
    CASE 
      WHEN COUNT(m.id) > 0 THEN 
        (COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '7 days') * 100) / 
        GREATEST(COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '14 days'), 1)
      ELSE 0 
    END as consistency_score
  INTO user_stats
  FROM user_progress up
  LEFT JOIN messages m ON up.user_id = m.user_id
  WHERE up.user_id = COALESCE(user_id_param, auth.uid())
  GROUP BY up.total_transformations, up.current_level, up.last_activity;

  -- Calculate quality score based on message complexity and frequency
  SELECT 
    CASE 
      WHEN user_stats.total_transformations < 10 THEN 30
      WHEN user_stats.total_transformations < 25 THEN 50
      WHEN user_stats.total_transformations < 50 THEN 70
      WHEN user_stats.total_transformations < 100 THEN 85
      ELSE 95
    END as quality_score
  INTO level_info;

  -- Calculate enhanced level and progress
  SELECT 
    CASE 
      WHEN user_stats.total_transformations < 10 THEN 'Anfänger'
      WHEN user_stats.total_transformations < 25 THEN 'Lernender'
      WHEN user_stats.total_transformations < 50 THEN 'Fortgeschritten'
      WHEN user_stats.total_transformations < 100 THEN 'Profi'
      WHEN user_stats.total_transformations < 200 THEN 'Experte'
      ELSE 'GFK Meister'
    END as level_name,
    CASE 
      WHEN user_stats.total_transformations < 10 THEN (user_stats.total_transformations * 100) / 10
      WHEN user_stats.total_transformations < 25 THEN ((user_stats.total_transformations - 10) * 100) / 15
      WHEN user_stats.total_transformations < 50 THEN ((user_stats.total_transformations - 25) * 100) / 25
      WHEN user_stats.total_transformations < 100 THEN ((user_stats.total_transformations - 50) * 100) / 50
      WHEN user_stats.total_transformations < 200 THEN ((user_stats.total_transformations - 100) * 100) / 100
      ELSE 100
    END as progress
  INTO level_info;

  -- Return comprehensive statistics
  RETURN QUERY
  SELECT 
    level_info.level_name,
    level_info.progress,
    COALESCE(user_stats.total_transformations, 0),
    COALESCE(user_stats.weekly_messages, 0),
    COALESCE(user_stats.monthly_messages, 0),
    COALESCE(user_stats.avg_daily_usage, 0),
    COALESCE(user_stats.consistency_score, 0),
    level_info.quality_score,
    user_stats.last_activity,
    EXTRACT(DAY FROM NOW() - user_stats.last_activity)::INTEGER,
    CASE WHEN include_stats THEN
      jsonb_build_object(
        'level_requirements', jsonb_build_object(
          'next_level', CASE 
            WHEN level_info.level_name = 'Anfänger' THEN 'Lernender (10 Transformationen)'
            WHEN level_info.level_name = 'Lernender' THEN 'Fortgeschritten (25 Transformationen)'
            WHEN level_info.level_name = 'Fortgeschritten' THEN 'Profi (50 Transformationen)'
            WHEN level_info.level_name = 'Profi' THEN 'Experte (100 Transformationen)'
            WHEN level_info.level_name = 'Experte' THEN 'GFK Meister (200 Transformationen)'
            ELSE 'Maximales Level erreicht'
          END,
          'remaining_transformations', CASE 
            WHEN level_info.level_name = 'Anfänger' THEN 10 - user_stats.total_transformations
            WHEN level_info.level_name = 'Lernender' THEN 25 - user_stats.total_transformations
            WHEN level_info.level_name = 'Fortgeschritten' THEN 50 - user_stats.total_transformations
            WHEN level_info.level_name = 'Profi' THEN 100 - user_stats.total_transformations
            WHEN level_info.level_name = 'Experte' THEN 200 - user_stats.total_transformations
            ELSE 0
          END
        ),
        'activity_metrics', jsonb_build_object(
          'daily_avg', COALESCE(user_stats.avg_daily_usage, 0),
          'weekly_trend', CASE 
            WHEN user_stats.weekly_messages > user_stats.monthly_messages / 4 THEN 'steigend'
            WHEN user_stats.weekly_messages < user_stats.monthly_messages / 4 THEN 'fallend'
            ELSE 'stabil'
          END,
          'consistency', CASE 
            WHEN user_stats.consistency_score >= 80 THEN 'sehr gut'
            WHEN user_stats.consistency_score >= 60 THEN 'gut'
            WHEN user_stats.consistency_score >= 40 THEN 'moderat'
            ELSE 'verbesserungswürdig'
          END
        ),
        'achievements', jsonb_build_object(
          'first_transformation', user_stats.total_transformations >= 1,
          'regular_user', user_stats.total_transformations >= 10,
          'power_user', user_stats.total_transformations >= 50,
          'gfk_expert', user_stats.total_transformations >= 100,
          'consistency_master', user_stats.consistency_score >= 80
        )
      )
    ELSE NULL END as level_details;
END;
$$; 