import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, Crown, AlertCircle, Lock, Send, Target } from 'lucide-react';
import { useChatUsage } from '../hooks/useChatUsage';
import { useLanguage } from '../contexts/LanguageContext';

interface UsageInfo {
  remaining: number;
  max: number;
}

interface GFKInputFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  canUseService: () => boolean;
  handleSubmit: (e: React.FormEvent) => void;
  error: string | null;
  context?: string;
  setContext?: (context: string) => void;
  user: any;
  usageInfo?: UsageInfo | null;
  onOpenExerciseModal?: () => void;
}

const GFKInputForm: React.FC<GFKInputFormProps> = ({
  input,
  setInput,
  isLoading,
  canUseService,
  handleSubmit,
  error,
  context = 'general',
  setContext,
  user,
  usageInfo,
  onOpenExerciseModal
}) => {
  const { t } = useLanguage();
  const { chatUsage, isLoading: chatUsageLoading } = useChatUsage(user);
  
  const contextOptions = [
    { value: 'general', label: t.gfkForm.contextOptions.general },
    { value: 'child', label: t.gfkForm.contextOptions.child },
    { value: 'business', label: t.gfkForm.contextOptions.business },
    { value: 'partner', label: t.gfkForm.contextOptions.partner },
    { value: 'colleague', label: t.gfkForm.contextOptions.colleague }
  ];

  const selectedContext = contextOptions.find(option => option.value === context) || contextOptions[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-12"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          {t.gfkForm.title}
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          {t.gfkForm.subtitle}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Je genauer der Text, desto besser ist die Transformation..
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Context Selection */}
        {setContext && (
          <div>
            <label htmlFor="context" className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
              {t.gfkForm.contextLabel}
            </label>
            {user ? (
              <div className="relative">
                <select
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl p-3 sm:p-4 text-base sm:text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm appearance-none pr-12"
                >
                  {contextOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <div className="relative">
                <div className="w-full border-2 border-gray-200 rounded-2xl p-3 sm:p-4 text-base sm:text-lg bg-gray-100 text-gray-500 shadow-sm flex items-center justify-between">
                  <span className="text-sm sm:text-base">{t.gfkForm.contextOptions.general}</span>
                  <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            )}
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {t.gfkForm.contextDescription}
            </p>
          </div>
        )}

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
            <label htmlFor="input" className="block text-base sm:text-lg font-semibold text-gray-800">
              Was möchtest du sagen?
            </label>
            
            {/* Übungs-Button für alle Nutzer (grau für nicht-registrierte) */}
            <motion.button
              whileHover={{ scale: user ? 1.05 : 1 }}
              whileTap={{ scale: user ? 0.95 : 1 }}
              type="button"
              onClick={user ? onOpenExerciseModal : undefined}
              disabled={!user}
              className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl shadow-md transition-all duration-200 ${
                user 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>GFK-Übung</span>
              {!user && <span className="text-xs ml-1 hidden sm:inline">(Anmeldung erforderlich)</span>}
            </motion.button>
          </div>
          
          {/* Usage Display */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
            {/* Chat Usage Display for authenticated users */}
            {user && chatUsage && !chatUsageLoading && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-2 shadow-sm border border-gray-200">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    {chatUsage.remainingMessages}/{chatUsage.maxMessages} Chat
                  </span>
                </div>
                {chatUsage.remainingMessages === 0 && (
                  <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    <span className="text-xs sm:text-sm text-red-700 font-medium">Limit erreicht</span>
                  </div>
                )}
              </div>
            )}
            
            {/* GFK Transformation Usage Display for non-authenticated users */}
            {!user && usageInfo && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-2 shadow-sm border border-gray-200">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    {usageInfo.remaining}/{usageInfo.max} Transformationen
                  </span>
                </div>
                {usageInfo.remaining === 0 && (
                  <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                    <span className="text-xs sm:text-sm text-red-700 font-medium">Limit erreicht</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <textarea
            id="input"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-2xl p-4 sm:p-6 text-base sm:text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm resize-none"
            placeholder={t.gfkForm.inputPlaceholder}
          />
          
          {/* Usage Info for non-authenticated users */}
          {!user && (
            <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
              <span>Melde dich an für unbegrenzte Transformationen und den GFK-Coach (3 Nachrichten/Monat)</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || !input.trim() || !canUseService()}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 ${
              (isLoading || !input.trim() || !canUseService()) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                <span>{t.gfkForm.loading}</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>{t.gfkForm.submitButton}</span>
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-3 sm:p-4 text-red-700 text-center text-sm sm:text-base"
          >
            {error}
          </motion.div>
        )}
      </form>
    </motion.section>
  );
};

export default GFKInputForm; 