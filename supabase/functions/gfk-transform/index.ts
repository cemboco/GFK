import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Parse request body
    const requestData = await req.json().catch(() => null);
    if (!requestData || !requestData.input) {
      return new Response(
        JSON.stringify({ error: 'Bitte geben Sie einen Text ein.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const input = requestData.input.trim();
    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Der Text darf nicht leer sein.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Check for API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API Konfigurationsfehler.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Call OpenAI API
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "o4-mini",
      temperature: 0.7,
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
          content: input
        }
      ]
    });

    // Parse and validate OpenAI response
    try {
      const parsedResponse = JSON.parse(completion.choices[0].message.content);
      
      // Validate response structure
      if (!parsedResponse.observation || !parsedResponse.feeling || 
          !parsedResponse.need || !parsedResponse.request) {
        throw new Error('Ungültige API-Antwort.');
      }

      return new Response(
        JSON.stringify(parsedResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Fehler beim Verarbeiten der API-Antwort.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Ein unerwarteter Fehler ist aufgetreten.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500
      }
    );
  }
});