import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Users, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check,
  User,
  LogIn,
  MessageSquare,
  Mail,
  Shield,
  Menu,
  X
} from 'lucide-react';

// Components
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

// Main Landing Page Component
function LandingPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
      setError(`Sie haben das Limit von ${getUsageInfo()?.max} Eingaben erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.`);
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

  const handleFeedback = async (isHelpful: boolean) => {
    if (isHelpful) {
      setShowPositiveFeedbackDialog(true);
    } else {
      setShowFeedbackDialog(true);
    }
  };

  const submitFeedback = async (feedbackData: any) => {
    try {
      await supabase.from('feedback').insert([{
        input_text: input,
        output_text: output,
        is_helpful: !showFeedbackDialog,
        user_id: user?.id || null,
        ...feedbackData
      }]);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">GFKCoach</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
                Über GFK
              </a>
              <a href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                Kontakt
              </a>
              {user ? (
                <a href="/profile" className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </a>
              ) : (
                <a href="/auth" className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  <LogIn className="h-4 w-4 mr-2" />
                  Anmelden
                </a>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-gray-200"
              >
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Features
                  </a>
                  <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Über GFK
                  </a>
                  <a href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">
                    Kontakt
                  </a>
                  {user ? (
                    <a href="/profile" className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </a>
                  ) : (
                    <a href="/auth" className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-fit">
                      <LogIn className="h-4 w-4 mr-2" />
                      Anmelden
                    </a>
                  )}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Verwandle deine Kommunikation mit{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                KI-gestützter GFK
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Entdecke die Kraft der Gewaltfreien Kommunikation nach Marshall Rosenberg. 
              Unsere KI hilft dir dabei, deine Nachrichten empathischer und effektiver zu formulieren.
            </p>
          </motion.div>

          {/* Usage Info */}
          {usageInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {usageInfo.type === 'authenticated' ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <User className="h-4 w-4 mr-2" />
                  Unbegrenzte Nutzung als registrierter Benutzer
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {usageInfo.remaining} von {usageInfo.max} kostenlosen Versuchen übrig
                </div>
              )}
            </motion.div>
          )}

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="input" className="block text-lg font-medium text-gray-700 mb-3">
                  Was möchtest du gewaltfrei kommunizieren?
                </label>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="z.B. 'Du hörst mir nie zu!' oder 'Immer lässt du deine Sachen rumliegen!'"
                  className="w-full h-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 resize-none text-lg"
                  disabled={isLoading}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !canUseService()}
                className={`w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 ${
                  (isLoading || !canUseService()) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                    Transformiere zu GFK...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-6 w-6 mr-3" />
                    In GFK transformieren
                  </div>
                )}
              </motion.button>
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

            {output && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Deine GFK-Transformation:</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-blue-700">Beobachtung:</span>
                      <p className="mt-1" dangerouslySetInnerHTML={{ __html: output.observation }} />
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Gefühl:</span>
                      <p className="mt-1" dangerouslySetInnerHTML={{ __html: output.feeling }} />
                    </div>
                    <div>
                      <span className="font-medium text-orange-700">Bedürfnis:</span>
                      <p className="mt-1" dangerouslySetInnerHTML={{ __html: output.need }} />
                    </div>
                    <div>
                      <span className="font-medium text-purple-700">Bitte:</span>
                      <p className="mt-1" dangerouslySetInnerHTML={{ __html: output.request }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
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
                    <MessageCircle className="h-4 w-4 mr-2" />
                    GFK-Coach fragen
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">War das hilfreich?</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(true)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(false)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Warum GFKCoach?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Entdecke die Vorteile der KI-gestützten Gewaltfreien Kommunikation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8 text-purple-600" />,
                title: "Empathische Kommunikation",
                description: "Lerne, deine Gefühle und Bedürfnisse klar und wertschätzend auszudrücken."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-purple-600" />,
                title: "KI-gestützte Transformation",
                description: "Modernste KI hilft dir dabei, deine Nachrichten nach GFK-Prinzipien umzuformulieren."
              },
              {
                icon: <Users className="h-8 w-8 text-purple-600" />,
                title: "Bessere Beziehungen",
                description: "Verbessere deine Beziehungen durch klarere und konfliktfreiere Kommunikation."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About GFK Section */}
      <section id="about" className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Was ist Gewaltfreie Kommunikation?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Die Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg ist eine Kommunikationsmethode, 
                die darauf abzielt, menschliche Bedürfnisse zu erfüllen, ohne dabei andere zu verletzen oder zu manipulieren.
              </p>
              <div className="space-y-4">
                {[
                  { step: "1", title: "Beobachtung", description: "Was nehme ich wahr?" },
                  { step: "2", title: "Gefühl", description: "Was fühle ich dabei?" },
                  { step: "3", title: "Bedürfnis", description: "Was brauche ich?" },
                  { step: "4", title: "Bitte", description: "Worum möchte ich bitten?" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Beispiel-Transformation</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-red-600 mb-2">Vorher:</h4>
                  <p className="text-gray-700 italic">"Du hörst mir nie zu!"</p>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-green-600 mb-2">Nachher (GFK):</h4>
                  <p className="text-gray-700">
                    "Mir ist aufgefallen, dass du während unseres Gesprächs auf dein Handy geschaut hast. 
                    Ich fühle mich frustriert, weil mir Aufmerksamkeit und Verbindung wichtig sind. 
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
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">GFKCoach</span>
              </div>
              <p className="text-gray-400">
                Transformiere deine Kommunikation mit KI-gestützter Gewaltfreier Kommunikation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Über GFK</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                {user ? (
                  <>
                    <li><a href="/profile" className="hover:text-white transition-colors">Mein Profil</a></li>
                    <li><button onClick={() => supabase.auth.signOut()} className="hover:text-white transition-colors">Abmelden</button></li>
                  </>
                ) : (
                  <>
                    <li><a href="/auth" className="hover:text-white transition-colors">Anmelden</a></li>
                    <li><a href="/auth" className="hover:text-white transition-colors">Registrieren</a></li>
                  </>
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
                <li><a href="/contact" className="hover:text-white transition-colors">Impressum</a></li>
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

      <CTAForm
        onSubmit={handleSubscribe}
        isLoading={subscribeLoading}
        error={subscribeError}
        subscribeSuccess={subscribeSuccess}
      />
    </div>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;