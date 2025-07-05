import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

export default function InternationalizationDemo() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🌍 Internationalisierung Demo
        </h1>
        <p className="text-lg text-gray-600">
          Teste die mehrsprachige Funktionalität von GFKCoach
        </p>
      </div>

      {/* Language Selector */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sprachauswahl / Language Selection</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setLanguage('de')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              language === 'de'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            🇩🇪 Deutsch
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              language === 'en'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      {/* Translation Examples */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Navigation */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Navigation</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Home:</span>
              <span className="font-medium">{t.nav.home}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">About:</span>
              <span className="font-medium">{t.nav.about}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact:</span>
              <span className="font-medium">{t.nav.contact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">FAQ:</span>
              <span className="font-medium">{t.nav.faq}</span>
            </div>
          </div>
        </div>

        {/* Auth */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Authentication</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Sign In:</span>
              <span className="font-medium">{t.auth.signIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sign Up:</span>
              <span className="font-medium">{t.auth.signUp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{t.auth.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Password:</span>
              <span className="font-medium">{t.auth.password}</span>
            </div>
          </div>
        </div>

        {/* GFK Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">GFK Form</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{t.gfkForm.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Submit:</span>
              <span className="font-medium">{t.gfkForm.submitButton}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loading:</span>
              <span className="font-medium">{t.gfkForm.loading}</span>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Output</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Observation:</span>
              <span className="font-medium">{t.output.observation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Feeling:</span>
              <span className="font-medium">{t.output.feeling}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Need:</span>
              <span className="font-medium">{t.output.need}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Request:</span>
              <span className="font-medium">{t.output.request}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Language Info */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600">
          Aktuelle Sprache / Current Language: <span className="font-bold text-purple-600">{language.toUpperCase()}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Die Sprachauswahl wird automatisch gespeichert und beim nächsten Besuch wiederhergestellt.
        </p>
      </div>
    </motion.div>
  );
} 