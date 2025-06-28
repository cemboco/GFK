export interface ContextExample {
  input: string;
  output: {
    observation: string;
    feeling: string;
    need: string;
    request: string;
    variant1?: string;
    variant2?: string;
  };
}

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
        observation: "Ich bemerke, dass du während unserer Gespräche oft abgelenkt bist.",
        feeling: "Ich fühle mich traurig, weil ich mir Verbundenheit und volles Gehörtwerden wünsche.",
        need: "Mir ist wichtig, dass wir uns gegenseitig zuhören und verstehen.",
        request: "Kannst du mir bitte deine ungeteilte Aufmerksamkeit schenken, wenn ich mit dir rede?"
      }
    },
    {
      input: "Du bist nie da für mich!",
      output: {
        observation: "Ich merke, dass du oft nicht verfügbar bist, wenn ich Unterstützung brauche.",
        feeling: "Ich fühle mich einsam, weil ich mir Nähe und Unterstützung wünsche.",
        need: "Mir ist wichtig, dass wir uns gegenseitig unterstützen und füreinander da sind.",
        request: "Wärst du bereit, mir mitzuteilen, wann du Zeit für mich hast?"
      }
    },
    {
      input: "Du bist so egoistisch!",
      output: {
        observation: "Ich bemerke, dass meine Bedürfnisse in unseren Entscheidungen manchmal nicht berücksichtigt werden.",
        feeling: "Ich fühle mich unerhört, weil ich mir gegenseitige Wertschätzung und Berücksichtigung wünsche.",
        need: "Mir ist wichtig, dass wir die Bedürfnisse von uns beiden berücksichtigen.",
        request: "Können wir zukünftig mehr darauf achten, dass die Bedürfnisse von uns beiden Raum finden?"
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
  ],
  general: [
    {
      input: "Das ist zu teuer!",
      output: {
        observation: "Ich sehe den Preis des Artikels.",
        feeling: "Ich fühle mich unsicher, weil ich mir ein faires Preis-Leistungs-Verhältnis und finanzielle Sicherheit wünsche.",
        need: "Mir ist wichtig, dass ich mein Geld sinnvoll ausgebe.",
        request: "Könnten Sie mir bitte die Gründe für diesen Preis erklären und ob es Alternativen gibt?"
      }
    }
  ]
};