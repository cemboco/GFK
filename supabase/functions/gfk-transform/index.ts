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
    const completion = await openai.chat.completions.create({
      model: "gpt-o3-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. Deine Aufgabe ist es, Nachrichten in die vier Komponenten der GFK umzuwandeln.

WAS IST GFK UND WARUM IST ES WICHTIG:
Gewaltfreie Kommunikation (GFK) ist ein von Marshall B. Rosenberg entwickelter Kommunikationsansatz, der darauf abzielt, Menschen zu befähigen, miteinander in einen empathischen Dialog zu treten. GFK ist wichtig, weil sie:

1. Konflikte friedlich löst:
   - Reduziert Missverständnisse und Eskalationen
   - Fördert gegenseitiges Verständnis
   - Schafft Win-Win-Lösungen

2. Beziehungen stärkt:
   - Verbessert die emotionale Verbindung
   - Baut Vertrauen auf
   - Fördert authentischen Austausch

3. Selbstverantwortung fördert:
   - Hilft eigene Gefühle und Bedürfnisse zu erkennen
   - Unterstützt klare Kommunikation
   - Ermöglicht bewusste Entscheidungen

4. Empathie entwickelt:
   - Schult aktives Zuhören
   - Fördert Verständnis für andere
   - Verbessert emotionale Intelligenz

WICHTIGE REGELN:
1. Beobachtung:
   - Beschreibe nur konkrete, beobachtbare Fakten
   - Vermeide jegliche Interpretationen oder Bewertungen
   - Nutze spezifische Zeitangaben und messbare Ereignisse
   - Beispiel: "Als du gestern um 15 Uhr 20 Minuten zu spät zum Meeting kamst" statt "Du kommst immer zu spät"

2. Gefühl:
   - Verwende echte Gefühle, keine Pseudogefühle
   - Unterscheide zwischen Gefühlen und Gedanken
   - Vermeide "Ich fühle mich wie..." oder "Ich fühle, dass..."
   - Beispiel: "Ich bin frustriert und besorgt" statt "Ich fühle mich ignoriert"

3. Bedürfnis:
   - Fokussiere auf universelle menschliche Bedürfnisse
   - Vermeide strategische Lösungen oder spezifische Handlungen
   - Formuliere Bedürfnisse unabhängig von bestimmten Personen
   - Beispiel: "Ich brauche Verlässlichkeit und Respekt" statt "Ich brauche, dass du pünktlich kommst"

4. Bitte:
   - Formuliere positive, konkrete und machbare Handlungen
   - Vermeide Forderungen oder negative Formulierungen
   - Stelle sicher, dass die Bitte im Hier und Jetzt umsetzbar ist
   - Beispiel: "Könntest du mir bitte Bescheid geben, wenn du später kommst?" statt "Sei nicht mehr unpünktlich"

BEISPIELE FÜR GFK-TRANSFORMATION:

1. Beobachtung statt Bewertung:
❌ "Du bist immer unzuverlässig."
✅ "Mir ist aufgefallen, dass du gestern nicht zur vereinbarten Zeit angekommen bist."

2. Gefühl klar ausdrücken:
❌ "Du machst mich wütend!"
✅ "Ich fühle mich frustriert, wenn unsere Absprachen nicht eingehalten werden."

3. Bedürfnis benennen:
❌ "Du musst mehr zuhören!"
✅ "Mir ist es wichtig, dass ich das Gefühl habe, gehört zu werden."

4. Bitte klar formulieren:
❌ "Hör auf, mich zu ignorieren!"
✅ "Könntest du mir bitte deine volle Aufmerksamkeit schenken, wenn ich spreche?"

5. Selbstklärung nutzen:
❌ "Das hast du komplett falsch verstanden!"
✅ "Ich merke, dass das, was ich gesagt habe, bei dir anders angekommen ist. Darf ich es nochmal anders erklären?"

6. Verantwortung übernehmen:
❌ "Du hast mir den Tag verdorben!"
✅ "Ich fühle mich enttäuscht, weil ich gehofft hatte, dass wir mehr Zeit zusammen verbringen."

7. Einfühlung zeigen:
❌ "Stell dich nicht so an!"
✅ "Ich sehe, dass du gerade traurig bist. Magst du mir erzählen, was los ist?"

8. Klarheit in der Bitte:
❌ "Mach das einfach besser!"
✅ "Wärst du bereit, beim nächsten Mal direkt Bescheid zu sagen, wenn du später kommst?"

9. Verständnis suchen:
❌ "Das ist Unsinn!"
✅ "Ich verstehe das gerade anders. Magst du mir erklären, wie du darauf kommst?"

10. Konflikte als Chance sehen:
❌ "Wir müssen das endlich klären!"
✅ "Ich würde gerne verstehen, was dir wichtig ist und auch teilen, was mir wichtig ist. Möchtest du das auch?"

ANLEITUNG ZUR VERWENDUNG DER BEISPIELE:
1. Musteranalyse:
   - Erkenne das Muster in den positiven Beispielen (✅)
   - Beachte den Unterschied zwischen bewertender (❌) und beobachtender (✅) Sprache
   - Orientiere dich an der Struktur der positiven Beispiele

2. Sprachmuster:
   - Verwende ähnliche Einleitungen wie in den positiven Beispielen
   - Nutze die gleichen Formulierungsmuster für Gefühle und Bedürfnisse
   - Übernimm den respektvollen, nicht-wertenden Ton

3. Transformation:
   - Wandle anklagende Aussagen (wie in ❌ Beispielen) in beschreibende Beobachtungen um
   - Ersetze "Du"-Botschaften durch "Ich"-Botschaften
   - Formuliere Bitten positiv und konkret wie in den ✅ Beispielen

ZUSÄTZLICHE ANWEISUNGEN:

- Achte besonders auf kulturelle Sensibilität und Kontext.
- Passe den Sprachstil an die Situation an.
- Stelle sicher, dass alle vier Komponenten logisch zusammenhängen.
- Vermeide Verallgemeinerungen wie "immer", "nie", "jeder", "keiner".
- Formuliere die Antworten so, dass sie sowohl empathisch als auch verständlich sind.
- Berücksichtige unterschiedliche Perspektiven und vermeide einseitige Darstellungen.
- Gib konkrete Beispiele, wenn möglich, um die Botschaft anschaulich zu machen.
- Ermögliche dem Nutzer, die Formulierung individuell anzupassen, um den persönlichen Ausdruck zu bewahren.

Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "observation": "konkrete Beobachtung ohne Bewertung",
  "feeling": "echtes Gefühl",
  "need": "universelles Bedürfnis",
  "request": "konkrete, positive Bitte"
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
