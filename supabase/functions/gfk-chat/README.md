# GFK Chat Edge Function

Diese Supabase Edge Function ermöglicht es angemeldeten Benutzern, Fragen zu ihren GFK-Formulierungen zu stellen.

## Funktionen

- **GFK-Coach**: KI-gestützte Beratung zu GFK-Formulierungen
- **Kontextbewusst**: Berücksichtigt die ursprüngliche Eingabe und GFK-Transformation
- **Konversationshistorie**: Behält den Kontext der vorherigen Nachrichten bei
- **Nutzungsbeschränkung**: 3 Nachrichten pro Monat für Beta-Nutzer

## API-Endpunkt

```
POST /functions/v1/gfk-chat
```

### Request Body

```json
{
  "originalInput": "Du machst nie deine Hausaufgaben!",
  "gfkOutput": {
    "observation": "Ich sehe, dass deine Hausaufgaben noch nicht gemacht sind.",
    "feeling": "Ich mache mir Sorgen um deine schulische Entwicklung.",
    "need": "Mir ist wichtig, dass du in der Schule gut vorankommst.",
    "request": "Können wir zusammen einen Plan machen, wann du deine Hausaufgaben machst?"
  },
  "userQuestion": "Warum wurde diese Formulierung gewählt?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hallo"
    },
    {
      "role": "assistant", 
      "content": "Hallo! Wie kann ich dir helfen?"
    }
  ]
}
```

### Response

```json
{
  "response": "Die Formulierung wurde gewählt, weil sie die vier GFK-Schritte befolgt..."
}
```

## Sicherheit

- Nur für angemeldete Benutzer verfügbar
- Nutzungsbeschränkung über `chat_usage` Tabelle
- Row Level Security (RLS) aktiviert

## Zukunft

- Premium-Pläne mit mehr Nachrichten
- Erweiterte Coaching-Funktionen
- Persönliche GFK-Profile 