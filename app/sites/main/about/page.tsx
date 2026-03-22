/**
 * WeCcelerate - About Us / מי אנחנו
 *
 * SEO: Organization + Person schemas for E-E-A-T.
 */

import { Metadata } from 'next';
import Script from 'next/script';
import AboutContent from './AboutContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: 'אודות WeCcelerate | וויסלרייט — Venture Builder ומאיץ סטארטאפים',
  description:
    'הכירו את הצוות והחזון של WeCcelerate — חברת Venture Building ישראלית המלווה יזמים מהרעיון ועד להצלחה גלובלית. ייעוץ עסקי, פיתוח מוצר, קניין רוחני וגיוס הון.',
  keywords: [
    'וויסלרייט',
    'WeCcelerate',
    'Venture Builder ישראל',
    'מאיץ סטארטאפים',
    'יזמות טכנולוגית',
    'גיוס הון סטארטאפ',
  ],
  openGraph: {
    title: 'אודות WeCcelerate — הצוות והחזון',
    description:
      'הכירו את השותפים וההנהלה מאחורי מאיץ הסטארטאפים המוביל בישראל.',
    type: 'website',
    locale: 'he_IL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'אודות WeCcelerate — הצוות והחזון',
    description:
      'הכירו את השותפים וההנהלה מאחורי מאיץ הסטארטאפים המוביל בישראל.',
  },
};

// =============================================================================
// TEAM DATA (for JSON-LD only)
// =============================================================================

interface SchemaPerson {
  name: string;
  jobTitle: string;
  image: string;
}

const teamForSchema: SchemaPerson[] = [
  { name: 'Alon Pinchas', jobTitle: 'CEO & Founder', image: '/images/team/alon.jpg' },
  { name: 'Ido Sabag', jobTitle: 'VP & Head of Technology', image: '/images/ido2.png' },
  { name: 'Avraham Hinuch', jobTitle: 'VP of Marketing', image: '/images/team/avraham.jpg' },
  { name: 'Noam Ohayon', jobTitle: 'Head of Business Development', image: '/images/noam2.png' },
  { name: 'Lioz Zohar', jobTitle: 'Head of Strategy', image: '/images/team/lioz.jpg' },
];

// =============================================================================
// JSON-LD SCHEMA
// =============================================================================

function generateAboutPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://weccelerate.co.il/about',
        name: 'אודות WeCcelerate',
        description:
          'WeCcelerate — חברת Venture Building ישראלית. ייעוץ, פיתוח וליווי סטארטאפים.',
        inLanguage: 'he',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://weccelerate.co.il',
          name: 'WeCcelerate',
          url: 'https://weccelerate.co.il',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://weccelerate.co.il/#organization',
        name: 'WeCcelerate',
        alternateName: 'וויסלרייט',
        url: 'https://weccelerate.co.il',
        logo: 'https://weccelerate.co.il/images/logo.svg',
        description:
          'Venture Builder ומאיץ סטארטאפים ישראלי — ליווי יזמים מקצה לקצה בתחומי הטכנולוגיה, הרפואה וההשקעות.',
        sameAs: [
          'https://www.youtube.com/@WeCcelerate.Ltd1',
          'https://www.linkedin.com/company/weccelerate',
          'https://www.facebook.com/weccelerate',
          'https://www.instagram.com/weccelerate',
          'https://www.tiktok.com/@weccelerate',
        ],
        employee: teamForSchema.map((p) => ({
          '@type': 'Person',
          name: p.name,
          jobTitle: p.jobTitle,
          image: `https://weccelerate.co.il${p.image}`,
          worksFor: {
            '@type': 'Organization',
            name: 'WeCcelerate',
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'בית', item: 'https://weccelerate.co.il' },
          { '@type': 'ListItem', position: 2, name: 'אודות', item: 'https://weccelerate.co.il/about' },
        ],
      },
    ],
  };
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AboutPage() {
  return (
    <>
      <Script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateAboutPageSchema()),
        }}
      />
      <AboutContent />
    </>
  );
}
