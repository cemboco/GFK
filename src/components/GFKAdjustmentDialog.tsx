import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GFKAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialFeeling: string;
  initialNeed: string;
  observation: string;
  onConfirm: (feeling: string, need: string) => void;
}

const suggestedFeelings = [
  'frustriert',
  'besorgt',
  'enttäuscht',
  'verunsichert',
  'traurig',
  'hoffnungsvoll',
  'dankbar',
  'erleichtert'
];

const suggestedNeeds = [
  'Respekt',
  'Verständnis',
  'Verlässlichkeit',
  'Klarheit',
  'Unterstützung',
  'Wertschätzung',
  'Sicherheit',
  'Harmonie'
];

export default function GFKAdjustmentDialog({
  isOpen,
  onClose,
  initialFeeling,
  initialNeed,
  observation,
  onConfirm
}: GFKAdjustmentDialogProps) {
  const [feeling, setFeeling] = useState(initialFeeling);
  const [need, setNeed] = useState(initialNeed);
  const [customFeeling, setCustomFeeling] = useState('');
  const [customNeed, setCustomNeed] = useState('');

  const handleConfirm = () => {
    onConfirm(
      customFeeling || feeling,
      customNeed || need
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Passe deine GFK-Formulierung an
              </h3>
              <p className="text-gray-600">
                Deine Beobachtung: "{observation}"
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Wähle ein Gefühl oder gib ein eigenes ein:
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {suggestedFeelings.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFeeling(f);
                        setCustomFeeling('');
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        feeling === f && !customFeeling
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customFeeling}
                  onChange={(e) => {
                    setCustomFeeling(e.target.value);
                    setFeeling('');
                  }}
                  placeholder="Oder gib ein eigenes Gefühl ein..."
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Wähle ein Bedürfnis oder gib ein eigenes ein:
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {suggestedNeeds.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setNeed(n);
                        setCustomNeed('');
                      }}
                      className={`p-2 rounded-lg border transition-colors ${
                        need === n && !customNeed
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customNeed}
                  onChange={(e) => {
                    setCustomNeed(e.target.value);
                    setNeed('');
                  }}
                  placeholder="Oder gib ein eigenes Bedürfnis ein..."
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Bestätigen
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}