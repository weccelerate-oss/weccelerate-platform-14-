import { Metadata, Viewport } from 'next';
import { SiteKey } from '@/config/sites';
import {
  SEO_DEFAULTS,
  SITE_KEYWORDS,
  COMPANY_INFO,
  SUPPORTED_LANGUAGES,
} from '@/config/seo';

// =============================================================================
// TYPES
// =============================================================================

export interface MetadataParams {
  title?: string;
  description?: string;
  keywords?: string[];
  siteKey?: SiteKey;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  locale?: string;
}

// =============================================================================
// VIEWPORT (separate export for Next.js 14+)
// =============================================================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E3A8A' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

// =============================================================================
// CONSTRUCT METADATA
// =============================================================================

/**
 * Constructs Next.js Metadata object with SEO optimizations
 * 
 * @param params - Configuration parameters for metadata
 * @returns Complete Metadata object for Next.js
 * 
 * @example
 * // Basic usage
 * export const metadata = constructMetadata({
 *   title: 'About Us',
 *   description: 'Learn about WeCcelerate',
 * });
 * 
 * @example
 * // With subdomain
 * export const metadata = constructMetadata({
 *   title: 'Dashboard',
 *   siteKey: 'biz',
 * });
 */
export function constructMetadata({
  title,
  description,
  keywords = [],
  siteKey = 'main',
  path = '',
  noIndex = false,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  authors = [],
  locale = 'he_IL',
}: MetadataParams = {}): Metadata {
  // Get site-specific keywords
  const siteKeywords = SITE_KEYWORDS[siteKey];
  const allKeywords = [
    ...siteKeywords.en,
    ...siteKeywords.he,
    ...keywords,
  ];

  // Deduplicate keywords
  const uniqueKeywords = [...new Set(allKeywords)];

  // Construct full title
  const fullTitle = title
    ? SEO_DEFAULTS.titleTemplate.replace('%s', title)
    : SEO_DEFAULTS.defaultTitle;

  // Use provided description or default
  const metaDescription = description || SEO_DEFAULTS.defaultDescription;

  // Construct canonical URL
  const baseUrl = COMPANY_INFO.url;
  const canonicalPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  // OG Image with fallback
  const ogImageUrl = ogImage || COMPANY_INFO.image;

  // Construct alternates for hreflang
  const languages: Record<string, string> = {};
  SUPPORTED_LANGUAGES.forEach((lang) => {
    const langPath = lang.isDefault ? canonicalPath : `/${lang.code}${canonicalPath}`;
    languages[lang.hreflang] = `${baseUrl}${langPath}`;
  });

  return {
    // Basic metadata
    title: {
      default: fullTitle,
      template: SEO_DEFAULTS.titleTemplate,
    },
    description: metaDescription,
    keywords: uniqueKeywords,
    authors: authors.length > 0 
      ? authors.map((name) => ({ name }))
      : [{ name: COMPANY_INFO.name }],
    creator: COMPANY_INFO.name,
    publisher: COMPANY_INFO.name,

    // Robots
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

    // Canonical & Alternates
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },

    // Open Graph
    openGraph: {
      type: ogType,
      locale,
      alternateLocale: [...SEO_DEFAULTS.alternateLocales],
      url: canonicalUrl,
      siteName: SEO_DEFAULTS.siteName,
      title: fullTitle,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl,
          width: 512,
          height: 512,
          alt: `${COMPANY_INFO.name} - ${title || 'Business Acceleration'}`,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      site: SEO_DEFAULTS.twitterHandle,
      creator: SEO_DEFAULTS.twitterHandle,
      title: fullTitle,
      description: metaDescription,
      images: [ogImageUrl],
    },

    // Verification (codes sourced from env vars; set in Vercel/env.local)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      other: {
        'msvalidate.01': process.env.BING_SITE_VERIFICATION ?? '',
      },
    },

    // App-specific
    applicationName: SEO_DEFAULTS.siteName,
    referrer: 'origin-when-cross-origin',
    // Allow Google to auto-link tel:/mailto:/addresses in SERP snippets
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },

    // Category
    category: 'business',

    // Other
    other: {
      'msapplication-TileColor': '#1E3A8A',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  };
}

// =============================================================================
// PAGE-SPECIFIC METADATA HELPERS
// =============================================================================

/**
 * Construct metadata for article/blog pages
 */
export function constructArticleMetadata({
  title,
  description,
  publishedTime,
  modifiedTime,
  authors,
  tags = [],
  siteKey = 'main',
  path = '',
}: MetadataParams & { tags?: string[] }): Metadata {
  return constructMetadata({
    title,
    description,
    keywords: tags,
    siteKey,
    path,
    ogType: 'article',
    publishedTime,
    modifiedTime,
    authors,
  });
}

/**
 * Construct metadata for product/service pages
 */
export function constructProductMetadata({
  title,
  description,
  siteKey = 'main',
  path = '',
}: MetadataParams): Metadata {
  return constructMetadata({
    title,
    description,
    siteKey,
    path,
    ogType: 'website', // Products/services use website type with product-specific keywords
  });
}

/**
 * Construct metadata for no-index pages (portals, dashboards)
 */
export function constructPrivateMetadata({
  title,
  description,
  siteKey = 'main',
}: MetadataParams): Metadata {
  return constructMetadata({
    title,
    description,
    siteKey,
    noIndex: true,
  });
}
