import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Shield,
  CreditCard,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import TransformationInput from './components/TransformationInput';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import CTAForm from './components/CTAForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Profile from './components/Profile';
import ChatDialog from './components/ChatDialog';
import { useUserTracking } from './hooks/useUserTracking';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GFKOutput {
  observation: string;
  feeling: string;
  need: string;
  request: string;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [gfkOutput, setGfkOutput] = useState<GFKOutput | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPositiveFeedback, setShowPositiveFeedback] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const { 
    session, 
    isLoading: isTrackingLoading, 
    canUseService, 
    incrementUsage, 
    getRemainingUsage 
  } = useUserTracking();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTransform = async () => {
    if (!inputText.trim()) return;

    // Check if user can use the service
    if (!canUseService()) {
      setError('Sie haben Ihr Limit erreicht. Melden Sie sich an für unbegrenzte Transformationen.');
      return;
    }

    setIsTransforming(true);
    setError(null);
    setGfkOutput(null);

    try {
      // Increment usage before making the request
      const canProceed = await incrementUsage();
      if (!canProceed) {
        throw new Error('Nutzungslimit erreicht. Bitte melden Sie sich an.');
      }

      const { data, error: functionError } = await supabase.functions.invoke('gfk-transform', {
        body: { input: inputText }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGfkOutput(data);

      // Save to database if user is authenticated
      if (user) {
        try {
          await supabase
            .from('messages')
            .insert([{
              user_id: user.id,
              input_text: inputText,
              output_text: data
            }]);
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Don't show this error to user as the transformation was successful
        }
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsTransforming(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!gfkOutput) return;

    if (isHelpful) {
      setShowPositiveFeedback(true);
    } else {
      setShowFeedback(true);
    }
  };

  const submitFeedback = async (feedbackData: any) => {
    try {
      const feedbackPayload = {
        input_text: inputText,
        output_text: gfkOutput,
        is_helpful: false,
        user_id: user?.id || null,
        ...feedbackData
      };

      await supabase.functions.invoke('feedback', {
        body: feedbackPayload
      });

      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const submitPositiveFeedback = async (feedbackData: any) => {
    try {
      const feedbackPayload = {
        input_text: inputText,
        output_text: gfkOutput,
        is_helpful: true,
        user_id: user?.id || null,
        ...feedbackData
      };

      await supabase.functions.invoke('feedback', {
        body: feedbackPayload
      });

      console.log('Positive feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting positive feedback:', error);
    }
  };

  const handleSubscribe = async (email: string, name: string) => {
    setIsSubscribing(true);
    setSubscribeError(null);

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email, name }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Diese E-Mail-Adresse ist bereits registriert.');
        }
        throw error;
      }

      setSubscribeSuccess(true);
    } catch (err) {
      console.error('Error:', err);
      setSubscribeError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const remainingTransformations = getRemainingUsage();
  const isAuthenticated = !!user;

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-8">
              <Contact />
            </div>
          </div>
        } />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">GFKCoach</h1>
                      <p className="text-xs text-gray-600">Gewaltfreie Kommunikation</p>
                    </div>
                  </div>
                  
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                      Kontakt
                    </Link>
                    <button 
                      onClick={() => setShowPrivacyPolicy(true)}
                      className="text-gray-600 hover:text-purple-600 transition-colors"
                    >
                      Datenschutz
                    </button>
                    {user ? (
                      <Link 
                        to="/profile" 
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Profil
                      </Link>
                    ) : (
                      <Link 
                        to="/auth" 
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Anmelden
                      </Link>
                    )}
                  </nav>
                </div>
              </div>
            </header>

            <div className="container mx-auto px-4 py-8">
              {/* Hero Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  KI-gestützte Gewaltfreie Kommunikation
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
                >
                  Verwandeln Sie Ihre{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Kommunikation
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                >
                  Nutzen Sie die Kraft der Gewaltfreien Kommunikation nach Marshall Rosenberg. 
                  Unsere KI hilft Ihnen dabei, Konflikte in Verbindungen zu verwandeln.
                </motion.p>

                {/* Trust Indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 mb-8"
                >
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Free to start</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span className="font-medium">No credit card required</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Lock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Private & secure</span>
                  </div>
                </motion.div>

                {/* Usage Counter for Anonymous Users */}
                {!isAuthenticated && !isTrackingLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm mb-6"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {remainingTransformations > 0 ? (
                      <span>Noch {remainingTransformations} kostenlose Transformationen verfügbar</span>
                    ) : (
                      <span>Melden Sie sich an für unbegrenzte Transformationen</span>
                    )}
                  </motion.div>
                )}
              </motion.div>

              {/* Main Content */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {/* Input Section */}
                  <div>
                    <TransformationInput
                      inputText={inputText}
                      setInputText={setInputText}
                      isTransforming={isTransforming}
                      onTransform={handleTransform}
                      isAuthenticated={isAuthenticated}
                      remainingTransformations={remainingTransformations}
                    />
                  </div>

                  {/* Output Section */}
                  <div>
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-red-50 border border-red-200 rounded-xl p-6"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                              <MessageCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-red-900">Fehler</h3>
                          </div>
                          <p className="text-red-700">{error}</p>
                          {!isAuthenticated && (
                            <div className="mt-4">
                              <Link 
                                to="/auth"
                                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Jetzt anmelden
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {gfkOutput && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">GFK-Transformation</h3>
                            </div>
                            {user && (
                              <button
                                onClick={() => setShowChatDialog(true)}
                                className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Coach fragen
                              </button>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">🔍 Beobachtung</h4>
                              <p className="text-blue-800" dangerouslySetInnerHTML={{ __html: gfkOutput.observation }} />
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-medium text-green-900 mb-2">💚 Gefühl</h4>
                              <p className="text-green-800" dangerouslySetInnerHTML={{ __html: gfkOutput.feeling }} />
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg">
                              <h4 className="font-medium text-orange-900 mb-2">🌟 Bedürfnis</h4>
                              <p className="text-orange-800" dangerouslySetInnerHTML={{ __html: gfkOutput.need }} />
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                              <h4 className="font-medium text-purple-900 mb-2">🙏 Bitte</h4>
                              <p className="text-purple-800" dangerouslySetInnerHTML={{ __html: gfkOutput.request }} />
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-4">War diese Transformation hilfreich?</p>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleFeedback(true)}
                                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ja, hilfreich
                              </button>
                              <button
                                onClick={() => handleFeedback(false)}
                                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Verbesserungsvorschlag
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {!gfkOutput && !error && !isTransforming && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300"
                        >
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Bereit für Ihre Transformation?</h3>
                          <p className="text-gray-600">
                            Geben Sie Ihre Nachricht ein und erleben Sie die Kraft der Gewaltfreien Kommunikation.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Features Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                  <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sofortige Transformation</h3>
                    <p className="text-gray-600">
                      Verwandeln Sie konfliktreiche Nachrichten in empathische Kommunikation in Sekunden.
                    </p>
                  </div>

                  <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Wissenschaftlich fundiert</h3>
                    <p className="text-gray-600">
                      Basiert auf Marshall Rosenbergs bewährten Prinzipien der Gewaltfreien Kommunikation.
                    </p>
                  </div>

                  <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Für alle Beziehungen</h3>
                    <p className="text-gray-600">
                      Verbessern Sie die Kommunikation in Familie, Beruf und Freundschaften.
                    </p>
                  </div>
                </motion.div>

                {/* Testimonials */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-16"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Was unsere Nutzer sagen</h2>
                    <div className="flex justify-center space-x-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 mb-4">
                        "GFKCoach hat meine Art zu kommunizieren völlig verändert. Konflikte werden zu Gesprächen, 
                        und ich fühle mich viel verbundener mit meiner Familie."
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-semibold">M</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Maria S.</p>
                          <p className="text-sm text-gray-600">Mutter und Lehrerin</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 mb-4">
                        "Als Führungskraft hilft mir GFKCoach dabei, schwierige Gespräche mit Mitarbeitern 
                        konstruktiv und wertschätzend zu führen."
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">T</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Thomas K.</p>
                          <p className="text-sm text-gray-600">Teamleiter</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA Form */}
            <CTAForm 
              onSubmit={handleSubscribe}
              isLoading={isSubscribing}
              error={subscribeError}
              subscribeSuccess={subscribeSuccess}
            />

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">GFKCoach</h3>
                        <p className="text-gray-400 text-sm">Gewaltfreie Kommunikation</p>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Transformieren Sie Ihre Kommunikation mit KI-gestützter Gewaltfreier Kommunikation 
                      nach Marshall Rosenberg.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Links</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                          Kontakt
                        </Link>
                      </li>
                      <li>
                        <button 
                          onClick={() => setShowPrivacyPolicy(true)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          Datenschutz
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Über GFK</h4>
                    <ul className="space-y-2">
                      <li>
                        <a 
                          href="https://www.gewaltfrei.de/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          Marshall Rosenberg
                        </a>
                      </li>
                      <li>
                        <a 
                          href="https://www.cnvc.org/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          Center for NVC
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                  <p className="text-gray-400">
                    © 2024 GFKCoach. Alle Rechte vorbehalten.
                  </p>
                </div>
              </div>
            </footer>

            {/* Dialogs */}
            <FeedbackDialog
              isOpen={showFeedback}
              onClose={() => setShowFeedback(false)}
              onSubmit={submitFeedback}
            />

            <PositiveFeedbackDialog
              isOpen={showPositiveFeedback}
              onClose={() => setShowPositiveFeedback(false)}
              onSubmit={submitPositiveFeedback}
            />

            <PrivacyPolicy
              isOpen={showPrivacyPolicy}
              onClose={() => setShowPrivacyPolicy(false)}
            />

            <ChatDialog
              isOpen={showChatDialog}
              onClose={() => setShowChatDialog(false)}
              originalInput={inputText}
              gfkOutput={gfkOutput || { observation: '', feeling: '', need: '', request: '' }}
              user={user}
            />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;