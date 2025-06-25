-- Debug Queries für GFK-Fortschritt
-- Führen Sie diese Abfragen in der Supabase SQL Editor aus

-- 1. Überprüfen Sie, ob die user_progress Tabelle existiert
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- 2. Überprüfen Sie alle user_progress Einträge
SELECT 
  user_id,
  total_transformations,
  current_level,
  level_progress,
  last_activity,
  created_at,
  updated_at
FROM user_progress
ORDER BY created_at DESC;

-- 3. Überprüfen Sie die messages Tabelle für einen spezifischen User
-- Ersetzen Sie 'USER_ID_HIER_EINFÜGEN' mit der tatsächlichen User-ID
SELECT 
  id,
  user_id,
  input_text,
  created_at
FROM messages 
WHERE user_id = 'USER_ID_HIER_EINFÜGEN'
ORDER BY created_at DESC;

-- 4. Überprüfen Sie, ob der Trigger existiert
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_user_progress_trigger';

-- 5. Testen Sie die calculate_gfk_level Funktion
SELECT * FROM calculate_gfk_level(5);
SELECT * FROM calculate_gfk_level(25);
SELECT * FROM calculate_gfk_level(75);

-- 6. Überprüfen Sie die RLS-Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_progress';

-- 7. Erstellen Sie einen Test-User-Progress (ersetzen Sie USER_ID)
-- INSERT INTO user_progress (user_id, total_transformations, current_level, level_progress, last_activity)
-- VALUES ('USER_ID_HIER_EINFÜGEN', 5, 'Anfänger', 25, NOW())
-- ON CONFLICT (user_id) DO UPDATE SET
--   total_transformations = EXCLUDED.total_transformations,
--   current_level = EXCLUDED.current_level,
--   level_progress = EXCLUDED.level_progress,
--   last_activity = EXCLUDED.last_activity;

-- 8. Überprüfen Sie die Anzahl der Nachrichten pro User
SELECT 
  user_id,
  COUNT(*) as message_count
FROM messages 
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY message_count DESC; 