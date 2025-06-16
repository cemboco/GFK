import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, ThumbsUp, ThumbsDown, Copy, Check, Sparkles, User, Menu, X, MessageSquare, Bot } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      const usageInfo = getUsageInfo();
      if (usageInfo?.type === 'authenticated') {
        setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } else {
        setError('Sie haben das Limit für kostenlose Nutzungen erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.');
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
      
      // Increment usage tracking
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
          // Don't show error to user as the transformation was successful
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

  if (trackingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
              <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        GFKCoach
                      </h1>
                    </div>

                    {/* Desktop Navigation */}
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
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Anmelden
                        </Link>
                      )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="md:hidden p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </div>

                  {/* Mobile Navigation */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-purple-100 py-4"
                      >
                        <div className="flex flex-col space-y-4">
                          <Link
                            to="/contact"
                            className="text-gray-600 hover:text-purple-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Kontakt
                          </Link>
                          <button
                            onClick={() => {
                              setShowPrivacyPolicy(true);
                              setIsMenuOpen(false);
                            }}
                            className="text-left text-gray-600 hover:text-purple-600 transition-colors"
                          >
                            Datenschutz
                          </button>
                          {user ? (
                            <Link
                              to="/profile"
                              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-fit"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Profil</span>
                            </Link>
                          ) : (
                            <Link
                              to="/auth"
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-fit"
                              onClick={() => setIsMenuOpen(false)}
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

              {/* Usage Info */}
              {usageInfo && usageInfo.type !== 'authenticated' && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-b border-purple-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="text-center">
                      <p className="text-sm text-purple-700">
                        {usageInfo.remaining > 0 ? (
                          <>Noch <strong>{usageInfo.remaining}</strong> kostenlose Nutzungen verfügbar</>
                        ) : (
                          <>Limit erreicht. <Link to="/auth" className="underline font-medium">Jetzt registrieren</Link> für unbegrenzte Nutzung</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Verwandle deine Worte in
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
                      Gewaltfreie Kommunikation
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Nutze die Kraft der KI, um deine Nachrichten in empathische und effektive Kommunikation nach Marshall Rosenberg zu transformieren.
                  </p>
                </motion.div>

                {/* Input Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="input" className="block text-lg font-medium text-gray-900 mb-3">
                        Gib deinen Text ein:
                      </label>
                      <textarea
                        id="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="z.B. 'Du hörst mir nie zu!' oder 'Das ist total unfair!'"
                        className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none text-lg"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading || !canUseService()}
                        className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center text-lg font-medium ${
                          (isLoading || !canUseService()) && 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                            Transformiert...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-3" />
                            In GFK transformieren
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
                </motion.div>

                {/* Output */}
                <AnimatePresence>
                  {output && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation:</h3>
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
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
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChatDialog(true)}
                            className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <Bot className="h-4 w-4 mr-2" />
                            Coach fragen
                          </motion.button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                          <h4 className="font-semibold text-blue-900 mb-2">Beobachtung:</h4>
                          <p className="text-blue-800" dangerouslySetInnerHTML={{ __html: output.observation }} />
                        </div>

                        <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                          <h4 className="font-semibold text-green-900 mb-2">Gefühl:</h4>
                          <p className="text-green-800" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                        </div>

                        <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
                          <h4 className="font-semibold text-orange-900 mb-2">Bedürfnis:</h4>
                          <p className="text-orange-800" dangerouslySetInnerHTML={{ __html: output.need }} />
                        </div>

                        <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500">
                          <h4 className="font-semibold text-purple-900 mb-2">Bitte:</h4>
                          <p className="text-purple-800" dangerouslySetInnerHTML={{ __html: output.request }} />
                        </div>
                      </div>

                      {/* Mobile-optimierte Feedback-Buttons */}
                      <div className="mt-8">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                          War diese Transformation hilfreich?
                        </h4>
                        
                        <div className="max-w-md mx-auto">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                handleFeedback(true);
                                setShowPositiveFeedbackDialog(true);
                              }}
                              className="flex-1 flex items-center justify-center px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium min-h-[56px] touch-manipulation"
                            >
                              <ThumbsUp className="h-5 w-5 mr-3 flex-shrink-0" />
                              <span>Ja, hilfreich!</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                handleFeedback(false);
                                setShowFeedbackDialog(true);
                              }}
                              className="flex-1 flex items-center justify-center px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-lg font-medium min-h-[56px] touch-manipulation"
                            >
                              <ThumbsDown className="h-5 w-5 mr-3 flex-shrink-0" />
                              <span>Nicht gewaltfrei</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* About GFK Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Was ist Gewaltfreie Kommunikation?</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-600 mb-6">
                        Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, die uns hilft, 
                        empathisch und authentisch zu kommunizieren. Sie basiert auf vier einfachen Schritten:
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Beobachtung</h4>
                            <p className="text-gray-600">Was nehme ich wahr, ohne zu bewerten?</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Gefühl</h4>
                            <p className="text-gray-600">Wie fühle ich mich dabei?</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-600 font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Bedürfnis</h4>
                            <p className="text-gray-600">Welches Bedürfnis steckt dahinter?</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-bold">4</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Bitte</h4>
                            <p className="text-gray-600">Was kann zur Erfüllung beitragen?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Beispiel-Transformation:</h4>
                      <div className="space-y-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <p className="text-red-800 font-medium">Vorher:</p>
                          <p className="text-red-700">"Du hörst mir nie zu!"</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <p className="text-green-800 font-medium">Nachher:</p>
                          <p className="text-green-700">
                            "Mir ist aufgefallen, dass du während unseres Gesprächs auf dein Handy geschaut hast. 
                            Das macht mich traurig, weil mir Aufmerksamkeit wichtig ist. 
                            Könntest du dein Handy zur Seite legen?"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Features Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid md:grid-cols-3 gap-8 mb-12"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">KI-gestützt</h3>
                    <p className="text-gray-600">
                      Modernste KI-Technologie analysiert deine Nachrichten und transformiert sie in empathische Kommunikation.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Empathisch</h3>
                    <p className="text-gray-600">
                      Basiert auf Marshall Rosenbergs bewährten Prinzipien der Gewaltfreien Kommunikation.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sofort einsetzbar</h3>
                    <p className="text-gray-600">
                      Erhalte sofort umsetzbare Formulierungen für deine alltäglichen Kommunikationsherausforderungen.
                    </p>
                  </div>
                </motion.div>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold">GFKCoach</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation. 
                        Für empathischere und effektivere Gespräche im Alltag.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">Links</h4>
                      <div className="space-y-2">
                        <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                          Kontakt
                        </Link>
                        <button
                          onClick={() => setShowPrivacyPolicy(true)}
                          className="block text-gray-400 hover:text-white transition-colors"
                        >
                          Datenschutz
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4">Über GFK</h4>
                      <p className="text-gray-400 text-sm">
                        Basiert auf den Prinzipien von Marshall Rosenberg und dem 
                        Center for Nonviolent Communication.
                      </p>
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