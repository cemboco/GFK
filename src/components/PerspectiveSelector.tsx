import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Users } from 'lucide-react';

interface PerspectiveSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (perspective: 'sender' | 'receiver') => void;
  originalText: string;
}

export default function PerspectiveSelector({ isOpen, onClose, onSelect, originalText }: PerspectiveSelectorProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Perspektive wählen</h2>
              <p className="text-sm text-gray-600">Deine Aussage: "{originalText}"</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Bist du der Sender oder der Empfänger dieser Aussage? Das hilft der KI, die richtige GFK-Formulierung zu erstellen.
          </p>

          <div className="space-y-4">
            {/* Sender Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('sender')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ich bin der Sender</h3>
                  <p className="text-sm text-gray-600">
                    Ich habe diese Aussage gesagt und möchte sie in GFK umformulieren.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Beispiel: "Als ich das gesagt habe, habe ich mich frustriert gefühlt..."
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Receiver Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect('receiver')}
              className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ich bin der Empfänger</h3>
                  <p className="text-sm text-gray-600">
                    Jemand hat das zu mir gesagt und ich möchte eine GFK-Antwort formulieren.
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Beispiel: "Als ich deine Aussage gehört habe, habe ich mich verletzt gefühlt..."
                  </div>
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 