import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";

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
    const { 
      originalInput, 
      gfkOutput, 
      userQuestion, 
      conversationHistory 
    } = await req.json();
    
    if (!userQuestion?.trim()) {
      throw new Error('Bitte stellen Sie eine Frage.');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API Konfigurationsfehler.');
    }

    const openai = new OpenAI({ apiKey });

    // Build conversation context
    const systemPrompt = `Du bist ein einfühlsamer GFK-Coach (Gewaltfreie Kommunikation nach Marshall Rosenberg). 

KONTEXT:
Der Nutzer hat folgenden ursprünglichen Text eingegeben: "${originalInput}"

Daraus wurde diese GFK-Formulierung erstellt:
- Beobachtung: ${gfkOutput.observation}
- Gefühl: ${gfkOutput.feeling}
- Bedürfnis: ${gfkOutput.need}
- Bitte: ${gfkOutput.request}

DEINE AUFGABE:
Beantworte Fragen des Nutzers zu dieser GFK-Transformation. Du kannst:
- Erklären, warum bestimmte Formulierungen gewählt wurden
- Alternative Formulierungen vorschlagen
- Die GFK-Prinzipien erläutern
- Tipps für ähnliche Situationen geben
- Helfen, die Kommunikation zu verfeinern

STIL:
- Antworte auf Deutsch
- Sei empathisch und verständnisvoll
- Erkläre GFK-Konzepte einfach und praxisnah
- Gib konkrete, umsetzbare Ratschläge
- Bleibe bei den 4 GFK-Schritten: Beobachtung, Gefühl, Bedürfnis, Bitte
- Vermeide Bewertungen oder Kritik

Antworte direkt und hilfreich auf die Frage des Nutzers.`;

    // Prepare messages for the conversation
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: "user", content: userQuestion }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1000,
      messages: messages as any
    });

    const response = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in GFK chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Ein unerwarteter Fehler ist aufgetreten.' 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});