import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsOfUseProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfUse({ isOpen, onClose }: TermsOfUseProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl p-6 overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="prose prose-purple max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nutzungsbedingungen</h2>

              <p className="text-gray-700 mb-4">
                Mit der Nutzung dieser App erklären Sie sich damit einverstanden, dass die bereitgestellten Ratschläge 
                kein Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung sind. Die App ist als 
                Quelle für Ratschläge und Orientierung gedacht und nicht als Ersatz für professionelle medizinische 
                Beratung oder Dienstleistungen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie stimmen zu, die App auf eigenes Risiko zu nutzen und dass die Entwickler der App nicht für 
                Schäden oder Verluste haften, die aus der Nutzung der App entstehen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie verpflichten sich, die App verantwortungsvoll zu nutzen und nicht für illegale Aktivitäten 
                oder zur Schädigung von Personen oder Organisationen zu verwenden.
              </p>

              <p className="text-gray-700 mb-4">
                Sie stimmen zu, keine Inhalte der App ohne ausdrückliche schriftliche Genehmigung der Entwickler 
                zu teilen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie akzeptieren, dass die Entwickler der App das Recht haben, Funktionen der App jederzeit zu 
                ändern oder einzustellen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie verpflichten sich, alle geltenden Gesetze und Vorschriften bei der Nutzung der App einzuhalten.
              </p>

              <p className="text-gray-700 mb-4">
                Sie stimmen hiermit zu, keine Materialien hochzuladen, zu posten, per E-Mail zu versenden oder 
                anderweitig zur Verfügung zu stellen, die anstößig, missbräuchlich, obszön, unanständig oder 
                anderweitig unangemessen sind.
              </p>

              <p className="text-gray-700 mb-4">
                Sie akzeptieren, dass die Entwickler der App nicht für Inhalte oder Links von Drittanbietern 
                innerhalb der App verantwortlich sind und Sie alle Risiken im Zusammenhang mit der Nutzung 
                solcher Inhalte oder Links selbst tragen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie verpflichten sich, keinen Teil der App zu reproduzieren, zu duplizieren, zu kopieren, zu 
                verkaufen, weiterzuverkaufen oder für kommerzielle Zwecke zu nutzen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie stimmen zu, die App nicht in einer Weise zu nutzen, die die App beschädigen, deaktivieren, 
                überlasten oder beeinträchtigen könnte oder die Nutzung und den Genuss der App durch andere 
                Parteien stören könnte.
              </p>

              <p className="text-gray-700 mb-4">
                Sie verpflichten sich, nicht zu versuchen, unbefugten Zugriff auf Teile der App oder deren 
                zugehörige Systeme oder Netzwerke zu erlangen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie stimmen zu, keine automatisierten Mittel wie Skripte oder Webcrawler zu verwenden, um auf 
                die App oder deren zugehörige Systeme oder Netzwerke zuzugreifen.
              </p>

              <p className="text-gray-700 mb-4">
                Sie akzeptieren, dass die Entwickler der App Ihren Zugang zur App aus beliebigem Grund und 
                ohne vorherige Ankündigung beenden können.
              </p>

              <p className="text-gray-700">
                Sie verpflichten sich, die Entwickler der App von allen Ansprüchen, Verlusten, Aufwendungen, 
                Schäden und Kosten, einschließlich angemessener Anwaltsgebühren, freizustellen, zu verteidigen 
                und schadlos zu halten, die sich aus einer Verletzung dieser Nutzungsbedingungen ergeben.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}