import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

interface GFKVariantsProps {
  output: any;
  liveOutput: any;
  isTyping: boolean;
  user?: any;
  setShowChatDialog?: (open: boolean) => void;
}

const GFKVariants: React.FC<GFKVariantsProps> = ({ output, liveOutput, isTyping, user, setShowChatDialog }) => {
  const [showFlowText, setShowFlowText] = useState(false);
  if (!liveOutput && !output) return null;

  const gfkComponents = [
    { label: 'Beobachtung', key: 'observation', color: 'blue' },
    { label: 'Gefühl', key: 'feeling', color: 'green' },
    { label: 'Bedürfnis', key: 'need', color: 'orange' },
    { label: 'Bitte', key: 'request', color: 'purple' }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-gray-900">Deine GFK-Transformation:</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">4 Schritte</span>
          <Switch.Root
            className="w-12 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-purple-600 outline-none cursor-pointer transition-colors"
            checked={showFlowText}
            onCheckedChange={setShowFlowText}
            id="switch-flowtext"
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow absolute left-0.5 top-0.5 transition-transform data-[state=checked]:translate-x-6" />
          </Switch.Root>
          <span className="text-sm text-gray-600">Fließtext</span>
        </div>
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
      <div className="space-y-6">
        {showFlowText ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow"
          >
            <h4 className="font-semibold text-purple-700 mb-2"> So können Sie es empathisch ausdrücken: </h4>
            <p className="text-gray-900 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: output?.reformulated_text || '— Kein Fließtext generiert —' }} />
          </motion.div>
        ) : (
          gfkComponents.map((component, index) => (
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
          ))
        )}
      </div>
    </>
  );
};

export default GFKVariants; 