import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    reasons: string[];
    otherReason?: string;
    betterFormulation: string;
  }) => void;
}

export default function FeedbackDialog({ isOpen, onClose, onSubmit }: FeedbackDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [betterFormulation, setBetterFormulation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reasons: selectedReasons,
      otherReason: selectedReasons.includes('Sonstiges') ? otherReason : undefined,
      betterFormulation
    });
    onClose();
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Was genau empfandest du an der Antwort als nicht gewaltfrei?
                </h3>
                <div className="space-y-3">
                  {[
                    'Zu vorwurfsvoll',
                    'Keine klaren Gefühle ausgedrückt',
                    'Keine Bedürfnisse formuliert',
                    'Missverständliche Formulierung',
                    'Sonstiges'
                  ].map((reason) => (
                    <label key={reason} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          selectedReasons.includes(reason)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}
                        onClick={() => toggleReason(reason)}
                      >
                        {selectedReasons.includes(reason) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReasons.includes('Sonstiges') && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Bitte beschreibe, was du als nicht gewaltfrei empfunden hast..."
                    className="mt-4 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                    rows={3}
                  />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Wie würdest du dir eine bessere Formulierung wünschen?
                </h3>
                <textarea
                  value={betterFormulation}
                  onChange={(e) => setBetterFormulation(e.target.value)}
                  placeholder="Dein Vorschlag für eine bessere Formulierung..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Feedback senden
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}