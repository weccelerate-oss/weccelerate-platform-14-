import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { TechDevContent } from './TechDevContent';
import { LeadFormSection } from '@/components/forms/LeadFormSection';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'פיתוח טכנולוגי לסטארטאפים | Tech Partner, Not a Dev Shop',
  description:
    'פיתוח טכנולוגי לסטארטאפים עם WeCcelerate (וויסלרייט): שותף טכנולוגי ולא בית תוכנה. אפיון, פיתוח MVP, CTO as a Service וליווי עד מוצר מוכן לשוק. שיחת היכרות חינם.',
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
      <LeadFormSection formType="page_cta" service="digital-product" />
    </>
  );
}
