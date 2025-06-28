import { contextExamples } from '../data/contextExamples';

export const getContextExamples = (context: string) => {
  return contextExamples[context as keyof typeof contextExamples] || [];
};

export const getContextPrompt = (context: string) => {
  const examples = getContextExamples(context);
  
  if (examples.length === 0) {
    return '';
  }

  const exampleTexts = examples.map((example, index) => {
    return `Beispiel ${index + 1}:
Input: "${example.input}"
GFK-Formulierung:
- Beobachtung: ${example.output.observation}
- Gefühl: ${example.output.feeling}
- Bedürfnis: ${example.output.need}
- Bitte: ${example.output.request}`;
  }).join('\n\n');

  return `\n\nKontext-spezifische Beispiele für ${getContextLabel(context)}:\n${exampleTexts}\n\nBitte verwende einen ähnlichen Stil und Ton für die Transformation.`;
};

export const getContextLabel = (context: string) => {
  const labels = {
    general: 'Allgemein',
    child: 'Kind/Jugendliche',
    business: 'Geschäftsgespräch',
    partner: 'Partner/In',
    colleague: 'Kollegen'
  };
  
  return labels[context as keyof typeof labels] || 'Allgemein';
};

export const getContextStyle = (context: string) => {
  const styles = {
    general: 'empathetic',
    child: 'gentle',
    business: 'professional',
    partner: 'intimate',
    colleague: 'collaborative'
  };
  
  return styles[context as keyof typeof styles] || 'empathetic';
};