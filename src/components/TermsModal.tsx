import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-purple-600 text-2xl font-bold"
          aria-label="Schließen"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.modals.terms.title}</h2>
        <div className="prose max-w-none text-gray-700">
          {t.modals.terms.sections.map((section, idx) => (
            <div key={idx}>
              <h3>{section.heading}</h3>
              <p>
                {section.text.includes('Datenschutzerklärung') ? (
                  <>
                    {section.text.split('Datenschutzerklärung')[0]}
                    <button onClick={onClose} className="text-purple-600 underline font-medium" type="button">
                      {t.app.dataProtection}
                    </button>
                    {section.text.split('Datenschutzerklärung')[1]}
                  </>
                ) : section.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 