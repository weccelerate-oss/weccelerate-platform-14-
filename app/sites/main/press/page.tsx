import { Metadata } from 'next';
import Link from 'next/link';
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

/**
 * Secondary schema: Organization with `subjectOf` linking to press mentions,
 * and `memberOf` / `award` from the catalog. This reinforces entity authority.
 */
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

  // Group by category, keeping only categories with entries
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

      <main className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16" dir="rtl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">בתקשורת</span>
          </nav>

          <header className="mb-10">
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
              WeCcelerate בתקשורת
            </h1>
            <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
              WeCcelerate היא Venture Builder ומאיץ סטארטאפים בישראל, מוכרת על ידי רשות החדשנות
              הישראלית ובעלת שותפות אסטרטגית עם לאומית שירותי בריאות. חברה ב-Start-Up Nation
              Central וב-IATI. בעמוד זה אזכורים, שותפויות ופרסומים רשמיים.
            </p>
          </header>

          {!hasPress && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg text-slate-700">
                עמוד זה יעודכן בקרוב עם אזכורים נוספים בתקשורת הישראלית והבינלאומית.
              </p>
            </div>
          )}

          <div className="space-y-12">
            {grouped.map(({ category, label, items }) => (
              <section key={category} id={category} className="scroll-mt-24">
                <h2 className="mb-5 border-b border-slate-200 pb-3 text-2xl font-bold text-slate-900">
                  {label.he}
                </h2>
                <ul className="space-y-4">
                  {items.map((mention) => {
                    const outlet = OUTLET_METADATA[mention.outlet];
                    const dateFormatted = new Date(mention.date).toLocaleDateString('he-IL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                    const content = (
                      <article className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-sm">
                        <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {outlet?.nameHe ?? outlet?.name ?? mention.outlet}
                          </span>
                          <span>·</span>
                          <time dateTime={mention.date}>{dateFormatted}</time>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                          {mention.title}
                        </h3>
                        {mention.excerpt && (
                          <p className="text-sm leading-relaxed text-slate-600">
                            {mention.excerpt}
                          </p>
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

          <section className="mt-16 rounded-2xl bg-slate-900 p-8 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold">פניות לתקשורת</h2>
            <p className="mb-5 text-slate-300">
              עיתונאים, כותבי תוכן, מארחי פודקאסטים — נשמח לספק מידע ולעזור.
            </p>
            <a
              href="mailto:info@weccelerate.co.il?subject=Press%20Inquiry"
              className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              info@weccelerate.co.il
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
