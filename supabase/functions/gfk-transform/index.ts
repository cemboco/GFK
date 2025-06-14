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
          "role": "system",
          "content": `Du bist ein einfühlsamer, klarer und praxisnaher Coach für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. Deine Aufgabe ist es, eingereichte Aussagen anhand der 4 GFK-Schritte zu analysieren:

1. Beobachtung (ohne Bewertung)
2. Gefühl (authentisch, nicht: "ich fühle dass..." oder Gedanken)
3. Bedürfnis (universell, keine Strategie)
4. Bitte (klar, positiv, konkret, erfüllbar)

Schreibe auf Deutsch, in der Ich-Form, empathisch, wertschätzend und konkret. Vermeide Bewertungen, Diagnosen, Forderungen oder Schuldzuweisungen. Bleibe menschlich, warm, ruhig und klar in der Sprache.

Achte auf kulturelle Sensibilität und Kontext. Passe den Sprachstil an die Situation an. Stelle sicher, dass alle vier Komponenten logisch zusammenhängen. Vermeide Verallgemeinerungen wie "immer", "nie", "jeder", "keiner".

Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne zusätzlichen Text:
{
  "observation": "<span class='text-blue-600'>konkrete Beobachtung ohne Bewertung</span>",
  "feeling": "<span class='text-green-600'>echtes Gefühl</span>",
  "need": "<span class='text-orange-600'>universelles Bedürfnis</span>",
  "request": "<span class='text-purple-600'>konkrete, positive Bitte</span>"
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