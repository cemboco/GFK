import React, { useState, useEffect } from 'react';
import { CreditCard, X, Share2, Info, MessageSquare } from 'lucide-react';
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

const SUBSCRIPTION_PLANS = [
  {
    id: 'basis',
    name: 'Basis',
    description: 'Ideal für gelegentliche Nutzung',
    credits: 5,
    price: 0,
    period: 'pro Monat'
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Für regelmäßige Nutzer',
    credits: 20,
    price: 9.99,
    period: 'pro Monat',
    trial: 7,
    popular: true
  },
  {
    id: 'Premium',
    name: 'Unlimited',
    description: 'Beste Wahl für intensive Nutzung',
    credits: 'unbegrenzte',
    price: 49.99,
    period: 'einmalig'
  }
];

const CREDIT_PACKAGES = [
  { id: 'small', credits: 10, price: 2.99 },
  { id: 'medium', credits: 20, price: 4.99 },
  { id: 'large', credits: 50, price: 7.99 }
];

export default function CreditSystem({ onCreditUse, onPurchase }: CreditSystemProps) {
  const { credits, hasReceivedBonusCredits } = useCredits();
  const [showCreditInfo, setShowCreditInfo] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showShareError, setShowShareError] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleShare = async (method: 'native' | 'whatsapp' | 'telegram' | 'email' | 'copy') => {
    const shareData = {
      title: 'GFKCoach - Gewaltfreie Kommunikation mit KI',
      text: 'Verbessere deine Kommunikation mit KI-gestützter gewaltfreier Kommunikation!',
      url: window.location.href
    };

    try {
      switch (method) {
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData);
            onPurchase(2);
            setShowShareSuccess(true);
          }
          break;

        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`, '_blank');
          onPurchase(2);
          setShowShareSuccess(true);
          break;

        case 'telegram':
          window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`, '_blank');
          onPurchase(2);
          setShowShareSuccess(true);
          break;

        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n\n${shareData.url}`)}`;
          onPurchase(2);
          setShowShareSuccess(true);
          break;

        case 'copy':
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          onPurchase(2);
          setShowShareSuccess(true);
          break;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled the share operation
        return;
      }
      setShowShareError(true);
    } finally {
      setTimeout(() => {
        setShowShareSuccess(false);
        setShowShareError(false);
        setShowShareMenu(false);
      }, 3000);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    console.log(`Selected plan: ${planId}`);
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
              className="bg-white rounded-2xl p-4 max-w-xl w-full relative overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Credits</h2>
                <button
                  onClick={() => setShowCreditInfo(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 grid-cols-3">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-3 rounded-xl border-2 ${
                        plan.popular
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200'
                      } flex flex-col`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs">
                            Beliebt
                          </span>
                        </div>
                      )}
                      <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                      <div className="mt-1">
                        <span className="text-base font-bold text-purple-600">{plan.credits}</span>
                        <span className="text-xs text-gray-500"> Credits</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-base font-bold">{plan.price}€</span>
                        <span className="text-xs text-gray-500"> {plan.period}</span>
                      </div>
                      {plan.trial && (
                        <div className="mt-0.5 text-green-600 text-xs">
                          {plan.trial} Tage kostenlos testen
                        </div>
                      )}
                      <button
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`mt-2 w-full py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          plan.popular
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {plan.price === 0 ? 'Kostenlos starten' : 'Auswählen'}
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Einzelne Credit-Pakete</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-2 rounded-xl border-2 border-gray-200 text-center"
                      >
                        <div className="text-base font-bold text-purple-600">{pkg.credits}</div>
                        <div className="text-xs text-gray-500">Credits</div>
                        <div className="mt-0.5 text-sm font-semibold">{pkg.price}€</div>
                        <button
                          onClick={() => handlePlanSelect(pkg.id)}
                          className="mt-1 w-full py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Kaufen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-3 rounded-xl">
                  <h3 className="text-sm font-semibold text-purple-700 mb-2">Kostenlose Credits</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center text-gray-700">
                      <Share2 className="h-4 w-4 text-purple-600 mr-1" />
                      Teilen: +2 Credits
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MessageSquare className="h-4 w-4 text-purple-600 mr-1" />
                      Feedback: +1 Credit
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showShareMenu && (
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
              className="bg-white rounded-2xl p-4 max-w-sm w-full relative"
            >
              <button
                onClick={() => setShowShareMenu(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">App teilen</h3>
              <div className="space-y-2">
                {navigator.share && (
                  <button
                    onClick={() => handleShare('native')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Teilen
                  </button>
                )}
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Telegram
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  E-Mail
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Link kopieren
                </button>
              </div>
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

        {showShareError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Fehler beim Teilen
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
            onClick={() => setShowShareMenu(true)}
            className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 text-purple-600 hover:text-purple-700 transition-colors"
            title="Teilen"
          >
            <Share2 className="h-5 w-5" />
          </button>
          
          <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-4 py-2 flex items-center">
            <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-600">
              {credits}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}