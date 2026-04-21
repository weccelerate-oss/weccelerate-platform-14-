/**
 * SEO Configuration
 * Brand keywords, company data, and SEO settings for WeCcelerate
 */

import { SiteKey } from './sites';

// =============================================================================
// BRAND KEYWORDS
// =============================================================================

export const BRAND_KEYWORDS = {
  english: [
    'WeCcelerate',
    'We accelerate',
    'Weccelerate',
    'business acceleration',
    'entrepreneurial services',
    'factory sourcing',
    'business consulting Israel',
  ],
  hebrew: [
    'וויסלרייט',
    'ויקלרייט',
    'ווי אקסלרייט',
    'WeCcelerate קידום עסקים',
    'האצת עסקים',
    'ייעוץ עסקי',
    'שירותי יזמות',
  ],
} as const;

// Site-specific keywords
export const SITE_KEYWORDS: Record<SiteKey, { en: string[]; he: string[] }> = {
  main: {
    en: [
      ...BRAND_KEYWORDS.english,
      'Venture Builder Israel',
      'Startup Accelerator',
      'Medical Accelerator',
      'Innovation Hub Tel Aviv',
      'startup acceleration',
      'business growth Israel',
    ],
    he: [
      ...BRAND_KEYWORDS.hebrew,
      'Venture Builder ישראל',
      'מאיץ סטארטאפים',
      'מאיץ רפואי',
      'מרכז חדשנות תל אביב',
      'סטארטאפ',
      'צמיחה עסקית',
    ],
  },
  leumit: {
    en: [
      'WeCcelerate',
      'Leumit partnership',
      'healthcare business services',
      'partner portal',
    ],
    he: [
      'וויסלרייט',
      'לאומית שותפות',
      'שירותי בריאות עסקיים',
      'פורטל שותפים',
    ],
  },
  biz: {
    en: [
      'WeCcelerate',
      'business dashboard',
      'operations management',
      'business portal',
    ],
    he: [
      'וויסלרייט',
      'לוח בקרה עסקי',
      'ניהול תפעול',
      'פורטל עסקי',
    ],
  },
  landing: {
    en: [
      'WeCcelerate',
      'business offer',
      'startup program',
      'acceleration program',
    ],
    he: [
      'וויסלרייט',
      'הצעה עסקית',
      'תוכנית סטארטאפ',
      'תוכנית האצה',
    ],
  },
};

// =============================================================================
// COMPANY DATA (for JSON-LD)
// =============================================================================

export const COMPANY_INFO = {
  name: 'WeCcelerate Ltd.',
  legalName: 'WeCcelerate Ltd.',
  alternateName: ['וויסלרייט', 'We accelerate', 'Weccelerate'],
  description: {
    en: 'WeCcelerate provides business acceleration, entrepreneurial services, factory sourcing, and strategic consulting to help businesses grow and succeed.',
    he: 'וויסלרייט מספקת שירותי האצת עסקים, ייזום, מציאת מפעלים וייעוץ אסטרטגי לעזור לעסקים לצמוח ולהצליח.',
  },
  url: 'https://weccelerate.co.il',
  logo: 'https://weccelerate.co.il/logo.png',
  image: 'https://weccelerate.co.il/opengraph-image.jpg',
  email: 'info@weccelerate.co.il',
  telephone: '+972-55-564-7538',
  foundingDate: '2020', // Update with real date
  founders: [
    {
      '@type': 'Person',
      name: 'Alon', // Update with full name
    },
  ],
  address: {
    streetAddress: '', // Update with real address
    addressLocality: 'Tel Aviv',
    addressRegion: 'Tel Aviv District',
    postalCode: '',
    addressCountry: 'IL',
  },
  geo: {
    latitude: 32.0853, // Tel Aviv coordinates (update if different)
    longitude: 34.7818,
  },
  sameAs: [
    'https://www.linkedin.com/company/weccelerate',
    'https://www.facebook.com/weccelerate',
    // Add more social profiles
  ],
  openingHours: ['Su-Th 09:00-18:00'],
  priceRange: '₪₪₪',
  areaServed: ['Israel', 'IL'],
  serviceTypes: [
    'Business Acceleration',
    'Entrepreneurial Services',
    'Factory Sourcing',
    'Strategic Consulting',
    'Startup Mentoring',
  ],
} as const;

// =============================================================================
// SEO DEFAULTS
// =============================================================================

export const SEO_DEFAULTS = {
  titleTemplate: '%s | WeCcelerate - Venture Builder & Startup Accelerator Israel',
  defaultTitle: 'WeCcelerate | Venture Builder & Startup Accelerator Israel',
  defaultDescription: 'WeCcelerate is a leading Venture Builder in Tel Aviv & Jerusalem, specializing in MedTech, AI, and IP strategy for startups. Partnered with Leumit Health Care.',
  siteName: 'WeCcelerate',
  locale: 'he_IL',
  alternateLocales: ['en_US', 'en_IL'],
  type: 'website',
  twitterHandle: '@weccelerate',
} as const;

// =============================================================================
// SUPPORTED LANGUAGES (for hreflang)
// =============================================================================

export const SUPPORTED_LANGUAGES = [
  { code: 'he', name: 'Hebrew', hreflang: 'he-IL', isDefault: true },
  { code: 'en', name: 'English', hreflang: 'en', isDefault: false },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];
