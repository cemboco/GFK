import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { getContextPrompt } from "./contextExamples.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_INPUTS_PER_IP = 5;

const GFKTransform = async (input: string, openai: OpenAI, context?: any, retryCount = 0): Promise<any> => {
  try {
    // Kontext-spezifische Anpassungen
    let contextPrompt = '';
    let styleInstructions = '';
    
    if (context) {
      // Kontext-spezifische Beispiele hinzufügen
      if (context.relationship && context.relationship !== 'general') {
        contextPrompt = getContextPrompt(context.relationship);
      } else if (context.contextExamples) {
        contextPrompt = `\n\n${context.contextExamples}\n\n`;
      }
      
      // Stil-Anweisungen basierend auf Kontext
      const styleMap = {
        child: 'Verwende einen sanften, einfühlsamen Ton. Sei geduldig und erklärend.',
        business: 'Verwende einen professionellen, respektvollen Ton. Sei klar und strukturiert.',
        partner: 'Verwende einen warmen, intimen Ton. Sei verletzlich und ehrlich.',
        colleague: 'Verwende einen kooperativen, teamorientierten Ton. Sei konstruktiv und lösungsorientiert.',
        general: 'Verwende einen ausgewogenen, empathischen Ton.'
      };
      
      styleInstructions = styleMap[context.relationship] || styleMap.general;
    }

    const completion = await openai.chat.completions.create({
  model: "ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m",
  temperature: 0.3,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content: `Du bist ein neutrales Werkzeug zur Umformulierung von Texten in Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg.

DEINE WICHTIGSTE REGEL:
Beziehe die Eingabe des Nutzers NIEMALS auf dich selbst. Du bist ein unpersönlicher Text-Transformator. Die Aussage des Nutzers ist immer eine Situation, die er für eine dritte Person umformulieren möchte. Deine Antwort muss immer aus der Perspektive des Nutzers formuliert sein.

Analysiere die Absicht hinter der Aussage und übersetze sie in die 4 GFK-Komponenten:
1.  **Beobachtung:** Was ist konkret passiert? (Ohne Bewertung)
2.  **Gefühl:** Welches Gefühl löst das beim Nutzer aus? (Ich-Botschaft)
3.  **Bedürfnis:** Welches unerfüllte Bedürfnis steckt dahinter? (Universell)
4.  **Bitte:** Eine konkrete, machbare Bitte an die andere Person.

Erstelle daraus zwei vollständige, flüssige Formulierungen (variant1, variant2).

---
**BEISPIEL ZUR VERDEUTLICHUNG DEINER ROLLE:**

**Eingabe des Nutzers:** "Ich hasse dich"

**DEINE AUFGABE:** Wandle diesen Satz für den Nutzer um, damit er ihn in GFK ausdrücken kann.

**ERWARTETES ERGEBNIS (JSON):**
{
  "observation": "Wenn ich darüber nachdenke, was in letzter Zeit zwischen uns vorgefallen ist, und höre, wie wir miteinander sprechen,",
  "feeling": "fühle ich mich verzweifelt und sehr traurig,",
  "need": "weil ich mir so sehr eine Verbindung und gegenseitigen Respekt wünsche.",
  "request": "Wärst du bereit, dir heute Abend eine halbe Stunde Zeit zu nehmen, damit wir in Ruhe darüber sprechen können, wie es uns wirklich geht?",
  "variant1": "Wenn ich darüber nachdenke, was in letzter Zeit zwischen uns vorgefallen ist, fühle ich mich verzweifelt und sehr traurig, weil ich mir so sehr eine Verbindung und gegenseitigen Respekt wünsche. Wärst du bereit, dir heute Abend Zeit zu nehmen, um in Ruhe darüber zu sprechen?",
  "variant2": "Ich bin gerade sehr unglücklich mit unserer Situation. Ich fühle mich verletzt, weil mir ein respektvoller Umgang und Nähe wichtig sind. Können wir bitte einen Moment finden, an dem wir ohne Vorwürfe darüber reden können, was los ist?"
}

**FALSCH (NICHT MACHEN):**
Auf die Aussage "Ich hasse dich" persönlich reagieren, z.B. mit "Wenn ich deinen Satz höre, fühle ich mich verletzt...".
---

ANTWORTFORMAT: STRENGES JSON, KEIN TEXT AUSSERHALB DES JSON-OBJEKTS.

${contextPrompt}`
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
    const requiredFields = ['observation', 'feeling', 'need', 'request', 'variant1', 'variant2'];
    const validationErrors: string[] = [];
    
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
      return GFKTransform(input, openai, context, retryCount + 1);
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
    const { input, context } = await req.json();
    
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
    
    const parsedResponse = await GFKTransform(input, openai, context);
    
    // Add HTML spans for styling
    const styledResponse = {
      observation: `<span class='text-blue-600'>${parsedResponse.observation}</span>`,
      feeling: `<span class='text-green-600'>${parsedResponse.feeling}</span>`,
      need: `<span class='text-orange-600'>${parsedResponse.need}</span>`,
      request: `<span class='text-purple-600'>${parsedResponse.request}</span>`,
      variant1: `<span class='text-pink-600'>${parsedResponse.variant1}</span>`,
      variant2: `<span class='text-teal-600'>${parsedResponse.variant2}</span>`
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
