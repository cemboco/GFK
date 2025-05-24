/*
  # User Profile and Payment Tables

  1. New Tables
    - `user_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `credits` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      
    - `user_credit_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (integer)
      - `type` (text) - 'purchase', 'usage', 'bonus'
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- User Payments Table
CREATE TABLE IF NOT EXISTS user_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  credits integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed'))
);

ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON user_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON user_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User Credit History Table
CREATE TABLE IF NOT EXISTS user_credit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_type CHECK (type IN ('purchase', 'usage', 'bonus'))
);

ALTER TABLE user_credit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit history"
  ON user_credit_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert credit history"
  ON user_credit_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credit_history_user_id ON user_credit_history(user_id);