import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, MessageSquare } from 'lucide-react';

interface ContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (context: string) => void;
  originalText: string;
}

const predefinedScenarios = [
  {
    id: 'partner',
    title: 'Partnerschaft',
    description: 'Beziehung, Ehe, Dating',
    examples: ['Du hörst mir nie zu', 'Du bist nie da für mich', 'Du bist so egoistisch']
  },
  {
    id: 'family',
    title: 'Familie',
    description: 'Kinder, Eltern, Geschwister',
    examples: ['Du machst nie deine Hausaufgaben', 'Du bist so unordentlich', 'Du kommst immer zu spät']
  },
  {
    id: 'work',
    title: 'Arbeit',
    description: 'Kollegen, Chef, Kunden',
    examples: ['Das ist nicht mein Job', 'Das ist nicht mein Problem', 'Das ist nicht meine Schuld']
  },
  {
    id: 'friendship',
    title: 'Freundschaft',
    description: 'Freunde, Bekannte',
    examples: ['Du bist nie ehrlich', 'Du bist so unzuverlässig', 'Du denkst nur an dich']
  }
];

export default function ContextModal({ isOpen, onClose, onSubmit, originalText }: ContextModalProps) {
  const [customContext, setCustomContext] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [step, setStep] = useState<'scenarios' | 'custom'>('scenarios');

  const handleSubmit = () => {
    if (selectedScenario) {
      const scenario = predefinedScenarios.find(s => s.id === selectedScenario);
      onSubmit(`Kontext: ${scenario?.title} - ${scenario?.description}`);
    } else if (customContext.trim()) {
      onSubmit(`Kontext: ${customContext.trim()}`);
    }
    onClose();
    // Reset state
    setCustomContext('');
    setSelectedScenario(null);
    setStep('scenarios');
  };

  const handleSkip = () => {
    onSubmit('Standard-Kontext: Allgemeine Situation');
    onClose();
    // Reset state
    setCustomContext('');
    setSelectedScenario(null);
    setStep('scenarios');
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
              <HelpCircle className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mehr Kontext für bessere Ergebnisse</h2>
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

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Für eine präzisere GFK-Formulierung brauchen wir etwas mehr Kontext. 
                Wähle ein Szenario oder beschreibe die Situation selbst.
              </p>
            </div>

            {/* Step Navigation */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setStep('scenarios')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  step === 'scenarios'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Szenarien wählen
              </button>
              <button
                onClick={() => setStep('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  step === 'custom'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Eigenen Kontext
              </button>
            </div>

            {step === 'scenarios' ? (
              /* Scenarios Step */
              <div className="space-y-4">
                {predefinedScenarios.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedScenario === scenario.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Beispiele:</span> {scenario.examples.slice(0, 2).join(', ')}...
                        </div>
                      </div>
                      {selectedScenario === scenario.id && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              /* Custom Context Step */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibe die Situation
                  </label>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="z.B.: Mein Partner hat gestern Abend wieder nicht zugehört, als ich von meinem stressigen Tag erzählt habe..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                    rows={4}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Tipp:</p>
                      <p>Erkläre kurz, was passiert ist, wer beteiligt war und wann es stattgefunden hat. Das hilft der KI, eine passendere GFK-Formulierung zu erstellen.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Überspringen
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedScenario && !customContext.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedScenario || customContext.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Weiter
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 