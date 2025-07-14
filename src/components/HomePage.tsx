import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Coffee, Sparkles, ArrowRight, CheckCircle, X as XIcon, Zap, Target, Heart, Send } from 'lucide-react';
import GFKTransformForm from './GFKTransformForm';
import Testimonials from './Testimonials';
import { useLanguage } from '../contexts/LanguageContext';

interface HomePageProps {
  // Define types for props that are passed down
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  canUseService: () => boolean;
  handleSubmit: (e: React.FormEvent) => void;
  error: string | null;
  liveOutput: any;
  output: any;
  isTyping: boolean;
  user: any;
  setShowChatDialog: (open: boolean) => void;
  feedbackGiven: boolean;
  handleFeedback: (isHelpful: boolean) => void;
  context?: string;
  setContext?: (context: string) => void;
  usageInfo?: { remaining: number; max: number } | null;
  handleMessageSubmit: (e: React.FormEvent) => void;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  messageSuccess: boolean;
  handleContextSubmit?: (context: string) => void;
  handleOpenExerciseModal?: () => void;
}

const HomePage: React.FC<HomePageProps> = (props) => {
    const { t } = useLanguage();
    
    // Debug-Ausgabe
    console.log('HomePage Props:', {
      input: props.input,
      isLoading: props.isLoading,
      canUseService: props.canUseService,
      user: props.user,
      error: props.error
    });

    return (
        <motion.div
        key="gfk"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8 sm:space-y-12 lg:space-y-16"
      >
        {/* Hero Section */}
        <section className="text-center space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t.home.hero.subtitle}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight px-4">
              {t.home.hero.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              {t.home.hero.description}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-8 text-center px-4"
          >
            {[
              { icon: Users, value: '1.200+', label: t.home.stats.activeUsers },
              { icon: MessageCircle, value: '4.000+', label: t.home.stats.transformations },
            ].map((stat, index) => (
              <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Spenden-Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-4 px-4"
          >
            <a
              href="https://coff.ee/cemil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t.home.support.button}</span>
            </a>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
              {t.home.support.note}
            </p>
          </motion.div>
        </section>

        {/* Examples Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-12"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t.home.examples.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              {t.home.examples.subtitle}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {[
              {
                before: t.examples.late.before,
                after: t.examples.late.after
              },
              {
                before: t.examples.listening.before,
                after: t.examples.listening.after
              }
            ].map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2 text-sm sm:text-base">{t.home.examples.before}</h4>
                      <p className="text-red-700 text-sm sm:text-base">"{example.before}"</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">{t.home.examples.after}</h4>
                      <p className="text-green-700 text-sm sm:text-base">"{example.after}"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      {/* GFKTransformForm-Komponente */}
      <GFKTransformForm
        input={props.input}
        setInput={props.setInput}
        isLoading={props.isLoading}
        canUseService={props.canUseService}
        handleSubmit={props.handleSubmit}
        error={props.error}
        liveOutput={props.liveOutput}
        output={props.output}
        isTyping={props.isTyping}
        user={props.user}
        setShowChatDialog={props.setShowChatDialog}
        feedbackGiven={props.feedbackGiven}
        handleFeedback={props.handleFeedback}
        context={props.context}
        setContext={props.setContext}
        usageInfo={props.usageInfo}
        handleContextSubmit={props.handleContextSubmit}
        handleOpenExerciseModal={props.handleOpenExerciseModal}
      />

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-8 sm:space-y-12"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t.home.features.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {t.home.features.subtitle}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
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
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-purple-50/50 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-12"
        >
            <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Was unsere Nutzer über uns sagen
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                Echte Erfahrungen von Menschen, die ihre Kommunikation mit unserem GFK Coach transformiert haben.
                </p>
            </div>
            <Testimonials />
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 xl:p-12 text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Hilf uns, GFKCoach zu verbessern!</h2>
              <p className="text-lg sm:text-xl text-purple-100 max-w-2xl mx-auto px-4">
                Teile deine Erfahrungen mit uns und gestalte die Zukunft der empathischen Kommunikation mit.
              </p>
            </div>
            
            <form onSubmit={props.handleMessageSubmit} className="max-w-lg mx-auto space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={props.name}
                  onChange={(e) => props.setName(e.target.value)}
                  placeholder="Dein Name"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-sm sm:text-base"
                  required
                />
                <input
                  type="email"
                  value={props.email}
                  onChange={(e) => props.setEmail(e.target.value)}
                  placeholder="Deine E-Mail"
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-sm sm:text-base"
                  required
                />
              </div>
              <textarea
                value={props.message}
                onChange={(e) => props.setMessage(e.target.value)}
                placeholder="Deine Nachricht oder Feedback..."
                rows={4}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 transition-all resize-none text-sm sm:text-base"
                required
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={props.isLoading}
                className={`w-full bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg text-sm sm:text-base ${
                  props.isLoading && 'opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{props.isLoading ? 'Wird gesendet...' : 'Nachricht senden'}</span>
              </motion.button>
            </form>
            
            {props.error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-300/30 rounded-2xl p-3 sm:p-4 text-white max-w-lg mx-auto text-sm sm:text-base"
              >
                {props.error}
              </motion.div>
            )}
            {props.messageSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-300/30 rounded-2xl p-3 sm:p-4 text-white max-w-lg mx-auto text-sm sm:text-base"
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
          className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-12"
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Häufig gestellte Fragen
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Finde Antworten auf die wichtigsten Fragen zu GFKCoach
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {t.home.faq.questions.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg sm:text-xl font-bold text-purple-600 mb-2 sm:mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        </motion.div>
    )
}

export default HomePage; 