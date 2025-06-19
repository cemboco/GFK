import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';

interface GFKTransformFormProps {
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
}

const GFKTransformForm: React.FC<GFKTransformFormProps> = ({
  input,
  setInput,
  isLoading,
  canUseService,
  handleSubmit,
  error,
  liveOutput,
  output,
  isTyping,
  user,
  setShowChatDialog,
  feedbackGiven,
  handleFeedback
}) => (
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
);

export default GFKTransformForm; 