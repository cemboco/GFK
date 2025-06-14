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
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          "role": "system",
          "content": `Du bist ein Experte für Gewaltfreie Kommunikation (GFK). 

AUFGABE: Wandle den Input in 4 GFK-Komponenten um.

REGELN:
1. Jede Komponente ist EIN vollständiger deutscher Satz
2. Keine doppelten Wörter oder Satzanfänge
3. Perfekte deutsche Grammatik
4. Natürliche, abwechslungsreiche Formulierungen

KOMPONENTEN:
1. BEOBACHTUNG: Objektive Beschreibung ohne Bewertung
2. GEFÜHL: Echtes Gefühl (nicht "Ich fühle mich wie...")
3. BEDÜRFNIS: Universelles menschliches Bedürfnis
4. BITTE: Konkrete, positive Handlungsaufforderung

BEISPIEL:
Input: "Du kommst schon wieder zu spät!"

Korrekte Ausgabe:
{
  "observation": "Mir ist aufgefallen, dass du heute 15 Minuten nach der vereinbarten Zeit angekommen bist",
  "feeling": "Das macht mich frustriert",
  "need": "weil mir Verlässlichkeit wichtig ist",
  "request": "Könntest du mir beim nächsten Mal Bescheid geben, wenn du dich verspätest?"
}

Antworte NUR im JSON-Format ohne zusätzlichen Text.`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    try {
      const parsedResponse = JSON.parse(completion.choices[0].message.content);
      
      // Add HTML spans for styling
      const styledResponse = {
        observation: `<span class='text-blue-600'>${parsedResponse.observation}</span>`,
        feeling: `<span class='text-green-600'>${parsedResponse.feeling}</span>`,
        need: `<span class='text-orange-600'>${parsedResponse.need}</span>`,
        request: `<span class='text-purple-600'>${parsedResponse.request}</span>`
      };
      
      return new Response(
        JSON.stringify(styledResponse),
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