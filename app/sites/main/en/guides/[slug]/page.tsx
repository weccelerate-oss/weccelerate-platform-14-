/**
 * English-language guide renderer: /en/guides/[slug]
 *
 * Mirror of the Hebrew guide renderer at `app/sites/main/guides/[slug]/page.tsx`,
 * but with:
 *   - locale: 'en'
 *   - dir="ltr"
 *   - hreflang cross-link back to the Hebrew sibling (via `hebrewSlug`)
 *   - English copy throughout (UI labels, JSON-LD `inLanguage`, CTA)
 *
 * Catalog: `lib/seo/guides-catalog-en.ts` (5 top guides translated).
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  GUIDES_EN,
  GUIDE_CATEGORIES_EN,
  getGuideBySlugEn,
  getRelatedGuidesEn,
  type GuideEn,
} from '@/lib/seo/guides-catalog-en';

export const revalidate = 86400;

type Params = { slug: string };

// =============================================================================
// STATIC PARAMS + METADATA
// =============================================================================

export function generateStaticParams() {
  return GUIDES_EN.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlugEn(slug);

  if (!guide) {
    return constructMetadata({
      title: 'Guide Not Found',
      path: `/en/guides/${slug}`,
      noIndex: true,
      locale: 'en',
    });
  }

  // hreflang alternates: English canonical + Hebrew sibling + x-default=Hebrew.
  // constructMetadata builds languages[] automatically from SUPPORTED_LANGUAGES,
  // but we override here to point EN explicitly at /en/... and HE at /guides/...
  const canonical = `${SITE_CONFIG.url}/en/guides/${guide.slug}`;
  const hebrewUrl = `${SITE_CONFIG.url}/guides/${guide.hebrewSlug}`;

  return {
    ...constructMetadata({
      title: guide.h1,
      description: guide.metaDescription,
      path: `/en/guides/${guide.slug}`,
      locale: 'en',
      type: 'article',
      publishedTime: `${guide.lastUpdated}T00:00:00+03:00`,
      modifiedTime: `${guide.lastUpdated}T00:00:00+03:00`,
      keywords: [guide.targetKeyword, ...guide.relatedKeywords],
      image: `${SITE_CONFIG.url}/og?slug=${encodeURIComponent(guide.slug)}&locale=en`,
    }),
    alternates: {
      canonical,
      languages: {
        en: canonical,
        'en-US': canonical,
        'en-IL': canonical,
        he: hebrewUrl,
        'he-IL': hebrewUrl,
        'x-default': hebrewUrl,
      },
    },
  };
}

// =============================================================================
// JSON-LD BUILDERS
// =============================================================================

function buildArticleSchema(guide: GuideEn) {
  const url = `${SITE_CONFIG.url}/en/guides/${guide.slug}`;
  const hebrewUrl = `${SITE_CONFIG.url}/guides/${guide.hebrewSlug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: guide.h1,
    alternativeHeadline: guide.targetKeyword,
    description: guide.metaDescription,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'en',
    datePublished: `${guide.lastUpdated}T00:00:00+03:00`,
    dateModified: `${guide.lastUpdated}T00:00:00+03:00`,
    author: {
      '@id': `${SITE_CONFIG.url}/#organization`,
      '@type': 'Organization',
      name: 'WeCcelerate',
    },
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
      '@type': 'Organization',
      name: 'WeCcelerate',
      logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/logo.png` },
    },
    keywords: [guide.targetKeyword, ...guide.relatedKeywords].join(', '),
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
    // Explicit cross-language link to the Hebrew sibling
    workTranslation: {
      '@type': 'Article',
      '@id': `${hebrewUrl}#article`,
      inLanguage: 'he-IL',
      url: hebrewUrl,
    },
  };
}

function buildFaqSchema(guide: GuideEn) {
  const url = `${SITE_CONFIG.url}/en/guides/${guide.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    inLanguage: 'en',
    mainEntity: guide.faqs.map((faq, i) => ({
      '@type': 'Question',
      '@id': `${url}#faq-${i + 1}`,
      position: i + 1,
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
        inLanguage: 'en',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
      },
    })),
  };
}

function buildHowToSchema(guide: GuideEn) {
  if (!guide.howToSteps || guide.howToSteps.length === 0) return null;
  const url = `${SITE_CONFIG.url}/en/guides/${guide.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: guide.h1,
    description: guide.speakableAnswer,
    inLanguage: 'en',
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

function buildBreadcrumbSchema(guide: GuideEn) {
  const url = `${SITE_CONFIG.url}/en/guides/${guide.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.url },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_CONFIG.url}/en/guides` },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.targetKeyword,
        item: url,
      },
    ],
  };
}

// =============================================================================
// PAGE
// =============================================================================

export default async function GuideDetailPageEn({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuideBySlugEn(slug);

  if (!guide) notFound();

  const relatedGuides = getRelatedGuidesEn(guide);
  const category = GUIDE_CATEGORIES_EN[guide.category];
  const hebrewUrl = `/guides/${guide.hebrewSlug}`;

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
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16" dir="ltr" lang="en">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/en" className="hover:text-slate-900">
              Home
            </Link>
            <span className="mx-2">›</span>
            <Link href="/en/guides" className="hover:text-slate-900">
              Guides
            </Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">
              {guide.targetKeyword}
            </span>
          </nav>

          {/* Language switch to Hebrew */}
          <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <span className="text-slate-600">Reading in English</span>
            <Link
              href={hebrewUrl}
              hrefLang="he"
              className="font-medium text-blue-700 hover:underline"
              aria-label="Read this guide in Hebrew"
            >
              קרא בעברית ←
            </Link>
          </div>

          {/* Header */}
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                {category.en}
              </span>
              <span>{guide.readingTimeMinutes} min read</span>
              <span>·</span>
              <time dateTime={guide.lastUpdated}>Updated {guide.lastUpdated}</time>
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
              {guide.h1}
            </h1>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Quick Answer
              </div>
              <p data-speakable className="text-lg leading-relaxed text-slate-900">
                {guide.speakableAnswer}
              </p>
            </div>
          </header>

          {/* Table of contents */}
          <nav
            aria-label="Table of Contents"
            className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Contents
            </h2>
            <ol className="list-decimal space-y-1.5 pl-5 text-slate-700">
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
                    Step-by-step
                  </a>
                </li>
              )}
              <li>
                <a href="#faq" className="hover:text-blue-700 hover:underline">
                  FAQ
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
                  <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700">
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
            <section
              id="howto"
              className="mb-12 scroll-mt-24 rounded-2xl border border-slate-200 p-6"
            >
              <h2 className="mb-6 text-2xl font-bold text-slate-900">Step-by-step</h2>
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
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
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
              The WeCcelerate team has supported 40+ ventures that collectively raised over
              $150M. Start with a free introductory call.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Get in touch
              </Link>
              <Link
                href={guide.ctaServicePath}
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Learn about this service
              </Link>
            </div>
          </section>

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-bold text-slate-900">Related Guides</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/en/guides/${g.slug}`}
                    className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-400 hover:shadow-sm"
                  >
                    <div className="mb-1 text-xs text-slate-500">
                      {GUIDE_CATEGORIES_EN[g.category].en}
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
