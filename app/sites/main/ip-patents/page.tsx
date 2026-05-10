import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { IpPatentsContent } from './IpPatentsContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'פטנטים וקניין רוחני | IP & Patents',
  description:
    'WeCcelerate IP strategy services: Patent Registration, Prototyping, and comprehensive IP Strategy for startups. Protect your innovation from day one.',
  keywords: [
    'Patent Registration',
    'Patent Registration Israel',
    'IP Strategy',
    'IP Strategy for Startups',
    'Prototyping',
    'Intellectual Property',
    'רישום פטנטים',
    'רישום פטנט בישראל',
    'אסטרטגיית IP',
    'קניין רוחני',
    'אב טיפוס',
    'הגנה על רעיונות',
  ],
  path: '/ip-patents',
  locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

const ipSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'בית', item: 'https://weccelerate.co.il' },
        { '@type': 'ListItem', position: 2, name: 'פטנטים וקניין רוחני', item: 'https://weccelerate.co.il/ip-patents' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://weccelerate.co.il/ip-patents/#webpage',
      name: 'פטנטים וקניין רוחני | IP & Patents',
      description: 'Patent Registration, Prototyping, and IP Strategy for startups. Protect your innovation from day one.',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '[data-speakable]', 'main p:first-of-type'],
      },
    },
  ],
};

export default function IPPatentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ipSchema) }}
      />
      <IpPatentsContent />
    </>
  );
}
