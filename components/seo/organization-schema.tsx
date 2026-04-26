/**
 * Leumit Partnership Schema
 *
 * ⚠️  HISTORY (2026-04-24): The former OrganizationSchema emitted from this
 * file contained factual errors (wrong founder last-name, wrong foundingDate,
 * fake LinkedIn URL, fabricated awards, wrong geo coordinates, typo in
 * Hebrew brand name, unverified social profiles, and a duplicate `@id`
 * conflicting with GeoSchema). It was **removed entirely**. The canonical
 * Organization schema now comes exclusively from
 * `components/seo/GeoSchema.tsx` (rendered in `app/layout.tsx`).
 *
 * This file now exports only `LeumitPartnerSchema`, which emits a
 * `MedicalOrganization` node with a DIFFERENT `@id`
 * (`.../leumit/#organization`) used on the /leumit subdomain. No conflict.
 *
 * @see https://schema.org/MedicalOrganization
 */

import Script from 'next/script';

// =============================================================================
// LEUMIT-SPECIFIC ORGANIZATION SCHEMA
// =============================================================================

export function LeumitPartnerSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': 'https://weccelerate.co.il/leumit/#organization',
    name: 'WeCcelerate - Leumit HealthTech Innovation Center',
    alternateName: 'מרכז החדשנות לאומית-וויסלרייט',
    description:
      'שותפות אסטרטגית בין קופת חולים לאומית לבין WeCcelerate לקידום חדשנות בתחום הבריאות הדיגיטלית. אנו מלווים סטארטאפים בתחום HealthTech ו-MedTech מהרעיון ועד לאישור רגולטורי ויישום קליני.',
    url: 'https://weccelerate.co.il/leumit',
    logo: 'https://weccelerate.co.il/images/logos/weccelerate-leumit-logo.png',

    // Strong affiliation with Leumit
    parentOrganization: {
      '@type': 'MedicalOrganization',
      '@id': 'https://www.leumit.co.il/#organization',
      name: 'Leumit Health Services',
      alternateName: 'קופת חולים לאומית',
      url: 'https://www.leumit.co.il',
      description:
        'קופת חולים לאומית - מובילה בחדשנות רפואית וטכנולוגית עם כ-700,000 מבוטחים',
      logo: 'https://www.leumit.co.il/images/logo.png',
      medicalSpecialty: ['Primary Care', 'Digital Health', 'Preventive Medicine', 'Telemedicine'],
    },

    // Medical specialties
    medicalSpecialty: [
      { '@type': 'MedicalSpecialty', name: 'Digital Health Innovation' },
      { '@type': 'MedicalSpecialty', name: 'Medical Device Development' },
      { '@type': 'MedicalSpecialty', name: 'HealthTech Regulation' },
      { '@type': 'MedicalSpecialty', name: 'Clinical Trials' },
    ],

    // Services
    availableService: [
      {
        '@type': 'MedicalTherapy',
        name: 'Medical Device Regulatory Consulting',
        description: 'FDA, CE, ISO 13485 compliance for medical devices',
      },
      {
        '@type': 'MedicalProcedure',
        name: 'Clinical Trial Support',
        description: 'Design and execution of clinical trials for medical devices',
      },
    ],

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
