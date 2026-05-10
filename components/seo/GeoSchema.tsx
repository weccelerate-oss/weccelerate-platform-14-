/**
 * GEO Schema Component - The Holy Grail JSON-LD for AI/LLM Optimization
 * 
 * This component generates a comprehensive graph of linked entities optimized
 * for both traditional search engines (SEO) and AI/LLM-powered generative
 * engines (GEO - Generative Engine Optimization).
 * 
 * Key Features:
 * 1. Organization Schema with Parent Organization (Authority Transfer)
 * 2. Service Catalog (hasOfferCatalog)
 * 3. FAQPage Schema (Voice Search & Chatbot Optimization)
 * 4. LocalBusiness Schema (Local SEO)
 * 5. BreadcrumbList Schema (Navigation)
 * 6. WebSite Schema (Sitelinks Search Box)
 * 
 * @module components/seo/GeoSchema
 */

import {
  SITE_CONFIG,
  SEMANTIC_CORE,
  BRAND,
  PARENT_ORGANIZATION,
  SERVICES,
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
  /** Current page path for breadcrumbs */
  path?: string;
  /** Page title for WebPage schema */
  pageTitle?: string;
  /** Include FAQ schema */
  includeFaq?: boolean;
  /** Include services schema */
  includeServices?: boolean;
  /** Locale for content */
  locale?: 'he' | 'en';
}

// =============================================================================
// SCHEMA BUILDERS
// =============================================================================

/**
 * Build Organization Schema with Parent Organization (Authority Transfer)
 * This is CRITICAL for transferring Leumit's domain authority to WeCcelerate
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
    
    // CRITICAL: Parent Organization - Authority Transfer from Leumit
    parentOrganization: {
      '@type': 'HealthcareOrganization',
      '@id': `${PARENT_ORGANIZATION.url}/#organization`,
      name: PARENT_ORGANIZATION.nameEn,
      alternateName: PARENT_ORGANIZATION.name,
      description: PARENT_ORGANIZATION.description.en,
      url: PARENT_ORGANIZATION.url,
      logo: PARENT_ORGANIZATION.logo,
      areaServed: {
        '@type': 'Country',
        name: 'Israel',
        identifier: 'IL',
      },
    },
    
    // Founding & Contact
    // Founding year confirmed by Alon (CEO) on 2026-04-26: WeCcelerate Ltd.
    // was incorporated in 2016. Earlier code used 2020 which was incorrect
    // and contradicted the LinkedIn company page and the B7Net article that
    // quoted 2017. All canonical surfaces (llms.txt, llms-full.txt, footer,
    // about page, schema) now align on 2016.
    foundingDate: '2016',
    foundingLocation: {
      '@type': 'Place',
      name: 'Tel Aviv, Israel',
    },
    // Founder — CRITICAL for entity recognition by LLMs + Google Knowledge Graph.
    // Alon Pinchas is CEO & primary founder; Hinoch & Sabag are co-founders.
    founder: [
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/team#alon-pinchas`,
        name: 'Alon Pinchas',
        alternateName: 'אלון פנחס',
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
        alternateName: 'אברהם הינוך',
        jobTitle: 'Co-Founder',
        worksFor: { '@id': `${SITE_CONFIG.url}/#organization` },
        sameAs: ['https://www.linkedin.com/in/avraham-heinoch-20168a231/'],
      },
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/team#ido-sabag`,
        name: 'Ido Sabag',
        alternateName: 'עידו סבג',
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
          streetAddress: 'Jerusalem Branch',
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
 * Build Service Catalog Schema (hasOfferCatalog)
 */
function buildServicesSchema() {
  return {
    '@type': 'Service',
    '@id': `${SITE_CONFIG.url}/#services`,
    name: 'WeCcelerate Acceleration Program',
    description: BRAND.descriptions.medium.en,
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Healthcare Entrepreneurs',
      geographicArea: {
        '@type': 'Country',
        name: 'Israel',
      },
    },
    serviceType: 'Startup Acceleration',
    category: 'Business Consulting',
    
    // Service Catalog
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'WeCcelerate Services',
      itemListElement: SERVICES.map((service, index) => ({
        '@type': 'Offer',
        '@id': `${SITE_CONFIG.url}/#service-${service.id}`,
        itemOffered: {
          '@type': 'Service',
          name: service.name.en,
          alternateName: service.name.he,
          description: service.description.en,
          category: service.category,
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: service.price,
          priceCurrency: 'ILS',
        },
        position: index + 1,
      })),
    },
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
    
    // Sitelinks Search Box
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Build WebPage Schema with Speakable (AEO: AI & Voice Search Optimization)
 */
function buildWebPageSchema(path: string, pageTitle: string) {
  const pageUrl = `${SITE_CONFIG.url}${path}`;

  return {
    '@type': 'WebPage',
    '@id': `${pageUrl}/#webpage`,
    url: pageUrl,
    name: pageTitle,
    description: BRAND.descriptions.medium.he,
    isPartOf: {
      '@id': `${SITE_CONFIG.url}/#website`,
    },
    about: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    inLanguage: 'he-IL',
    primaryImageOfPage: {
      '@id': `${SITE_CONFIG.url}/#logo`,
    },
    datePublished: '2024-01-01T00:00:00+02:00',
    dateModified: new Date().toISOString(),

    // Speakable — tells voice assistants & AI which content to read aloud.
    // Narrow selector: only content authors explicitly mark with data-speakable,
    // so Google Assistant/Alexa read the answer sentence, not headings/navigation.
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable]'],
    },
  };
}

/**
 * Build HowTo Schema — makes WeCcelerate appear in "how to start a startup" queries
 */
function buildHowToSchema() {
  return {
    '@type': 'HowTo',
    '@id': `${SITE_CONFIG.url}/#howto-startup`,
    name: 'איך להקים סטארטאפ בישראל עם WeCcelerate',
    description: 'מדריך שלב-אחר-שלב להקמת סטארטאפ מוצלח בישראל דרך WeCcelerate — מהרעיון הראשוני ועד גיוס הון והשקה לשוק.',
    totalTime: 'P6M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'ILS',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'הגשת מועמדות',
        text: 'הגישו מועמדות לתוכנית ההאצה של WeCcelerate דרך טופס יצירת קשר באתר. הצוות יחזור אליכם תוך 48 שעות.',
        url: `${SITE_CONFIG.url}/contact`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'אבחון ואפיון',
        text: 'פגישת אבחון עם הצוות לבחינת הרעיון, ניתוח שוק ראשוני, והתאמת מסלול מתאים — ייעוץ עסקי, פיתוח מוצר או מסלול MedTech.',
        url: `${SITE_CONFIG.url}/services`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'בניית תוכנית עסקית',
        text: 'עבודה עם צוות הייעוץ של WeCcelerate על מחקר שוק, תוכנית פיננסית ותקציר מנהלים.',
        url: `${SITE_CONFIG.url}/services/business-consulting`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'פיתוח MVP',
        text: 'פיתוח מוצר ראשוני (MVP) — דיגיטלי או פיזי — עם צוות הפיתוח הטכני של WeCcelerate.',
        url: `${SITE_CONFIG.url}/tech-development`,
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'שיווק וגיוס הון',
        text: 'הכנת חומרי שיווק, פיץ׳ דק, וחיבור למשקיעים מרשת הקשרים של WeCcelerate.',
        url: `${SITE_CONFIG.url}/investors`,
      },
    ],
    tool: [
      { '@type': 'HowToTool', name: 'מחשבון עלות MVP' },
      { '@type': 'HowToTool', name: 'תוכנית עסקית' },
    ],
  };
}

/**
 * Build BreadcrumbList Schema
 */
function buildBreadcrumbSchema(path: string, pageTitle: string) {
  const segments = path.split('/').filter(Boolean);
  
  const items: { '@type': string; position: number; name: string; item: string }[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'בית',
      item: SITE_CONFIG.url,
    },
  ];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    items.push({
      '@type': 'ListItem',
      position: index + 2,
      name: index === segments.length - 1 ? pageTitle : segment,
      item: `${SITE_CONFIG.url}${currentPath}`,
    });
  });
  
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_CONFIG.url}${path}/#breadcrumb`,
    itemListElement: items,
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
 * Renders the complete JSON-LD structured data graph for SEO and GEO optimization.
 * Place this component in the <head> section or at the end of the body.
 * 
 * @example
 * // In app/layout.tsx or any page
 * <GeoSchema
 *   path="/"
 *   pageTitle="WeCcelerate - הפלטפורמה המובילה לסטארטאפים רפואיים"
 *   includeFaq={true}
 *   includeServices={true}
 * />
 */
export function GeoSchema({
  path = '/',
  pageTitle = 'WeCcelerate - הפלטפורמה המובילה לסטארטאפים רפואיים',
  includeFaq = true,
  includeServices = true,
  locale = 'he',
}: GeoSchemaProps) {
  // Build the complete graph
  const graphItems: Record<string, unknown>[] = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildWebPageSchema(path, pageTitle),
    buildBreadcrumbSchema(path, pageTitle),
    buildLocalBusinessSchema(),
    buildHowToSchema(),
  ];

  if (includeServices) {
    graphItems.push(buildServicesSchema());
  }

  if (includeFaq) {
    graphItems.push(buildFaqSchema(locale));
  }
  
  // Construct the final JSON-LD
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

export function ServicesSchema() {
  const jsonLd = {
    '@context': 'https://schema.org',
    ...buildServicesSchema(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default GeoSchema;
