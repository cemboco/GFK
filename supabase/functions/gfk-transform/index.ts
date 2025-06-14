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
      temperature: 0.8,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
      messages: [
        {
          "role": "system",
          "content": `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. 

WICHTIGE REGELN:
1. Achte auf perfekte deutsche Grammatik und Rechtschreibung
2. Verwende abwechslungsreiche, natürliche Formulierungen
3. Jede Komponente muss ein vollständiger, korrekter Satz sein
4. Keine doppelten Satzanfänge oder unvollständige Sätze

SATZANFÄNGE (wähle passende aus):

BEOBACHTUNG:
- "Mir ist aufgefallen, dass..."
- "Ich habe bemerkt, dass..."
- "Ich sehe, dass..."
- "Mir fällt auf, dass..."
- "Ich nehme wahr, dass..."
- "Ich stelle fest, dass..."
- "Als ich sah, dass..."
- "Wenn ich beobachte, dass..."

GEFÜHL:
- "Das macht mich..."
- "Ich fühle mich..."
- "Ich bin..."
- "Das löst in mir ... aus"
- "Dabei empfinde ich..."
- "Ich spüre..."
- "Das bereitet mir..."
- "In mir entsteht..."

BEDÜRFNIS:
- "weil mir ... wichtig ist"
- "da ich ... brauche"
- "weil ich ... schätze"
- "da mir ... am Herzen liegt"
- "weil ... für mich bedeutsam ist"
- "da ... einen hohen Stellenwert für mich hat"

BITTE:
- "Könntest du bitte..."
- "Wärst du bereit..."
- "Würdest du..."
- "Magst du..."
- "Wäre es möglich..."
- "Könntest du dir vorstellen..."

BEISPIEL für korrekte Ausgabe:
Input: "Du kommst schon wieder zu spät!"
Korrekte Antwort:
- Beobachtung: "Mir ist aufgefallen, dass du heute 15 Minuten nach der vereinbarten Zeit angekommen bist"
- Gefühl: "Das macht mich frustriert"
- Bedürfnis: "weil mir Verlässlichkeit wichtig ist"
- Bitte: "Könntest du mir bitte beim nächsten Mal Bescheid geben, wenn du dich verspätest?"

Transformiere die Eingabe in die 4 GFK-Komponenten. Jede Komponente muss grammatikalisch korrekt und vollständig sein.

Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "observation": "<span class='text-blue-600'>[vollständiger Beobachtungssatz]</span>",
  "feeling": "<span class='text-green-600'>[vollständiger Gefühlssatz]</span>",
  "need": "<span class='text-orange-600'>[vollständiger Bedürfnissatz]</span>",
  "request": "<span class='text-purple-600'>[vollständiger Bittensatz]</span>"
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