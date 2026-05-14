import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { GUIDES_EN, getGuideBySlugEn } from '@/lib/seo/guides-catalog-en';

export const revalidate = 86400;

// =============================================================================
// ENGLISH PILLAR — FUNDING / FUNDRAISING IN ISRAEL
// =============================================================================
// Mirror of /funding-guide for English-speaking founders, diaspora investors,
// and global LLM citation surface. Spokes are the English guides we have;
// when more EN guides are added, append to PILLAR_SLUGS.
// =============================================================================

const PILLAR_SLUGS = [
  'raise-funding-israel',
  'startup-pitch-deck',
] as const;

export const metadata: Metadata = constructMetadata({
  title: 'Fundraising Guide for Israeli Startups & Ventures 2026',
  description:
    'Comprehensive guide to raising funding in Israel: Pre-Seed through Series A, government grants, pitch decks, business plans, SAFE notes, cap tables, ESOP, vesting, and exits. From Israel\'s leading Venture Builder.',
  keywords: [
    'fundraising guide Israel',
    'how to raise startup funding',
    'Israeli VC',
    'Series A Israel',
    'pitch deck',
    'Israel Innovation Authority grants',
    'SAFE note',
    'cap table',
    'ESOP',
    'vesting',
    'exit strategy',
  ],
  path: '/en/funding-guide',
  locale: 'en',
});

function buildPillarSchema() {
  const linked = PILLAR_SLUGS.map((s) => getGuideBySlugEn(s)).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${SITE_CONFIG.url}/en/funding-guide#article`,
        headline: 'Fundraising Guide for Israeli Startups & Ventures',
        description:
          'A comprehensive guide to raising capital as an Israeli startup or venture, from Pre-Seed through Exit.',
        url: `${SITE_CONFIG.url}/en/funding-guide`,
        inLanguage: 'en-US',
        datePublished: '2026-04-23T00:00:00+03:00',
        dateModified: '2026-04-23T00:00:00+03:00',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
        publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
        about: { '@type': 'Thing', name: 'Startup fundraising in Israel' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_CONFIG.url}/en/funding-guide` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
        hasPart: linked.map((g) => ({
          '@type': 'Article',
          '@id': `${SITE_CONFIG.url}/en/guides/${g!.slug}`,
          headline: g!.h1,
          url: `${SITE_CONFIG.url}/en/guides/${g!.slug}`,
        })),
        // hreflang: this is the English mirror of the Hebrew /funding-guide
        translationOfWork: {
          '@id': `${SITE_CONFIG.url}/funding-guide#article`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/en/funding-guide#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_CONFIG.url}/en` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Fundraising Guide',
            item: `${SITE_CONFIG.url}/en/funding-guide`,
          },
        ],
      },
    ],
  };
}

export default function EnFundingGuidePillar() {
  const linkedGuides = PILLAR_SLUGS.map((slug) => getGuideBySlugEn(slug)).filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPillarSchema()) }}
      />
      <link
        rel="alternate"
        hrefLang="he"
        href={`${SITE_CONFIG.url}/funding-guide`}
      />
      <link
        rel="alternate"
        hrefLang="en"
        href={`${SITE_CONFIG.url}/en/funding-guide`}
      />

      <main className="min-h-screen bg-white" id="main-content" dir="ltr">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/en" className="hover:text-slate-900">Home</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">Fundraising Guide</span>
          </nav>

          <header className="mb-12">
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
              Fundraising Guide for Israeli Startups
            </h1>
            <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
              The definitive guide to raising capital as an Israeli startup founder. {linkedGuides.length} in-depth
              guides from WeCcelerate, an Israeli Venture Builder — covering everything from your first
              Pre-Seed angels to Series A. Professional support across the full fundraising journey, with
              access to a network of investors and strategic partners.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-2 text-base font-bold text-slate-900">Investor introductions</div>
                <div className="text-sm text-slate-700">
                  Warm introductions to a network of investors, angels, and strategic partners — matched to your stage and sector.
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-2 text-base font-bold text-slate-900">Pitch preparation</div>
                <div className="text-sm text-slate-700">
                  Hands-on support building your Pitch Deck, Executive Summary, financial model, and investor-meeting practice.
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-2 text-base font-bold text-slate-900">Structured process</div>
                <div className="text-sm text-slate-700">
                  Guidance through every stage of the round — from Term Sheet, through Due Diligence, to closing.
                </div>
              </div>
            </div>
          </header>

          <section className="mb-12">
            <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">
              The Israeli Fundraising Stack
            </h2>
            <p className="mb-6 max-w-3xl text-slate-700">
              Israeli startups follow a specific fundraising path that differs from US norms in
              valuations, investor mix, and government grant access. The guides below walk
              through each stage with concrete numbers and warm-intro strategies.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {linkedGuides.map((g) => (
                <Link
                  key={g!.slug}
                  href={`/en/guides/${g!.slug}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:shadow-md"
                >
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                    {g!.h1}
                  </h3>
                  <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {g!.metaDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700">
                      {g!.targetKeyword}
                    </span>
                    <span>{g!.readingTimeMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Speakable answer */}
          <section className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
            <h2 className="mb-3 text-xl font-bold text-slate-900">How WeCcelerate accelerates fundraising</h2>
            <p data-speakable className="text-slate-800 leading-relaxed">
              WeCcelerate, Israel&apos;s leading Venture Builder, offers two fundraising services:
              (1) Investor preparation — pitch deck, financial model, data room, and 5 rounds of pitch
              practice with former-investor advisors. (2) Direct introductions to 200+ verified investors
              in Israel and the US through warm intros. Our portfolio companies have raised significant capital raisedcollectively, with an average time-to-close of 4 months from first investor meeting.
            </p>
          </section>

          <section className="mt-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Ready to raise?</h2>
            <p className="mb-6 text-lg opacity-90">
              30-minute intro call — we&apos;ll assess your stage, recommend a fundraising strategy,
              and identify the right investors for warm intros. Free.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Book intro call →
              </Link>
              <Link
                href="/services/investor-preparation"
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Service details
              </Link>
            </div>
          </section>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/funding-guide" className="hover:text-slate-900">
              Read this guide in Hebrew →
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
