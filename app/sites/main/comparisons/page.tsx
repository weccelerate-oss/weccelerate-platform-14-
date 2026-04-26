import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';

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
// =============================================================================

interface Competitor {
  id: string;
  name: string;
  nameHe: string;
  type: 'accelerator' | 'incubator' | 'community' | 'venture-builder';
  url?: string;
  /** 1-3 sentence what they are. */
  what: string;
  /** Equity model — what they take. */
  equity: string;
  /** Duration / engagement model. */
  duration: string;
  /** Strongest aspect. */
  strength: string;
  /** Where WeCcelerate beats them. */
  weccelerateAdvantage: string;
}

const COMPETITORS: Competitor[] = [
  {
    id: '8200-eisp',
    name: '8200 EISP',
    nameHe: '8200 EISP',
    type: 'accelerator',
    url: 'https://www.startau.tau.ac.il/programs/8200-entrepreneurship-and-innovation-support-program',
    what: 'מאיץ מבוסס-אלומני לבוגרי יחידה 8200 של צה"ל, מופעל ע"י StarTAU. ממוקד ב-cybersecurity ו-B2B enterprise.',
    equity: 'ללא אקוויטי (חינם)',
    duration: '6 חודשים, מבוסס-מנטורינג',
    strength: 'רשת בוגרי 8200 — אחת הרשתות החזקות ביותר בעולם הסייבר.',
    weccelerateAdvantage:
      'WeCcelerate פתוח לכל יזם ללא קשר לרקע, מתפקד כ-Venture Builder מלא עם צוות אופרטיבי, ומתמחה ב-MedTech דרך השותפות הבלעדית עם לאומית.',
  },
  {
    id: 'the-junction',
    name: 'The Junction (F2 Capital)',
    nameHe: 'The Junction',
    type: 'accelerator',
    url: 'https://www.thejunction.tech',
    what: 'מאיץ B2B ללא אקוויטי של קרן F2 Capital. מיועד לסטארטאפים B2B בשלב מוקדם (pre-seed).',
    equity: 'ללא אקוויטי, אך F2 Capital מקבלים זכות השקעה ראשונה',
    duration: '3-4 חודשים מחזור',
    strength: 'מפותח ע"י VC, חיבור ישיר ל-F2 Capital כמשקיע פוטנציאלי.',
    weccelerateAdvantage:
      'WeCcelerate מספקת מעורבות אופרטיבית עמוקה בהרבה — צוות פיתוח מלא, ייעוץ עסקי, מסלול MedTech בלעדי. The Junction = מנטורינג; WeCcelerate = co-founding.',
  },
  {
    id: 'masschallenge-israel',
    name: 'MassChallenge Israel',
    nameHe: 'MassChallenge ישראל',
    type: 'accelerator',
    url: 'https://masschallenge.org/programs/israel',
    what: 'מזרע של MassChallenge האמריקאי. אקסלרטור חוצה-תחומים ללא אקוויטי, פתוח לכל ה-verticals.',
    equity: 'ללא אקוויטי',
    duration: '4 חודשים, כולל Demo Day עם פרסים עד $1M',
    strength: 'רשת גלובלית של 3,000+ חברי פורטפוליו, פרס בולט ב-Demo Day.',
    weccelerateAdvantage:
      'WeCcelerate ארוך-טווח (לא 4 חודשים), עם צוות אופרטיבי ייעודי. למיזמי MedTech ספציפית — שותפות לאומית עוקפת את ה-MassChallenge generic ב-200%.',
  },
  {
    id: 'google-startups',
    name: 'Google for Startups Campus Tel Aviv',
    nameHe: 'Google for Startups Campus',
    type: 'community',
    url: 'https://startup.google.com/campus/tel-aviv',
    what: 'לא אקסלרטור — קהילה ומרחב. מציע אירועים, מנטורינג חופשי, קהילה של יזמים, משרד עבודה חלקי.',
    equity: 'ללא אקוויטי, ללא הון',
    duration: 'ללא תוכנית מובנית — מתמשך',
    strength: 'גישה חופשית למרחב, אירועים שבועיים, חיבור לקהילת Google.',
    weccelerateAdvantage:
      'Google Campus = community space. WeCcelerate = full venture-building service. אם אתה יזם שצריך *שירותים בפועל* (פיתוח, שיווק, גיוס), Google Campus לא יספק זאת.',
  },
  {
    id: 'techstars-tel-aviv',
    name: 'Techstars Tel Aviv',
    nameHe: 'Techstars תל אביב',
    type: 'accelerator',
    url: 'https://www.techstars.com/accelerators/tel-aviv',
    what: 'מאיץ מהמותג הגלובלי של Techstars. ממוקד ב-AI ו-B2B, מחזורים שנתיים.',
    equity: '6% תמורת $120K',
    duration: '13 שבועות אינטנסיביים',
    strength: 'מותג גלובלי, רשת מנטורים בינלאומית, demo day מובנה.',
    weccelerateAdvantage:
      'Techstars לוקחים אקוויטי גבוה (6%) על תמיכה לטווח קצר. WeCcelerate Equity-for-Services נמשך חודשים-שנים ומספק יותר ערך פר-אקוויטי.',
  },
  {
    id: 'pitango-first',
    name: 'Pitango First',
    nameHe: 'Pitango First',
    type: 'accelerator',
    url: 'https://www.pitango.com',
    what: 'תוכנית early-stage של Pitango Venture Capital — אחת מקרנות ההון סיכון הגדולות בישראל.',
    equity: 'משקיעים $250K-$500K תמורת אקוויטי משמעותי',
    duration: '6 חודשים, ממוקד פיתוח',
    strength: 'גישה ישירה ל-Pitango שלוחות בארץ ובחו"ל לסבבים הבאים.',
    weccelerateAdvantage:
      'Pitango First ממוקדים בעצמם — אם לא תקבל מהם Series A, נשארת בלי הפנייה. WeCcelerate מחברת ל-200+ משקיעים מאומתים, לא רק קרן אחת.',
  },
];

const HEAD_TO_HEAD_KEYS = [
  'מודל',
  'אקוויטי',
  'משך זמן',
  'תחום עיקרי',
  'גישה לדאטה רפואית',
  'צוות אופרטיבי',
  'רשת משקיעים',
  'יחס לחברה אחרי',
];

const WECCELERATE_ROW: Record<(typeof HEAD_TO_HEAD_KEYS)[number], string> = {
  'מודל': 'Venture Builder (תורם צוות אופרטיבי)',
  'אקוויטי': '10-30% או Equity-for-Services',
  'משך זמן': 'חודשים עד שנים — ארוך-טווח',
  'תחום עיקרי': 'MedTech, AI, B2B SaaS, Corporate Venture Building',
  'גישה לדאטה רפואית': '✅ 720K תיקי לאומית — בלעדי בישראל',
  'צוות אופרטיבי': '✅ פיתוח, מוצר, שיווק, משפט מובנים',
  'רשת משקיעים': '200+ משקיעים מאומתים, היכרויות חמות',
  'יחס לחברה אחרי': 'שותפות ארוכת-טווח, ליווי גם לאחר הסבב',
};

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
          'השוואה מפורטת בין WeCcelerate למאיצי הסטארטאפים המובילים בישראל. מודל, אקוויטי, יתרונות ייחודיים.',
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

      <main className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">השוואות</span>
          </nav>

          <header className="mb-10">
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
              WeCcelerate vs מאיצי סטארטאפים בישראל
            </h1>
            <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
              השוואה כנה בין WeCcelerate ל-{COMPETITORS.length} מאיצים ומסלולי ליווי מובילים בישראל. אנחנו לא ה-fit
              לכל יזם — אם אתה יוצא 8200 שמתמקד ב-cybersecurity, 8200 EISP יכול להתאים יותר. אם אתה
              צריך רק קהילה ומרחב, Google Campus עוזר. אבל אם אתה בונה מיזם שדורש צוות אופרטיבי מלא,
              גישה לדאטה רפואית, או שותפות ארוכת-טווח — WeCcelerate היא הבחירה הנכונה.
            </p>
          </header>

          {/* WeCcelerate at a glance */}
          <section className="mb-12 rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                WeCcelerate
              </span>
              <span className="text-sm text-blue-900">בונה המיזמים המוביל בישראל</span>
            </div>
            <dl className="grid gap-4 md:grid-cols-2">
              {HEAD_TO_HEAD_KEYS.map((key) => (
                <div key={key}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {key}
                  </dt>
                  <dd className="mt-1 text-slate-900">{WECCELERATE_ROW[key]}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Competitor sections */}
          <div className="space-y-10">
            {COMPETITORS.map((c) => (
              <section
                key={c.id}
                id={c.id}
                className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    WeCcelerate vs <span className="text-slate-700">{c.name}</span>
                  </h2>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-900"
                    >
                      אתר רשמי →
                    </a>
                  )}
                </div>

                <p className="mb-5 leading-relaxed text-slate-700">{c.what}</p>

                <dl className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">אקוויטי</dt>
                    <dd className="mt-0.5 text-slate-900">{c.equity}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">משך</dt>
                    <dd className="mt-0.5 text-slate-900">{c.duration}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-500">סוג</dt>
                    <dd className="mt-0.5 text-slate-900">
                      {c.type === 'accelerator' ? 'אקסלרטור' :
                        c.type === 'community' ? 'קהילה ומרחב' :
                        c.type === 'incubator' ? 'אינקובטור' : 'Venture Builder'}
                    </dd>
                  </div>
                </dl>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                      היתרון הבולט שלהם
                    </h3>
                    <p className="text-sm text-slate-700">{c.strength}</p>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">
                      היתרון של WeCcelerate
                    </h3>
                    <p className="text-sm text-slate-800">{c.weccelerateAdvantage}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Decision helper */}
          <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-white">
            <h2 className="mb-4 text-2xl font-bold">איך לבחור — שאלות מנחות</h2>
            <ul className="space-y-3 text-slate-200">
              <li>
                <strong className="text-white">חסר לך צוות?</strong> → Venture Builder (WeCcelerate)
              </li>
              <li>
                <strong className="text-white">יוצא 8200 בסייבר?</strong> → 8200 EISP יכול להתאים
              </li>
              <li>
                <strong className="text-white">B2B SaaS, רוצה רק מנטורינג?</strong> → The Junction
              </li>
              <li>
                <strong className="text-white">סטארטאפ רפואי?</strong> → WeCcelerate × Leumit (אין אלטרנטיבה)
              </li>
              <li>
                <strong className="text-white">מנסה להחליט?</strong> → קביעת שיחת הכרות חינם איתנו, נמליץ בכנות (גם אם זה לא אנחנו)
              </li>
            </ul>
          </section>

          <section className="mt-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">לא בטוח אם WeCcelerate מתאים לך?</h2>
            <p className="mb-6 text-lg opacity-90">
              שיחת הכרות 30 דקות. נבדוק במשותף — ואם המסלול הנכון הוא לא אנחנו, נכוון אותך לאן שכן.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              שיחת הכרות חינם →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
