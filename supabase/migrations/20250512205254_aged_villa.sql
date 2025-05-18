/*
  # Create feedback table for GFK responses

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `input_text` (text, the original user input)
      - `output_text` (jsonb, the GFK transformation)
      - `is_helpful` (boolean, user feedback)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `feedback` table
    - Add policy for inserting feedback
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text text NOT NULL,
  output_text jsonb NOT NULL,
  is_helpful boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
  ON feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (true);