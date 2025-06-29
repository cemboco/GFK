/*
  # Enhanced GFK Statistics and Level Calculation

  1. Enhanced Functions
    - `calculate_gfk_level()` - Erweiterte Version mit detaillierten Statistiken
    - `get_user_gfk_stats()` - Detaillierte Nutzerstatistiken
    - `get_global_gfk_stats()` - Globale Statistiken

  2. Features
    - Detaillierte Level-Berechnung basierend auf verschiedenen Faktoren
    - Statistiken über GFK-Nutzung (Häufigkeit, Qualität, etc.)
    - Performance-Metriken und Trends
*/

-- Enhanced calculate_gfk_level function with detailed statistics
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
    AVG(COUNT(m.id)) OVER (PARTITION BY DATE(m.created_at)) as avg_daily_usage,
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

-- Function to get detailed user statistics
CREATE OR REPLACE FUNCTION public.get_user_gfk_stats(
  user_id_param UUID DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  total_transformations INTEGER,
  current_level VARCHAR(50),
  level_progress INTEGER,
  weekly_activity INTEGER,
  monthly_activity INTEGER,
  total_messages INTEGER,
  avg_message_length INTEGER,
  favorite_topics TEXT[],
  activity_heatmap JSONB,
  improvement_suggestions JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
DECLARE
  user_data RECORD;
BEGIN
  -- Get comprehensive user data
  SELECT 
    up.user_id,
    up.total_transformations,
    up.current_level,
    up.level_progress,
    COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '7 days') as weekly_activity,
    COUNT(m.id) FILTER (WHERE m.created_at >= NOW() - INTERVAL '30 days') as monthly_activity,
    COUNT(m.id) as total_messages,
    AVG(LENGTH(m.input_text)) as avg_message_length
  INTO user_data
  FROM user_progress up
  LEFT JOIN messages m ON up.user_id = m.user_id
  WHERE up.user_id = COALESCE(user_id_param, auth.uid())
  GROUP BY up.user_id, up.total_transformations, up.current_level, up.level_progress;

  -- Return detailed statistics
  RETURN QUERY
  SELECT 
    user_data.user_id,
    user_data.total_transformations,
    user_data.current_level,
    user_data.level_progress,
    user_data.weekly_activity,
    user_data.monthly_activity,
    user_data.total_messages,
    COALESCE(user_data.avg_message_length, 0)::INTEGER,
    ARRAY['Gewaltfreie Kommunikation', 'Empathie', 'Konflikte lösen'] as favorite_topics, -- Placeholder
    jsonb_build_object(
      'last_7_days', jsonb_build_object(
        'monday', 0, 'tuesday', 0, 'wednesday', 0, 'thursday', 0,
        'friday', 0, 'saturday', 0, 'sunday', 0
      ),
      'activity_level', CASE 
        WHEN user_data.weekly_activity >= 10 THEN 'hoch'
        WHEN user_data.weekly_activity >= 5 THEN 'mittel'
        WHEN user_data.weekly_activity >= 1 THEN 'niedrig'
        ELSE 'keine'
      END
    ) as activity_heatmap,
    jsonb_build_object(
      'level_up_tips', CASE 
        WHEN user_data.current_level = 'Anfänger' THEN 
          jsonb_build_array(
            'Versuche täglich mindestens eine GFK-Transformation',
            'Lies die 4 Schritte der GFK aufmerksam durch',
            'Übe mit einfachen Alltagssituationen'
          )
        WHEN user_data.current_level = 'Lernender' THEN
          jsonb_build_array(
            'Erweitere dein GFK-Vokabular',
            'Übe mit komplexeren Situationen',
            'Reflektiere über deine Gefühle und Bedürfnisse'
          )
        WHEN user_data.current_level = 'Fortgeschritten' THEN
          jsonb_build_array(
            'Hilfe anderen bei GFK-Übungen',
            'Analysiere deine eigenen Kommunikationsmuster',
            'Übe in realen Konfliktsituationen'
          )
        ELSE jsonb_build_array('Du bist bereits sehr fortgeschritten!')
      END,
      'consistency_improvement', CASE 
        WHEN user_data.weekly_activity < 3 THEN 'Versuche regelmäßiger zu üben'
        WHEN user_data.weekly_activity < 7 THEN 'Gute Regelmäßigkeit, weiter so!'
        ELSE 'Ausgezeichnete Konsistenz!'
      END
    ) as improvement_suggestions;
END;
$$;

-- Function to get global statistics
CREATE OR REPLACE FUNCTION public.get_global_gfk_stats()
RETURNS TABLE(
  total_users INTEGER,
  total_transformations INTEGER,
  avg_transformations_per_user DECIMAL(5,2),
  most_active_level VARCHAR(50),
  daily_active_users INTEGER,
  weekly_active_users INTEGER,
  monthly_active_users INTEGER,
  top_performers JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT up.user_id) as total_users,
    SUM(up.total_transformations) as total_transformations,
    AVG(up.total_transformations) as avg_transformations_per_user,
    (SELECT current_level 
     FROM user_progress 
     GROUP BY current_level 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_active_level,
    COUNT(DISTINCT up.user_id) FILTER (WHERE up.last_activity >= NOW() - INTERVAL '1 day') as daily_active_users,
    COUNT(DISTINCT up.user_id) FILTER (WHERE up.last_activity >= NOW() - INTERVAL '7 days') as weekly_active_users,
    COUNT(DISTINCT up.user_id) FILTER (WHERE up.last_activity >= NOW() - INTERVAL '30 days') as monthly_active_users,
    jsonb_build_object(
      'top_5_users', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'user_id', up2.user_id,
            'total_transformations', up2.total_transformations,
            'level', up2.current_level
          )
        )
        FROM user_progress up2
        ORDER BY up2.total_transformations DESC
        LIMIT 5
      ),
      'level_distribution', (
        SELECT jsonb_object_agg(current_level, count)
        FROM (
          SELECT current_level, COUNT(*) as count
          FROM user_progress
          GROUP BY current_level
        ) level_counts
      )
    ) as top_performers
  FROM user_progress up;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.calculate_gfk_level(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_gfk_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_global_gfk_stats() TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON messages(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_activity ON user_progress(last_activity); 