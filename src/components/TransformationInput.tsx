import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Lightbulb, Sparkles, Quote, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TransformationInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isTransforming: boolean;
  onTransform: () => void;
  isAuthenticated: boolean;
  remainingTransformations: number;
}

const TransformationInput: React.FC<TransformationInputProps> = ({
  inputText,
  setInputText,
  isTransforming,
  onTransform,
  isAuthenticated,
  remainingTransformations
}) => {
  const { t } = useLanguage();
  const isDisabled = !isAuthenticated && remainingTransformations <= 0;

  const fadeInVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-xl font-semibold text-gray-900 mb-4"
          >
            Nachricht transformieren
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-sm text-gray-600 mt-1"
          >
            Verwandeln Sie Ihre Kommunikation in eine empathische, verbindende Botschaft
          </motion.p>
        </div>
        <motion.div 
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="hidden sm:flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <MessageCircle size={16} color="white" />
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <motion.textarea
            initial={{ opacity: 0, height: "100px" }}
            animate={{ opacity: 1, height: "128px" }}
            transition={{ delay: 0.3, duration: 0.4 }}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ihre Nachricht hier eingeben..."
            disabled={isDisabled}
            className={`w-full h-32 px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
              isDisabled 
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            maxLength={500}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {inputText.length}/500
          </div>
        </div>

        <AnimatePresence>
          {isDisabled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <AlertTriangle size={16} className="text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Sie haben Ihr Limit erreicht. Melden Sie sich an für unbegrenzte Transformationen.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <Lightbulb size={16} className="text-orange-500" />
              <span className="text-sm text-gray-600">GFK-Transformation</span>
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
              className="flex items-center space-x-1"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }} 
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} 
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }} 
                className="w-2 h-2 bg-orange-500 rounded-full"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }} 
                className="w-2 h-2 bg-purple-500 rounded-full"
              />
            </motion.div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onTransform}
            disabled={!inputText.trim() || isTransforming || isDisabled}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 min-h-[44px] ${
              !inputText.trim() || isTransforming || isDisabled 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isTransforming ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Transformiere...</span>
              </>
            ) : (
              <>
                <motion.div 
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles size={18} />
                </motion.div>
                <span>Transformieren</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Example Messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-6 pt-6 border-t border-gray-200"
      >
        <h4 className="text-sm font-medium text-gray-900 mb-3">Beispiele zum Ausprobieren:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.transformationExamples.map((example, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.03, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => !isDisabled && setInputText(example)}
              disabled={isDisabled}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                isDisabled 
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-200 bg-gray-50 hover:border-purple-200 hover:bg-purple-50 text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Quote size={14} className={isDisabled ? 'text-gray-400' : 'text-gray-400'} />
                <span className="text-sm">{example}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransformationInput;