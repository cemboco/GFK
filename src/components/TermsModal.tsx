import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Allgemeine Geschäftsbedingungen (AGB)</h2>
        <div className="prose max-w-none text-gray-700">
          <h3>1. Geltungsbereich</h3>
          <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform GFKCoach. Mit der Registrierung und Nutzung der Plattform erkennen Sie diese Bedingungen an.</p>
          <h3>2. Leistungen</h3>
          <p>GFKCoach bietet digitale Unterstützung zur Gewaltfreien Kommunikation. Es besteht kein Anspruch auf Verfügbarkeit oder bestimmte Funktionalitäten.</p>
          <h3>3. Haftung</h3>
          <p>Die Nutzung erfolgt auf eigene Verantwortung. GFKCoach übernimmt keine Haftung für die Richtigkeit der bereitgestellten Inhalte oder für Handlungen, die auf Basis der Vorschläge erfolgen.</p>
          <h3>4. Datenschutz</h3>
          <p>Es gilt die <button onClick={onClose} className="text-purple-600 underline font-medium" type="button">Datenschutzerklärung</button>. Personenbezogene Daten werden gemäß den gesetzlichen Vorgaben behandelt.</p>
          <h3>5. Änderungen</h3>
          <p>GFKCoach behält sich vor, die AGB jederzeit zu ändern. Die jeweils aktuelle Version ist auf der Plattform einsehbar.</p>
          <h3>6. Schlussbestimmungen</h3>
          <p>Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.</p>
        </div>
      </div>
    </div>
  );
} 