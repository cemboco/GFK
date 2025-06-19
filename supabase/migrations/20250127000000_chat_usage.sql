/*
  # Create chat_usage table for tracking user chat messages

  1. New Tables
    - `chat_usage` table to track chat message limits
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `message_count` (integer, current message count)
      - `max_messages` (integer, maximum allowed messages)
      - `reset_date` (timestamp, when to reset the counter)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on chat_usage table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS public.chat_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_count INTEGER DEFAULT 0,
    max_messages INTEGER DEFAULT 3,
    reset_date TIMESTAMPTZ DEFAULT (now() + interval '1 month'),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_id ON public.chat_usage(user_id);

ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;

-- Policies for chat_usage
CREATE POLICY "Users can view their own chat usage"
    ON public.chat_usage
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat usage"
    ON public.chat_usage
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat usage"
    ON public.chat_usage
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_chat_usage_updated_at 
    BEFORE UPDATE ON public.chat_usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 