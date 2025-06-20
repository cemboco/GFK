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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback geben</h2>
        <p className="mb-4 text-gray-700">Du hast dein kostenloses Kontingent genutzt. Bitte gib uns ein kurzes Feedback, um weitere 5 Nutzungen zu erhalten.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition"
            placeholder="Dein Feedback..."
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-white bg-purple-600 hover:bg-purple-700 font-medium transition"
          >
            {isSubmitting ? 'Wird gesendet...' : 'Feedback absenden'}
          </button>
        </form>
      </div>
    </div>
  );
} 