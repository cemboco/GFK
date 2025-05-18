/*
  # Add IP address tracking for input limits

  1. New Tables
    - `ip_usage`
      - `ip` (text, primary key)
      - `usage_count` (integer)
      - `last_used` (timestamp with timezone)

  2. Security
    - Enable RLS on `ip_usage` table
    - Add policy for inserting and updating usage data
*/

CREATE TABLE IF NOT EXISTS ip_usage (
  ip text PRIMARY KEY,
  usage_count integer NOT NULL DEFAULT 0,
  last_used timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ip_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
  ON ip_usage
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON ip_usage
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable select for all users"
  ON ip_usage
  FOR SELECT
  TO public
  USING (true);