import { Metadata } from 'next';
import Script from 'next/script';
import { constructMetadata } from '@/lib/seo';
import { MedTechPageContent } from './MedTechPageContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'מסלול MedTech | Medical Accelerator',
  description:
    'WeCcelerate Medical Accelerator — the exclusive MedTech track in partnership with Leumit Health Care. Expert medical opinions, full regulatory support, and market research for early-stage healthcare startups.',
  keywords: [
    'Medical Accelerator',
    'Medical Accelerator Israel',
    'Leumit Partnership',
    'MedTech Accelerator',
    'Healthcare Startup Israel',
    'מאיץ רפואי',
    'שותפות לאומית',
    'סטארטאפ רפואי',
    'ליווי רגולטורי',
    'חוות דעת רפואיות',
  ],
  path: '/medtech',
  locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

const medtechSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'בית', item: 'https://weccelerate.co.il' },
        { '@type': 'ListItem', position: 2, name: 'מסלול MedTech', item: 'https://weccelerate.co.il/medtech' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://weccelerate.co.il/medtech/#webpage',
      name: 'מסלול MedTech | Medical Accelerator',
      description: 'WeCcelerate Medical Accelerator — the exclusive MedTech track in partnership with Leumit Health Care.',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '[data-speakable]', 'main p:first-of-type'],
      },
    },
    {
      '@type': 'MedicalOrganization',
      name: 'WeCcelerate MedTech Accelerator',
      description: 'Medical startup accelerator in partnership with Leumit Health Services, offering expert physician opinions, regulatory guidance, and clinical pilot programs.',
      parentOrganization: {
        '@type': 'HealthcareOrganization',
        name: 'Leumit Health Services',
        alternateName: 'לאומית שירותי בריאות',
        url: 'https://www.leumit.co.il',
      },
      areaServed: { '@type': 'Country', name: 'Israel' },
    },
  ],
};

export default function MedTechPage() {
  return (
    <>
      <Script
        id="medtech-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medtechSchema) }}
      />
      <MedTechPageContent />
    </>
  );
}
