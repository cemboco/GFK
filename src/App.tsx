import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Users, Shield, Zap, ThumbsUp, ThumbsDown, Copy, Check, Send, Mail, User, Menu, X, MessageSquare, Bot } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const { session, isLoading: trackingLoading, canUseService, incrementUsage, getUsageInfo } = useUserTracking();

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

  const handleCopy = async () => {
    if (!output) return;
    
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const fullText = `${stripHtml(output.observation)} ${stripHtml(output.feeling)}, weil mir ${stripHtml(output.need)} wichtig ist. ${stripHtml(output.request)}`;
    
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (isHelpful: boolean, feedbackData?: any) => {
    if (!output) return;

    try {
      const feedbackPayload = {
        input_text: input,
        output_text: output,
        is_helpful: isHelpful,
        user_id: user?.id || null,
        ...feedbackData
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackPayload]);

      if (error) throw error;

      // Show success message or handle success
      console.log('Feedback submitted successfully');
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
        if (error.code === '23505') { // Unique constraint violation
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
              <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-8 w-8 text-purple-600" />
                      <h1 className="text-2xl font-bold text-gray-900">GFKCoach</h1>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                      <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                        Kontakt
                      </Link>
                      {user ? (
                        <Link 
                          to="/profile" 
                          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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

                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="md:hidden p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </div>

                  {/* Mobile Navigation */}
                  <AnimatePresence>
                    {mobileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200 py-4"
                      >
                        <div className="flex flex-col space-y-4">
                          <Link 
                            to="/contact" 
                            className="text-gray-600 hover:text-purple-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Kontakt
                          </Link>
                          {user ? (
                            <Link 
                              to="/profile" 
                              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-fit"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Profil</span>
                            </Link>
                          ) : (
                            <Link 
                              to="/auth" 
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-fit"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Anmelden
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </header>

              {/* Main Content */}
              <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
                <div className="space-y-16">
                  {/* Hero Section */}
                  <section className="text-center space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        Verwandle deine Kommunikation mit{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                          Gewaltfreier Kommunikation
                        </span>
                      </h2>
                      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Entdecke die Kraft der Gewaltfreien Kommunikation (GFK) nach Marshall Rosenberg. 
                        Unsere KI hilft dir dabei, deine Nachrichten empathischer und wirkungsvoller zu formulieren.
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
                          <p className="text-green-600 font-medium">
                            ✨ Unbegrenzte Nutzung als registrierter Benutzer
                          </p>
                        ) : (
                          <p className="text-gray-600">
                            📝 {usageInfo.remaining} von {usageInfo.max} kostenlosen Versuchen übrig
                            {usageInfo.remaining <= 2 && (
                              <span className="block text-purple-600 text-sm mt-1">
                                <Link to="/auth" className="underline hover:no-underline">
                                  Registrieren für unbegrenzte Nutzung
                                </Link>
                              </span>
                            )}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </section>

                  {/* GFK Tool */}
                  <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          GFK-Transformation
                        </h3>
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
                            disabled={isLoading || !canUseService()}
                          />
                        </div>

                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading || !input.trim() || !canUseService()}
                            className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 ${
                              (isLoading || !input.trim() || !canUseService()) && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
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
                              <h4 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation</h4>
                              <div className="flex items-center space-x-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleCopy}
                                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  {copied ? (
                                    <>
                                      <Check className="h-4 w-4 text-green-600" />
                                      <span>Kopiert!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4" />
                                      <span>Kopieren</span>
                                    </>
                                  )}
                                </motion.button>
                                
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowChatDialog(true)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                  <Bot className="h-4 w-4" />
                                  <span className="hidden sm:inline">Coach fragen</span>
                                  <span className="sm:hidden">Fragen</span>
                                </motion.button>
                              </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-xl">
                                  <h5 className="font-semibold text-blue-900 mb-2">🔍 Beobachtung</h5>
                                  <p className="text-blue-800" dangerouslySetInnerHTML={{ __html: output.observation }} />
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl">
                                  <h5 className="font-semibold text-green-900 mb-2">💚 Gefühl</h5>
                                  <p className="text-green-800" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="p-4 bg-orange-50 rounded-xl">
                                  <h5 className="font-semibold text-orange-900 mb-2">🌟 Bedürfnis</h5>
                                  <p className="text-orange-800" dangerouslySetInnerHTML={{ __html: output.need }} />
                                </div>
                                <div className="p-4 bg-purple-50 rounded-xl">
                                  <h5 className="font-semibold text-purple-900 mb-2">🙏 Bitte</h5>
                                  <p className="text-purple-800" dangerouslySetInnerHTML={{ __html: output.request }} />
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                              <div className="text-center mb-4">
                                <p className="text-gray-600">War diese Transformation hilfreich?</p>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    handleFeedback(true);
                                    setShowPositiveFeedbackDialog(true);
                                  }}
                                  className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto justify-center"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                  <span>Ja, hilfreich</span>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowFeedbackDialog(true)}
                                  className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto justify-center"
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                  <span>Verbesserungsbedarf</span>
                                </motion.button>
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
                        icon: MessageCircle,
                        title: 'Empathische Kommunikation',
                        description: 'Verwandle Vorwürfe in verständnisvolle Gespräche'
                      },
                      {
                        icon: Users,
                        title: 'Bessere Beziehungen',
                        description: 'Stärke deine Verbindungen durch authentische Kommunikation'
                      },
                      {
                        icon: Zap,
                        title: 'Sofortige Transformation',
                        description: 'Erhalte in Sekunden eine GFK-konforme Formulierung'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
                      >
                        <feature.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </motion.div>
                    ))}
                  </section>

                  {/* About GFK Section */}
                  <section className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                      <h3 className="text-3xl font-bold text-gray-900">
                        Was ist Gewaltfreie Kommunikation?
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Kommunikationsmethode, 
                        die darauf abzielt, menschliche Bedürfnisse zu erkennen und empathisch zu kommunizieren. 
                        Sie basiert auf vier Schritten: Beobachtung, Gefühle, Bedürfnisse und Bitten.
                      </p>
                      
                      <div className="grid md:grid-cols-4 gap-6 mt-12">
                        {[
                          { step: '1', title: 'Beobachtung', description: 'Was nehme ich wahr?' },
                          { step: '2', title: 'Gefühl', description: 'Was fühle ich dabei?' },
                          { step: '3', title: 'Bedürfnis', description: 'Was brauche ich?' },
                          { step: '4', title: 'Bitte', description: 'Worum möchte ich bitten?' }
                        ].map((item, index) => (
                          <div key={index} className="text-center">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                              {item.step}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Newsletter Section */}
                  {!subscribeSuccess && (
                    <section className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 lg:p-12 text-white text-center">
                      <div className="max-w-2xl mx-auto space-y-6">
                        <h3 className="text-3xl font-bold">
                          Bleib auf dem Laufenden
                        </h3>
                        <p className="text-lg text-purple-100">
                          Erhalte Updates über neue Features und Tipps zur Gewaltfreien Kommunikation
                        </p>
                        
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleSubscribe(subscribeEmail, subscribeName);
                        }} className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <input
                              type="text"
                              value={subscribeName}
                              onChange={(e) => setSubscribeName(e.target.value)}
                              placeholder="Dein Name"
                              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                              required
                            />
                            <input
                              type="email"
                              value={subscribeEmail}
                              onChange={(e) => setSubscribeEmail(e.target.value)}
                              placeholder="Deine E-Mail"
                              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                              required
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="submit"
                              disabled={subscribeLoading}
                              className={`px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                                subscribeLoading && 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <Send className="h-4 w-4" />
                              <span>{subscribeLoading ? 'Wird gesendet...' : 'Anmelden'}</span>
                            </motion.button>
                          </div>
                        </form>

                        {subscribeError && (
                          <div className="text-red-200 bg-red-500/20 p-3 rounded-lg">
                            {subscribeError}
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {subscribeSuccess && (
                    <motion.section
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center"
                    >
                      <div className="max-w-2xl mx-auto space-y-4">
                        <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto">
                          <Check className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-900">
                          Vielen Dank für deine Anmeldung!
                        </h3>
                        <p className="text-green-700">
                          Du erhältst bald Updates über neue Features und Tipps zur Gewaltfreien Kommunikation.
                        </p>
                      </div>
                    </motion.section>
                  )}
                </div>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-6 w-6 text-purple-400" />
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
                        <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4">Unternehmen</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Über uns</a></li>
                        <li><Link to="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
                        <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-4">Rechtliches</h4>
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
                  
                  <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 GFKCoach. Alle Rechte vorbehalten.</p>
                  </div>
                </div>
              </footer>

              {/* Dialogs */}
              <FeedbackDialog
                isOpen={showFeedbackDialog}
                onClose={() => setShowFeedbackDialog(false)}
                onSubmit={(feedbackData) => handleFeedback(false, feedbackData)}
              />

              <PositiveFeedbackDialog
                isOpen={showPositiveFeedbackDialog}
                onClose={() => setShowPositiveFeedbackDialog(false)}
                onSubmit={(feedbackData) => handleFeedback(true, feedbackData)}
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