import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, Crown, AlertCircle, Lock } from 'lucide-react';
import { useChatUsage } from '../hooks/useChatUsage';

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
  usageInfo
}) => {
  const { chatUsage, isLoading: chatUsageLoading } = useChatUsage(user);
  
  const contextOptions = [
    { value: 'general', label: 'Allgemein', description: 'Für verschiedene Situationen' },
    { value: 'child', label: 'Kind/Jugendliche', description: 'Einfühlsame Kommunikation mit Kindern' },
    { value: 'business', label: 'Geschäftsgespräch', description: 'Professionelle Kommunikation' },
    { value: 'partner', label: 'Partner/In', description: 'Intime Beziehungen' },
    { value: 'colleague', label: 'Kollegen', description: 'Arbeitsumgebung' }
  ];

  const selectedContext = contextOptions.find(option => option.value === context) || contextOptions[0];

  return (
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
        <p className="text-sm text-gray-500 mt-2">
          Je genauer der Text, desto besser ist die Transformation..
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Context Selection */}
        {setContext && (
          <div>
            <label htmlFor="context" className="block text-lg font-semibold text-gray-800 mb-3">
              Kontext auswählen
            </label>
            {user ? (
              <div className="relative">
                <select
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm appearance-none pr-12"
                >
                  {contextOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <div className="relative">
                <div className="w-full border-2 border-gray-200 rounded-2xl p-4 text-lg bg-gray-100 text-gray-500 shadow-sm flex items-center justify-between">
                  <span>Allgemein - Für verschiedene Situationen</span>
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {user 
                ? "Wähle den passenden Kontext für bessere, angepasste Formulierungen."
                : "Registriere dich, um weitere Kontexte freizuschalten."}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="input" className="block text-lg font-semibold text-gray-800">
              Was möchtest du sagen?
            </label>
            
            {/* Usage Display */}
            <div className="flex items-center space-x-2">
              {/* Chat Usage Display for authenticated users */}
              {user && chatUsage && !chatUsageLoading && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      {chatUsage.remainingMessages}/{chatUsage.maxMessages} Chat-Nachrichten
                    </span>
                  </div>
                  {chatUsage.remainingMessages === 0 && (
                    <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">Limit erreicht</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* GFK Transformation Usage Display for non-authenticated users */}
              {!user && usageInfo && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-gray-700 font-medium">
                      {usageInfo.remaining}/{usageInfo.max} Transformationen
                    </span>
                  </div>
                  {usageInfo.remaining === 0 && (
                    <div className="flex items-center space-x-2 bg-red-100 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">Limit erreicht</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <textarea
            id="input"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-2xl p-6 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm resize-none"
            placeholder="Schreibe hier deine Nachricht..."
          />
          
          {/* Usage Info for non-authenticated users */}
          {!user && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
              <Crown className="h-4 w-4 text-yellow-600" />
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
    </motion.section>
  );
};

export default GFKInputForm; 