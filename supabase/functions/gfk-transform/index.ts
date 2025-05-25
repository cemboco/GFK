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
    const response = await openai.chat.completions.create({
      model: "o4-mini",
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. Deine Aufgabe ist es, Nachrichten in die vier Komponenten der GFK umzuwandeln:

1. Beobachtung: Beschreibe nur konkrete, beobachtbare Fakten ohne Bewertung
2. Gefühl: Drücke echte Gefühle aus, keine Pseudogefühle
3. Bedürfnis: Fokussiere auf universelle menschliche Bedürfnisse
4. Bitte: Formuliere eine positive, konkrete und machbare Handlung

Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "observation": "konkrete Beobachtung ohne Bewertung",
  "feeling": "echtes Gefühl",
  "need": "universelles Bedürfnis",
  "request": "konkrete, positive Bitte"
}`
        },
        {
          role: "user",
          content: input.trim()
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    try {
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      return new Response(
        JSON.stringify(parsedResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      throw new Error('Fehler beim Parsen der API-Antwort.');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Ein unerwarteter Fehler ist aufgetreten.' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});