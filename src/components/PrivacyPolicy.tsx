import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Datenschutzerklärung</h2>

              <h3>1. Datenschutz auf einen Blick</h3>
              <h4>Allgemeine Hinweise</h4>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, 
                wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert 
                werden können.
              </p>

              <h4>Datenerfassung auf dieser Website</h4>
              <p>
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber.
              </p>

              <h4>Wie erfassen wir Ihre Daten?</h4>
              <p>
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, 
                die Sie in ein Kontaktformular eingeben.
              </p>
              <p>
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. 
                Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
              </p>

              <h3>2. Allgemeine Hinweise und Pflichtinformationen</h3>
              <h4>Datenschutz</h4>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen 
                Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h4>Hinweis zur verantwortlichen Stelle</h4>
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br />
                GFKCoach<br />
                [Adresse]<br />
                [Kontaktdaten]
              </p>

              <h3>3. Datenerfassung auf dieser Website</h3>
              <h4>Kontaktformular</h4>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der 
                von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns 
                gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>

              <h4>Speicherdauer</h4>
              <p>
                Ihre Daten werden nur so lange gespeichert, wie es für die jeweiligen Zwecke erforderlich ist. Wenn Sie sich für 
                unseren Newsletter anmelden, speichern wir Ihre E-Mail-Adresse, bis Sie sich vom Newsletter abmelden.
              </p>

              <h3>4. Newsletter</h3>
              <p>
                Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse 
                sowie Informationen, welche uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind 
                und mit dem Empfang des Newsletters einverstanden sind.
              </p>

              <h3>5. Ihre Rechte</h3>
              <p>
                Sie haben jederzeit das Recht:
              </p>
              <ul>
                <li>Auskunft über Ihre bei uns gespeicherten Daten zu erhalten</li>
                <li>Diese Daten berichtigen zu lassen</li>
                <li>Die Löschung dieser Daten zu verlangen</li>
                <li>Die Verarbeitung dieser Daten einschränken zu lassen</li>
                <li>Der Verarbeitung zu widersprechen</li>
                <li>Diese Daten übertragen zu lassen</li>
              </ul>

              <h3>6. Änderungen</h3>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen 
                entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung 
                neuer Services.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}