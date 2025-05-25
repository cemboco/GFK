import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_INPUTS_PER_IP = 5;

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

    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check IP usage
    const { data: ipData, error: ipError } = await supabase
      .from('ip_usage')
      .select('usage_count')
      .eq('ip', clientIP)
      .single();

    if (ipError && ipError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw new Error('Fehler beim Überprüfen der IP-Nutzung.');
    }

    const currentCount = ipData?.usage_count || 0;

    if (currentCount >= MAX_INPUTS_PER_IP) {
      throw new Error('Sie haben das Limit für Eingaben erreicht.');
    }

    // Update IP usage
    const { error: updateError } = await supabase
      .from('ip_usage')
      .upsert({
        ip: clientIP,
        usage_count: currentCount + 1,
        last_used: new Date().toISOString()
      });

    if (updateError) {
      throw new Error('Fehler beim Aktualisieren der IP-Nutzung.');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API Konfigurationsfehler.');
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "o4-mini",
      temperature: 1,
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. Deine Aufgabe ist es, für eine Nachricht drei alternative GFK-Formulierungen zu erstellen, die sich in Gefühlen und Bedürfnissen unterscheiden. Formuliere die Antworten in natürlicher, fließender Sprache.

Erstelle drei Varianten, die jeweils unterschiedliche Gefühle und Bedürfnisse ansprechen, aber authentisch und nachvollziehbar sind. Vermeide Plattitüden und oberflächliche Formulierungen.

Antworte im folgenden JSON-Format:
{
  "alternatives": [
    {
      "observation": "konkrete Beobachtung ohne Bewertung",
      "feeling": "echtes Gefühl - Variante 1",
      "need": "universelles Bedürfnis - Variante 1",
      "request": "konkrete, positive Bitte",
      "explanation": "Kurze Erklärung, warum diese Kombination von Gefühl und Bedürfnis sinnvoll sein könnte"
    },
    {
      "observation": "gleiche Beobachtung",
      "feeling": "echtes Gefühl - Variante 2",
      "need": "universelles Bedürfnis - Variante 2",
      "request": "konkrete, positive Bitte (kann variieren)",
      "explanation": "Kurze Erklärung für diese Alternative"
    },
    {
      "observation": "gleiche Beobachtung",
      "feeling": "echtes Gefühl - Variante 3",
      "need": "universelles Bedürfnis - Variante 3",
      "request": "konkrete, positive Bitte (kann variieren)",
      "explanation": "Kurze Erklärung für diese Alternative"
    }
  ],
  "questions": {
    "feeling": "Welches dieser Gefühle kommt deiner Situation am nächsten?",
    "need": "Welches Bedürfnis trifft es am besten – oder möchtest du dein eigenes ergänzen?"
  }
}`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    try {
      const parsedResponse = JSON.parse(completion.choices[0].message.content);
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});