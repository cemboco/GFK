import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import GFKInputForm from './GFKInputForm';
import GFKVariants from './GFKVariants';
import FeedbackSection from './FeedbackSection';

interface UsageInfo {
  remaining: number;
  max: number;
}

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
  context?: string;
  setContext?: (context: string) => void;
  usageInfo?: UsageInfo | null;
}

const GFKTransformForm: React.FC<GFKTransformFormProps> = (props) => {
  const { liveOutput, output, isTyping } = props;

  return (
    <>
      <GFKInputForm
        input={props.input}
        setInput={props.setInput}
        isLoading={props.isLoading}
        canUseService={props.canUseService}
        handleSubmit={props.handleSubmit}
        error={props.error}
        context={props.context}
        setContext={props.setContext}
        user={props.user}
        usageInfo={props.usageInfo}
      />

      {/* Results */}
      <AnimatePresence>
        {(liveOutput || output) && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <GFKVariants
                liveOutput={liveOutput}
                output={output}
                isTyping={props.isTyping}
                user={props.user}
                setShowChatDialog={props.setShowChatDialog}
              />
              <FeedbackSection
                output={output}
                isTyping={props.isTyping}
                feedbackGiven={props.feedbackGiven}
                handleFeedback={props.handleFeedback}
              />
            </div>
            
            {/* Tipp für die Praxis */}
            {!isTyping && output && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start space-x-4"
              >
                <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Tipp für die Praxis</h4>
                  <p className="text-yellow-700 leading-relaxed">
                    Üben Sie diese Umformulierung zunächst für sich selbst, bevor Sie sie im Gespräch verwenden. Echte GFK entsteht durch innere Haltung, nicht nur durch die richtige Formulierung.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GFKTransformForm; 