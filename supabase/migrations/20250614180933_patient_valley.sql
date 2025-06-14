/*
  # User Tracking System

  1. New Tables
    - `anonymous_usage` - Tracks usage for anonymous users via localStorage/fingerprint
    - Updates to existing `ip_usage` table for fallback tracking

  2. Security
    - Enable RLS on new tables
    - Add policies for anonymous access

  3. Features
    - Support for multiple tracking methods
    - Fallback system for maximum coverage
    - Privacy-friendly approach
*/

-- Create anonymous_usage table for localStorage/fingerprint tracking
CREATE TABLE IF NOT EXISTS public.anonymous_usage (
  identifier TEXT PRIMARY KEY,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  last_used TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.anonymous_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous_usage
CREATE POLICY "Enable insert for all users"
  ON public.anonymous_usage
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for all users"
  ON public.anonymous_usage
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable update for all users"
  ON public.anonymous_usage
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_anonymous_usage_last_used 
  ON public.anonymous_usage(last_used);

-- Update ip_usage table structure if needed
DO $$
BEGIN
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ip_usage' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.ip_usage ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- Add index for ip_usage performance
CREATE INDEX IF NOT EXISTS idx_ip_usage_last_used 
  ON public.ip_usage(last_used);

-- Create function to clean up old anonymous usage records (optional)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_usage()
RETURNS void AS $$
BEGIN
  -- Delete records older than 30 days
  DELETE FROM public.anonymous_usage 
  WHERE last_used < NOW() - INTERVAL '30 days';
  
  DELETE FROM public.ip_usage 
  WHERE last_used < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;