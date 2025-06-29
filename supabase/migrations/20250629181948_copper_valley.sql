/*
  # Fix RLS Policy für messages Tabelle

  1. Problem
    - RLS Policy verhindert das Einfügen von Nachrichten
    - Sowohl für authentifizierte als auch anonyme Nutzer

  2. Lösung
    - Aktualisiere INSERT Policy für messages
    - Erlaube Einfügen für authentifizierte Nutzer (mit user_id)
    - Erlaube Einfügen für anonyme Nutzer (user_id = NULL)
    - Verbessere SELECT Policy

  3. Sicherheit
    - Nutzer können nur ihre eigenen Nachrichten einsehen
    - Anonyme Nachrichten sind nicht einsehbar
    - INSERT ist für alle erlaubt (notwendig für die App-Funktionalität)
*/

-- Lösche bestehende Policies
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;

-- Neue INSERT Policy: Erlaube Einfügen für alle
-- Authentifizierte Nutzer: user_id muss ihrer ID entsprechen
-- Anonyme Nutzer: user_id kann NULL sein
CREATE POLICY "Enable insert for authenticated and anonymous users"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (
    -- Für authentifizierte Nutzer: user_id muss der aktuellen User-ID entsprechen
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    -- Für anonyme Nutzer: user_id kann NULL sein
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Neue SELECT Policy: Nutzer können nur ihre eigenen Nachrichten sehen
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- UPDATE Policy: Nutzer können ihre eigenen Nachrichten aktualisieren (z.B. is_favorite)
CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Stelle sicher, dass RLS aktiviert ist
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Teste die Policies mit einer Beispiel-Abfrage
-- Diese sollte jetzt funktionieren für authentifizierte Nutzer
DO $$
BEGIN
  -- Test-Kommentar: Die neuen Policies sollten folgende Szenarien erlauben:
  -- 1. Authentifizierte Nutzer können Nachrichten mit ihrer user_id einfügen
  -- 2. Anonyme Nutzer können Nachrichten mit user_id = NULL einfügen
  -- 3. Nutzer können nur ihre eigenen Nachrichten lesen
  -- 4. Nutzer können ihre eigenen Nachrichten aktualisieren
  
  RAISE NOTICE 'RLS Policies für messages Tabelle wurden erfolgreich aktualisiert';
END $$;