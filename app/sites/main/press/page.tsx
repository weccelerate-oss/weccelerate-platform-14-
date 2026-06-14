import { Metadata } from 'next';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  PRESS_MENTIONS,
  OUTLET_METADATA,
  sortPressDescending,
} from '@/lib/seo/press-catalog';
import PressContent from './PressContent';

export const revalidate = 86400;

export const metadata: Metadata = constructMetadata({
  title: 'WeCcelerate בתקשורת — שותפויות, פרסומים ואזכורים',
  description:
    'אזכורי WeCcelerate בתקשורת: כלכליסט, גלובס, TheMarker, Geektime, Ynet, TechCrunch. שותפויות עם לאומית שירותי בריאות, רשות החדשנות, Start-Up Nation Central.',
  keywords: [
    'WeCcelerate בתקשורת',
    'וויסלרייט כלכליסט',
    'WeCcelerate press',
    'WeCcelerate partnerships',
    'WeCcelerate awards',
    'Venture Builder Israel news',
  ],
  path: '/press',
  locale: 'he',
});

function buildPressCollectionSchema() {
  const mentions = sortPressDescending(PRESS_MENTIONS);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_CONFIG.url}/press#collection`,
    name: 'WeCcelerate בתקשורת',
    description:
      'אוסף אזכורים, שותפויות ופרסומים רשמיים של WeCcelerate במדיה הישראלית והבינלאומית.',
    url: `${SITE_CONFIG.url}/press`,
    inLanguage: 'he-IL',
    isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
    publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
    hasPart: mentions
      .filter((m) => m.url)
      .map((m) => {
        const outlet = OUTLET_METADATA[m.outlet];
        return {
          '@type': 'NewsArticle',
          headline: m.title,
          url: m.url,
          datePublished: m.date,
          inLanguage: m.language === 'he' ? 'he-IL' : 'en-US',
          author: outlet
            ? {
                '@type': 'Organization',
                name: outlet.name,
                url: outlet.url,
                ...(outlet.sameAs && { sameAs: outlet.sameAs }),
              }
            : undefined,
          publisher: outlet ? { '@type': 'Organization', name: outlet.name, url: outlet.url } : undefined,
          about: { '@id': `${SITE_CONFIG.url}/#organization` },
          ...(m.excerpt && { description: m.excerpt }),
        };
      }),
  };
}

function buildOrganizationAuthoritySchema() {
  const mentions = sortPressDescending(PRESS_MENTIONS);
  const subjectOf = mentions
    .filter((m) => m.url && m.category !== 'announcement')
    .slice(0, 10)
    .map((m) => ({
      '@type': 'CreativeWork',
      headline: m.title,
      url: m.url,
      datePublished: m.date,
    }));

  const memberships = mentions
    .filter((m) => m.category === 'announcement' || m.category === 'award')
    .map((m) => OUTLET_METADATA[m.outlet])
    .filter((o) => Boolean(o))
    .map((o) => ({
      '@type': 'Organization',
      name: o.name,
      url: o.url,
      ...(o.sameAs && { sameAs: o.sameAs }),
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization-authority`,
    name: 'WeCcelerate',
    url: SITE_CONFIG.url,
    ...(subjectOf.length > 0 && { subjectOf }),
    ...(memberships.length > 0 && { memberOf: memberships }),
  };
}

export default function PressPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPressCollectionSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationAuthoritySchema()) }}
      />

      <PressContent />
    </>
  );
}
