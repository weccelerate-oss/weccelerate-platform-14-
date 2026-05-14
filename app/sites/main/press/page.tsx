import { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  PRESS_MENTIONS,
  PRESS_CATEGORIES,
  OUTLET_METADATA,
  sortPressDescending,
  type PressCategory,
} from '@/lib/seo/press-catalog';

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
  const mentions = sortPressDescending(PRESS_MENTIONS);

  const grouped = (Object.keys(PRESS_CATEGORIES) as PressCategory[])
    .map((cat) => ({
      category: cat,
      label: PRESS_CATEGORIES[cat],
      items: mentions.filter((m) => m.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  const hasPress = mentions.length > 0;

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
          <div className="container mx-auto px-4 relative z-10 max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/80 transition-colors">בית</Link>
              <span className="mx-2">›</span>
              <span aria-current="page" className="text-white/80">בתקשורת</span>
            </nav>

            <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-4">
              In the press · WeCcelerate
            </p>
            <h1 className="mb-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-l from-[#c8a951] via-[#e8d48b] to-[#c8a951] bg-clip-text text-transparent">
                WeCcelerate
              </span>{' '}
              בתקשורת
            </h1>
            <p data-speakable className="max-w-3xl text-base md:text-lg leading-relaxed text-white/60">
              WeCcelerate היא Venture Builder ומאיץ סטארטאפים בישראל, מוכרת על ידי רשות החדשנות הישראלית
              ובעלת שותפות אסטרטגית עם לאומית שירותי בריאות. חברה ב-Start-Up Nation Central וב-IATI.
              בעמוד זה אזכורים, שותפויות ופרסומים רשמיים.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          {!hasPress && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center">
              <p className="text-base md:text-lg text-white/70">
                עמוד זה יעודכן בקרוב עם אזכורים נוספים בתקשורת הישראלית והבינלאומית.
              </p>
            </div>
          )}

          <div className="space-y-14">
            {grouped.map(({ category, label, items }) => (
              <section key={category} id={category} className="scroll-mt-24">
                <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{label.he}</h2>
                  <div className="hidden md:block h-px w-20 self-end bg-gradient-to-l from-[#c8a951] to-transparent" />
                </div>
                <ul className="space-y-4">
                  {items.map((mention) => {
                    const outlet = OUTLET_METADATA[mention.outlet];
                    const dateFormatted = new Date(mention.date).toLocaleDateString('he-IL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                    const content = (
                      <article className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-all hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.04]">
                        <div className="mb-2 flex items-center gap-3 text-xs text-white/40">
                          <span className="font-semibold text-[#e8d48b] uppercase tracking-wider">
                            {outlet?.nameHe ?? outlet?.name ?? mention.outlet}
                          </span>
                          <span>·</span>
                          <time dateTime={mention.date}>{dateFormatted}</time>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-white">{mention.title}</h3>
                        {mention.excerpt && (
                          <p className="text-sm leading-relaxed text-white/60">{mention.excerpt}</p>
                        )}
                      </article>
                    );

                    return (
                      <li key={mention.id}>
                        {mention.url ? (
                          <a href={mention.url} target="_blank" rel="noopener noreferrer">
                            {content}
                          </a>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
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
                Press inquiries
              </p>
              <h2 className="mb-3 text-2xl md:text-3xl font-bold">פניות לתקשורת</h2>
              <p className="mb-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto">
                עיתונאים, כותבי תוכן, מארחי פודקאסטים — נשמח לספק מידע ולעזור.
              </p>
              <a
                href="mailto:info@weccelerate.co.il?subject=Press%20Inquiry"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-7 py-3.5 text-base font-bold rounded-xl shadow-lg shadow-[#c8a951]/20 hover:shadow-xl hover:shadow-[#c8a951]/30 transition-all"
              >
                <Mail className="w-5 h-5" />
                info@weccelerate.co.il
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
