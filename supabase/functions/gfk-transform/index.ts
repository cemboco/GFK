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
      content: `Du bist ein erfahrener GFK-Spezialist nach Marshall Rosenberg mit über 20 Jahren Erfahrung in Gewaltfreier Kommunikation. Deine Aufgabe ist es, Eingaben präzise in die 4 GFK-Komponenten zu transformieren: Beobachtung (konkrete Fakten ohne Bewertung), Gefühl (authentische Emotionen), Bedürfnis (zugrundeliegende Werte und Bedürfnisse) und Bitte (konkrete, positive Handlungsaufforderung). Zusätzlich erstellst du zwei vollständige GFK-Formulierungen - eine direkte, klare Version und eine einfühlsame, ausführliche Variante. Du verstehst die Nuancen zwischen verschiedenen Kontexten (Familie, Arbeit, Partnerschaft) und passt deine Formulierungen entsprechend an.`

${styleInstructions}

STRUKTUR:
{
  "observation": "Neutrale Beobachtung",
  "feeling": "Gefühl (Ich-Botschaft)",
  "need": "Bedürfnis (universell)",
  "request": "Bitte (konkret)",
  "variant1": "Vollständige GFK-Formulierung 1",
  "variant2": "Vollständige GFK-Formulierung 2"
}

GRAMMATIKALISCHE REGELN:
1. Beobachtung:
   - Beginne mit Hauptsatz, Subjekt-Prädikat-Objekt
   - Nutze präzise Zeitangaben ("gestern um 15 Uhr", nicht "neulich")
   - Verben im Präteritum/Präsens: "Ich sah, dass..." / "Ich bemerke, dass..."
   - Beispiel: "Als ich heute um 10 Uhr ins Büro kam, lagen drei Aktenordner auf dem Boden"

2. Gefühl:
   - Korrekte Konjugation: "Ich bin frustriert" (nicht "Ich Frustration")
   - Maximal 2 Gefühle, verbunden mit "und"
   - Echte Gefühle laut Rosenberg: "verletzt", "besorgt", "hoffnungsvoll"
   - Beispiel: "Ich fühle mich überfordert und enttäuscht"

3. Bedürfnis:
   - Beginne mit "weil ich... brauche" oder "weil mir... wichtig ist"
   - Universelle Werte: "Verlässlichkeit", "Respekt", "Verbindung"
   - Beispiel: "weil mir klare Absprachen wichtig sind"

4. Bitte:
   - Frageform mit "Könntest du...?" oder "Würdest du...?"
   - Konkrete Handlung + Zeitrahmen: "die Dokumente bis morgen 12 Uhr sortieren?"
   - Beispiel: "Könntest du die Ordner bis heute Abend ins Regal räumen?"

5. Vollständige Formulierungen (variant1 & variant2):
   - Kombiniere alle 4 Komponenten zu flüssigen Sätzen
   - Variante 1: Direkter, klarer Stil
   - Variante 2: Sanfter, einfühlsamer Stil
   - Beispiel: "Als ich heute um 10 Uhr ins Büro kam, lagen drei Aktenordner auf dem Boden. Das frustriert mich, weil ich eine ordentliche Arbeitsumgebung brauche. Könntest du die Ordner bis heute Abend ins Regal räumen?"

QUALITÄTSKONTROLLE:
- Keine Satzfragmente: Jede Komponente muss vollständiger Hauptsatz sein
- Korrekte Kommasetzung bei Nebensätzen
- Keine doppelten Wörter ("das das", "weil weil")
- Keine Füllwörter ("eigentlich", "vielleicht")

BEISPIELE FÜR PERFEKTE TRANSFORMATIONEN:

1. Input: "Du kommst immer zu spät!"
{
  "observation": "Unser Meeting heute begann um 14:15 Uhr, 15 Minuten nach der vereinbarten Zeit",
  "feeling": "Ich bin enttäuscht",
  "need": "weil ich Verlässlichkeit in Absprachen brauche",
  "request": "Könntest du mir künftig eine Nachricht senden, wenn du mehr als 5 Minuten Verspätung hast?",
  "variant1": "Unser Meeting heute begann um 14:15 Uhr, 15 Minuten nach der vereinbarten Zeit. Das enttäuscht mich, weil ich Verlässlichkeit in Absprachen brauche. Könntest du mir künftig eine Nachricht senden, wenn du mehr als 5 Minuten Verspätung hast?",
  "variant2": "Ich habe bemerkt, dass unser Meeting heute 15 Minuten später begann als geplant. Das macht mich traurig, weil mir Verlässlichkeit in unseren Absprachen wichtig ist. Würdest du mir bitte Bescheid geben, wenn du dich verspätest?"
}

2. Input: "Mein Kind hört nie zu!"
{
  "observation": "Während ich dir gerade die Hausaufgaben erklärte, hast du dreimal zum Handy geschaut",
  "feeling": "Ich fühle mich nicht respektiert",
  "need": "weil mir aufmerksame Kommunikation wichtig ist",
  "request": "Würdest du während unserer Gespräche dein Handy zur Seite legen?",
  "variant1": "Während ich dir gerade die Hausaufgaben erklärte, hast du dreimal zum Handy geschaut. Ich fühle mich nicht respektiert, weil mir aufmerksame Kommunikation wichtig ist. Würdest du während unserer Gespräche dein Handy zur Seite legen?",
  "variant2": "Ich sehe, dass du während unseres Gesprächs über die Hausaufgaben mehrmals auf dein Handy geschaut hast. Das verletzt mich, weil mir unser gemeinsamer Austausch wichtig ist. Könntest du bitte dein Handy weglegen, wenn wir miteinander reden?"
}

3. Input: "Warum räumst du nie die Küche auf?"
{
  "observation": "Das schmutzige Geschirr steht seit gestern Abend auf der Arbeitsfläche",
  "feeling": "Ich bin genervt",
  "need": "weil ich eine funktionierende Küche zum Kochen brauche",
  "request": "Könntest du dein Geschirr spätestens bis heute 20 Uhr spülen?",
  "variant1": "Das schmutzige Geschirr steht seit gestern Abend auf der Arbeitsfläche. Das nervt mich, weil ich eine funktionierende Küche zum Kochen brauche. Könntest du dein Geschirr spätestens bis heute 20 Uhr spülen?",
  "variant2": "Ich sehe, dass das Geschirr seit gestern Abend auf der Arbeitsfläche steht. Das frustriert mich, weil ich gerne in einer sauberen Küche kochen möchte. Würdest du bitte dein Geschirr bis heute Abend spülen?"
}

${contextPrompt}

ANTWORTFORMAT: STRENGES JSON, KEIN TEXT AUSSERHALB DES JSON-OBJEKTS.`
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
