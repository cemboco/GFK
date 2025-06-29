import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, LogOut, Menu, X as XIcon, Bot, ArrowRight, CheckCircle, Star, Users, Zap, Target, User, Coffee, HelpCircle } from 'lucide-react';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useOutletContext, useNavigate } from 'react-router-dom';
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
  ? `Du bist ein GFK-Transformator. Der Nutzer gibt eine Aussage ein, die er selbst in einem Konflikt gesagt hat oder sagen möchte. Deine Aufgabe ist es, diese Aussage in eine gewaltfreie Formulierung umzuwandeln, die aus der Perspektive des Nutzers (des Sprechers) formuliert ist und die vier Schritte der GFK enthält: 1. Konkrete Beobachtung ohne Bewertung, 2. Gefühl des Sprechers, 3. Bedürfnis des Sprechers, 4. Bitte an den anderen. Formuliere die Antwort als zusammenhängenden Satz oder kurzen Absatz.

  KONTEXT: Der Nutzer ist der SENDER der ursprünglichen Aussage und möchte lernen, wie er sie in GFK hätte ausdrücken können.

  GRUNDPRINZIPIEN:
- Verwende NUR die Informationen, die im ursprünglichen Text enthalten sind
- Füge KEINE zusätzlichen Details, Annahmen oder Interpretationen hinzu
- Erfinde KEINE neuen Fakten, Zeitangaben, Orte oder Personen
- Bleibe so nah wie möglich am ursprünglichen Kontext und Inhalt
  - Wenn der Text vage ist, bleibe vage - erfinde keine Spezifität
  
  AUFGABE: Transformiere die Aussage in die vier GFK-Schritte:
  
  1. **Beobachtung**: Beschreibe nur das, was im ursprünglichen Text erwähnt wurde
     - Keine Bewertungen oder Interpretationen
     - Keine zusätzlichen Details erfinden
     - Wenn der Text allgemein ist, bleibe allgemein
  
  2. **Gefühl**: Identifiziere das echte Gefühl des Senders
     - Verwende präzise Gefühlswörter
     - Unterscheide zwischen Gefühlen und Gedanken
     - Aus der Ich-Perspektive formulieren
  
  3. **Bedürfnis**: Erkenne das dahinterliegende universelle Bedürfnis
     - Fokus auf positive, universelle menschliche Werte
     - Nicht personenbezogen formulieren
     - Das unerfüllte Bedürfnis benennen
  
  4. **Bitte**: Formuliere eine konkrete, erfüllbare Bitte
     - Positiv und handlungsorientiert
     - Als respektvolle Frage stellen
     - Realistisch und spezifisch
  
  AUSGABEFORMAT:
  1. Einzelne Schritte klar strukturiert erklären
  2. Anschließend einen natürlichen Fließtext erstellen, der alle vier Komponenten elegant verbindet
  
  PERSPEKTIVE: "Als ich das damals gesagt habe, hätte ich es so ausdrücken können: 'Wenn ich sehe/höre, dass..., dann fühle ich mich..., weil mir... wichtig ist. Wärst du bereit...?'"
  
  WICHTIG: Erfinde KEINE Details, die nicht im ursprünglichen Text stehen!`
  
    : `Du bist ein Experte für Gewaltfreie Kommunikation (GFK) nach Marshall Rosenberg und hilfst dabei, empathisch auf erhaltene Nachrichten zu antworten.
  
  KONTEXT: Der Nutzer ist der EMPFÄNGER einer Aussage und möchte lernen, wie er darauf mit GFK antworten kann.
  
  GRUNDPRINZIPIEN:
- Verwende NUR die Informationen, die im ursprünglichen Text enthalten sind
- Füge KEINE zusätzlichen Details, Annahmen oder Interpretationen hinzu
  - Respektiere den ursprünglichen Kontext vollständig
  - Fokussiere auf die Reaktion des Empfängers, nicht auf die Bewertung des Senders
  
  AUFGABE: Entwickle eine GFK-Antwort basierend auf den vier Schritten:
  
  1. **Beobachtung**: Beschreibe neutral, was gesagt oder getan wurde
     - Keine Bewertung der anderen Person
     - Nur die konkreten Worte oder Handlungen
     - Objektive Wiedergabe ohne Interpretation
  
  2. **Gefühl**: Identifiziere die eigene emotionale Reaktion als Empfänger
     - Echte Gefühle, keine Pseudogefühle
     - Verantwortung für die eigenen Emotionen übernehmen
     - Aus der Ich-Perspektive formulieren
  
  3. **Bedürfnis**: Erkenne das eigene unerfüllte Bedürfnis
     - Universelle menschliche Werte
     - Nicht abhängig von der anderen Person
     - Positive Formulierung des Bedürfnisses
  
  4. **Bitte**: Formuliere eine konstruktive Bitte
     - Konkret und erfüllbar
     - Respektvoll als Frage stellen
     - Auf Verbesserung der Situation ausgerichtet
  
  AUSGABEFORMAT:
  1. Einzelne Schritte klar strukturiert erklären
  2. Anschließend einen natürlichen Fließtext erstellen, der alle vier Komponenten elegant verbindet
  
  PERSPEKTIVE: "Als ich deine Worte gehört habe, habe ich mich... gefühlt, weil mir... wichtig ist. Wärst du bereit...?"
  
  Verwende eine einfühlsame, verbindende Sprache, die Brücken baut statt Gräben vertieft.`;

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

      // Initialize live output
      setLiveOutput({
        observation: '',
        feeling: '',
        need: '',
        request: '',
        reformulated_text: ''
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

      await typeText(cleanData.reformulated_text, (text) => {
        setLiveOutput(prev => prev ? { ...prev, reformulated_text: text } : null);
      }, 15);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Set final output with HTML styling - ensure all fields exist
      setOutput({
        observation: data.observation || '',
        feeling: data.feeling || '',
        need: data.need || '',
        request: data.request || '',
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

            // Update or insert progress
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
            {/* 404 Route für unbekannte Pfade */}
            <Route path="*" element={<NotFoundPage />} />
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
                GFKCoach
              </span>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500">
                © {new Date().getFullYear()} GFKCoach - Empathische Kommunikation für alle
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Version 1.6.16 - Debug-Tools & Verbesserte Fortschritts-Tracking
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mt-2">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center space-x-2 hover:underline text-sm"
            >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Datenschutz</span>
            </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center space-x-2 hover:underline text-sm"
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
                <span className="text-sm font-medium">Beta Version 1.6.16</span>
                <p className="text-xs text-purple-100">Debug-Tools & Fortschritts-Tracking</p>
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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setAuthError(null);
        // Redirect to home after successful sign in
        setTimeout(() => {
          window.location.href = '/home';
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthError(null);
      } else if (event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
      
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
    try {
      await supabase.auth.signOut();
      setAuthError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthError('Fehler beim Abmelden. Bitte versuchen Sie es erneut.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600">Lade GFKCoach...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <AppContent 
        user={user} 
        onSignOut={handleSignOut} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      {showVersionInfo && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded-full shadow-lg z-50">
          Version 1.6.16
        </div>
      )}
      {/* Global Error Display */}
      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <span>{authError}</span>
            <button
              onClick={() => setAuthError(null)}
              className="text-white/80 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </Router>
  );
}

function AboutContent() {
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
        </div>
      </motion.div>

      {/* Wolfssprache und Giraffensprache */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-purple-600 text-center">Wolfssprache vs. Giraffensprache</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto">
          Marshall Rosenberg verwendete diese Metaphern, um die verschiedenen Kommunikationsweisen zu veranschaulichen
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
              <h3 className="text-xl font-bold text-red-700">Wolfssprache</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Die Sprache der Gewalt – Urteile, Vorwürfe und Forderungen, die zu Konflikten führen.
            </p>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">Typische Merkmale:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Urteile und Bewertungen ("Du bist faul!")</li>
                  <li>• Vorwürfe und Schuldzuweisungen</li>
                  <li>• Forderungen und Drohungen</li>
                  <li>• Vergleiche und Konkurrenz</li>
                  <li>• Verallgemeinerungen ("Du machst das immer!")</li>
                </ul>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">Beispiel:</h4>
                <p className="text-sm text-gray-600 italic">
                  "Du bist so egoistisch! Du denkst nur an dich selbst. Du musst das sofort ändern!"
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
              <h3 className="text-xl font-bold text-green-700">Giraffensprache</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Die Sprache des Herzens – einfühlsam, authentisch und verbindend.
            </p>
            <div className="space-y-3">
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-green-600 mb-2">Typische Merkmale:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Beobachtungen ohne Bewertung</li>
                  <li>• Gefühle und Bedürfnisse ausdrücken</li>
                  <li>• Bitten statt Forderungen</li>
                  <li>• Empathie und Verständnis</li>
                  <li>• Verantwortung für eigene Gefühle</li>
                </ul>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <h4 className="font-semibold text-green-600 mb-2">Beispiel:</h4>
                <p className="text-sm text-gray-600 italic">
                  "Wenn ich sehe, dass du deine Sachen liegen lässt, fühle ich mich frustriert, weil mir Ordnung wichtig ist. Könntest du bitte deine Sachen wegräumen?"
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
          <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">Transformation: Von Wolf zu Giraffe</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                <span className="text-lg mr-2">🐺</span> Wolfssprache
              </h4>
              <p className="text-gray-700 italic">
                "Du bist so unzuverlässig! Du kommst immer zu spät. Das ist respektlos!"
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                <span className="text-lg mr-2">🦒</span> Giraffensprache
              </h4>
              <p className="text-gray-700 italic">
                "Wenn du später kommst als vereinbart, fühle ich mich enttäuscht, weil mir Pünktlichkeit wichtig ist. Könntest du bitte das nächste Mal rechtzeitig da sein?"
              </p>
            </div>
      </div>
        </motion.div>
    </motion.div>
  </motion.div>
);
}

// 404 Not Found Page Component
function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex items-center justify-center"
    >
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
          <HelpCircle className="h-12 w-12 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Seite nicht gefunden</h1>
        <p className="text-gray-600">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            Zur Startseite
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
          >
            Zurück
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default App;