import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Copy, RefreshCw, ThumbsUp, ThumbsDown, User, Menu, X, MessageSquare } from 'lucide-react';
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
  
  // Newsletter subscription states
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
      if (usageInfo && usageInfo.type !== 'authenticated') {
        setError(`Sie haben das Limit von ${usageInfo.max} kostenlosen Nutzungen erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.`);
        return;
      }
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
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="md:hidden p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50"
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
                        <nav className="flex flex-col space-y-4">
                          <Link 
                            to="/contact" 
                            className="text-gray-600 hover:text-purple-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Kontakt
                          </Link>
                          {user ? (
                            <Link 
                              to="/profile" 
                              className="flex items-center space-x-2 text-purple-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span>Profil</span>
                            </Link>
                          ) : (
                            <Link 
                              to="/auth" 
                              className="text-purple-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Anmelden
                            </Link>
                          )}
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </header>

              {/* Main Content */}
              <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Gewaltfreie Kommunikation
                    <span className="block text-purple-600">mit KI</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                    Transformieren Sie Ihre Nachrichten in empathische und effektive Kommunikation. 
                    Basierend auf Marshall Rosenbergs Prinzipien der Gewaltfreien Kommunikation.
                  </p>

                  {/* Usage Info */}
                  {usageInfo && usageInfo.type !== 'authenticated' && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        {usageInfo.remaining > 0 
                          ? `Sie haben noch ${usageInfo.remaining} von ${usageInfo.max} kostenlosen Nutzungen übrig.`
                          : `Sie haben alle ${usageInfo.max} kostenlosen Nutzungen aufgebraucht.`
                        }
                        {usageInfo.remaining <= 2 && usageInfo.remaining > 0 && (
                          <span className="block mt-1 font-medium">
                            <Link to="/auth" className="text-blue-600 hover:text-blue-800 underline">
                              Registrieren Sie sich
                            </Link> für unbegrenzte Nutzung.
                          </span>
                        )}
                      </p>
                    </div>
                  )}
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
                      <label htmlFor="input" className="block text-lg font-medium text-gray-700 mb-3">
                        Geben Sie Ihre Nachricht ein:
                      </label>
                      <textarea
                        id="input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="z.B. 'Du hörst mir nie zu!' oder 'Immer kommst du zu spät!'"
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
                        className={`px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center text-lg font-medium ${
                          (isLoading || !canUseService()) && 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Transformiert...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            In GFK umwandeln
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
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
                        <h3 className="text-2xl font-bold text-gray-900">GFK-Transformation:</h3>
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {copied ? 'Kopiert!' : 'Kopieren'}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChatDialog(true)}
                            className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
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

                      {/* Mobile-optimized Feedback Buttons */}
                      <div className="mt-8">
                        <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">
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
                              className="flex-1 flex items-center justify-center px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-lg font-medium min-h-[60px] touch-manipulation"
                            >
                              <ThumbsUp className="h-6 w-6 mr-3" />
                              Ja, hilfreich
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                handleFeedback(false);
                                setShowFeedbackDialog(true);
                              }}
                              className="flex-1 flex items-center justify-center px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-lg font-medium min-h-[60px] touch-manipulation"
                            >
                              <ThumbsDown className="h-6 w-6 mr-3" />
                              Nicht hilfreich
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* About Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Was ist Gewaltfreie Kommunikation?</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-600 mb-4">
                        Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, 
                        die uns hilft, empathisch und effektiv zu kommunizieren. Sie basiert auf vier Schritten:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Beobachtung:</strong> Was nehme ich wahr?</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Gefühl:</strong> Was fühle ich dabei?</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Bedürfnis:</strong> Was brauche ich?</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span><strong>Bitte:</strong> Worum möchte ich bitten?</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-3">Beispiel:</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-red-600">Vorher:</span>
                          <p className="text-gray-600">"Du hörst mir nie zu!"</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Nachher:</span>
                          <p className="text-gray-600">
                            "Mir ist aufgefallen, dass du während unseres Gesprächs auf dein Handy geschaut hast. 
                            Das macht mich traurig, weil mir Aufmerksamkeit wichtig ist. 
                            Könntest du dein Handy zur Seite legen?"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Success Message */}
                <AnimatePresence>
                  {subscribeSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 50 }}
                      className="fixed bottom-4 right-4 max-w-md bg-green-500 text-white p-6 rounded-2xl shadow-xl z-50"
                    >
                      <div className="flex items-center">
                        <Heart className="h-6 w-6 mr-3" />
                        <div>
                          <h4 className="font-semibold">Vielen Dank!</h4>
                          <p className="text-sm opacity-90">Wir haben Sie erfolgreich registriert.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <Heart className="h-6 w-6 text-purple-400" />
                        <h3 className="text-xl font-bold">GFKCoach</h3>
                      </div>
                      <p className="text-gray-400">
                        Transformieren Sie Ihre Kommunikation mit KI-gestützter 
                        Gewaltfreier Kommunikation nach Marshall Rosenberg.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Links</h4>
                      <ul className="space-y-2 text-gray-400">
                        <li>
                          <Link to="/contact" className="hover:text-white transition-colors">
                            Kontakt
                          </Link>
                        </li>
                        <li>
                          <button 
                            onClick={() => setShowPrivacyPolicy(true)}
                            className="hover:text-white transition-colors"
                          >
                            Datenschutz
                          </button>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Über GFK</h4>
                      <p className="text-gray-400 text-sm">
                        Basierend auf den Prinzipien von Marshall Rosenberg hilft 
                        GFKCoach dabei, empathische und effektive Kommunikation zu entwickeln.
                      </p>
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
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;