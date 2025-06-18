/*
  # Update messages and feedback tables for user tracking

  1. Changes
    - Add default system user for orphaned messages
    - Make messages.user_id NOT NULL with proper handling
    - Add user_id to feedback table
    - Set up RLS policies for feedback

  2. Security
    - Enable RLS on feedback table
    - Add policies for user-specific access
*/

-- Create a function to get or create system user
CREATE OR REPLACE FUNCTION get_or_create_system_user()
RETURNS uuid AS $$
DECLARE
    system_user_id uuid;
BEGIN
    -- Try to get existing system user
    SELECT id INTO system_user_id
    FROM auth.users
    WHERE email = 'system@gfkcoach.com'
    LIMIT 1;
    
    -- Create system user if it doesn't exist
    IF system_user_id IS NULL THEN
        INSERT INTO auth.users (
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        )
        VALUES (
            'system@gfkcoach.com',
            crypt('system-password-never-used', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"System User"}',
            false,
            'authenticated'
        )
        RETURNING id INTO system_user_id;
    END IF;
    
    RETURN system_user_id;
END;
$$ LANGUAGE plpgsql;

-- Update messages with null user_id to use system user
DO $$
DECLARE
    system_user uuid;
BEGIN
    system_user := get_or_create_system_user();
    
    UPDATE public.messages
    SET user_id = system_user
    WHERE user_id IS NULL;
END $$;

-- Now we can safely alter the messages table
ALTER TABLE public.messages 
ALTER COLUMN user_id SET NOT NULL;

-- Update feedback table
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on feedback if not already enabled
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedback;

-- Create new policies
CREATE POLICY "Users can view their own feedback"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Clean up
DROP FUNCTION IF EXISTS get_or_create_system_user();