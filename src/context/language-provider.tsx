'use client';

import { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'en' | 'es';

const translations: Record<Locale, any> = { en, es };

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const t = useMemo(
    () => (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result = translations[locale];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) {
              console.warn(`Translation key not found: ${key}`);
              return key;
            }
        }
        result = fallbackResult;
        break;
      }
    }
    if (typeof result !== 'string') {
      return key;
    }

    if (!variables) {
      return result;
    }

    return result.replace(/\{(\w+)\}/g, (_, variableName: string) => {
      const value = variables[variableName];
      return value === undefined ? `{${variableName}}` : String(value);
    });
  }, [locale]);

  const value = {
    locale,
    setLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
