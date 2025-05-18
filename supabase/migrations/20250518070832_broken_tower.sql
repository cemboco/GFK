/*
  # Create subscribers table

  1. New Tables
    - `subscribers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, unique, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `subscribers` table
    - Add policy for inserting new subscribers
*/

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
  ON subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only"
  ON subscribers
  FOR SELECT
  TO authenticated
  USING (true);