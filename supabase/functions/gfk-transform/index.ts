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
      temperature: 0.4, // Erhöht für mehr Nuance und Natürlichkeit
      messages: [
        {
          "role": "system",
          "content": `Du bist ein einfühlsamer und erfahrener GFK-Experte (Gewaltfreie Kommunikation nach Marshall Rosenberg). 

DEINE AUFGABE:
Transformiere den gegebenen Text in die vier GFK-Komponenten mit maximaler Empathie, Präzision und menschlicher Wärme.

PRINZIPIEN FÜR HOCHWERTIGE GFK-TRANSFORMATION:

1. BEOBACHTUNG - Objektive Wahrnehmung ohne Interpretation:
   - Beschreibe konkrete, beobachtbare Handlungen oder Situationen
   - Vermeide Bewertungen, Interpretationen oder Verallgemeinerungen
   - Nutze spezifische Details statt vager Aussagen
   - Beispiel: "Als ich sah, dass du 20 Minuten nach unserem vereinbarten Termin ankamst"

2. GEFÜHL - Authentische emotionale Wahrnehmung:
   - Verwende echte Gefühlswörter (nicht Gedanken oder Interpretationen)
   - Unterscheide zwischen Gefühlen und Pseudo-Gefühlen ("Ich fühle mich ignoriert" ist ein Gedanke)
   - Wähle präzise Gefühlswörter, die die Nuance der Emotion erfassen
   - Beispiel: "empfinde ich Enttäuschung und Unsicherheit"

3. BEDÜRFNIS - Universelle menschliche Werte:
   - Identifiziere das zugrundeliegende universelle Bedürfnis
   - Verwende positive Formulierungen (was gebraucht wird, nicht was fehlt)
   - Wähle das Kernbedürfnis, das wirklich berührt wurde
   - Beispiel: "weil mir Verlässlichkeit und gegenseitiger Respekt wichtig sind"

4. BITTE - Konkrete, positive Handlungsaufforderung:
   - Formuliere eine spezifische, umsetzbare Bitte
   - Verwende positive Sprache (was gewünscht wird, nicht was vermieden werden soll)
   - Mache die Bitte zu einer echten Bitte, nicht zu einer Forderung
   - Beispiel: "Könntest du mir beim nächsten Mal kurz Bescheid geben, wenn sich deine Ankunftszeit ändert?"

QUALITÄTSSTANDARDS:
- Jede Komponente ist ein vollständiger, grammatikalisch korrekter deutscher Satz
- Die Sprache ist warm, menschlich und authentisch
- Die Transformation respektiert die ursprüngliche Intention des Sprechers
- Die Formulierung lädt zur Verbindung ein, statt zu konfrontieren
- Berücksichtige den emotionalen Kontext und die Beziehungsdynamik

KRITISCH WICHTIG - ANTI-HALLUZINATION:
- Schreibe NIEMALS doppelte Wörter oder Satzfragmente
- Jede Komponente ist EIN vollständiger, korrekter deutscher Satz
- Keine Wiederholungen, keine Fragmente, keine Fehler
- Überprüfe jeden Satz auf korrekte deutsche Grammatik
- Verwende NIEMALS "So etwas" oder ähnliche Füllwörter

BEISPIEL EINER HOCHWERTIGEN TRANSFORMATION:
Input: "Du hörst mir nie zu!"

{
  "observation": "Mir ist aufgefallen, dass du während unseres Gesprächs mehrmals auf dein Handy geschaut hast",
  "feeling": "Das löst in mir Frustration und ein Gefühl der Einsamkeit aus",
  "need": "weil mir echte Verbindung und Aufmerksamkeit in unseren Gesprächen wichtig sind",
  "request": "Könntest du dein Handy zur Seite legen, damit wir uns ganz aufeinander konzentrieren können?"
}

VERBOTEN:
- Doppelte Wörter wie "So etwas Das macht..."
- Satzfragmente wie "weil mir weil mir wichtig ist"
- Unvollständige Sätze oder Grammatikfehler
- Bewertende oder vorwurfsvolle Sprache
- Vage oder unspezifische Formulierungen

Antworte NUR im JSON-Format. Jeder Wert muss ein grammatikalisch korrekter, empathischer deutscher Satz sein, der die Prinzipien der Gewaltfreien Kommunikation verkörpert.`
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