/*
  # Fix User Progress RLS Policies

  1. Security Updates
    - Drop existing problematic policies on user_progress table
    - Create proper RLS policies for authenticated users to manage their own progress
    - Ensure users can INSERT, SELECT, and UPDATE their own progress records

  2. Changes
    - Enable proper INSERT policy for authenticated users
    - Fix SELECT policy to use correct auth function
    - Fix UPDATE policy to use correct auth function
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;

-- Create proper RLS policies for user_progress table
CREATE POLICY "Enable insert for authenticated users"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for authenticated users"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled on the table
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;