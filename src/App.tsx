import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Heart, MessageCircle, Sparkles, Users, Shield, Zap, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare, Copy, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserTracking } from './hooks/useUserTracking';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Contact from './components/Contact';
import CTAForm from './components/CTAForm';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import ChatDialog from './components/ChatDialog';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Main Landing Page Component
function LandingPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{
    observation: string;
    feeling: string;
    need: string;
    request: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPositiveFeedback, setShowPositiveFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const { session, isLoading: trackingLoading, canUseService, incrementUsage, getRemainingUsage, getUsageInfo } = useUserTracking();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    if (!canUseService()) {
      setError('Sie haben das Limit für Eingaben erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);
    setFeedbackSubmitted(false);

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
      setShowFeedback(true);

      // Increment usage count
      await incrementUsage();

      // Save to database if user is authenticated
      if (user) {
        try {
          await supabase.from('messages').insert([{
            user_id: user.id,
            input_text: input.trim(),
            output_text: data
          }]);
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
        }
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!output) return;

    try {
      if (isHelpful) {
        setShowPositiveFeedback(true);
      } else {
        setShowFeedback(false);
        setShowPositiveFeedback(false);
        // Show negative feedback dialog
        const feedbackDialog = document.createElement('div');
        document.body.appendChild(feedbackDialog);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const handleDetailedFeedback = async (feedback: any) => {
    if (!output) return;

    try {
      await supabase.functions.invoke('feedback', {
        body: {
          input: input,
          output: output,
          isHelpful: false,
          ...feedback,
          user_id: user?.id || null
        }
      });

      setFeedbackSubmitted(true);
      setShowFeedback(false);
    } catch (err) {
      console.error('Error submitting detailed feedback:', err);
    }
  };

  const handlePositiveFeedback = async (feedback: any) => {
    if (!output) return;

    try {
      await supabase.functions.invoke('feedback', {
        body: {
          input: input,
          output: output,
          isHelpful: true,
          ...feedback,
          user_id: user?.id || null
        }
      });

      setFeedbackSubmitted(true);
      setShowPositiveFeedback(false);
    } catch (err) {
      console.error('Error submitting positive feedback:', err);
    }
  };

  const handleCopy = async () => {
    if (!output) return;

    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const fullText = `${stripHtml(output.observation)} ${stripHtml(output.feeling)}, weil mir ${stripHtml(output.need)} wichtig ist. ${stripHtml(output.request)}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleSubscribe = async (email: string, name: string) => {
    setIsSubscribeLoading(true);
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
      console.error('Error subscribing:', err);
      setSubscribeError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  const usageInfo = getUsageInfo();

  if (trackingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">GFKCoach</span>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">Über GFK</a>
              <a href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Kontakt</a>
              {user ? (
                <a href="/profile" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Profil
                </a>
              ) : (
                <a href="/auth" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Anmelden
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Verwandle deine Kommunikation mit{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                KI-gestützter GFK
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Entdecke die Kraft der Gewaltfreien Kommunikation nach Marshall Rosenberg. 
              Unsere KI hilft dir dabei, deine Nachrichten empathisch und wirkungsvoll zu formulieren.
            </motion.p>

            {/* Usage Info */}
            {usageInfo && usageInfo.type !== 'authenticated' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto"
              >
                <p className="text-amber-800 text-sm">
                  {usageInfo.remaining > 0 ? (
                    <>Noch <strong>{usageInfo.remaining}</strong> kostenlose Versuche übrig</>
                  ) : (
                    <>Limit erreicht. <a href="/auth" className="text-purple-600 hover:underline">Registrieren</a> für unbegrenzte Nutzung</>
                  )}
                </p>
              </motion.div>
            )}

            {/* Main Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Gib hier deinen Text ein, den du in gewaltfreie Kommunikation umwandeln möchtest..."
                    className="w-full h-32 px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none"
                    disabled={isLoading || !canUseService()}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {input.length}/500
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !input.trim() || !canUseService()}
                  className={`w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg ${
                    (isLoading || !input.trim() || !canUseService()) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Transformiere...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      In GFK umwandeln
                    </div>
                  )}
                </motion.button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
                >
                  {error}
                </motion.div>
              )}

              {/* Output */}
              <AnimatePresence>
                {output && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation</h3>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCopy}
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-600" />
                              Kopiert!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Kopieren
                            </>
                          )}
                        </motion.button>
                        
                        {user && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChatDialog(true)}
                            className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Coach fragen
                          </motion.button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-semibold text-blue-900 mb-2">Beobachtung</h4>
                        <p className="text-blue-800" dangerouslySetInnerHTML={{ __html: output.observation }} />
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <h4 className="font-semibold text-green-900 mb-2">Gefühl</h4>
                        <p className="text-green-800" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                        <h4 className="font-semibold text-orange-900 mb-2">Bedürfnis</h4>
                        <p className="text-orange-800" dangerouslySetInnerHTML={{ __html: output.need }} />
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                        <h4 className="font-semibold text-purple-900 mb-2">Bitte</h4>
                        <p className="text-purple-800" dangerouslySetInnerHTML={{ __html: output.request }} />
                      </div>
                    </div>

                    {/* Feedback Buttons */}
                    {showFeedback && !feedbackSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-6 border-t border-gray-200"
                      >
                        <p className="text-gray-700 mb-4 text-center">War diese Transformation hilfreich?</p>
                        <div className="flex justify-center space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFeedback(true)}
                            className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <ThumbsUp className="h-5 w-5 mr-2" />
                            Ja, hilfreich
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFeedback(false)}
                            className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <ThumbsDown className="h-5 w-5 mr-2" />
                            Nicht gewaltfrei
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {feedbackSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-6 border-t border-gray-200 text-center"
                      >
                        <p className="text-green-700">Vielen Dank für dein Feedback! 🙏</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Warum GFKCoach?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Entdecke die Vorteile unserer KI-gestützten Gewaltfreien Kommunikation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100"
            >
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sofortige Transformation</h3>
              <p className="text-gray-600">
                Verwandle deine Nachrichten in Sekunden in empathische, gewaltfreie Kommunikation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-100"
            >
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Wissenschaftlich fundiert</h3>
              <p className="text-gray-600">
                Basiert auf Marshall Rosenbergs bewährten GFK-Prinzipien für effektive Kommunikation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100"
            >
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Für jeden geeignet</h3>
              <p className="text-gray-600">
                Perfekt für Beruf, Familie und Freundschaften. Verbessere alle deine Beziehungen.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About GFK Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Was ist Gewaltfreie Kommunikation?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Kommunikationsmethode, 
                die darauf abzielt, menschliche Bedürfnisse zu erkennen und empathisch zu kommunizieren.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Beobachtung</h4>
                    <p className="text-gray-600">Beschreibe objektiv, was du wahrnimmst</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gefühl</h4>
                    <p className="text-gray-600">Teile deine Emotionen mit</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-orange-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bedürfnis</h4>
                    <p className="text-gray-600">Erkenne und benenne deine Bedürfnisse</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Bitte</h4>
                    <p className="text-gray-600">Formuliere eine konkrete, erfüllbare Bitte</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Beispiel-Transformation</h3>
              <div className="space-y-6">
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <h4 className="font-semibold text-red-900 mb-2">Vorher (nicht GFK)</h4>
                  <p className="text-red-800">"Du kommst schon wieder zu spät! Das ist so respektlos!"</p>
                </div>
                
                <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-semibold text-green-900 mb-2">Nachher (GFK)</h4>
                  <p className="text-green-800">
                    "Mir ist aufgefallen, dass du 15 Minuten nach unserer vereinbarten Zeit angekommen bist. 
                    Ich bin frustriert, weil mir Verlässlichkeit wichtig ist. 
                    Könntest du mir beim nächsten Mal Bescheid geben, wenn du dich verspätest?"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <CTAForm 
        onSubmit={handleSubscribe}
        isLoading={isSubscribeLoading}
        error={subscribeError}
        subscribeSuccess={subscribeSuccess}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold">GFKCoach</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation 
                nach Marshall Rosenberg.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">Über GFK</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Rechtliches</h3>
              <ul className="space-y-2">
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
        isOpen={showFeedback && !showPositiveFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleDetailedFeedback}
      />

      <PositiveFeedbackDialog
        isOpen={showPositiveFeedback}
        onClose={() => setShowPositiveFeedback(false)}
        onSubmit={handlePositiveFeedback}
      />

      <PrivacyPolicy
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      <ChatDialog
        isOpen={showChatDialog}
        onClose={() => setShowChatDialog(false)}
        originalInput={input}
        gfkOutput={output || { observation: '', feeling: '', need: '', request: '' }}
        user={user}
      />
    </div>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;