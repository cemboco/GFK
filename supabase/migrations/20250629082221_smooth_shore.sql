/*
  # User Progress System for GFK Level Tracking

  1. New Tables
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_transformations` (integer, default 0)
      - `current_level` (varchar, default 'Anfänger')
      - `level_progress` (integer, default 0)
      - `last_activity` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `calculate_gfk_level()` - Calculates level based on transformations
    - `update_user_progress()` - Trigger function to update progress

  3. Security
    - Enable RLS on `user_progress` table
    - Add policies for users to view and update their own progress
    - Add trigger to automatically update progress when messages are inserted
*/

-- Create user_progress table for GFK level tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_transformations INTEGER DEFAULT 0,
  current_level VARCHAR(50) DEFAULT 'Anfänger',
  level_progress INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create function to calculate GFK level
CREATE OR REPLACE FUNCTION calculate_gfk_level(transformations INTEGER)
RETURNS TABLE(level_name VARCHAR(50), progress INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN transformations < 20 THEN 'Anfänger'
      WHEN transformations < 50 THEN 'Fortgeschritten'
      WHEN transformations < 100 THEN 'Profi'
      WHEN transformations < 200 THEN 'Experte'
      ELSE 'GFK Meister'
    END as level_name,
    CASE 
      WHEN transformations < 20 THEN (transformations * 100) / 20
      WHEN transformations < 50 THEN ((transformations - 20) * 100) / 30
      WHEN transformations < 100 THEN ((transformations - 50) * 100) / 50
      WHEN transformations < 200 THEN ((transformations - 100) * 100) / 100
      ELSE 100
    END as progress;
END;
$$ LANGUAGE plpgsql;

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

-- Drop existing trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_user_progress_trigger ON messages;

CREATE TRIGGER update_user_progress_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_progress();

-- Add RLS policies with proper checks
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create them
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
  DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
  
  -- Create new policies
  CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);
END $$;