/**
 * SEO/GEO Configuration - The Golden Strategy
 * 
 * This file contains the complete SEO and Generative Engine Optimization (GEO) 
 * strategy for WeCcelerate to achieve #1 authority in MedTech and Entrepreneurship in Israel.
 * 
 * Key Components:
 * 1. Brand Entity Strategy - All brand variations
 * 2. User Intent Keywords - Problem & Solution targeting
 * 3. Metadata Construction - Dynamic SEO metadata
 * 4. JSON-LD Schema - Structured data for AI/LLM optimization
 * 5. FAQ Schema - Voice search & chatbot optimization
 * 
 * @module lib/seo
 */

import type { Metadata, Viewport } from 'next';

// =============================================================================
// SITE CONFIGURATION
// =============================================================================

export const SITE_CONFIG = {
 url: 'https://weccelerate.co.il',
 defaultDescription: 'WeCcelerate is a leading Venture Builder in Tel Aviv & Jerusalem, specializing in MedTech, AI, and IP strategy for startups. Partnered with Leumit Health Care.',
 titleTemplate: '%s | WeCcelerate - Venture Builder & Startup Accelerator Israel',
 subdomains: {
 main: 'https://weccelerate.co.il',
 leumit: 'https://leumit.weccelerate.co.il',
 biz: 'https://biz.weccelerate.co.il',
 landing: 'https://landing.weccelerate.co.il',
 },
 defaultLocale: 'he_IL',
 supportedLocales: ['he_IL', 'en_US', 'en_IL'],
} as const;

// =============================================================================
// SEMANTIC CORE - Primary Target Keywords
// =============================================================================

export const SEMANTIC_CORE = [
 'Venture Builder Israel',
 'Startup Accelerator',
 'Medical Accelerator',
 'Innovation Hub Tel Aviv',
 'Weccelerate',
 'וויסלרייט',
] as const;

// =============================================================================
// BRAND ENTITY STRATEGY - The Complete Entity Graph
// =============================================================================

export const BRAND = {
 // Legal & Official
 legalName: 'WeCcelerate Ltd.',
 tradingName: 'WeCcelerate',
 
 // English Variations (CRITICAL: All must rank)
 english: {
 primary: 'WeCcelerate',
 variations: [
 'WeCcelerate',
 'We Accelerate',
 'Weccelerate',
 'WeAccelerate',
 ],
 tagline: 'From Idea to Impact',
 },
 
 // Hebrew Variations (CRITICAL: All spellings must rank)
 hebrew: {
 primary: 'וויסלרייט',
 variations: [
 'וויסלרייט',
 'ויקלרייט', 
 'ווי אקסלרייט',
 'וויסלרייט קידום עסקים',
 'ווי-אקסלרייט',
 'וי אקסלרייט',
 ],
 tagline: 'מהרעיון להשפעה',
 },
 
 // Descriptions — Venture Builder positioning
 descriptions: {
 short: {
 he: 'וויסלרייט — Venture Builder ומאיץ סטארטאפים מוביל בתל אביב וירושלים. MedTech, AI ואסטרטגיית IP.',
 en: 'WeCcelerate is a leading Venture Builder in Tel Aviv & Jerusalem, specializing in MedTech, AI, and IP strategy for startups. Partnered with Leumit Health Care.',
 },
 medium: {
 he: 'וויסלרייט (WeCcelerate) היא Venture Builder ומאיץ סטארטאפים מוביל בתל אביב וירושלים. אנו מתמחים ב-MedTech, בינה מלאכותית ואסטרטגיית IP, עם שותפות בלעדית עם לאומית שירותי בריאות.',
 en: 'WeCcelerate is a leading Venture Builder and Startup Accelerator in Tel Aviv & Jerusalem. We specialize in MedTech, AI, and IP strategy, with an strategic partnership with Leumit Health Care.',
 },
 long: {
 he: 'וויסלרייט הוא — Venture Builder ומאיץ סטארטאפים בישראל, הפועל מתל אביב וירושלים. אנו מלווים יזמים מהרעיון לשוק בתחומי MedTech, בינה מלאכותית וטכנולוגיה עמוקה. השותפות האסטרטגית שלנו עם לאומית שירותי בריאות יוצרת מסלול Medical Accelerator בלעדי עם גישה לדאטה רפואי, פיילוטים קליניים, הכוונה רגולטורית ותמיכה בוועדת הלסינקי.',
 en: 'WeCcelerate is Israel\'s premier Venture Builder and Startup Accelerator, operating from Tel Aviv and Jerusalem. We guide entrepreneurs from idea to market across MedTech, AI, and deep-tech sectors. Our strategic partnership with Leumit Health Care creates an exclusive Medical Accelerator track with access to medical data, clinical pilots, and regulatory support.',
 },
 },
} as const;

// =============================================================================
// USER INTENT KEYWORDS - Problem & Solution Strategy
// =============================================================================

export const KEYWORDS = {
 // Primary User Intent (Problem-focused)
 userIntent: {
 hebrew: [
 // Starting a MedTech Startup
 'הקמת סטארטאפ רפואי',
 'איך להקים סטארטאפ',
 'סטארטאפ בתחום הבריאות',
 'חדשנות רפואית',
 
 // Fundraising
 'איך מגייסים כסף למיזם',
 'גיוס הון לסטארטאפ',
 'משקיעים לסטארטאפ רפואי',
 'סבב גיוס ראשון',
 'איך למצוא משקיעים',
 
 // MVP Development
 'פיתוח MVP',
 'בניית מוצר ראשוני',
 'פיתוח מוצר סטארטאפ',
 'מ-רעיון למוצר',
 
 // Entrepreneur Guidance
 'ליווי יזמים משלב הרעיון',
 'ליווי יזמים',
 'מנטורינג לסטארטאפים',
 'תוכנית האצה',
 'אינקובטור סטארטאפים',
 
 // Leumit Partnership
 'שותף תכנוני לאומית',
 'שיתוף פעולה לאומית',
 'לאומית חדשנות',
 'גישה לדאטה רפואי',
 ],
 english: [
 // Starting a MedTech Startup
 'MedTech startup Israel',
 'healthcare startup accelerator',
 'digital health startup',
 'medical technology incubator',
 
 // Fundraising
 'startup fundraising Israel',
 'seed funding healthcare',
 'investor connections MedTech',
 
 // MVP Development
 'MVP development Israel',
 'healthcare product development',
 'medical device prototyping',
 
 // Accelerator
 'startup accelerator Tel Aviv',
 'healthcare innovation program',
 'Leumit innovation partner',
 ],
 },
 
 // Industry Keywords
 industry: {
 hebrew: [
 'בריאות דיגיטלית',
 'טכנולוגיה רפואית',
 'MedTech',
 'HealthTech',
 'חדשנות בבריאות',
 'רפואה מותאמת אישית',
 'AI בבריאות',
 'טלרפואה',
 ],
 english: [
 'digital health',
 'medical technology',
 'health tech',
 'healthcare innovation',
 'personalized medicine',
 'AI healthcare',
 'telemedicine',
 ],
 },
 
 // Location Keywords (Local SEO)
 location: {
 hebrew: [
 'תל אביב',
 'ישראל',
 'startup nation',
 'סיליקון ואדי',
 ],
 english: [
 'Tel Aviv',
 'Israel',
 'Startup Nation',
 'Silicon Wadi',
 ],
 },
} as const;

// =============================================================================
// PARENT ORGANIZATION - Authority Transfer Strategy
// =============================================================================

export const PARENT_ORGANIZATION = {
 name: 'לאומית שירותי בריאות',
 nameEn: 'Leumit Health Services',
 url: 'https://www.leumit.co.il',
 description: {
 he: 'קופת חולים לאומית - אחת מארבע קופות החולים בישראל',
 en: 'Leumit Health Fund - One of Israel\'s four public health funds',
 },
 logo: 'https://www.leumit.co.il/logo.png',
 type: 'HealthcareOrganization',
} as const;

// =============================================================================
// SERVICES CATALOG - For JSON-LD hasOfferCatalog
// =============================================================================

export const SERVICES = [
 {
 id: 'startup-incubation',
 name: {
 he: 'דגירת סטארטאפים',
 en: 'Startup Incubation',
 },
 description: {
 he: 'תוכנית האצה מקיפה ליזמים בתחום הבריאות הדיגיטלית',
 en: 'Comprehensive acceleration program for digital health entrepreneurs',
 },
 price: 'Free (Equity-based)',
 duration: 'over a flexible duration',
 category: 'Acceleration',
 },
 {
 id: 'mvp-development',
 name: {
 he: 'פיתוח MVP',
 en: 'MVP Development',
 },
 description: {
 he: 'ליווי טכני ופיתוח מוצר ראשוני תוך גישה לדאטה רפואי',
 en: 'Technical guidance and prototype development with access to medical data',
 },
 price: 'Custom',
 duration: 'over a flexible duration',
 category: 'Development',
 },
 {
 id: 'regulatory-consulting',
 name: {
 he: 'ייעוץ רגולטורי',
 en: 'Regulatory Consulting',
 },
 description: {
 he: 'ליווי בתהליכי רגולציה - CE, משרד הבריאות',
 en: 'Guidance through CE marking and Israeli Ministry of Health approvals',
 },
 price: 'Custom',
 duration: 'Ongoing',
 category: 'Consulting',
 },
 {
 id: 'investor-matching',
 name: {
 he: 'חיבור למשקיעים',
 en: 'Investor Matching',
 },
 description: {
 he: 'גישה לרשת משקיעים מתמחים בתחום הבריאות',
 en: 'Access to a network of healthcare-focused investors',
 },
 price: 'Success-based',
 duration: 'As needed',
 category: 'Funding',
 },
 {
 id: 'data-access',
 name: {
 he: 'גישה לדאטה רפואי',
 en: 'Medical Data Access',
 },
 description: {
 he: 'גישה מאובטחת לדאטה רפואי אנונימי של לאומית לצורכי מחקר ופיתוח',
 en: 'Secure access to anonymized Leumit medical data for R&D purposes',
 },
 price: 'Partnership-based',
 duration: 'Project-based',
 category: 'Data',
 },
] as const;

// =============================================================================
// FAQ DATA - Voice Search & AI Optimization
// =============================================================================

export const FAQ_DATA = [
 {
 question: {
 he: 'איך מקימים סטארטאפ רפואי?',
 en: 'How do you start a MedTech startup?',
 },
 answer: {
 he: 'באמצעות פלטפורמת WeCcelerate (וויסלרייט) המעניקה ליווי מלא משלב הרעיון, פיתוח MVP, גישה לדאטה רפואי של לאומית, ועד חיבור למשקיעים וגיוס הון.',
 en: 'Through the WeCcelerate platform, which provides comprehensive support from ideation, MVP development, access to Leumit\'s medical data, to investor connections and fundraising.',
 },
 },
 {
 question: {
 he: 'מה זה וויסלרייט?',
 en: 'What is WeCcelerate?',
 },
 answer: {
 he: 'וויסלרייט (WeCcelerate) היא זרוע החדשנות וקידום העסקים של לאומית שירותי בריאות, המאפשרת ליזמים להפוך רעיון למוצר בתחום הבריאות הדיגיטלית.',
 en: 'WeCcelerate is the innovation and business acceleration arm of Leumit Health Services, enabling entrepreneurs to transform ideas into digital health products.',
 },
 },
 {
 question: {
 he: 'איך מגייסים כסף לסטארטאפ?',
 en: 'How do you raise funding for a startup?',
 },
 answer: {
 he: 'WeCcelerate מחברת יזמים לרשת משקיעים מתמחים בתחום הבריאות, מלווה בהכנת מצגת משקיעים, ומסייעת בתהליך הגיוס עד לסגירת העסקה.',
 en: 'WeCcelerate connects entrepreneurs with healthcare-focused investors, assists in pitch deck preparation, and supports the entire fundraising process.',
 },
 },
 {
 question: {
 he: 'מה היתרון של לאומית כשותף?',
 en: 'What is the advantage of Leumit as a partner?',
 },
 answer: {
 he: 'לאומית מעניקה גישה לדאטה רפואי אנונימי של מיליוני מטופלים, סביבת פיילוט קלינית, ומומחיות רפואית ורגולטורית ייחודית.',
 en: 'Leumit provides access to anonymized medical data from millions of patients, a clinical pilot environment, and unique medical and regulatory expertise.',
 },
 },
 {
 question: {
 he: 'כמה זמן לוקח לפתח MVP?',
 en: 'How long does it take to develop an MVP?',
 },
 answer: {
 he: 'בתוכנית WeCcelerate, פיתוח MVP לוקח בממוצע 3-6 חודשים, תלוי במורכבות המוצר ובדרישות הרגולטוריות.',
 en: 'In the WeCcelerate program, MVP development typically takes over a flexible duration, depending on product complexity and regulatory requirements.',
 },
 },
 {
 question: {
 he: 'האם התוכנית מתאימה ליזמים בתחילת הדרך?',
 en: 'Is the program suitable for early-stage entrepreneurs?',
 },
 answer: {
 he: 'כן, WeCcelerate מלווה יזמים מהשלב הראשוני ביותר - משלב הרעיון, דרך אפיון, פיתוח ועד גיוס הון והשקה לשוק.',
 en: 'Yes, WeCcelerate supports entrepreneurs from the earliest stage - from ideation, through specification, development, fundraising, and market launch.',
 },
 },
] as const;

// =============================================================================
// METADATA CONSTRUCTION - Dynamic SEO
// =============================================================================

export interface ConstructMetadataParams {
 title: string;
 description?: string;
 keywords?: string[];
 path?: string;
 locale?: 'he' | 'en';
 ogImage?: string;
 ogType?: 'website' | 'article';
 publishedTime?: string;
 modifiedTime?: string;
 authors?: string[];
 noIndex?: boolean;
}

/**
 * Get a random Hebrew brand variation for SEO diversity
 */
function getHebrewBrandVariation(): string {
 const variations = BRAND.hebrew.variations;
 // Use a deterministic selection based on current date to ensure consistency
 // but still rotate through variations
 const index = new Date().getDate() % variations.length;
 return variations[index];
}

/**
 * Construct SEO-optimized metadata with Golden Keywords Strategy
 * 
 * @param params - Metadata configuration
 * @returns Complete Next.js Metadata object
 */
export function constructMetadata({
 title,
 description,
 keywords = [],
 path = '/',
 locale = 'he',
 ogImage,
 ogType = 'website',
 publishedTime,
 modifiedTime,
 authors = ['WeCcelerate Team', 'Leumit Health Services'],
 noIndex = false,
}: ConstructMetadataParams): Metadata {
 // Use the page-supplied title as-is. Don't pre-wrap with the brand suffix
 // here — Next.js applies the parent layout's title.template to title.default,
 // which would re-append the suffix and double-wrap it.
 const fullTitle = title;

 const metaDescription = description || SITE_CONFIG.defaultDescription;
 
 // Compile all keywords (deduplicated) — semantic core first
 const allKeywords = [
 ...SEMANTIC_CORE,
 ...BRAND.english.variations,
 ...BRAND.hebrew.variations,
 ...KEYWORDS.userIntent.hebrew,
 ...KEYWORDS.userIntent.english,
 ...KEYWORDS.industry.hebrew,
 ...KEYWORDS.industry.english,
 ...keywords,
 ];
 const uniqueKeywords = [...new Set(allKeywords)];
 
 // Canonical URL
 const canonicalUrl = `${SITE_CONFIG.url}${path}`;
 
 // OG Image with fallback
 const ogImageUrl = ogImage || `${SITE_CONFIG.url}/opengraph-image.jpg`;
 
 return {
 title: { absolute: fullTitle },
 description: metaDescription,
 keywords: uniqueKeywords,
 authors: authors.map(name => ({ name })),
 creator: 'WeCcelerate',
 publisher: 'WeCcelerate בשיתוף לאומית',
 
 robots: {
 index: !noIndex,
 follow: !noIndex,
 googleBot: {
 index: !noIndex,
 follow: !noIndex,
 'max-video-preview': -1,
 'max-image-preview': 'large',
 'max-snippet': -1,
 },
 },
 
 metadataBase: new URL(SITE_CONFIG.url),
 alternates: {
 canonical: canonicalUrl,
 languages: {
 'he-IL': canonicalUrl,
 'en-US': `${SITE_CONFIG.url}/en${path}`,
 'x-default': canonicalUrl,
 },
 },
 
 openGraph: {
 type: ogType,
 locale: 'he_IL',
 alternateLocale: ['en_US'],
 url: canonicalUrl,
 siteName: 'WeCcelerate - וויסלרייט',
 title: fullTitle,
 description: metaDescription,
 images: [{
 url: ogImageUrl,
 width: 1200,
 height: 630,
 alt: `WeCcelerate - ${title}`,
 }],
 ...(publishedTime && { publishedTime }),
 ...(modifiedTime && { modifiedTime }),
 },
 
 twitter: {
 card: 'summary_large_image',
 site: '@weccelerate',
 creator: '@weccelerate',
 title: fullTitle,
 description: metaDescription,
 images: [ogImageUrl],
 },
 
 verification: {
 google: process.env.GOOGLE_SITE_VERIFICATION,
 yandex: process.env.YANDEX_VERIFICATION,
 other: {
 ...(process.env.BING_VERIFICATION ? { 'msvalidate.01': process.env.BING_VERIFICATION } : {}),
 },
 },
 
 applicationName: 'WeCcelerate',
 referrer: 'origin-when-cross-origin',
 category: 'Healthcare Technology',
 
 other: {
 'msapplication-TileColor': '#1E3A8A',
 'apple-mobile-web-app-capable': 'yes',
 'geo.region': 'IL',
 'geo.placename': 'Tel Aviv',
 'ICBM': '32.0636, 34.7721',
 },
 };
}

// =============================================================================
// VIEWPORT CONFIGURATION
// =============================================================================

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
 maximumScale: 5,
 themeColor: [
 { media: '(prefers-color-scheme: light)', color: '#1E3A8A' },
 { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
 ],
 colorScheme: 'light dark',
};

// =============================================================================
// RE-EXPORT EXISTING MODULES
// =============================================================================

export * from './metadata';
export * from './json-ld';
