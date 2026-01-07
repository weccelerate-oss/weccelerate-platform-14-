/**
 * SEO Schema Components
 * 
 * JSON-LD structured data components for GEO (Generative Engine Optimization).
 * These schemas establish WeCcelerate's authority and trustworthiness.
 */

// Organization Schemas
export {
  OrganizationSchema,
  LeumitPartnerSchema,
  type OrganizationSchemaProps,
} from './organization-schema';

// Service Schemas
export {
  ServiceSchema,
  MedicalRegulationServiceSchema,
  FundingServiceSchema,
  type ServiceSchemaProps,
} from './service-schema';

// FAQ Schemas
export {
  FAQSchema,
  FAQSection,
  MedicalRegulationFAQ,
  FundingFAQ,
  LeumitFAQ,
  DEFAULT_FAQS,
  type FAQItem,
  type FAQSchemaProps,
} from './faq-schema';
