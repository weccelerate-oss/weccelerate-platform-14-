/**
 * English guides hub: /en/guides
 *
 * Simplified mirror of the Hebrew hub at /guides. Shows the 5 translated
 * guides grouped by category, with hreflang link back to the Hebrew hub.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import {
  GUIDES_EN,
  GUIDE_CATEGORIES_EN,
  type GuideCategoryEn,
} from '@/lib/seo/guides-catalog-en';

export const revalidate = 86400;

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'WeCcelerate Startup Guides (English) — MedTech, Fundraising, Regulation',
    description: `${GUIDES_EN.length} in-depth guides for Israeli founders (English): MedTech, Helsinki Committee, FDA 510(k), fundraising, Venture Builder. Updated 2026.`,
    keywords: [
      'Israeli startup guides',
      'MedTech Israel guide',
      'FDA 510k Israeli startup',
      'Helsinki Committee Israel',
      'fundraising Israel',
      'Venture Builder guide',
    ],
    path: '/en/guides',
    locale: 'en',
  }),
  alternates: {
    canonical: `${SITE_CONFIG.url}/en/guides`,
    languages: {
      en: `${SITE_CONFIG.url}/en/guides`,
      he: `${SITE_CONFIG.url}/guides`,
      'he-IL': `${SITE_CONFIG.url}/guides`,
      'x-default': `${SITE_CONFIG.url}/guides`,
    },
  },
};

function buildCollectionPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_CONFIG.url}/en/guides#collection`,
    name: 'WeCcelerate Startup Guides — English',
    description: `${GUIDES_EN.length} practical guides for Israeli founders (English)`,
    url: `${SITE_CONFIG.url}/en/guides`,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
    publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
    hasPart: GUIDES_EN.map((g) => ({
      '@type': 'Article',
      '@id': `${SITE_CONFIG.url}/en/guides/${g.slug}`,
      headline: g.h1,
      description: g.metaDescription,
      url: `${SITE_CONFIG.url}/en/guides/${g.slug}`,
      inLanguage: 'en',
      keywords: [g.targetKeyword, ...g.relatedKeywords].join(', '),
      datePublished: g.lastUpdated,
      dateModified: g.lastUpdated,
      timeRequired: `PT${g.readingTimeMinutes}M`,
    })),
  };
}

export default function GuidesHubPageEn() {
  const categories = (Object.keys(GUIDE_CATEGORIES_EN) as GuideCategoryEn[])
    .map((cat) => ({
      category: cat,
      label: GUIDE_CATEGORIES_EN[cat],
      guides: GUIDES_EN.filter((g) => g.category === cat),
    }))
    .filter((c) => c.guides.length > 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildCollectionPageSchema()) }}
      />

      <main
        className="min-h-screen bg-[#070b1e] text-white font-heebo"
        id="main-content"
        dir="ltr"
      >
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16" lang="en">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
            <Link href="/en" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-white/80">
              Guides
            </span>
          </nav>

          <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm">
            <span className="text-white/55">Reading in English</span>
            <Link
              href="/guides"
              hrefLang="he"
              className="font-semibold text-[#e8d48b] hover:text-[#c8a951] transition-colors"
            >
              לעברית ←
            </Link>
          </div>

          <header className="mb-10">
            <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl">
              WeCcelerate Startup Guides
            </h1>
            <p data-speakable className="max-w-3xl text-lg leading-relaxed text-white/60">
              {GUIDES_EN.length} in-depth guides for founders building startups in Israel —
              MedTech regulation, Helsinki Committee, FDA 510(k), fundraising, and the
              Venture Builder model. Written by the WeCcelerate team, updated for 2026.
            </p>
          </header>

          <div className="space-y-12">
            {categories.map(({ category, label, guides }) => (
              <section key={category}>
                <h2 className="mb-2 text-2xl font-bold text-white">{label.en}</h2>
                <p className="mb-5 text-white/55">{label.description}</p>
                <ul className="space-y-3">
                  {guides.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/en/guides/${g.slug}`}
                        className="group block rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.03] to-transparent p-5 transition-all duration-300 hover:border-[#c8a951]/40 hover:from-[#c8a951]/[0.06]"
                      >
                        <div className="mb-2 text-xs text-white/40">
                          {g.readingTimeMinutes} min read · Updated {g.lastUpdated}
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-white group-hover:text-[#e8d48b] transition-colors">{g.h1}</h3>
                        <p className="text-sm text-white/55">{g.metaDescription}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <section className="mt-16 relative overflow-hidden rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.08] via-transparent to-[#c8a951]/[0.04] p-8 text-center">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-3 text-2xl font-bold text-white">Looking for something specific?</h2>
              <p className="mb-6 text-white/70">
                The Hebrew catalog has 24 guides. If you read Hebrew, start there.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/guides"
                  hrefLang="he"
                  className="rounded-xl bg-gradient-to-r from-[#c8a951] to-[#e8d48b] px-6 py-3 font-bold text-[#070b1e] shadow-lg shadow-[#c8a951]/20 transition-all hover:shadow-xl hover:shadow-[#c8a951]/30"
                >
                  Hebrew Catalog (24 guides) →
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:border-white/40 hover:bg-white/[0.04]"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
