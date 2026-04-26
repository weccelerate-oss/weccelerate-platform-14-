import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { GUIDES, getGuideBySlug } from '@/lib/seo/guides-catalog';

export const revalidate = 86400;

// =============================================================================
// PILLAR PAGE — MEDTECH / DIGITAL HEALTH IN ISRAEL
// =============================================================================
// WeCcelerate's strongest differentiator is the exclusive Leumit partnership.
// This pillar consolidates every MedTech-related guide under one canonical
// URL targeting the broadest commercial keyword in the cluster, while pushing
// PageRank to the spoke guides.
// =============================================================================

const PILLAR_SLUGS = [
  'eich-lehakim-startup-refui',
  'mizam-refui',
  'vaadat-helsinki-madrich',
  'fda-510k-madrich',
  'digital-therapeutics-israel',
] as const;

export const metadata: Metadata = constructMetadata({
  title: 'מדריך MedTech / סטארטאפ רפואי בישראל 2026 — Leumit × WeCcelerate',
  description:
    'מדריך מקיף לסטארטאפים ומיזמים רפואיים בישראל: רגולציה (FDA, CE, ועדת הלסינקי), גישה לדאטה רפואית של 720K מטופלים, פיילוטים קליניים, וגיוס הון. 5 מדריכים מקצועיים מהמסלול הבלעדי של Leumit × WeCcelerate.',
  keywords: [
    'MedTech ישראל',
    'מיזם רפואי',
    'סטארטאפ רפואי',
    'Digital Health Israel',
    'מסלול MedTech',
    'Leumit MedTech',
    'ועדת הלסינקי',
    'FDA 510k',
    'CE Marking',
    'בריאות דיגיטלית',
    'מכשור רפואי',
    'Digital Therapeutics',
    'AI for healthcare',
    'גישה לדאטה רפואית',
    'פיילוטים קליניים',
  ],
  path: '/medtech-guide',
  locale: 'he',
});

function buildPillarSchema() {
  const linkedGuides = PILLAR_SLUGS.map((slug) => getGuideBySlug(slug)).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${SITE_CONFIG.url}/medtech-guide#article`,
        headline: 'מדריך MedTech / סטארטאפ רפואי בישראל 2026',
        description:
          'מדריך מקיף לסטארטאפים רפואיים בישראל: רגולציה, דאטה, פיילוטים, וגיוס.',
        url: `${SITE_CONFIG.url}/medtech-guide`,
        inLanguage: 'he-IL',
        datePublished: '2026-04-23T00:00:00+03:00',
        dateModified: '2026-04-23T00:00:00+03:00',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
        publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
        about: { '@type': 'Thing', name: 'MedTech / סטארטאפ רפואי בישראל' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_CONFIG.url}/medtech-guide` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
        hasPart: linkedGuides.map((g) => ({
          '@type': 'Article',
          '@id': `${SITE_CONFIG.url}/guides/${g!.slug}`,
          headline: g!.h1,
          url: `${SITE_CONFIG.url}/guides/${g!.slug}`,
        })),
        // Highlight the unique Leumit partnership as a Service offering
        mentions: {
          '@type': 'MedicalOrganization',
          '@id': `${SITE_CONFIG.url}/leumit/#organization`,
          name: 'WeCcelerate × Leumit MedTech Track',
          url: 'https://leumit.weccelerate.co.il',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/medtech-guide#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'מדריך MedTech',
            item: `${SITE_CONFIG.url}/medtech-guide`,
          },
        ],
      },
    ],
  };
}

export default function MedTechGuidePillar() {
  const linkedGuides = PILLAR_SLUGS.map((slug) => getGuideBySlug(slug)).filter(Boolean);

  const sections = [
    {
      id: 'foundations',
      title: 'הקמה — איך להקים מיזם רפואי בישראל',
      summary:
        'הצעדים הבסיסיים: צוות עם רופא, אישור Helsinki, גישה לדאטה. תהליך מלא מרעיון ל-MVP קליני.',
      slugs: ['mizam-refui', 'eich-lehakim-startup-refui'],
    },
    {
      id: 'regulatory',
      title: 'רגולציה — ועדת הלסינקי, FDA, ו-CE',
      summary:
        'המסלולים הרגולטוריים הקריטיים. ועדת הלסינקי בישראל, FDA 510(k) בארה"ב, ו-CE Marking באירופה.',
      slugs: ['vaadat-helsinki-madrich', 'fda-510k-madrich'],
    },
    {
      id: 'verticals',
      title: 'תחומי MedTech חמים — Digital Therapeutics ו-AI לבריאות',
      summary:
        'תחום ה-DTx (תרופה דיגיטלית) ו-AI Diagnostics הם הסקטורים החמים ביותר ב-2026. גישה לדאטה רפואית של 720K מבוטחי לאומית פותחת יתרון תחרותי בלתי-נמוך.',
      slugs: ['digital-therapeutics-israel'],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPillarSchema()) }}
      />

      <main className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              בית
            </Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">
              מדריך MedTech
            </span>
          </nav>

          {/* Hero */}
          <header className="mb-12">
            <div className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              שותפות בלעדית עם לאומית שירותי בריאות
            </div>
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
              מדריך MedTech / סטארטאפ רפואי בישראל
            </h1>
            <p
              data-speakable
              className="max-w-3xl text-lg leading-relaxed text-slate-700"
            >
              WeCcelerate היא ה-Venture Builder המוביל בישראל למיזמים רפואיים, בזכות שותפות בלעדית עם לאומית
              שירותי בריאות שמספקת גישה ל-720,000 תיקי מטופלים אנונימיים ו-8.7 מיליון ביקורים קליניים שנתיים.
              {linkedGuides.length} מדריכים מקצועיים מכסים את כל הצעדים — מהקמת מיזם רפואי, דרך אישור ועדת הלסינקי
              ו-FDA 510(k), ועד גיוס Series A מקרנות MedTech ייעודיות.
            </p>

            {/* Unique value props */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-1 text-2xl font-bold text-emerald-900">720,000</div>
                <div className="text-xs uppercase tracking-wide text-emerald-700">
                  תיקי מטופלים אנונימיים
                </div>
                <div className="mt-2 text-sm text-emerald-900">
                  גישה דרך לאומית — בלעדית בישראל
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-1 text-2xl font-bold text-emerald-900">8.7M</div>
                <div className="text-xs uppercase tracking-wide text-emerald-700">
                  ביקורים קליניים שנתיים
                </div>
                <div className="mt-2 text-sm text-emerald-900">
                  20+ שנות היסטוריה רפואית
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-1 text-2xl font-bold text-emerald-900">2 חודשים</div>
                <div className="text-xs uppercase tracking-wide text-emerald-700">
                  ממוצע אישור Helsinki
                </div>
                <div className="mt-2 text-sm text-emerald-900">
                  במקום 4-6 חודשים בשוק
                </div>
              </div>
            </div>
          </header>

          {/* Quick TOC */}
          <nav
            aria-label="תוכן עניינים"
            className="mb-12 rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              קפצו לסעיף
            </h2>
            <ol className="grid list-decimal gap-1.5 pr-5 text-slate-700">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-blue-700 hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections with spokes */}
          <div className="space-y-14">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">
                  {section.title}
                </h2>
                <p className="mb-6 max-w-3xl text-slate-700">{section.summary}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {section.slugs.map((slug) => {
                    const g = getGuideBySlug(slug);
                    if (!g) return null;
                    return (
                      <Link
                        key={slug}
                        href={`/guides/${slug}`}
                        className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md"
                      >
                        <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                          {g.h1}
                        </h3>
                        <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">
                          {g.metaDescription}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                            {g.targetKeyword}
                          </span>
                          <span>{g.readingTimeMinutes} דק׳</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Speakable answer — Leumit partnership benefits */}
          <section className="mt-16 rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
            <h2 className="mb-3 text-xl font-bold text-slate-900">
              למה לבחור ב-WeCcelerate למיזם רפואי
            </h2>
            <p data-speakable className="text-slate-800 leading-relaxed">
              WeCcelerate היא בונה המיזמים היחיד בישראל עם שותפות אסטרטגית בלעדית עם לאומית שירותי
              בריאות. זה מאפשר ללקוחותינו 5 יתרונות שלא ניתן להשיג במקום אחר: (1) גישה ל-720,000 תיקי מטופלים
              אנונימיים לאימון מודלי AI; (2) פיילוטים קליניים במרפאות לאומית עם מטופלים אמיתיים; (3) ייעוץ של
              רופאי-מומחים מ-13 התמחויות; (4) ליווי רגולטורי FDA/CE/Helsinki מיועצים בכירים — חלקם לשעבר ב-FDA;
              (5) הכרה מהירה ע"י משקיעי MedTech (לאומית = trust signal).
            </p>
          </section>

          {/* External link to Leumit subdomain */}
          <section className="mt-8 rounded-2xl border border-slate-300 bg-slate-50 p-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              למידע מפורט על מסלול MedTech של Leumit × WeCcelerate
            </h2>
            <p className="mb-4 text-slate-700">
              דף ייעודי לתוכנית — ששת המסלולים, האיש הקבוע מ-FDA, וטופס פנייה מהיר.
            </p>
            <a
              href="https://leumit.weccelerate.co.il"
              className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              leumit.weccelerate.co.il →
            </a>
          </section>

          {/* CTA */}
          <section className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-10 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">בונים סטארטאפ רפואי?</h2>
            <p className="mb-6 text-lg opacity-90">
              שיחת הכרות 30 דקות — נבחן את הרעיון, נבדוק התאמה לתוכנית Leumit × WeCcelerate, ונקצר לך 6 חודשי
              ביורוקרטיה רגולטורית. ללא עלות.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-emerald-900 transition hover:bg-slate-100"
              >
                שיחת הכרות חינם →
              </Link>
              <Link
                href="/services/medtech-leumit"
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                עוד על השירות
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
