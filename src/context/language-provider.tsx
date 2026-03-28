'use client';

import { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

type Locale = 'en' | 'es';
type TranslationValue = string | number | boolean | null | TranslationTree | TranslationValue[];
type TranslationTree = { [key: string]: TranslationValue };

const translations: Record<Locale, TranslationTree> = { en, es };

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  tm: <T = TranslationValue>(key: string) => T;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function getNestedTranslation(source: TranslationTree, key: string): TranslationValue | undefined {
  return key.split('.').reduce<TranslationValue | undefined>((result, segment) => {
    if (Array.isArray(result)) {
      const index = Number(segment);
      return Number.isInteger(index) ? result[index] : undefined;
    }

    if (result && typeof result === 'object') {
      return (result as TranslationTree)[segment];
    }

    return undefined;
  }, source);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'es';

    const storedLocale = window.localStorage.getItem('neuroquest-locale');
    if (storedLocale === 'en' || storedLocale === 'es') return storedLocale;
    return 'es';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('neuroquest-locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useMemo(
    () => (key: string, variables?: Record<string, string | number>): string => {
      const result = getNestedTranslation(translations[locale], key) ?? getNestedTranslation(translations.en, key);

      if (typeof result !== 'string') {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }

      if (!variables) {
        return result;
      }

      return result.replace(/\{(\w+)\}/g, (_, variableName: string) => {
        const value = variables[variableName];
        return value === undefined ? `{${variableName}}` : String(value);
      });
    },
    [locale]
  );

  const tm = useMemo(
    () => <T = TranslationValue>(key: string): T => {
      const result = getNestedTranslation(translations[locale], key) ?? getNestedTranslation(translations.en, key);

      if (result === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key as T;
      }

      return result as T;
    },
    [locale]
  );

  const value = {
    locale,
    setLocale,
    t,
    tm,
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
