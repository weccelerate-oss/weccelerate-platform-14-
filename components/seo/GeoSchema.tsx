/**
 * GEO Schema Component - The Holy Grail JSON-LD for AI/LLM Optimization
 * 
 * This component generates a comprehensive graph of linked entities optimized
 * for both traditional search engines (SEO) and AI/LLM-powered generative
 * engines (GEO - Generative Engine Optimization).
 * 
 * Emits the site-wide entity nodes only: Organization, WebSite, LocalBusiness
 * (+ optional FAQPage). Page-level markup belongs to the page itself.
 * 
 * @module components/seo/GeoSchema
 */

import {
  SITE_CONFIG,
  SEMANTIC_CORE,
  BRAND,
  FAQ_ITEMS,
  USER_INTENT_KEYWORDS,
} from '@/lib/seo';

// Alias for backward compatibility
const FAQ_DATA = FAQ_ITEMS;
const KEYWORDS = USER_INTENT_KEYWORDS;

// =============================================================================
// TYPES
// =============================================================================

interface GeoSchemaProps {
  /** Include the site FAQ (off by default — /faq emits its own FAQPage) */
  includeFaq?: boolean;
  /** Locale for content */
  locale?: 'he' | 'en';
}

// =============================================================================
// SCHEMA BUILDERS
// =============================================================================

/**
 * Build Organization Schema
 */
function buildOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'WeCcelerate',
    alternateName: [
      ...BRAND.english.variations,
      ...BRAND.hebrew.variations,
    ],
    legalName: BRAND.legalName,
    // Israeli Registrar of Companies number — the strongest unambiguous
    // anchor this entity has. It is public record, independently verifiable
    // (checkid.co.il, datacheck.co.il, openid.co.il, obudget.org), and it is
    // what lets an AI engine tie the Hebrew name וויסלרייט to WeCcelerate Ltd.
    // rather than guessing at a back-transliteration.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'Israeli Company Number (ח.פ)',
      value: '515962819',
    },
    description: BRAND.descriptions.long.he,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_CONFIG.url}/#logo`,
      url: `${SITE_CONFIG.url}/logo.png`,
      contentUrl: `${SITE_CONFIG.url}/logo.png`,
      width: 512,
      height: 512,
      caption: 'WeCcelerate Logo',
    },
    image: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/logo.png`,
      width: 512,
      height: 512,
    },
    
    // No parentOrganization: Leumit Health Services is a strategic partner of
    // the MedTech track, not a parent company. Declaring it as the parent was
    // a false ownership claim repeated on every page.

    // Founding & Contact
    // Founding year: 2018. History: 2016 (owner, 2026-04-26) -> 2018 (owner,
    // 2026-05-14) -> 2016 (owner via Maor, 2026-09-14) -> 2018 (Maor, 2026-10-18). Every surface must
    // agree: config/seo.ts, footer i18n, faq-catalog, llms.txt, writing-rules,
    // Wikidata Q141451357 (P571). A mismatch between them is what got the
    // domain flagged by reputation systems in April 2026.
    foundingDate: '2018',
    foundingLocation: {
      '@type': 'Place',
      name: 'Tel Aviv, Israel',
    },
    // Founder — CRITICAL for entity recognition by LLMs + Google Knowledge Graph.
    // Alon Pinhas is CEO & primary founder; Hinoch & Sabag are co-founders.
    founder: [
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/team#alon-pinchas`,
        name: 'Alon Pinhas',
        // Both English spellings are in active public use — his own LinkedIn
        // says "Pinhas". Listing both keeps the two forms resolving to one
        // person instead of splitting into two weak entities.
        alternateName: ['אלון פנחס', 'Alon Pinchas'],
        jobTitle: 'Founder & CEO',
        worksFor: { '@id': `${SITE_CONFIG.url}/#organization` },
        url: `${SITE_CONFIG.url}/team#alon-pinchas`,
        image: `${SITE_CONFIG.url}/images/team/alon-pinchas.jpg`,
        sameAs: ['https://www.linkedin.com/in/alon-pinhas-589a97172/'],
      },
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/team#avraham-hinoch`,
        name: 'Avraham Hinoch',
        alternateName: ['אברהם הינוך', 'Avraham Heinoch'],
        jobTitle: 'Co-Founder',
        worksFor: { '@id': `${SITE_CONFIG.url}/#organization` },
        sameAs: ['https://www.linkedin.com/in/avraham-heinoch-20168a231/'],
      },
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/team#ido-sabag`,
        name: 'Ido Sabag',
        alternateName: ['עידו סבג', 'Eido Sabag'],
        jobTitle: 'Co-Founder',
        worksFor: { '@id': `${SITE_CONFIG.url}/#organization` },
        sameAs: ['https://www.linkedin.com/in/ido-sabag-382b641b3/'],
      },
    ],
    email: 'info@weccelerate.co.il',
    telephone: '+972-55-564-7538',

    // Primary Location — Tel Aviv
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'HaRakevet 58',
      addressLocality: 'Tel Aviv',
      addressRegion: 'Tel Aviv District',
      postalCode: '6777801',
      addressCountry: 'IL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.0636,
      longitude: 34.7721,
    },

    // Multiple locations
    location: [
      {
        '@type': 'Place',
        name: 'WeCcelerate Tel Aviv',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'HaRakevet 58',
          addressLocality: 'Tel Aviv',
          addressRegion: 'Tel Aviv District',
          addressCountry: 'IL',
        },
      },
      {
        '@type': 'Place',
        name: 'WeCcelerate Jerusalem',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Jerusalem',
          addressRegion: 'Jerusalem District',
          addressCountry: 'IL',
        },
      },
    ],
    
    // Area Served (Global reach)
    areaServed: [
      {
        '@type': 'Country',
        name: 'Israel',
        identifier: 'IL',
      },
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 32.0636,
          longitude: 34.7721,
        },
        geoRadius: '50000',
        description: 'Global reach from Tel Aviv',
      },
    ],
    
    // Social Profiles
    // sameAs: only the verified, owned WeCcelerate social profiles.
    // Twitter/X and GitHub are intentionally omitted — Twitter is not owned
    // by the company; GitHub is not user-facing. Adding unowned profiles
    // breaks entity recognition (Google/LLMs follow sameAs and penalize when
    // they don't resolve to a matching brand).
    sameAs: [
      'https://www.linkedin.com/company/weccelerate',
      'https://www.wikidata.org/wiki/Q141451357',
      'https://www.facebook.com/weccelerate',
      'https://www.instagram.com/weccelerate.ltd',
      'https://www.youtube.com/@WeCcelerate.Ltd1',
      'https://www.tiktok.com/@weccelerate',
      // Crunchbase profile — currently under the misspelled slug `weccelerat`
      // (missing final E). Profile is live and owned. Update the URL once
      // Crunchbase support corrects the slug to `weccelerate`.
      'https://www.crunchbase.com/organization/weccelerat',
    ],

    // Contact Points
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+972-55-564-7538',
        email: 'info@weccelerate.co.il',
        availableLanguage: ['Hebrew', 'English'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          opens: '09:00',
          closes: '18:00',
        },
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'info@weccelerate.co.il',
        availableLanguage: ['Hebrew', 'English'],
      },
    ],
    
    // Industry Classification
    naics: '541611', // Administrative Management and General Management Consulting Services
    isicV4: '7020', // Management consultancy activities
    
    // Knowledge Graph Signals
    knowsAbout: [
      ...SEMANTIC_CORE,
      'Venture Building',
      'MedTech Startups',
      'Healthcare Innovation',
      'Digital Health',
      'MVP Development',
      'CTO Services',
      'App Development for Startups',
      'IP Strategy',
      'Patent Registration',
      'Helsinki Committee Approval',
      'Startup Acceleration',
      'Medical Device Regulation',
      'FDA Approval Process',
      'Israeli Healthcare System',
      'Pitch Deck Creation',
      'Angel Investors',
      'Fundraising',
      ...KEYWORDS.industry.english,
    ],
    
    // Membership
    memberOf: [
      {
        '@type': 'Organization',
        name: 'Israel Innovation Authority',
      },
      {
        '@type': 'Organization',
        name: 'Start-Up Nation Central',
      },
    ],
  };
}

/**
 * Build FAQ Schema (Voice Search & Chatbot Optimization)
 * This is CRITICAL for AI assistants to answer questions directly
 */
function buildFaqSchema(locale: 'he' | 'en' = 'he') {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_CONFIG.url}/#faq`,
    mainEntity: FAQ_DATA.map((faq, index) => ({
      '@type': 'Question',
      '@id': `${SITE_CONFIG.url}/#faq-${index + 1}`,
      name: faq.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer[locale],
        author: {
          '@id': `${SITE_CONFIG.url}/#organization`,
        },
      },
      position: index + 1,
    })),
  };
}

/**
 * Build WebSite Schema (Sitelinks Search Box)
 */
function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: 'WeCcelerate',
    alternateName: 'וויסלרייט',
    description: BRAND.descriptions.short.en,
    url: SITE_CONFIG.url,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    inLanguage: ['he-IL', 'en'],
  };
}

/**
 * Build LocalBusiness Schema (for Google My Business integration)
 */
function buildLocalBusinessSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': `${SITE_CONFIG.url}/#localbusiness`,
    name: 'WeCcelerate - Venture Builder & Startup Accelerator',
    // Same registrar anchor as the Organization node — see buildOrganizationSchema.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'Israeli Company Number (ח.פ)',
      value: '515962819',
    },
    image: `${SITE_CONFIG.url}/logo.png`,
    telephone: '+972-55-564-7538',
    email: 'info@weccelerate.co.il',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'HaRakevet 58',
      addressLocality: 'Tel Aviv',
      addressRegion: 'Tel Aviv District',
      postalCode: '6777801',
      addressCountry: 'IL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.0636,
      longitude: 34.7721,
    },
    url: SITE_CONFIG.url,
    // sameAs: only the verified, owned WeCcelerate social profiles.
    // Twitter/X and GitHub are intentionally omitted — Twitter is not owned
    // by the company; GitHub is not user-facing. Adding unowned profiles
    // breaks entity recognition (Google/LLMs follow sameAs and penalize when
    // they don't resolve to a matching brand).
    sameAs: [
      'https://www.linkedin.com/company/weccelerate',
      'https://www.wikidata.org/wiki/Q141451357',
      'https://www.facebook.com/weccelerate',
      'https://www.instagram.com/weccelerate.ltd',
      'https://www.youtube.com/@WeCcelerate.Ltd1',
      'https://www.tiktok.com/@weccelerate',
      // Crunchbase profile — currently under the misspelled slug `weccelerat`
      // (missing final E). Profile is live and owned. Update the URL once
      // Crunchbase support corrects the slug to `weccelerate`.
      'https://www.crunchbase.com/organization/weccelerat',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: '₪₪₪',
    paymentAccepted: ['Credit Card', 'Bank Transfer'],
    currenciesAccepted: 'ILS',
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * GeoSchema Component
 *
 * Rendered once in the root layout, so everything it emits lands on EVERY
 * page. It therefore carries only the nodes that are true site-wide: the
 * Organization, the WebSite and the LocalBusiness.
 *
 * Page-level nodes (WebPage, BreadcrumbList, HowTo, Service, FAQPage) must be
 * emitted by the page they describe. Until 2026-11 this component also pushed
 * a homepage WebPage + breadcrumb, a HowTo and a priced service catalog onto
 * all pages — contact, videos and guides each claimed to be the homepage and
 * to be a "how to start a startup" tutorial, which contradicts Google's
 * structured-data guidelines (markup must describe the page's own content).
 */
export function GeoSchema({ includeFaq = false, locale = 'he' }: GeoSchemaProps = {}) {
  const graphItems: Record<string, unknown>[] = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildLocalBusinessSchema(),
  ];

  if (includeFaq) {
    graphItems.push(buildFaqSchema(locale));
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': graphItems,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd, null, 0),
      }}
    />
  );
}

// =============================================================================
// INDIVIDUAL SCHEMA COMPONENTS (for granular control)
// =============================================================================

export function OrganizationSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    ...buildOrganizationSchema(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FaqPageSchema({ locale = 'he' }: { locale?: 'he' | 'en' }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    ...buildFaqSchema(locale),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default GeoSchema;
