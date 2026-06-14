/**
 * Locale-aware route mapping for the main marketing site.
 *
 * Heavy, long-form SEO content (glossary, guides, funding-guide, medtech-guide)
 * is NOT runtime-translated via the t() dictionary — it ships as separately
 * indexable English pages under /en/* (see app/sites/main/en/*). These helpers
 * let the language switcher and navbar route a visitor to the correct language
 * version instead of leaving them on a Hebrew page with the toggle flipped to
 * English (the "half-translated page" bug).
 *
 * Everything else on the main site is translated in-place through useLanguage().t(),
 * so for those paths these helpers are no-ops.
 */

import type { Lang } from './LanguageContext';

/**
 * Public Hebrew base paths that have a dedicated English mirror under /en.
 * `/guides/[slug]` is covered by the prefix rule below, not listed explicitly.
 */
const EN_MIRRORED_PREFIXES = [
  '/glossary',
  '/guides',
  '/funding-guide',
  '/medtech-guide',
] as const;

/** Does this Hebrew path have an English mirror under /en? */
export function hasEnMirror(path: string): boolean {
  const clean = stripQueryAndHash(path);
  return EN_MIRRORED_PREFIXES.some(
    (p) => clean === p || clean.startsWith(p + '/'),
  );
}

/** Is this path already an English (/en/...) route? */
export function isEnPath(path: string): boolean {
  const clean = stripQueryAndHash(path);
  return clean === '/en' || clean.startsWith('/en/');
}

/** Map a Hebrew path to its English mirror (no-op if it has none). */
export function toEnPath(path: string): string {
  if (isEnPath(path)) return path;
  if (!hasEnMirror(path)) return path;
  return '/en' + path;
}

/** Map an English (/en/...) path back to its Hebrew counterpart. */
export function toHePath(path: string): string {
  if (!isEnPath(path)) return path;
  const stripped = path.replace(/^\/en/, '');
  return stripped === '' ? '/' : stripped;
}

/**
 * Given a navbar/link href and the active language, return the href that keeps
 * the visitor in that language. Only affects the EN-mirrored content paths;
 * all other hrefs pass through unchanged (they translate in place via t()).
 */
export function localizeHref(href: string, lang: Lang): string {
  if (!href.startsWith('/')) return href; // external / anchor
  if (lang === 'en') {
    return hasEnMirror(href) ? toEnPath(href) : href;
  }
  // lang === 'he'
  return isEnPath(href) ? toHePath(href) : href;
}

function stripQueryAndHash(path: string): string {
  const q = path.indexOf('?');
  const h = path.indexOf('#');
  let end = path.length;
  if (q !== -1) end = Math.min(end, q);
  if (h !== -1) end = Math.min(end, h);
  return path.slice(0, end);
}
