/**
 * Press Mentions Catalog — External media coverage of WeCcelerate.
 *
 * Each entry feeds:
 * 1. The /press page (E-E-A-T signals for Google + AI engines)
 * 2. Organization schema (memberOf, awards, subjectOf)
 * 3. llms-full.txt citation anchors
 *
 * To add a new press mention: append an entry. Sort by date descending.
 * If the outlet is not yet in `OUTLET_METADATA`, add it there.
 *
 * IMPORTANT: only include links that are still live. Dead links hurt SEO.
 * For Hebrew outlets keep titles in Hebrew; for English outlets in English.
 */

export type PressCategory =
  | 'profile' // Feature article about WeCcelerate
  | 'interview' // Interview with founders/team
  | 'opinion' // Bylined opinion article by WeCcelerate
  | 'announcement' // News announcement (funding, partnership, launch)
  | 'mention' // Brief mention in a broader article
  | 'podcast' // Podcast appearance
  | 'video' // TV / YouTube appearance
  | 'award'; // Recognition or award

export interface PressMention {
  id: string;
  date: string; // ISO: YYYY-MM-DD
  title: string;
  outlet: string; // Must match a key in OUTLET_METADATA
  category: PressCategory;
  url?: string; // Public URL if available
  excerpt?: string; // 1-2 sentence quote or summary
  language: 'he' | 'en';
  /** If true, the mention is a strong authority signal (major outlet / long feature). */
  featured?: boolean;
}

/**
 * Metadata per outlet — logos, authority scores, links.
 * `authority` is 1-10 scale, helps prioritize display and Organization schema.
 */
export interface OutletMeta {
  name: string;
  nameHe?: string;
  url: string;
  logo?: string; // Path under /images/press/ if we have a local copy
  authority: number; // 1-10
  sameAs?: string; // Wikidata / Wikipedia URL for schema.org linking
}

export const OUTLET_METADATA: Record<string, OutletMeta> = {
  calcalist: {
    name: 'Calcalist',
    nameHe: 'כלכליסט',
    url: 'https://www.calcalist.co.il',
    authority: 9,
    sameAs: 'https://en.wikipedia.org/wiki/Calcalist',
  },
  ctech: {
    name: 'CTech (Calcalist English)',
    url: 'https://www.calcalistech.com',
    authority: 8,
  },
  globes: {
    name: 'Globes',
    nameHe: 'גלובס',
    url: 'https://www.globes.co.il',
    authority: 9,
    sameAs: 'https://en.wikipedia.org/wiki/Globes_(newspaper)',
  },
  themarker: {
    name: 'TheMarker',
    nameHe: 'דה-מרקר',
    url: 'https://www.themarker.com',
    authority: 9,
    sameAs: 'https://en.wikipedia.org/wiki/TheMarker',
  },
  geektime: {
    name: 'Geektime',
    url: 'https://www.geektime.co.il',
    authority: 8,
  },
  ynet: {
    name: 'Ynet',
    nameHe: 'Ynet',
    url: 'https://www.ynet.co.il',
    authority: 9,
    sameAs: 'https://en.wikipedia.org/wiki/Ynet',
  },
  startupnation: {
    name: 'Start-Up Nation Central',
    url: 'https://www.startupnationcentral.org',
    authority: 8,
  },
  iia: {
    name: 'Israel Innovation Authority',
    nameHe: 'רשות החדשנות',
    url: 'https://innovationisrael.org.il',
    authority: 9,
    sameAs: 'https://en.wikipedia.org/wiki/Israel_Innovation_Authority',
  },
  techcrunch: {
    name: 'TechCrunch',
    url: 'https://techcrunch.com',
    authority: 10,
    sameAs: 'https://en.wikipedia.org/wiki/TechCrunch',
  },
  forbes: {
    name: 'Forbes',
    url: 'https://www.forbes.com',
    authority: 10,
    sameAs: 'https://en.wikipedia.org/wiki/Forbes',
  },
  leumit: {
    name: 'Leumit Health Services',
    nameHe: 'לאומית שירותי בריאות',
    url: 'https://www.leumit.co.il',
    authority: 9,
    sameAs: 'https://en.wikipedia.org/wiki/Leumit_Health_Care_Services',
  },
  iati: {
    name: 'IATI — Israel Advanced Technology Industries',
    url: 'https://www.iati.co.il',
    authority: 7,
  },
};

/**
 * Press mentions catalog.
 *
 * ⚠ TO THE OWNER: This catalog starts with the partnerships and memberships
 * that are already public knowledge. Add each confirmed press mention as you
 * secure it — DO NOT fabricate entries. False press mentions are a reputation
 * and legal risk, and LLMs cross-check against source URLs.
 */
export const PRESS_MENTIONS: readonly PressMention[] = [
  // Partnerships & memberships (not "press" strictly, but foundational authority signals)
  {
    id: 'leumit-partnership',
    date: '2020-01-01',
    title: 'שותפות אסטרטגית בלעדית עם לאומית שירותי בריאות למסלול MedTech',
    outlet: 'leumit',
    category: 'announcement',
    language: 'he',
    featured: true,
    excerpt:
      'שותפות בלעדית עם לאומית שירותי בריאות למסלול MedTech: גישה לדאטה רפואי אנונימי של 720,000 מבוטחים, פיילוטים קליניים במרפאות, ותמיכה רגולטורית.',
  },
  {
    id: 'iia-recognition',
    date: '2020-06-01',
    title: 'הכרה של רשות החדשנות הישראלית כחברת מו"פ',
    outlet: 'iia',
    category: 'award',
    language: 'he',
    featured: true,
    excerpt: 'WeCcelerate מוכרת על ידי רשות החדשנות הישראלית כחברת מחקר ופיתוח.',
  },
  {
    id: 'snc-member',
    date: '2021-01-01',
    title: 'חברות ב-Start-Up Nation Central',
    outlet: 'startupnation',
    category: 'announcement',
    language: 'en',
    excerpt: 'WeCcelerate is a member of the Start-Up Nation Central ecosystem platform.',
  },
  {
    id: 'iati-member',
    date: '2021-01-01',
    title: 'חברות ב-IATI — Israel Advanced Technology Industries',
    outlet: 'iati',
    category: 'announcement',
    language: 'he',
  },

  // ============================================================
  // Israeli press mentions — verified live URLs discovered via Google
  // SERP audit (2026-04-23). Each entry is a public citation source
  // that strengthens Organization E-E-A-T and gives AI engines a
  // corroborating link when they cite WeCcelerate.
  //
  // Replace/extend this list as new press coverage is confirmed.
  // Do NOT add unverified or paraphrased entries.
  // ============================================================

  {
    id: 'globes-2022-leumit-partnership',
    date: '2022-10-03',
    title: '"העלאת הריבית האגרסיבית גורמת ליזמים רבים לוותר על החלום"',
    outlet: 'globes',
    category: 'interview',
    url: 'https://www.globes.co.il/news/article.aspx?did=1001426009',
    excerpt:
      'ראיון המציין את שותפות Leumit-WeCcelerate כחברה משותפת עם לאומית שירותי בריאות למסלול יוזמות בריאות דיגיטלית.',
    language: 'he',
    featured: true,
  },
  {
    id: 'calcalist-tag-page',
    date: '2025-07-15',
    title: 'WeCcelerate — דף תגית כלכליסט',
    outlet: 'calcalist',
    category: 'profile',
    url: 'https://www.calcalist.co.il/tags/WeCcelerate',
    excerpt:
      'דף תגית ייעודי ב-Calcalist המאגד כתבות, מאמרים, חדשות ועדכונים על WeCcelerate.',
    language: 'he',
    featured: true,
  },
  {
    id: 'calcalist-2025-hinoch-data-budget',
    date: '2025-07-15',
    title: 'תקציב הדאטה הלאומי: התחלה מבורכת אך האתגרים עוד לפנינו',
    outlet: 'calcalist',
    category: 'opinion',
    url: 'https://www.calcalist.co.il/calcalistech/article/r1f769xuel',
    excerpt:
      'טור דעה מאת אברהם הינוך, סמנכ"ל השיווק בחברת WeCcelerate, על תקציב הדאטה הלאומי ואתגרי תשתיות המידע.',
    language: 'he',
  },
  {
    id: 'geektime-2025-cto-innovation-authority',
    date: '2025-07-27',
    title: 'רשות החדשנות תשקיע מיליונים בתוכנית חממות חדשה. אז מה רע?',
    outlet: 'geektime',
    category: 'opinion',
    url: 'https://www.geektime.co.il/new-innovation-authority-program/',
    excerpt:
      'טור דעה מאת מנהל הטכנולוגיות (CTO) בחברת WeCcelerate על תוכנית החממות החדשה של רשות החדשנות.',
    language: 'he',
  },
  {
    id: 'geektime-2024-reservist-calculator',
    date: '2024-02-18',
    title: '3 הייטקיסטים השיקו מחשבון מענקים לאנשי מילואים',
    outlet: 'geektime',
    category: 'profile',
    url: 'https://www.geektime.co.il/flash/financial-benefits-for-reserves/',
    excerpt:
      'כתבה על השקת מחשבון המענקים לאנשי מילואים על ידי שלושה הייטקיסטים, תוך אזכור של WeCcelerate כאחת החברות המעורבות.',
    language: 'he',
    featured: true,
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getFeaturedPress(): readonly PressMention[] {
  return PRESS_MENTIONS.filter((m) => m.featured);
}

export function getPressByCategory(category: PressCategory): readonly PressMention[] {
  return PRESS_MENTIONS.filter((m) => m.category === category);
}

export function getPressByYear(year: number): readonly PressMention[] {
  return PRESS_MENTIONS.filter((m) => m.date.startsWith(`${year}-`));
}

export function sortPressDescending(mentions: readonly PressMention[]): PressMention[] {
  return [...mentions].sort((a, b) => b.date.localeCompare(a.date));
}

export const PRESS_CATEGORIES: Record<PressCategory, { he: string; en: string }> = {
  profile: { he: 'כתבות עומק', en: 'Feature Articles' },
  interview: { he: 'ראיונות', en: 'Interviews' },
  opinion: { he: 'דעה ומאמרים', en: 'Opinion & Bylines' },
  announcement: { he: 'הודעות ושותפויות', en: 'Announcements & Partnerships' },
  mention: { he: 'אזכורים', en: 'Mentions' },
  podcast: { he: 'פודקאסטים', en: 'Podcasts' },
  video: { he: 'וידאו וטלוויזיה', en: 'Video & TV' },
  award: { he: 'הכרה ופרסים', en: 'Recognition & Awards' },
};
