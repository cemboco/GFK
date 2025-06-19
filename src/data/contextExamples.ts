export interface ContextExample {
  input: string;
  output: {
    observation: string;
    feeling: string;
    need: string;
    request: string;
    variant1: string;
    variant2: string;
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
    },
    {
      input: "Du kommst immer zu spät!",
      output: {
        observation: "Du kommst oft später als vereinbart nach Hause.",
        feeling: "Ich mache mir Sorgen um dich und fühle mich unsicher.",
        need: "Mir ist wichtig zu wissen, wo du bist und dass es dir gut geht.",
        request: "Kannst du mir bitte Bescheid geben, wenn du dich verspätest?"
      }
    },
    {
      input: "Du isst nie gesund!",
      output: {
        observation: "Ich sehe, dass du oft Süßigkeiten statt Obst oder Gemüse isst.",
        feeling: "Ich mache mir Sorgen um deine Gesundheit.",
        need: "Mir ist wichtig, dass du gesund bleibst und dich gut fühlst.",
        request: "Können wir zusammen überlegen, welche gesunden Lebensmittel dir schmecken?"
      }
    },
    {
      input: "Du spielst den ganzen Tag nur!",
      output: {
        observation: "Du verbringst viel Zeit mit Spielen und wenig Zeit mit anderen Aktivitäten.",
        feeling: "Ich mache mir Sorgen, dass du andere wichtige Dinge vernachlässigst.",
        need: "Mir ist wichtig, dass du eine gute Balance zwischen Spiel und anderen Aktivitäten findest.",
        request: "Können wir zusammen einen Zeitplan für verschiedene Aktivitäten machen?"
      }
    },
    {
      input: "Du bist so faul!",
      output: {
        observation: "Ich sehe, dass du oft Aufgaben vermeidest oder aufschiebst.",
        feeling: "Ich fühle mich frustriert, weil ich denke, dass du deine Möglichkeiten nicht nutzt.",
        need: "Mir ist wichtig, dass du lernst, Verantwortung zu übernehmen.",
        request: "Kannst du mir sagen, was dich daran hindert, diese Aufgaben zu machen?"
      }
    },
    {
      input: "Du bist so frech!",
      output: {
        observation: "Du sprichst oft in einem Ton, der respektlos klingt.",
        feeling: "Ich fühle mich verletzt und nicht respektiert.",
        need: "Mir ist wichtig, dass wir respektvoll miteinander umgehen.",
        request: "Kannst du bitte in einem freundlicheren Ton mit mir sprechen?"
      }
    },
    {
      input: "Du machst nie was ich sage!",
      output: {
        observation: "Ich merke, dass du oft nicht tust, worum ich dich bitte.",
        feeling: "Ich fühle mich hilflos und nicht ernst genommen.",
        need: "Mir ist wichtig, dass wir zusammenarbeiten und uns gegenseitig unterstützen.",
        request: "Kannst du mir sagen, warum es dir schwerfällt, das zu tun, worum ich dich bitte?"
      }
    },
    {
      input: "Du bist so egoistisch!",
      output: {
        observation: "Ich sehe, dass du oft nur an dich denkst und andere nicht berücksichtigst.",
        feeling: "Ich fühle mich traurig, weil ich denke, dass dir andere Menschen nicht wichtig sind.",
        need: "Mir ist wichtig, dass du lernst, auch an andere zu denken.",
        request: "Können wir zusammen überlegen, wie du auch an andere denken kannst?"
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
    },
    {
      input: "Das ist nicht mein Job!",
      output: {
        observation: "Du sagst, diese Aufgabe gehöre nicht zu deinen Pflichten.",
        feeling: "Ich fühle mich verunsichert, weil ich dachte, wir könnten uns gegenseitig unterstützen.",
        need: "Mir ist wichtig, dass wir als Team zusammenarbeiten.",
        request: "Können wir zusammen klären, wer für diese Aufgabe zuständig ist?"
      }
    },
    {
      input: "Das ist nicht möglich!",
      output: {
        observation: "Du sagst, dass meine Anfrage nicht umsetzbar ist.",
        feeling: "Ich fühle mich enttäuscht, weil ich dachte, wir könnten eine Lösung finden.",
        need: "Mir ist wichtig, dass wir kreative Lösungen finden.",
        request: "Kannst du mir bitte erklären, welche Hindernisse du siehst?"
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
      input: "Das ist nicht meine Aufgabe!",
      output: {
        observation: "Du sagst, diese Arbeit gehöre nicht zu deinen Zuständigkeiten.",
        feeling: "Ich fühle mich frustriert, weil ich dachte, wir könnten uns gegenseitig unterstützen.",
        need: "Mir ist wichtig, dass wir flexibel und teamorientiert arbeiten.",
        request: "Können wir zusammen klären, wie wir die Arbeit fair aufteilen können?"
      }
    },
    {
      input: "Das ist nicht mein Fehler!",
      output: {
        observation: "Du weist die Schuld für diesen Fehler von dir.",
        feeling: "Ich fühle mich frustriert, weil ich eine Lösung brauche, nicht Schuldzuweisungen.",
        need: "Mir ist wichtig, dass wir das Problem gemeinsam beheben.",
        request: "Können wir uns darauf konzentrieren, wie wir den Fehler korrigieren können?"
      }
    },
    {
      input: "Das ist nicht meine Verantwortung!",
      output: {
        observation: "Du sagst, dass du für diese Angelegenheit nicht verantwortlich bist.",
        feeling: "Ich fühle mich verunsichert, weil ich dachte, wir teilen die Verantwortung.",
        need: "Mir ist wichtig, dass wir klar kommunizieren, wer wofür zuständig ist.",
        request: "Können wir zusammen klären, wer für diese Angelegenheit verantwortlich ist?"
      }
    },
    {
      input: "Das ist nicht mein Bereich!",
      output: {
        observation: "Du sagst, diese Angelegenheit falle nicht in deinen Fachbereich.",
        feeling: "Ich fühle mich enttäuscht, weil ich dachte, wir könnten zusammenarbeiten.",
        need: "Mir ist wichtig, dass wir uns gegenseitig unterstützen.",
        request: "Kannst du mir bitte an jemanden verweisen, der für diesen Bereich zuständig ist?"
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
      input: "Du machst nie was ich sage!",
      output: {
        observation: "Ich merke, dass du oft nicht tust, worum ich dich bitte.",
        feeling: "Ich fühle mich nicht ernst genommen und hilflos.",
        need: "Mir ist wichtig, dass wir uns gegenseitig respektieren und unterstützen.",
        request: "Kannst du mir bitte zuhören und meine Wünsche berücksichtigen?"
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
    },
    {
      input: "Du bist nie romantisch!",
      output: {
        observation: "Ich merke, dass du selten romantische Gesten machst.",
        feeling: "Ich fühle mich nicht geliebt und vernachlässigt.",
        need: "Mir ist wichtig, dass wir unsere Liebe füreinander zeigen.",
        request: "Kannst du bitte mehr romantische Gesten machen?"
      }
    },
    {
      input: "Du bist so kalt!",
      output: {
        observation: "Ich merke, dass du oft distanziert und kalt wirkst.",
        feeling: "Ich fühle mich abgelehnt und nicht geliebt.",
        need: "Mir ist wichtig, dass wir uns gegenseitig Wärme und Liebe zeigen.",
        request: "Kannst du bitte mehr Wärme und Zuneigung zeigen?"
      }
    },
    {
      input: "Du bist nie ehrlich!",
      output: {
        observation: "Ich merke, dass du oft nicht ehrlich mit mir bist.",
        feeling: "Ich fühle mich betrogen und nicht vertraut.",
        need: "Mir ist wichtig, dass wir ehrlich und offen miteinander umgehen.",
        request: "Kannst du bitte ehrlich mit mir sein?"
      }
    },
    {
      input: "Du bist so kontrollierend!",
      output: {
        observation: "Ich merke, dass du oft versuchst, mich zu kontrollieren.",
        feeling: "Ich fühle mich eingeengt und nicht respektiert.",
        need: "Mir ist wichtig, dass wir uns gegenseitig respektieren und Freiheit geben.",
        request: "Kannst du bitte weniger kontrollierend sein?"
      }
    },
    {
      input: "Du bist nie zufrieden!",
      output: {
        observation: "Ich merke, dass du oft unzufrieden mit mir bist.",
        feeling: "Ich fühle mich nicht gut genug und enttäuscht.",
        need: "Mir ist wichtig, dass wir uns gegenseitig wertschätzen.",
        request: "Kannst du bitte mehr Wertschätzung zeigen?"
      }
    },
    {
      input: "Du bist so unzuverlässig!",
      output: {
        observation: "Ich merke, dass du oft nicht zu deinen Versprechen stehst.",
        feeling: "Ich fühle mich enttäuscht und nicht vertraut.",
        need: "Mir ist wichtig, dass wir uns gegenseitig vertrauen können.",
        request: "Kannst du bitte zu deinen Versprechen stehen?"
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
    },
    {
      input: "Das ist nicht mein Bereich!",
      output: {
        observation: "Du sagst, diese Angelegenheit falle nicht in deinen Fachbereich.",
        feeling: "Ich fühle mich enttäuscht, weil ich dachte, wir könnten zusammenarbeiten.",
        need: "Mir ist wichtig, dass wir uns gegenseitig unterstützen.",
        request: "Kannst du mir bitte an jemanden verweisen, der für diesen Bereich zuständig ist?"
      }
    },
    {
      input: "Das ist nicht meine Aufgabe!",
      output: {
        observation: "Du sagst, diese Arbeit gehöre nicht zu deinen Zuständigkeiten.",
        feeling: "Ich fühle mich frustriert, weil ich dachte, wir könnten uns gegenseitig unterstützen.",
        need: "Mir ist wichtig, dass wir flexibel und teamorientiert arbeiten.",
        request: "Können wir zusammen klären, wie wir die Arbeit fair aufteilen können?"
      }
    },
    {
      input: "Das ist nicht mein Fehler!",
      output: {
        observation: "Du weist die Schuld für diesen Fehler von dir.",
        feeling: "Ich fühle mich frustriert, weil ich eine Lösung brauche, nicht Schuldzuweisungen.",
        need: "Mir ist wichtig, dass wir das Problem gemeinsam beheben.",
        request: "Können wir uns darauf konzentrieren, wie wir den Fehler korrigieren können?"
      }
    },
    {
      input: "Das ist nicht meine Verantwortung!",
      output: {
        observation: "Du sagst, dass du für diese Angelegenheit nicht verantwortlich bist.",
        feeling: "Ich fühle mich verunsichert, weil ich dachte, wir teilen die Verantwortung.",
        need: "Mir ist wichtig, dass wir klar kommunizieren, wer wofür zuständig ist.",
        request: "Können wir zusammen klären, wer für diese Angelegenheit verantwortlich ist?"
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
      input: "Das ist nicht mein Job!",
      output: {
        observation: "Du sagst, diese Aufgabe gehöre nicht zu deinen Pflichten.",
        feeling: "Ich fühle mich frustriert, weil ich dachte, wir könnten uns gegenseitig unterstützen.",
        need: "Mir ist wichtig, dass wir als Team zusammenarbeiten.",
        request: "Können wir zusammen klären, wie wir die Arbeit fair aufteilen können?"
      }
    },
    {
      input: "Das ist nicht mein Bereich!",
      output: {
        observation: "Du sagst, diese Angelegenheit falle nicht in deinen Fachbereich.",
        feeling: "Ich fühle mich enttäuscht, weil ich dachte, wir könnten zusammenarbeiten.",
        need: "Mir ist wichtig, dass wir uns gegenseitig unterstützen.",
        request: "Kannst du mir bitte an jemanden verweisen, der für diesen Bereich zuständig ist?"
      }
    }
  ]
}; 