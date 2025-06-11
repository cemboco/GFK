import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, LogOut, Menu, X as XIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import CTAForm from './components/CTAForm';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Profile from './components/Profile';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
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

      if (user) {
        await supabase.from('messages').insert([{
          user_id: user.id,
          input_text: input,
          output_text: data
        }]);
      }

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
        better_formulation: feedback.betterFormulation,
        user_id: user?.id
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
        additional_comment: feedback.additionalComment,
        user_id: user?.id
      }]);
      setFeedbackGiven(true);
      setShowPositiveFeedbackDialog(false);
    } catch (err) {
      console.error('Error submitting positive feedback:', err);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <MessageSquare className="h-8 w-8 text-purple-600 mr-2" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  GFKCoach
                </h1>
                <span className="ml-2 text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full hidden sm:inline-block">
                  Beta-Version
                </span>
              </motion.div>
              
              <div className="hidden md:flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('gfk')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'gfk'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    GFK Transform
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'about'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Über GFK
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('contact')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'contact'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Kontakt
                  </div>
                </motion.button>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    >
                      Profil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Abmelden
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Anmelden
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mt-4 space-y-2"
                >
                  <button
                    onClick={() => {
                      setActiveTab('gfk');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'gfk'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2" />
                      GFK Transform
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('about');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'about'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Über GFK
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('contact');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'contact'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2" />
                      Kontakt
                    </div>
                  </button>
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      >
                        Profil
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Abmelden
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Anmelden
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/profile" /> : <Auth />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/" element={
            <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                {activeTab === 'about' ? (
                  <AboutContent />
                ) : activeTab === 'contact' ? (
                  <Contact />
                ) : (
                  <motion.div
                    key="gfk"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="text-center mb-8 sm:mb-16">
                      <h2 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 sm:text-5xl">
                        Verbessere deine Kommunikation mit KI
                      </h2>
                      <p className="mt-4 text-lg sm:text-xl text-gray-600">
                        Wandle alltägliche Nachrichten in gewaltfreie Kommunikation um - mit nur einem Klick.
                      </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-4 sm:p-8 mb-8">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Beispiele:</h3>
                      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-8">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm"
                        >
                          <p className="font-medium text-purple-800 mb-2">Ursprüngliche Nachricht:</p>
                          <p className="text-gray-700">"Du kommst schon wieder zu spät!"</p>
                          <p className="font-medium text-purple-800 mt-4 mb-2">GFK-Version:</p>
                          <p className="text-gray-700">
                            "Wenn ich sehe, dass du 15 Minuten nach der vereinbarten Zeit kommst, bin ich frustriert, 
                            weil mir Verlässlichkeit wichtig ist. Könntest du mir bitte Bescheid geben, wenn du dich verspätest?"
                          </p>
                        </motion.div>
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm"
                        >
                          <p className="font-medium text-purple-800 mb-2">Ursprüngliche Nachricht:</p>
                          <p className="text-gray-700">"Du hörst mir nie richtig zu!"</p>
                          <p className="font-medium text-purple-800 mt-4 mb-2">GFK-Version:</p>
                          <p className="text-gray-700">
                            "Wenn ich merke, dass du während unseres Gesprächs auf dein Handy schaust, 
                            fühle ich mich traurig, weil mir der Austausch mit dir wichtig ist. 
                            Wärst du bereit, dir Zeit für ein ungestörtes Gespräch zu nehmen?"
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 mb-16">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                          <label htmlFor="input" className="block text-lg font-medium text-gray-700 mb-2">
                            Was möchtest du sagen?
                          </label>
                          <textarea
                            id="input"
                            rows={4}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="shadow-sm block w-full border-2 border-gray-200 rounded-xl p-4 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out bg-white"
                            placeholder="Schreibe deine Nachricht hier..."
                          />
                        </div>

                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`px-6 py-3 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out flex items-center ${
                              (isLoading || !input.trim()) && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="h-5 w-5 mr-2" />
                            {isLoading ? 'Verarbeite...' : 'In GFK umformulieren'}
                          </motion.button>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700"
                          >
                            {error}
                          </motion.div>
                        )}
                      </form>

                      <AnimatePresence>
                        {output && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-8 space-y-6"
                          >
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">GFK-Formulierung:</h3>
                            <div className="space-y-4">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-sm"
                              >
                                <p className="text-gray-800 leading-relaxed mb-4">
                                  <span className="font-medium text-purple-700">Beobachtung:</span>{' '}
                                  <span dangerouslySetInnerHTML={{ __html: output.observation }} />
                                </p>
                                <p className="text-gray-800 leading-relaxed mb-4">
                                  <span className="font-medium text-purple-700">Gefühl:</span>{' '}
                                  <span dangerouslySetInnerHTML={{ __html: output.feeling }} />
                                </p>
                                <p className="text-gray-800 leading-relaxed mb-4">
                                  <span className="font-medium text-purple-700">Bedürfnis:</span>{' '}
                                  <span dangerouslySetInnerHTML={{ __html: output.need }} />
                                </p>
                                <p className="text-gray-800 leading-relaxed">
                                  <span className="font-medium text-purple-700">Bitte:</span>{' '}
                                  <span dangerouslySetInnerHTML={{ __html: output.request }} />
                                </p>
                              </motion.div>

                              <div className="mt-6 border-t border-gray-200 pt-6">
                                <p className="text-gray-700 mb-4">War diese Umformulierung hilfreich?</p>
                                <div className="flex justify-center gap-4">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleFeedback(true)}
                                    disabled={feedbackGiven}
                                    className={`flex items-center px-4 py-2 rounded-lg border ${
                                      feedbackGiven ? 'border-gray-200 text-gray-400' : 'border-green-500 text-green-600 hover:bg-green-50'
                                    }`}
                                  >
                                    <ThumbsUp className="h-5 w-5 mr-2" />
                                    Ja
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleFeedback(false)}
                                    disabled={feedbackGiven}
                                    className={`flex items-center px-4 py-2 rounded-lg border ${
                                      feedbackGiven ? 'border-gray-200 text-gray-400' : 'border-red-500 text-red-600 hover:bg-red-50'
                                    }`}
                                  >
                                    <ThumbsDown className="h-5 w-5 mr-2" />
                                    Nein
                                  </motion.button>
                                </div>
                                {feedbackGiven && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-gray-600 text-center mt-4"
                                  >
                                    Danke für dein Feedback!
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <CTAForm
                      onSubmit={handleEmailSubmit}
                      isLoading={isLoading}
                      error={error}
                      subscribeSuccess={subscribeSuccess}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-10 text-white text-center mt-16 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
                      <div className="relative z-10">
                        <Heart className="h-12 w-12 mx-auto mb-6 text-white opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">Hilf uns, GFKCoach zu verbessern!</h2>
                        <p className="mb-8 text-lg text-purple-100">
                          Damit wir die App weiterentwickeln können, würden wir uns freuen, dich kontaktieren zu dürfen.
                        </p>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleEmailSubmit(email, name);
                        }} className="max-w-md mx-auto space-y-4">
                          <div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Dein Name"
                              className="w-full px-6 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 backdrop-blur-sm"
                              required
                            />
                          </div>
                          <div className="flex">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Deine E-Mail"
                              className="flex-1 px-6 py-3 rounded-l-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/90 backdrop-blur-sm"
                              required
                            />
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="submit"
                              disabled={isLoading}
                              className={`bg-white text-purple-600 px-6 py-3 rounded-r-xl font-medium hover:bg-gray-50 transition duration-150 ease-in-out flex items-center ${
                                isLoading && 'opacity-50 cursor-not-allowed'
                              }`}
                            >
                              <Send className="h-5 w-5 mr-2" />
                              {isLoading ? 'Wird gesendet...' : 'Anmelden'}
                            </motion.button>
                          </div>
                        </form>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-800/20 rounded-xl text-white max-w-md mx-auto"
                          >
                            {error}
                          </motion.div>
                        )}
                        {subscribeSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-green-800/20 rounded-xl text-white max-w-md mx-auto"
                          >
                            Danke für deine Bereitschaft.
                          </motion.div>
                        )}
                
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-6 py-3 flex items-center justify-center mx-auto mt-8 max-w-max"
                    >
                      <MessageCircle className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-600">
                        49 Nutzer haben bereits getestet
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          } />
        </Routes>

        <footer className="bg-white/80 backdrop-blur-sm mt-12 py-8 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
            <p>© {new Date().getFullYear()} GFKCoach - Alle Rechte vorbehalten</p>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center mx-auto mt-2"
            >
              <Shield className="h-4 w-4 mr-1" />
              Datenschutz
            </button>
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
      </div>
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