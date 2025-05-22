/*
  # Fix profiles table RLS policies

  1. Security Changes
    - Add RLS policy to allow profile creation during signup
    - Policy allows inserting profile data when the user ID matches the authenticated user's ID
*/

CREATE POLICY "Users can create their own profile during signup"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);