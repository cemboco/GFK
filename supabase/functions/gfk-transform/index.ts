import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_INPUTS_PER_IP = 5;

const GFKTransform = async (input: string, openai: OpenAI, retryCount = 0): Promise<any> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Du bist ein professioneller Coach für Gewaltfreie Kommunikation (GfK). 
Deine Aufgabe ist es, Aussagen in zwei gelingende GfK-Formulierungen umzuschreiben. 
Nutze immer die 4 Schritte der GfK:
1. Beobachtung (ohne Bewertung)
2. Gefühl (authentisch, kein Pseudo-Gefühl)
3. Bedürfnis (grundlegend, keine Strategie)
4. Bitte (konkret, erfüllbar, freiwillig)
Vermeide Schuldzuweisungen, Interpretationen oder moralische Urteile. 
Sprich in Alltagssprache. Gib immer zwei Varianten aus, getrennt durch [Variante 1] und [Variante 2].

ANTWORTFORMAT: NUR JSON mit folgender Struktur:
{
  "observation": "Neutrale Beobachtung (konkret, messbar)",
  "feeling": "Gefühl mit konjugiertem Verb (Ich-Botschaft)",
  "need": "Universelles Bedürfnis (positiv formuliert)",
  "request": "Konkrete Bitte (als Frage formuliert)",
  "variant1": "Vollständige GfK-Formulierung Variante 1",
  "variant2": "Vollständige GfK-Formulierung Variante 2"
}`
        },
        {
          role: "user",
          content: "Du hörst mir nie zu."
        },
        {
          role: "assistant",
          content: `{
  "observation": "Wenn ich mit dir rede und keine Reaktion bekomme",
  "feeling": "fühle ich mich traurig",
  "need": "weil mir Aufmerksamkeit wichtig ist",
  "request": "Könntest du mir sagen, ob du gerade Kapazität hast zuzuhören?",
  "variant1": "Wenn ich mit dir rede und keine Reaktion bekomme, fühle ich mich traurig, weil mir Aufmerksamkeit wichtig ist. Könntest du mir sagen, ob du gerade Kapazität hast zuzuhören?",
  "variant2": "Ich habe den Eindruck, dass du oft still bleibst, wenn ich etwas erzähle. Das verunsichert mich, weil ich mir Verbindung wünsche. Wäre es möglich, dass du mir rückmeldest, was du gehört hast?"
}`
        },
        {
          role: "user",
          content: "Immer lässt du deine Sachen überall rumliegen."
        },
        {
          role: "assistant",
          content: `{
  "observation": "Wenn ich deine Sachen auf dem Boden sehe",
  "feeling": "fühle ich mich genervt",
  "need": "weil mir Ordnung und gegenseitige Rücksicht wichtig sind",
  "request": "Wärst du bereit, deine Sachen direkt wegzuräumen?",
  "variant1": "Wenn ich deine Sachen auf dem Boden sehe, fühle ich mich genervt, weil mir Ordnung und gegenseitige Rücksicht wichtig sind. Wärst du bereit, deine Sachen direkt wegzuräumen?",
  "variant2": "Heute lagen wieder deine Jacke und Tasche im Flur. Ich bin angespannt, weil ich mir mehr Struktur im Alltag wünsche. Wie können wir das gemeinsam anders organisieren?"
}`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    const responseContent = completion.choices[0].message.content;
    
    // Versuche direkte JSON-Parsung und handle potentielle Markdown
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (e) {
      // Fallback: Entferne Markdown-Codeblöcke
      const cleanedJson = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResponse = JSON.parse(cleanedJson);
    }

    // Validierung der Felder - nur grundlegende Checks
    const requiredFields = ['observation', 'feeling', 'need', 'request', 'variant1', 'variant2'];
    const validationErrors: string[] = [];
    
    requiredFields.forEach(field => {
      if (!parsedResponse[field] || typeof parsedResponse[field] !== 'string') {
        validationErrors.push(`Feld '${field}' fehlt oder ist kein String`);
      } else {
        const text = parsedResponse[field].trim();
        
        // Nur kritische Validierungen - weniger restriktiv
        if (text.length === 0) {
          validationErrors.push(`Feld '${field}' ist leer`);
        }
        
        // Nur sehr offensichtliche Probleme prüfen
        if (text.length > 1000) {
          validationErrors.push(`Feld '${field}' ist zu lang`);
        }
      }
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validierungsfehler:\n${validationErrors.join('\n')}`);
    }

    return parsedResponse;

  } catch (error) {
    console.error("GFK-Transformationsfehler:", error);
    
    // Automatischer Wiederholungsmechanismus
    if (error.message.includes('Validierungsfehler') && retryCount < 2) {
      console.log(`Wiederholungsversuch ${retryCount + 1}/2`);
      return GFKTransform(input, openai, retryCount + 1);
    }
    
    throw new Error("GFK-Transformation fehlgeschlagen. Bitte Eingabe überprüfen oder neu formulieren.");
  }
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
    
    const parsedResponse = await GFKTransform(input, openai);
    
    // Add HTML spans for styling
    const styledResponse = {
      observation: `<span class='text-blue-600'>${parsedResponse.observation}</span>`,
      feeling: `<span class='text-green-600'>${parsedResponse.feeling}</span>`,
      need: `<span class='text-orange-600'>${parsedResponse.need}</span>`,
      request: `<span class='text-purple-600'>${parsedResponse.request}</span>`,
      variant1: parsedResponse.variant1,
      variant2: parsedResponse.variant2
    };
    
    return new Response(
      JSON.stringify(styledResponse),
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