import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { input, systemPrompt, context } = await req.json();
    
    if (!input?.trim()) {
      throw new Error('Bitte geben Sie einen Text ein.');
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
      max_tokens: 520,
      messages: [
        {
          role: "system",
          content: systemPrompt || `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg.

**WICHTIGSTE REGEL:**
Der Nutzer ist der SPRECHER. Formuliere seine Aussage in GFK um.

**Deine Aufgabe:**
Formuliere die Aussage in die vier GFK-Schritte um:
1. Beobachtung: Was hat der Nutzer wahrgenommen?
2. Gefühl: Welches Gefühl hat der Nutzer?
3. Bedürfnis: Welches Bedürfnis steckt dahinter?
4. Bitte: Was wünscht sich der Nutzer?

**Antworte im JSON-Format:**
{
  "reformulated_text": "Vollständiger GFK-Text",
  "observation": "Beobachtung",
  "feeling": "Gefühl", 
  "need": "Bedürfnis",
  "request": "Bitte"
}`
        },
        {
          role: "user",
          content: input
        }
      ]
    });

    // DEBUG: Log den tatsächlich verwendeten systemPrompt
    console.log("DEBUG - Verwendeter systemPrompt:", systemPrompt ? "CUSTOM" : "FALLBACK");
    if (systemPrompt) {
      console.log("DEBUG - Custom systemPrompt Länge:", systemPrompt.length);
      console.log("DEBUG - Custom systemPrompt (erste 200 Zeichen):", systemPrompt.substring(0, 200));
    }

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

    // Sehr einfache Validierung - nur prüfen ob Felder existieren
    const requiredFields = ['reformulated_text', 'observation', 'feeling', 'need', 'request'];
    const missingFields = requiredFields.filter(field => !parsedResponse[field] || typeof parsedResponse[field] !== 'string');
    
    if (missingFields.length > 0) {
      console.log("Fehlende Felder:", missingFields);
      
      // Fallback-Werte für fehlende Felder
      if (!parsedResponse.reformulated_text) {
        parsedResponse.reformulated_text = "GFK-Umformulierung";
      }
      
      if (!parsedResponse.observation) {
        parsedResponse.observation = "Ich beobachte die Situation";
      }
      
      if (!parsedResponse.feeling) {
        parsedResponse.feeling = "Ich fühle mich betroffen";
      }
      
      if (!parsedResponse.need) {
        parsedResponse.need = "Ich brauche Verständnis";
      }
      
      if (!parsedResponse.request) {
        parsedResponse.request = "Können wir darüber sprechen?";
      }
      
      console.log("Fallback-Werte gesetzt");
    }

    return parsedResponse;

  } catch (error) {
    console.error("GFK-Transformationsfehler:", error);
    console.error("Input:", input);
    console.error("Context:", context);
    console.error("RetryCount:", retryCount);
    
    // Automatischer Wiederholungsmechanismus
    if (error.message.includes('Validierungsfehler') && retryCount < 2) {
      console.log(`Wiederholungsversuch ${retryCount + 1}/2`);
      return GFKTransform(input, openai, context, retryCount + 1, systemPrompt);
    }
    
    // Spezifischere Fehlermeldungen
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      throw new Error("API-Limit erreicht. Bitte versuchen Sie es später erneut.");
    }
    
    if (error.message.includes('timeout')) {
      throw new Error("Zeitüberschreitung. Bitte versuchen Sie es erneut.");
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.");
    }
    
    // Fallback: Versuche mit einfacherem Prompt
    if (retryCount === 0) {
      console.log("Versuche mit vereinfachtem Prompt...");
      const simplePrompt = `Du bist ein GFK-Experte. Formuliere den gegebenen Text in GFK um.

WICHTIG: Antworte NUR in gültigem JSON-Format!

{
  "reformulated_text": "Vollständiger GFK-Text",
  "observation": "Beobachtung",
  "feeling": "Gefühl", 
  "need": "Bedürfnis",
  "request": "Bitte"
}`;
      
      return GFKTransform(input, openai, context, retryCount + 1, simplePrompt);
    }
    
    throw new Error("GFK-Transformation fehlgeschlagen. Bitte Eingabe überprüfen oder neu formulieren.");
  }
};

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

const getContextPrompt = (contextKey: string): string => {
  // Hier würden die kontextspezifischen Beispiele eingefügt
  // Dies ist ein Platzhalter - in einer realen Implementierung würden hier
  // Beispiele für verschiedene Kontexte zurückgegeben
  return `\n\nBeispiele für den Kontext "${contextKey}":\n` +
    `Wenn ich sehe, dass du zu spät kommst, fühle ich mich frustriert, weil mir Pünktlichkeit wichtig ist. Könntest du mir bitte Bescheid geben, wenn du dich verspätest?`;
};