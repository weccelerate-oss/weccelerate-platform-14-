/**
 * Organization Schema Component
 * 
 * Implements Schema.org Organization markup for GEO Authority.
 * Establishes WeCcelerate as a trusted entity affiliated with Leumit Health Services.
 * 
 * Key GEO Strategy:
 * - parentOrganization links to Leumit for medical trust
 * - Comprehensive sameAs for social proof
 * - Detailed contact and location info
 * 
 * @see https://schema.org/Organization
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 */

import Script from 'next/script';

// =============================================================================
// TYPES
// =============================================================================

export interface OrganizationSchemaProps {
  /** Include Leumit as parent organization (for medical trust) */
  includeLeumitAffiliation?: boolean;
  /** Site variant for customization */
  variant?: 'main' | 'leumit' | 'biz';
  /** Additional custom data */
  customData?: Partial<OrganizationData>;
}

interface OrganizationData {
  name: string;
  alternateName?: string;
  description: string;
  url: string;
  logo: string;
  image?: string;
  email: string;
  telephone: string;
  address: AddressData;
  foundingDate: string;
  founders?: PersonData[];
  sameAs: string[];
  parentOrganization?: OrganizationReference;
  memberOf?: OrganizationReference[];
  award?: string[];
  numberOfEmployees?: NumberRange;
  slogan?: string;
  knowsAbout?: string[];
  areaServed?: AreaServed[];
}

interface AddressData {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

interface PersonData {
  name: string;
  jobTitle?: string;
  url?: string;
}

interface OrganizationReference {
  '@type': string;
  name: string;
  url: string;
  description?: string;
  logo?: string;
}

interface NumberRange {
  '@type': 'QuantitativeValue';
  minValue: number;
  maxValue: number;
}

interface AreaServed {
  '@type': 'Country' | 'State' | 'City' | 'GeoShape';
  name: string;
}

// =============================================================================
// ORGANIZATION DATA
// =============================================================================

const WECCELERATE_DATA: OrganizationData = {
  name: 'WeCcelerate',
  alternateName: 'וויסלרייט',
  description: 'WeCcelerate is a leading Venture Builder and Startup Accelerator in Tel Aviv & Jerusalem, specializing in MedTech, AI, and IP strategy for startups. Partnered with Leumit Health Care.',
  url: 'https://weccelerate.co.il',
  logo: 'https://weccelerate.co.il/images/logos/weccelerate-logo.png',
  image: 'https://weccelerate.co.il/images/og/weccelerate-office.jpg',
  email: 'Raz@weccelerate.co.il',
  telephone: '+972-55-564-7538',
  address: {
    streetAddress: 'רחוב הרכבת 58',
    addressLocality: 'תל אביב',
    addressRegion: 'תל אביב',
    postalCode: '6777801',
    addressCountry: 'IL',
  },
  foundingDate: '2018',
  founders: [
    {
      name: 'אלון כהן',
      jobTitle: 'CEO & Co-Founder',
      url: 'https://linkedin.com/in/aloncohen',
    },
  ],
  sameAs: [
    'https://www.youtube.com/@WeCcelerate.Ltd1',
    'https://www.linkedin.com/company/weccelerate',
    'https://www.facebook.com/weccelerate',
    'https://twitter.com/weccelerate',
    'https://www.instagram.com/weccelerate',
    'https://github.com/weccelerate',
    'https://www.crunchbase.com/organization/weccelerate',
  ],
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    minValue: 10,
    maxValue: 50,
  },
  slogan: 'מהרעיון להצלחה',
  knowsAbout: [
    'Venture Building',
    'Startup Acceleration',
    'Medical Accelerator',
    'Innovation Hub',
    'Business Acceleration',
    'Startup Mentoring',
    'MVP Development',
    'CTO Services',
    'App Development for Startups',
    'IP Strategy',
    'Patent Registration',
    'Helsinki Committee Approval',
    'Medical Device Regulation',
    'FDA Approval Process',
    'CE Marking',
    'HealthTech Investment',
    'MedTech Development',
    'Seed Funding',
    'Series A Funding',
    'Pitch Deck Creation',
    'Angel Investors',
    'Fundraising',
    'Investor Relations',
  ],
  areaServed: [
    { '@type': 'Country', name: 'Israel' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'European Union' },
  ],
};

// Leumit Health Services - Parent Organization for Medical Trust
const LEUMIT_ORGANIZATION: OrganizationReference = {
  '@type': 'MedicalOrganization',
  name: 'Leumit Health Services',
  url: 'https://www.leumit.co.il',
  description: 'קופת חולים לאומית - אחת מארבע קופות החולים הגדולות בישראל, מספקת שירותי בריאות לכ-700,000 מבוטחים.',
  logo: 'https://www.leumit.co.il/images/logo.png',
};

// Professional associations
const MEMBER_ORGANIZATIONS: OrganizationReference[] = [
  {
    '@type': 'Organization',
    name: 'Israel Innovation Authority',
    url: 'https://innovationisrael.org.il',
    description: 'רשות החדשנות - הגוף הממשלתי לקידום חדשנות טכנולוגית בישראל',
  },
  {
    '@type': 'Organization',
    name: 'Start-Up Nation Central',
    url: 'https://startupnationcentral.org',
    description: 'ארגון המקדם את מערכת האקולוגית של החדשנות הישראלית',
  },
  {
    '@type': 'Organization',
    name: 'Israel Advanced Technology Industries (IATI)',
    url: 'https://www.iati.co.il',
    description: 'התאחדות תעשיות ההייטק הישראלית',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function OrganizationSchema({
  includeLeumitAffiliation = true,
  variant = 'main',
  customData,
}: OrganizationSchemaProps) {
  // Merge custom data with defaults
  const orgData = { ...WECCELERATE_DATA, ...customData };

  // Build the schema object
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
    '@id': `${orgData.url}/#organization`,
    name: orgData.name,
    alternateName: orgData.alternateName,
    description: orgData.description,
    url: orgData.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${orgData.url}/#logo`,
      url: orgData.logo,
      contentUrl: orgData.logo,
      caption: `${orgData.name} Logo`,
      inLanguage: 'he-IL',
    },
    image: orgData.image,
    email: orgData.email,
    telephone: orgData.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: orgData.address.streetAddress,
      addressLocality: orgData.address.addressLocality,
      addressRegion: orgData.address.addressRegion,
      postalCode: orgData.address.postalCode,
      addressCountry: orgData.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 32.0717,
      longitude: 34.7891,
    },
    location: [
      {
        '@type': 'Place',
        name: 'WeCcelerate Tel Aviv',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'רחוב הרכבת 58',
          addressLocality: 'תל אביב',
          addressCountry: 'IL',
        },
      },
      {
        '@type': 'Place',
        name: 'WeCcelerate Jerusalem',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'סניף ירושלים',
          addressLocality: 'ירושלים',
          addressCountry: 'IL',
        },
      },
    ],
    foundingDate: orgData.foundingDate,
    sameAs: orgData.sameAs,
    slogan: orgData.slogan,
    knowsAbout: orgData.knowsAbout,
    areaServed: orgData.areaServed,
    priceRange: '₪₪₪',
    currenciesAccepted: 'ILS, USD, EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };

  // Add founders if available
  if (orgData.founders && orgData.founders.length > 0) {
    schema.founder = orgData.founders.map((founder) => ({
      '@type': 'Person',
      name: founder.name,
      jobTitle: founder.jobTitle,
      url: founder.url,
    }));
  }

  // Add number of employees
  if (orgData.numberOfEmployees) {
    schema.numberOfEmployees = orgData.numberOfEmployees;
  }

  // Add member organizations
  schema.memberOf = MEMBER_ORGANIZATIONS;

  // =========================================================================
  // CRUCIAL: Add Leumit as parent/affiliate organization for medical trust
  // =========================================================================
  if (includeLeumitAffiliation) {
    // Use 'parentOrganization' for strongest connection
    schema.parentOrganization = LEUMIT_ORGANIZATION;
    
    // Also add as 'sponsor' and 'funder' for additional signals
    schema.sponsor = LEUMIT_ORGANIZATION;
    
    // Add specific healthcare credentials
    schema.hasCredential = [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Healthcare Business Partner',
        recognizedBy: LEUMIT_ORGANIZATION,
      },
    ];

    // For Leumit variant, enhance the affiliation
    if (variant === 'leumit') {
      schema.department = {
        '@type': 'Organization',
        name: 'WeCcelerate - Leumit HealthTech Innovation',
        description: 'מרכז החדשנות של לאומית וWeCcelerate לקידום סטארטאפים בתחום הבריאות',
        parentOrganization: LEUMIT_ORGANIZATION,
      };
    }
  }

  // Add awards/recognitions
  schema.award = [
    'Top 10 Israeli Business Accelerators 2024',
    'HealthTech Innovation Partner - Leumit 2023',
  ];

  // Contact points
  schema.contactPoint = [
    {
      '@type': 'ContactPoint',
      telephone: orgData.telephone,
      contactType: 'customer service',
      availableLanguage: ['Hebrew', 'English'],
      areaServed: 'IL',
    },
    {
      '@type': 'ContactPoint',
      email: orgData.email,
      contactType: 'sales',
      availableLanguage: ['Hebrew', 'English'],
    },
  ];

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}

// =============================================================================
// LEUMIT-SPECIFIC ORGANIZATION SCHEMA
// =============================================================================

export function LeumitPartnerSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': 'https://weccelerate.co.il/leumit/#organization',
    name: 'WeCcelerate - Leumit HealthTech Innovation Center',
    alternateName: 'מרכז החדשנות לאומית-וויקסלרייט',
    description: 'שותפות אסטרטגית בין קופת חולים לאומית לבין WeCcelerate לקידום חדשנות בתחום הבריאות הדיגיטלית. אנו מלווים סטארטאפים בתחום HealthTech ו-MedTech מהרעיון ועד לאישור רגולטורי ויישום קליני.',
    url: 'https://weccelerate.co.il/leumit',
    logo: 'https://weccelerate.co.il/images/logos/weccelerate-leumit-logo.png',
    
    // Strong affiliation with Leumit
    parentOrganization: {
      '@type': 'MedicalOrganization',
      '@id': 'https://www.leumit.co.il/#organization',
      name: 'Leumit Health Services',
      alternateName: 'קופת חולים לאומית',
      url: 'https://www.leumit.co.il',
      description: 'קופת חולים לאומית - מובילה בחדשנות רפואית וטכנולוגית עם כ-700,000 מבוטחים',
      logo: 'https://www.leumit.co.il/images/logo.png',
      medicalSpecialty: [
        'Primary Care',
        'Digital Health',
        'Preventive Medicine',
        'Telemedicine',
      ],
    },
    
    // Medical specialties
    medicalSpecialty: [
      {
        '@type': 'MedicalSpecialty',
        name: 'Digital Health Innovation',
      },
      {
        '@type': 'MedicalSpecialty',
        name: 'Medical Device Development',
      },
      {
        '@type': 'MedicalSpecialty',
        name: 'Healthcare Technology',
      },
    ],
    
    // Services
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'HealthTech Acceleration Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'HealthTech Startup Acceleration',
            description: 'תוכנית האצה ייעודית לסטארטאפים בתחום הבריאות',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Clinical Validation Support',
            description: 'ליווי בתהליך הולידציה הקלינית',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Regulatory Pathway Planning',
            description: 'תכנון מסלול רגולטורי - FDA, CE, AMAR',
          },
        },
      ],
    },
    
    // Credentials and certifications
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Strategic Healthcare Partner',
        recognizedBy: {
          '@type': 'MedicalOrganization',
          name: 'Leumit Health Services',
        },
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'HealthTech Innovation Accelerator',
        recognizedBy: {
          '@type': 'GovernmentOrganization',
          name: 'Israel Innovation Authority',
        },
      },
    ],
    
    // Contact
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'מגדל עזריאלי שרונה, קומה 35',
      addressLocality: 'תל אביב',
      addressCountry: 'IL',
    },
    telephone: '+972-55-564-7538',
    email: 'Raz@weccelerate.co.il',
    
    // Social and same as
    sameAs: [
      'https://weccelerate.co.il',
      'https://www.linkedin.com/company/weccelerate',
      'https://www.leumit.co.il/digital-health',
    ],
  };

  return (
    <Script
      id="leumit-partner-schema"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}

export default OrganizationSchema;
