import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { getContextPrompt } from "./contextExamples.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_INPUTS_PER_IP = 5;

/**
 * Definiert die Anleitung für den Tonfall basierend auf dem Kontext.
 */
const toneGuidanceMap: Record<string, string> = {
  familie: "familiär und herzlich, aber respektvoll",
  arbeit: "professionell und sachlich, aber menschlich",
  partnerschaft: "intim und liebevoll",
  kind: "einfach und altersgerecht",
  freunde: "entspannt und authentisch",
  allgemein: "höflich und ausgewogen"
};

const GFKTransform = async (input: string, openai: OpenAI, context?: any, retryCount = 0, systemPrompt?: string): Promise<any> => {
  try {
    // Kontext-spezifische Anpassungen
    let contextPrompt = '';
    let styleInstructions = '';
    let contextKey = 'allgemein';
    
    if (context) {
      // Verwende den neuen Kontext-Schlüssel oder fallback auf alten
      contextKey = context.relationship || context.context || 'allgemein';
      
      // Kontext-spezifische Beispiele hinzufügen
      if (contextKey && contextKey !== 'general') {
        contextPrompt = getContextPrompt(contextKey);
      } else if (context.contextExamples) {
        contextPrompt = `\n\n${context.contextExamples}\n\n`;
      }
      
      // Stil-Anweisungen basierend auf Kontext
      styleInstructions = toneGuidanceMap[contextKey] || toneGuidanceMap.allgemein;
    }

    const completion = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m",
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 520,
      messages: [
        {
          role: "system",
          content: systemPrompt || `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg.

**WICHTIGSTE REGEL - DIESE MUSS IMMER BEACHTET WERDEN:**
Der Text, den der Nutzer eingibt, ist IMMER eine Aussage, die der Nutzer SELBST sagen möchte oder gesagt hat. Der Nutzer ist IMMER der SPRECHER, niemals der Empfänger. Du sollst diese Aussage aus der Perspektive des Nutzers (als Sprecher) in GFK umformulieren.

**BEISPIEL:**
- Eingabe: "Ich hasse dich!"
- RICHTIGE Interpretation: Der Nutzer hat "Ich hasse dich!" gesagt und möchte das in GFK umformulieren
- FALSCH wäre: "Ich habe gehört, dass du 'Ich hasse dich!' gesagt hast..."

**Deine Aufgabe:**
Formuliere die vom Nutzer eingegebene Aussage in die vier GFK-Schritte um, wobei der Nutzer IMMER der Sprecher ist:
1. **Beobachtung:** Was hat der Nutzer konkret wahrgenommen?
2. **Gefühl:** Welches Gefühl löst das im Nutzer aus?
3. **Bedürfnis:** Welches unerfüllte Bedürfnis steckt dahinter?
4. **Bitte:** Was wünscht sich der Nutzer konkret?

**Ziel:** Auch aggressive Aussagen in konstruktive GFK-Form bringen, die die dahinterliegenden Gefühle und Bedürfnisse des Sprechers ausdrücken.

Der Ton sollte zum Kontext '${contextKey}' passen und ${styleInstructions} sein.

${contextPrompt}

**Antworte IMMER im folgenden JSON-Format:**
{
  "reformulated_text": "Vollständige GFK-Umformulierung als Fließtext aus der Sprecher-Perspektive",
  "observation": "Beobachtung des Sprechers",
  "feeling": "Gefühl des Sprechers", 
  "need": "Unerfülltes Bedürfnis des Sprechers",
  "request": "Konkrete, positive Bitte des Sprechers"
}`
        },
        {
          role: "user",
          content: input
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
    const requiredFields = ['reformulated_text', 'observation', 'feeling', 'need', 'request'];
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
          { pattern: /(?:weil mir weil|dass weil)/i, msg: 'Grammatikfehler' },
          // Neue Validierungen gegen Halluzination
          { pattern: /(?:gestern|heute|morgen|nächste Woche|letzte Woche)/i, msg: 'Zeitangaben ohne Kontext' },
          { pattern: /(?:im Büro|zu Hause|in der Schule|auf der Arbeit)/i, msg: 'Ortsangaben ohne Kontext' },
          { pattern: /(?:Projekt|Meeting|Termin|Aufgabe)/i, msg: 'Spezifische Begriffe ohne Kontext' }
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
      return GFKTransform(input, openai, context, retryCount + 1, systemPrompt);
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
    const body = await req.json();
    const { input, context, systemPrompt } = body;
    
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
    
    const parsedResponse = await GFKTransform(input, openai, context, 0, systemPrompt);
    
    // Add HTML spans for styling
    const styledResponse = {
      reformulated_text: `<span class='text-blue-600'>${parsedResponse.reformulated_text}</span>`,
      observation: `<span class='text-green-600'>${parsedResponse.observation}</span>`,
      feeling: `<span class='text-orange-600'>${parsedResponse.feeling}</span>`,
      need: `<span class='text-purple-600'>${parsedResponse.need}</span>`,
      request: `<span class='text-pink-600'>${parsedResponse.request}</span>`
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
