import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, ThumbsUp, ThumbsDown, User, LogIn, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Contact from './components/Contact';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import ChatDialog from './components/ChatDialog';
import CTAForm from './components/CTAForm';
import PrivacyPolicy from './components/PrivacyPolicy';
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPositiveFeedback, setShowPositiveFeedback] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

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
      setShowFeedback(true);

      // Increment usage count
      await incrementUsage();

      // Save to database if user is authenticated
      if (user) {
        const { error: saveError } = await supabase
          .from('messages')
          .insert([{
            input_text: input.trim(),
            output_text: data,
            user_id: user.id
          }]);

        if (saveError) {
          console.error('Error saving message:', saveError);
        }
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsLoading(false);
    }
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

      if (error) {
        console.error('Error saving feedback:', error);
      }

      setShowFeedback(false);
      
      if (isHelpful) {
        setShowPositiveFeedback(true);
      }
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
              <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-8 w-8 text-purple-600" />
                      <h1 className="text-2xl font-bold text-gray-900">GFKCoach</h1>
                    </div>
                    <nav className="flex items-center space-x-6">
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
                          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Anmelden</span>
                        </Link>
                      )}
                    </nav>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                  >
                    Transformiere deine Kommunikation mit{' '}
                    <span className="text-purple-600">Gewaltfreier Kommunikation</span>
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                  >
                    Verwandle schwierige Gespräche in empathische Verbindungen. 
                    Unsere KI hilft dir dabei, nach den Prinzipien von Marshall Rosenberg zu kommunizieren.
                  </motion.p>
                </div>

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
                        Was möchtest du sagen?
                      </label>
                      <div className="relative">
                        <textarea
                          id="input"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="z.B. 'Du hörst mir nie zu!' oder 'Warum räumst du nie auf?'"
                          className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none text-lg"
                          disabled={isLoading || trackingLoading}
                        />
                        
                        {/* Usage Counter - direkt neben dem Eingabefeld */}
                        {!trackingLoading && usageInfo && (
                          <div className="absolute top-3 right-3">
                            {usageInfo.type === 'authenticated' ? (
                              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="h-4 w-4" />
                                <span>Unbegrenzt</span>
                              </div>
                            ) : (
                              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                                usageInfo.remaining > 0 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <AlertCircle className="h-4 w-4" />
                                <span>
                                  {usageInfo.remaining > 0 
                                    ? `${usageInfo.remaining} verbleibend` 
                                    : 'Limit erreicht'
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Usage Info unter dem Eingabefeld */}
                      {!trackingLoading && usageInfo && usageInfo.type !== 'authenticated' && (
                        <div className="mt-2 text-sm text-gray-600">
                          {usageInfo.remaining > 0 ? (
                            <p>
                              Sie haben noch <strong>{usageInfo.remaining}</strong> kostenlose Transformationen. 
                              <Link to="/auth" className="text-purple-600 hover:text-purple-700 ml-1">
                                Registrieren Sie sich für unbegrenzte Nutzung.
                              </Link>
                            </p>
                          ) : (
                            <p className="text-red-600">
                              Limit erreicht. 
                              <Link to="/auth" className="text-purple-600 hover:text-purple-700 ml-1">
                                Registrieren Sie sich für unbegrenzte Nutzung.
                              </Link>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading || !canUseService() || trackingLoading}
                      className={`w-full flex items-center justify-center px-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition-colors ${
                        (isLoading || !canUseService() || trackingLoading) && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                          Transformiere...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          In GFK transformieren
                        </>
                      )}
                    </motion.button>
                  </form>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
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
                        <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation</h3>
                        {user && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowChat(true)}
                            className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            GFK-Coach fragen
                          </motion.button>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-xl">
                          <h4 className="font-semibold text-blue-900 mb-2">🔍 Beobachtung</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.observation }} />
                        </div>

                        <div className="p-4 bg-green-50 rounded-xl">
                          <h4 className="font-semibold text-green-900 mb-2">💚 Gefühl</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                        </div>

                        <div className="p-4 bg-orange-50 rounded-xl">
                          <h4 className="font-semibold text-orange-900 mb-2">🎯 Bedürfnis</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.need }} />
                        </div>

                        <div className="p-4 bg-purple-50 rounded-xl">
                          <h4 className="font-semibold text-purple-900 mb-2">🙏 Bitte</h4>
                          <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: output.request }} />
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">Vollständige GFK-Formulierung:</h4>
                        <p className="text-lg text-gray-800 leading-relaxed">
                          <span dangerouslySetInnerHTML={{ __html: output.observation }} />{' '}
                          <span dangerouslySetInnerHTML={{ __html: output.feeling }} />,{' '}
                          <span dangerouslySetInnerHTML={{ __html: output.need }} />.{' '}
                          <span dangerouslySetInnerHTML={{ __html: output.request }} />
                        </p>
                      </div>

                      {showFeedback && (
                        <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                          <p className="text-gray-800 mb-4">War diese GFK-Transformation hilfreich für dich?</p>
                          <div className="flex space-x-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleFeedback(true)}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Ja, hilfreich
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleFeedback(false)}
                              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Nicht hilfreich
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* About GFK Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-8 mb-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Was ist Gewaltfreie Kommunikation?</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-gray-600 mb-4">
                        Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, 
                        die uns hilft, empathisch und authentisch zu kommunizieren. Sie basiert auf vier Schritten:
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Beobachtung</h4>
                            <p className="text-gray-600 text-sm">Was nehme ich wahr, ohne zu bewerten?</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-semibold">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Gefühl</h4>
                            <p className="text-gray-600 text-sm">Wie fühle ich mich dabei?</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-orange-600 font-semibold">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Bedürfnis</h4>
                            <p className="text-gray-600 text-sm">Welches Bedürfnis steckt dahinter?</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-semibold">4</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Bitte</h4>
                            <p className="text-gray-600 text-sm">Was kann konkret getan werden?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Beispiel-Transformation</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-red-600 mb-1">Vorher:</p>
                          <p className="text-gray-700">"Du hörst mir nie zu!"</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600 mb-1">Nachher (GFK):</p>
                          <p className="text-gray-700">
                            "Als ich dir gerade von meinem Tag erzählte, hast du auf dein Handy geschaut. 
                            Ich fühle mich nicht gehört, weil mir Aufmerksamkeit in Gesprächen wichtig ist. 
                            Könntest du dein Handy zur Seite legen, wenn wir uns unterhalten?"
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
                  transition={{ delay: 0.4 }}
                  className="grid md:grid-cols-3 gap-8 mb-12"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">KI-gestützt</h3>
                    <p className="text-gray-600">
                      Unsere KI wurde speziell für GFK trainiert und hilft dir bei jeder Transformation.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Empathisch</h3>
                    <p className="text-gray-600">
                      Lerne, deine Gefühle und Bedürfnisse klar und wertschätzend auszudrücken.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sofort anwendbar</h3>
                    <p className="text-gray-600">
                      Erhalte konkrete Formulierungen, die du direkt in deinen Gesprächen nutzen kannst.
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
                        <Heart className="h-8 w-8 text-purple-400" />
                        <h3 className="text-xl font-bold">GFKCoach</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation 
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
                      <p className="text-gray-400 text-sm">
                        Gewaltfreie Kommunikation wurde von Marshall Rosenberg entwickelt und 
                        hilft Menschen dabei, empathisch und authentisch zu kommunizieren.
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
                isOpen={showFeedback && !showPositiveFeedback}
                onClose={() => setShowFeedback(false)}
                onSubmit={(feedbackData) => handleFeedback(false, feedbackData)}
              />

              <PositiveFeedbackDialog
                isOpen={showPositiveFeedback}
                onClose={() => setShowPositiveFeedback(false)}
                onSubmit={(feedbackData) => handleFeedback(true, feedbackData)}
              />

              <ChatDialog
                isOpen={showChat}
                onClose={() => setShowChat(false)}
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

              <PrivacyPolicy
                isOpen={showPrivacyPolicy}
                onClose={() => setShowPrivacyPolicy(false)}
              />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;