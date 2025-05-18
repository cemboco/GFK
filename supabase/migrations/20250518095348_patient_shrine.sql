/*
  # Update subscribers table schema

  1. New Tables (if not exists)
    - `subscribers`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, unique, required)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `subscribers` table
    - Add policies for public insert and authenticated select
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscribers' 
    AND policyname = 'Enable insert for all users'
  ) THEN
    CREATE POLICY "Enable insert for all users"
      ON subscribers
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscribers' 
    AND policyname = 'Enable select for authenticated users only'
  ) THEN
    CREATE POLICY "Enable select for authenticated users only"
      ON subscribers
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;