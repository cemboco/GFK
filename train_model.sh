#!/bin/bash

# GFKCoach Model Training Script
# Dieses Script startet das weitere Fine-Tuning des bestehenden Models

echo "🚀 Starte GFKCoach Model Training..."

# Prüfe ob OpenAI CLI installiert ist
if ! command -v openai &> /dev/null; then
    echo "❌ OpenAI CLI ist nicht installiert. Bitte installiere es zuerst:"
    echo "pip install openai"
    exit 1
fi

# Prüfe ob API Key gesetzt ist
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY ist nicht gesetzt. Bitte setze deinen API Key:"
    echo "export OPENAI_API_KEY='dein-api-key'"
    exit 1
fi

# Prüfe ob Trainingsdaten existieren
if [ ! -f "training_data.jsonl" ]; then
    echo "❌ training_data.jsonl nicht gefunden. Bitte erstelle die Trainingsdaten zuerst."
    exit 1
fi

echo "✅ Trainingsdaten gefunden: training_data.jsonl"

# Starte das Fine-Tuning
echo "🔄 Starte Fine-Tuning mit bestehendem Model..."
echo "Basis-Model: ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m"

# Erstelle das Fine-Tuning
FINE_TUNE_ID=$(openai api fine_tunes.create \
  -t training_data.jsonl \
  -m ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m \
  --suffix "gfk3" \
  --n_epochs 3 \
  --batch_size 1 \
  --learning_rate_multiplier 0.1 \
  --prompt_loss_weight 0.1 \
  --compute_classification_metrics false \
  --classification_n_classes 0 \
  --classification_positive_class "" \
  --classification_betas "" \
  --validation_file "" \
  --check_if_files_exist true \
  --quiet false | grep "ft-" | head -1)

if [ -z "$FINE_TUNE_ID" ]; then
    echo "❌ Fehler beim Erstellen des Fine-Tunings"
    exit 1
fi

echo "✅ Fine-Tuning gestartet mit ID: $FINE_TUNE_ID"
echo "📊 Überwache den Fortschritt..."

# Überwache den Fortschritt
while true; do
    STATUS=$(openai api fine_tunes.get -i "$FINE_TUNE_ID" | grep '"status"' | cut -d'"' -f4)
    
    case $STATUS in
        "pending")
            echo "⏳ Warte auf Start..."
            ;;
        "running")
            echo "🔄 Training läuft..."
            ;;
        "succeeded")
            echo "✅ Training erfolgreich abgeschlossen!"
            MODEL_NAME=$(openai api fine_tunes.get -i "$FINE_TUNE_ID" | grep '"fine_tuned_model"' | cut -d'"' -f4)
            echo "🎉 Neues Model: $MODEL_NAME"
            echo ""
            echo "📝 Nächste Schritte:"
            echo "1. Aktualisiere die Model-ID in supabase/functions/gfk-transform/index.ts"
            echo "2. Deploye die Funktion neu: supabase functions deploy gfk-transform"
            echo "3. Teste das neue Model"
            break
            ;;
        "failed")
            echo "❌ Training fehlgeschlagen"
            openai api fine_tunes.get -i "$FINE_TUNE_ID"
            break
            ;;
        *)
            echo "❓ Unbekannter Status: $STATUS"
            ;;
    esac
    
    sleep 30
done

echo "🏁 Training-Script beendet" 