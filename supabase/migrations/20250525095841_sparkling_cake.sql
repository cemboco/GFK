/*
  # Update messages and feedback tables

  1. Changes
    - Add NOT NULL constraint to user_id in messages table
    - Add user_id column to feedback table
    - Update RLS policies

  2. Security
    - Enable RLS on feedback table
    - Add policies for authenticated users
*/

-- Update messages table
ALTER TABLE public.messages 
ALTER COLUMN user_id SET NOT NULL;

-- Update feedback table
ALTER TABLE public.feedback
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Update feedback policies
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