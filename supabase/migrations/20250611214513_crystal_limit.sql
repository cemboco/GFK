/*
  # E-Mail zur Profiles Tabelle hinzufügen

  1. Änderungen
    - Fügt `email` Spalte zur `profiles` Tabelle hinzu
    - Befüllt automatisch alle existierenden Profile mit E-Mail-Adressen aus auth.users
    - Erstellt Trigger für automatische E-Mail-Synchronisation bei neuen Benutzern
    - Aktualisiert RLS-Policies entsprechend

  2. Sicherheit
    - E-Mail-Spalte ist nur lesbar, nicht bearbeitbar
    - Automatische Synchronisation mit auth.users Tabelle
    - Bestehende RLS-Policies bleiben erhalten
*/

-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with email addresses from auth.users
UPDATE public.profiles 
SET email = auth.users.email
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- Create or replace function to handle new user profile creation with email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to sync email changes from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email in profiles when it changes in auth.users
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles 
    SET email = NEW.email 
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email synchronization
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_email();

-- Update RLS policies to include email access
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    -- Prevent users from updating their email directly
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );