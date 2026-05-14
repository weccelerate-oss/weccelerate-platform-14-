import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  GUIDES,
  GUIDE_CATEGORIES,
  getGuideBySlug,
  getRelatedGuides,
  type Guide,
} from '@/lib/seo/guides-catalog';
import { getEnSlugFromHebrew } from '@/lib/seo/guides-catalog-en';
import { prisma } from '@/lib/db';
import { renderGeneratedGuide } from './generated-guide-view';

export const revalidate = 86400;
// Allow slugs that aren't in the static catalog — agent-generated guides
// (GeneratedGuide table) are rendered through a fallback path.
export const dynamicParams = true;

type Params = { slug: string };

// =============================================================================
// STATIC PARAMS + METADATA
// =============================================================================

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

async function findGeneratedGuide(slug: string) {
  try {
    return await prisma.generatedGuide.findUnique({
      where: { slug },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    // Fallback: agent-generated guide.
    const gen = await findGeneratedGuide(slug);
    if (gen && gen.status === 'published') {
      return constructMetadata({
        title: gen.titleHe,
        description: gen.metaDescription,
        path: `/guides/${slug}`,
        locale: 'he',
        type: 'article',
        publishedTime: gen.publishedAt?.toISOString() ?? gen.createdAt.toISOString(),
        modifiedTime: gen.updatedAt.toISOString(),
        image: `${SITE_CONFIG.url}/og?slug=${encodeURIComponent(slug)}&locale=he`,
      });
    }
    return constructMetadata({
      title: 'מדריך לא נמצא',
      path: `/guides/${slug}`,
      noIndex: true,
    });
  }

  const base = constructMetadata({
    title: guide.h1,
    description: guide.metaDescription,
    path: `/guides/${guide.slug}`,
    locale: 'he',
    type: 'article',
    publishedTime: `${guide.lastUpdated}T00:00:00+03:00`,
    modifiedTime: `${guide.lastUpdated}T00:00:00+03:00`,
    keywords: [guide.targetKeyword, ...guide.relatedKeywords],
    image: `${SITE_CONFIG.url}/og?slug=${encodeURIComponent(guide.slug)}&locale=he`,
  });

  // If this guide has an English translation, point hreflang at it.
  // Otherwise fall back to constructMetadata's default languages map.
  const enSlug = getEnSlugFromHebrew(guide.slug);
  if (!enSlug) return base;

  const hebrewUrl = `${SITE_CONFIG.url}/guides/${guide.slug}`;
  const englishUrl = `${SITE_CONFIG.url}/en/guides/${enSlug}`;
  return {
    ...base,
    alternates: {
      canonical: hebrewUrl,
      languages: {
        he: hebrewUrl,
        'he-IL': hebrewUrl,
        en: englishUrl,
        'en-US': englishUrl,
        'en-IL': englishUrl,
        'x-default': hebrewUrl,
      },
    },
  };
}

// =============================================================================
// JSON-LD BUILDERS
// =============================================================================

function buildArticleSchema(guide: Guide) {
  const url = `${SITE_CONFIG.url}/guides/${guide.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: guide.h1,
    alternativeHeadline: guide.targetKeyword,
    description: guide.metaDescription,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'he-IL',
    datePublished: `${guide.lastUpdated}T00:00:00+03:00`,
    dateModified: `${guide.lastUpdated}T00:00:00+03:00`,
    author: { '@id': `${SITE_CONFIG.url}/#organization`, '@type': 'Organization', name: 'WeCcelerate' },
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
      '@type': 'Organization',
      name: 'WeCcelerate',
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png` },
    },
    keywords: [guide.targetKeyword, ...guide.relatedKeywords].join(', '),
    wordCount: guide.sections.reduce(
      (sum, s) => sum + s.paragraphs.join(' ').split(/\s+/).length + (s.list?.join(' ').split(/\s+/).length ?? 0),
      0,
    ),
    timeRequired: `PT${guide.readingTimeMinutes}M`,
    image: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png`, width: 512, height: 512 },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-speakable]'],
    },
    about: {
      '@type': 'Thing',
      name: guide.targetKeyword,
    },
  };
}

function buildFaqSchema(guide: Guide) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_CONFIG.url}/guides/${guide.slug}#faq`,
    inLanguage: 'he-IL',
    mainEntity: guide.faqs.map((faq, i) => ({
      '@type': 'Question',
      '@id': `${SITE_CONFIG.url}/guides/${guide.slug}#faq-${i + 1}`,
      position: i + 1,
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
        inLanguage: 'he-IL',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
      },
    })),
  };
}

function buildHowToSchema(guide: Guide) {
  if (!guide.howToSteps || guide.howToSteps.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_CONFIG.url}/guides/${guide.slug}#howto`,
    name: guide.h1,
    description: guide.speakableAnswer,
    inLanguage: 'he-IL',
    totalTime: `PT${guide.readingTimeMinutes * 60}M`,
    step: guide.howToSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url && { url: s.url }),
    })),
  };
}

function buildBreadcrumbSchema(guide: Guide) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${SITE_CONFIG.url}/guides/${guide.slug}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'בית', item: SITE_CONFIG.url },
      { '@type': 'ListItem', position: 2, name: 'מדריכים', item: `${SITE_CONFIG.url}/guides` },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.targetKeyword,
        item: `${SITE_CONFIG.url}/guides/${guide.slug}`,
      },
    ],
  };
}

// =============================================================================
// PAGE
// =============================================================================

export default async function GuideDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    // Fallback: agent-generated guide stored in DB.
    const gen = await findGeneratedGuide(slug);
    if (gen && gen.status === 'published') {
      return renderGeneratedGuide(gen);
    }
    notFound();
  }

  const relatedGuides = getRelatedGuides(guide);
  const category = GUIDE_CATEGORIES[guide.category];
  const enSlug = getEnSlugFromHebrew(guide.slug);

  const schemas: Array<Record<string, unknown>> = [
    buildArticleSchema(guide),
    buildFaqSchema(guide),
    buildBreadcrumbSchema(guide),
  ];
  const howTo = buildHowToSchema(guide);
  if (howTo) schemas.push(howTo);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article className="min-h-screen bg-white" id="main-content">
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16" dir="rtl">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">בית</Link>
            <span className="mx-2">›</span>
            <Link href="/guides" className="hover:text-slate-900">מדריכים</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">{guide.targetKeyword}</span>
          </nav>

          {/* English sibling — only shown for the 5 translated guides */}
          {enSlug && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
              <span className="text-slate-600">קוראים בעברית</span>
              <Link
                href={`/en/guides/${enSlug}`}
                hrefLang="en"
                className="font-medium text-blue-700 hover:underline"
                aria-label="Read this guide in English"
              >
                Read in English →
              </Link>
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                {category.he}
              </span>
              <span>{guide.readingTimeMinutes} דק׳ קריאה</span>
              <span>·</span>
              <time dateTime={guide.lastUpdated}>עודכן {guide.lastUpdated}</time>
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {guide.h1}
            </h1>

            {/* Speakable answer box — what Google AI / Alexa read aloud */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                תשובה מהירה
              </div>
              <p data-speakable className="text-lg leading-relaxed text-slate-900">
                {guide.speakableAnswer}
              </p>
            </div>
          </header>

          {/* Table of contents */}
          <nav
            aria-label="תוכן עניינים"
            className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              תוכן עניינים
            </h2>
            <ol className="list-decimal space-y-1.5 pr-5 text-slate-700">
              {guide.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#section-${i + 1}`} className="hover:text-blue-700 hover:underline">
                    {s.heading}
                  </a>
                </li>
              ))}
              {guide.howToSteps && (
                <li>
                  <a href="#howto" className="hover:text-blue-700 hover:underline">
                    שלבים מעשיים
                  </a>
                </li>
              )}
              <li>
                <a href="#faq" className="hover:text-blue-700 hover:underline">
                  שאלות נפוצות
                </a>
              </li>
            </ol>
          </nav>

          {/* Body sections */}
          <div className="prose prose-slate max-w-none">
            {guide.sections.map((section, i) => (
              <section key={i} id={`section-${i + 1}`} className="mb-10 scroll-mt-24">
                <h2 className="mb-4 text-2xl font-bold text-slate-900">{section.heading}</h2>
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="mb-4 leading-relaxed text-slate-700">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mb-4 list-disc space-y-2 pr-6 text-slate-700">
                    {section.list.map((item, j) => (
                      <li key={j} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* HowTo steps */}
          {guide.howToSteps && (
            <section id="howto" className="mb-12 scroll-mt-24 rounded-2xl border border-slate-200 p-6">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">שלבים מעשיים</h2>
              <ol className="space-y-5">
                {guide.howToSteps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white"
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-slate-900">{step.name}</h3>
                      <p className="text-slate-700">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* FAQ */}
          <section id="faq" className="mb-12 scroll-mt-24">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">שאלות נפוצות</h2>
            <div className="space-y-3">
              {guide.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-slate-200 bg-white p-5 open:border-blue-400 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-3 text-lg font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 text-slate-400 transition group-open:rotate-180"
                    >
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-3 leading-relaxed text-slate-700">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA to service */}
          <section className="mb-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
            <h2 className="mb-3 text-2xl font-bold">{guide.ctaLabel}</h2>
            <p className="mb-5 opacity-90">
              צוות WeCcelerate ליווה סטארטאפים בפורטפוליו.
              שיחת הכרות ראשונה ללא עלות.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                דברו איתנו
              </Link>
              <Link
                href={guide.ctaServicePath}
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                עוד על השירות
              </Link>
            </div>
          </section>

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-bold text-slate-900">מדריכים קשורים</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-400 hover:shadow-sm"
                  >
                    <div className="mb-1 text-xs text-slate-500">
                      {GUIDE_CATEGORIES[g.category].he}
                    </div>
                    <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                      {g.h1}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
