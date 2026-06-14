import { Metadata } from 'next';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import ComparisonsContent from './ComparisonsContent';

export const revalidate = 86400;

// =============================================================================
// COMPARISONS PAGE — WeCcelerate vs Israeli Accelerator Ecosystem
// =============================================================================
// Comparative-intent queries ("X vs Y") have very high commercial intent —
// users at the bottom of the funnel choosing between options. Owning the
// canonical comparison page for each competitor pair is a direct CRO play.
//
// Schema strategy: emit ItemList of ComparisonReview-style entries, plus
// FAQPage with a Q for each competitor. Both surface in Google AI Overviews
// for "WeCcelerate vs X" queries.
//
// SEO metadata + JSON-LD below stay in Hebrew (default/server locale). The
// rendered UI lives in <ComparisonsContent /> and switches He/En at runtime.
// =============================================================================

interface SchemaCompetitor {
  id: string;
  name: string;
  /** Where WeCcelerate beats them (Hebrew — server-rendered for FAQ schema). */
  weccelerateAdvantage: string;
}

const COMPETITORS: SchemaCompetitor[] = [
  {
    id: '8200-eisp',
    name: '8200 EISP',
    weccelerateAdvantage:
      'WeCcelerate פתוח לכל יזם ללא קשר לרקע, מתפקד כ-Venture Builder מלא עם צוות אופרטיבי, ומתמחה ב-MedTech דרך השותפות הבלעדית עם לאומית.',
  },
  {
    id: 'the-junction',
    name: 'The Junction (F2 Capital)',
    weccelerateAdvantage:
      'WeCcelerate מספקת מעורבות אופרטיבית עמוקה בהרבה — צוות פיתוח מלא, ייעוץ עסקי, מסלול MedTech בלעדי. The Junction = מנטורינג; WeCcelerate = co-founding.',
  },
  {
    id: 'masschallenge-israel',
    name: 'MassChallenge Israel',
    weccelerateAdvantage:
      'WeCcelerate ארוך-טווח (לא 4 חודשים), עם צוות אופרטיבי ייעודי. למיזמי MedTech ספציפית — שותפות לאומית עוקפת את ה-MassChallenge generic ב-200%.',
  },
  {
    id: 'google-startups',
    name: 'Google for Startups Campus Tel Aviv',
    weccelerateAdvantage:
      'Google Campus = community space. WeCcelerate = full venture-building service. אם אתה יזם שצריך *שירותים בפועל* (פיתוח, שיווק, גיוס), Google Campus לא יספק זאת.',
  },
  {
    id: 'techstars-tel-aviv',
    name: 'Techstars Tel Aviv',
    weccelerateAdvantage:
      'Techstars לוקחים אקוויטי גבוה (6%) על תמיכה לטווח קצר. WeCcelerate Equity-for-Services נמשך חודשים-שנים ומספק יותר ערך פר-אקוויטי.',
  },
  {
    id: 'pitango-first',
    name: 'Pitango First',
    weccelerateAdvantage:
      'Pitango First ממוקדים בעצמם — אם לא תקבל מהם Series A, נשארת בלי הפנייה. WeCcelerate מחברת ל-רשת משקיעים, יזמים ושותפים אסטרטגיים, לא רק קרן אחת.',
  },
];

export const metadata: Metadata = constructMetadata({
  title: 'WeCcelerate vs מאיצי סטארטאפים בישראל: השוואה מלאה 2026',
  description:
    'השוואה מקיפה בין WeCcelerate ל-8200 EISP, The Junction, MassChallenge ישראל, Techstars, Pitango First, Google for Startups. מודל, אקוויטי, משך, יתרונות וחסרונות — כדי שתבחר נכון.',
  keywords: [
    'WeCcelerate vs 8200 EISP',
    'WeCcelerate השוואה',
    'מאיצי סטארטאפים השוואה',
    'איזה אקסלרטור לבחור',
    'The Junction vs WeCcelerate',
    'MassChallenge Israel comparison',
    'Israeli accelerator comparison',
    'best startup accelerator Israel',
    'Venture Builder vs Accelerator',
  ],
  path: '/comparisons',
  locale: 'he',
});

function buildComparisonsSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${SITE_CONFIG.url}/comparisons#article`,
        headline: 'WeCcelerate vs מאיצי סטארטאפים בישראל — השוואה מלאה',
        description:
          'השוואה מפורטת בין WeCcelerate למאיצי סטארטאפים בישראל. מודל, אקוויטי, יתרונות ייחודיים.',
        url: `${SITE_CONFIG.url}/comparisons`,
        inLanguage: 'he-IL',
        datePublished: '2026-04-23T00:00:00+03:00',
        dateModified: '2026-04-23T00:00:00+03:00',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
        publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
        about: { '@type': 'Thing', name: 'Israeli accelerator ecosystem' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_CONFIG.url}/comparisons` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_CONFIG.url}/comparisons#faq`,
        inLanguage: 'he-IL',
        mainEntity: COMPETITORS.map((c, i) => ({
          '@type': 'Question',
          '@id': `${SITE_CONFIG.url}/comparisons#${c.id}`,
          position: i + 1,
          name: `מה ההבדל בין WeCcelerate ל-${c.name}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: c.weccelerateAdvantage,
            inLanguage: 'he-IL',
            author: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/comparisons#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'השוואות',
            item: `${SITE_CONFIG.url}/comparisons`,
          },
        ],
      },
    ],
  };
}

export default function ComparisonsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildComparisonsSchema()) }}
      />
      <ComparisonsContent />
    </>
  );
}
