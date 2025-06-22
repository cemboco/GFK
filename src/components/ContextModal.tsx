import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (context: string) => void;
  originalText: string;
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

export default function ContextModal({ isOpen, onClose, onSubmit, originalText }: ContextModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
      // Alle Fragen beantwortet - erstelle den Kontext
      const contextInfo = questions
        .map(q => `${q.key}: ${answers[q.id] || 'nicht angegeben'}`)
        .join(', ');
      
      onSubmit(`Zusätzliche Informationen: ${contextInfo}`);
      onClose();
      // Reset state
      setCurrentQuestionIndex(0);
      setAnswers({});
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
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
              <HelpCircle className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mehr Informationen für bessere Ergebnisse</h2>
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
              Frage {currentQuestionIndex + 1} von {questions.length}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Für eine präzisere GFK-Formulierung brauchen wir etwas mehr Informationen. 
                Beantworte die folgenden Fragen, um die Situation besser zu verstehen.
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
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tipp:</p>
                    <p>Sei so konkret wie möglich. Je mehr Details du gibst, desto besser kann die KI deine Situation verstehen und eine passende GFK-Formulierung erstellen.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
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
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]?.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  answers[currentQuestion.id]?.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{currentQuestionIndex === questions.length - 1 ? 'Fertig' : 'Weiter'}</span>
                {currentQuestionIndex < questions.length - 1 && <ArrowRight className="h-4 w-4" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 