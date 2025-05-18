import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Repeat, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const MAX_SENTENCES = 2;

function countSentences(text: string): number {
  const sentences = text.match(/[^.!?]+[.!?](?:\s|$)/g) || [];
  return sentences.length;
}

export default function MirroringTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const sentenceCount = countSentences(text);
    
    if (sentenceCount > MAX_SENTENCES) {
      setError(`Bitte beschränke deine Eingabe auf maximal ${MAX_SENTENCES} Sätze.`);
      return;
    }
    
    setInput(text);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Bitte geben Sie einen Text ein.');
      return;
    }

    const sentenceCount = countSentences(input);
    if (sentenceCount > MAX_SENTENCES) {
      setError(`Bitte beschränke deine Eingabe auf maximal ${MAX_SENTENCES} Sätze.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);
    setFeedbackGiven(false);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('mirror-response', {
        body: { input: input.trim() }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setOutput(data.response);
    } catch (err) {
      console.error('Error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackGiven) return;
    
    try {
      await supabase.functions.invoke('feedback', {
        body: { 
          input,
          output: { response: output },
          isHelpful
        }
      });
      setFeedbackGiven(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Aktives Zuhören durch Spiegeln
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Lasse deine Nachricht spiegeln, um sicherzustellen, dass du richtig verstanden wirst.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          (Maximal {MAX_SENTENCES} Sätze pro Eingabe)
        </p>
      </motion.div>

      <div className="bg-white shadow-xl rounded-2xl p-8 mb-12">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="mirror-input" className="block text-lg font-medium text-gray-700 mb-2">
              Was möchtest du spiegeln lassen?
            </label>
            <textarea
              id="mirror-input"
              rows={4}
              value={input}
              onChange={handleInputChange}
              className="shadow-sm block w-full border-2 border-gray-200 rounded-xl p-4 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
              placeholder="Schreibe deine Nachricht hier... (maximal 2 Sätze)"
            />
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-6 py-3 border border-transparent text-lg font-medium rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out flex items-center ${
                (isLoading || !input.trim()) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              <Repeat className="h-5 w-5 mr-2" />
              {isLoading ? 'Verarbeite...' : 'Nachricht spiegeln'}
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-red-700"
            >
              {error}
            </motion.div>
          )}
        </form>

        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gespiegelte Nachricht:</h3>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-purple-50 p-6 rounded-xl border border-purple-100"
                >
                  <p className="text-gray-800 leading-relaxed">{output}</p>
                </motion.div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <p className="text-gray-700 mb-4">War diese Spiegelung hilfreich?</p>
                  <div className="flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackGiven}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        feedbackGiven ? 'border-gray-200 text-gray-400' : 'border-green-500 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      Ja
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackGiven}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        feedbackGiven ? 'border-gray-200 text-gray-400' : 'border-red-500 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      Nein
                    </motion.button>
                  </div>
                  {feedbackGiven && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-600 text-center mt-4"
                    >
                      Danke für dein Feedback!
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}