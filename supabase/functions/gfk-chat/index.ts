import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { originalInput, gfkOutput, userQuestion, conversationHistory, lang = 'de' } = await req.json();
    
    if (!userQuestion?.trim()) {
      throw new Error(errorTexts.emptyInput[lang] || errorTexts.emptyInput.de);
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Prepare conversation context
    const conversationContext = conversationHistory?.length > 0 
      ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    const completion = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-0125:personal:gfk2:BjtkeU8m",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompts.default[lang]
        },
        {
          role: "user",
          content: (lang === 'en'
            ? `The user has created the following NVC transformation:

ORIGINAL INPUT: "${originalInput}"

NVC FORMULATION:
- Observation: ${gfkOutput.observation}
- Feeling: ${gfkOutput.feeling}
- Need: ${gfkOutput.need}
- Request: ${gfkOutput.request}

${conversationContext ? `PREVIOUS CONVERSATION:\n${conversationContext}\n\n` : ''}

USER QUESTION: ${userQuestion}

Please answer the user's question helpfully and empathetically.`
            : `Der Benutzer hat folgende GFK-Transformation erstellt:

ORIGINALE EINGABE: "${originalInput}"

GFK-FORMULIERUNG:
- Beobachtung: ${gfkOutput.observation}
- Gefühl: ${gfkOutput.feeling}
- Bedürfnis: ${gfkOutput.need}
- Bitte: ${gfkOutput.request}

${conversationContext ? `BISHERIGE KONVERSATION:\n${conversationContext}\n\n` : ''}

FRAGE DES BENUTZERS: ${userQuestion}

Bitte antworte hilfreich und empathisch auf die Frage des Benutzers.`)
        }
      ],
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || defaultAnswers.noAnswer[lang];

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in gfk-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : errorTexts.unexpected[lang] || errorTexts.unexpected.de
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

const errorTexts = {
  emptyInput: {
    de: 'Bitte geben Sie eine Frage ein.',
    en: 'Please enter a question.'
  },
  unexpected: {
    de: 'Ein unbekannter Fehler ist aufgetreten.',
    en: 'An unknown error occurred.'
  }
};

const defaultAnswers = {
  noAnswer: {
    de: 'Entschuldigung, ich konnte keine Antwort generieren.',
    en: 'Sorry, I could not generate an answer.'
  }
};

const systemPrompts = {
  default: {
    de: `Du bist ein GFK-Coach (Gewaltfreie Kommunikation nach Marshall Rosenberg).

Deine Aufgabe ist es, dem Benutzer bei Fragen zu seiner GFK-Formulierung zu helfen. Sei empathisch, klar und hilfreich.

WICHTIGE REGELN:
- Antworte immer auf Deutsch
- Sei freundlich und unterstützend
- Erkläre GFK-Konzepte verständlich
- Gib praktische Tipps
- Bleibe im Rahmen der GFK-Philosophie`,
    en: `You are an NVC coach (Nonviolent Communication according to Marshall Rosenberg).

Your task is to help the user with questions about their NVC formulation. Be empathetic, clear, and helpful.

IMPORTANT RULES:
- Always answer in English
- Be friendly and supportive
- Explain NVC concepts clearly
- Give practical tips
- Stay within the NVC philosophy`
  }
};