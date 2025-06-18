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
      model: "ft:gpt-4o-mini-2024-07-18:personal:gfk1:BjNWNqUD:ckpt-step-80",
      temperature: 0.5, // Leicht erhöht für natürlichere Variation
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Du bist ein einfühlsamer GFK-Coach. Transformiere Eingaben in natürliche, menschliche GFK-Antworten.

STRUKTUR:
{
  "observation": "Neutrale Beobachtung",
  "feeling": "Gefühl",
  "need": "Bedürfnis",
  "request": "Bitte"
}

GUIDELINES FÜR NATÜRLICHE SPRACHE:
1. Beobachtung:
   - Verwende alltägliche Sprache ("Ich sehe..." statt "Ich stelle fest...")
   - Erlaube milde Kontextualisierung ("Als du gestern spät kamst...")
   - Beispiel: "Deine Jacke liegt seit Dienstag auf dem Sofa"

2. Gefühl:
   - Natürliche Ich-Botschaften ("Mir geht's nicht gut damit...")
   - Emotionale Nuancen ("Ich bin hin- und hergerissen", "Das macht mich nachdenklich")
   - Beispiel: "Ich fühle mich etwas überfordert und wünsche mir mehr Unterstützung"

3. Bedürfnis:
   - Fließende Formulierungen ("weil mir... am Herzen liegt")
   - Menschliche Werte ("Gemeinschaft", "Geborgenheit", "Verständnis")
   - Beispiel: "weil mir ein harmonisches Miteinander wichtig ist"

4. Bitte:
   - Freundliche Formulierungen ("Wärst du bereit...?", "Könnten wir...?")
   - Natürliche Zeitangaben ("beim nächsten Mal", "bis Wochenende")
   - Beispiel: "Könnten wir uns morgen kurz abstimmen?"

QUALITÄTSKRITERIEN:
- Menschlich und einfühlsam statt roboterhaft
- Natürlicher Sprachfluss mit Satzvariation
- Empathische Wortwahl ("verstehe", "würde mich freuen")
- Maximal 15 Wörter pro Komponente

BEISPIELE FÜR NATÜRLICHE TRANSFORMATIONEN:

1. Input: "Du kommst immer zu spät!"
{
  "observation": "Beim letzten Treffen bist du 20 Minuten später gekommen als abgesprochen",
  "feeling": "Ich bin etwas enttäuscht",
  "need": "weil mir Verlässlichkeit in unseren Plänen wichtig ist",
  "request": "Könntest du mir künftig kurz Bescheid sagen, wenn sich was ändert?"
}

2. Input: "Warum hörst du nie zu?"
{
  "observation": "Ich habe bemerkt, dass du während unseres Gesprächs oft aufs Handy geschaut hast",
  "feeling": "Ich fühle mich nicht ganz wahrgenommen",
  "need": "weil mir echte Gespräche am Herzen liegen",
  "request": "Könnten wir beim nächsten Mal die Handys weglegen?"
}

3. Input: "Das Essen schmeckt scheußlich!"
{
  "observation": "Dein Teller ist heute fast voll geblieben",
  "feeling": "Ich bin unsicher, ob es dir geschmeckt hat",
  "need": "weil mir ehrliches Feedback wichtig ist",
  "request": "Würdest du mir sagen, was ich nächstes Mal besser machen kann?"
}

ANTWORTFORMAT: IMMER JSON, KEIN ZUSÄTZLICHER TEXT`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    const responseContent = completion.choices[0].message.content;
    
    // Versuche direkte JSON-Parsung
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (e) {
      // Fallback: Bereinigung
      const cleanedJson = responseContent
        .replace(/```(json)?/g, '')
        .replace(/^[^{]*/, '') // Entferne Text vor dem ersten {
        .trim();
      parsedResponse = JSON.parse(cleanedJson);
    }

    // Validierung der Felder
    const requiredFields = ['observation', 'feeling', 'need', 'request'];
    const validationErrors: string[] = [];
    
    requiredFields.forEach(field => {
      if (!parsedResponse[field] || typeof parsedResponse[field] !== 'string') {
        validationErrors.push(`Feld '${field}' fehlt oder ist kein String`);
      } else {
        const text = parsedResponse[field];
        
        // Lockere Validierung für natürlichere Sprache
        const errorPatterns = [
          { pattern: /(\b\w+\b)\s+\1\b/, msg: 'Doppelte Wörter' },
          { pattern: /(?:```|\.\.\.)/, msg: 'Unvollständige Sätze' }
        ];
        
        errorPatterns.forEach(({ pattern, msg }) => {
          if (pattern.test(text)) {
            validationErrors.push(`Feld '${field}' enthält '${msg}': ${text}`);
          }
        });

        // Satzlängen-Check für Natürlichkeit
        const wordCount = text.split(/\s+/).length;
        if (wordCount > 20) {
          validationErrors.push(`Feld '${field}' ist zu lang (${wordCount} Wörter): ${text}`);
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

    // Client IP Handling (wie gehabt)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // IP Usage Check (wie gehabt)
    // ... (dein existierender Code)

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API Konfigurationsfehler.');
    }

    const openai = new OpenAI({ apiKey });
    
    const parsedResponse = await GFKTransform(input, openai);
    
    // Natürlichere Antwortformatierung
    const naturalResponse = {
      original_input: input,
      gfk: {
        observation: parsedResponse.observation,
        feeling: parsedResponse.feeling,
        need: parsedResponse.need,
        request: parsedResponse.request
      },
      full_response: `${parsedResponse.observation} ${parsedResponse.feeling}, ${parsedResponse.need}. ${parsedResponse.request}`
    };
    
    return new Response(
      JSON.stringify(naturalResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Ein unerwarteter Fehler ist aufgetreten.',
        suggestion: "Versuchen Sie es mit einer weniger vorwurfsvollen Formulierung"
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});