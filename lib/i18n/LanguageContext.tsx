'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { he } from './he';
import { en } from './en';

// =============================================================================
// TYPES
// =============================================================================

export type Lang = 'he' | 'en';
export type Dir = 'rtl' | 'ltr';

interface LanguageContextValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

// =============================================================================
// DICTIONARIES
// =============================================================================

const dictionaries: Record<Lang, Record<string, string>> = { he, en };

// =============================================================================
// CONTEXT
// =============================================================================

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'weccelerate-lang';

// =============================================================================
// PROVIDER
// =============================================================================

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('he');

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === 'en' || stored === 'he') {
        setLangState(stored);
      }
    } catch {
      // localStorage unavailable — keep default
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // ignore
    }
  }, []);

  const dir: Dir = lang === 'he' ? 'rtl' : 'ltr';

  const t = useCallback(
    (key: string): string => {
      return dictionaries[lang][key] ?? dictionaries.he[key] ?? key;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
