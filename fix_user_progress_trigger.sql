-- Fix user progress trigger to handle null user_id properly
-- Run this in Supabase SQL Editor

-- Drop existing trigger
DROP TRIGGER IF EXISTS update_user_progress_trigger ON messages;

-- Create function to update user progress
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
DECLARE
  level_info RECORD;
BEGIN
  -- Only update progress if user_id is not null
  IF NEW.user_id IS NOT NULL THEN
    -- Get or create user progress record
    INSERT INTO user_progress (user_id, total_transformations, current_level, level_progress, last_activity)
    VALUES (
      NEW.user_id,
      1,
      'Anfänger',
      5,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_transformations = user_progress.total_transformations + 1,
      last_activity = NOW();

    -- Calculate new level and progress
    SELECT * INTO level_info FROM calculate_gfk_level(
      (SELECT total_transformations FROM user_progress WHERE user_id = NEW.user_id)
    );

    -- Update level and progress
    UPDATE user_progress 
    SET 
      current_level = level_info.level_name,
      level_progress = level_info.progress,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update progress when new message is inserted
CREATE TRIGGER update_user_progress_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress();

-- Test the trigger by checking if it exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_user_progress_trigger'; 