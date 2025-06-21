/*
  # Fix RLS Performance Issues

  Problem: auth.uid() is being re-evaluated for each row in RLS policies
  Solution: Use WHERE user_id = (SELECT auth.uid()) pattern for optimal performance

  Tables affected:
  - messages
  - feedback
  - profiles
  - chat_usage
  - anon_feedback
*/

-- Fix messages table RLS policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

CREATE POLICY "Users can view their own messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own messages"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix feedback table RLS policies
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;

CREATE POLICY "Users can view their own feedback"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own feedback"
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix profiles table RLS policies (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- Fix chat_usage table RLS policies (if they exist)
DROP POLICY IF EXISTS "Users can view own chat usage" ON public.chat_usage;
DROP POLICY IF EXISTS "Users can insert own chat usage" ON public.chat_usage;
DROP POLICY IF EXISTS "Users can update own chat usage" ON public.chat_usage;

CREATE POLICY "Users can view own chat usage"
    ON public.chat_usage
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own chat usage"
    ON public.chat_usage
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own chat usage"
    ON public.chat_usage
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid())); 