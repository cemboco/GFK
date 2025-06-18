import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Menu,
  X,
  User,
  LogIn,
  MessageSquare,
  Bot
} from 'lucide-react';

// Components
import TransformationInput from './components/TransformationInput';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import CTAForm from './components/CTAForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Profile from './components/Profile';
import ChatDialog from './components/ChatDialog';

// Hooks
import { useUserTracking } from './hooks/useUserTracking';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { session, isLoading: isTrackingLoading, canUseService, incrementUsage, getRemainingUsage } = useUserTracking();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    setOutput(null);

    try {
      // Increment usage for tracking
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

      setOutput(data);

      // Save to database if user is authenticated
      if (user) {
        try {
          await supabase.from('messages').insert([{
            user_id: user.id,
            input_text: inputText,
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
      setIsTransforming(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean, feedbackData?: any) => {
    if (!output) return;

    try {
      const feedbackPayload = {
        input_text: inputText,
        output_text: output,
        is_helpful: isHelpful,
        user_id: user?.id || null,
        ...feedbackData
      };

      const { error } = await supabase.from('feedback').insert([feedbackPayload]);

      if (error) throw error;

      if (isHelpful) {
        setShowPositiveFeedbackDialog(true);
      } else {
        setShowFeedbackDialog(true);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const handleSubscribe = async (email: string, name: string) => {
    setIsSubscribing(true);
    setSubscribeError(null);

    try {
      const { error } = await supabase.from('subscribers').insert([{ email, name }]);

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

  const remainingTransformations = getRemainingUsage();
  const isAuthenticated = !!user;

  if (isTrackingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
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
          <Route path="/contact" element={
            <div className="container mx-auto px-4 py-8">
              <Contact />
            </div>
          } />
          <Route path="/" element={
            <>
              {/* Navigation */}
              <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                      <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">GFKCoach</span>
                      </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
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
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-600 hover:text-purple-600 transition-colors"
                      >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <AnimatePresence>
                    {isMenuOpen && (
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
                              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-fit"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <LogIn className="h-4 w-4" />
                              <span>Anmelden</span>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Main Content */}
              <main className="container mx-auto px-4 py-8 lg:py-12">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12 lg:mb-16"
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                    Gewaltfreie Kommunikation
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                      mit KI-Unterstützung
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                    Transformieren Sie Ihre Nachrichten in empathische, verbindende Kommunikation. 
                    Basierend auf Marshall Rosenbergs Prinzipien der Gewaltfreien Kommunikation.
                  </p>
                  
                  {!isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-8"
                    >
                      <p className="text-blue-800 text-sm">
                        <strong>Verbleibende Transformationen: {remainingTransformations}</strong>
                        <br />
                        <Link to="/auth" className="text-blue-600 hover:text-blue-700 underline">
                          Melden Sie sich an
                        </Link> für unbegrenzte Nutzung
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Transformation Section */}
                <div className="max-w-4xl mx-auto mb-16">
                  <TransformationInput
                    inputText={inputText}
                    setInputText={setInputText}
                    isTransforming={isTransforming}
                    onTransform={handleTransform}
                    isAuthenticated={isAuthenticated}
                    remainingTransformations={remainingTransformations}
                  />

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-700">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Output Display */}
                  <AnimatePresence>
                    {output && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8 bg-white rounded-xl p-6 lg:p-8 border border-gray-200 shadow-lg"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                          <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-0">
                            Ihre GFK-Transformation
                          </h3>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowChatDialog(true)}
                              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Bot className="h-4 w-4 mr-2" />
                              <span className="text-sm">GFK-Coach fragen</span>
                            </motion.button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                1. Beobachtung
                              </h4>
                              <p 
                                className="text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: output.observation }}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
                                2. Gefühl
                              </h4>
                              <p 
                                className="text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: output.feeling }}
                              />
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">
                                3. Bedürfnis
                              </h4>
                              <p 
                                className="text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: output.need }}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                4. Bitte
                              </h4>
                              <p 
                                className="text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: output.request }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Complete GFK Message */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Vollständige GFK-Nachricht:
                          </h4>
                          <p className="text-gray-800 leading-relaxed text-lg">
                            <span dangerouslySetInnerHTML={{ __html: output.observation }} />
                            {' '}
                            <span dangerouslySetInnerHTML={{ __html: output.feeling }} />
                            {', '}
                            <span dangerouslySetInnerHTML={{ __html: output.need }} />
                            {'. '}
                            <span dangerouslySetInnerHTML={{ __html: output.request }} />
                          </p>
                        </div>

                        {/* Feedback Section */}
                        <div className="border-t border-gray-200 pt-6">
                          <p className="text-gray-600 mb-4 text-center">
                            War diese Transformation hilfreich?
                          </p>
                          <div className="flex justify-center space-x-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleFeedback(true)}
                              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Ja, hilfreich
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleFeedback(false)}
                              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-5 w-5 mr-2" />
                              Nicht hilfreich
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Features Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-16"
                >
                  <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
                    Warum GFK mit KI?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                      {
                        icon: MessageCircle,
                        title: "Sofortige Transformation",
                        description: "Verwandeln Sie schwierige Nachrichten in empathische Kommunikation in Sekunden."
                      },
                      {
                        icon: Users,
                        title: "Bessere Beziehungen",
                        description: "Stärken Sie Ihre Verbindungen durch wertschätzende und klare Kommunikation."
                      },
                      {
                        icon: Sparkles,
                        title: "KI-gestützt",
                        description: "Modernste KI-Technologie basierend auf bewährten GFK-Prinzipien."
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* About GFK Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-16 bg-white rounded-xl p-8 lg:p-12 border border-gray-200 shadow-lg"
                >
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8">
                      Was ist Gewaltfreie Kommunikation?
                    </h2>
                    <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed">
                      Die Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Kommunikationsmethode, 
                      die darauf abzielt, menschliche Bedürfnisse zu erfüllen und Konflikte friedlich zu lösen.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          number: "1",
                          title: "Beobachtung",
                          description: "Was nehme ich wahr, ohne zu bewerten oder zu interpretieren?"
                        },
                        {
                          number: "2", 
                          title: "Gefühl",
                          description: "Welche Gefühle löst diese Beobachtung in mir aus?"
                        },
                        {
                          number: "3",
                          title: "Bedürfnis", 
                          description: "Welche Bedürfnisse stehen hinter meinen Gefühlen?"
                        },
                        {
                          number: "4",
                          title: "Bitte",
                          description: "Was kann getan werden, um meine Bedürfnisse zu erfüllen?"
                        }
                      ].map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="text-center"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">{step.number}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Testimonial Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mb-16 text-center"
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 lg:p-12 text-white">
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-xl lg:text-2xl font-medium mb-6 leading-relaxed">
                      "GFKCoach hat meine Art zu kommunizieren völlig verändert. Konflikte werden zu Gesprächen, 
                      und ich fühle mich viel verbundener mit meinen Mitmenschen."
                    </blockquote>
                    <cite className="text-purple-200">
                      — Sarah M., Teamleiterin
                    </cite>
                  </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center bg-white rounded-xl p-8 lg:p-12 border border-gray-200 shadow-lg"
                >
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                    Bereit für bessere Kommunikation?
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Beginnen Sie noch heute damit, Ihre Kommunikation zu transformieren. 
                    Probieren Sie GFKCoach kostenlos aus und erleben Sie den Unterschied.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      document.querySelector('textarea')?.focus();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Jetzt ausprobieren
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </motion.div>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">GFKCoach</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        Transformieren Sie Ihre Kommunikation mit KI-gestützter 
                        Gewaltfreier Kommunikation nach Marshall Rosenberg.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Links</h3>
                      <div className="space-y-2">
                        <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                          Kontakt
                        </Link>
                        <button
                          onClick={() => setShowPrivacyPolicy(true)}
                          className="block text-gray-400 hover:text-white transition-colors text-left"
                        >
                          Datenschutz
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Über GFK</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Basierend auf den Prinzipien von Marshall Rosenberg, 
                        dem Begründer der Gewaltfreien Kommunikation.
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
                  console.log('Negative feedback:', feedbackData);
                  setShowFeedbackDialog(false);
                }}
              />

              <PositiveFeedbackDialog
                isOpen={showPositiveFeedbackDialog}
                onClose={() => setShowPositiveFeedbackDialog(false)}
                onSubmit={(feedbackData) => {
                  console.log('Positive feedback:', feedbackData);
                  setShowPositiveFeedbackDialog(false);
                }}
              />

              <ChatDialog
                isOpen={showChatDialog}
                onClose={() => setShowChatDialog(false)}
                originalInput={inputText}
                gfkOutput={output || { observation: '', feeling: '', need: '', request: '' }}
                user={user}
              />

              <PrivacyPolicy
                isOpen={showPrivacyPolicy}
                onClose={() => setShowPrivacyPolicy(false)}
              />

              <CTAForm
                onSubmit={handleSubscribe}
                isLoading={isSubscribing}
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