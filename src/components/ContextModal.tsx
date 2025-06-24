import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, MessageSquare, ArrowRight, Target, Brain, Heart } from 'lucide-react';

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (context: string) => void;
  originalText: string;
  user?: any; // Für die Prüfung, ob der Nutzer registriert ist
}

const questions = [
  {
    id: 'who',
    question: 'Mit wem sprichst du?',
    placeholder: 'z.B.: Mein Partner, mein Kind, mein Kollege...',
    key: 'wer'
  },
  {
    id: 'when',
    question: 'Wann ist das passiert?',
    placeholder: 'z.B.: Gestern Abend, vor einer Woche, immer wieder...',
    key: 'wann'
  },
  {
    id: 'where',
    question: 'Wo hat es stattgefunden?',
    placeholder: 'z.B.: Zu Hause, im Büro, beim Abendessen...',
    key: 'wo'
  },
  {
    id: 'what',
    question: 'Was ist genau passiert?',
    placeholder: 'z.B.: Er hat nicht zugehört, sie hat versprochen zu helfen...',
    key: 'was'
  },
  {
    id: 'why',
    question: 'Warum ist dir das wichtig?',
    placeholder: 'z.B.: Weil ich mich wertgeschätzt fühlen möchte...',
    key: 'warum'
  }
];

export default function ContextModal({ isOpen, onClose, onSubmit, originalText, user }: ContextModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);

  // Prüfe, ob der Nutzer registriert ist
  if (!user) {
    return null; // Modal nicht anzeigen für nicht-registrierte Nutzer
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Alle Fragen beantwortet - zeige Zusammenfassung
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    onSubmit('Standard-Informationen: Allgemeine Situation');
    onClose();
    // Reset state
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowSummary(false);
  };

  const handleFinishExercise = () => {
    // Erstelle den Kontext aus den Antworten
    const contextInfo = questions
      .map(q => `${q.key}: ${answers[q.id] || 'nicht angegeben'}`)
      .join(', ');
    
    onSubmit(`Zusätzliche Informationen: ${contextInfo}`);
    onClose();
    // Reset state
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowSummary(false);
  };

  const handleBackToQuestions = () => {
    setShowSummary(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = showSummary ? 100 : ((currentQuestionIndex + 1) / questions.length) * 100;

  // Generiere Tipps basierend auf den Antworten
  const generateTips = () => {
    const tips = [];
    
    if (answers.who && answers.who.length > 0) {
      tips.push("✅ Du hast klar definiert, mit wem du sprichst. Das hilft bei der Beobachtung.");
    } else {
      tips.push("💡 Überlege dir, ob du die Person spezifischer beschreiben kannst.");
    }
    
    if (answers.what && answers.what.length > 0) {
      tips.push("✅ Du hast beschrieben, was passiert ist. Das ist die Grundlage für die Beobachtung.");
    } else {
      tips.push("💡 Versuche, das Verhalten oder die Situation noch konkreter zu beschreiben.");
    }
    
    if (answers.why && answers.why.length > 0) {
      tips.push("✅ Du hast dein Bedürfnis erkannt. Das ist der Schlüssel für eine gute GFK-Formulierung.");
    } else {
      tips.push("💡 Überlege dir, welches universelle Bedürfnis hinter deinem Gefühl steht.");
    }
    
    if (answers.when && answers.when.length > 0 && answers.where && answers.where.length > 0) {
      tips.push("✅ Zeit und Ort sind klar. Das macht deine Beobachtung präziser.");
    } else {
      tips.push("💡 Konkrete Zeitangaben und Orte helfen bei der Beobachtung.");
    }
    
    return tips;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {showSummary ? 'Übung abgeschlossen!' : 'GFK-Übung: Deine Situation vertiefen'}
                </h2>
                <p className="text-sm text-gray-600">Deine Aussage: "{originalText}"</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {showSummary ? 'Übung abgeschlossen' : `Frage ${currentQuestionIndex + 1} von ${questions.length}`}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {showSummary ? (
              // Zusammenfassungsseite
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-lg">🎉</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">Perfekt! Du hast die Übung abgeschlossen</h3>
                      <p className="text-green-700 text-sm">
                        Hier ist eine Zusammenfassung deiner Antworten und Tipps für deine GFK-Formulierung.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Zusammenfassung der Antworten */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Deine Antworten:</h4>
                  <div className="space-y-2">
                    {questions.map((q) => (
                      <div key={q.id} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">{q.question}:</span>
                        <span className="text-sm text-gray-800 text-right max-w-xs">
                          {answers[q.id] || 'Nicht beantwortet'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tipps */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Tipps für deine GFK-Formulierung:
                  </h4>
                  <div className="space-y-2">
                    {generateTips().map((tip, index) => (
                      <div key={index} className="text-sm text-blue-700">
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nächste Schritte */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Nächste Schritte:</h4>
                  <p className="text-sm text-purple-700">
                    Klicke auf "GFK-Transformation starten", um deine Aussage mit diesen zusätzlichen Informationen 
                    in eine empathische GFK-Formulierung zu verwandeln.
                  </p>
                </div>
              </div>
            ) : (
              // Fragen-Seite
              <>
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">💡 GFK-Übung für registrierte Nutzer</p>
                        <p>Vertiefe deine Situation durch diese strukturierten Fragen. Das hilft dir, die vier GFK-Schritte besser zu verstehen und anzuwenden.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Beantworte die folgenden Fragen, um deine GFK-Formulierung zu verbessern und mehr über die Situation zu lernen.
                  </p>
                </div>

                {/* Current Question */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      {currentQuestion.question}
                    </label>
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Heart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">GFK-Tipp:</p>
                        <p>Diese Übung hilft dir, die Beobachtung (Was ist passiert?) und das Bedürfnis (Was ist dir wichtig?) klarer zu erkennen. Das sind die Grundlagen für eine gute GFK-Formulierung.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            {showSummary ? (
              // Footer für Zusammenfassung
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToQuestions}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  <span>Zurück zu den Fragen</span>
                </button>
              </div>
            ) : (
              // Footer für Fragen
              <div className="flex items-center space-x-3">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    <span>Zurück</span>
                  </button>
                )}
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Überspringen
                </button>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={showSummary ? handleFinishExercise : handleNext}
                disabled={!showSummary && !answers[currentQuestion.id]?.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  (showSummary || answers[currentQuestion.id]?.trim())
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>
                  {showSummary 
                    ? 'GFK-Transformation starten' 
                    : currentQuestionIndex === questions.length - 1 
                      ? 'Übung beenden' 
                      : 'Weiter'
                  }
                </span>
                {!showSummary && currentQuestionIndex < questions.length - 1 && <ArrowRight className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 