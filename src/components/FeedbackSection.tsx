import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackSectionProps {
  output: any;
  isTyping: boolean;
  feedbackGiven: boolean;
  handleFeedback: (isHelpful: boolean) => void;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  output,
  isTyping,
  feedbackGiven,
  handleFeedback
}) => {
  if (!output || isTyping) return null;

  return (
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
  );
};

export default FeedbackSection; 