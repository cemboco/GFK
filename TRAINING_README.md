# GFKCoach Model Training

## Übersicht
Dieses Verzeichnis enthält alle Dateien für das weitere Fine-Tuning des GFKCoach Models.

## Dateien
- `training_data.jsonl` - Trainingsdaten im JSON Lines Format
- `train_model.sh` - Script zum Starten des Trainings
- `TRAINING_README.md` - Diese Anleitung

## Voraussetzungen

### 1. OpenAI CLI installieren
```bash
pip install openai
```

### 2. API Key setzen
```bash
export OPENAI_API_KEY='dein-openai-api-key'
```

### 3. Aktuelles Model
Basis-Model: `ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m`

## Trainingsdaten erweitern

### Format
Jede Zeile in `training_data.jsonl` ist ein JSON-Objekt mit:
```json
{
  "messages": [
    {
      "role": "system",
      "content": "System-Prompt mit GFK-Anweisungen..."
    },
    {
      "role": "user", 
      "content": "Eingabe des Nutzers"
    },
    {
      "role": "assistant",
      "content": "Ideal GFK-Antwort"
    }
  ]
}
```

### Neue Trainingsdaten hinzufügen
1. Sammle Feedback von Beta-Testern
2. Identifiziere die besten Transformationen
3. Füge sie zu `training_data.jsonl` hinzu
4. Stelle sicher, dass das Format korrekt ist

### Qualitätskriterien für Trainingsdaten
- ✅ Natürliche, empathische Sprache
- ✅ Korrekte GFK-Struktur (Beobachtung, Gefühl, Bedürfnis, Bitte)
- ✅ Verschiedene Kontexte (Familie, Arbeit, Partnerschaft)
- ✅ Verschiedene Schwierigkeitsgrade
- ❌ Keine generischen oder unnatürlichen Antworten

## Training starten

### Automatisch
```bash
chmod +x train_model.sh
./train_model.sh
```

### Manuell
```bash
openai api fine_tunes.create \
  -t training_data.jsonl \
  -m ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m \
  --suffix "gfk3" \
  --n_epochs 3
```

## Training überwachen

### Status prüfen
```bash
openai api fine_tunes.get -i "ft-xxxxx"
```

### Logs anzeigen
```bash
openai api fine_tunes.follow -i "ft-xxxxx"
```

## Nach dem Training

### 1. Model-ID aktualisieren
In `supabase/functions/gfk-transform/index.ts`:
```typescript
model: "ft:gpt-3.5-turbo-0125:personal:gfk3:NeueID"
```

### 2. Funktion deployen
```bash
supabase functions deploy gfk-transform
```

### 3. Testen
- Teste verschiedene Eingaben
- Vergleiche mit dem alten Model
- Sammle Feedback von Nutzern

## Kosten
- Fine-Tuning: ~$0.008 pro 1K Tokens
- Training mit 100 Beispielen: ~$2-5
- Inferenz: ~$0.002 pro 1K Tokens

## Tipps

### Trainingsdaten optimieren
- Verwende reale Nutzer-Eingaben
- Achte auf Vielfalt in den Beispielen
- Teste die Antworten vor dem Training

### Parameter anpassen
- `n_epochs`: 2-4 (mehr = bessere Qualität, aber teurer)
- `learning_rate_multiplier`: 0.1-0.2
- `batch_size`: 1 (für kleine Datasets)

### Iteratives Training
1. Starte mit wenigen, hochwertigen Beispielen
2. Teste das Model
3. Sammle Feedback
4. Erweitere Trainingsdaten
5. Wiederhole

## Troubleshooting

### Training fehlgeschlagen
- Prüfe API Key und Credits
- Validiere JSON-Format
- Reduziere Anzahl der Epochs

### Schlechte Qualität
- Überprüfe Trainingsdaten
- Erhöhe Anzahl der Beispiele
- Verwende bessere System-Prompts

### Kosten zu hoch
- Reduziere Anzahl der Epochs
- Verwende weniger Trainingsdaten
- Optimiere Token-Verbrauch 