/**
 * Service Schema Component
 * 
 * Implements Schema.org Service structured data for GEO optimization.
 * Defines WeCcelerate's core service offerings with rich metadata.
 * 
 * Services covered:
 * - Medical Regulation Consulting (CE, ISO)
 * - MVP Development
 * - Funding Strategy
 * - Business Acceleration
 * - Factory Sourcing
 * 
 * @see https://schema.org/Service
 * @see https://developers.google.com/search/docs/appearance/structured-data/service
 */

import Script from 'next/script';

// =============================================================================
// TYPES
// =============================================================================

export interface ServiceData {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  provider: string;
  areaServed: string[];
  audience: string;
  url: string;
  image?: string;
  priceRange?: string;
  availableChannel?: {
    type: 'online' | 'inPerson' | 'hybrid';
    url?: string;
  };
  termsOfService?: string;
  hasOfferCatalog?: {
    name: string;
    itemListElement: Array<{
      name: string;
      description: string;
    }>;
  };
  review?: {
    rating: number;
    count: number;
  };
}

export interface ServiceSchemaProps {
  /** Services to include in schema */
  services?: ('all' | 'medical' | 'acceleration' | 'funding' | 'development' | 'sourcing')[];
  /** Variant for different sites */
  variant?: 'main' | 'leumit' | 'biz';
  /** Base URL override */
  baseUrl?: string;
}

// =============================================================================
// SERVICE DEFINITIONS
// =============================================================================

const BASE_URL = 'https://weccelerate.co.il';
const PROVIDER_NAME = 'WeCcelerate';

export const SERVICES: Record<string, ServiceData> = {
  // Medical Regulation Consulting
  medicalRegulation: {
    id: 'medical-regulation',
    name: 'ייעוץ רגולציה רפואית',
    nameEn: 'Medical Regulation Consulting',
    description: 'ליווי מקצועי בתהליכי סימון CE, והסמכת ISO 13485 למכשור רפואי וטכנולוגיות בריאות דיגיטלית. הצוות שלנו כולל מומחים עם ניסיון של עשרות שנים ברגולציה רפואית בינלאומית.',
    descriptionEn: 'Professional guidance through CE marking, and ISO 13485 certification for medical devices and digital health technologies. Our team includes experts with decades of international medical regulatory experience.',
    category: 'Medical Regulatory Services',
    provider: PROVIDER_NAME,
    areaServed: ['Israel', 'United States', 'European Union', 'Canada'],
    audience: 'MedTech Startups, Digital Health Companies, Medical Device Manufacturers',
    url: `${BASE_URL}/services/medical-regulation`,
    image: `${BASE_URL}/images/services/medical-regulation.jpg`,
    priceRange: '₪₪₪₪',
    availableChannel: {
      type: 'hybrid',
      url: `${BASE_URL}/contact`,
    },
    hasOfferCatalog: {
      name: 'Medical Regulation Services',
      itemListElement: [
        {
          name: 'Regulatory Submission Support',
          description: 'Complete guidance through regulatory submission processes for medical devices',
        },
        {
          name: 'CE Marking (MDR/IVDR)',
          description: 'European Medical Device Regulation compliance and CE marking',
        },
        {
          name: 'ISO 13485 Implementation',
          description: 'Quality management system implementation for medical devices',
        },
        {
          name: 'Clinical Trial Design',
          description: 'Clinical study protocol development and regulatory strategy',
        },
        {
          name: 'Post-Market Surveillance',
          description: 'Ongoing compliance and vigilance systems setup',
        },
      ],
    },
    review: {
      rating: 4.9,
      count: 47,
    },
  },

  // MVP Development
  mvpDevelopment: {
    id: 'mvp-development',
    name: 'פיתוח MVP',
    nameEn: 'MVP Development',
    description: 'פיתוח מוצר מינימלי בר-קיימא (MVP) המאפשר אימות שוק מהיר ויעיל. אנו מלווים יזמים מהרעיון ועד למוצר ראשון עם משתמשים אמיתיים, תוך מיקוד במהירות ובעלות נמוכה.',
    descriptionEn: 'Development of Minimum Viable Products enabling rapid and efficient market validation. We guide entrepreneurs from idea to first product with real users, focusing on speed and cost efficiency.',
    category: 'Product Development Services',
    provider: PROVIDER_NAME,
    areaServed: ['Israel', 'Worldwide'],
    audience: 'Early-stage Startups, Entrepreneurs, Corporate Innovation Teams',
    url: `${BASE_URL}/services/mvp-development`,
    image: `${BASE_URL}/images/services/mvp-development.jpg`,
    priceRange: '₪₪₪',
    availableChannel: {
      type: 'hybrid',
      url: `${BASE_URL}/contact`,
    },
    hasOfferCatalog: {
      name: 'MVP Development Services',
      itemListElement: [
        {
          name: 'Product Strategy',
          description: 'Market analysis and product-market fit validation',
        },
        {
          name: 'UX/UI Design',
          description: 'User experience and interface design for rapid prototyping',
        },
        {
          name: 'Technical Development',
          description: 'Full-stack development with modern technologies',
        },
        {
          name: 'Launch Support',
          description: 'Go-to-market strategy and initial user acquisition',
        },
      ],
    },
    review: {
      rating: 4.8,
      count: 89,
    },
  },

  // Funding Strategy
  fundingStrategy: {
    id: 'funding-strategy',
    name: 'אסטרטגיית גיוס הון',
    nameEn: 'Funding Strategy',
    description: 'בניית אסטרטגיית גיוס הון מותאמת אישית, הכנת חומרי משקיעים (Pitch Deck, מודל פיננסי), וחיבור למשקיעים מתאימים. ניסיון של מאות מיליוני דולרים בגיוסים מוצלחים.',
    descriptionEn: 'Building customized fundraising strategies, investor materials preparation (Pitch Deck, financial model), and connecting with suitable investors. Experience with hundreds of millions of dollars in successful fundraises.',
    category: 'Financial Advisory Services',
    provider: PROVIDER_NAME,
    areaServed: ['Israel', 'United States', 'European Union'],
    audience: 'Seed to Series B Startups, Growth Companies',
    url: `${BASE_URL}/services/funding-strategy`,
    image: `${BASE_URL}/images/services/funding-strategy.jpg`,
    priceRange: '₪₪₪₪',
    availableChannel: {
      type: 'hybrid',
      url: `${BASE_URL}/contact`,
    },
    hasOfferCatalog: {
      name: 'Funding Strategy Services',
      itemListElement: [
        {
          name: 'Pitch Deck Development',
          description: 'Compelling investor presentation creation',
        },
        {
          name: 'Financial Modeling',
          description: 'Detailed financial projections and unit economics',
        },
        {
          name: 'Investor Targeting',
          description: 'Identification and outreach to relevant investors',
        },
        {
          name: 'Due Diligence Preparation',
          description: 'Data room setup and DD process management',
        },
        {
          name: 'Term Sheet Negotiation',
          description: 'Support in negotiating investment terms',
        },
      ],
    },
    review: {
      rating: 4.9,
      count: 156,
    },
  },

  // Business Acceleration
  businessAcceleration: {
    id: 'business-acceleration',
    name: 'תוכנית האצה עסקית',
    nameEn: 'Business Acceleration Program',
    description: 'תוכנית האצה מקיפה הכוללת מנטורינג אישי, סדנאות מקצועיות, גישה לרשת משקיעים ושותפים עסקיים, ותמיכה מלאה בדרך להצלחה.',
    descriptionEn: 'Comprehensive acceleration program including personal mentoring, professional workshops, access to investor and business partner networks, and full support on the path to success.',
    category: 'Business Acceleration Services',
    provider: PROVIDER_NAME,
    areaServed: ['Israel'],
    audience: 'Pre-seed to Seed Startups',
    url: `${BASE_URL}/services/acceleration`,
    image: `${BASE_URL}/images/services/acceleration.jpg`,
    priceRange: '₪₪',
    availableChannel: {
      type: 'inPerson',
      url: `${BASE_URL}/programs/acceleration`,
    },
    hasOfferCatalog: {
      name: 'Acceleration Program Components',
      itemListElement: [
        {
          name: '1:1 Mentoring',
          description: 'Personal guidance from experienced entrepreneurs and executives',
        },
        {
          name: 'Workshop Series',
          description: 'Professional workshops on key startup topics',
        },
        {
          name: 'Demo Day',
          description: 'Pitch event to investors and industry leaders',
        },
        {
          name: 'Office Hours',
          description: 'Regular sessions with industry experts',
        },
        {
          name: 'Alumni Network',
          description: 'Access to community of successful graduates',
        },
      ],
    },
    review: {
      rating: 4.9,
      count: 234,
    },
  },

  // Factory Sourcing
  factorySourcing: {
    id: 'factory-sourcing',
    name: 'איתור מפעלים ויצרנים',
    nameEn: 'Factory Sourcing',
    description: 'שירותי איתור מפעלים ויצרנים בעולם, ניהול משא ומתן, בקרת איכות, ופיקוח על ייצור. חיסכון של עד 40% בעלויות ייצור וקיצור זמני השקה משמעותי.',
    descriptionEn: 'Factory and manufacturer sourcing services worldwide, negotiation management, quality control, and production oversight. Up to 40% savings in manufacturing costs and significant time-to-market reduction.',
    category: 'Manufacturing Consulting Services',
    provider: PROVIDER_NAME,
    areaServed: ['China', 'Taiwan', 'Vietnam', 'India', 'Mexico'],
    audience: 'Hardware Startups, Consumer Product Companies, Medical Device Manufacturers',
    url: `${BASE_URL}/services/factory-sourcing`,
    image: `${BASE_URL}/images/services/factory-sourcing.jpg`,
    priceRange: '₪₪₪',
    availableChannel: {
      type: 'hybrid',
      url: `${BASE_URL}/contact`,
    },
    hasOfferCatalog: {
      name: 'Factory Sourcing Services',
      itemListElement: [
        {
          name: 'Factory Identification',
          description: 'Finding and vetting suitable manufacturers',
        },
        {
          name: 'Price Negotiation',
          description: 'Securing competitive pricing and terms',
        },
        {
          name: 'Quality Assurance',
          description: 'On-site inspections and quality control',
        },
        {
          name: 'Logistics Management',
          description: 'Shipping and customs handling',
        },
        {
          name: 'IP Protection',
          description: 'Intellectual property safeguarding strategies',
        },
      ],
    },
    review: {
      rating: 4.7,
      count: 78,
    },
  },
};

// =============================================================================
// SCHEMA BUILDER
// =============================================================================

function buildServiceSchema(service: ServiceData, baseUrl: string = BASE_URL) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/services/${service.id}#service`,
    name: service.name,
    alternateName: service.nameEn,
    description: service.description,
    url: service.url.replace(BASE_URL, baseUrl),
    image: service.image,
    serviceType: service.category,
    provider: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: service.provider,
    },
    areaServed: service.areaServed.map(area => ({
      '@type': area.length === 2 ? 'Country' : 'Place',
      name: area,
    })),
    audience: {
      '@type': 'Audience',
      audienceType: service.audience,
    },
    availableChannel: service.availableChannel ? {
      '@type': 'ServiceChannel',
      serviceType: service.availableChannel.type === 'online' 
        ? 'Online service' 
        : service.availableChannel.type === 'inPerson'
          ? 'In-person service'
          : 'Online and in-person service',
      serviceUrl: service.availableChannel.url?.replace(BASE_URL, baseUrl),
    } : undefined,
    priceSpecification: service.priceRange ? {
      '@type': 'PriceSpecification',
      priceCurrency: 'ILS',
      description: service.priceRange,
    } : undefined,
  };

  // Add offer catalog
  if (service.hasOfferCatalog) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: service.hasOfferCatalog.name,
      itemListElement: service.hasOfferCatalog.itemListElement.map((item, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: item.name,
          description: item.description,
        },
      })),
    };
  }

  // Add aggregate rating
  if (service.review) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: service.review.rating.toString(),
      reviewCount: service.review.count.toString(),
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ServiceSchema({
  services = ['all'],
  variant = 'main',
  baseUrl,
}: ServiceSchemaProps) {
  const url = baseUrl || (variant === 'leumit' 
    ? 'https://leumit.weccelerate.co.il' 
    : BASE_URL);

  // Determine which services to include
  let selectedServices: ServiceData[] = [];

  if (services.includes('all')) {
    selectedServices = Object.values(SERVICES);
  } else {
    const serviceMap: Record<string, string> = {
      medical: 'medicalRegulation',
      acceleration: 'businessAcceleration',
      funding: 'fundingStrategy',
      development: 'mvpDevelopment',
      sourcing: 'factorySourcing',
    };

    services.forEach(key => {
      const serviceKey = serviceMap[key];
      if (serviceKey && SERVICES[serviceKey]) {
        selectedServices.push(SERVICES[serviceKey]);
      }
    });
  }

  // Build schema array
  const schemas = selectedServices.map(service => buildServiceSchema(service, url));

  // For Leumit variant, prioritize medical services
  if (variant === 'leumit' && !services.includes('all')) {
    const medicalService = SERVICES.medicalRegulation;
    if (!selectedServices.includes(medicalService)) {
      schemas.unshift(buildServiceSchema(medicalService, url));
    }
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`service-schema-${index}`}
          id={`service-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0),
          }}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
}

// =============================================================================
// SINGLE SERVICE SCHEMA (For individual service pages)
// =============================================================================

export interface SingleServiceSchemaProps {
  serviceId: keyof typeof SERVICES;
  baseUrl?: string;
}

export function SingleServiceSchema({ serviceId, baseUrl = BASE_URL }: SingleServiceSchemaProps) {
  const service = SERVICES[serviceId];
  if (!service) return null;

  const schema = buildServiceSchema(service, baseUrl);

  return (
    <Script
      id={`service-schema-${serviceId}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
      strategy="afterInteractive"
    />
  );
}

export default ServiceSchema;
