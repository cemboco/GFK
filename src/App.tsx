import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, ThumbsUp, ThumbsDown, Copy, Check, User, LogIn, MessageSquare, Bot, Home, Mail, Shield, Users, Zap, Target, Sparkles, ArrowRight, Star, Quote, CheckCircle, Globe, Clock, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Contact from './components/Contact';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import CTAForm from './components/CTAForm';
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
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<GFKOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
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
      setError('Sie haben das Nutzungslimit erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.');
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
    } catch (err) {
      console.error('Error subscribing:', err);
      setSubscribeError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  const usageInfo = getUsageInfo();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          GFKCoach
                        </h1>
                        <p className="text-sm text-gray-600">Gewaltfreie Kommunikation mit KI</p>
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
                          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          <span>Profil</span>
                        </Link>
                      ) : (
                        <Link
                          to="/auth"
                          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Anmelden</span>
                        </Link>
                      )}
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                      {user ? (
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <User className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link
                          to="/auth"
                          className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <LogIn className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {/* Hero Section */}
              <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                      Verwandle deine Worte in
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                        Gewaltfreie Kommunikation
                      </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                      Entdecke die Kraft der Gewaltfreien Kommunikation nach Marshall Rosenberg. 
                      Unsere KI hilft dir dabei, deine Nachrichten empathisch und wirkungsvoll zu formulieren.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                      <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-gray-700">Sofortige Transformation</span>
                      </div>
                      <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                        <Heart className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-gray-700">Empathische Kommunikation</span>
                      </div>
                      <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                        <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-gray-700">KI-gestützt</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Main Content */}
              <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
                >
                  {/* Usage Info - Positioned above the text field */}
                  {!trackingLoading && usageInfo && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              {usageInfo.type === 'authenticated' ? (
                                <User className="h-5 w-5 text-purple-600" />
                              ) : (
                                <Globe className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {usageInfo.type === 'authenticated' 
                                  ? 'Unbegrenzte Nutzung' 
                                  : `${usageInfo.remaining} von ${usageInfo.max} Versuchen übrig`
                                }
                              </p>
                              <p className="text-sm text-gray-600">
                                {usageInfo.type === 'authenticated' 
                                  ? 'Als registrierter Benutzer können Sie GFKCoach unbegrenzt nutzen'
                                  : 'Registrieren Sie sich für unbegrenzte Nutzung'
                                }
                              </p>
                            </div>
                          </div>
                          {usageInfo.type !== 'authenticated' && (
                            <Link
                              to="/auth"
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              Registrieren
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="input" className="block text-lg font-semibold text-gray-900 mb-3">
                        Was möchtest du in GFK umformulieren?
                      </label>
                      <textarea
                        id="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Beispiel: 'Du hörst mir nie zu!' oder 'Das Meeting war eine Zeitverschwendung.'"
                        className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none text-gray-900 placeholder-gray-500"
                        disabled={isLoading}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || !canUseService()}
                      className={`w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg ${
                        (isLoading || !canUseService()) && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                          Transformiere...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-3" />
                          In GFK umwandeln
                        </>
                      )}
                    </motion.button>
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

                  <AnimatePresence>
                    {output && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8 space-y-6"
                      >
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Sparkles className="h-6 w-6 text-purple-600 mr-2" />
                            Deine GFK-Formulierung:
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <h4 className="font-semibold text-blue-700 mb-2">🔍 Beobachtung:</h4>
                              <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: output.observation }} />
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <h4 className="font-semibold text-green-700 mb-2">💭 Gefühl:</h4>
                              <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <h4 className="font-semibold text-orange-700 mb-2">❤️ Bedürfnis:</h4>
                              <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: output.need }} />
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <h4 className="font-semibold text-purple-700 mb-2">🙏 Bitte:</h4>
                              <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: output.request }} />
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCopy}
                              className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
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

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowChatDialog(true)}
                              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                            >
                              <Bot className="h-4 w-4 mr-2" />
                              GFK-Coach fragen
                            </motion.button>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-gray-700 mb-4 font-medium">War diese GFK-Formulierung hilfreich?</p>
                            <div className="flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  handleFeedback(true);
                                  setShowPositiveFeedbackDialog(true);
                                }}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Ja, hilfreich
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFeedbackDialog(true)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <ThumbsDown className="h-4 w-4 mr-2" />
                                Nicht gewaltfrei
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* About GFK Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="mt-20"
                >
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Was ist Gewaltfreie Kommunikation?
                      </h2>
                      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Die Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, 
                        die uns hilft, empathisch und authentisch zu kommunizieren.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-blue-50 rounded-2xl">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Target className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Beobachtung</h3>
                        <p className="text-gray-600 text-sm">
                          Beschreibe objektiv, was du siehst oder hörst, ohne zu bewerten oder zu interpretieren.
                        </p>
                      </div>

                      <div className="text-center p-6 bg-green-50 rounded-2xl">
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Gefühl</h3>
                        <p className="text-gray-600 text-sm">
                          Teile deine echten Gefühle mit, ohne Vorwürfe oder Schuldzuweisungen.
                        </p>
                      </div>

                      <div className="text-center p-6 bg-orange-50 rounded-2xl">
                        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Bedürfnis</h3>
                        <p className="text-gray-600 text-sm">
                          Erkenne und benenne die universellen menschlichen Bedürfnisse hinter deinen Gefühlen.
                        </p>
                      </div>

                      <div className="text-center p-6 bg-purple-50 rounded-2xl">
                        <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Bitte</h3>
                        <p className="text-gray-600 text-sm">
                          Formuliere eine konkrete, positive Bitte, die zur Erfüllung deiner Bedürfnisse beiträgt.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Features Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-20"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl p-8 md:p-12 text-white">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Warum GFKCoach?
                      </h2>
                      <p className="text-lg text-purple-100 max-w-3xl mx-auto">
                        Unsere KI-gestützte Plattform macht Gewaltfreie Kommunikation zugänglich und praktisch anwendbar.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="text-center">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Sofortige Transformation</h3>
                        <p className="text-purple-100">
                          Verwandle deine Nachrichten in Sekundenschnelle in empathische GFK-Formulierungen.
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bot className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">KI-gestütztes Lernen</h3>
                        <p className="text-purple-100">
                          Lerne durch praktische Anwendung und erhalte personalisierte Verbesserungsvorschläge.
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Bewährte Methode</h3>
                        <p className="text-purple-100">
                          Basiert auf Marshall Rosenbergs wissenschaftlich fundierter GFK-Methode.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Testimonials Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-20"
                >
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Was unsere Nutzer sagen
                      </h2>
                      <p className="text-lg text-gray-600">
                        Erfahrungen von Menschen, die ihre Kommunikation mit GFKCoach verbessert haben.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <Quote className="h-8 w-8 text-purple-600 mb-4" />
                        <p className="text-gray-700 mb-4">
                          "GFKCoach hat meine Beziehungen zu Kollegen und Familie völlig verändert. 
                          Ich kann jetzt schwierige Gespräche führen, ohne dass jemand verletzt wird."
                        </p>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Sarah M.</p>
                            <p className="text-sm text-gray-600">Teamleiterin</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <Quote className="h-8 w-8 text-purple-600 mb-4" />
                        <p className="text-gray-700 mb-4">
                          "Als Lehrer verwende ich GFKCoach täglich. Es hilft mir, auch in stressigen 
                          Situationen ruhig und empathisch zu bleiben."
                        </p>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Michael K.</p>
                            <p className="text-sm text-gray-600">Grundschullehrer</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <Quote className="h-8 w-8 text-purple-600 mb-4" />
                        <p className="text-gray-700 mb-4">
                          "Endlich verstehe ich, wie ich meine Gefühle ausdrücken kann, ohne andere 
                          zu verletzen. GFKCoach ist ein Gamechanger!"
                        </p>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Anna L.</p>
                            <p className="text-sm text-gray-600">Studentin</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* CTA Section */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="mt-20"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl p-8 md:p-12 text-white text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Bereit für bessere Kommunikation?
                    </h2>
                    <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
                      Starte noch heute deine Reise zu empathischerer und wirkungsvollerer Kommunikation.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to="/auth"
                        className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg"
                      >
                        <User className="h-5 w-5 mr-2" />
                        Kostenlos registrieren
                      </Link>
                      <Link
                        to="/contact"
                        className="inline-flex items-center px-8 py-4 bg-purple-700 text-white rounded-xl hover:bg-purple-800 transition-colors font-semibold text-lg border-2 border-purple-500"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        Kontakt aufnehmen
                      </Link>
                    </div>
                  </div>
                </motion.section>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">GFKCoach</h3>
                          <p className="text-gray-400 text-sm">Gewaltfreie Kommunikation mit KI</p>
                        </div>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Transformiere deine Kommunikation mit der Kraft der Gewaltfreien Kommunikation 
                        nach Marshall Rosenberg, unterstützt durch moderne KI-Technologie.
                      </p>
                      <div className="flex space-x-4">
                        <a href="mailto:info@gfkcoach.com" className="text-gray-400 hover:text-white transition-colors">
                          <Mail className="h-5 w-5" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-4">Navigation</h4>
                      <ul className="space-y-2">
                        <li>
                          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                            Startseite
                          </Link>
                        </li>
                        <li>
                          <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                            Kontakt
                          </Link>
                        </li>
                        <li>
                          <Link to="/auth" className="text-gray-400 hover:text-white transition-colors">
                            Anmelden
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-4">Rechtliches</h4>
                      <ul className="space-y-2">
                        <li>
                          <button
                            onClick={() => setShowPrivacyPolicy(true)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            Datenschutz
                          </button>
                        </li>
                        <li>
                          <a href="#" className="text-gray-400 hover:text-white transition-colors">
                            Impressum
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
                isOpen={showFeedbackDialog}
                onClose={() => setShowFeedbackDialog(false)}
                onSubmit={(feedbackData) => {
                  handleFeedback(false, feedbackData);
                  setShowFeedbackDialog(false);
                }}
              />

              <PositiveFeedbackDialog
                isOpen={showPositiveFeedbackDialog}
                onClose={() => setShowPositiveFeedbackDialog(false)}
                onSubmit={(feedbackData) => {
                  handleFeedback(true, feedbackData);
                  setShowPositiveFeedbackDialog(false);
                }}
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