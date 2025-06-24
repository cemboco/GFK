import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, X, Heart, Target, Eye, MessageCircle, Sparkles } from 'lucide-react';

interface GFKOutput {
  observation: string;
  feeling: string;
  need: string;
  request: string;
  reformulated_text: string;
}

interface InteractiveGFKOutputProps {
  output: GFKOutput | null;
  isTyping: boolean;
  onUpdate: (updatedOutput: GFKOutput) => void;
  user: any;
}

const InteractiveGFKOutput: React.FC<InteractiveGFKOutputProps> = ({
  output,
  isTyping,
  onUpdate,
  user
}) => {
  const [editingFeeling, setEditingFeeling] = useState(false);
  const [editingNeed, setEditingNeed] = useState(false);
  const [feelingInput, setFeelingInput] = useState('');
  const [needInput, setNeedInput] = useState('');
  const [updatedOutput, setUpdatedOutput] = useState<GFKOutput | null>(null);

  // Common feelings for suggestions
  const feelingSuggestions = [
    'frustriert', 'enttäuscht', 'verärgert', 'traurig', 'besorgt', 
    'verwirrt', 'verletzt', 'einsam', 'ängstlich', 'hoffnungsvoll',
    'erleichtert', 'zufrieden', 'dankbar', 'freudig', 'inspiriert'
  ];

  // Common needs for suggestions
  const needSuggestions = [
    'Verständnis', 'Respekt', 'Anerkennung', 'Zugehörigkeit', 'Autonomie',
    'Sicherheit', 'Ordnung', 'Harmonie', 'Wachstum', 'Spaß',
    'Ruhe', 'Unterstützung', 'Gerechtigkeit', 'Freiheit', 'Liebe'
  ];

  useEffect(() => {
    if (output) {
      setUpdatedOutput(output);
      setFeelingInput(output.feeling);
      setNeedInput(output.need);
    }
  }, [output]);

  const handleFeelingSave = () => {
    if (updatedOutput && feelingInput.trim()) {
      const newOutput = {
        ...updatedOutput,
        feeling: feelingInput.trim()
      };
      setUpdatedOutput(newOutput);
      onUpdate(newOutput);
      setEditingFeeling(false);
    }
  };

  const handleNeedSave = () => {
    if (updatedOutput && needInput.trim()) {
      const newOutput = {
        ...updatedOutput,
        need: needInput.trim()
      };
      setUpdatedOutput(newOutput);
      onUpdate(newOutput);
      setEditingNeed(false);
    }
  };

  const regenerateText = () => {
    if (updatedOutput) {
      const newText = `Wenn ich sehe, dass ${updatedOutput.observation.toLowerCase()}, dann fühle ich mich ${updatedOutput.feeling}, weil mir ${updatedOutput.need} wichtig ist. ${updatedOutput.request}`;
      const newOutput = {
        ...updatedOutput,
        reformulated_text: newText
      };
      setUpdatedOutput(newOutput);
      onUpdate(newOutput);
    }
  };

  if (!output || isTyping) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ihre GFK-Formulierung
        </h3>
        <p className="text-sm text-gray-600">
          Bearbeiten Sie Ihre Gefühle und Bedürfnisse für eine persönlichere Formulierung
        </p>
      </div>

      <div className="space-y-6">
        {/* Beobachtung - Read Only */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">1. Beobachtung</h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Nur lesen</span>
          </div>
          <p className="text-blue-700">{output.observation}</p>
        </div>

        {/* Gefühl - Editable */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-800">2. Gefühl</h4>
              {user && (
                <button
                  onClick={() => setEditingFeeling(!editingFeeling)}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200 transition-colors flex items-center space-x-1"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Bearbeiten</span>
                </button>
              )}
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {editingFeeling ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <textarea
                  value={feelingInput}
                  onChange={(e) => setFeelingInput(e.target.value)}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Wie fühlen Sie sich wirklich?"
                />
                
                <div>
                  <p className="text-xs text-green-600 mb-2">Gefühlsvorschläge:</p>
                  <div className="flex flex-wrap gap-2">
                    {feelingSuggestions.map((feeling) => (
                      <button
                        key={feeling}
                        onClick={() => setFeelingInput(feeling)}
                        className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded-full hover:bg-green-100 transition-colors"
                      >
                        {feeling}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleFeelingSave}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Speichern</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingFeeling(false);
                      setFeelingInput(output.feeling);
                    }}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Abbrechen</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-700"
              >
                {updatedOutput?.feeling || output.feeling}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bedürfnis - Editable */}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold text-orange-800">3. Bedürfnis</h4>
              {user && (
                <button
                  onClick={() => setEditingNeed(!editingNeed)}
                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors flex items-center space-x-1"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Bearbeiten</span>
                </button>
              )}
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {editingNeed ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <textarea
                  value={needInput}
                  onChange={(e) => setNeedInput(e.target.value)}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Was ist Ihnen wirklich wichtig?"
                />
                
                <div>
                  <p className="text-xs text-orange-600 mb-2">Bedürfnisvorschläge:</p>
                  <div className="flex flex-wrap gap-2">
                    {needSuggestions.map((need) => (
                      <button
                        key={need}
                        onClick={() => setNeedInput(need)}
                        className="text-xs bg-white border border-orange-200 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-100 transition-colors"
                      >
                        {need}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleNeedSave}
                    className="flex items-center space-x-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Speichern</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingNeed(false);
                      setNeedInput(output.need);
                    }}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Abbrechen</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-orange-700"
              >
                {updatedOutput?.need || output.need}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Bitte - Read Only */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-3">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-purple-800">4. Bitte</h4>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Nur lesen</span>
          </div>
          <p className="text-purple-700">{output.request}</p>
        </div>

        {/* Finale Formulierung */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Ihre finale GFK-Formulierung</span>
          </h4>
          <div className="bg-white rounded-lg p-4 mb-3">
            <p className="text-gray-800 leading-relaxed">
              {updatedOutput?.reformulated_text || output.reformulated_text}
            </p>
          </div>
          
          {user && (editingFeeling || editingNeed || 
            (updatedOutput && (updatedOutput.feeling !== output.feeling || updatedOutput.need !== output.need))) && (
            <button
              onClick={regenerateText}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Formulierung aktualisieren
            </button>
          )}
        </div>

        {/* Info für nicht-registrierte User */}
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 text-center">
              💡 <strong>Registrieren Sie sich</strong>, um Ihre Gefühle und Bedürfnisse zu bearbeiten und personalisierte GFK-Formulierungen zu erstellen!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InteractiveGFKOutput; 