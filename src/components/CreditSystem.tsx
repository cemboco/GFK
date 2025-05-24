import React, { useState, useEffect } from 'react';
import { CreditCard, X, Share2, MessageSquare, Gift, Info, Star } from 'lucide-react';
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
    id: 'free',
    name: 'Basis',
    credits: 5,
    price: 0,
    period: 'pro Monat',
    description: 'Kostenlose Basis-Version'
  },
  {
    id: 'pro',
    name: 'Professional',
    credits: 50,
    price: 9.99,
    period: 'pro Monat',
    description: '7-Tage Testversion',
    trial: 7,
    popular: true
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    credits: 'Unbegrenzt',
    price: 49.99,
    period: 'pro Monat',
    description: '14-Tage Testversion',
    trial: 14
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
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [wantsToContinue, setWantsToContinue] = useState<boolean | null>(null);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [usageFrequency, setUsageFrequency] = useState<string>('');
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would typically integrate with a payment provider
    console.log(`Selected plan: ${planId}`);
  };

  const handlePackagePurchase = (packageId: string) => {
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (creditPackage) {
      // Here you would typically integrate with a payment provider
      console.log(`Purchasing package: ${packageId}`);
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
              className="bg-white rounded-2xl p-6 max-w-4xl w-full relative overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setShowCreditInfo(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Abonnements</h2>
                  <p className="text-gray-600 mt-2">Wähle den Plan, der am besten zu dir passt</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-6 rounded-xl border-2 ${
                        plan.popular
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            Beliebt
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-500 mt-2">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-purple-600">{plan.price}€</span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                      <div className="mt-2 text-gray-700">
                        <span className="font-semibold">{plan.credits}</span> Credits
                      </div>
                      {plan.trial && (
                        <div className="mt-2 text-green-600 text-sm">
                          {plan.trial} Tage kostenlos testen
                        </div>
                      )}
                      <button
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Credit-Pakete</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl border-2 border-gray-200"
                      >
                        <div className="text-2xl font-bold text-purple-600">{pkg.credits}</div>
                        <div className="text-gray-700">Credits</div>
                        <div className="mt-2 text-xl font-semibold">{pkg.price}€</div>
                        <button
                          onClick={() => handlePackagePurchase(pkg.id)}
                          className="mt-3 w-full py-2 bg-gray-100 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Kaufen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Kostenlose Credits</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <Share2 className="h-5 w-5 text-purple-600 mr-2" />
                      Teile die App und erhalte 2 Credits
                    </li>
                    <li className="flex items-center text-gray-700">
                      <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                      Gib Feedback und erhalte 1 Credit
                    </li>
                  </ul>
                </div>
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