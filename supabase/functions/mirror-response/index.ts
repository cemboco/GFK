import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { input } = await req.json();
    
    if (!input?.trim()) {
      throw new Error('Bitte geben Sie einen Text ein.');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API Konfigurationsfehler.');
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für aktives Zuhören und Kommunikation. Deine Aufgabe ist es, Nachrichten zu "spiegeln" - das bedeutet, den Kern der Aussage in eigenen Worten wiederzugeben, um Verständnis zu zeigen und mögliche Missverständnisse zu klären.

WICHTIGE REGELN FÜR DAS SPIEGELN:

1. Struktur der Antwort:
   - Beginne mit einer Einleitungsphrase wie "Wenn ich dich richtig verstehe..." oder "Du möchtest mir sagen, dass..."
   - Fasse den Kerninhalt in eigenen Worten zusammen
   - Schließe mit einer Rückversicherung wie "Habe ich das so richtig verstanden?"

2. Fokus auf:
   - Hauptaussagen und zentrale Botschaften
   - Emotionale Untertöne und implizite Bedeutungen
   - Die Perspektive des Sprechenden

3. Vermeiden:
   - Bewertungen oder eigene Meinungen
   - Ratschläge oder Lösungsvorschläge
   - Interpretationen, die über das Gesagte hinausgehen

4. Sprachstil:
   - Empathisch und respektvoll
   - Klar und präzise
   - Neutral und nicht-wertend

Antworte mit einer einzelnen, zusammenhängenden Spiegelung der Nachricht.`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    const response = completion.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Ein unerwarteter Fehler ist aufgetreten.' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});