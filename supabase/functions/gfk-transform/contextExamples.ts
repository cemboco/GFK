export const contextExamples = {
  child: [
    {
      input: "Du machst nie deine Hausaufgaben!",
      output: {
        observation: "Ich sehe, dass deine Hausaufgaben noch nicht gemacht sind.",
        feeling: "Ich mache mir Sorgen um deine schulische Entwicklung.",
        need: "Mir ist wichtig, dass du in der Schule gut vorankommst.",
        request: "Können wir zusammen einen Plan machen, wann du deine Hausaufgaben machst?"
      }
    },
    {
      input: "Du hörst nie zu!",
      output: {
        observation: "Ich merke, dass du während unseres Gesprächs abgelenkt bist.",
        feeling: "Ich fühle mich traurig, weil ich denke, dass dir nicht wichtig ist, was ich sage.",
        need: "Mir ist wichtig, dass wir uns gut verstehen und miteinander reden können.",
        request: "Kannst du mir bitte in die Augen schauen, wenn ich mit dir rede?"
      }
    },
    {
      input: "Du bist so unordentlich!",
      output: {
        observation: "Ich sehe, dass dein Zimmer sehr unordentlich ist.",
        feeling: "Ich fühle mich frustriert, weil ich denke, dass du nicht auf unsere gemeinsame Wohnung achtest.",
        need: "Mir ist wichtig, dass wir in einer sauberen und angenehmen Umgebung leben.",
        request: "Können wir zusammen dein Zimmer aufräumen?"
      }
    }
  ],
  
  business: [
    {
      input: "Das ist nicht mein Problem!",
      output: {
        observation: "Ich höre, dass du sagst, diese Angelegenheit falle nicht in deinen Verantwortungsbereich.",
        feeling: "Ich fühle mich frustriert, weil ich eine Lösung für dieses Problem brauche.",
        need: "Mir ist wichtig, dass wir gemeinsam eine Lösung finden.",
        request: "Können wir zusammen überlegen, wer für diese Angelegenheit zuständig ist?"
      }
    },
    {
      input: "Das können wir nicht machen!",
      output: {
        observation: "Du lehnst meinen Vorschlag kategorisch ab.",
        feeling: "Ich fühle mich enttäuscht, weil ich dachte, mein Vorschlag hätte Potenzial.",
        need: "Mir ist wichtig, dass wir konstruktiv zusammenarbeiten und Lösungen finden.",
        request: "Kannst du mir bitte erklären, welche Bedenken du hast?"
      }
    },
    {
      input: "Das ist nicht meine Schuld!",
      output: {
        observation: "Du weist die Verantwortung für dieses Problem von dir.",
        feeling: "Ich fühle mich frustriert, weil ich eine Lösung brauche, nicht Schuldzuweisungen.",
        need: "Mir ist wichtig, dass wir das Problem gemeinsam lösen.",
        request: "Können wir uns darauf konzentrieren, wie wir das Problem beheben können?"
      }
    }
  ],
  
  partner: [
    {
      input: "Du hörst mir nie zu!",
      output: {
        observation: "Ich merke, dass du während unserer Gespräche oft abgelenkt bist.",
        feeling: "Ich fühle mich traurig und nicht wichtig genommen.",
        need: "Mir ist wichtig, dass wir uns gegenseitig zuhören und verstehen.",
        request: "Kannst du mir bitte deine volle Aufmerksamkeit schenken, wenn ich mit dir rede?"
      }
    },
    {
      input: "Du bist nie da für mich!",
      output: {
        observation: "Ich merke, dass du oft nicht verfügbar bist, wenn ich dich brauche.",
        feeling: "Ich fühle mich alleingelassen und nicht unterstützt.",
        need: "Mir ist wichtig, dass wir uns gegenseitig unterstützen und füreinander da sind.",
        request: "Kannst du mir bitte mehr Zeit schenken, wenn ich dich brauche?"
      }
    },
    {
      input: "Du bist so egoistisch!",
      output: {
        observation: "Ich merke, dass du oft nur an dich denkst und meine Bedürfnisse nicht berücksichtigst.",
        feeling: "Ich fühle mich verletzt und nicht wichtig genommen.",
        need: "Mir ist wichtig, dass wir uns gegenseitig respektieren und unterstützen.",
        request: "Kannst du bitte auch an meine Bedürfnisse denken?"
      }
    }
  ],
  
  colleague: [
    {
      input: "Das ist nicht mein Job!",
      output: {
        observation: "Ich höre, dass du sagst, diese Aufgabe gehöre nicht zu deinen Pflichten.",
        feeling: "Ich fühle mich frustriert, weil ich dachte, wir könnten uns gegenseitig unterstützen.",
        need: "Mir ist wichtig, dass wir als Team zusammenarbeiten.",
        request: "Können wir zusammen klären, wie wir die Arbeit fair aufteilen können?"
      }
    },
    {
      input: "Das ist nicht mein Problem!",
      output: {
        observation: "Du weist die Verantwortung für diese Situation von dir.",
        feeling: "Ich fühle mich alleingelassen, weil ich dachte, wir arbeiten als Team.",
        need: "Mir ist wichtig, dass wir gemeinsam Verantwortung übernehmen.",
        request: "Können wir zusammen überlegen, wie wir das Problem lösen können?"
      }
    },
    {
      input: "Das ist nicht meine Schuld!",
      output: {
        observation: "Du weist die Schuld für diesen Fehler von dir.",
        feeling: "Ich fühle mich frustriert, weil ich eine Lösung brauche, nicht Schuldzuweisungen.",
        need: "Mir ist wichtig, dass wir das Problem gemeinsam beheben.",
        request: "Können wir uns darauf konzentrieren, wie wir den Fehler korrigieren können?"
      }
    }
  ]
};

export const getContextExamples = (context: string) => {
  return contextExamples[context as keyof typeof contextExamples] || [];
};

export const getContextPrompt = (context: string) => {
  const examples = getContextExamples(context);
  
  if (examples.length === 0) {
    return '';
  }

  const exampleTexts = examples.map((example, index) => {
    return `Beispiel ${index + 1}:
Input: "${example.input}"
GFK-Formulierung:
- Beobachtung: ${example.output.observation}
- Gefühl: ${example.output.feeling}
- Bedürfnis: ${example.output.need}
- Bitte: ${example.output.request}`;
  }).join('\n\n');

  return `\n\nKontext-spezifische Beispiele für ${getContextLabel(context)}:\n${exampleTexts}\n\nBitte verwende einen ähnlichen Stil und Ton für die Transformation.`;
};

export const getContextLabel = (context: string) => {
  const labels = {
    general: 'Allgemein',
    child: 'Kind/Jugendliche',
    business: 'Geschäftsgespräch',
    partner: 'Partner/In',
    colleague: 'Kollegen'
  };
  
  return labels[context as keyof typeof labels] || 'Allgemein';
}; 