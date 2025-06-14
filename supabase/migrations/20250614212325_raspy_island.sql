/*
  # Newsletter-Nachrichten Tabelle

  1. Neue Tabelle
    - `newsletter_messages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `message` (text)
      - `created_at` (timestamp)

  2. Sicherheit
    - Enable RLS on `newsletter_messages` table
    - Add policy for public insert access
    - Add policy for authenticated users to read
*/

CREATE TABLE IF NOT EXISTS public.newsletter_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.newsletter_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users"
  ON public.newsletter_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users only"
  ON public.newsletter_messages
  FOR SELECT
  TO authenticated
  USING (true);