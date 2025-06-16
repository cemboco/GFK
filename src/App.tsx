import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Users, Shield, Zap, ThumbsUp, ThumbsDown, Send, Mail, User, MessageSquare, Bot, Copy, Check, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// Components
import Auth from './components/Auth';
import Profile from './components/Profile';
import Contact from './components/Contact';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import CTAForm from './components/CTAForm';
import ChatDialog from './components/ChatDialog';

// Hooks
import { useUserTracking } from './hooks/useUserTracking';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{
    observation: string;
    feeling: string;
    need: string;
    request: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const { session, isLoading: trackingLoading, canUseService, incrementUsage, getRemainingUsage, getUsageInfo } = useUserTracking();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    // Check if user can use the service
    if (!canUseService()) {
      const remaining = getRemainingUsage();
      if (remaining === 0) {
        setError('Sie haben das Limit für kostenlose Nutzungen erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.');
      } else {
        setError(`Sie haben noch ${remaining} kostenlose Nutzungen übrig.`);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);

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
      
      // Increment usage count
      await incrementUsage();

      // Save to database if user is authenticated
      if (user) {
        try {
          await supabase
            .from('messages')
            .insert([{
              user_id: user.id,
              input_text: input.trim(),
              output_text: data
            }]);
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Don't show error to user as the transformation worked
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

    if (isHelpful) {
      setShowPositiveFeedbackDialog(true);
    } else {
      setShowFeedbackDialog(true);
    }
  };

  const submitFeedback = async (feedbackData: any) => {
    if (!output) return;

    try {
      const feedbackPayload = {
        input_text: input,
        output_text: output,
        is_helpful: feedbackData.reasons ? true : false,
        reasons: feedbackData.reasons || [],
        other_reason: feedbackData.otherReason,
        better_formulation: feedbackData.betterFormulation,
        additional_comment: feedbackData.additionalComment,
        user_id: user?.id || null
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackPayload]);

      if (error) throw error;

    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const handleSubscribe = async (email: string, name: string) => {
    setSubscribeLoading(true);
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
      setSubscribeEmail('');
      setSubscribeName('');
    } catch (err) {
      console.error('Error:', err);
      setSubscribeError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;

    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const text = `${stripHtml(output.observation)} ${stripHtml(output.feeling)}, weil mir ${stripHtml(output.need)} wichtig ist. ${stripHtml(output.request)}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const usageInfo = getUsageInfo();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={
            <>
              {/* Header */}
              <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">GFKCoach</h1>
                        <p className="text-sm text-gray-600">Gewaltfreie Kommunikation mit KI</p>
                      </div>
                    </div>
                    
                    <nav className="flex items-center space-x-6">
                      <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                        Kontakt
                      </Link>
                      {user ? (
                        <Link 
                          to="/profile" 
                          className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Profil</span>
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

              <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
                <div className="space-y-16">
                  {/* Hero Section */}
                  <section className="text-center space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        Verwandle deine Kommunikation mit{' '}
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          Gewaltfreier Kommunikation
                        </span>
                      </h1>
                      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Entdecke die Kraft der empathischen Kommunikation. Unsere KI hilft dir dabei, 
                        deine Botschaften in die vier Schritte der Gewaltfreien Kommunikation nach Marshall Rosenberg zu übersetzen.
                      </p>
                    </motion.div>

                    {/* Usage Info */}
                    {!trackingLoading && usageInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto"
                      >
                        {usageInfo.type === 'authenticated' ? (
                          <p className="text-green-700 font-medium">
                            ✨ Unbegrenzte Nutzung als registrierter Benutzer
                          </p>
                        ) : (
                          <p className="text-gray-700">
                            <span className="font-medium">{usageInfo.remaining}</span> von {usageInfo.max} kostenlosen Nutzungen übrig
                          </p>
                        )}
                      </motion.div>
                    )}
                  </section>

                  {/* GFK Tool */}
                  <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          GFK-Transformation
                        </h2>
                        <p className="text-lg text-gray-600">
                          Gib deinen Text ein und lass ihn in gewaltfreie Kommunikation umwandeln
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
                            Dein ursprünglicher Text
                          </label>
                          <textarea
                            id="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="z.B. 'Du hörst mir nie zu!'"
                            className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading || !canUseService()}
                            className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 ${
                              (isLoading || !canUseService()) && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span>Transformiert...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-5 w-5" />
                                <span>In GFK umwandeln</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </form>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200"
                        >
                          {error}
                        </motion.div>
                      )}

                      {output && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-12 space-y-8"
                        >
                          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation</h3>
                              <div className="flex items-center space-x-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={copyToClipboard}
                                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
                                    className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                  >
                                    <Bot className="h-4 w-4 mr-2" />
                                    Coach fragen
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                                  <h4 className="font-semibold text-blue-900 mb-2">1. Beobachtung</h4>
                                  <p className="text-blue-800" dangerouslySetInnerHTML={{ __html: output.observation }} />
                                </div>
                                
                                <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                                  <h4 className="font-semibold text-green-900 mb-2">2. Gefühl</h4>
                                  <p className="text-green-800" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                                  <h4 className="font-semibold text-orange-900 mb-2">3. Bedürfnis</h4>
                                  <p className="text-orange-800" dangerouslySetInnerHTML={{ __html: output.need }} />
                                </div>
                                
                                <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500">
                                  <h4 className="font-semibold text-purple-900 mb-2">4. Bitte</h4>
                                  <p className="text-purple-800" dangerouslySetInnerHTML={{ __html: output.request }} />
                                </div>
                              </div>
                            </div>

                            {/* Mobile-optimierte Feedback-Buttons */}
                            <div className="border-t border-gray-200 pt-6">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                <p className="text-gray-700 font-medium text-center sm:text-left mb-2 sm:mb-0">
                                  War diese Transformation hilfreich?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleFeedback(true)}
                                    className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium min-h-[48px] touch-manipulation"
                                  >
                                    <ThumbsUp className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <span>Ja, hilfreich</span>
                                  </motion.button>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleFeedback(false)}
                                    className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium min-h-[48px] touch-manipulation"
                                  >
                                    <ThumbsDown className="h-5 w-5 mr-2 flex-shrink-0" />
                                    <span>Verbesserung</span>
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </section>

                  {/* Features Section */}
                  <section className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: Heart,
                        title: 'Empathische Kommunikation',
                        description: 'Lerne, deine Gefühle und Bedürfnisse klar und respektvoll auszudrücken.'
                      },
                      {
                        icon: Users,
                        title: 'Bessere Beziehungen',
                        description: 'Stärke deine Verbindungen durch authentische und wertschätzende Gespräche.'
                      },
                      {
                        icon: Zap,
                        title: 'Sofortige Transformation',
                        description: 'Erhalte in Sekunden eine GFK-konforme Version deiner Nachricht.'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
                      >
                        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <feature.icon className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </motion.div>
                    ))}
                  </section>

                  {/* About GFK Section */}
                  <section className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                      <h2 className="text-3xl font-bold text-gray-900">
                        Was ist Gewaltfreie Kommunikation?
                      </h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Die Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Kommunikationsmethode, 
                        die darauf abzielt, menschliche Bedürfnisse zu erfüllen, ohne dabei andere zu verletzen oder zu manipulieren.
                      </p>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                        {[
                          { step: '1', title: 'Beobachtung', description: 'Was nehme ich wahr?' },
                          { step: '2', title: 'Gefühl', description: 'Was fühle ich dabei?' },
                          { step: '3', title: 'Bedürfnis', description: 'Was brauche ich?' },
                          { step: '4', title: 'Bitte', description: 'Worum möchte ich bitten?' }
                        ].map((item, index) => (
                          <div key={index} className="text-center">
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                              {item.step}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Newsletter Section */}
                  <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 lg:p-12 text-white text-center">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <h2 className="text-3xl font-bold">
                        Bleib auf dem Laufenden
                      </h2>
                      <p className="text-xl text-purple-100">
                        Erhalte Tipps zur Gewaltfreien Kommunikation und Updates zu neuen Features.
                      </p>
                      
                      {!subscribeSuccess ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleSubscribe(subscribeEmail, subscribeName);
                        }} className="max-w-md mx-auto space-y-4">
                          <input
                            type="text"
                            value={subscribeName}
                            onChange={(e) => setSubscribeName(e.target.value)}
                            placeholder="Dein Name"
                            className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500"
                            required
                          />
                          <input
                            type="email"
                            value={subscribeEmail}
                            onChange={(e) => setSubscribeEmail(e.target.value)}
                            placeholder="Deine E-Mail"
                            className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500"
                            required
                          />
                          <button
                            type="submit"
                            disabled={subscribeLoading}
                            className={`w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors ${
                              subscribeLoading && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {subscribeLoading ? 'Wird gesendet...' : 'Jetzt anmelden'}
                          </button>
                        </form>
                      ) : (
                        <div className="bg-white/20 rounded-xl p-6">
                          <h3 className="text-xl font-semibold mb-2">Vielen Dank!</h3>
                          <p className="text-purple-100">Du wirst bald von uns hören.</p>
                        </div>
                      )}

                      {subscribeError && (
                        <div className="bg-red-500/20 border border-red-400 rounded-xl p-4">
                          {subscribeError}
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">GFKCoach</span>
                      </div>
                      <p className="text-gray-400">
                        Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4">Produkt</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Preise</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4">Unternehmen</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li><Link to="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
                        <li><a href="#" className="hover:text-white transition-colors">Über uns</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4">Legal</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>
                          <button 
                            onClick={() => setShowPrivacyPolicy(true)}
                            className="hover:text-white transition-colors text-left"
                          >
                            Datenschutz
                          </button>
                        </li>
                        <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 GFKCoach. Alle Rechte vorbehalten.</p>
                  </div>
                </div>
              </footer>

              {/* Dialogs */}
              <FeedbackDialog
                isOpen={showFeedbackDialog}
                onClose={() => setShowFeedbackDialog(false)}
                onSubmit={submitFeedback}
              />

              <PositiveFeedbackDialog
                isOpen={showPositiveFeedbackDialog}
                onClose={() => setShowPositiveFeedbackDialog(false)}
                onSubmit={submitFeedback}
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

              {/* CTA Form */}
              <CTAForm
                onSubmit={handleSubscribe}
                isLoading={subscribeLoading}
                error={subscribeError}
                subscribeSuccess={subscribeSuccess}
              />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;