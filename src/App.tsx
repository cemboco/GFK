import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Users, Shield, Zap, ArrowRight, Send, Copy, ThumbsUp, ThumbsDown, User, LogOut, MessageSquare, Bot } from 'lucide-react';
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
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

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

      // Show success message or handle as needed
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
              <header className="relative bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-8 w-8 text-purple-600" />
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        GFKCoach
                      </span>
                    </div>
                    
                    <nav className="hidden md:flex items-center space-x-8">
                      <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                        Features
                      </a>
                      <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
                        Über GFK
                      </a>
                      <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                        Kontakt
                      </Link>
                      {user ? (
                        <div className="flex items-center space-x-4">
                          <Link 
                            to="/profile" 
                            className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <User className="h-4 w-4 mr-1" />
                            Profil
                          </Link>
                        </div>
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

              {/* Usage Info - Moved to higher z-index and better positioning */}
              {!trackingLoading && usageInfo && (
                <div className="relative z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 shadow-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <span className="font-medium text-gray-900">
                              {usageInfo.type === 'authenticated' ? (
                                'Unbegrenzte Nutzung'
                              ) : (
                                `${usageInfo.remaining} von ${usageInfo.max} Versuchen übrig`
                              )}
                            </span>
                          </div>
                          {usageInfo.type !== 'authenticated' && usageInfo.remaining <= 2 && (
                            <span className="text-sm text-orange-600 font-medium">
                              Registrieren Sie sich für unbegrenzte Nutzung!
                            </span>
                          )}
                        </div>
                        {usageInfo.type !== 'authenticated' && (
                          <Link
                            to="/auth"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-md"
                          >
                            Jetzt registrieren
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Hero Section */}
              <section className="relative pt-8 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
                    >
                      Transformiere deine{' '}
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Kommunikation
                      </span>
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                    >
                      Verwandle schwierige Gespräche in empathische Verbindungen mit KI-gestützter 
                      Gewaltfreier Kommunikation nach Marshall Rosenberg.
                    </motion.p>
                  </div>

                  {/* Main Form */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="input" className="block text-lg font-medium text-gray-900 mb-3">
                            Was möchtest du gewaltfrei ausdrücken?
                          </label>
                          <textarea
                            id="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="z.B. 'Du hörst mir nie zu!' oder 'Immer lässt du deine Sachen rumliegen!'"
                            className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none text-lg"
                            disabled={isLoading || !canUseService()}
                          />
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isLoading || !canUseService()}
                          className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center text-lg font-medium shadow-lg ${
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
                              <Sparkles className="h-5 w-5 mr-2" />
                              In GFK transformieren
                            </>
                          )}
                        </motion.button>
                      </form>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
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
                          className="mt-8 space-y-6"
                        >
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Deine GFK-Transformation:</h3>
                            <div className="space-y-4 text-lg leading-relaxed">
                              <p>
                                <span dangerouslySetInnerHTML={{ __html: output.observation }} />{' '}
                                <span dangerouslySetInnerHTML={{ __html: output.feeling }} />, weil mir{' '}
                                <span dangerouslySetInnerHTML={{ __html: output.need }} /> wichtig ist.{' '}
                                <span dangerouslySetInnerHTML={{ __html: output.request }} />
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCopy}
                              className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              <Copy className="h-5 w-5 mr-2" />
                              {copied ? 'Kopiert!' : 'Text kopieren'}
                            </motion.button>

                            {user && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowChatDialog(true)}
                                className="flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                              >
                                <Bot className="h-5 w-5 mr-2" />
                                GFK-Coach fragen
                              </motion.button>
                            )}

                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">War das hilfreich?</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  handleFeedback(true);
                                  setShowPositiveFeedbackDialog(true);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <ThumbsUp className="h-5 w-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  handleFeedback(false);
                                  setShowFeedbackDialog(true);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <ThumbsDown className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
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
                      Entdecke die Kraft der Gewaltfreien Kommunikation und transformiere deine Beziehungen
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: MessageCircle,
                        title: "Sofortige Transformation",
                        description: "Verwandle schwierige Aussagen in empathische Kommunikation - in Sekunden"
                      },
                      {
                        icon: Users,
                        title: "Bessere Beziehungen",
                        description: "Baue tiefere Verbindungen auf und löse Konflikte konstruktiv"
                      },
                      {
                        icon: Shield,
                        title: "Wissenschaftlich fundiert",
                        description: "Basiert auf Marshall Rosenbergs bewährter GFK-Methode"
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100"
                      >
                        <feature.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* About GFK Section */}
              <section id="about" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                    >
                      <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        Was ist Gewaltfreie Kommunikation?
                      </h2>
                      <p className="text-lg text-gray-600 mb-6">
                        Die Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, 
                        die uns hilft, empathisch und authentisch zu kommunizieren. Sie basiert auf 
                        vier einfachen Schritten:
                      </p>
                      <div className="space-y-4">
                        {[
                          { step: "1. Beobachtung", desc: "Was nehme ich wahr?" },
                          { step: "2. Gefühl", desc: "Was fühle ich dabei?" },
                          { step: "3. Bedürfnis", desc: "Was brauche ich?" },
                          { step: "4. Bitte", desc: "Worum möchte ich bitten?" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.step}</h4>
                              <p className="text-gray-600">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100"
                    >
                      <h3 className="text-2xl font-semibold text-gray-900 mb-4">Beispiel-Transformation</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                          <p className="text-red-800 font-medium">Vorher:</p>
                          <p className="text-red-700">"Du hörst mir nie zu!"</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-purple-600 mx-auto" />
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                          <p className="text-green-800 font-medium">Nachher:</p>
                          <p className="text-green-700">
                            "Mir ist aufgefallen, dass du während unseres Gesprächs auf dein Handy geschaut hast. 
                            Ich fühle mich frustriert, weil mir Aufmerksamkeit in unseren Gesprächen wichtig ist. 
                            Könntest du dein Handy zur Seite legen, wenn wir miteinander sprechen?"
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2 mb-4">
                        <Heart className="h-8 w-8 text-purple-400" />
                        <span className="text-2xl font-bold">GFKCoach</span>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation.
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
                      <h4 className="font-semibold mb-4">Kontakt</h4>
                      <p className="text-gray-400">info@gfkcoach.com</p>
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

              {output && (
                <ChatDialog
                  isOpen={showChatDialog}
                  onClose={() => setShowChatDialog(false)}
                  originalInput={input}
                  gfkOutput={output}
                  user={user}
                />
              )}

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