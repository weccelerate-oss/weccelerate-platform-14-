import { Metadata } from 'next';
import Script from 'next/script';
import { constructMetadata } from '@/lib/seo';
import { InvestorsContent } from './InvestorsContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'משקיעים וגיוס הון | Investors & Fundraising',
  description:
    'WeCcelerate connects startups with Angel Investors, VCs, and strategic partners. Pitch Deck preparation, fundraising strategy, and investor matching in Israel.',
  keywords: [
    'Fundraising',
    'Fundraising Israel',
    'Pitch Deck',
    'Pitch Deck Preparation',
    'Angel Investors',
    'Angel Investors Israel',
    'Venture Capital Israel',
    'Startup Funding',
    'Seed Round',
    'גיוס הון',
    'גיוס הון לסטארטאפ',
    'מצגת משקיעים',
    'משקיעי אנג\'ל',
    'הון סיכון',
    'סבב סיד',
  ],
  path: '/investors',
  locale: 'he',
});

// =============================================================================
// PAGE
// =============================================================================

const investorsSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'בית', item: 'https://weccelerate.co.il' },
        { '@type': 'ListItem', position: 2, name: 'משקיעים וגיוס הון', item: 'https://weccelerate.co.il/investors' },
      ],
    },
    {
      '@type': 'WebPage',
      '@id': 'https://weccelerate.co.il/investors/#webpage',
      name: 'משקיעים וגיוס הון | Investors & Fundraising',
      description: 'WeCcelerate connects startups with Angel Investors, VCs, and strategic partners.',
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '[data-speakable]', 'main p:first-of-type'],
      },
    },
  ],
};

export default function InvestorsPage() {
  return (
    <>
      <Script
        id="investors-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(investorsSchema) }}
      />
      <InvestorsContent />
    </>
  );
}
