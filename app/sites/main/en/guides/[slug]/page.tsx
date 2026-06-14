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

      <article
        className="min-h-screen bg-[#070b1e] text-white font-heebo"
        id="main-content"
      >
        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16" dir="ltr" lang="en">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <span className="mx-2">›</span>
            <Link href="/en/guides" className="hover:text-white/80 transition-colors">
              Guides
            </Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-white/80">
              {guide.targetKeyword}
            </span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-3 text-xs text-white/40">
              <span className="rounded-full border border-[#c8a951]/30 bg-[#c8a951]/10 px-3 py-1 font-semibold text-[#e8d48b] uppercase tracking-wider">
                {category.en}
              </span>
              <span>{guide.readingTimeMinutes} min read</span>
              <span>·</span>
              <time dateTime={guide.lastUpdated}>Updated {guide.lastUpdated}</time>
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-tight text-white md:text-4xl">
              {guide.h1}
            </h1>

            <div className="rounded-2xl border border-[#c8a951]/25 bg-gradient-to-br from-[#c8a951]/[0.08] via-transparent to-[#c8a951]/[0.04] p-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#c8a951]">
                Quick Answer
              </div>
              <p data-speakable className="text-lg leading-relaxed text-white">
                {guide.speakableAnswer}
              </p>
            </div>
          </header>

          {/* Table of contents */}
          <nav
            aria-label="Table of Contents"
            className="mb-10 rounded-2xl border border-white/8 bg-white/[0.02] p-5"
          >
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#c8a951]">
              Contents
            </h2>
            <ol className="list-decimal space-y-1.5 pl-5 text-white/70">
              {guide.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#section-${i + 1}`} className="hover:text-[#e8d48b] transition-colors">
                    {s.heading}
                  </a>
                </li>
              ))}
              {guide.howToSteps && (
                <li>
                  <a href="#howto" className="hover:text-[#e8d48b] transition-colors">
                    Step-by-step
                  </a>
                </li>
              )}
              <li>
                <a href="#faq" className="hover:text-[#e8d48b] transition-colors">
                  FAQ
                </a>
              </li>
            </ol>
          </nav>

          {/* Body sections */}
          <div className="space-y-12">
            {guide.sections.map((section, i) => (
              <section key={i} id={`section-${i + 1}`} className="scroll-mt-24">
                <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight text-white">{section.heading}</h2>
                <div className="space-y-4 text-white/75 leading-relaxed">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {section.list && (
                    <ul className="list-disc space-y-2 pl-6 marker:text-[#c8a951]">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* HowTo steps */}
          {guide.howToSteps && (
            <section
              id="howto"
              className="mt-14 scroll-mt-24 rounded-2xl border border-white/8 bg-white/[0.02] p-7"
            >
              <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-3">
                Step by step
              </p>
              <h2 className="mb-6 text-2xl md:text-3xl font-bold tracking-tight text-white">Step-by-step</h2>
              <ol className="space-y-5">
                {guide.howToSteps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c8a951] to-[#e8d48b] font-bold text-[#070b1e] shadow-lg shadow-[#c8a951]/20"
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-white">{step.name}</h3>
                      <p className="text-white/65 leading-relaxed">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* FAQ */}
          <section id="faq" className="mt-14 scroll-mt-24">
            <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-3">
              FAQ
            </p>
            <h2 className="mb-6 text-2xl md:text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {guide.faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 open:border-[#c8a951]/30 open:bg-[#c8a951]/[0.04] transition-colors"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-3 text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 text-[#c8a951] transition group-open:rotate-180"
                    >
                      ⌄
                    </span>
                  </summary>
                  <div className="mt-3 leading-relaxed text-white/70">{faq.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA to service */}
          <section className="mt-14 relative overflow-hidden rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.10] via-transparent to-[#c8a951]/[0.04] p-8">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-3 text-2xl md:text-3xl font-bold text-white">{guide.ctaLabel}</h2>
              <p className="mb-6 text-white/70 leading-relaxed">
                The WeCcelerate team has supported ventures launched that collectively significant capital raised. Start with a free introductory call.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-6 py-3 font-bold rounded-xl shadow-lg shadow-[#c8a951]/20 hover:shadow-xl hover:shadow-[#c8a951]/30 transition-all"
                >
                  Get in touch
                </Link>
                <Link
                  href={guide.ctaServicePath}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-white/40 hover:bg-white/[0.04] transition-all"
                >
                  Learn about this service
                </Link>
              </div>
            </div>
          </section>

          {/* Related guides */}
          {relatedGuides.length > 0 && (
            <section className="mt-14">
              <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-3">
                Related reads
              </p>
              <h2 className="mb-5 text-2xl md:text-3xl font-bold tracking-tight text-white">Related Guides</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/en/guides/${g.slug}`}
                    className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.04] transition-all"
                  >
                    <div className="mb-1 text-xs text-[#c8a951] uppercase tracking-wider font-semibold">
                      {GUIDE_CATEGORIES_EN[g.category].en}
                    </div>
                    <div className="font-semibold text-white group-hover:text-[#e8d48b] transition-colors">
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
