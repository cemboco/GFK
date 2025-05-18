/*
  # Add credit feedback table

  1. New Tables
    - `credit_feedback`
      - `id` (uuid, primary key)
      - `amount` (decimal, the suggested monthly amount)
      - `message` (text, user's feedback message)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `credit_feedback` table
    - Add policy for inserting feedback
    - Add policy for authenticated users to view feedback
*/

CREATE TABLE IF NOT EXISTS credit_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE credit_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
  ON credit_feedback
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only"
  ON credit_feedback
  FOR SELECT
  TO authenticated
  USING (true);