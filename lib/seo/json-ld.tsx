import { COMPANY_INFO } from '@/config/seo';

// =============================================================================
// TYPES
// =============================================================================

type JsonLdType = 
  | 'Organization'
  | 'LocalBusiness'
  | 'WebSite'
  | 'WebPage'
  | 'BreadcrumbList'
  | 'Article'
  | 'FAQPage'
  | 'Service';

interface JsonLdProps {
  type?: JsonLdType | JsonLdType[];
  customData?: Record<string, unknown>;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ArticleData {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceData {
  name: string;
  description: string;
  provider?: string;
  areaServed?: string[];
}

// =============================================================================
// JSON-LD GENERATORS
// =============================================================================

/**
 * Generate Organization schema
 */
function generateOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${COMPANY_INFO.url}/#organization`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    alternateName: COMPANY_INFO.alternateName,
    description: COMPANY_INFO.description.en,
    url: COMPANY_INFO.url,
    logo: {
      '@type': 'ImageObject',
      url: COMPANY_INFO.logo,
      width: 512,
      height: 512,
    },
    image: COMPANY_INFO.image,
    email: COMPANY_INFO.email,
    telephone: COMPANY_INFO.telephone,
    foundingDate: COMPANY_INFO.foundingDate,
    founders: COMPANY_INFO.founders,
    address: {
      '@type': 'PostalAddress',
      ...COMPANY_INFO.address,
    },
    sameAs: COMPANY_INFO.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY_INFO.telephone,
      email: COMPANY_INFO.email,
      contactType: 'customer service',
      availableLanguage: ['Hebrew', 'English'],
      areaServed: COMPANY_INFO.areaServed,
    },
  };
}

/**
 * Generate LocalBusiness schema (includes Organization)
 */
function generateLocalBusinessSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': `${COMPANY_INFO.url}/#localbusiness`,
    name: COMPANY_INFO.name,
    alternateName: COMPANY_INFO.alternateName,
    description: COMPANY_INFO.description.en,
    url: COMPANY_INFO.url,
    logo: COMPANY_INFO.logo,
    image: COMPANY_INFO.image,
    email: COMPANY_INFO.email,
    telephone: COMPANY_INFO.telephone,
    priceRange: COMPANY_INFO.priceRange,
    address: {
      '@type': 'PostalAddress',
      ...COMPANY_INFO.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY_INFO.geo.latitude,
      longitude: COMPANY_INFO.geo.longitude,
    },
    openingHoursSpecification: COMPANY_INFO.openingHours.map((hours) => {
      const [days, time] = hours.split(' ');
      const [opens, closes] = time.split('-');
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days.includes('-') 
          ? days.split('-').map(d => getDayName(d))
          : [getDayName(days)],
        opens,
        closes,
      };
    }),
    sameAs: COMPANY_INFO.sameAs,
    areaServed: COMPANY_INFO.areaServed.map((area) => ({
      '@type': 'Country',
      name: area,
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Business Services',
      itemListElement: COMPANY_INFO.serviceTypes.map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
        },
        position: index + 1,
      })),
    },
  };
}

/**
 * Generate WebSite schema with search action
 */
function generateWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${COMPANY_INFO.url}/#website`,
    url: COMPANY_INFO.url,
    name: COMPANY_INFO.name,
    description: COMPANY_INFO.description.en,
    publisher: {
      '@id': `${COMPANY_INFO.url}/#organization`,
    },
    inLanguage: ['he-IL', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${COMPANY_INFO.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate WebPage schema
 */
function generateWebPageSchema(
  name: string,
  description: string,
  url: string
) {
  return {
    '@type': 'WebPage',
    '@id': `${url}/#webpage`,
    url,
    name,
    description,
    isPartOf: {
      '@id': `${COMPANY_INFO.url}/#website`,
    },
    about: {
      '@id': `${COMPANY_INFO.url}/#organization`,
    },
    inLanguage: 'he-IL',
  };
}

// Helper function for day names
function getDayName(abbr: string): string {
  const days: Record<string, string> = {
    'Mo': 'Monday',
    'Tu': 'Tuesday',
    'We': 'Wednesday',
    'Th': 'Thursday',
    'Fr': 'Friday',
    'Sa': 'Saturday',
    'Su': 'Sunday',
  };
  return days[abbr] || abbr;
}

// =============================================================================
// JSON-LD COMPONENTS
// =============================================================================

/**
 * Main JSON-LD component for structured data
 * Renders Schema.org markup in a script tag
 * 
 * @example
 * // In layout.tsx or page.tsx
 * <JsonLd type={['Organization', 'LocalBusiness', 'WebSite']} />
 */
export function JsonLd({ type = 'Organization', customData }: JsonLdProps) {
  const types = Array.isArray(type) ? type : [type];
  
  const schemas: Record<string, unknown>[] = [];

  types.forEach((t) => {
    switch (t) {
      case 'Organization':
        schemas.push(generateOrganizationSchema());
        break;
      case 'LocalBusiness':
        schemas.push(generateLocalBusinessSchema());
        break;
      case 'WebSite':
        schemas.push(generateWebSiteSchema());
        break;
      default:
        break;
    }
  });

  // Add custom data if provided
  if (customData) {
    schemas.push(customData);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Breadcrumb JSON-LD component
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Article JSON-LD component
 */
export function ArticleJsonLd({ article }: { article: ArticleData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image || COMPANY_INFO.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || COMPANY_INFO.name,
    },
    publisher: {
      '@type': 'Organization',
      name: COMPANY_INFO.name,
      logo: {
        '@type': 'ImageObject',
        url: COMPANY_INFO.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': COMPANY_INFO.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * FAQ JSON-LD component
 */
export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/**
 * Service JSON-LD component
 */
export function ServiceJsonLd({ service }: { service: ServiceData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: service.provider || COMPANY_INFO.name,
      url: COMPANY_INFO.url,
    },
    areaServed: (service.areaServed || COMPANY_INFO.areaServed).map((area) => ({
      '@type': 'Country',
      name: area,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// =============================================================================
// EXPORT HELPERS
// =============================================================================

export {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
};
