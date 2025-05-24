import React, { useState, useEffect } from 'react';
import { CreditCard, X, Share2, MessageSquare, Gift, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredits } from '../hooks/useCredits';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface CreditSystemProps {
  onCreditUse: () => void;
  onPurchase: (credits: number) => void;
}

const CREDIT_PACKAGES = [
  { id: 'basic', name: 'Basis', credits: 10, price: 4.99, description: 'Ideal für gelegentliche Nutzung' },
  { id: 'pro', name: 'Professional', credits: 50, price: 19.99, description: 'Für regelmäßige Nutzer', popular: true },
  { id: 'unlimited', name: 'Unlimited', credits: 150, price: 49.99, description: 'Beste Wahl für intensive Nutzung' }
];

export default function CreditSystem({ onCreditUse, onPurchase }: CreditSystemProps) {
  const { credits, hasReceivedBonusCredits } = useCredits();
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showCreditInfo, setShowCreditInfo] = useState(false);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [wantsToContinue, setWantsToContinue] = useState<boolean | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [usageFrequency, setUsageFrequency] = useState<string>('');
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  useEffect(() => {
    if (credits === 0 && !hasReceivedBonusCredits) {
      setShowFeedbackDialog(true);
    }
  }, [credits, hasReceivedBonusCredits]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'GFKCoach - Gewaltfreie Kommunikation mit KI',
        text: 'Verbessere deine Kommunikation mit KI-gestützter gewaltfreier Kommunikation!',
        url: window.location.href
      });
      onPurchase(2); // Bonus credits for sharing
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 3000);
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

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

  const handleCustomPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) return;
    
    try {
      await supabase.from('credit_feedback').insert([{
        amount: price,
        message: usageFrequency
      }]);

      onPurchase(5); // Give 5 bonus credits
      setShowFeedbackDialog(false);
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showCreditInfo && (
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
              className="bg-white rounded-2xl p-6 max-w-lg w-full relative"
            >
              <button
                onClick={() => setShowCreditInfo(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Credits System</h2>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-700 mb-2">So funktionieren Credits</h3>
                    <p className="text-gray-600">
                      Jede GFK-Transformation kostet 1 Credit. Du kannst Credits auf verschiedene Weisen erhalten:
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center text-gray-600">
                        <Gift className="h-4 w-4 mr-2 text-purple-600" />
                        5 Credits kostenlos zum Start
                      </li>
                      <li className="flex items-center text-gray-600">
                        <Share2 className="h-4 w-4 mr-2 text-purple-600" />
                        2 Credits für das Teilen der App
                      </li>
                      <li className="flex items-center text-gray-600">
                        <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
                        1 Credit für detailliertes Feedback
                      </li>
                    </ul>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`relative p-4 rounded-xl border-2 ${
                          pkg.popular
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                            Beliebt
                          </span>
                        )}
                        <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-purple-600">{pkg.credits}</span>
                          <span className="text-gray-600"> Credits</span>
                        </div>
                        <p className="text-gray-700 mt-1">{pkg.price.toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

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
                    Als Dankeschön erhältst du weitere Credits.
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
                    <textarea
                      value={usageFrequency}
                      onChange={(e) => setUsageFrequency(e.target.value)}
                      placeholder="Wie oft würdest du die App nutzen?"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                      rows={3}
                    />
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

      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end space-y-2">
        {showShareSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            +2 Credits für's Teilen!
          </motion.div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreditInfo(true)}
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Info className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
          
          <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 flex items-center">
            <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-600">
              {credits} Credits
            </span>
          </div>
        </div>
      </div>
    </>
  );
}