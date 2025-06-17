import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, LogOut, Menu, X as XIcon, Bot, ArrowRight, CheckCircle, Star, Users, Zap, Target, User } from 'lucide-react';
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
import ChatDialog from './components/ChatDialog';
import { useUserTracking } from './hooks/useUserTracking';

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
    variant1: string;
    variant2: string;
  } | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showNegativeFeedbackDialog, setShowNegativeFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Live typing states
  const [isTyping, setIsTyping] = useState(false);
  const [liveOutput, setLiveOutput] = useState<{
    observation: string;
    feeling: string;
    need: string;
    request: string;
    variant1: string;
    variant2: string;
  } | null>(null);

  const { session, canUseService, incrementUsage, getRemainingUsage, getUsageInfo } = useUserTracking();

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

  // Live typing effect
  const typeText = async (text: string, setter: (value: string) => void, delay: number = 30) => {
    setter('');
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      setter(text.slice(0, i));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    if (!canUseService()) {
      const remaining = getRemainingUsage();
      if (remaining === 0) {
        setError('Sie haben das Limit für Eingaben erreicht. Bitte registrieren Sie sich für unbegrenzte Nutzung.');
      } else {
        setError(`Sie haben noch ${remaining} Eingaben übrig.`);
      }
      return;
    }

    setIsLoading(true);
    setIsTyping(true);
    setError(null);
    setOutput(null);
    setLiveOutput(null);
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

      // Strip HTML for live typing
      const cleanData = {
        observation: data.observation.replace(/<[^>]*>/g, ''),
        feeling: data.feeling.replace(/<[^>]*>/g, ''),
        need: data.need.replace(/<[^>]*>/g, ''),
        request: data.request.replace(/<[^>]*>/g, ''),
        variant1: data.variant1 || '',
        variant2: data.variant2 || ''
      };

      // Initialize live output
      setLiveOutput({
        observation: '',
        feeling: '',
        need: '',
        request: '',
        variant1: '',
        variant2: ''
      });

      // Type each component with delays
      await typeText(cleanData.observation, (text) => {
        setLiveOutput(prev => prev ? { ...prev, observation: text } : null);
      }, 20);

      await new Promise(resolve => setTimeout(resolve, 300));

      await typeText(cleanData.feeling, (text) => {
        setLiveOutput(prev => prev ? { ...prev, feeling: text } : null);
      }, 25);

      await new Promise(resolve => setTimeout(resolve, 300));

      await typeText(cleanData.need, (text) => {
        setLiveOutput(prev => prev ? { ...prev, need: text } : null);
      }, 25);

      await new Promise(resolve => setTimeout(resolve, 300));

      await typeText(cleanData.request, (text) => {
        setLiveOutput(prev => prev ? { ...prev, request: text } : null);
      }, 20);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Type variant1
      await typeText(cleanData.variant1, (text) => {
        setLiveOutput(prev => prev ? { ...prev, variant1: text } : null);
      }, 15);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Type variant2
      await typeText(cleanData.variant2, (text) => {
        setLiveOutput(prev => prev ? { ...prev, variant2: text } : null);
      }, 15);

      // Set final output with HTML styling
      setOutput(data);
      setIsTyping(false);

      // Track usage
      await incrementUsage();

      // Save to database if user is authenticated
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
      setIsTyping(false);
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

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessageSuccess(false);

    try {
      const { error: messageError } = await supabase
        .from('newsletter_messages')
        .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);

      if (messageError) {
        throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }

      setMessageSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
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

  const usageInfo = getUsageInfo();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        
        {/* Usage indicator for non-authenticated users */}
        {session && session.type !== 'authenticated' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 left-4 z-40"
          >
            <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl px-4 py-2 border border-purple-100">
              <span className="font-medium text-purple-700 text-sm">
                {usageInfo?.remaining || 0} von {usageInfo?.max || 5} Eingaben übrig
              </span>
            </div>
          </motion.div>
        )}

        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    GFKCoach
                  </h1>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Beta
                  </span>
                </div>
              </motion.div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {[
                  { id: 'gfk', label: 'GFK Transform', icon: Sparkles },
                  { id: 'about', label: 'Über GFK', icon: Info },
                  { id: 'contact', label: 'Kontakt', icon: Mail }
                ].map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === item.id
                        ? 'bg-purple-100 text-purple-700 shadow-sm'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
                
                {user ? (
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to="/profile"
                      className="px-4 py-2 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    >
                      Profil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Abmelden
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="ml-4 flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Anmelden
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mt-4 space-y-2 border-t border-gray-100 pt-4"
                >
                  {[
                    { id: 'gfk', label: 'GFK Transform', icon: Sparkles },
                    { id: 'about', label: 'Über GFK', icon: Info },
                    { id: 'contact', label: 'Kontakt', icon: Mail }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      >
                        <User className="h-5 w-5" />
                        <span>Profil</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Abmelden</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium"
                    >
                      <LogIn className="h-5 w-5" />
                      <span>Anmelden</span>
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
            <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
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
                    className="space-y-16"
                  >
                    {/* Hero Section */}
                    <section className="text-center space-y-8">
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                      >
                        <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                          <Sparkles className="h-4 w-4" />
                          <span>KI-gestützte Gewaltfreie Kommunikation</span>
                        </div>
                        
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                          Verwandle deine Worte in
                          <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            empathische Kommunikation
                          </span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                          Entdecke die Kraft der Gewaltfreien Kommunikation. Unsere KI hilft dir dabei, 
                          alltägliche Nachrichten in einfühlsame und wirkungsvolle Botschaften zu verwandeln.
                        </p>
                      </motion.div>

                      {/* Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 text-center"
                      >
                        {[
                          { icon: Users, value: '1.200+', label: 'Aktive Nutzer' },
                          { icon: MessageCircle, value: '15.000+', label: 'Transformationen' },
                        ].map((stat, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <stat.icon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                              <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </section>

                    {/* Examples Section */}
                    <motion.section
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-3xl shadow-xl p-8 lg:p-12"
                    >
                      <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          Sieh die Transformation in Aktion
                        </h2>
                        <p className="text-lg text-gray-600">
                          Erlebe, wie alltägliche Aussagen zu empathischen Botschaften werden
                        </p>
                      </div>

                      <div className="grid gap-8 lg:grid-cols-2">
                        {[
                          {
                            before: "Du kommst schon wieder zu spät!",
                            after: "Mir ist aufgefallen, dass du 15 Minuten nach der vereinbarten Zeit kommst. Das frustriert mich, weil mir Verlässlichkeit wichtig ist. Könntest du mir bitte Bescheid geben, wenn du dich verspätest?"
                          },
                          {
                            before: "Du hörst mir nie richtig zu!",
                            after: "Wenn ich merke, dass du während unseres Gesprächs auf dein Handy schaust, fühle ich mich traurig, weil mir der Austausch mit dir wichtig ist. Wärst du bereit, dir Zeit für ein ungestörtes Gespräch zu nehmen?"
                          }
                        ].map((example, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="space-y-6"
                          >
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <XIcon className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-red-800 mb-2">Vorher</h4>
                                  <p className="text-red-700">"{example.before}"</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-center">
                              <ArrowRight className="h-6 w-6 text-purple-600" />
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-green-800 mb-2">Nachher (GFK)</h4>
                                  <p className="text-green-700">"{example.after}"</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>

                    {/* Main Transform Section */}
                    <motion.section
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 lg:p-12"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          Probiere es selbst aus
                        </h2>
                        <p className="text-lg text-gray-600">
                          Gib deinen Text ein und erlebe die Transformation in Echtzeit
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="input" className="block text-lg font-semibold text-gray-800 mb-3">
                            Was möchtest du sagen?
                          </label>
                          <textarea
                            id="input"
                            rows={4}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-2xl p-6 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm resize-none"
                            placeholder="Schreibe hier deine Nachricht..."
                          />
                        </div>

                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading || !input.trim() || !canUseService()}
                            className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 ${
                              (isLoading || !input.trim() || !canUseService()) && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <Sparkles className="h-6 w-6" />
                            <span>{isLoading ? 'Transformiere...' : 'In GFK umwandeln'}</span>
                          </motion.button>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-center"
                          >
                            {error}
                          </motion.div>
                        )}
                      </form>

                      {/* Results */}
                      <AnimatePresence>
                        {(liveOutput || output) && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-12 space-y-8"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation:</h3>
                              {output && !isTyping && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => user ? setShowChatDialog(true) : window.location.href = '/auth'}
                                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                                >
                                  <Bot className="h-4 w-4" />
                                  <span>{user ? 'GFK-Coach fragen' : 'Coach (Anmeldung erforderlich)'}</span>
                                </motion.button>
                              )}
                            </div>
                            
                            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                              {[
                                { label: 'Beobachtung', key: 'observation', color: 'blue' },
                                { label: 'Gefühl', key: 'feeling', color: 'green' },
                                { label: 'Bedürfnis', key: 'need', color: 'orange' },
                                { label: 'Bitte', key: 'request', color: 'purple' }
                              ].map((component, index) => (
                                <motion.div
                                  key={component.key}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start space-x-4"
                                >
                                  <div className={`w-12 h-12 bg-${component.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <span className={`text-${component.color}-600 font-bold text-lg`}>
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className={`font-semibold text-${component.color}-700 mb-2`}>
                                      {component.label}:
                                    </h4>
                                    <p className="text-gray-800 text-lg leading-relaxed">
                                      {isTyping && liveOutput ? (
                                        <span className="inline-block">
                                          {liveOutput[component.key as keyof typeof liveOutput]}
                                          {(component.key === 'observation' && liveOutput.observation) ||
                                           (component.key === 'feeling' && liveOutput.observation && !liveOutput.feeling) ||
                                           (component.key === 'need' && liveOutput.feeling && !liveOutput.need) ||
                                           (component.key === 'request' && liveOutput.need && !liveOutput.request) ? (
                                            <span className="animate-pulse text-purple-600">|</span>
                                          ) : null}
                                        </span>
                                      ) : (
                                        <span dangerouslySetInnerHTML={{ 
                                          __html: output?.[component.key as keyof typeof output] || '' 
                                        }} />
                                      )}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}

                              {/* GFK Variants Section */}
                              {(liveOutput?.variant1 || output?.variant1) && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="border-t border-gray-200 pt-6 space-y-6"
                                >
                                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                                    Vollständige GFK-Formulierungen:
                                  </h4>
                                  
                                  {/* Variant 1 */}
                                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
                                    <div className="flex items-start space-x-4">
                                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-purple-600 font-bold text-lg">1</span>
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-purple-700 mb-2">Variante 1:</h5>
                                        <p className="text-gray-800 text-lg leading-relaxed">
                                          {isTyping && liveOutput ? (
                                            <span className="inline-block">
                                              {liveOutput.variant1}
                                              {liveOutput.request && !liveOutput.variant1 ? (
                                                <span className="animate-pulse text-purple-600">|</span>
                                              ) : null}
                                            </span>
                                          ) : (
                                            output?.variant1
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Variant 2 */}
                                  {(liveOutput?.variant2 || output?.variant2) && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6">
                                      <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                          <span className="text-indigo-600 font-bold text-lg">2</span>
                                        </div>
                                        <div className="flex-1">
                                          <h5 className="font-semibold text-indigo-700 mb-2">Variante 2:</h5>
                                          <p className="text-gray-800 text-lg leading-relaxed">
                                            {isTyping && liveOutput ? (
                                              <span className="inline-block">
                                                {liveOutput.variant2}
                                                {liveOutput.variant1 && !liveOutput.variant2 ? (
                                                  <span className="animate-pulse text-purple-600">|</span>
                                                ) : null}
                                              </span>
                                            ) : (
                                              output?.variant2
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}

                              {output && !isTyping && (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="border-t border-gray-200 pt-6"
                                >
                                  <p className="text-gray-700 mb-4 text-center">War diese Transformation hilfreich?</p>
                                  <div className="flex justify-center space-x-4">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleFeedback(true)}
                                      disabled={feedbackGiven}
                                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all ${
                                        feedbackGiven 
                                          ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                          : 'border-green-500 text-green-600 hover:bg-green-50'
                                      }`}
                                    >
                                      <ThumbsUp className="h-5 w-5" />
                                      <span>Ja, hilfreich</span>
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleFeedback(false)}
                                      disabled={feedbackGiven}
                                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl border-2 transition-all ${
                                        feedbackGiven 
                                          ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                          : 'border-red-500 text-red-600 hover:bg-red-50'
                                      }`}
                                    >
                                      <ThumbsDown className="h-5 w-5" />
                                      <span>Verbesserungsbedarf</span>
                                    </motion.button>
                                  </div>
                                  {feedbackGiven && (
                                    <motion.p
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-gray-600 text-center mt-4"
                                    >
                                      Vielen Dank für dein Feedback! 🙏
                                    </motion.p>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.section>

                    {/* Features Section */}
                    <motion.section
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-center space-y-12"
                    >
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                          Warum GFKCoach?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                          Entdecke die Vorteile unserer KI-gestützten Kommunikationsplattform
                        </p>
                      </div>

                      <div className="grid gap-8 md:grid-cols-3">
                        {[
                          {
                            icon: Zap,
                            title: 'Sofortige Transformation',
                            description: 'Verwandle deine Nachrichten in Sekunden in empathische GFK-Formulierungen'
                          },
                          {
                            icon: Target,
                            title: 'Präzise Analyse',
                            description: 'Unsere KI erkennt die vier GFK-Komponenten und formuliert sie klar und verständlich'
                          },
                          {
                            icon: Heart,
                            title: 'Empathische Kommunikation',
                            description: 'Lerne, wie du Konflikte löst und Beziehungen stärkst durch gewaltfreie Sprache'
                          }
                        ].map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <feature.icon className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>

                    {/* CTA Section */}
                    <motion.section
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 lg:p-12 text-white text-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
                      <div className="relative z-10 space-y-8">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                          <Heart className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold mb-4">Hilf uns, GFKCoach zu verbessern!</h2>
                          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
                            Teile deine Erfahrungen mit uns und gestalte die Zukunft der empathischen Kommunikation mit.
                          </p>
                        </div>
                        
                        <form onSubmit={handleMessageSubmit} className="max-w-lg mx-auto space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Dein Name"
                              className="w-full px-6 py-4 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                              required
                            />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Deine E-Mail"
                              className="w-full px-6 py-4 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                              required
                            />
                          </div>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Deine Nachricht oder Feedback..."
                            rows={4}
                            className="w-full px-6 py-4 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all resize-none"
                            required
                          />
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg ${
                              isLoading && 'opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <Send className="h-5 w-5" />
                            <span>{isLoading ? 'Wird gesendet...' : 'Nachricht senden'}</span>
                          </motion.button>
                        </form>
                        
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/20 border border-red-300/30 rounded-2xl p-4 text-white max-w-lg mx-auto"
                          >
                            {error}
                          </motion.div>
                        )}
                        {messageSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-500/20 border border-green-300/30 rounded-2xl p-4 text-white max-w-lg mx-auto"
                          >
                            Vielen Dank für deine Nachricht! Wir haben sie erhalten. 🎉
                          </motion.div>
                        )}
                      </div>
                    </motion.section>

                    {/* Social Proof */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="flex justify-center"
                    >
                      <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl px-8 py-4 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-6 w-6 text-purple-600" />
                          <span className="font-semibold text-purple-600 text-lg">1.247</span>
                        </div>
                        <span className="text-gray-600">Menschen nutzen bereits GFKCoach</span>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          } />
        </Routes>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-xl mt-16 py-12 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <div className="flex justify-center items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                GFKCoach
              </span>
            </div>
            <p className="text-gray-600">© {new Date().getFullYear()} GFKCoach - Empathische Kommunikation für alle</p>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center mx-auto space-x-2 hover:underline"
            >
              <Shield className="h-4 w-4" />
              <span>Datenschutz</span>
            </button>
          </div>
        </footer>

        {/* Dialogs */}
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

        <ChatDialog
          isOpen={showChatDialog}
          onClose={() => setShowChatDialog(false)}
          originalInput={input}
          gfkOutput={output || { observation: '', feeling: '', need: '', request: '' }}
          user={user}
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
    className="max-w-4xl mx-auto space-y-12"
  >
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Über Gewaltfreie Kommunikation
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Entdecke die transformative Kraft der GFK nach Marshall B. Rosenberg
        </p>
      </motion.div>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-3xl shadow-xl p-8 lg:p-12"
    >
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-purple-600" />
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Gewaltfreie Kommunikation (GFK) ist ein von Marshall B. Rosenberg entwickelter Ansatz, 
            der Menschen dabei hilft, selbst in herausfordernden Situationen einfühlsam und authentisch 
            zu kommunizieren.
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-purple-600 text-center">Die vier Schritte der GFK</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                number: 1,
                title: 'Beobachtung',
                description: 'Beschreiben Sie die Situation objektiv, ohne zu bewerten oder zu interpretieren.',
                color: 'blue',
                icon: '👁️'
              },
              {
                number: 2,
                title: 'Gefühl',
                description: 'Drücken Sie Ihre Gefühle aus, die durch die Situation entstehen.',
                color: 'green',
                icon: '💚'
              },
              {
                number: 3,
                title: 'Bedürfnis',
                description: 'Benennen Sie die Bedürfnisse, die hinter Ihren Gefühlen stehen.',
                color: 'orange',
                icon: '🎯'
              },
              {
                number: 4,
                title: 'Bitte',
                description: 'Formulieren Sie eine konkrete, positive und machbare Bitte.',
                color: 'purple',
                icon: '🤝'
              }
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-${step.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold text-${step.color}-700 mb-2`}>
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-purple-600 mb-6 text-center">Vorteile der GFK</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              'Verbessert zwischenmenschliche Beziehungen',
              'Reduziert Konflikte und Missverständnisse',
              'Fördert empathisches Zuhören und Verstehen',
              'Ermöglicht konstruktive Konfliktlösung',
              'Stärkt emotionale Intelligenz und Selbstausdruck',
              'Schafft eine Atmosphäre des Vertrauens'
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

export default App;