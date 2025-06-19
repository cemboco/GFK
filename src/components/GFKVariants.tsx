import React from 'react';
import { motion } from 'framer-motion';

interface GFKVariantsProps {
  liveOutput: any;
  output: any;
  isTyping: boolean;
}

const GFKVariants: React.FC<GFKVariantsProps> = ({
  liveOutput,
  output,
  isTyping
}) => {
  if (!liveOutput?.variant1 && !output?.variant1) return null;

  return (
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
  );
};

export default GFKVariants; 