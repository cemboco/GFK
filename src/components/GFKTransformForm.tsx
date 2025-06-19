import React from 'react';
import { AnimatePresence } from 'framer-motion';
import GFKInputForm from './GFKInputForm';
import GFKResults from './GFKResults';
import GFKVariants from './GFKVariants';
import FeedbackSection from './FeedbackSection';

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
}

const GFKTransformForm: React.FC<GFKTransformFormProps> = (props) => {
  const { liveOutput, output } = props;

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
      />

      {/* Results */}
      <AnimatePresence>
        {(liveOutput || output) && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              <GFKResults
                liveOutput={liveOutput}
                output={output}
                isTyping={props.isTyping}
                user={props.user}
                setShowChatDialog={props.setShowChatDialog}
              />
              
              <GFKVariants
                liveOutput={liveOutput}
                output={output}
                isTyping={props.isTyping}
              />
              
              <FeedbackSection
                output={output}
                isTyping={props.isTyping}
                feedbackGiven={props.feedbackGiven}
                handleFeedback={props.handleFeedback}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GFKTransformForm; 