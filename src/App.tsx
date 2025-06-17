import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ThumbsUp, 
  ThumbsDown,
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Copy,
  RefreshCw,
  Star,
  Users,
  Target,
  Zap,
  Shield,
  Award,
  BookOpen,
  Lightbulb,
  Globe
} from 'lucide-react';

// Components
import Auth from './components/Auth';
import Profile from './components/Profile';
import Contact from './components/Contact';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import CTAForm from './components/CTAForm';
import ChatDialog from './components/ChatDialog';
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

function HomePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<GFKOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPositiveFeedback, setShowPositiveFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Newsletter/CTA states
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const { session, canUseService, incrementUsage, getRemainingUsage, getUsageInfo } = useUserTracking();

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
      setError(`Sie haben das Limit von ${getRemainingUsage()} kostenlosen Nutzungen erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);
    setFeedbackSubmitted(false);

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
          await supabase.from('messages').insert([{
            user_id: user.id,
            input_text: input.trim(),
            output_text: data
          }]);
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
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
    if (isHelpful) {
      setShowPositiveFeedback(true);
    } else {
      setShowFeedback(true);
    }
  };

  const submitFeedback = async (feedbackData: any) => {
    try {
      await supabase.functions.invoke('feedback', {
        body: {
          input: input,
          output: output,
          isHelpful: false,
          ...feedbackData,
          user_id: user?.id || null
        }
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const submitPositiveFeedback = async (feedbackData: any) => {
    try {
      await supabase.functions.invoke('feedback', {
        body: {
          input: input,
          output: output,
          isHelpful: true,
          ...feedbackData,
          user_id: user?.id || null
        }
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Error submitting positive feedback:', err);
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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      // Remove HTML tags for copying
      const cleanText = text.replace(/<[^>]*>/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const usageInfo = getUsageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GFKCoach
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
                Über GFK
              </a>
              <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                Kontakt
              </a>
              {user ? (
                <a href="/profile" className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </a>
              ) : (
                <a href="/auth" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Anmelden
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
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

            {/* Usage Info */}
            {usageInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                {usageInfo.type === 'authenticated' ? (
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Unbegrenzte Nutzung als registrierter Benutzer
                  </div>
                ) : (
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                    <Zap className="h-4 w-4 mr-2" />
                    {usageInfo.remaining} von {usageInfo.max} kostenlosen Versuchen übrig
                  </div>
                )}
              </motion.div>
            )}

            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Gib hier deinen Text ein, den du in gewaltfreie Kommunikation umwandeln möchtest..."
                    className="w-full h-32 px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none"
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {input.length}/500
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center ${
                    (isLoading || !input.trim()) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Transformiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      In GFK umwandeln
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

              {/* Output */}
              <AnimatePresence>
                {output && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation</h3>
                      {user && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowChatDialog(true)}
                          className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          GFK-Coach fragen
                        </motion.button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {[
                        { key: 'observation', label: 'Beobachtung', icon: '👁️', color: 'blue' },
                        { key: 'feeling', label: 'Gefühl', icon: '💭', color: 'green' },
                        { key: 'need', label: 'Bedürfnis', icon: '❤️', color: 'orange' },
                        { key: 'request', label: 'Bitte', icon: '🤝', color: 'purple' }
                      ].map(({ key, label, icon, color }) => (
                        <div key={key} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-lg font-semibold text-${color}-600 flex items-center`}>
                              <span className="mr-2">{icon}</span>
                              {label}
                            </h4>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(output[key as keyof GFKOutput], key)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                            >
                              {copiedField === key ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-400" />
                              )}
                            </motion.button>
                          </div>
                          <p 
                            className="text-gray-700 bg-gray-50 p-4 rounded-xl"
                            dangerouslySetInnerHTML={{ __html: output[key as keyof GFKOutput] }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Feedback Section */}
                    {!feedbackSubmitted && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-gray-600 mb-4">
                          War diese GFK-Transformation hilfreich?
                        </p>
                        <div className="flex justify-center space-x-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFeedback(true)}
                            className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                          >
                            <ThumbsUp className="h-5 w-5 mr-2" />
                            Ja, hilfreich
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFeedback(false)}
                            className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                          >
                            <ThumbsDown className="h-5 w-5 mr-2" />
                            Nicht hilfreich
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {feedbackSubmitted && (
                      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Vielen Dank für dein Feedback!
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warum GFKCoach?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Entdecke die Kraft der Gewaltfreien Kommunikation mit modernster KI-Technologie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Empathische Kommunikation",
                description: "Verwandle Vorwürfe in empathische Verbindungen durch die 4 Schritte der GFK."
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Sofortige Transformation",
                description: "Erhalte in Sekunden eine GFK-konforme Umformulierung deiner Nachrichten."
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Lerne durch Beispiele",
                description: "Verstehe die Prinzipien der GFK durch praktische Anwendung."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Bessere Beziehungen",
                description: "Verbessere deine Beziehungen durch klarere und wertschätzende Kommunikation."
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Datenschutz",
                description: "Deine Daten sind sicher und werden vertraulich behandelt."
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Überall verfügbar",
                description: "Nutze GFKCoach jederzeit und überall in deinem Browser."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About GFK Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Was ist Gewaltfreie Kommunikation?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Die Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Methode, 
                die uns hilft, empathisch und authentisch zu kommunizieren. Sie basiert auf 
                vier einfachen Schritten:
              </p>
              
              <div className="space-y-4">
                {[
                  { step: "1", title: "Beobachtung", description: "Was nehme ich wahr?" },
                  { step: "2", title: "Gefühl", description: "Was fühle ich dabei?" },
                  { step: "3", title: "Bedürfnis", description: "Was brauche ich?" },
                  { step: "4", title: "Bitte", description: "Worum möchte ich bitten?" }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Beispiel-Transformation</h3>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
                  <p className="text-red-800 font-medium">Vorher:</p>
                  <p className="text-red-700">"Du hörst mir nie zu!"</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
                  <p className="text-green-800 font-medium">Nachher (GFK):</p>
                  <p className="text-green-700">
                    "Mir ist aufgefallen, dass du während unseres Gesprächs auf dein Handy geschaut hast. 
                    Ich fühle mich frustriert, weil mir Aufmerksamkeit wichtig ist. 
                    Könntest du dein Handy zur Seite legen, wenn wir sprechen?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Contact />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">GFKCoach</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation 
                nach Marshall Rosenberg.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Über GFK</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Kontakt</a></li>
                {user ? (
                  <li><a href="/profile" className="hover:text-white transition-colors">Profil</a></li>
                ) : (
                  <li><a href="/auth" className="hover:text-white transition-colors">Anmelden</a></li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="hover:text-white transition-colors"
                  >
                    Datenschutz
                  </button>
                </li>
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
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={submitFeedback}
      />

      <PositiveFeedbackDialog
        isOpen={showPositiveFeedback}
        onClose={() => setShowPositiveFeedback(false)}
        onSubmit={submitPositiveFeedback}
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

      <PrivacyPolicy
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />

      {/* CTA Form */}
      <CTAForm
        onSubmit={handleSubscribe}
        isLoading={subscribeLoading}
        error={subscribeError}
        subscribeSuccess={subscribeSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;