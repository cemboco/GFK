import React, { useState } from 'react';
import { Wand2, Copy, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentGeneration } from '../hooks/useContentGeneration';

interface ContentGeneratorProps {
  type: 'hero' | 'about' | 'features' | 'testimonial' | 'cta' | 'example';
  currentContent?: string;
  onContentUpdate?: (content: string) => void;
  placeholder?: string;
}

export default function ContentGenerator({ 
  type, 
  currentContent, 
  onContentUpdate,
  placeholder = "Klicke auf 'Generieren' um KI-Content zu erstellen..."
}: ContentGeneratorProps) {
  const { generateContent, isLoading, error } = useContentGeneration();
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'empathetic' | 'inspiring'>('empathetic');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');

  const typeLabels = {
    hero: 'Hero-Text',
    about: 'Über GFK',
    features: 'Features',
    testimonial: 'Testimonial',
    cta: 'Call-to-Action',
    example: 'Beispiel'
  };

  const toneLabels = {
    professional: 'Professionell',
    friendly: 'Freundlich',
    empathetic: 'Einfühlsam',
    inspiring: 'Inspirierend'
  };

  const lengthLabels = {
    short: 'Kurz',
    medium: 'Mittel',
    long: 'Lang'
  };

  const handleGenerate = async () => {
    const result = await generateContent({ type, tone, length });
    if (result) {
      setGeneratedContent(result.content);
    }
  };

  const handleCopy = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUse = () => {
    if (generatedContent && onContentUpdate) {
      onContentUpdate(generatedContent);
      setShowGenerator(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowGenerator(!showGenerator)}
        className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
      >
        <Wand2 className="h-4 w-4 mr-2" />
        KI-Content
      </motion.button>

      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-0 z-50 w-96 bg-white rounded-xl shadow-xl border border-gray-200 p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {typeLabels[type]} generieren
                </h3>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ton
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {Object.entries(toneLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Länge
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {Object.entries(lengthLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${
                  isLoading && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generiert...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generieren
                  </>
                )}
              </motion.button>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Generated Content */}
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {generatedContent}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Kopiert!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Kopieren
                        </>
                      )}
                    </motion.button>

                    {onContentUpdate && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUse}
                        className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Verwenden
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Neu generieren
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {!generatedContent && !isLoading && (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                  {placeholder}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}