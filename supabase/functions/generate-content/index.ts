import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "npm:openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRequest {
  type: 'hero' | 'about' | 'features' | 'testimonial' | 'cta' | 'example';
  context?: string;
  tone?: 'professional' | 'friendly' | 'empathetic' | 'inspiring';
  length?: 'short' | 'medium' | 'long';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { type, context, tone = 'empathetic', length = 'medium' }: ContentRequest = await req.json();
    
    if (!type) {
      throw new Error('Content-Typ ist erforderlich.');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API Konfigurationsfehler.');
    }

    const openai = new OpenAI({ apiKey });

    const prompts = {
      hero: `Schreibe einen inspirierenden Hero-Text für GFKCoach, eine App für Gewaltfreie Kommunikation. 
      Der Text soll ${tone} und ${length} sein. Fokus auf Transformation von Kommunikation durch KI.
      Zielgruppe: Menschen, die ihre Kommunikation verbessern wollen.`,
      
      about: `Erkläre Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg auf eine ${tone} und ${length} Art.
      Fokus auf die 4 Schritte und warum GFK wichtig ist. Für eine Landing Page.`,
      
      features: `Liste die Hauptvorteile von GFKCoach auf - einer KI-App für Gewaltfreie Kommunikation.
      Stil: ${tone}, Länge: ${length}. Fokus auf praktischen Nutzen.`,
      
      testimonial: `Erstelle ein authentisches Testimonial für GFKCoach von einem zufriedenen Nutzer.
      Stil: ${tone}, Länge: ${length}. Soll echt und glaubwürdig klingen.`,
      
      cta: `Schreibe einen überzeugenden Call-to-Action für GFKCoach.
      Stil: ${tone}, Länge: ${length}. Soll zum Ausprobieren motivieren.`,
      
      example: `Erstelle ein Beispiel für GFK-Transformation: Ursprünglicher Text → GFK-Version.
      Stil: ${tone}, Länge: ${length}. Alltagssituation, die jeder kennt.`
    };

    const systemPrompt = `Du bist ein erfahrener Copywriter und GFK-Experte. 
    Schreibe authentische, menschliche Texte auf Deutsch.
    
    STIL-RICHTLINIEN:
    - ${tone === 'professional' ? 'Professionell aber zugänglich' : ''}
    - ${tone === 'friendly' ? 'Freundlich und einladend' : ''}
    - ${tone === 'empathetic' ? 'Einfühlsam und verständnisvoll' : ''}
    - ${tone === 'inspiring' ? 'Motivierend und inspirierend' : ''}
    
    LÄNGE:
    - ${length === 'short' ? '1-2 Sätze, prägnant' : ''}
    - ${length === 'medium' ? '3-5 Sätze, ausgewogen' : ''}
    - ${length === 'long' ? '6+ Sätze, ausführlich' : ''}
    
    Vermeide:
    - Übertreibungen oder Superlative
    - Technische Begriffe ohne Erklärung
    - Zu werbliche Sprache
    - Klischees
    
    Achte auf:
    - Natürliche, fließende Sprache
    - Emotionale Verbindung
    - Praktischen Nutzen
    - Deutsche Rechtschreibung und Grammatik`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompts[type] + (context ? `\n\nZusätzlicher Kontext: ${context}` : '') }
      ]
    });

    const content = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        content,
        type,
        tone,
        length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating content:', error);
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