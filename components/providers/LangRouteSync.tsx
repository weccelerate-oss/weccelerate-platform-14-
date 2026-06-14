'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { isEnPath } from '@/lib/i18n/routes';

/**
 * Keeps the active dictionary language in sync with the URL for the dedicated
 * English routes (/en/*). Without this, landing directly on an /en page (e.g.
 * from Google or an hreflang link) would render English content wrapped in a
 * Hebrew navbar/footer, because the language defaults to 'he'.
 *
 * Only forces English ON /en routes; everywhere else the language follows the
 * user's toggle choice, so in-place translated pages keep working normally.
 */
export function LangRouteSync() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (isEnPath(pathname) && lang !== 'en') {
      setLang('en');
    }
  }, [pathname, lang, setLang]);

  return null;
}
