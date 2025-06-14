import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Heart, Sparkles, ThumbsUp, ThumbsDown, Info, MessageCircle, Shield, Mail, LogIn, LogOut, Menu, X as XIcon, FileText, Edit2, Save, Copy, Bot, ArrowRight, CheckCircle, Star, Zap, Users, Target } from 'lucide-react';
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

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Header component that will be used across all pages
function Header({ user, handleSignOut }: { user: any; handleSignOut: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
                <div className="absolute inset-0 bg-purple-600 rounded-full opacity-20 scale-150 group-hover:scale-175 transition-transform duration-300"></div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800">
                  GFKCoach
                </h1>
                <span className="text-xs text-purple-500 font-medium">
                  Powered by AI
                </span>
              </div>
              <motion.span 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="ml-3 text-xs text-purple-600 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1 rounded-full border border-purple-200 hidden sm:inline-block"
              >
                Beta
              </motion.span>
            </Link>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-1">
            {[
              { to: '/', icon: Sparkles, label: 'GFK Transform' },
              { to: '/about', icon: Info, label: 'Über GFK' },
              { to: '/contact', icon: Mail, label: 'Kontakt' }
            ].map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to={item.to}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    location.pathname === item.to
                      ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-lg border border-purple-200'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-md'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  <span>{item.label}</span>
                  {location.pathname === item.to && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
            
            {user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/profile"
                    className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      location.pathname === '/profile'
                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-lg'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50'
                    }`}
                  >
                    <span>Profil</span>
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Abmelden</span>
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/auth"
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Anmelden</span>
                </Link>
              </motion.div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-2 border-t border-gray-100 pt-4"
            >
              {/* Mobile menu items */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// Usage indicator component
function UsageIndicator() {
  const { getUsageInfo, isLoading } = useUserTracking();
  const usageInfo = getUsageInfo();

  if (isLoading || !usageInfo) return null;

  if (usageInfo.type === 'authenticated') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 left-4 z-40"
      >
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-2xl px-4 py-2 shadow-lg backdrop-blur-sm">
          <span className="font-medium text-green-800 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Angemeldet - Unbegrenzte Nutzung
          </span>
        </div>
      </motion.div>
    );
  }

  const isLowUsage = usageInfo.remaining <= 1;
  const bgColor = isLowUsage ? 'from-red-100 to-pink-100 border-red-300' : 'from-blue-100 to-indigo-100 border-blue-300';
  const textColor = isLowUsage ? 'text-red-800' : 'text-blue-800';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 left-4 z-40"
    >
      <div className={`bg-gradient-to-r ${bgColor} border rounded-2xl px-4 py-2 shadow-lg backdrop-blur-sm`}>
        <span className={`font-medium ${textColor} flex items-center`}>
          <Target className="h-4 w-4 mr-2" />
          {usageInfo.remaining} von {usageInfo.max} Nutzungen verfügbar
        </span>
      </div>
    </motion.div>
  );
}

// Flowing Text Dialog Component with editing capabilities
function FlowingTextDialog({ 
  isOpen, 
  onClose, 
  output,
  user
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  output: {
    observation: string;
    feeling: string;
    need: string;
    request: string;
  } | null;
  user: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeeling, setEditedFeeling] = useState('');
  const [editedNeed, setEditedNeed] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentFlowingText, setCurrentFlowingText] = useState('');

  useEffect(() => {
    if (output) {
      setEditedFeeling(stripHtml(output.feeling));
      setEditedNeed(stripHtml(output.need));
      updateFlowingText(stripHtml(output.feeling), stripHtml(output.need));
    }
  }, [output]);

  if (!output) return null;

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const createFlowingText = (feeling: string, need: string) => {
    const observation = stripHtml(output.observation);
    const request = stripHtml(output.request);
    
    let flowingText = observation;
    
    if (flowingText.endsWith('.')) {
      flowingText = flowingText.slice(0, -1);
    }
    
    if (feeling) {
      const feelingLower = feeling.toLowerCase();
      if (feelingLower.startsWith('ich ') || feelingLower.startsWith('fühle ') || feelingLower.startsWith('bin ')) {
        flowingText += `. ${feeling.charAt(0).toUpperCase() + feeling.slice(1)}`;
      } else {
        flowingText += `. So etwas ${feeling}`;
      }
    }
    
    if (need) {
      flowingText += `, weil mir ${need} wichtig ist.`;
    } else {
      if (!flowingText.endsWith('.')) {
        flowingText += '.';
      }
    }
    
    if (request) {
      flowingText += ` ${request}`;
      if (!request.endsWith('.') && !request.endsWith('?') && !request.endsWith('!')) {
        flowingText += '.';
      }
    }
    
    return flowingText;
  };

  const updateFlowingText = (feeling: string, need: string) => {
    const newFlowingText = createFlowingText(feeling, need);
    setCurrentFlowingText(newFlowingText);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentFlowingText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveEdit = () => {
    updateFlowingText(editedFeeling, editedNeed);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFeeling(stripHtml(output.feeling));
    setEditedNeed(stripHtml(output.need));
    updateFlowingText(stripHtml(output.feeling), stripHtml(output.need));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <XIcon className="h-6 w-6" />
            </button>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      GFK als Fließtext
                    </h3>
                    <p className="text-gray-500">Natürlich formuliert für den direkten Einsatz</p>
                  </div>
                </div>
                
                {user && !isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Anpassen
                  </motion.button>
                )}
              </div>

              {isEditing && user && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 space-y-6"
                >
                  <h4 className="font-semibold text-blue-900 text-lg">Gefühl und Bedürfnis anpassen:</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-3">
                        Gefühl:
                      </label>
                      <input
                        type="text"
                        value={editedFeeling}
                        onChange={(e) => setEditedFeeling(e.target.value)}
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="z.B. frustriert mich oder macht mich traurig"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-3">
                        Bedürfnis:
                      </label>
                      <input
                        type="text"
                        value={editedNeed}
                        onChange={(e) => setEditedNeed(e.target.value)}
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="z.B. Verlässlichkeit und Respekt"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveEdit}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Übernehmen
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelEdit}
                      className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Abbrechen
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border border-purple-100 shadow-inner">
                <p className="text-gray-800 leading-relaxed text-lg font-medium">
                  {currentFlowingText}
                </p>
              </div>

              {!user && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
                  <p className="text-yellow-800 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    <strong>Tipp:</strong> Melden Sie sich an, um Gefühl und Bedürfnis individuell anzupassen!
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center shadow-lg ${
                    copySuccess 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                  }`}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copySuccess ? 'Kopiert!' : 'Text kopieren'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300"
                >
                  Schließen
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// About GFK Content Component
const AboutContent = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-4xl mx-auto px-4 py-12"
  >
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-white shadow-2xl rounded-3xl p-8 lg:p-12"
    >
      <motion.div variants={fadeInUp} className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">
          Über Gewaltfreie Kommunikation
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Entdecken Sie die transformative Kraft der GFK nach Marshall B. Rosenberg
        </p>
      </motion.div>
      
      <motion.div variants={fadeInUp} className="space-y-8 text-gray-700">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-100">
          <p className="text-lg leading-relaxed">
            Gewaltfreie Kommunikation (GFK) ist ein von Marshall B. Rosenberg entwickelter Ansatz, 
            der Menschen dabei hilft, selbst in herausfordernden Situationen einfühlsam und authentisch 
            zu kommunizieren.
          </p>
        </div>

        <div className="space-y-6">
          <motion.h3 
            variants={fadeInLeft}
            className="text-2xl font-bold text-purple-600 flex items-center"
          >
            <Star className="h-6 w-6 mr-3" />
            Die vier Komponenten der GFK:
          </motion.h3>
          
          <motion.div 
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2"
          >
            {[
              {
                number: "1",
                title: "Beobachtung",
                description: "Beschreiben Sie die Situation objektiv, ohne zu bewerten oder zu interpretieren.",
                icon: Target,
                color: "from-blue-500 to-cyan-500"
              },
              {
                number: "2", 
                title: "Gefühl",
                description: "Drücken Sie Ihre Gefühle aus, die durch die Situation entstehen.",
                icon: Heart,
                color: "from-pink-500 to-rose-500"
              },
              {
                number: "3",
                title: "Bedürfnis", 
                description: "Benennen Sie die Bedürfnisse, die hinter Ihren Gefühlen stehen.",
                icon: Zap,
                color: "from-orange-500 to-amber-500"
              },
              {
                number: "4",
                title: "Bitte",
                description: "Formulieren Sie eine konkrete, positive und machbare Bitte.",
                icon: CheckCircle,
                color: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <motion.div 
                key={item.number}
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {item.number}
                </div>
                <div className={`inline-flex p-3 bg-gradient-to-r ${item.color} rounded-2xl mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={fadeInRight} className="mt-12">
          <h3 className="text-2xl font-bold text-purple-600 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-3" />
            Vorteile der GFK:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Verbessert zwischenmenschliche Beziehungen",
              "Reduziert Konflikte und Missverständnisse", 
              "Fördert empathisches Zuhören und Verstehen",
              "Ermöglicht konstruktive Konfliktlösung",
              "Stärkt emotionale Intelligenz und Selbstausdruck",
              "Schafft tiefere Verbindungen zu anderen Menschen"
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl"
              >
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Main page content component
function MainContent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<{
    observation: string;
    feeling: string;
    need: string;
    request: string;
  } | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  
  const [isGfkLoading, setIsGfkLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showNegativeFeedbackDialog, setShowNegativeFeedbackDialog] = useState(false);
  const [showPositiveFeedbackDialog, setShowPositiveFeedbackDialog] = useState(false);
  const [showFlowingTextDialog, setShowFlowingTextDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [user, setUser] = useState(null);

  const { canUseService, incrementUsage, getUsageInfo } = useUserTracking();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error && error.message.includes('Session from session_id claim in JWT does not exist')) {
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Error getting user:', err);
        setUser(null);
      }
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    if (!canUseService()) {
      const usageInfo = getUsageInfo();
      if (usageInfo?.type === 'authenticated') {
        setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      } else {
        setError('Sie haben das Limit für kostenlose Nutzungen erreicht. Bitte melden Sie sich an für unbegrenzte Nutzung.');
      }
      return;
    }

    setIsGfkLoading(true);
    setError(null);
    setOutput(null);
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

      setOutput(data);
      await incrementUsage();

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
    } finally {
      setIsGfkLoading(false);
    }
  };

  const handleNewsletterSubmit = async (email: string, name: string, message: string) => {
    setIsEmailLoading(true);
    setError(null);
    setSubscribeSuccess(false);

    try {
      const { error: messageError } = await supabase
        .from('newsletter_messages')
        .insert([{ name, email, message }]);

      if (messageError) {
        throw new Error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }

      const { error: subscribeError } = await supabase
        .from('subscribers')
        .insert([{ name, email }]);

      if (subscribeError && subscribeError.code !== '23505') {
        console.warn('Warning saving to subscribers:', subscribeError);
      }

      setSubscribeSuccess(true);
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
      setIsEmailLoading(false);
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
      const feedbackData = {
        input_text: input,
        output_text: output,
        is_helpful: false,
        reasons: feedback.reasons,
        other_reason: feedback.otherReason,
        better_formulation: feedback.betterFormulation,
        user_id: user?.id || null
      };

      await supabase.from('feedback').insert([feedbackData]);
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
      const feedbackData = {
        input_text: input,
        output_text: output,
        is_helpful: true,
        reasons: feedback.reasons,
        other_reason: feedback.otherReason,
        additional_comment: feedback.additionalComment,
        user_id: user?.id || null
      };

      await supabase.from('feedback').insert([feedbackData]);
      setFeedbackGiven(true);
      setShowPositiveFeedbackDialog(false);
    } catch (err) {
      console.error('Error submitting positive feedback:', err);
    }
  };

  return (
    <>
      <UsageIndicator />
      
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-20"
          >
            {/* Hero Section */}
            <motion.div variants={fadeInUp} className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full border border-purple-200 mb-8"
              >
                <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-purple-700 font-medium">Powered by Advanced AI</span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-6xl lg:text-7xl font-bold"
              >
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800">
                  Transformiere deine
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mt-2">
                  Kommunikation
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              >
                Wandle alltägliche Nachrichten in <span className="font-semibold text-purple-600">gewaltfreie Kommunikation</span> um - 
                mit der Kraft künstlicher Intelligenz und nur einem Klick.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Sofortige Transformation
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Wissenschaftlich fundiert
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Einfach zu verwenden
                </div>
              </motion.div>
            </motion.div>

            {/* Examples Section */}
            <motion.div variants={fadeInRight} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 lg:p-12 border border-white/20">
              <motion.h3 
                variants={fadeInLeft}
                className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center"
              >
                Sieh die Transformation in Aktion
              </motion.h3>
              
              <motion.div 
                variants={staggerContainer}
                className="grid gap-8 lg:grid-cols-2"
              >
                {[
                  {
                    original: "Du kommst schon wieder zu spät!",
                    gfk: "Wenn ich sehe, dass du 15 Minuten nach der vereinbarten Zeit kommst, bin ich frustriert, weil mir Verlässlichkeit wichtig ist. Könntest du mir bitte Bescheid geben, wenn du dich verspätest?",
                    gradient: "from-red-50 to-orange-50",
                    border: "border-red-200"
                  },
                  {
                    original: "Du hörst mir nie richtig zu!",
                    gfk: "Wenn ich merke, dass du während unseres Gesprächs auf dein Handy schaust, fühle ich mich traurig, weil mir der Austausch mit dir wichtig ist. Wärst du bereit, dir Zeit für ein ungestörtes Gespräch zu nehmen?",
                    gradient: "from-blue-50 to-indigo-50", 
                    border: "border-blue-200"
                  }
                ].map((example, index) => (
                  <motion.div 
                    key={index}
                    variants={scaleIn}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`bg-gradient-to-br ${example.gradient} p-6 lg:p-8 rounded-2xl shadow-lg border ${example.border} hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <p className="font-semibold text-gray-800">Ursprüngliche Nachricht:</p>
                        </div>
                        <p className="text-gray-700 italic">"{example.original}"</p>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <p className="font-semibold text-purple-800">GFK-Version:</p>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {example.gfk}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Main Input Section */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 lg:p-12 border border-white/20"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div variants={fadeInLeft}>
                  <label htmlFor="input" className="block text-xl font-semibold text-gray-800 mb-4">
                    Was möchtest du sagen?
                  </label>
                  <textarea
                    id="input"
                    rows={5}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-2xl p-6 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
                    placeholder="Schreibe deine Nachricht hier... z.B. 'Du machst das immer falsch!'"
                  />
                </motion.div>

                <motion.div 
                  variants={fadeInRight}
                  className="flex justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isGfkLoading || !input.trim() || !canUseService()}
                    className={`group relative px-8 py-4 text-xl font-semibold rounded-2xl text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 flex items-center shadow-2xl ${
                      (isGfkLoading || !input.trim() || !canUseService()) && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="relative flex items-center">
                      {isGfkLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                          Verarbeite...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                          In GFK umformulieren
                          <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200 text-red-700 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <XIcon className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </form>

              <AnimatePresence>
                {output && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mt-12 space-y-8"
                  >
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-gray-900 text-center"
                    >
                      ✨ Deine GFK-Formulierung
                    </motion.h3>
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border border-purple-200 shadow-inner"
                    >
                      <div className="space-y-6">
                        {[
                          { label: "Beobachtung", content: output.observation, color: "text-blue-600", bg: "bg-blue-50" },
                          { label: "Gefühl", content: output.feeling, color: "text-green-600", bg: "bg-green-50" },
                          { label: "Bedürfnis", content: output.need, color: "text-orange-600", bg: "bg-orange-50" },
                          { label: "Bitte", content: output.request, color: "text-purple-600", bg: "bg-purple-50" }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className={`p-4 ${item.bg} rounded-xl border border-gray-200`}
                          >
                            <span className={`font-bold ${item.color} text-lg`}>{item.label}:</span>{' '}
                            <span 
                              className="text-gray-800 text-lg leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: item.content }} 
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex flex-wrap justify-center gap-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFlowingTextDialog(true)}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Als Fließtext anzeigen
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: user ? 1.05 : 1, y: user ? -2 : 0 }}
                        whileTap={{ scale: user ? 0.95 : 1 }}
                        onClick={() => user ? setShowChatDialog(true) : null}
                        disabled={!user}
                        className={`flex items-center px-6 py-3 rounded-xl transition-all duration-300 shadow-lg ${
                          user 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={!user ? 'Nur für registrierte Benutzer verfügbar' : ''}
                      >
                        <Bot className="h-5 w-5 mr-2" />
                        GFK-Coach fragen
                      </motion.button>
                    </motion.div>

                    {!user && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 text-center"
                      >
                        <p className="text-yellow-800 flex items-center justify-center">
                          <Sparkles className="h-5 w-5 mr-2" />
                          <strong>Tipp:</strong> Melden Sie sich an, um den GFK-Coach zu nutzen und Ihre Transformationen zu speichern!
                        </p>
                      </motion.div>
                    )}

                    {/* Feedback Section */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="border-t border-gray-200 pt-8"
                    >
                      <p className="text-gray-700 mb-6 text-center text-lg">War diese Umformulierung hilfreich?</p>
                      <div className="flex justify-center gap-6">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleFeedback(true)}
                          disabled={feedbackGiven}
                          className={`flex items-center px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                            feedbackGiven 
                              ? 'border-gray-200 text-gray-400 bg-gray-50' 
                              : 'border-green-500 text-green-600 hover:bg-green-50 hover:shadow-lg'
                          }`}
                        >
                          <ThumbsUp className="h-5 w-5 mr-2" />
                          Ja, hilfreich!
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleFeedback(false)}
                          disabled={feedbackGiven}
                          className={`flex items-center px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                            feedbackGiven 
                              ? 'border-gray-200 text-gray-400 bg-gray-50' 
                              : 'border-red-500 text-red-600 hover:bg-red-50 hover:shadow-lg'
                          }`}
                        >
                          <ThumbsDown className="h-5 w-5 mr-2" />
                          Verbesserungsbedarf
                        </motion.button>
                      </div>
                      
                      {feedbackGiven && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-gray-600 text-center mt-6 text-lg"
                        >
                          🙏 Vielen Dank für dein wertvolles Feedback!
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              variants={fadeInUp}
              className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-12 text-white text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>
              
              <div className="relative z-10 space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                >
                  <Heart className="h-16 w-16 mx-auto mb-6 text-white opacity-90" />
                </motion.div>
                
                <motion.h2 
                  variants={fadeInUp}
                  className="text-3xl lg:text-4xl font-bold mb-6"
                >
                  Hilf uns, GFKCoach zu verbessern!
                </motion.h2>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
                >
                  Damit wir die App weiterentwickeln können, würden wir uns freuen, 
                  dich kontaktieren zu dürfen und dein Feedback zu erhalten.
                </motion.p>
                
                <motion.form 
                  variants={staggerContainer}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNewsletterSubmit(email, name, message);
                  }} 
                  className="max-w-lg mx-auto space-y-6"
                >
                  <motion.div variants={fadeInLeft}>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dein Name"
                      className="w-full px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white/95 backdrop-blur-sm text-lg"
                      required
                    />
                  </motion.div>
                  
                  <motion.div variants={fadeInRight}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Deine E-Mail"
                      className="w-full px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white/95 backdrop-blur-sm text-lg"
                      required
                    />
                  </motion.div>
                  
                  <motion.div variants={fadeInLeft}>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Deine Nachricht oder Feedback (optional)"
                      rows={4}
                      className="w-full px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white/95 backdrop-blur-sm resize-none text-lg"
                    />
                  </motion.div>
                  
                  <motion.div 
                    variants={fadeInUp}
                    className="flex justify-center"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255,255,255,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={isEmailLoading}
                      className={`bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center text-lg shadow-lg ${
                        isEmailLoading && 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {isEmailLoading ? 'Wird gespeichert...' : 'Eintrag speichern'}
                    </motion.button>
                  </motion.div>
                </motion.form>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-800/20 rounded-xl text-white max-w-md mx-auto"
                  >
                    {error}
                  </motion.div>
                )}
                
                {subscribeSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-800/20 rounded-xl text-white max-w-md mx-auto"
                  >
                    ✅ Vielen Dank für deine Bereitschaft!
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              variants={scaleIn}
              className="bg-white/90 backdrop-blur-xl shadow-lg rounded-3xl px-8 py-6 flex items-center justify-center mx-auto max-w-max border border-white/20"
            >
              <MessageCircle className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-semibold text-purple-600 text-lg">
                61 Nutzer haben bereits getestet
              </span>
              <div className="ml-4 flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

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

      <FlowingTextDialog
        isOpen={showFlowingTextDialog}
        onClose={() => setShowFlowingTextDialog(false)}
        output={output}
        user={user}
      />

      <ChatDialog
        isOpen={showChatDialog}
        onClose={() => setShowChatDialog(false)}
        originalInput={input}
        gfkOutput={output || { observation: '', feeling: '', need: '', request: '' }}
        user={user}
      />
    </>
  );
}

function App() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error && error.message.includes('Session from session_id claim in JWT does not exist')) {
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        
        setUser(user);
      } catch (err) {
        console.error('Error getting user:', err);
        setUser(null);
      }
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <Header user={user} handleSignOut={handleSignOut} />

        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/profile" /> : <Auth />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/about" element={<AboutContent />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/" element={<MainContent />} />
        </Routes>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white/80 backdrop-blur-sm mt-20 py-12 border-t border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-lg"
            >
              © {new Date().getFullYear()} GFKCoach - Alle Rechte vorbehalten
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
              onClick={() => setShowPrivacyPolicy(true)}
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center mx-auto mt-4 hover:scale-105 transition-transform duration-200"
            >
              <Shield className="h-4 w-4 mr-2" />
              Datenschutz
            </motion.button>
          </div>
        </motion.footer>

        <PrivacyPolicy
          isOpen={showPrivacyPolicy}
          onClose={() => setShowPrivacyPolicy(false)}
        />
      </div>
    </Router>
  );
}

export default App;