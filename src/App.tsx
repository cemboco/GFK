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
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import InternationalizationDemo from './components/InternationalizationDemo';

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

// ScrollToTop-Komponente für automatisches Scrollen zum Seitenanfang
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
    reformulated_text: string;
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
    reformulated_text: string;
  } | null>(null);

  const { session, isLoading: userTrackingLoading, canUseService, incrementUsage, getRemainingUsage, getUsageInfo } = useUserTracking(user);

  const location = useLocation();

  const { t } = useLanguage();

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

    // Zeige direkt Perspektiven-Auswahl (ohne automatische Kontext-Erkennung)
    setPendingInput(input.trim());
    setShowPerspectiveSelector(true);
  }, [input]);

  const performTransformation = async (textToTransform: string, additionalContext?: string, perspective?: 'sender' | 'receiver') => {
    // Warte bis die User-Tracking-Session initialisiert ist
    if (userTrackingLoading) {
      setError('Lade Benutzerdaten... Bitte warten Sie einen Moment.');
      return;
    }

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

      const perspectivePrompt = perspective === 'sender' 
        ? `${t.prompts.senderPerspective}`
        : `${t.prompts.receiverPerspective}`;

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

      // DEBUG: Log den gesendeten systemPrompt
      console.log("DEBUG - Gesendete Perspektive:", perspective);
      console.log("DEBUG - Gesendeter systemPrompt Länge:", perspectivePrompt.length);
      console.log("DEBUG - Gesendeter systemPrompt (erste 200 Zeichen):", perspectivePrompt.substring(0, 200));

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
        reformulated_text: (data.reformulated_text || '').replace(/<[^>]*>/g, '')
      };

      // Initialize live output - nur reformulated_text
      setLiveOutput({
        observation: '',
        feeling: '',
        need: '',
        request: '',
        reformulated_text: ''
      });

      // Type only the reformulated text
      await typeText(cleanData.reformulated_text, (text) => {
        setLiveOutput(prev => prev ? { ...prev, reformulated_text: text } : null);
      }, 15);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Set final output - nur reformulated_text mit HTML styling
      setOutput({
        observation: '',
        feeling: '',
        need: '',
        request: '',
        reformulated_text: data.reformulated_text || ''
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

      // Manually update user progress if user is logged in
      if (user) {
        try {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('total_transformations')
            .eq('user_id', user.id)
            .single();

          if (progressError && progressError.code !== 'PGRST116') {
            console.error('Error fetching progress:', progressError);
          } else {
            const currentTransformations = progressData?.total_transformations || 0;
            const newTransformations = currentTransformations + 1;
            
            // Calculate new level
            let newLevel = 'Anfänger';
            let newProgress = 0;
            
            if (newTransformations >= 200) {
              newLevel = 'GFK Meister';
              newProgress = 100;
            } else if (newTransformations >= 100) {
              newLevel = 'Experte';
              newProgress = ((newTransformations - 100) * 100) / 100;
            } else if (newTransformations >= 50) {
              newLevel = 'Profi';
              newProgress = ((newTransformations - 50) * 100) / 50;
            } else if (newTransformations >= 20) {
              newLevel = 'Fortgeschritten';
              newProgress = ((newTransformations - 20) * 100) / 30;
            } else {
              newLevel = 'Anfänger';
              newProgress = (newTransformations * 100) / 20;
            }

            // Update or insert progress with proper conflict resolution
            const { error: updateError } = await supabase
              .from('user_progress')
              .upsert([{
                user_id: user.id,
                total_transformations: newTransformations,
                current_level: newLevel,
                level_progress: Math.min(newProgress, 100),
                last_activity: new Date().toISOString()
              }], {
                onConflict: 'user_id',
                ignoreDuplicates: false
              });

            if (updateError) {
              console.error('Error updating progress:', updateError);
              // Don't throw error, just log it - progress update is not critical
            }
          }
        } catch (err) {
          console.error('Error updating user progress:', err);
        }
      }

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

  const handleOpenExerciseModal = () => {
    setShowContextModal(true);
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

  // Debug function to test database connection
  const debugDatabaseConnection = async () => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    console.log('=== Database Debug Test ===');
    console.log('User ID:', user.id);

    try {
      // Test 1: Check user_progress table
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      console.log('Progress data:', progressData);
      console.log('Progress error:', progressError);

      // Test 2: Check messages count
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('user_id', user.id);

      console.log('Messages count:', messagesData?.length);
      console.log('Messages error:', messagesError);

      // Test 3: Try to create/update progress manually
      const { data: testProgress, error: testError } = await supabase
        .from('user_progress')
        .upsert([{
          user_id: user.id,
          total_transformations: messagesData?.length || 0,
          current_level: 'Anfänger',
          level_progress: 0,
          last_activity: new Date().toISOString()
        }])
        .select();

      console.log('Test progress result:', testProgress);
      console.log('Test progress error:', testError);

    } catch (err) {
      console.error('Debug test error:', err);
    }
  };

  // Add debug function to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugGFK = debugDatabaseConnection;
    }
  }, [user]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* ScrollToTop für automatisches Scrollen beim Seitenwechsel */}
      <ScrollToTop />
      
      {/* Neuer Header */}
      <Header
        user={user}
        handleSignOut={onSignOut}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 sm:px-6 lg:px-8">
        <Routes>
            <Route path="/auth" element={user ? <Navigate to="/profile" replace /> : <Auth />} />
            <Route path="/profile" element={user ? <Profile user={user} onSignOut={onSignOut} /> : <Navigate to="/auth" replace />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/ueber" element={<AboutContent />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/i18n-demo" element={<InternationalizationDemo />} />
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
                handleContextSubmit={handleContextSubmit}
                handleOpenExerciseModal={handleOpenExerciseModal}
              />
            } />
            <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-xl mt-12 sm:mt-16 py-8 sm:py-12 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 text-center space-y-3 sm:space-y-4">
            <div className="flex justify-center items-center space-x-2 sm:space-x-3">
              <div className="w-16 h-16 sm:w-[80px] sm:h-[80px] rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="GFKCoach Logo" className="w-16 h-16 sm:w-[80px] sm:h-[80px] object-contain" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {t.app.title.split(' - ')[0]}
              </span>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500">
                {t.app.copyright.replace('2024', new Date().getFullYear().toString())}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t.app.version}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mt-2">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center space-x-2 hover:underline text-sm"
            >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t.app.dataProtection}</span>
            </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center space-x-2 hover:underline text-sm"
                >
                  <span>{t.app.terms}</span>
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
                <span className="text-sm font-medium">Beta Version 1.6.16</span>
                <p className="text-xs text-purple-100">Debug-Tools & Fortschritts-Tracking</p>
              </div>
            </div>
            <button 
              onClick={() => setShowVersionInfo(false)} 
              className="ml-4 text-white/80 hover:text-white text-xl font-bold" 
              aria-label={t.aria.close}
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
          user={user}
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
    // Initial session check
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Force a small delay to ensure the state is properly updated
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    });

    // Check if we're on an auth callback URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // We're on an auth callback, wait a moment for Supabase to process it
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);
    }

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
      <LanguageProvider>
        <AppContent 
          user={user} 
          onSignOut={handleSignOut} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </LanguageProvider>
      {showVersionInfo && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-full shadow-lg z-50">
          Version 1.6.16
        </div>
      )}
    </Router>
  );
}

function AboutContent() {
  const { t } = useLanguage();
  return (
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
          {t.about.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t.about.subtitle}
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
            {t.about.description}
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-purple-600 text-center">{t.about.fourSteps.title}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {t.about.fourSteps.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-2xl">{['👁️','💚','🎯','🤝'][index]}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-700 mb-2">
                      {Object.values(step)[0]}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{Object.values(step)[1]}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </motion.div>

      {/* Wolfssprache und Giraffensprache */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-purple-600 text-center">{t.about.transformation.title}</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto">
          {t.about.transformation.wolf} vs. {t.about.transformation.giraffe}
        </p>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Wolfssprache */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🐺</span>
              </div>
              <h3 className="text-xl font-bold text-red-700">{t.about.wolfLanguage.title}</h3>
            </div>
            <p className="text-gray-700 mb-4">
              {t.about.wolfLanguage.description}
            </p>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">{t.about.wolfLanguage.characteristics}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Urteile und Bewertungen ("Du bist faul!")</li>
                  <li>• Vorwürfe und Schuldzuweisungen</li>
                  <li>• Forderungen und Drohungen</li>
                  <li>• Vergleiche und Konkurrenz</li>
                  <li>• Verallgemeinerungen ("Du machst das immer!")</li>
                </ul>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">{t.about.wolfLanguage.example}</h4>
                <p className="text-sm text-gray-600 italic">
                  "{t.about.wolfExample}"
                </p>
              </div>
            </div>
              </motion.div>

          {/* Giraffensprache */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🦒</span>
              </div>
              <h3 className="text-xl font-bold text-green-700">{t.about.giraffeLanguage.title}</h3>
            </div>
            <p className="text-gray-700 mb-4">
              {t.about.giraffeLanguage.description}
            </p>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-green-600 mb-2">{t.about.giraffeLanguage.characteristics}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Beobachtungen ohne Bewertung</li>
                  <li>• Gefühle und Bedürfnisse ausdrücken</li>
                  <li>• Bitten statt Forderungen</li>
                  <li>• Empathie und Verständnis</li>
                  <li>• Verantwortung für eigene Gefühle</li>
                </ul>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-green-600 mb-2">{t.about.giraffeLanguage.example}</h4>
                <p className="text-sm text-gray-600 italic">
                  "{t.about.giraffeExample}"
                </p>
              </div>
          </div>
        </motion.div>
        </div>

        {/* Transformationsbeispiel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
        >
          <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">{t.about.transformation.title}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                <span className="text-lg mr-2">🐺</span> {t.about.transformation.wolf}
              </h4>
              <p className="text-gray-700 italic">
                "{t.examples.messy.before}"
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                <span className="text-lg mr-2">🦒</span> {t.about.transformation.giraffe}
              </h4>
              <p className="text-gray-700 italic">
                "{t.examples.messy.after}"
              </p>
            </div>
      </div>
        </motion.div>
    </motion.div>
  </motion.div>
);
}

export default App;