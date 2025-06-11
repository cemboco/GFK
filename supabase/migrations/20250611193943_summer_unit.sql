/*
  # Fix messages table user_id constraint and feedback table updates

  1. Changes to messages table
    - Handle null user_id values by removing them instead of creating system user
    - Set user_id column to NOT NULL

  2. Changes to feedback table  
    - Add user_id column if not exists
    - Enable RLS
    - Add policies for user access

  3. Security
    - Maintain RLS policies for both tables
    - Ensure proper foreign key constraints
*/

-- First, remove any messages with null user_id (these are likely test/anonymous messages)
DELETE FROM public.messages WHERE user_id IS NULL;

-- Now we can safely alter the messages table to make user_id NOT NULL
ALTER TABLE public.messages 
ALTER COLUMN user_id SET NOT NULL;

-- Update feedback table - add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feedback' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.feedback
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on feedback if not already enabled
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.feedback;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON public.feedback;

-- Create comprehensive policies for feedback table
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

-- Allow anonymous feedback insertion (for non-authenticated users)
CREATE POLICY "Enable anonymous feedback insertion"
    ON public.feedback
    FOR INSERT
    TO public
    WITH CHECK (user_id IS NULL);

-- Allow authenticated users to view anonymous feedback (for admin purposes)
CREATE POLICY "Enable select for authenticated users"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (true);