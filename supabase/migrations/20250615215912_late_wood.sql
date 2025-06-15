/*
  # Fix authentication signup error

  1. Problem
    - Supabase signup failing with "Database error loading user after sign-up"
    - This typically occurs due to overly restrictive RLS policies on profiles table
    - The service_role needs to be able to create and read profiles during signup

  2. Solution
    - Update RLS policies on profiles table to allow service_role operations
    - Ensure proper policies for user profile creation during signup process
    - Add policy to allow service_role to perform necessary operations

  3. Changes
    - Drop existing restrictive policies that might block service operations
    - Add new policies that properly handle both user and service_role access
    - Ensure signup process can complete successfully
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Enable profile creation for public during signup" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies that allow proper signup flow
CREATE POLICY "Allow service role full access" ON profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can create profile during signup" ON profiles
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has proper structure for signup
DO $$
BEGIN
  -- Make sure email column exists and is properly configured
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Create or replace the trigger function for handling new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();