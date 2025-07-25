import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';

interface CTAFormProps {
  onSubmit: (email: string, name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  subscribeSuccess: boolean;
}

export default function CTAForm({ onSubmit, isLoading, error, subscribeSuccess }: CTAFormProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show when user has scrolled 60% of the page
      if (scrollPosition > (documentHeight - windowHeight) * 0.6) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(email, name);
      
      if (!error) {
        setEmail('');
        setName('');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && !subscribeSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 z-50"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-6">
            <Heart className="h-8 w-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">
              {t.ctaForm.title}
            </h3>
            <p className="text-gray-600 mt-2">
              {t.ctaForm.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.ctaForm.namePlaceholder}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.ctaForm.emailPlaceholder}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${
                isLoading && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Wird gesendet...' : t.ctaForm.submit}
            </button>
          </form>

          

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {t.ctaForm.error}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}