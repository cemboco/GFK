/*
  # Add User Credit and Payment Tables

  1. New Tables
    - `user_credit_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (integer)
      - `type` (text: 'purchase', 'usage', 'bonus')
      - `description` (text)
      - `created_at` (timestamp)
    
    - `user_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `credits` (integer)
      - `status` (text: 'pending', 'completed', 'failed')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
    - Add policies for authenticated users to insert their own data
*/

-- Create user_credit_history table
CREATE TABLE public.user_credit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.user_credit_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_credit_history
CREATE POLICY "Users can view their own credit history"
    ON public.user_credit_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit history"
    ON public.user_credit_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create user_payments table
CREATE TABLE public.user_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    credits INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- Policies for user_payments
CREATE POLICY "Users can view their own payments"
    ON public.user_payments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
    ON public.user_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);