import { Metadata } from 'next';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { FAQ_CATALOG } from '@/lib/seo/faq-catalog';
import FaqContent from './FaqContent';

export const revalidate = 86400;

export const metadata: Metadata = constructMetadata({
  title: 'שאלות נפוצות | WeCcelerate — הכל על Venture Builder, MedTech, גיוס הון ופיתוח',
  description:
    'תשובות מקיפות על WeCcelerate: מה זה Venture Builder, מסלולי פיתוח, ועדת הלסינקי, תהליך FDA 510(k) ו-CE, השוואה מול אקסלרטורים אחרים ועוד.',
  keywords: [
    'שאלות נפוצות סטארטאפים',
    'Venture Builder FAQ',
    'איך מגייסים הון',
    'ועדת הלסינקי',
    'FDA 510k מדריך',
    'CE marking מדריך',
    'השוואת אקסלרטורים ישראל',
    'WeCcelerate FAQ',
  ],
  path: '/faq',
  locale: 'he',
});

function buildFaqPageSchema(locale: 'he' | 'en' = 'he') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_CONFIG.url}/faq#faqpage`,
    inLanguage: locale === 'he' ? 'he-IL' : 'en-US',
    mainEntity: FAQ_CATALOG.map((faq, index) => ({
      '@type': 'Question',
      '@id': `${SITE_CONFIG.url}/faq#${faq.id}`,
      position: index + 1,
      name: faq.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer[locale],
        inLanguage: locale === 'he' ? 'he-IL' : 'en-US',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
      },
    })),
  };
}

export default function FaqPage() {
  const schema = buildFaqPageSchema('he');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <FaqContent />
    </>
  );
}
