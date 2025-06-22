import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, LogOut, Menu, X as XIcon, Bot, ArrowRight, CheckCircle, Star, Users, Zap, Target, User, Coffee, HelpCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useOutletContext } from 'react-router-dom';
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
import FAQ from './components/FAQ';
import HomePage from './components/HomePage';

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

// Separate component that uses useLocation (must be inside Router)
function AppContent({ user, onSignOut, isMobileMenuOpen, setIsMobileMenuOpen }: { 
  user: any, 
  onSignOut: () => void,
  isMobileMenuOpen: boolean,
  setIsMobileMenuOpen: (open: boolean) => void
}) {
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
  const [loading, setLoading] = useState(true);
  
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

  const { session, canUseService, incrementUsage, getRemainingUsage, getUsageInfo } = useUserTracking(user);

  const location = useLocation();

  // Handle navigation state from Header component
  useEffect(() => {
    // This logic is now handled by routes, can be removed or simplified.
    // For now, we'll keep it empty to avoid breaking anything that might depend on it.
  }, [location.state]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Reset all relevant states to ensure a clean slate for the new anonymous user
    setInput('');
    setOutput(null);
    setLiveOutput(null);
    setError(null);
    setFeedbackGiven(false);
    // Any other state that should be cleared on logout
  };

  // Live typing effect
  const typeText = async (text: string, setter: (value: string) => void, delay: number = 30) => {
    setter('');
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      setter(text.slice(0, i));
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    // Validierung für sehr lange Texte
    if (input.trim().length > 1000) {
      setError('Der Text ist zu lang. Bitte kürzen Sie ihn auf maximal 1000 Zeichen.');
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
  }, [input]);

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

KRITISCHE EINSCHRÄNKUNGEN:
- Verwende NUR die Informationen, die im ursprünglichen Text enthalten sind
- Füge KEINE zusätzlichen Details, Annahmen oder Interpretationen hinzu
- Erfinde KEINE neuen Fakten, Zeitangaben, Orte oder Personen
- Bleibe so nah wie möglich am ursprünglichen Kontext und Inhalt

Analysiere die Absicht hinter der Aussage und übersetze sie in die 4 GFK-Komponenten:
1. Beobachtung: Was ist konkret passiert? (Ohne Bewertung, nur aus dem Text)
2. Gefühl: Welches Gefühl hat der Sender dabei? (Ich-Botschaft)
3. Bedürfnis: Welches unerfüllte Bedürfnis steckt dahinter? (Universelle Werte)
4. Bitte: Was wünscht sich der Sender konkret? (Positiv, machbar, als Frage)

WICHTIG: Formuliere die Antwort aus der SENDER-Perspektive: "Als ich das gesagt habe, habe ich mich... gefühlt, weil mir... wichtig ist. Könntest du bitte...?"

Verwende natürliche, empathische Sprache.`
        : `Du bist ein neutrales Werkzeug zur Umformulierung von Texten in Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg.

DEINE WICHTIGSTE REGEL: Der Nutzer ist der EMPFÄNGER der Aussage. Jemand hat etwas zu ihm gesagt und er möchte eine GFK-Antwort formulieren.

KRITISCHE EINSCHRÄNKUNGEN:
- Verwende NUR die Informationen, die im ursprünglichen Text enthalten sind
- Füge KEINE zusätzlichen Details, Annahmen oder Interpretationen hinzu
- Erfinde KEINE neuen Fakten, Zeitangaben, Orte oder Personen
- Bleibe so nah wie möglich am ursprünglichen Kontext und Inhalt

Analysiere die Absicht hinter der Aussage und übersetze sie in die 4 GFK-Komponenten:
1. Beobachtung: Was ist konkret passiert? (Ohne Bewertung, nur aus dem Text)
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
      
      // Spezifische Fehlerbehandlung
      let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Zeitüberschreitung. Bitte versuchen Sie es erneut.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
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
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const firstTransformDone = useRef(false);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Neuer Header */}
      <Header
        user={user}
        handleSignOut={onSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/auth" element={user ? <Navigate to="/profile" replace /> : <Auth />} />
            <Route path="/profile" element={user ? <Profile user={user} onSignOut={onSignOut} /> : <Navigate to="/auth" replace />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/ueber" element={<AboutContent />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/home" element={
              <HomePage
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
                handleMessageSubmit={handleMessageSubmit}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                message={message}
                setMessage={setMessage}
                messageSuccess={messageSuccess}
              />
            } />
            <Route path="/" element={<Navigate to="/home" />} />
          </Routes>
        </main>

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
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} GFKCoach - Empathische Kommunikation für alle
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Version 1.6.7 - Fix: State-Reset beim Logout
              </p>
              <div className="flex justify-center items-center gap-6 mt-2">
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

        {/* Version Info */}
        {showVersionInfo && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl rounded-xl px-6 py-4 flex items-center space-x-3"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-medium">Beta Version 1.6.7</span>
                <p className="text-xs text-purple-100">Fix: State-Reset beim Logout</p>
              </div>
            </div>
            <button 
              onClick={() => setShowVersionInfo(false)} 
              className="ml-4 text-white/80 hover:text-white text-xl font-bold" 
              aria-label="Schließen"
            >
              ×
            </button>
          </motion.div>
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Zeige Version-Info nach 2 Sekunden
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVersionInfo(true);
      setTimeout(() => setShowVersionInfo(false), 5000); // 5 Sekunden anzeigen
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent 
        user={user} 
        onSignOut={handleSignOut} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      {showVersionInfo && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-full shadow-lg z-50">
          Version 1.6.7
        </div>
      )}
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
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-8 text-center"
          >
            <Link
              to="/faq"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <HelpCircle className="h-5 w-5" />
              <span>Häufige Fragen & GFK-Grundlagen</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

export default App;