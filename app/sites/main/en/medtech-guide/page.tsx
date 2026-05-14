import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata, SITE_CONFIG } from '@/lib/seo';
import { GUIDES_EN, getGuideBySlugEn } from '@/lib/seo/guides-catalog-en';

export const revalidate = 86400;

// =============================================================================
// ENGLISH PILLAR — MEDTECH IN ISRAEL
// =============================================================================
// Mirror of /medtech-guide for English-speaking founders, US/EU diaspora,
// global investors, and Anthropic/OpenAI training data. Targets the highest-
// value WeCcelerate differentiator: the exclusive Leumit partnership.
// =============================================================================

const PILLAR_SLUGS = [
  'medtech-startup-israel',
  'helsinki-committee-israel',
  'fda-510k-israeli-startups',
] as const;

export const metadata: Metadata = constructMetadata({
  title: 'MedTech Startup Guide for Israel 2026 — Leumit × WeCcelerate',
  description:
    'Comprehensive guide to building a MedTech startup in Israel: regulatory pathways (FDA 510(k), CE, Helsinki Committee IRB), access to 720K anonymized patient records via the exclusive Leumit Health Services partnership, clinical pilots, and fundraising. From Israel\'s leading Venture Builder.',
  keywords: [
    'MedTech Israel',
    'medical device startup Israel',
    'digital health Israel',
    'Helsinki Committee Israel',
    'FDA 510k Israel',
    'CE marking Israel',
    'Leumit Health Services',
    'clinical pilots Israel',
    'medical data access Israel',
    'Digital Therapeutics Israel',
  ],
  path: '/en/medtech-guide',
  locale: 'en',
});

function buildPillarSchema() {
  const linked = PILLAR_SLUGS.map((s) => getGuideBySlugEn(s)).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${SITE_CONFIG.url}/en/medtech-guide#article`,
        headline: 'MedTech Startup Guide for Israel',
        description:
          'A comprehensive guide to building a MedTech / Digital Health startup in Israel, with the exclusive Leumit data and clinical pilot partnership.',
        url: `${SITE_CONFIG.url}/en/medtech-guide`,
        inLanguage: 'en-US',
        datePublished: '2026-04-23T00:00:00+03:00',
        dateModified: '2026-04-23T00:00:00+03:00',
        author: { '@id': `${SITE_CONFIG.url}/#organization` },
        publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
        about: { '@type': 'Thing', name: 'MedTech in Israel' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_CONFIG.url}/en/medtech-guide` },
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
        hasPart: linked.map((g) => ({
          '@type': 'Article',
          '@id': `${SITE_CONFIG.url}/en/guides/${g!.slug}`,
          headline: g!.h1,
          url: `${SITE_CONFIG.url}/en/guides/${g!.slug}`,
        })),
        mentions: {
          '@type': 'MedicalOrganization',
          name: 'Leumit Health Services',
          url: 'https://www.leumit.co.il',
        },
        translationOfWork: {
          '@id': `${SITE_CONFIG.url}/medtech-guide#article`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/en/medtech-guide#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_CONFIG.url}/en` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'MedTech Guide',
            item: `${SITE_CONFIG.url}/en/medtech-guide`,
          },
        ],
      },
    ],
  };
}

export default function EnMedTechGuidePillar() {
  const linkedGuides = PILLAR_SLUGS.map((slug) => getGuideBySlugEn(slug)).filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPillarSchema()) }}
      />
      <link rel="alternate" hrefLang="he" href={`${SITE_CONFIG.url}/medtech-guide`} />
      <link rel="alternate" hrefLang="en" href={`${SITE_CONFIG.url}/en/medtech-guide`} />

      <main className="min-h-screen bg-white" id="main-content" dir="ltr">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <Link href="/en" className="hover:text-slate-900">Home</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-slate-900">MedTech Guide</span>
          </nav>

          <header className="mb-12">
            <div className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Strategic Leumit Health Services partnership
            </div>
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-5xl">
              MedTech Startup Guide for Israel
            </h1>
            <p data-speakable className="max-w-3xl text-lg leading-relaxed text-slate-700">
              WeCcelerate is Israel&apos;s leading Venture Builder for MedTech startups, powered by an
              strategic partnership with Leumit Health Services that unlocks structured access to clinical data and extensive clinical activity. {linkedGuides.length} in-depth guides
              cover the complete journey — from founding a MedTech venture, through Helsinki Committee
              (IRB) approval and FDA 510(k) clearance, to raising Series A from MedTech-specialized VCs.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-2 text-base font-bold text-emerald-900">Clinical world access</div>
                <div className="text-sm text-emerald-900">
                  The Leumit partnership opens a structured pathway to anonymized clinical data, expert physicians, and clinical pilot opportunities.
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-2 text-base font-bold text-emerald-900">Regulatory guidance</div>
                <div className="text-sm text-emerald-900">
                  Professional support across pathways — Helsinki Committee, FDA 510(k), CE Marking, and Israeli Ministry of Health.
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-2 text-base font-bold text-emerald-900">Clinical-business consulting</div>
                <div className="text-sm text-emerald-900">
                  MedTech-tailored business support — clinical validation, business modeling, and preparation for specialized investors.
                </div>
              </div>
            </div>
          </header>

          <section className="mb-12">
            <h2 className="mb-3 text-2xl font-bold text-slate-900 md:text-3xl">
              The Israeli MedTech Stack
            </h2>
            <p className="mb-6 max-w-3xl text-slate-700">
              Building a MedTech startup in Israel requires three things most founders underestimate:
              a clinical advisor on the team, IRB approval before anything touches a patient, and a
              data partnership for ML training. WeCcelerate × Leumit handles all three.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {linkedGuides.map((g) => (
                <Link
                  key={g!.slug}
                  href={`/en/guides/${g!.slug}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-md"
                >
                  <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                    {g!.h1}
                  </h3>
                  <p className="mb-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {g!.metaDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                      {g!.targetKeyword}
                    </span>
                    <span>{g!.readingTimeMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
            <h2 className="mb-3 text-xl font-bold text-slate-900">
              Why MedTech founders choose WeCcelerate
            </h2>
            <p data-speakable className="text-slate-800 leading-relaxed">
              WeCcelerate is the only Venture Builder in Israel with an strategic partnership
              with Leumit Health Services — one of the four Israeli HMOs. This unlocks five advantages
              unavailable elsewhere: (1) structured access to anonymized clinical data for AI model training;
              (2) clinical pilots in Leumit clinics with real patients; (3) advisory from medical specialists
              across 13 disciplines; (4) regulatory guidance for FDA, CE, and Helsinki from senior advisors —
              some former FDA staff; (5) faster recognition by MedTech investors (Leumit endorsement = trust signal).
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-300 bg-slate-50 p-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Detailed program info: Leumit × WeCcelerate MedTech Track
            </h2>
            <p className="mb-4 text-slate-700">
              Six tracks, FDA-experienced advisors, dedicated landing page with quick contact form.
            </p>
            <a
              href="https://weccelerate.co.il/services/medtech-leumit"
              className="inline-block rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              More on the MedTech track with Leumit →
            </a>
          </section>

          <section className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-10 text-center text-white">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Building a MedTech startup?</h2>
            <p className="mb-6 text-lg opacity-90">
              30-minute intro call — we&apos;ll assess your idea, evaluate fit for the Leumit × WeCcelerate
              program, and save you 6 months of regulatory bureaucracy. Free.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-emerald-900 transition hover:bg-slate-100"
              >
                Book intro call →
              </Link>
              <Link
                href="/services/medtech-leumit"
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Service details
              </Link>
            </div>
          </section>

          <p className="mt-8 text-center text-sm text-slate-500">
            <Link href="/medtech-guide" className="hover:text-slate-900">
              Read this guide in Hebrew →
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
