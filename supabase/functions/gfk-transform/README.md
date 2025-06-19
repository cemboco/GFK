# GFK Transform Edge Function

Diese Supabase Edge Function transformiert Eingabetexte in Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg.

## Funktionen

- **Vier GFK-Komponenten**: Beobachtung, Gefühl, Bedürfnis, Bitte
- **Zwei vollständige Formulierungen**: Direkte und einfühlsame Varianten
- **Kontext-spezifische Anpassungen**: Verschiedene Stile für unterschiedliche Situationen
- **Kontext-Beispiele**: Vordefinierte Beispiele für bessere Ergebnisse

## Kontext-Unterstützung

Die Funktion unterstützt verschiedene Kontexte:

### 1. Kind/Jugendliche (`child`)
- **Stil**: Sanft, einfühlsam, geduldig und erklärend
- **Beispiele**: Kommunikation mit Kindern über Hausaufgaben, Aufmerksamkeit, Ordnung

### 2. Geschäftsgespräch (`business`)
- **Stil**: Professionell, respektvoll, klar und strukturiert
- **Beispiele**: Verantwortlichkeiten, Vorschläge, Problemlösung

### 3. Partner/In (`partner`)
- **Stil**: Warm, intim, verletzlich und ehrlich
- **Beispiele**: Aufmerksamkeit, Unterstützung, Respekt

### 4. Kollegen (`colleague`)
- **Stil**: Kooperativ, teamorientiert, konstruktiv und lösungsorientiert
- **Beispiele**: Aufgabenverteilung, Verantwortlichkeiten, Teamarbeit

### 5. Allgemein (`general`)
- **Stil**: Ausgewogen, empathisch
- **Beispiele**: Standard-GFK-Formulierungen

## API-Verwendung

### Request
```json
{
  "input": "Du kommst immer zu spät!",
  "context": {
    "userLevel": "beginner",
    "preferredStyle": "professional",
    "includeExamples": true,
    "focusOn": "clarity",
    "relationship": "business",
    "situation": "general",
    "contextExamples": "Optionale zusätzliche Beispiele"
  }
}
```

### Response
```json
{
  "observation": "<span class='text-blue-600'>Unser Meeting heute begann um 14:15 Uhr, 15 Minuten nach der vereinbarten Zeit</span>",
  "feeling": "<span class='text-green-600'>Ich bin enttäuscht</span>",
  "need": "<span class='text-orange-600'>weil ich Verlässlichkeit in Absprachen brauche</span>",
  "request": "<span class='text-purple-600'>Könntest du mir künftig eine Nachricht senden, wenn du mehr als 5 Minuten Verspätung hast?</span>",
  "variant1": "<span class='text-pink-600'>Unser Meeting heute begann um 14:15 Uhr, 15 Minuten nach der vereinbarten Zeit. Das enttäuscht mich, weil ich Verlässlichkeit in Absprachen brauche. Könntest du mir künftig eine Nachricht senden, wenn du mehr als 5 Minuten Verspätung hast?</span>",
  "variant2": "<span class='text-teal-600'>Ich habe bemerkt, dass unser Meeting heute 15 Minuten später begann als geplant. Das macht mich traurig, weil mir Verlässlichkeit in unseren Absprachen wichtig ist. Würdest du mir bitte Bescheid geben, wenn du dich verspätest?</span>"
}
```

## Kontext-Beispiele

Die Funktion verwendet vordefinierte Beispiele für jeden Kontext:

### Kind/Jugendliche
- "Du machst nie deine Hausaufgaben!"
- "Du hörst nie zu!"
- "Du bist so unordentlich!"

### Geschäftsgespräch
- "Das ist nicht mein Problem!"
- "Das können wir nicht machen!"
- "Das ist nicht meine Schuld!"

### Partner/In
- "Du hörst mir nie zu!"
- "Du bist nie da für mich!"
- "Du bist so egoistisch!"

### Kollegen
- "Das ist nicht mein Job!"
- "Das ist nicht mein Problem!"
- "Das ist nicht meine Schuld!"

## Deployment

```bash
# Funktion deployen
supabase functions deploy gfk-transform

# Oder mit npx
npx supabase functions deploy gfk-transform
```

## Umgebungsvariablen

Stelle sicher, dass folgende Umgebungsvariablen gesetzt sind:

- `OPENAI_API_KEY`: Dein OpenAI API-Schlüssel
- `SUPABASE_URL`: Deine Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY`: Dein Supabase Service Role Key

## Qualitätskontrolle

Die Funktion enthält mehrere Validierungsmechanismen:

- **Pflichtfelder**: Alle 6 Felder müssen vorhanden sein
- **Anti-Halluzination**: Prüfung auf doppelte Wörter, unvollständige Sätze
- **Grammatik-Checks**: Erkennung von Füllwörtern und Grammatikfehlern
- **Automatische Wiederholung**: Bei Validierungsfehlern wird die Transformation bis zu 2x wiederholt 