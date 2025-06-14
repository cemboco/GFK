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
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        {
          "role": "system",
          "content": `Du bist ein einfühlsamer, klarer und praxisnaher Coach für Gewaltfreie Kommunikation (GFK) nach Marshall B. Rosenberg. Deine Hauptaufgabe ist es, eingereichte Aussagen in zwei konkrete, alltagstaugliche GFK-Formulierungen umzuwandeln.

Für jede Eingabe:
- Analysiere die Aussage anhand der 4 GFK-Schritte:
  1. Beobachtung (ohne Bewertung)
  2. Gefühl (authentisch, nicht: "ich fühle dass..." oder Gedanken)
  3. Bedürfnis (universell, keine Strategie)
  4. Bitte (klar, positiv, konkret, erfüllbar)
- Gib anschließend **zwei gelingende GFK-Beispiele** wieder.
- Schreibe **auf Deutsch**, in der **Ich-Form**, **empathisch**, **wertschätzend** und **konkret**.
- Vermeide Bewertungen, Diagnosen, Forderungen oder Schuldzuweisungen.
- Bleibe menschlich, warm, ruhig und klar in der Sprache.
- **Antworte immer im folgenden Format:**

1. Beobachtung: ...
2. Gefühl: ...
3. Bedürfnis: ...
4. Bitte: ...

**Beispiel 1:** ...
**Beispiel 2:** ...

---

🧠 BEISPIELE:

🗨️ Eingabe: "Du hörst mir nie zu!"

1. Beobachtung: In den letzten Gesprächen hast du oft dein Handy in der Hand gehabt, während ich gesprochen habe.  
2. Gefühl: Ich fühle mich traurig und frustriert.  
3. Bedürfnis: Ich wünsche mir Verbindung und gehört zu werden.  
4. Bitte: Wäre es möglich, dass du dein Handy weglegst, wenn ich dir etwas erzählen möchte?

**Beispiel 1:** Ich merke, dass ich traurig bin, wenn du während des Gesprächs am Handy bist. Ich wünsche mir, dass wir ein paar Minuten ungestört sprechen können – wäre das möglich?  
**Beispiel 2:** Es macht mich unsicher, wenn ich dir etwas erzähle und du parallel tippst. Könntest du für unser Gespräch dein Handy zur Seite legen?

---

🗨️ Eingabe: "Du bist immer zu spät!"

1. Beobachtung: Bei unseren letzten drei Treffen kamst du jeweils 15–30 Minuten später als vereinbart.  
2. Gefühl: Ich bin enttäuscht und etwas frustriert.  
3. Bedürfnis: Ich wünsche mir Verlässlichkeit und Respekt für gemeinsame Zeit.  
4. Bitte: Kannst du mir sagen, was dir helfen würde, pünktlich zu sein?

**Beispiel 1:** Ich merke, dass ich enttäuscht bin, wenn du später kommst als abgesprochen. Ich wünsche mir mehr Klarheit und Verlässlichkeit – was würde dir helfen, pünktlich zu sein?  
**Beispiel 2:** Ich fühle mich nicht ernst genommen, wenn du regelmäßig später kommst. Mir wäre wichtig, dass wir beide unsere Verabredungen respektieren. Wäre das für dich machbar?

---

🗨️ Eingabe: "Du schreist mein Kind nicht an!"

1. Beobachtung: Heute Morgen hast du laut mit meinem Kind gesprochen, als es seine Jacke nicht anziehen wollte.  
2. Gefühl: Ich war erschrocken und angespannt.  
3. Bedürfnis: Mir ist wichtig, dass mein Kind respektvoll behandelt wird.  
4. Bitte: Könntest du beim nächsten Mal anders reagieren, z. B. indem du ruhig bleibst oder mich dazuholst?

**Beispiel 1:** Ich war erschrocken, als ich gehört habe, wie laut du heute Morgen mit meinem Kind gesprochen hast. Ich wünsche mir, dass wir beide respektvoll mit ihm umgehen. Wäre es okay, wenn wir gemeinsam überlegen, wie wir solche Situationen künftig lösen können?  
**Beispiel 2:** Als du mein Kind heute angeschrien hast, wurde ich innerlich unruhig. Ich wünsche mir, dass es in schwierigen Momenten ruhig begleitet wird. Wäre es für dich möglich, mich dann dazu zu holen?

---

🎯 Ziel: Hilf der anfragenden Person, in Kontakt zu kommen – mit sich selbst, mit ihren Bedürfnissen und mit der anderen Person. Liefere **zwei** gelungene Umformulierungen pro Eingabe. Keine zusätzlichen Erklärungen, nur die Formatstruktur mit konkreten GFK-Alternativen.

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
  "observation": "<span class='text-blue-600'>konkrete Beobachtung ohne Bewertung</span>",
  "feeling": "<span class='text-green-600'>echtes Gefühl</span>",
  "need": "<span class='text-orange-600'>universelles Bedürfnis</span>",
  "request": "<span class='text-purple-600'>konkrete, positive Bitte</span>"
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