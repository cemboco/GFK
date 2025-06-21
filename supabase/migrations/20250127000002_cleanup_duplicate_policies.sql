/*
  # Cleanup Duplicate RLS Policies

  Problem: Multiple permissive policies for the same role and action
  Solution: Remove redundant policies and keep only the most specific ones

  Tables affected:
  - feedback
  - messages  
  - profiles
*/

-- Cleanup feedback table policies
DROP POLICY IF EXISTS "Enable anonymous feedback insertion" ON public.feedback;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.feedback;

-- Keep only the specific user-based policies
-- "Users can view their own feedback" - for SELECT
-- "Users can insert their own feedback" - for INSERT

-- Cleanup messages table policies  
DROP POLICY IF EXISTS "Enable insert for all users" ON public.messages;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON public.messages;

-- Keep only the specific user-based policies
-- "Users can view their own messages" - for SELECT
-- "Users can insert their own messages" - for INSERT

-- Cleanup profiles table policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Keep only the specific user-based policies
-- "Users can view own profile" - for SELECT (authenticated users only)
-- "Users can update own profile" - for UPDATE
-- "Users can create their own profile" - for INSERT
-- "Users can create profile during signup" - for INSERT (anon users)

-- Verify the remaining policies are optimal
-- Each table should have only one policy per action per role 