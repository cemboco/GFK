import React, { useState, useEffect } from 'react';
import { CreditCard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredits } from '../hooks/useCredits';

interface CreditSystemProps {
  onCreditUse: () => void;
  onPurchase: (credits: number) => void;
}

export default function CreditSystem({ onCreditUse, onPurchase }: CreditSystemProps) {
  const { credits, hasReceivedBonusCredits } = useCredits();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [wantsToContinue, setWantsToContinue] = useState<boolean | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');

  useEffect(() => {
    if (credits === 0 && !hasReceivedBonusCredits) {
      setShowFeedbackDialog(true);
    }
  }, [credits, hasReceivedBonusCredits]);

  const handleFeedback = (helpful: boolean) => {
    setWasHelpful(helpful);
    if (!helpful) {
      setShowFeedbackDialog(false);
      return;
    }
    setWantsToContinue(null);
  };

  const handleContinueChoice = (wants: boolean) => {
    setWantsToContinue(wants);
    if (!wants) {
      setShowFeedbackDialog(false);
      return;
    }
  };

  const handleCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) return;
    
    onPurchase(5); // Give 5 bonus credits
    setShowFeedbackDialog(false);
  };

  return (
    <>
      <AnimatePresence>
        {showFeedbackDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowFeedbackDialog(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>

              {wasHelpful === null ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dein Feedback</h2>
                  <p className="text-gray-600">War die gewaltfreie Kommunikation für dich hilfreich?</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Nein
                    </button>
                  </div>
                </div>
              ) : wasHelpful && wantsToContinue === null ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Weiter nutzen?</h2>
                  <p className="text-gray-600">Möchtest du GFKCoach weiter nutzen?</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleContinueChoice(true)}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => handleContinueChoice(false)}
                      className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Nein
                    </button>
                  </div>
                </div>
              ) : wasHelpful && wantsToContinue ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Wertschätzung</h2>
                  <p className="text-gray-600">
                    Wie viel wär dir diese Anwendung im Monat wert und wie oft würdest du die App verwenden?
Als Dankeschön erhältst du 5 weitere Credits. Wenn diese aufgebraucht sind, musst du warten, bis die vollständige App verfügbar ist.
                  </p>
                  <form onSubmit={handleCustomPrice} className="space-y-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder="Betrag in Euro"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Bestätigen
                    </button>
                  </form>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2">
          <span className="font-medium text-purple-600">
            {credits} Credits verfügbar
          </span>
        </div>
      </div>
    </>
  );
}