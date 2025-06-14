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
      temperature: 0.2,
      messages: [
        {
          "role": "system",
          "content": `Du bist ein Experte für Gewaltfreie Kommunikation (GFK). 

KRITISCH WICHTIG - ANTI-HALLUZINATION:
- Schreibe NIEMALS doppelte Wörter oder Satzfragmente
- Jede Komponente ist EIN vollständiger, korrekter deutscher Satz
- Keine Wiederholungen, keine Fragmente, keine Fehler
- Überprüfe jeden Satz auf korrekte deutsche Grammatik
- Verwende NIEMALS "So etwas" oder ähnliche Füllwörter

AUFGABE: Wandle den Input in 4 GFK-Komponenten um.

REGELN:
1. BEOBACHTUNG: Ein objektiver, beschreibender Satz ohne Bewertung
2. GEFÜHL: Ein Satz, der ein echtes Gefühl ausdrückt
3. BEDÜRFNIS: Ein Satz über ein universelles menschliches Bedürfnis
4. BITTE: Ein Satz mit einer konkreten, positiven Handlungsaufforderung

BEISPIEL KORREKT:
Input: "Du kommst schon wieder zu spät!"

{
  "observation": "Mir ist aufgefallen, dass du heute 15 Minuten nach der vereinbarten Zeit angekommen bist",
  "feeling": "Das macht mich frustriert",
  "need": "weil mir Verlässlichkeit wichtig ist",
  "request": "Könntest du mir beim nächsten Mal Bescheid geben, wenn du dich verspätest?"
}

VERBOTEN:
- Doppelte Wörter wie "So etwas Das macht..."
- Satzfragmente wie "weil mir weil mir wichtig ist"
- Unvollständige Sätze
- Grammatikfehler

Antworte NUR im JSON-Format. Jeder Wert muss ein grammatikalisch korrekter deutscher Satz sein.`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    try {
      const parsedResponse = JSON.parse(completion.choices[0].message.content);
      
      // Validate that each field is a proper sentence
      const fields = ['observation', 'feeling', 'need', 'request'];
      for (const field of fields) {
        if (!parsedResponse[field] || typeof parsedResponse[field] !== 'string') {
          throw new Error(`Ungültiges Format: ${field} fehlt oder ist kein String`);
        }
        
        // Check for common hallucination patterns
        const text = parsedResponse[field];
        if (text.includes('So etwas') || 
            text.includes('weil mir weil mir') || 
            text.match(/\b(\w+)\s+\1\b/) || // repeated words
            text.includes('..') ||
            text.length < 10) {
          throw new Error(`Ungültiger Text in ${field}: ${text}`);
        }
      }
      
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