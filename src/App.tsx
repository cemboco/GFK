import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, LogOut, Menu, X as XIcon, Bot, ArrowRight, CheckCircle, Star, Users, Zap, Target, User, Coffee } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import CTAForm from './components/CTAForm';
import FeedbackDialog from './components/FeedbackDialog';
import PositiveFeedbackDialog from './components/PositiveFeedbackDialog';
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from './components/Contact';
import Auth from './components/Auth';
import Profile from './components/Profile';
import ChatDialog from './components/ChatDialog';
import { useUserTracking } from './hooks/useUserTracking';
import Header from './components/Header';
import GFKTransformForm from './components/GFKTransformForm';
import { getContextPrompt, getContextStyle } from './utils/contextHelpers';
import TermsModal from './components/TermsModal';
import AnonFeedbackModal from './components/AnonFeedbackModal';
import ContextModal from './components/ContextModal';
import PerspectiveSelector from './components/PerspectiveSelector';
import { needsMoreContext } from './utils/contextDetection';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Separate component that uses useLocation (must be inside Router)
function AppContent() {
  const [activeTab, setActiveTab] = useState<'gfk' | 'about' | 'contact'>('gfk');
  const [input, setInput] = useState('');
  const [context, setContext] = useState('general');
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
  const [user, setUser] = useState<any>(null);
  
  // Context Modal states
  const [showContextModal, setShowContextModal] = useState(false);
  const [pendingInput, setPendingInput] = useState('');
  
  // Perspective Selector states
  const [showPerspectiveSelector, setShowPerspectiveSelector] = useState(false);
  const [selectedPerspective, setSelectedPerspective] = useState<'sender' | 'receiver' | null>(null);
  
  // Collected context from modal
  const [collectedContext, setCollectedContext] = useState<string>('');
  
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

  const location = useLocation();

  // Handle navigation state from Header component
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent it from persisting
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

    // Prüfe, ob mehr Kontext benötigt wird
    if (needsMoreContext(input.trim())) {
      setPendingInput(input.trim());
      setShowContextModal(true);
      return;
    }

    // Zeige Perspektiven-Auswahl
    setPendingInput(input.trim());
    setShowPerspectiveSelector(true);
  };

  const performTransformation = async (textToTransform: string, additionalContext?: string, perspective?: 'sender' | 'receiver') => {
    if (!canUseService()) {
      const remaining = getRemainingUsage();
      if (remaining === 0 && !user && !anonFeedbackGiven) {
        setShowAnonFeedbackModal(true);
        return;
      }
      if (remaining === 0 && !user && anonFeedbackGiven) {
        setError('Du hast das maximale kostenlose Kontingent erreicht. Bitte registriere dich für weitere Nutzung.');
        return;
      }
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
      // Kombiniere den ursprünglichen Text mit dem zusätzlichen Kontext
      const fullInput = additionalContext 
        ? `${textToTransform}\n\n${additionalContext}`
        : textToTransform;

      // Erstelle den System-Prompt basierend auf der Perspektive
      const perspectivePrompt = perspective === 'sender' 
        ? `Du bist ein neutrales Werkzeug zur Umformulierung von Texten in Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg.

DEINE WICHTIGSTE REGEL: Der Nutzer ist der SENDER der Aussage. Er hat etwas gesagt und möchte es in GFK umformulieren.

Analysiere die Absicht hinter der Aussage und übersetze sie in die 4 GFK-Komponenten:
1. Beobachtung: Was ist konkret passiert? (Ohne Bewertung)
2. Gefühl: Welches Gefühl hat der Sender dabei? (Ich-Botschaft)
3. Bedürfnis: Welches unerfüllte Bedürfnis steckt dahinter? (Universelle Werte)
4. Bitte: Was wünscht sich der Sender konkret? (Positiv, machbar, als Frage)

WICHTIG: Formuliere die Antwort aus der SENDER-Perspektive: "Als ich das gesagt habe, habe ich mich... gefühlt, weil mir... wichtig ist. Könntest du bitte...?"

Verwende natürliche, empathische Sprache.`
        : `Du bist ein neutrales Werkzeug zur Umformulierung von Texten in Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg.

DEINE WICHTIGSTE REGEL: Der Nutzer ist der EMPFÄNGER der Aussage. Jemand hat etwas zu ihm gesagt und er möchte eine GFK-Antwort formulieren.

Analysiere die Absicht hinter der Aussage und übersetze sie in die 4 GFK-Komponenten:
1. Beobachtung: Was ist konkret passiert? (Ohne Bewertung)
2. Gefühl: Welches Gefühl löst das beim Empfänger aus? (Ich-Botschaft)
3. Bedürfnis: Welches unerfüllte Bedürfnis steckt dahinter? (Universelle Werte)
4. Bitte: Was wünscht sich der Empfänger konkret? (Positiv, machbar, als Frage)

WICHTIG: Formuliere die Antwort aus der EMPFÄNGER-Perspektive: "Als ich deine Aussage gehört habe, habe ich mich... gefühlt, weil mir... wichtig ist. Könntest du bitte...?"

Verwende natürliche, empathische Sprache.`;

      const { data, error: functionError } = await supabase.functions.invoke('gfk-transform', {
        body: { 
          input: fullInput,
          systemPrompt: perspectivePrompt,
          context: {
            userLevel: 'beginner',
            preferredStyle: getContextStyle(context),
            includeExamples: true,
            focusOn: 'clarity',
            relationship: context,
            situation: 'general',
            contextExamples: getContextPrompt(context)
          }
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Strip HTML for live typing - safely handle undefined values
      const cleanData = {
        observation: (data.observation || '').replace(/<[^>]*>/g, ''),
        feeling: (data.feeling || '').replace(/<[^>]*>/g, ''),
        need: (data.need || '').replace(/<[^>]*>/g, ''),
        request: (data.request || '').replace(/<[^>]*>/g, ''),
        variant1: (data.variant1 || '').replace(/<[^>]*>/g, ''),
        variant2: (data.variant2 || '').replace(/<[^>]*>/g, '')
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

      // Set final output with HTML styling - ensure all fields exist
      setOutput({
        observation: data.observation || '',
        feeling: data.feeling || '',
        need: data.need || '',
        request: data.request || '',
        variant1: data.variant1 || '',
        variant2: data.variant2 || ''
      });
      setIsTyping(false);

      // Track usage
      await incrementUsage();

      // Save to database (auch für anonyme Nutzer)
        await supabase.from('messages').insert([{
        user_id: user ? user.id : null,
          input_text: textToTransform,
          output_text: data
        }]);

      if (!firstTransformDone.current && !showFirstTransformSnackbar) {
        setTimeout(() => {
          setShowFirstTransformSnackbar(true);
          localStorage.setItem('firstTransformNotified', 'true');
          setTimeout(() => setShowFirstTransformSnackbar(false), 8000); // 8 Sekunden sichtbar
        }, 500);
        firstTransformDone.current = true;
      }

      // Set loading to false after all operations are complete
      setIsLoading(false);

    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
      );
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleContextSubmit = (context: string) => {
    setCollectedContext(context);
    setShowContextModal(false);
    if (pendingInput) {
      // Nach Kontext-Modal zur Perspektiven-Auswahl
      setShowPerspectiveSelector(true);
    }
  };

  const handlePerspectiveSelect = (perspective: 'sender' | 'receiver') => {
    setSelectedPerspective(perspective);
    setShowPerspectiveSelector(false);
    
    if (pendingInput) {
      performTransformation(pendingInput, collectedContext, perspective);
      // Reset collected context after use
      setCollectedContext('');
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

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAnonFeedbackModal, setShowAnonFeedbackModal] = useState(false);
  const [anonFeedbackGiven, setAnonFeedbackGiven] = useState(() => {
    return localStorage.getItem('anonFeedbackGiven') === 'true';
  });

  const [showFirstTransformSnackbar, setShowFirstTransformSnackbar] = useState(false);
  const firstTransformDone = useRef(false);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Neuer Header */}
      <Header
        user={user}
        handleSignOut={handleSignOut}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

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
                          { icon: MessageCircle, value: '4.000+', label: 'Transformationen' },
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

                      {/* Spenden-Link */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-4"
                      >
                        <a
                          href="https://coff.ee/cemil"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Coffee className="h-5 w-5" />
                          <span>Unterstütze GFKCoach ☕</span>
                        </a>
                        <p className="text-sm text-gray-500 mt-2">
                          Kleine Spende für die Weiterentwicklung
                        </p>
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

                  {/* GFKTransformForm-Komponente */}
                  <GFKTransformForm
                    input={input}
                    setInput={setInput}
                    isLoading={isLoading}
                    canUseService={canUseService}
                    handleSubmit={handleSubmit}
                    error={error}
                    liveOutput={liveOutput}
                    output={output}
                    isTyping={isTyping}
                    user={user}
                    setShowChatDialog={setShowChatDialog}
                    feedbackGiven={feedbackGiven}
                    handleFeedback={handleFeedback}
                    context={context}
                    setContext={setContext}
                    usageInfo={usageInfo}
                  />

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

                  {/* FAQ Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="bg-white rounded-3xl shadow-xl p-8 lg:p-12"
                  >
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Häufig gestellte Fragen
                      </h2>
                      <p className="text-lg text-gray-600">
                        Finde Antworten auf die wichtigsten Fragen zu GFKCoach
                      </p>
                    </div>

                    <div className="space-y-6 max-w-4xl mx-auto">
                      {[
                        {
                          question: "Was ist Gewaltfreie Kommunikation (GFK) und warum ist sie wichtig?",
                          answer: "Gewaltfreie Kommunikation nach Marshall B. Rosenberg ist ein Ansatz, der Menschen dabei hilft, selbst in schwierigen Situationen einfühlsam und authentisch zu kommunizieren. Sie basiert auf vier Schritten: Beobachtung, Gefühl, Bedürfnis und Bitte. GFK reduziert Konflikte, verbessert Beziehungen und fördert gegenseitiges Verständnis."
                        },
                        {
                          question: "Wie funktioniert die KI-Transformation bei GFKCoach?",
                          answer: "Unsere KI analysiert deinen Text und erkennt automatisch die vier GFK-Komponenten. Sie formuliert dann eine empathische Version, die deine Beobachtungen, Gefühle, Bedürfnisse und Bitten klar ausdrückt. Du kannst verschiedene Kontexte wählen (Familie, Arbeit, Partnerschaft), um maßgeschneiderte Formulierungen zu erhalten."
                        },
                        {
                          question: "Ist GFKCoach kostenlos und gibt es Nutzungslimits?",
                          answer: "GFKCoach bietet 5 kostenlose Transformationen für nicht-registrierte Nutzer. Nach der kostenlosen Registrierung erhältst du unbegrenzte Transformationen und zusätzlich 3 Chat-Nachrichten pro Monat für persönliche GFK-Beratung. Premium-Pläne mit erweiterten Features sind in Planung."
                        },
                        {
                          question: "Kann ich meine transformierten Texte speichern und später wiederfinden?",
                          answer: "Ja! Nach der Registrierung werden alle deine Transformationen automatisch in deinem Profil gespeichert. Du kannst sie jederzeit in deinem persönlichen Bereich einsehen, bearbeiten oder als Referenz für zukünftige Gespräche verwenden."
                        },
                        {
                          question: "Wie kann ich GFK in meinem Alltag am besten üben?",
                          answer: "Beginne mit einfachen Situationen und übe regelmäßig. Nutze GFKCoach für verschiedene Kontexte und beobachte die Reaktionen. Der GFK-Coach (Chat-Funktion) kann dir bei spezifischen Fragen helfen. Wichtig ist, dass du authentisch bleibst - GFK ist ein Prozess, der Zeit und Übung braucht."
                        }
                      ].map((faq, index) => (
                    <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.4 + index * 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                          <h3 className="text-xl font-bold text-purple-600 mb-3">
                            {faq.question}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      ))}
                        </div>
                  </motion.section>
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
            <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center space-x-2 hover:underline"
            >
              <Shield className="h-4 w-4" />
              <span>Datenschutz</span>
            </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center space-x-2 hover:underline"
              >
                <span>AGB</span>
            </button>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Beta Version 1.3.0 - Perspektiven-Auswahl & verbesserte GFK-Formulierungen
              </p>
            </div>
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

        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

        <AnonFeedbackModal
          isOpen={showAnonFeedbackModal}
          onClose={() => setShowAnonFeedbackModal(false)}
          onSubmit={async (feedback) => {
            // Feedback in Supabase speichern
            await supabase.from('anon_feedback').insert([{ feedback }]);
            // Limit zurücksetzen (einmalig)
            localStorage.setItem('anonFeedbackGiven', 'true');
            setAnonFeedbackGiven(true);
            // Setze Usage auf 5 (z.B. in localStorage, je nach Implementierung von useUserTracking)
            localStorage.setItem('anonUsage', '5');
          }}
        />

        {showFirstTransformSnackbar && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-purple-200 shadow-xl rounded-xl px-6 py-4 flex items-center space-x-3 animate-fade-in">
            <span className="text-purple-700 text-lg font-medium">Gerne Feedback geben:</span>
            <a href="mailto:info@gfkcoach.com" className="text-purple-600 underline font-medium">info@gfkcoach.com</a>
            <button onClick={() => setShowFirstTransformSnackbar(false)} className="ml-2 text-gray-400 hover:text-purple-600 text-2xl font-bold" aria-label="Schließen">×</button>
          </div>
        )}

        {/* Context Modal */}
        <ContextModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          onSubmit={handleContextSubmit}
          originalText={pendingInput}
        />

        {/* Perspective Selector */}
        <PerspectiveSelector
          isOpen={showPerspectiveSelector}
          onClose={() => setShowPerspectiveSelector(false)}
          onSelect={handlePerspectiveSelect}
          originalText={pendingInput}
        />
      </div>
  );
}

// Main App component that wraps everything in Router
function App() {
  return (
    <Router>
      <AppContent />
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