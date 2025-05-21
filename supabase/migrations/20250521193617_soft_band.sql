/*
  # Add insert policy for profiles table

  1. Changes
    - Add RLS policy to allow profile creation during signup
    
  2. Security
    - Only allows profile creation if the user ID matches the profile ID
    - Ensures users can only create their own profile
*/

CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);