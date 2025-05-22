import React, { useState } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, Menu, X as XIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CreditSystem from './components/CreditSystem';
import CTAForm from './components/CTAForm';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import Auth from './components/Auth';
import { useCredits } from './hooks/useCredits';
import TermsOfUse from './components/TermsOfUse';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [activeTab, setActiveTab] = useState<'gfk' | 'about' | 'contact'>('gfk');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{
    observation: string;
    feeling: string;
    need: string;
    request: string;
  } | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showNegativeFeedbackDialog, setShowNegativeFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { credits, useCredit, addCredits } = useCredits();

  // Previous methods remain the same...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    if (credits <= 0) {
      setError('Keine Credits mehr verfügbar. Bitte kaufen Sie neue Credits.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);
    setFeedbackGiven(false);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('gfk-transform', {
        body: { input: input.trim() }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setOutput(data);
      useCredit();

      await supabase.from('messages').insert([{
        input_text: input,
        output_text: data
      }]);

    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (email: string, name: string) => {
    setIsLoading(true);
    setError(null);
    setSubscribeSuccess(false);

    try {
      const { error: subscribeError } = await supabase
        .from('subscribers')
        .insert([{ name, email }]);

      if (subscribeError) {
        if (subscribeError.code === '23505') {
          throw new Error('Diese E-Mail-Adresse ist bereits registriert.');
        }
        throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }

      setSubscribeSuccess(true);
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackGiven) return;
    
    try {
      if (isHelpful) {
        setShowPositiveFeedbackDialog(true);
      } else {
        setShowNegativeFeedbackDialog(true);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const handleNegativeFeedbackSubmit = async (feedback: {
    reasons: string[];
    otherReason?: string;
    betterFormulation: string;
  }) => {
    try {
      await supabase.from('feedback').insert([{
        input_text: input,
        output_text: output,
        is_helpful: false,
        reasons: feedback.reasons,
        other_reason: feedback.otherReason,
        better_formulation: feedback.betterFormulation
      }]);
      setFeedbackGiven(true);
      setShowNegativeFeedbackDialog(false);
    } catch (err) {
      console.error('Error submitting negative feedback:', err);
    }
  };

  const handlePositiveFeedbackSubmit = async (feedback: {
    reasons: string[];
    otherReason?: string;
    additionalComment?: string;
  }) => {
    try {
      await supabase.from('feedback').insert([{
        input_text: input,
        output_text: output,
        is_helpful: true,
        reasons: feedback.reasons,
        other_reason: feedback.otherReason,
        additional_comment: feedback.additionalComment
      }]);
      setFeedbackGiven(true);
      setShowPositiveFeedbackDialog(false);
    } catch (err) {
      console.error('Error submitting positive feedback:', err);
    }
  };

  return (
    <Router>
      {/* Previous JSX remains the same until the footer section */}
      <footer className="bg-white/80 backdrop-blur-sm mt-12 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} GFKCoach - Alle Rechte vorbehalten</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              <Shield className="h-4 w-4 mr-1" />
              Datenschutz
            </button>
            <button
              onClick={() => setShowTermsOfUse(true)}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
            >
              <Shield className="h-4 w-4 mr-1" />
              Nutzungsbedingungen
            </button>
          </div>
        </div>
      </footer>

      <FeedbackDialog
        isOpen={showNegativeFeedbackDialog}
        onClose={() => setShowNegativeFeedbackDialog(false)}
        onSubmit={handleNegativeFeedbackSubmit}
      />

      <PositiveFeedbackDialog
        isOpen={showPositiveFeedbackDialog}
        onClose={() => setShowPositiveFeedbackDialog(false)}
        onSubmit={handlePositiveFeedbackSubmit}
      />

      <PrivacyPolicy
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      <TermsOfUse
        isOpen={showTermsOfUse}
        onClose={() => setShowTermsOfUse(false)}
      />
    </Router>
  );
}

const AboutContent = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-3xl mx-auto"
  >
    <div className="bg-white shadow-xl rounded-2xl p-8">
      
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Über Gewaltfreie Kommunikation</h2>
      
      <div className="space-y-6 text-gray-700">
        <p className="text-lg">
          Gewaltfreie Kommunikation (GFK) ist ein von Marshall B. Rosenberg entwickelter Ansatz, 
          der Menschen dabei hilft, selbst in herausfordernden Situationen einfühlsam und authentisch 
          zu kommunizieren.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-purple-600">Die vier Komponenten der GFK:</h3>
          <div className="grid gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-purple-50 p-4 rounded-lg transition-shadow hover:shadow-md"
            >
              <h4 className="font-semibold text-purple-700">1. Beobachtung</h4>
              <p>Beschreiben Sie die Situation objektiv, ohne zu bewerten oder zu interpretieren.</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-purple-50 p-4 rounded-lg transition-shadow hover:shadow-md"
            >
              <h4 className="font-semibold text-purple-700">2. Gefühl</h4>
              <p>Drücken Sie Ihre Gefühle aus, die durch die Situation entstehen.</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-purple-50 p-4 rounded-lg transition-shadow hover:shadow-md"
            >
              <h4 className="font-semibold text-purple-700">3. Bedürfnis</h4>
              <p>Benennen Sie die Bedürfnisse, die hinter Ihren Gefühlen stehen.</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-purple-50 p-4 rounded-lg transition-shadow hover:shadow-md"
            >
              <h4 className="font-semibold text-purple-700">4. Bitte</h4>
              <p>Formulieren Sie eine konkrete, positive und machbare Bitte.</p>
            </motion.div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-purple-600 mb-3">Vorteile der GFK:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Verbessert zwischenmenschliche Beziehungen</li>
            <li>Reduziert Konflikte und Missverständnisse</li>
            <li>Fördert empathisches Zuhören und Verstehen</li>
            <li>Ermöglicht konstruktive Konfliktlösung</li>
            <li>Stärkt emotionale Intelligenz und Selbstausdruck</li>
          </ul>
        </div>
      </div>
    </div>
  </motion.div>
);

export default App;