export type Language = 'de' | 'en';

export interface Translations {
  // Navigation & Header
  nav: {
    home: string;
    about: string;
    contact: string;
    faq: string;
    profile: string;
    login: string;
    logout: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    signInWithGoogle: string;
    email: string;
    password: string;
    name: string;
    alreadyRegistered: string;
    noAccount: string;
    acceptTerms: string;
    terms: string;
    privacy: string;
    loading: string;
    signInLoading: string;
    signUpLoading: string;
    googleLoading: string;
    invalidCredentials: string;
    registrationError: string;
    unexpectedError: string;
  };

  // Main App
  app: {
    title: string;
    description: string;
    version: string;
    copyright: string;
    dataProtection: string;
    terms: string;
  };

  // HomePage
  home: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
      cta: string;
    };
    features: {
      title: string;
      subtitle: string;
      items: {
        title: string;
        description: string;
      }[];
    };
    howItWorks: {
      title: string;
      subtitle: string;
      steps: {
        title: string;
        description: string;
      }[];
    };
    faq: {
      title: string;
      subtitle: string;
      questions: {
        question: string;
        answer: string;
      }[];
    };
    examples: {
      title: string;
      subtitle: string;
      before: string;
      after: string;
    };
    stats: {
      activeUsers: string;
      transformations: string;
    };
    support: {
      button: string;
      note: string;
    };
  };

  // GFK Form
  gfkForm: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    contextLabel: string;
    contextDescription: string;
    contextOptions: {
      general: string;
      child: string;
      business: string;
      partner: string;
      colleague: string;
    };
    submitButton: string;
    loading: string;
    error: {
      emptyInput: string;
      tooLong: string;
      networkError: string;
      timeout: string;
      unexpected: string;
    };
    loginHint: string;
  };

  // Output
  output: {
    title: string;
    observation: string;
    feeling: string;
    need: string;
    request: string;
    feedback: {
      helpful: string;
      notHelpful: string;
      submit: string;
      thanks: string;
    };
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    saveProfile: string;
    cancelEdit: string;
    email: string;
    emailNote: string;
    memberSince: string;
    unknown: string;
    messages: {
      title: string;
      empty: string;
      emptyDescription: string;
      backToHome: string;
    };
  };

  // About
  about: {
    title: string;
    subtitle: string;
    description: string;
    fourSteps: {
      title: string;
      steps: {
        observation: string;
        feeling: string;
        need: string;
        request: string;
      }[];
    };
    wolfLanguage: {
      title: string;
      description: string;
      characteristics: string;
      example: string;
    };
    giraffeLanguage: {
      title: string;
      description: string;
      characteristics: string;
      example: string;
    };
    transformation: {
      title: string;
      wolf: string;
      giraffe: string;
    };
  };

  // FAQ
  faq: {
    categories: {
      gfk: string;
      usage: string;
      technical: string;
    };
  };

  // Modals
  modals: {
    context: {
      title: string;
      questions: {
        who: string;
        when: string;
        where: string;
        what: string;
        why: string;
      };
      placeholders: {
        who: string;
        when: string;
        where: string;
        what: string;
        why: string;
      };
      skip: string;
      next: string;
      previous: string;
    };
    perspective: {
      title: string;
      sender: string;
      receiver: string;
      senderDescription: string;
      receiverDescription: string;
    };
    feedback: {
      title: string;
      reasons: string[];
      otherReason: string;
      betterFormulation: string;
      submit: string;
    };
    terms: {
      title: string;
      sections: {
        heading: string;
        text: string;
      }[];
    };
    privacy: {
      title: string;
      sections: {
        heading: string;
        text: string;
      }[];
    };
    anonFeedback: {
      title: string;
      description: string;
      label: string;
      placeholder: string;
      error: string;
      close: string;
      later: string;
      submit: string;
      sending: string;
      rewardTitle: string;
      rewardText: string;
    };
  };

  // Contact
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      email: string;
      message: string;
      submit: string;
      success: string;
      error: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  de: {
    nav: {
      home: 'Startseite',
      about: 'Über GFK',
      contact: 'Kontakt',
      faq: 'FAQ',
      profile: 'Profil',
      login: 'Anmelden',
      logout: 'Abmelden',
    },
    auth: {
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      signInWithGoogle: 'Mit Google anmelden',
      email: 'E-Mail',
      password: 'Passwort',
      name: 'Name',
      alreadyRegistered: 'Bereits registriert? Anmelden',
      noAccount: 'Noch kein Konto? Registrieren',
      acceptTerms: 'Ich akzeptiere die AGB und die Datenschutzerklärung',
      terms: 'AGB',
      privacy: 'Datenschutz',
      loading: 'Laden...',
      signInLoading: 'Anmeldung...',
      signUpLoading: 'Registrierung...',
      googleLoading: 'Anmeldung...',
      invalidCredentials: 'Ungültige E-Mail oder Passwort.',
      registrationError: 'Fehler bei der Registrierung',
      unexpectedError: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    },
    app: {
      title: 'GFKCoach - Gewaltfreie Kommunikation mit KI',
      description: 'Verbessern Sie Ihre Kommunikation mit KI-gestützter gewaltfreier Kommunikation (GFK).',
      version: 'Version 1.6.16 - Debug-Tools & Verbesserte Fortschritts-Tracking',
      copyright: '© 2024 GFKCoach - Empatische Kommunikation für alle',
      dataProtection: 'Datenschutz',
      terms: 'AGB',
    },
    home: {
      hero: {
        title: 'Transformiere deine Kommunikation mit GFK',
        subtitle: 'KI-gestützte Gewaltfreie Kommunikation',
        description: 'Entdecke die Kraft der Gewaltfreien Kommunikation. Unsere KI hilft dir dabei, alltägliche Nachrichten in einfühlsame und wirkungsvolle Botschaften zu verwandeln.',
        cta: 'Jetzt starten',
      },
      features: {
        title: 'Warum GFKCoach?',
        subtitle: 'Entdecke die Vorteile gewaltfreier Kommunikation',
        items: [
          {
            title: 'KI-gestützte Transformation',
            description: 'Unsere KI wandelt deine Aussagen in gewaltfreie Formulierungen um',
          },
          {
            title: 'Vier Schritte der GFK',
            description: 'Lerne Beobachtung, Gefühl, Bedürfnis und Bitte zu unterscheiden',
          },
          {
            title: 'Kontext-spezifisch',
            description: 'Wähle den passenden Kontext für maßgeschneiderte Formulierungen',
          },
        ],
      },
      howItWorks: {
        title: 'So funktioniert es',
        subtitle: 'In drei einfachen Schritten zu besserer Kommunikation',
        steps: [
          {
            title: 'Text eingeben',
            description: 'Gib deine Aussage ein, die du umformulieren möchtest',
          },
          {
            title: 'Kontext wählen',
            description: 'Wähle den passenden Kontext (Familie, Arbeit, etc.)',
          },
          {
            title: 'GFK-Formulierung erhalten',
            description: 'Erhalte eine empathische, gewaltfreie Formulierung',
          },
        ],
      },
      faq: {
        title: 'Häufig gestellte Fragen',
        subtitle: 'Finde Antworten auf die wichtigsten Fragen zu GFKCoach',
        questions: [
          {
            question: 'Was ist Gewaltfreie Kommunikation (GFK) und warum ist sie wichtig?',
            answer: 'Gewaltfreie Kommunikation nach Marshall B. Rosenberg ist ein Ansatz, der Menschen dabei hilft, selbst in schwierigen Situationen einfühlsam und authentisch zu kommunizieren. Sie basiert auf vier Schritten: Beobachtung, Gefühl, Bedürfnis und Bitte. GFK reduziert Konflikte, verbessert Beziehungen und fördert gegenseitiges Verständnis.',
          },
          {
            question: 'Wie funktioniert die KI-Transformation bei GFKCoach?',
            answer: 'Unsere KI analysiert deinen Text und erkennt automatisch die vier GFK-Komponenten. Sie formuliert dann eine empathische Version, die deine Beobachtungen, Gefühle, Bedürfnisse und Bitten klar ausdrückt. Du kannst verschiedene Kontexte wählen (Familie, Arbeit, Partnerschaft), um maßgeschneiderte Formulierungen zu erhalten.',
          },
        ],
      },
      examples: {
        title: 'Sieh die Transformation in Aktion',
        subtitle: 'Erlebe, wie alltägliche Aussagen zu empathischen Botschaften werden',
        before: 'Vorher',
        after: 'Nachher (GFK)',
      },
      stats: {
        activeUsers: 'Aktive Nutzer',
        transformations: 'Transformationen',
      },
      support: {
        button: 'Unterstütze GFKCoach ☕',
        note: 'Keine Kreditkarte notwenidg',
      },
    },
    gfkForm: {
      title: 'GFK-Transformation',
      subtitle: 'Transformiere deine Kommunikation in gewaltfreie Formulierungen',
      inputPlaceholder: 'Gib hier deine Aussage ein, die du umformulieren möchtest...',
      contextLabel: 'Kontext auswählen',
      contextDescription: 'Wähle den passenden Kontext für bessere, angepasste Formulierungen.',
      contextOptions: {
        general: 'Allgemein - Für verschiedene Situationen',
        child: 'Kind/Jugendliche - Für die Kommunikation mit Kindern',
        business: 'Geschäftsgespräch - Für berufliche Kommunikation',
        partner: 'Partner/In - Für die Partnerschaft',
        colleague: 'Kollegen - Für die Zusammenarbeit',
      },
      submitButton: 'Umformulieren',
      loading: 'Transformiere...',
      error: {
        emptyInput: 'Bitte geben Sie einen Text ein.',
        tooLong: 'Der Text ist zu lang. Bitte kürzen Sie ihn auf maximal 1000 Zeichen.',
        networkError: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        timeout: 'Zeitüberschreitung. Bitte versuchen Sie es erneut.',
        unexpected: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      },
      loginHint: 'Melde dich an für unbegrenzte Transformationen und den GFK-Coach (3 Nachrichten/Monat)',
    },
    output: {
      title: 'Deine GFK-Formulierung',
      observation: 'Beobachtung',
      feeling: 'Gefühl',
      need: 'Bedürfnis',
      request: 'Bitte',
      feedback: {
        helpful: 'Hilfreich',
        notHelpful: 'Nicht hilfreich',
        submit: 'Feedback senden',
        thanks: 'Danke für dein Feedback!',
      },
    },
    profile: {
      title: 'Mein Profil',
      editProfile: 'Profil bearbeiten',
      saveProfile: 'Speichern',
      cancelEdit: 'Abbrechen',
      email: 'E-Mail',
      emailNote: 'E-Mail kann nicht geändert werden',
      memberSince: 'Mitglied seit',
      unknown: 'Unbekannt',
      messages: {
        title: 'Meine GFK-Texte',
        empty: 'Noch keine GFK-Texte vorhanden.',
        emptyDescription: 'Besuchen Sie die Hauptseite, um Ihre erste GFK-Transformation zu erstellen.',
        backToHome: 'Zur Hauptseite',
      },
    },
    about: {
      title: 'Über Gewaltfreie Kommunikation',
      subtitle: 'Entdecke die transformative Kraft der GFK nach Marshall B. Rosenberg',
      description: 'Gewaltfreie Kommunikation (GFK) ist ein von Marshall B. Rosenberg entwickelter Ansatz, der Menschen dabei hilft, selbst in herausfordernden Situationen einfühlsam und authentisch zu kommunizieren.',
      fourSteps: {
        title: 'Die vier Schritte der GFK',
        steps: [
          {
            observation: 'Beobachtung - Beschreiben Sie die Situation objektiv, ohne zu bewerten oder zu interpretieren.',
            feeling: 'Gefühl - Drücken Sie Ihre Gefühle aus, die durch die Situation entstehen.',
            need: 'Bedürfnis - Benennen Sie die Bedürfnisse, die hinter Ihren Gefühlen stehen.',
            request: 'Bitte - Formulieren Sie eine konkrete, positive und machbare Bitte.',
          },
        ],
      },
      wolfLanguage: {
        title: 'Wolfssprache',
        description: 'Die Sprache der Gewalt – Urteile, Vorwürfe und Forderungen, die zu Konflikten führen.',
        characteristics: 'Typische Merkmale:',
        example: 'Beispiel:',
      },
      giraffeLanguage: {
        title: 'Giraffensprache',
        description: 'Die Sprache des Herzens – einfühlsam, authentisch und verbindend.',
        characteristics: 'Typische Merkmale:',
        example: 'Beispiel:',
      },
      transformation: {
        title: 'Transformation: Von Wolf zu Giraffe',
        wolf: 'Wolfssprache',
        giraffe: 'Giraffensprache',
      },
    },
    faq: {
      categories: {
        gfk: 'Gewaltfreie Kommunikation',
        usage: 'GFKCoach nutzen',
        technical: 'Technisches & Rechtliches',
      },
    },
    modals: {
      context: {
        title: 'Mehr Kontext für bessere Formulierung',
        questions: {
          who: 'Mit wem sprichst du?',
          when: 'Wann ist das passiert?',
          where: 'Wo hat es stattgefunden?',
          what: 'Was ist genau passiert?',
          why: 'Warum ist dir das wichtig?',
        },
        placeholders: {
          who: 'z.B.: Mein Partner, mein Kind, mein Kollege...',
          when: 'z.B.: Gestern Abend, vor einer Woche, immer wieder...',
          where: 'z.B.: Zu Hause, im Büro, beim Abendessen...',
          what: 'z.B.: Er hat nicht zugehört, sie hat versprochen zu helfen...',
          why: 'z.B.: Weil ich mich wertgeschätzt fühlen möchte...',
        },
        skip: 'Überspringen',
        next: 'Weiter',
        previous: 'Zurück',
      },
      perspective: {
        title: 'Perspektive wählen',
        sender: 'Sender',
        receiver: 'Empfänger',
        senderDescription: 'Du bist der Sprecher und möchtest lernen, wie du deine Aussage in GFK hättest ausdrücken können.',
        receiverDescription: 'Du bist der Empfänger und möchtest lernen, wie du auf die Aussage mit GFK antworten kannst.',
      },
      feedback: {
        title: 'Feedback geben',
        reasons: ['Nicht gewaltfrei', 'Unklar', 'Zu kompliziert', 'Nicht hilfreich', 'Sonstiges'],
        otherReason: 'Anderer Grund',
        betterFormulation: 'Bessere Formulierung',
        submit: 'Feedback senden',
      },
      terms: {
        title: 'Allgemeine Geschäftsbedingungen (AGB)',
        sections: [
          {
            heading: '1. Geltungsbereich',
            text: 'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform GFKCoach. Mit der Registrierung und Nutzung der Plattform erkennen Sie diese Bedingungen an.'
          },
          {
            heading: '2. Leistungen',
            text: 'GFKCoach bietet digitale Unterstützung zur Gewaltfreien Kommunikation. Es besteht kein Anspruch auf Verfügbarkeit oder bestimmte Funktionalitäten.'
          },
          {
            heading: '3. Haftung',
            text: 'Die Nutzung erfolgt auf eigene Verantwortung. GFKCoach übernimmt keine Haftung für die Richtigkeit der bereitgestellten Inhalte oder für Handlungen, die auf Basis der Vorschläge erfolgen.'
          },
          {
            heading: '4. Datenschutz',
            text: 'Es gilt die Datenschutzerklärung. Personenbezogene Daten werden gemäß den gesetzlichen Vorgaben behandelt.'
          },
          {
            heading: '5. Änderungen',
            text: 'GFKCoach behält sich vor, die AGB jederzeit zu ändern. Die jeweils aktuelle Version ist auf der Plattform einsehbar.'
          },
          {
            heading: '6. Schlussbestimmungen',
            text: 'Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.'
          }
        ]
      },
      privacy: {
        title: 'Datenschutzerklärung',
        sections: [
          { heading: '1. Datenschutz auf einen Blick', text: '' },
          { heading: 'Allgemeine Hinweise', text: 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.' },
          { heading: 'Datenerfassung auf dieser Website', text: 'Wer ist verantwortlich für die Datenerfassung auf dieser Website? Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.' },
          { heading: 'Wie erfassen wir Ihre Daten?', text: 'Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).' },
          { heading: '2. Allgemeine Hinweise und Pflichtinformationen', text: '' },
          { heading: 'Datenschutz', text: 'Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.' },
          { heading: 'Hinweis zur verantwortlichen Stelle', text: 'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist: GFKCoach, Stuttgart-Nord, info@gfkcoach.com' },
          { heading: '3. Datenerfassung auf dieser Website', text: '' },
          { heading: 'Kontaktformular', text: 'Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.' },
          { heading: 'Speicherdauer', text: 'Ihre Daten werden nur so lange gespeichert, wie es für die jeweiligen Zwecke erforderlich ist. Wenn Sie sich für unseren Newsletter anmelden, speichern wir Ihre E-Mail-Adresse, bis Sie sich vom Newsletter abmelden.' },
          { heading: '4. Newsletter', text: 'Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang des Newsletters einverstanden sind.' },
          { heading: '5. Ihre Rechte', text: 'Sie haben jederzeit das Recht: Auskunft über Ihre bei uns gespeicherten Daten zu erhalten, diese Daten berichtigen zu lassen, die Löschung dieser Daten zu verlangen, die Verarbeitung dieser Daten einschränken zu lassen, der Verarbeitung zu widersprechen, diese Daten übertragen zu lassen.' },
          { heading: '6. Änderungen', text: 'Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services.' },
          { heading: '', text: 'Wenn Sie den GFKCoach nutzen, werden Ihre eingegebenen Texte und die KI-Umformulierungen sowohl bei eingeloggten als auch bei anonymen Nutzern temporär in unserer Datenbank gespeichert. Dies dient ausschließlich der Verbesserung des Dienstes und der statistischen Auswertung. Es erfolgt keine personenbezogene Auswertung bei anonymen Nutzern.' }
        ]
      },
      anonFeedback: {
        title: 'Ihr Feedback ist wertvoll',
        description: 'Helfen Sie uns, unseren Service zu verbessern und erhalten Sie 5 zusätzliche kostenlose Umformulierungen.',
        label: 'Was können wir verbessern?',
        placeholder: 'Teilen Sie uns Ihre Gedanken mit...',
        error: 'Bitte gib ein kurzes Feedback ein.',
        close: 'Schließen',
        later: 'Später',
        submit: 'Feedback senden',
        sending: 'Wird gesendet...',
        rewardTitle: 'Belohnung für Ihr Feedback',
        rewardText: 'Nach dem Absenden erhalten Sie 5 zusätzliche kostenlose Umformulierungen als Dankeschön.'
      },
    },
    contact: {
      title: 'Kontakt',
      subtitle: 'Haben Sie Fragen oder Anregungen?',
      form: {
        name: 'Name',
        email: 'E-Mail',
        message: 'Nachricht',
        submit: 'Nachricht senden',
        success: 'Nachricht erfolgreich gesendet!',
        error: 'Fehler beim Senden der Nachricht.',
      },
    },
  },
  en: {
    nav: {
      home: 'Home',
      about: 'About NVC',
      contact: 'Contact',
      faq: 'FAQ',
      profile: 'Profile',
      login: 'Login',
      logout: 'Logout',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signInWithGoogle: 'Sign in with Google',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      alreadyRegistered: 'Already registered? Sign in',
      noAccount: 'No account yet? Sign up',
      acceptTerms: 'I accept the Terms and Privacy Policy',
      terms: 'Terms',
      privacy: 'Privacy',
      loading: 'Loading...',
      signInLoading: 'Signing in...',
      signUpLoading: 'Signing up...',
      googleLoading: 'Signing in...',
      invalidCredentials: 'Invalid email or password.',
      registrationError: 'Registration error',
      unexpectedError: 'An unexpected error occurred. Please try again later.',
    },
    app: {
      title: 'GFKCoach - Nonviolent Communication with AI',
      description: 'Improve your communication with AI-powered nonviolent communication (NVC).',
      version: 'Version 1.6.16 - Debug Tools & Improved Progress Tracking',
      copyright: '© 2024 GFKCoach - Empathetic Communication for Everyone',
      dataProtection: 'Privacy',
      terms: 'Terms',
    },
    home: {
      hero: {
        title: 'Transform your communication with NVC',
        subtitle: 'AI-powered Nonviolent Communication',
        description: 'Discover the power of Nonviolent Communication. Our AI helps you transform everyday messages into empathetic and effective communication.',
        cta: 'Get started',
      },
      features: {
        title: 'Why GFKCoach?',
        subtitle: 'Discover the benefits of nonviolent communication',
        items: [
          {
            title: 'AI-powered transformation',
            description: 'Our AI transforms your statements into nonviolent formulations',
          },
          {
            title: 'Four NVC steps',
            description: 'Learn to distinguish observation, feeling, need, and request',
          },
          {
            title: 'Context-specific',
            description: 'Choose the appropriate context for tailored formulations',
          },
        ],
      },
      howItWorks: {
        title: 'How it works',
        subtitle: 'In three simple steps to better communication',
        steps: [
          {
            title: 'Enter text',
            description: 'Enter your statement that you want to reformulate',
          },
          {
            title: 'Choose context',
            description: 'Select the appropriate context (family, work, etc.)',
          },
          {
            title: 'Get NVC formulation',
            description: 'Receive an empathetic, nonviolent formulation',
          },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to the most important questions about GFKCoach',
        questions: [
          {
            question: 'What is Nonviolent Communication (NVC) and why is it important?',
            answer: 'Nonviolent Communication by Marshall B. Rosenberg is an approach that helps people communicate empathetically and authentically even in difficult situations. It is based on four steps: observation, feeling, need, and request. NVC reduces conflicts, improves relationships, and promotes mutual understanding.',
          },
          {
            question: 'How does AI transformation work at GFKCoach?',
            answer: 'Our AI analyzes your text and automatically recognizes the four NVC components. It then formulates an empathetic version that clearly expresses your observations, feelings, needs, and requests. You can choose different contexts (family, work, partnership) to receive tailored formulations.',
          },
        ],
      },
      examples: {
        title: 'See the transformation in action',
        subtitle: 'Experience how everyday statements become empathetic messages',
        before: 'Before',
        after: 'After (NVC)',
      },
      stats: {
        activeUsers: 'Active Users',
        transformations: 'Transformations',
      },
      support: {
        button: 'Support GFKCoach ☕',
        note: 'No credit card required',
      },
    },
    gfkForm: {
      title: 'NVC Transformation',
      subtitle: 'Transform your communication into nonviolent formulations',
      inputPlaceholder: 'Enter your statement here that you want to reformulate...',
      contextLabel: 'Select context',
      contextDescription: 'Choose the appropriate context for better, tailored formulations.',
      contextOptions: {
        general: 'General - For various situations',
        child: 'Child/Youth - For communication with children',
        business: 'Business conversation - For professional communication',
        partner: 'Partner - For partnership',
        colleague: 'Colleague - For collaboration',
      },
      submitButton: 'Reformulate',
      loading: 'Transforming...',
      error: {
        emptyInput: 'Please enter some text.',
        tooLong: 'The text is too long. Please shorten it to a maximum of 1000 characters.',
        networkError: 'Network error. Please check your internet connection and try again.',
        timeout: 'Timeout. Please try again.',
        unexpected: 'An unexpected error occurred. Please try again.',
      },
      loginHint: 'Sign up for unlimited transformations and the NVC Coach (3 messages/month)',
    },
    output: {
      title: 'Your NVC Formulation',
      observation: 'Observation',
      feeling: 'Feeling',
      need: 'Need',
      request: 'Request',
      feedback: {
        helpful: 'Helpful',
        notHelpful: 'Not helpful',
        submit: 'Submit feedback',
        thanks: 'Thank you for your feedback!',
      },
    },
    profile: {
      title: 'My Profile',
      editProfile: 'Edit profile',
      saveProfile: 'Save',
      cancelEdit: 'Cancel',
      email: 'Email',
      emailNote: 'Email cannot be changed',
      memberSince: 'Member since',
      unknown: 'Unknown',
      messages: {
        title: 'My NVC Texts',
        empty: 'No NVC texts available yet.',
        emptyDescription: 'Visit the main page to create your first NVC transformation.',
        backToHome: 'Back to home',
      },
    },
    about: {
      title: 'About Nonviolent Communication',
      subtitle: 'Discover the transformative power of NVC by Marshall B. Rosenberg',
      description: 'Nonviolent Communication (NVC) is an approach developed by Marshall B. Rosenberg that helps people communicate empathetically and authentically even in challenging situations.',
      fourSteps: {
        title: 'The Four Steps of NVC',
        steps: [
          {
            observation: 'Observation - Describe the situation objectively without judging or interpreting.',
            feeling: 'Feeling - Express your feelings that arise from the situation.',
            need: 'Need - Name the needs that lie behind your feelings.',
            request: 'Request - Formulate a concrete, positive, and feasible request.',
          },
        ],
      },
      wolfLanguage: {
        title: 'Wolf Language',
        description: 'The language of violence – judgments, accusations, and demands that lead to conflicts.',
        characteristics: 'Typical characteristics:',
        example: 'Example:',
      },
      giraffeLanguage: {
        title: 'Giraffe Language',
        description: 'The language of the heart – empathetic, authentic, and connecting.',
        characteristics: 'Typical characteristics:',
        example: 'Example:',
      },
      transformation: {
        title: 'Transformation: From Wolf to Giraffe',
        wolf: 'Wolf Language',
        giraffe: 'Giraffe Language',
      },
    },
    faq: {
      categories: {
        gfk: 'Nonviolent Communication',
        usage: 'Using GFKCoach',
        technical: 'Technical & Legal',
      },
    },
    modals: {
      context: {
        title: 'More context for better formulation',
        questions: {
          who: 'Who are you talking to?',
          when: 'When did this happen?',
          where: 'Where did it take place?',
          what: 'What exactly happened?',
          why: 'Why is this important to you?',
        },
        placeholders: {
          who: 'e.g.: My partner, my child, my colleague...',
          when: 'e.g.: Yesterday evening, a week ago, repeatedly...',
          where: 'e.g.: At home, at work, during dinner...',
          what: 'e.g.: He didn\'t listen, she promised to help...',
          why: 'e.g.: Because I want to feel valued...',
        },
        skip: 'Skip',
        next: 'Next',
        previous: 'Previous',
      },
      perspective: {
        title: 'Choose perspective',
        sender: 'Sender',
        receiver: 'Receiver',
        senderDescription: 'You are the speaker and want to learn how you could have expressed your statement in NVC.',
        receiverDescription: 'You are the receiver and want to learn how to respond to the statement with NVC.',
      },
      feedback: {
        title: 'Give feedback',
        reasons: ['Not nonviolent', 'Unclear', 'Too complicated', 'Not helpful', 'Other'],
        otherReason: 'Other reason',
        betterFormulation: 'Better formulation',
        submit: 'Submit feedback',
      },
      terms: {
        title: 'Terms and Conditions',
        sections: [
          { heading: '1. Scope', text: 'Placeholder for English terms.' },
          { heading: '2. Services', text: 'Placeholder for English terms.' },
          { heading: '3. Liability', text: 'Placeholder for English terms.' },
          { heading: '4. Privacy', text: 'Placeholder for English terms.' },
          { heading: '5. Changes', text: 'Placeholder for English terms.' },
          { heading: '6. Final Provisions', text: 'Placeholder for English terms.' }
        ]
      },
      privacy: {
        title: 'Privacy Policy',
        sections: [
          { heading: '1. Privacy at a glance', text: 'Placeholder for English privacy policy.' },
          { heading: 'General notes', text: 'Placeholder for English privacy policy.' },
          { heading: 'Data collection on this website', text: 'Placeholder for English privacy policy.' },
          { heading: 'How do we collect your data?', text: 'Placeholder for English privacy policy.' },
          { heading: '2. General notes and mandatory information', text: 'Placeholder for English privacy policy.' },
          { heading: 'Privacy', text: 'Placeholder for English privacy policy.' },
          { heading: 'Note on the responsible body', text: 'Placeholder for English privacy policy.' },
          { heading: '3. Data collection on this website', text: 'Placeholder for English privacy policy.' },
          { heading: 'Contact form', text: 'Placeholder for English privacy policy.' },
          { heading: 'Storage period', text: 'Placeholder for English privacy policy.' },
          { heading: '4. Newsletter', text: 'Placeholder for English privacy policy.' },
          { heading: '5. Your rights', text: 'Placeholder for English privacy policy.' },
          { heading: '6. Changes', text: 'Placeholder for English privacy policy.' },
          { heading: '', text: 'Placeholder for English privacy policy.' }
        ]
      },
      anonFeedback: {
        title: 'Your feedback is valuable',
        description: 'Help us improve our service and receive 5 additional free reformulations.',
        label: 'What can we improve?',
        placeholder: 'Share your thoughts with us...',
        error: 'Please enter a short feedback.',
        close: 'Close',
        later: 'Later',
        submit: 'Send feedback',
        sending: 'Sending...',
        rewardTitle: 'Reward for your feedback',
        rewardText: 'After submitting, you will receive 5 additional free reformulations as a thank you.'
      },
    },
    contact: {
      title: 'Contact',
      subtitle: 'Do you have questions or suggestions?',
      form: {
        name: 'Name',
        email: 'Email',
        message: 'Message',
        submit: 'Send message',
        success: 'Message sent successfully!',
        error: 'Error sending message.',
      },
    },
  },
}; 