/*
  # Create messages table for storing input and output

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `input_text` (text)
      - `output_text` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policy for public insert access
    - Add policy for authenticated select access
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text text NOT NULL,
  output_text jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);