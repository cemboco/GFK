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
      copyright: '© 2024 GFKCoach - Empathische Kommunikation für alle',
      dataProtection: 'Datenschutz',
      terms: 'AGB',
    },
    home: {
      hero: {
        title: 'Transformiere deine Kommunikation mit GFK',
        subtitle: 'Lerne gewaltfreie Kommunikation mit KI-Unterstützung',
        description: 'Verwandle schwierige Aussagen in empathische, verbindende Kommunikation. Basierend auf den vier Schritten der Gewaltfreien Kommunikation nach Marshall B. Rosenberg.',
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
        subtitle: 'Learn nonviolent communication with AI support',
        description: 'Transform difficult statements into empathetic, connecting communication. Based on the four steps of Nonviolent Communication by Marshall B. Rosenberg.',
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