/*
  # Add messages table with user association

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `input_text` (text)
      - `output_text` (jsonb)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on messages table
    - Add policies for authenticated users to:
      - View their own messages
      - Insert their own messages
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_text TEXT NOT NULL,
    output_text JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add user_id column and foreign key constraint
ALTER TABLE public.messages 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can view their own messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);