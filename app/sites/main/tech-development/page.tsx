import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { TechDevContent } from './TechDevContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'פיתוח טכנולוגי לסטארטאפים | Tech Partner, Not a Dev Shop',
  description:
    'WeCcelerate is your Tech Partner, not a dev shop. MVP Development, CTO-as-a-Service, and Post-MVP Scaling — from idea to production-ready product in Tel Aviv.',
  keywords: [
    'Tech Partner for Startups',
    'MVP Development',
    'CTO Services',
    'CTO as a Service',
    'Post-MVP Scaling',
    'App Development for Startups',
    'Tech Development Israel',
    'פיתוח MVP',
    'שירותי CTO',
    'שותף טכנולוגי לסטארטאפים',
    'פיתוח אפליקציות לסטארטאפים',
    'פיתוח טכנולוגי',
  ],
  path: '/tech-development',
  locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

const techDevSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'בית', item: 'https://weccelerate.co.il' },
        { '@type': 'ListItem', position: 2, name: 'פיתוח טכנולוגי', item: 'https://weccelerate.co.il/tech-development' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://weccelerate.co.il/tech-development/#webpage',
      name: 'פיתוח טכנולוגי לסטארטאפים | Tech Partner',
      description: 'MVP Development, CTO-as-a-Service, and Post-MVP Scaling for startups in Israel.',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '[data-speakable]', 'main p:first-of-type'],
      },
    },
  ],
};

export default function TechDevelopmentPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techDevSchema) }}
      />
      <TechDevContent />
    </>
  );
}
