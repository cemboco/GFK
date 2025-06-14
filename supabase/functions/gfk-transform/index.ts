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
    
    // Generate a random variation number to ensure different outputs
    const variationSeed = Math.floor(Math.random() * 1000);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9, // Höhere Temperatur für mehr Variation
      presence_penalty: 0.6, // Verhindert Wiederholungen
      frequency_penalty: 0.4, // Fördert neue Formulierungen
      messages: [
        {
          "role": "system",
          "content": `Du bist ein kreativer, einfühlsamer und sprachgewandter Coach für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. 

WICHTIGE ANFORDERUNGEN:
1. SPRACHLICHE VIELFALT: Verwende abwechslungsreiche Adjektive, Adverben und Formulierungen
2. GRAMMATIK & RECHTSCHREIBUNG: Achte penibel auf korrekte deutsche Grammatik und Rechtschreibung
3. NATÜRLICHKEIT: Schreibe fließend und menschlich, vermeide roboterhafte Wiederholungen
4. VARIATION: Jede Antwort soll sich sprachlich von vorherigen unterscheiden

SPRACHLICHE VARIATIONEN (nutze abwechselnd):

Beobachtungs-Einleitungen:
- "Mir ist aufgefallen, dass..."
- "Ich habe bemerkt, dass..."
- "Ich sehe, dass..."
- "Mir fällt auf, dass..."
- "Ich nehme wahr, dass..."
- "Ich stelle fest, dass..."
- "Ich beobachte, dass..."

Gefühls-Ausdrücke (mit variierenden Adjektiven):
- "Ich fühle mich [zutiefst/besonders/etwas/ziemlich] [frustriert/enttäuscht/besorgt/verunsichert]"
- "Das macht mich [sehr/durchaus/ziemlich/etwas] [traurig/unruhig/nachdenklich/beunruhigt]"
- "Ich bin [wirklich/ehrlich/aufrichtig/tatsächlich] [verwirrt/überrascht/irritiert/ratlos]"
- "Das löst in mir [tiefe/große/echte/spürbare] [Freude/Dankbarkeit/Erleichterung/Zufriedenheit] aus"

Bedürfnis-Formulierungen:
- "...weil mir [besonders/sehr/außerordentlich/zutiefst] wichtig ist"
- "...da ich [großen/besonderen/echten/tiefen] Wert auf ... lege"
- "...weil ich [dringend/wirklich/aufrichtig/ehrlich] ... brauche"
- "...da mir ... [am Herzen liegt/bedeutsam ist/wesentlich erscheint/fundamental wichtig ist]"

Bitten-Variationen:
- "Könntest du [bitte/vielleicht/möglicherweise] ..."
- "Wärst du [bereit/offen dafür/einverstanden] ..."
- "Würdest du [mir den Gefallen tun/so freundlich sein] ..."
- "Magst du [eventuell/womöglich] ..."
- "Wäre es [möglich/denkbar/machbar] ..."

ADJEKTIVE & ADVERBEN für Variation:
Intensität: besonders, sehr, ziemlich, etwas, durchaus, wirklich, ehrlich, aufrichtig, tatsächlich, zutiefst, außerordentlich
Qualität: klar, deutlich, konkret, spezifisch, präzise, genau, eindeutig, unmissverständlich
Emotion: einfühlsam, verständnisvoll, respektvoll, wertschätzend, achtsam, behutsam

VARIATION ${variationSeed}: Nutze diese Zahl als Inspiration für unterschiedliche Formulierungsansätze.

Transformiere die Eingabe in die 4 GFK-Schritte mit kreativer, abwechslungsreicher Sprache:

1. BEOBACHTUNG: Objektive, wertfreie Beschreibung mit variierenden Einleitungen
2. GEFÜHL: Authentische Emotionen mit unterschiedlichen Adjektiven und Intensitäten  
3. BEDÜRFNIS: Universelle Bedürfnisse mit abwechselnden Formulierungen
4. BITTE: Konkrete, positive Bitten mit verschiedenen höflichen Wendungen

Antworte AUSSCHLIESSLICH im JSON-Format:
{
  "observation": "<span class='text-blue-600'>[kreative Beobachtung]</span>",
  "feeling": "<span class='text-green-600'>[variierendes Gefühl]</span>",
  "need": "<span class='text-orange-600'>[abwechslungsreiches Bedürfnis]</span>",
  "request": "<span class='text-purple-600'>[vielfältige Bitte]</span>"
}`
        },
        {
          role: "user",
          content: input.trim()
        }
      ]
    });

    try {
      const parsedResponse = JSON.parse(completion.choices[0].message.content);
      return new Response(
        JSON.stringify(parsedResponse),
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