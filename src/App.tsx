import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Heart, Users, Star, Menu, X, ThumbsUp, ThumbsDown, Copy, Check, Send, Mail, Shield, MessageSquare, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Contact from './components/Contact';
import CTAForm from './components/CTAForm';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import ChatDialog from './components/ChatDialog';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const { session, isLoading: trackingLoading, canUseService, incrementUsage, getRemainingUsage } = useUserTracking();

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
      setError(`Sie haben das Limit von 5 kostenlosen Nutzungen erreicht. Noch ${getRemainingUsage()} Versuche übrig.`);
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

      console.log('Feedback submitted successfully');
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  if (trackingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
                      <div className="bg-purple-600 rounded-xl p-2">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-gray-900">GFKCoach</h1>
                        <span className="text-xs text-purple-600 font-medium">Beta</span>
                      </div>
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
                        <div className="space-y-4">
                          <Link
                            to="/contact"
                            className="block text-gray-600 hover:text-purple-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Kontakt
                          </Link>
                          <button
                            onClick={() => {
                              setShowPrivacyPolicy(true);
                              setIsMenuOpen(false);
                            }}
                            className="block text-gray-600 hover:text-purple-600 transition-colors"
                          >
                            Datenschutz
                          </button>
                          {user ? (
                            <Link
                              to="/profile"
                              className="block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Profil
                            </Link>
                          ) : (
                            <Link
                              to="/auth"
                              className="block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
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

              <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
                <div className="space-y-16">
                  {/* Hero Section */}
                  <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="text-center mb-12">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                          Probiere es selbst aus
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                          Gib deinen Text ein und erlebe die Transformation in Echtzeit
                        </p>
                      </motion.div>
                    </div>

                    {/* Usage Info */}
                    {!user && session && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-center">
                          {session.type === 'authenticated' 
                            ? 'Unbegrenzte Nutzung als angemeldeter Benutzer'
                            : `Noch ${getRemainingUsage()} kostenlose Versuche übrig`
                          }
                        </p>
                      </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="input" className="block text-lg font-medium text-gray-900 mb-4">
                          Was möchtest du sagen?
                        </label>
                        <textarea
                          id="input"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="du schreibst zu langsam"
                          className="w-full h-32 px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 resize-none"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={isLoading || !canUseService()}
                          className={`px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-2xl hover:bg-purple-700 transition-all duration-200 flex items-center space-x-3 ${
                            (isLoading || !canUseService()) && 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="h-6 w-6" />
                          <span>{isLoading ? 'Wird transformiert...' : 'In GFK umwandeln'}</span>
                        </motion.button>
                      </div>
                    </form>

                    {/* Error Display */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-800 text-center">{error}</p>
                      </motion.div>
                    )}

                    {/* Output Display */}
                    {output && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 space-y-8"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation:</h3>
                          {user && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowChatDialog(true)}
                              className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                              <Bot className="h-4 w-4 mr-2" />
                              GFK-Coach fragen
                            </motion.button>
                          )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                            <div className="flex items-center mb-3">
                              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">1</span>
                              <h4 className="ml-3 font-semibold text-gray-900">Beobachtung:</h4>
                            </div>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.observation }} />
                          </div>

                          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                            <div className="flex items-center mb-3">
                              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">2</span>
                              <h4 className="ml-3 font-semibold text-gray-900">Gefühl:</h4>
                            </div>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                          </div>

                          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500">
                            <div className="flex items-center mb-3">
                              <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">3</span>
                              <h4 className="ml-3 font-semibold text-gray-900">Bedürfnis:</h4>
                            </div>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.need }} />
                          </div>

                          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                            <div className="flex items-center mb-3">
                              <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">4</span>
                              <h4 className="ml-3 font-semibold text-gray-900">Bitte:</h4>
                            </div>
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.request }} />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check className="h-5 w-5 mr-2 text-green-600" />
                                Kopiert!
                              </>
                            ) : (
                              <>
                                <Copy className="h-5 w-5 mr-2" />
                                Kopieren
                              </>
                            )}
                          </motion.button>
                        </div>

                        {/* Feedback Section - Mobile Optimized */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                          <div className="text-center mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              War diese Transformation hilfreich?
                            </h4>
                          </div>
                          
                          {/* Mobile-optimized button layout */}
                          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleFeedback(true)}
                              className="flex-1 flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                            >
                              <ThumbsUp className="h-5 w-5 mr-2" />
                              <span className="font-medium">Ja, hilfreich</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleFeedback(false)}
                              className="flex-1 flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                            >
                              <ThumbsDown className="h-5 w-5 mr-2" />
                              <span className="font-medium">Verbesserungsbedarf</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </section>

                  {/* About GFK Section */}
                  <section className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                    <div className="max-w-4xl mx-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                      >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                          Was ist Gewaltfreie Kommunikation?
                        </h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                          Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, 
                          die uns hilft, ehrlich und empathisch zu kommunizieren. Sie basiert auf vier einfachen Schritten, 
                          die Konflikte lösen und Beziehungen stärken können.
                        </p>
                      </motion.div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="space-y-6"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 rounded-full p-3">
                              <span className="text-blue-800 font-bold">1</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beobachtung</h3>
                              <p className="text-gray-600">Was nehme ich wahr, ohne zu bewerten oder zu interpretieren?</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-green-100 rounded-full p-3">
                              <span className="text-green-800 font-bold">2</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gefühl</h3>
                              <p className="text-gray-600">Welche Emotionen löst diese Beobachtung in mir aus?</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          className="space-y-6"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="bg-orange-100 rounded-full p-3">
                              <span className="text-orange-800 font-bold">3</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bedürfnis</h3>
                              <p className="text-gray-600">Welches Bedürfnis steht hinter meinem Gefühl?</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 rounded-full p-3">
                              <span className="text-purple-800 font-bold">4</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bitte</h3>
                              <p className="text-gray-600">Was kann konkret getan werden, um mein Bedürfnis zu erfüllen?</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </section>

                  {/* Features Section */}
                  <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 lg:p-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-12"
                    >
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Warum GFKCoach?
                      </h2>
                      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Unsere KI hilft dir dabei, deine Kommunikation zu verbessern und 
                        Konflikte konstruktiv zu lösen.
                      </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-2xl shadow-lg text-center"
                      >
                        <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                          <Sparkles className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">KI-gestützt</h3>
                        <p className="text-gray-600">
                          Modernste KI-Technologie analysiert deine Texte und wandelt sie in empathische GFK-Sprache um.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-2xl shadow-lg text-center"
                      >
                        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                          <Heart className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Empathisch</h3>
                        <p className="text-gray-600">
                          Lerne, deine Gefühle und Bedürfnisse klar auszudrücken, ohne andere zu verletzen.
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-8 rounded-2xl shadow-lg text-center"
                      >
                        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Beziehungen stärken</h3>
                        <p className="text-gray-600">
                          Verbessere deine Beziehungen durch klarere, wertschätzende Kommunikation.
                        </p>
                      </motion.div>
                    </div>
                  </section>

                  {/* Testimonials Section */}
                  <section className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-12"
                    >
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Was unsere Nutzer sagen
                      </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-50 p-6 rounded-2xl"
                      >
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-4">
                          "GFKCoach hat meine Art zu kommunizieren völlig verändert. Ich kann jetzt viel klarer ausdrücken, was ich brauche."
                        </p>
                        <p className="text-sm text-gray-500">- Sarah M.</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 p-6 rounded-2xl"
                      >
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-4">
                          "Endlich verstehe ich, wie ich Konflikte lösen kann, ohne dass sich jemand angegriffen fühlt."
                        </p>
                        <p className="text-sm text-gray-500">- Michael K.</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-50 p-6 rounded-2xl"
                      >
                        <div className="flex items-center mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-4">
                          "Die KI versteht genau, was ich meine, und hilft mir dabei, es empathischer zu formulieren."
                        </p>
                        <p className="text-sm text-gray-500">- Anna L.</p>
                      </motion.div>
                    </div>
                  </section>
                </div>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-purple-600 rounded-xl p-2">
                          <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">GFKCoach</h3>
                          <span className="text-sm text-purple-400">Beta</span>
                        </div>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Verbessere deine Kommunikation mit KI-gestützter gewaltfreier Kommunikation.
                      </p>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span>info@gfkcoach.com</span>
                      </div>
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
                      <h4 className="font-semibold mb-4">Rechtliches</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowPrivacyPolicy(true)}
                          className="block text-gray-400 hover:text-white transition-colors"
                        >
                          Datenschutzerklärung
                        </button>
                        <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                          Impressum
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 GFKCoach. Alle Rechte vorbehalten.</p>
                  </div>
                </div>
              </footer>

              {/* CTA Form */}
              <CTAForm
                onSubmit={handleSubscribe}
                isLoading={subscribeLoading}
                error={subscribeError}
                subscribeSuccess={subscribeSuccess}
              />

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
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;