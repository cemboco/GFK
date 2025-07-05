# 🌍 Internationalisierung (i18n) - GFKCoach

## Übersicht

GFKCoach unterstützt jetzt mehrsprachige Funktionalität mit Deutsch (Standard) und Englisch. Die Internationalisierung wurde mit einer einfachen, aber effektiven Lösung implementiert.

## 🏗️ Architektur

### Dateien
- `src/i18n/translations.ts` - Zentrale Übersetzungsdatei
- `src/contexts/LanguageContext.tsx` - React Context für Sprachverwaltung
- `src/components/LanguageSelector.tsx` - Sprachauswahl-Komponente
- `src/components/InternationalizationDemo.tsx` - Demo-Komponente

### Funktionsweise
1. **LanguageProvider** umschließt die gesamte App
2. **useLanguage Hook** bietet Zugriff auf aktuelle Sprache und Übersetzungen
3. **Automatische Spracherkennung** basierend auf Browser-Einstellungen
4. **Persistierung** der Sprachauswahl in localStorage

## 🚀 Verwendung

### In Komponenten
```tsx
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t.nav.home}</h1>
      <button onClick={() => setLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### Übersetzungen hinzufügen
1. Neue Schlüssel in `src/i18n/translations.ts` hinzufügen
2. Deutsche und englische Übersetzungen definieren
3. In Komponenten mit `t.section.key` verwenden

## 📝 Übersetzungsstruktur

```typescript
interface Translations {
  nav: {
    home: string;
    about: string;
    // ...
  };
  auth: {
    signIn: string;
    signUp: string;
    // ...
  };
  // Weitere Sektionen...
}
```

## 🎯 Unterstützte Sprachen

### Deutsch (de) - Standard
- Vollständige Übersetzung aller UI-Elemente
- Deutsche Terminologie für GFK/NVC
- Lokalisierte Fehlermeldungen

### Englisch (en)
- Komplette englische Übersetzung
- NVC (Nonviolent Communication) Terminologie
- Internationale Standards

## 🔧 Technische Details

### Spracherkennung
- **Priorität 1**: Gespeicherte Sprache in localStorage
- **Priorität 2**: Browser-Sprache (navigator.language)
- **Fallback**: Deutsch

### Performance
- Übersetzungen werden zur Build-Zeit eingebunden
- Keine Runtime-Ladezeiten
- Effiziente React Context-Nutzung

### SEO
- Dynamische Meta-Tags basierend auf Sprache
- Hreflang-Tags für Suchmaschinen
- Sprachspezifische URLs (optional)

## 🧪 Testing

### Demo-Seite
Besuche `/i18n-demo` um die Internationalisierung zu testen:
- Sprachauswahl testen
- Übersetzungen überprüfen
- Persistierung testen

### Browser-Test
1. Browser-Sprache auf Englisch ändern
2. App neu laden
3. Automatische Spracherkennung überprüfen

## 📈 Erweiterung

### Neue Sprache hinzufügen
1. Sprache in `Language` Type hinzufügen
2. Übersetzungen in `translations` Objekt ergänzen
3. LanguageSelector erweitern
4. Tests durchführen

### Beispiel für Französisch:
```typescript
export type Language = 'de' | 'en' | 'fr';

export const translations: Record<Language, Translations> = {
  de: { /* ... */ },
  en: { /* ... */ },
  fr: { /* ... */ },
};
```

## 🎨 UI/UX

### Sprachauswahl
- **Desktop**: Dropdown im Header
- **Mobile**: In Mobile-Menü integriert
- **Icons**: Flaggen-Emojis für visuelle Erkennung
- **Hover-Effekte**: Smooth Transitions

### Accessibility
- ARIA-Labels für Sprachauswahl
- Keyboard-Navigation
- Screen Reader Support

## 🔄 Migration

### Bestehende Komponenten
Bestehende Komponenten können schrittweise migriert werden:

1. `useLanguage` Hook importieren
2. Hardcodierte Texte durch `t.section.key` ersetzen
3. Übersetzungen in `translations.ts` hinzufügen
4. Testen

### Beispiel Migration:
```tsx
// Vorher
<h1>GFK-Transformation</h1>

// Nachher
const { t } = useLanguage();
<h1>{t.gfkForm.title}</h1>
```

## 📊 Status

### ✅ Implementiert
- [x] Grundlegende i18n-Infrastruktur
- [x] Deutsch und Englisch
- [x] Sprachauswahl-Komponente
- [x] Header-Integration
- [x] Demo-Seite
- [x] Persistierung

### 🔄 In Arbeit
- [ ] Vollständige Komponenten-Migration
- [ ] Erweiterte Übersetzungen
- [ ] SEO-Optimierung

### 📋 Geplant
- [ ] Weitere Sprachen (Französisch, Spanisch)
- [ ] Sprachspezifische URLs
- [ ] Automatische Übersetzung für neue Inhalte

## 🤝 Beitragen

### Übersetzungen verbessern
1. Fork des Repositories
2. Übersetzungen in `src/i18n/translations.ts` verbessern
3. Pull Request erstellen

### Neue Sprachen
1. Issue für neue Sprache erstellen
2. Übersetzungen implementieren
3. Tests hinzufügen
4. Dokumentation aktualisieren

## 📞 Support

Bei Fragen zur Internationalisierung:
- Issue im GitHub Repository erstellen
- Demo-Seite `/i18n-demo` besuchen
- Dokumentation in diesem File lesen

---

**Letzte Aktualisierung**: Januar 2024  
**Version**: 1.0.0  
**Autor**: GFKCoach Team 