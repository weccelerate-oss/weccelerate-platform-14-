import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  GUIDES,
  GUIDE_CATEGORIES,
  type GuideCategory,
} from '@/lib/seo/guides-catalog';

export const revalidate = 86400;

export const metadata: Metadata = constructMetadata({
  title: 'מדריכי סטארטאפ מלאים | WeCcelerate — כל מה שצריך לדעת לפני שמקימים',
  description:
    `${GUIDES.length} מדריכים מקצועיים ליזמים ישראלים: איך להקים סטארטאפ, לבנות MVP, לגייס משקיעים, לעבור ועדת הלסינקי ו-FDA. הכל במקום אחד, מעודכן ל-2026.`,
  keywords: [
    'מדריכי סטארטאפ',
    'איך להקים סטארטאפ',
    'MVP מדריך',
    'גיוס הון מדריך',
    'מדריך רגולציה רפואית',
    'Venture Builder',
    'WeCcelerate',
  ],
  path: '/guides',
  locale: 'he',
});

function buildCollectionPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_CONFIG.url}/guides#collection`,
    name: 'מדריכי סטארטאפ מלאים של WeCcelerate',
    description:
      `${GUIDES.length} מדריכים מעשיים ליזמים בישראל: הקמת סטארטאפ, פיתוח מוצר, גיוס הון, MedTech ורגולציה.`,
    url: `${SITE_CONFIG.url}/guides`,
    inLanguage: 'he-IL',
    isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
    publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
    hasPart: GUIDES.map((g) => ({
      '@type': 'Article',
      '@id': `${SITE_CONFIG.url}/guides/${g.slug}`,
      headline: g.h1,
      description: g.metaDescription,
      url: `${SITE_CONFIG.url}/guides/${g.slug}`,
      keywords: [g.targetKeyword, ...g.relatedKeywords].join(', '),
      datePublished: g.lastUpdated,
      dateModified: g.lastUpdated,
      timeRequired: `PT${g.readingTimeMinutes}M`,
    })),
  };
}

export default function GuidesHubPage() {
  const schema = buildCollectionPageSchema();

  const grouped = (Object.keys(GUIDE_CATEGORIES) as GuideCategory[]).map((cat) => ({
    category: cat,
    label: GUIDE_CATEGORIES[cat],
    guides: GUIDES.filter((g) => g.category === cat),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">מדריכים</span>
          </nav>

          <header className="mb-12">
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
              מדריכי סטארטאפ מלאים של WeCcelerate
            </h1>
            <p
              data-speakable
              className="max-w-3xl text-lg leading-relaxed text-slate-700"
            >
              WeCcelerate היא — Venture Builder ומאיץ סטארטאפים בישראל. {GUIDES.length} מדריכים
              מקצועיים מכסים את כל מה שיזם ישראלי צריך לדעת — מרעיון לסטארטאפ, דרך בניית MVP וגיוס
              משקיעים, ועד אישורי FDA ו-CE למוצרים רפואיים. מעודכן ל-2026, מבוסס על ליווי של סטארטאפים מתחומי AI, MedTech, SaaS.
            </p>
          </header>

          <div className="space-y-14">
            {grouped.map(({ category, label, guides }) => (
              <section key={category} id={category} className="scroll-mt-24">
                <div className="mb-6 border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{label.he}</h2>
                  <p className="mt-2 text-slate-600">{label.description}</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
                    >
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                        {g.h1}
                      </h3>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                        {g.metaDescription}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">
                          {g.targetKeyword}
                        </span>
                        <span>{g.readingTimeMinutes} דק׳ קריאה</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">רוצים ליווי אישי?</h2>
            <p className="mb-6 text-lg opacity-90">
              מדריכים מצוינים, אבל ליווי של Venture Builder עוקף שנתיים של טעויות.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-lg bg-white px-8 py-3 text-slate-900 font-semibold transition hover:bg-slate-100"
            >
              שיחת הכרות ללא עלות →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
