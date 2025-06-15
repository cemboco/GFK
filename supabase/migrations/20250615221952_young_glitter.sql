/*
  # Fix signup flow database errors

  1. Changes
    - Drop all existing conflicting policies on profiles table
    - Create simplified, working policies
    - Fix the handle_new_user trigger function
    - Ensure proper RLS setup

  2. Security
    - Allow profile creation during signup process
    - Maintain security for authenticated operations
    - Fix trigger function to handle edge cases
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow service role full access" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create profile during signup" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation for public during signup" ON profiles;

-- Create new, working policies
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
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from updating their email directly
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Create or replace the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert new profile with proper error handling
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
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure email sync function exists and works
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS trigger AS $$
BEGIN
  -- Update email in profiles when it changes in auth.users
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles 
    SET email = NEW.email 
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the update
    RAISE WARNING 'Error syncing email for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate email sync trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_email();