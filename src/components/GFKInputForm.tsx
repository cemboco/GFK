import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GFKInputFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  canUseService: () => boolean;
  handleSubmit: (e: React.FormEvent) => void;
  error: string | null;
}

const GFKInputForm: React.FC<GFKInputFormProps> = ({
  input,
  setInput,
  isLoading,
  canUseService,
  handleSubmit,
  error
}) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-xl p-8 lg:p-12"
  >
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Probiere es selbst aus
      </h2>
      <p className="text-lg text-gray-600">
        Gib deinen Text ein und erlebe die Transformation in Echtzeit
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Je genauer der Text, desto besser.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="input" className="block text-lg font-semibold text-gray-800 mb-3">
          Was möchtest du sagen?
        </label>
        <textarea
          id="input"
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-2xl p-6 text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm resize-none"
          placeholder="Schreibe hier deine Nachricht..."
        />
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || !input.trim() || !canUseService()}
          className={`px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 ${
            (isLoading || !input.trim() || !canUseService()) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Sparkles className="h-6 w-6" />
          <span>{isLoading ? 'Transformiere...' : 'In GFK umwandeln'}</span>
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-center"
        >
          {error}
        </motion.div>
      )}
    </form>
  </motion.section>
);

export default GFKInputForm; 