/**
 * Service Schema Component
 * 
 * Implements JSON-LD Service schema for WeCcelerate's core services.
 * Optimized for GEO (Generative Engine Optimization) to establish expertise.
 * 
 * Core Services:
 * 1. Medical Regulation Consulting (FDA, CE, ISO 13485)
 * 2. MVP Development & Product Strategy
 * 3. Funding Strategy & Investor Relations
 * 4. Factory Sourcing & Manufacturing
 * 
 * @see https://schema.org/Service
 * @see https://schema.org/ProfessionalService
 */

import Script from 'next/script';

// =============================================================================
// TYPES
// =============================================================================

export interface ServiceSchemaProps {
  /** Which services to include */
  services?: ('medical' | 'mvp' | 'funding' | 'factory' | 'all')[];
  /** Site variant for customization */
  site?: 'main' | 'leumit' | 'biz';
  /** Include aggregate rating */
  includeRating?: boolean;
}

interface ServiceData {
  '@type': string | string[];
  '@id': string;
  name: string;
  alternateName?: string[];
  description: string;
  provider: {
    '@id': string;
  };
  serviceType: string;
  areaServed: unknown;
  hasOfferCatalog?: unknown;
  audience?: unknown;
  serviceOutput?: string;
  termsOfService?: string;
  availableChannel?: unknown;
  category?: string;
  additionalType?: string;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
}

// =============================================================================
// SERVICE DATA
// =============================================================================

const PROVIDER_REF = {
  '@id': 'https://weccelerate.co.il/#organization',
};

const AREA_SERVED = [
  {
    '@type': 'Country',
    name: 'Israel',
  },
  {
    '@type': 'AdministrativeArea',
    name: 'Middle East',
  },
  {
    '@type': 'AdministrativeArea',
    name: 'Europe',
  },
  {
    '@type': 'AdministrativeArea',
    name: 'United States',
  },
];

// Medical Regulation Consulting Service
const MEDICAL_REGULATION_SERVICE: ServiceData = {
  '@type': ['Service', 'ProfessionalService'],
  '@id': 'https://weccelerate.co.il/services/medical-regulation/#service',
  name: 'Medical Device Regulation Consulting',
  alternateName: [
    'ייעוץ רגולציה למכשור רפואי',
    'FDA Consulting Israel',
    'CE Marking Consulting',
    'Medical Device Regulatory Affairs',
  ],
  description: 'Comprehensive medical device regulatory consulting services including FDA 510(k) submissions, CE marking, ISO 13485 certification, and Israeli AMAR registration. Expert guidance through the entire regulatory pathway from concept to market approval.',
  provider: PROVIDER_REF,
  serviceType: 'Regulatory Affairs Consulting',
  category: 'Medical Device Consulting',
  additionalType: 'https://schema.org/MedicalBusiness',
  areaServed: AREA_SERVED,
  audience: {
    '@type': 'Audience',
    audienceType: 'MedTech Startups and Medical Device Companies',
    geographicArea: {
      '@type': 'Country',
      name: 'Israel',
    },
  },
  serviceOutput: 'Regulatory submission packages, certification support, compliance documentation',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Medical Regulation Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'FDA 510(k) Submission Support',
          description: 'Complete support for FDA 510(k) premarket notification submissions including predicate device selection, substantial equivalence documentation, and FDA correspondence management.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'CE Marking & MDR Compliance',
          description: 'EU Medical Device Regulation (MDR) compliance, CE marking certification, technical documentation preparation, and notified body coordination.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'ISO 13485 Implementation',
          description: 'Quality Management System implementation and certification support for ISO 13485:2016 medical device manufacturing standard.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AMAR Registration (Israel)',
          description: 'Israeli Ministry of Health AMAR registration for medical devices, including documentation and submission support.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Clinical Trial Design & Support',
          description: 'Clinical study design, protocol development, IRB submissions, and regulatory strategy for medical device clinical validation.',
        },
      },
    ],
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceType: 'In-person and Remote Consulting',
    availableLanguage: ['Hebrew', 'English'],
    serviceLocation: {
      '@type': 'Place',
      name: 'WeCcelerate Tel Aviv Office',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Tel Aviv',
        addressCountry: 'IL',
      },
    },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 4.9,
    reviewCount: 47,
    bestRating: 5,
    worstRating: 1,
  },
};

// MVP Development Service
const MVP_DEVELOPMENT_SERVICE: ServiceData = {
  '@type': ['Service', 'ProfessionalService'],
  '@id': 'https://weccelerate.co.il/services/mvp-development/#service',
  name: 'MVP Development & Product Strategy',
  alternateName: [
    'פיתוח MVP',
    'Product Development Consulting',
    'Startup Product Strategy',
    'Minimum Viable Product Development',
  ],
  description: 'End-to-end MVP development services from concept validation to market-ready product. Includes product strategy, UX/UI design, technical architecture, and agile development support for startups and innovation teams.',
  provider: PROVIDER_REF,
  serviceType: 'Product Development Consulting',
  category: 'Technology Consulting',
  areaServed: AREA_SERVED,
  audience: {
    '@type': 'Audience',
    audienceType: 'Startups, Entrepreneurs, and Corporate Innovation Teams',
  },
  serviceOutput: 'Validated MVP, Product roadmap, Technical specifications',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'MVP Development Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Concept Validation & Market Research',
          description: 'Customer discovery, market analysis, competitive landscape mapping, and value proposition validation.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Product Strategy & Roadmapping',
          description: 'Product vision definition, feature prioritization, and development roadmap creation aligned with business goals.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'UX/UI Design & Prototyping',
          description: 'User experience research, interface design, interactive prototypes, and usability testing.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Technical Architecture & Development',
          description: 'Technology stack selection, system architecture design, and MVP development with quality assurance.',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 4.8,
    reviewCount: 63,
    bestRating: 5,
    worstRating: 1,
  },
};

// Funding Strategy Service
const FUNDING_STRATEGY_SERVICE: ServiceData = {
  '@type': ['Service', 'ProfessionalService', 'FinancialService'],
  '@id': 'https://weccelerate.co.il/services/funding-strategy/#service',
  name: 'Funding Strategy & Investor Relations',
  alternateName: [
    'אסטרטגיית גיוס הון',
    'Startup Fundraising Support',
    'Investor Relations Consulting',
    'Seed Funding Strategy',
    'Series A Preparation',
  ],
  description: 'Strategic fundraising support from seed to Series A and beyond. Includes investor targeting, pitch deck development, financial modeling, due diligence preparation, and negotiation support. Access to our network of 200+ investors.',
  provider: PROVIDER_REF,
  serviceType: 'Financial Consulting',
  category: 'Investment & Fundraising',
  areaServed: AREA_SERVED,
  audience: {
    '@type': 'Audience',
    audienceType: 'Startups seeking funding from Seed to Series B',
  },
  serviceOutput: 'Funding secured, Investor relationships, Valuation optimization',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Funding Strategy Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fundraising Strategy Development',
          description: 'Investment thesis development, funding timeline planning, and investor targeting strategy.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Pitch Deck & Materials Development',
          description: 'Compelling pitch deck creation, executive summary, financial projections, and supporting documentation.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Investor Introductions & Networking',
          description: 'Warm introductions to relevant investors, VCs, and angels from our network of 200+ active investors.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Due Diligence & Negotiation Support',
          description: 'Due diligence preparation, term sheet review, valuation guidance, and negotiation coaching.',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 4.9,
    reviewCount: 89,
    bestRating: 5,
    worstRating: 1,
  },
};

// Factory Sourcing Service
const FACTORY_SOURCING_SERVICE: ServiceData = {
  '@type': ['Service', 'ProfessionalService'],
  '@id': 'https://weccelerate.co.il/services/factory-sourcing/#service',
  name: 'Factory Sourcing & Manufacturing',
  alternateName: [
    'איתור מפעלים',
    'China Manufacturing Consulting',
    'Product Manufacturing Support',
    'Supply Chain Consulting',
  ],
  description: 'End-to-end manufacturing sourcing services specializing in China and Asia. Factory identification, qualification, negotiation, quality assurance, and ongoing supplier management. Reduce time-to-market by 50% and costs by 30-40%.',
  provider: PROVIDER_REF,
  serviceType: 'Manufacturing Consulting',
  category: 'Supply Chain & Operations',
  areaServed: AREA_SERVED,
  audience: {
    '@type': 'Audience',
    audienceType: 'Product companies seeking manufacturing partners',
  },
  serviceOutput: 'Qualified manufacturing partners, Cost reduction, Quality assurance',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Factory Sourcing Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Factory Identification & Qualification',
          description: 'Comprehensive factory search, capability assessment, site audits, and qualification based on your specific requirements.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Supplier Negotiation & Contracts',
          description: 'Price negotiation, contract development, MOQ optimization, and payment terms structuring.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Quality Assurance & Inspection',
          description: 'Quality management system setup, inspection protocols, and ongoing quality monitoring.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Production Management',
          description: 'Production scheduling, inventory management, and logistics coordination.',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: 4.7,
    reviewCount: 34,
    bestRating: 5,
    worstRating: 1,
  },
};

// =============================================================================
// SERVICE MAPPING
// =============================================================================

const SERVICE_MAP = {
  medical: MEDICAL_REGULATION_SERVICE,
  mvp: MVP_DEVELOPMENT_SERVICE,
  funding: FUNDING_STRATEGY_SERVICE,
  factory: FACTORY_SOURCING_SERVICE,
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ServiceSchema({
  services = ['all'],
  site = 'main',
  includeRating = true,
}: ServiceSchemaProps) {
  // Determine which services to include
  let selectedServices: ServiceData[];
  
  if (services.includes('all')) {
    selectedServices = Object.values(SERVICE_MAP);
  } else {
    selectedServices = services
      .filter((s): s is keyof typeof SERVICE_MAP => s in SERVICE_MAP)
      .map((s) => SERVICE_MAP[s]);
  }

  // Remove ratings if not requested
  if (!includeRating) {
    selectedServices = selectedServices.map((service) => {
      const { aggregateRating, ...rest } = service;
      return rest as ServiceData;
    });
  }

  // Site-specific modifications
  if (site === 'leumit') {
    // Prioritize medical service for Leumit
    selectedServices = selectedServices.sort((a, b) => {
      if (a['@id'].includes('medical')) return -1;
      if (b['@id'].includes('medical')) return 1;
      return 0;
    });
  }

  // Build the schema
  const schema = {
    '@context': 'https://schema.org',
    '@graph': selectedServices.map((service) => ({
      '@context': 'https://schema.org',
      ...service,
    })),
  };

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}

// =============================================================================
// INDIVIDUAL SERVICE SCHEMAS
// =============================================================================

export function MedicalRegulationServiceSchema() {
  return (
    <Script
      id="medical-service-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...MEDICAL_REGULATION_SERVICE,
        }, null, 0),
      }}
    />
  );
}

export function FundingServiceSchema() {
  return (
    <Script
      id="funding-service-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...FUNDING_STRATEGY_SERVICE,
        }, null, 0),
      }}
    />
  );
}

export default ServiceSchema;
