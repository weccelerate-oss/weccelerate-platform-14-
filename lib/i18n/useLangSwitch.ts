'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { hasEnMirror, isEnPath, toEnPath, toHePath } from './routes';
import type { Lang } from './LanguageContext';

/**
 * Language switch that is route-aware.
 *
 * For pages translated in-place via t() it just flips the dictionary language.
 * For the heavy SEO pages that ship a dedicated English mirror under /en/*
 * (see lib/i18n/routes.ts) it also navigates to the matching language route,
 * so the visitor never ends up on a Hebrew page with the toggle set to English.
 */
export function useLangSwitch() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() || '/';

  const switchLang = useCallback(
    (next: Lang) => {
      setLang(next);
      if (next === 'en' && hasEnMirror(pathname) && !isEnPath(pathname)) {
        router.push(toEnPath(pathname));
      } else if (next === 'he' && isEnPath(pathname)) {
        router.push(toHePath(pathname));
      }
    },
    [setLang, router, pathname],
  );

  return { lang, switchLang };
}
