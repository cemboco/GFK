/*
  # Add messages table for GFK history

  1. New Tables
    - `messages` table to store GFK transformations
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `input_text` (text)
      - `output_text` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on messages table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    output_text JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

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