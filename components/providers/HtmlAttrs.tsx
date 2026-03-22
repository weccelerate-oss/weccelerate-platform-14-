'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

/**
 * Dynamically updates <html lang="..." dir="..."> based on current language.
 * Keeps root layout as a server component while supporting client-side language switching.
 */
export function HtmlAttrs() {
  const { lang, dir } = useLanguage();

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
  }, [lang, dir]);

  return null;
}
