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
    
    const GFKTransform = async (input) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,  // Leicht reduziert für konsistentere Ergebnisse
      response_format: { type: "json_object" }, // JSON-Ausgabe erzwingen
      messages: [
        {
          role: "system",
          content: `Du bist ein GFK-Experte nach Marshall Rosenberg. Transformiere Eingaben in die 4 GFK-Komponenten:

STRUKTUR:
{
  "observation": "Neutrale Beobachtung (konkret, messbar)",
  "feeling": "Gefühl mit konjugiertem Verb (Ich-Botschaft)",
  "need": "Universelles Bedürfnis (positiv formuliert)",
  "request": "Konkrete Bitte (als Frage formuliert)"
}

REGELN:
1. Beobachtung: 
   - 100% objektiv ("3 Bücher auf dem Boden", nicht "Chaos")
   - Keine Verallgemeinerungen ("nie", "immer")
   - Zeitangaben wenn möglich ("heute um 14 Uhr")

2. Gefühl:
   - Nur echte Gefühle (keine Gedanken wie "ignoriert")
   - Korrekt konjugiert ("Ich bin frustriert", nicht "Ich Frustration")
   - Maximal 2 Gefühle pro Satz

3. Bedürfnis:
   - Universelle menschliche Bedürfnisse benennen
   - Positiv formulieren ("Sicherheit", nicht "keine Unsicherheit")
   - Mit "weil ich... brauche" beginnen

4. Bitte:
   - Konkret und umsetzbar ("Könntest du...?" nicht "Sei besser")
   - Als Frage formulieren
   - Zeitrahmen angeben wenn möglich

QUALITÄTSSICHERUNG:
- KEINE Halluzinationen (keine erfundenen Details)
- KEINE doppelten Wörter/Sätze
- KEINE unvollendeten Sätze
- Jedes Feld muss ein vollständiger deutscher Satz sein
- Grammatikfehler strikt vermeiden

BEISPIEL:
Input: "Du kommst immer zu spät!"
{
  "observation": "Unser Treffen heute begann um 15:05 Uhr, 15 Minuten nach der vereinbarten Zeit",
  "feeling": "Ich bin enttäuscht",
  "need": "weil ich Verlässlichkeit in unseren Absprachen brauche",
  "request": "Könntest du mir nächste Woche eine Nachricht senden, wenn du später als 5 Minuten kommst?"
}

ANTWORTFORMAT: NUR JSON`
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

    // Validierung der Felder
    const requiredFields = ['observation', 'feeling', 'need', 'request'];
    const validationErrors = [];
    
    requiredFields.forEach(field => {
      if (!parsedResponse[field] || typeof parsedResponse[field] !== 'string') {
        validationErrors.push(`Feld '${field}' fehlt oder ist kein String`);
      } else {
        const text = parsedResponse[field];
        
        // Anti-Halluzinations-Checks
        const errorPatterns = [
          { pattern: /(\b\w+\b)\s+\1\b/, msg: 'Doppelte Wörter' }, // Wiederholte Wörter
          { pattern: /\.\./, msg: 'Unvollständige Sätze' },
          { pattern: /(?:so etwas|dass das)/i, msg: 'Füllwörter' },
          { pattern: /(?:weil mir weil|dass weil)/i, msg: 'Grammatikfehler' }
        ];
        
        errorPatterns.forEach(({ pattern, msg }) => {
          if (pattern.test(text)) {
            validationErrors.push(`Feld '${field}' enthält '${msg}': ${text}`);
          }
        });
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
      return GFKTransform(input, retryCount + 1);
    }
    
    throw new Error("GFK-Transformation fehlgeschlagen. Bitte Eingabe überprüfen oder neu formulieren.");
  }
};

// Verwendungsbeispiel
GFKTransform("Mein Sohn räumt sein Zimmer nie auf!")
  .then(response => console.log(response))
  .catch(error => console.error(error));
    response_format: { type: "json_object" }
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