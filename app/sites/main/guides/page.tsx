import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

      <main
        className="min-h-screen bg-[#070b1e] text-white font-heebo"
        id="main-content"
        dir="rtl"
      >
        {/* Hero band */}
        <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-14 md:pt-36 md:pb-20">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,169,81,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="container mx-auto px-4 relative z-10 max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/80 transition-colors">בית</Link>
              <span className="mx-2">›</span>
              <span aria-current="page" className="text-white/80">מדריכים</span>
            </nav>

            <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-4">
              מאגר מדריכים · WeCcelerate
            </p>
            <h1 className="mb-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              מדריכי סטארטאפ מלאים{' '}
              <span className="bg-gradient-to-l from-[#c8a951] via-[#e8d48b] to-[#c8a951] bg-clip-text text-transparent">
                של WeCcelerate
              </span>
            </h1>
            <p
              data-speakable
              className="max-w-3xl text-base md:text-lg leading-relaxed text-white/60"
            >
              WeCcelerate היא Venture Builder ומאיץ סטארטאפים בישראל. {GUIDES.length} מדריכים מקצועיים
              מכסים את כל מה שיזם ישראלי צריך לדעת — מרעיון לסטארטאפ, דרך בניית MVP וגיוס משקיעים,
              ועד אישורי FDA ו-CE למוצרים רפואיים. מעודכן ל-2026.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
          <div className="space-y-16">
            {grouped.map(({ category, label, guides }) => (
              <section key={category} id={category} className="scroll-mt-24">
                <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{label.he}</h2>
                    <p className="mt-2 text-white/55">{label.description}</p>
                  </div>
                  <div className="hidden md:block h-px w-24 self-end bg-gradient-to-l from-[#c8a951] to-transparent" />
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="group flex flex-col rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent p-5 transition-all duration-300 hover:border-[#c8a951]/40 hover:from-[#c8a951]/[0.06]"
                    >
                      <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-[#e8d48b] transition-colors">
                        {g.h1}
                      </h3>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-white/55">
                        {g.metaDescription}
                      </p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span className="rounded-full bg-[#c8a951]/10 border border-[#c8a951]/20 px-2.5 py-1 font-medium text-[#e8d48b]">
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

          <section className="mt-16 relative overflow-hidden rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.08] via-transparent to-[#c8a951]/[0.04] p-10 text-center">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-3">
                ליווי אישי
              </p>
              <h2 className="mb-3 text-2xl md:text-3xl font-bold">רוצים ליווי אישי?</h2>
              <p className="mb-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                מדריכים מצוינים, אבל ליווי של Venture Builder עוקף שנתיים של טעויות.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-7 py-3.5 text-base font-bold rounded-xl shadow-lg shadow-[#c8a951]/20 hover:shadow-xl hover:shadow-[#c8a951]/30 transition-all"
              >
                שיחת הכרות ללא עלות
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
