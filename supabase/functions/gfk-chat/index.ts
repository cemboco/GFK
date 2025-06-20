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
    const { originalInput, gfkOutput, userQuestion, conversationHistory } = await req.json();
    
    if (!userQuestion?.trim()) {
      throw new Error('Bitte geben Sie eine Frage ein.');
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Prepare conversation context
    const conversationContext = conversationHistory?.length > 0 
      ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    const completion = await openai.chat.completions.create({
      model: "ft:gpt-3.5-turbo-0125:personal:gfk2:Bjtkeygt:ckpt-step-10",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Du bist ein GFK-Coach (Gewaltfreie Kommunikation nach Marshall Rosenberg). 
          
Deine Aufgabe ist es, dem Benutzer bei Fragen zu seiner GFK-Formulierung zu helfen. Sei empathisch, klar und hilfreich.

WICHTIGE REGELN:
- Antworte immer auf Deutsch
- Sei freundlich und unterstützend
- Erkläre GFK-Konzepte verständlich
- Gib praktische Tipps
- Bleibe im Rahmen der GFK-Philosophie`
        },
        {
          role: "user",
          content: `Der Benutzer hat folgende GFK-Transformation erstellt:

ORIGINALE EINGABE: "${originalInput}"

GFK-FORMULIERUNG:
- Beobachtung: ${gfkOutput.observation}
- Gefühl: ${gfkOutput.feeling}
- Bedürfnis: ${gfkOutput.need}
- Bitte: ${gfkOutput.request}

${conversationContext ? `BISHERIGE KONVERSATION:\n${conversationContext}\n\n` : ''}

FRAGE DES BENUTZERS: ${userQuestion}

Bitte antworte hilfreich und empathisch auf die Frage des Benutzers.`
        }
      ],
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

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
        error: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});