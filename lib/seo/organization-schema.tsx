/**
 * Organization Schema Component
 * 
 * Implements Schema.org Organization structured data for GEO optimization.
 * Establishes WeCcelerate as a trusted entity with affiliation to Leumit Health Services.
 * 
 * Key GEO Strategy:
 * - parentOrganization/affiliate links establish trust chain
 * - sameAs links verify identity across platforms
 * - Detailed contact and location info improve local SEO
 * 
 * @see https://schema.org/Organization
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 */

import Script from 'next/script';

// =============================================================================
// TYPES
// =============================================================================

export interface OrganizationSchemaProps {
  /** Organization variant */
  variant?: 'main' | 'leumit' | 'medical';
  /** Include affiliate relationship with Leumit */
  includeLeumitAffiliation?: boolean;
  /** Include medical authority indicators */
  includeMedicalAuthority?: boolean;
  /** Additional same-as URLs */
  additionalSameAs?: string[];
}

export interface OrganizationData {
  name: string;
  alternateName?: string;
  description: string;
  url: string;
  logo: string;
  image?: string;
  email: string;
  telephone: string;
  foundingDate: string;
  numberOfEmployees?: {
    '@type': 'QuantitativeValue';
    minValue: number;
    maxValue: number;
  };
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  areaServed?: string[];
  sameAs: string[];
  contactPoint: {
    '@type': 'ContactPoint';
    contactType: string;
    telephone: string;
    email: string;
    availableLanguage: string[];
  }[];
  parentOrganization?: {
    '@type': 'Organization';
    name: string;
    url: string;
    sameAs?: string[];
  };
  memberOf?: Array<{
    '@type': 'Organization';
    name: string;
    url?: string;
  }>;
  award?: string[];
  knowsAbout?: string[];
}

// =============================================================================
// ORGANIZATION DATA
// =============================================================================

const WECCELERATE_BASE: OrganizationData = {
  name: 'WeCcelerate',
  alternateName: 'ויקסלרייט',
  description: 'WeCcelerate היא חברת האצה עסקית ישראלית המתמחה בליווי יזמים וסטארטאפים מהרעיון ועד לגיוס הון. אנו מספקים שירותי ייעוץ, איתור מפעלים, ופיתוח אסטרטגיות צמיחה.',
  url: 'https://weccelerate.co.il',
  logo: 'https://weccelerate.co.il/images/logo.png',
  image: 'https://weccelerate.co.il/images/office.jpg',
  email: 'info@weccelerate.co.il',
  telephone: '+972-3-555-1234',
  foundingDate: '2018',
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    minValue: 10,
    maxValue: 50,
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'מגדל עזריאלי שרונה, קומה 35',
    addressLocality: 'תל אביב',
    addressRegion: 'תל אביב',
    postalCode: '6701203',
    addressCountry: 'IL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 32.0731,
    longitude: 34.7925,
  },
  areaServed: ['Israel', 'United States', 'European Union'],
  sameAs: [
    'https://www.linkedin.com/company/weccelerate',
    'https://www.facebook.com/weccelerate',
    'https://twitter.com/weccelerate',
    'https://www.youtube.com/@weccelerate',
    'https://www.instagram.com/weccelerate',
    'https://www.crunchbase.com/organization/weccelerate',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+972-3-555-1234',
      email: 'info@weccelerate.co.il',
      availableLanguage: ['Hebrew', 'English'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+972-3-555-1235',
      email: 'sales@weccelerate.co.il',
      availableLanguage: ['Hebrew', 'English'],
    },
  ],
  award: [
    'Top 10 Business Accelerators in Israel 2024',
    'Best Startup Support Program - Globes 2023',
  ],
  knowsAbout: [
    'Startup Acceleration',
    'Business Development',
    'Fundraising Strategy',
    'Market Research',
    'Product Development',
    'Factory Sourcing',
    'Medical Device Regulation',
    'FDA Approval Process',
    'CE Marking',
    'HealthTech Innovation',
  ],
};

// Leumit Health Services - Parent/Affiliate Organization
const LEUMIT_ORGANIZATION = {
  '@type': 'Organization' as const,
  name: 'Leumit Health Services',
  alternateName: 'לאומית שירותי בריאות',
  url: 'https://www.leumit.co.il',
  sameAs: [
    'https://www.linkedin.com/company/leumit-health-services',
    'https://www.facebook.com/leumit',
    'https://he.wikipedia.org/wiki/לאומית_שירותי_בריאות',
  ],
  description: 'Leumit Health Services is one of Israel\'s four national health maintenance organizations (HMOs), providing comprehensive healthcare services to over 700,000 members.',
};

// Medical/HealthTech specific memberships
const MEDICAL_MEMBERSHIPS = [
  {
    '@type': 'Organization' as const,
    name: 'Israel Advanced Technology Industries (IATI)',
    url: 'https://www.iati.co.il',
  },
  {
    '@type': 'Organization' as const,
    name: 'Israel Medical Association',
    url: 'https://www.ima.org.il',
  },
  {
    '@type': 'Organization' as const,
    name: 'HealthTech Israel',
  },
  {
    '@type': 'Organization' as const,
    name: 'MedTech Innovator',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function OrganizationSchema({
  variant = 'main',
  includeLeumitAffiliation = false,
  includeMedicalAuthority = false,
  additionalSameAs = [],
}: OrganizationSchemaProps) {
  // Build organization schema
  const organizationSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${WECCELERATE_BASE.url}/#organization`,
    ...WECCELERATE_BASE,
    sameAs: [...WECCELERATE_BASE.sameAs, ...additionalSameAs],
  };

  // Add Leumit affiliation for medical trust
  if (includeLeumitAffiliation || variant === 'leumit' || variant === 'medical') {
    // Using 'parentOrganization' establishes a strong trust relationship
    organizationSchema.parentOrganization = LEUMIT_ORGANIZATION;
    
    // Also add as 'sponsor' for additional trust signal
    organizationSchema.sponsor = LEUMIT_ORGANIZATION;
    
    // Add medical-specific description
    organizationSchema.description = 
      'WeCcelerate, בשותפות עם לאומית שירותי בריאות, מתמחה בהאצת סטארטאפים בתחום הבריאות הדיגיטלית והמכשור הרפואי. אנו מספקים ליווי מקצועי בתהליכי רגולציה (FDA, CE), פיתוח מוצר, וגיוס הון.';
  }

  // Add medical authority indicators
  if (includeMedicalAuthority || variant === 'medical') {
    organizationSchema.memberOf = MEDICAL_MEMBERSHIPS;
    
    // Expand knowsAbout for medical expertise
    organizationSchema.knowsAbout = [
      ...(WECCELERATE_BASE.knowsAbout || []),
      'FDA 510(k) Submission',
      'Medical Device Classification',
      'Clinical Trials Design',
      'ISO 13485 Certification',
      'Digital Health Solutions',
      'Telemedicine Platforms',
      'Remote Patient Monitoring',
      'Healthcare AI/ML',
      'HIPAA Compliance',
      'Medical Data Privacy',
    ];

    // Add credentials/certifications
    organizationSchema.hasCredential = [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Professional Certification',
        name: 'ISO 13485 Certified Consulting Partner',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Professional Certification', 
        name: 'FDA Registered Establishment Consultant',
      },
    ];
  }

  // Variant-specific adjustments
  if (variant === 'leumit') {
    organizationSchema.name = 'WeCcelerate x Leumit HealthTech';
    organizationSchema.url = 'https://leumit.weccelerate.co.il';
    organizationSchema['@id'] = 'https://leumit.weccelerate.co.il/#organization';
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationSchema, null, 0),
      }}
      strategy="afterInteractive"
    />
  );
}

// =============================================================================
// WEBSITE SCHEMA (Companion)
// =============================================================================

export interface WebSiteSchemaProps {
  variant?: 'main' | 'leumit';
}

export function WebSiteSchema({ variant = 'main' }: WebSiteSchemaProps) {
  const baseUrl = variant === 'leumit' 
    ? 'https://leumit.weccelerate.co.il'
    : 'https://weccelerate.co.il';

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: variant === 'leumit' ? 'WeCcelerate x Leumit HealthTech' : 'WeCcelerate',
    description: WECCELERATE_BASE.description,
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    inLanguage: ['he-IL', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteSchema, null, 0),
      }}
      strategy="afterInteractive"
    />
  );
}

// =============================================================================
// LOCAL BUSINESS SCHEMA (For Location-based SEO)
// =============================================================================

export function LocalBusinessSchema() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://weccelerate.co.il/#localbusiness',
    name: 'WeCcelerate',
    image: WECCELERATE_BASE.image,
    telephone: WECCELERATE_BASE.telephone,
    email: WECCELERATE_BASE.email,
    url: WECCELERATE_BASE.url,
    address: WECCELERATE_BASE.address,
    geo: WECCELERATE_BASE.geo,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: '₪₪₪',
    currenciesAccepted: 'ILS, USD, EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(localBusinessSchema, null, 0),
      }}
      strategy="afterInteractive"
    />
  );
}

export default OrganizationSchema;
