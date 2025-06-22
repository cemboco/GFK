import React from "react";
import { ChevronDown, HelpCircle, Heart, MessageSquare, Book } from "lucide-react";
import { motion } from "framer-motion";

const faqData = [
  {
    category: "GFK-Grundlagen",
    icon: Heart,
    color: "from-rose-500 to-rose-600",
    questions: [
      {
        q: "Was ist Gewaltfreie Kommunikation (GFK)?",
        a: "Gewaltfreie Kommunikation ist eine von Marshall B. Rosenberg entwickelte Kommunikationsmethode, die auf Empathie und authentischem Ausdruck basiert. Sie hilft dabei, Konflikte zu lösen und Beziehungen zu stärken, indem sie auf vier Schritte aufbaut: Beobachtung, Gefühl, Bedürfnis und Bitte."
      },
      {
        q: "Was sind die vier Schritte der GFK?",
        a: "1. **Beobachtung**: Was nehme ich wahr, ohne zu bewerten? 2. **Gefühl**: Welche Gefühle entstehen in mir? 3. **Bedürfnis**: Welches Bedürfnis steht hinter meinem Gefühl? 4. **Bitte**: Was ist meine konkrete, erfüllbare Bitte?"
      },
      {
        q: "Wie unterscheidet sich GFK von normaler Kommunikation?",
        a: "GFK verzichtet auf Vorwürfe, Urteile und Verallgemeinerungen. Statt 'Du machst immer...' wird beobachtet: 'Gestern und heute habe ich bemerkt, dass...'. Es geht um ehrliche Gefühle statt um Gedanken, die als Gefühle getarnt sind."
      }
    ]
  },
  {
    category: "GFKCoach nutzen",
    icon: MessageSquare,
    color: "from-emerald-500 to-emerald-600",
    questions: [
      {
        q: "Wie funktioniert die Umformulierung?",
        a: "Geben Sie eine Aussage ein, wählen Sie den passenden Kontext (Familie, Arbeit, etc.) und klicken Sie auf 'Umformulieren'. Unsere KI wandelt Ihre Aussage in die vier GFK-Schritte um und zeigt sowohl den Fließtext als auch die einzelnen Komponenten."
      },
      {
        q: "Warum gibt es verschiedene Kontexte?",
        a: "Verschiedene Situationen erfordern unterschiedliche Tonlagen und Beispiele. Die Sprache mit Kindern unterscheidet sich von der im Beruf. Durch die Kontextwahl wird die Umformulierung situationsgerecht angepasst."
      },
      {
        q: "Was ist der Unterschied zwischen Gast und registriertem Nutzer?",
        a: "Gäste haben 5 kostenlose Umformulierungen (plus 3 Bonus nach Feedback). Registrierte Nutzer können unbegrenzt umformulieren, ihre Umformulierungen speichern und den GFK-Coach 3x pro Monat nutzen."
      }
    ]
  },
  {
    category: "Technisches & Rechtliches",
    icon: HelpCircle,
    color: "from-blue-500 to-blue-600",
    questions: [
      {
        q: "Werden meine Daten gespeichert?",
        a: "Anonyme Gast-Umformulierungen werden nur für die Verbesserung des Services gespeichert, ohne Bezug zu Ihrer Person. Registrierte Nutzer können ihre Umformulierungen einsehen und verwalten. Alle Daten werden DSGVO-konform behandelt."
      },
      {
        q: "Ist die Registrierung wirklich kostenlos?",
        a: "Ja, die Registrierung und Nutzung von GFKCoach ist komplett kostenlos. Es fallen keine versteckten Kosten an. Wir finanzieren uns über freiwillige Spenden und möchten GFK für alle zugänglich machen."
      },
      {
        q: "Kann ich meine Daten löschen lassen?",
        a: "Ja, registrierte Nutzer können jederzeit die Löschung ihrer Daten beantragen. Kontaktieren Sie uns dafür über das Kontaktformular. Gast-Daten sind bereits anonymisiert."
      }
    ]
  },
  {
    category: "GFK lernen & vertiefen",
    icon: Book,
    color: "from-purple-500 to-purple-600",
    questions: [
      {
        q: "Kann GFKCoach ein GFK-Training ersetzen?",
        a: "Nein, GFKCoach ist eine Unterstützung beim Üben, kann aber kein persönliches Training oder Coaching ersetzen. Für tieferes Lernen empfehlen wir Bücher, Workshops oder persönliche Trainings mit zertifizierten GFK-Trainern."
      },
      {
        q: "Welche Bücher empfehlen Sie zum GFK-Lernen?",
        a: "Grundlegend: 'Gewaltfreie Kommunikation' von Marshall B. Rosenberg. Weiterführend: 'Das können wir klären!' von Ike Lasater, 'Ich höre was, was du nicht sagst' von Gabriele Seils, 'GFK im Beruf' von Manuela Walser."
      },
      {
        q: "Wie kann ich GFK im Alltag üben?",
        a: "Beginnen Sie mit der Selbstempathie: Beobachten Sie Ihre eigenen Reaktionen und erforschen Sie die dahinterliegenden Gefühle und Bedürfnisse. Üben Sie zunächst mit GFKCoach, bevor Sie die Umformulierungen in echten Gesprächen verwenden."
      }
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Häufige Fragen & GFK-Grundlagen
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Alles was Sie über Gewaltfreie Kommunikation und GFKCoach wissen möchten
          </p>
        </motion.div>

        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${category.color} text-white p-6`}>
                  <h2 className="flex items-center gap-3 text-xl font-semibold">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      <category.icon className="w-5 h-5" />
                    </div>
                    {category.category}
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {category.questions.map((item, questionIndex) => (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleItem(categoryIndex, questionIndex)}
                        className="w-full p-6 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 pr-4">
                          {item.q}
                        </span>
                        <ChevronDown 
                          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                            openItems[`${categoryIndex}-${questionIndex}`] ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      {openItems[`${categoryIndex}-${questionIndex}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6 pt-2"
                        >
                          <div className="text-slate-600 leading-relaxed">
                            {item.a.split('\n').map((paragraph, pIndex) => (
                              <p key={pIndex} className="mb-3 last:mb-0">
                                {paragraph.split('**').map((part, partIndex) => 
                                  partIndex % 2 === 1 ? (
                                    <strong key={partIndex} className="font-semibold text-slate-800">
                                      {part}
                                    </strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200 rounded-xl shadow-lg p-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Weitere Fragen?
            </h3>
            <p className="text-slate-600 mb-4">
              Wenn Sie weitere Fragen haben oder Hilfe benötigen, kontaktieren Sie uns gerne.
            </p>
            <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
              Kontakt aufnehmen
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 