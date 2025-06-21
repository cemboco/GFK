/**
 * Prüft, ob ein Text ausreichend Kontext hat
 * @param text Der zu prüfende Text
 * @returns true wenn Kontext ausreichend ist, false wenn Modal angezeigt werden sollte
 */
export function hasSufficientContext(text: string): boolean {
  const trimmedText = text.trim();
  
  // Zu kurze Texte (weniger als 10 Wörter) haben wahrscheinlich nicht genug Kontext
  const wordCount = trimmedText.split(/\s+/).length;
  if (wordCount < 10) {
    return false;
  }
  
  // Prüfe auf spezifische Zeitangaben oder Situationen
  const hasTimeContext = /\b(gestern|heute|morgen|letzte Woche|nächste Woche|vorhin|später|immer|nie|oft|selten)\b/i.test(trimmedText);
  const hasSpecificAction = /\b(gesagt|gemacht|getan|passiert|geschehen|erlebt|gefühlt)\b/i.test(trimmedText);
  const hasPersonContext = /\b(Partner|Freund|Kollege|Chef|Kind|Mutter|Vater|Familie)\b/i.test(trimmedText);
  
  // Wenn mindestens 2 von 3 Kontext-Indikatoren vorhanden sind, ist der Kontext ausreichend
  const contextIndicators = [hasTimeContext, hasSpecificAction, hasPersonContext].filter(Boolean).length;
  
  return contextIndicators >= 2;
}

/**
 * Erkennt vage oder emotionale Aussagen, die mehr Kontext brauchen
 * @param text Der zu prüfende Text
 * @returns true wenn die Aussage vage ist und mehr Kontext braucht
 */
export function needsMoreContext(text: string): boolean {
  const trimmedText = text.trim();
  
  // Liste von vagen Aussagen, die mehr Kontext brauchen
  const vaguePhrases = [
    'ich hasse dich',
    'du bist schuld',
    'du bist doof',
    'du bist blöd',
    'du bist dumm',
    'du bist faul',
    'du bist egoistisch',
    'du bist unzuverlässig',
    'du bist nie da',
    'du hörst nie zu',
    'du machst nie',
    'du bist so',
    'das ist nicht fair',
    'das ist doof',
    'das ist blöd',
    'das ist dumm',
    'das ist nicht mein problem',
    'das ist nicht mein job',
    'das ist nicht meine schuld'
  ];
  
  // Prüfe auf vage Phrasen
  const hasVaguePhrase = vaguePhrases.some(phrase => 
    trimmedText.toLowerCase().includes(phrase.toLowerCase())
  );
  
  // Wenn eine vage Phrase gefunden wird oder der Text zu kurz ist
  return hasVaguePhrase || !hasSufficientContext(trimmedText);
} 