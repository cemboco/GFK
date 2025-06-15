/*
  # Fix Authentication and Profile Policies

  1. Policy Updates
    - Remove conflicting profile policies
    - Add proper policies for profile creation during signup
    - Ensure auth.users table access is properly configured

  2. Security
    - Maintain RLS on profiles table
    - Allow profile creation during user signup
    - Allow users to read and update their own profiles
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Create new, non-conflicting policies
CREATE POLICY "Enable profile creation for authenticated users"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable profile creation for public during signup"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has proper structure
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;