import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface GFKVariantsProps {
  output: any;
  liveOutput: any;
  isTyping: boolean;
  user?: any;
  setShowChatDialog?: (open: boolean) => void;
}

const GFKVariants: React.FC<GFKVariantsProps> = ({ output, liveOutput, isTyping, user, setShowChatDialog }) => {
  if (!liveOutput && !output) return null;

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation:</h3>
        {output && !isTyping && setShowChatDialog && (
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow"
      >
        <h4 className="font-semibold text-purple-700 mb-2"> So können Sie es empathisch ausdrücken: </h4>
        <p className="text-gray-900 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: output?.reformulated_text || output?.fliesstext || '— Kein Fließtext generiert —' }} />
      </motion.div>
    </>
  );
};

export default GFKVariants; 