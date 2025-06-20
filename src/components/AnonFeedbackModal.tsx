import React, { useState } from 'react';

interface AnonFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export default function AnonFeedbackModal({ isOpen, onClose, onSubmit }: AnonFeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Bitte gib ein kurzes Feedback ein.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    await onSubmit(feedback.trim());
    setIsSubmitting(false);
    setFeedback('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 text-2xl font-bold"
          aria-label="Schließen"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ihr Feedback ist wertvoll</h2>
        <p className="mb-4 text-gray-700">Helfen Sie uns, unseren Service zu verbessern und erhalten Sie 5 zusätzliche kostenlose Umformulierungen.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-800 font-medium mb-1">Was können wir verbessern?</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition"
              placeholder="Teilen Sie uns Ihre Gedanken mit..."
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition"
            >
              Später
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl text-white bg-green-200 hover:bg-green-300 font-medium transition disabled:opacity-60"
            >
              {isSubmitting ? 'Wird gesendet...' : 'Feedback senden'}
            </button>
          </div>
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800 flex items-center gap-2">
            <span role="img" aria-label="Belohnung">🎁</span>
            <span><b>Belohnung für Ihr Feedback</b>: Nach dem Absenden erhalten Sie 5 zusätzliche kostenlose Umformulierungen als Dankeschön.</span>
          </div>
        </form>
      </div>
    </div>
  );
} 