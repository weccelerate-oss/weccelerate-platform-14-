/**
 * SEO Schema Components
 * 
 * JSON-LD structured data components for GEO (Generative Engine Optimization).
 * These schemas establish WeCcelerate's authority and trustworthiness.
 */

// Organization Schemas
// NOTE: The main OrganizationSchema previously exported here was removed
// 2026-04-24 (duplicate @id + factual errors). Organization JSON-LD is now
// emitted exclusively by components/seo/GeoSchema.tsx in the root layout.
// Only LeumitPartnerSchema remains, used on the /leumit subdomain.
export { LeumitPartnerSchema } from './organization-schema';

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
