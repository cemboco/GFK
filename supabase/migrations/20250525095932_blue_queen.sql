/*
  # Update messages and feedback tables

  1. Changes
    - Set default user_id for existing messages
    - Make user_id NOT NULL in messages table
    - Add user_id column to feedback table
    - Enable RLS on feedback table
    - Add RLS policies for feedback table

  2. Security
    - Enable RLS on feedback table
    - Add policies for authenticated users to view and insert their own feedback
*/

-- First, update existing null user_id values in messages
UPDATE public.messages
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Now we can safely alter the messages table
ALTER TABLE public.messages 
ALTER COLUMN user_id SET NOT NULL;

-- Update feedback table
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on feedback if not already enabled
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;

-- Create new policies
CREATE POLICY "Users can view their own feedback"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);