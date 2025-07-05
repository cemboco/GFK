import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage: 'de' | 'en') => {
    setLanguage(newLanguage);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
        <div className="py-1">
          <button
            onClick={() => handleLanguageChange('de')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition-colors ${
              language === 'de' ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
            }`}
          >
            🇩🇪 Deutsch
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 transition-colors ${
              language === 'en' ? 'text-purple-600 bg-purple-50' : 'text-gray-700'
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>
    </div>
  );
} 