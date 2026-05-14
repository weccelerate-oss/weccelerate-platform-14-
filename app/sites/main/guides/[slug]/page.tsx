import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
export const dynamicParams = true;

type Params = { slug: string };

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
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['[data-speakable]'] },
    about: { '@type': 'Thing', name: guide.targetKeyword },
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

export default async function GuideDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
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

      <article
        className="min-h-screen bg-[#070b1e] text-white font-heebo"
        id="main-content"
        dir="rtl"
      >
        {/* Hero band */}
        <header className="relative overflow-hidden border-b border-white/5 pt-28 pb-12 md:pt-36 md:pb-16">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,169,81,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="container mx-auto px-4 relative z-10 max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/80 transition-colors">בית</Link>
              <span className="mx-2">›</span>
              <Link href="/guides" className="hover:text-white/80 transition-colors">מדריכים</Link>
              <span className="mx-2">›</span>
              <span aria-current="page" className="text-white/80">{guide.targetKeyword}</span>
            </nav>

            {enSlug && (
              <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm">
                <span className="text-white/55">קוראים בעברית</span>
                <Link
                  href={`/en/guides/${enSlug}`}
                  hrefLang="en"
                  className="font-semibold text-[#e8d48b] hover:text-[#c8a951] transition-colors"
                  aria-label="Read this guide in English"
                >
                  Read in English →
                </Link>
              </div>
            )}

            <div className="mb-3 flex items-center gap-3 text-xs text-white/40">
              <span className="rounded-full border border-[#c8a951]/30 bg-[#c8a951]/10 px-3 py-1 font-semibold text-[#e8d48b] uppercase tracking-wider">
                {category.he}
              </span>
              <span>{guide.readingTimeMinutes} דק׳ קריאה</span>
              <span>·</span>
              <time dateTime={guide.lastUpdated}>עודכן {guide.lastUpdated}</time>
            </div>
            <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight">
              {guide.h1}
            </h1>

            {/* Speakable answer */}
            <div className="rounded-2xl border border-[#c8a951]/25 bg-gradient-to-br from-[#c8a951]/[0.08] via-transparent to-[#c8a951]/[0.04] p-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#c8a951]">
                תשובה מהירה
              </div>
              <p data-speakable className="text-lg leading-relaxed text-white">
                {guide.speakableAnswer}
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
          {/* Table of contents */}
          <nav
            aria-label="תוכן עניינים"
            className="mb-10 rounded-2xl border border-white/8 bg-white/[0.02] p-5"
          >
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#c8a951]">
              תוכן עניינים
            </h2>
            <ol className="list-decimal space-y-1.5 pr-5 text-white/70">
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
                    שלבים מעשיים
                  </a>
                </li>
              )}
              <li>
                <a href="#faq" className="hover:text-[#e8d48b] transition-colors">
                  שאלות נפוצות
                </a>
              </li>
            </ol>
          </nav>

          {/* Body */}
          <div className="space-y-12">
            {guide.sections.map((section, i) => (
              <section key={i} id={`section-${i + 1}`} className="scroll-mt-24">
                <h2 className="mb-4 text-2xl md:text-3xl font-bold tracking-tight">{section.heading}</h2>
                <div className="space-y-4 text-white/75 leading-relaxed">
                  {section.paragraphs.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  {section.list && (
                    <ul className="list-disc space-y-2 pr-6 marker:text-[#c8a951]">
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
              <h2 className="mb-6 text-2xl md:text-3xl font-bold tracking-tight">שלבים מעשיים</h2>
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
            <h2 className="mb-6 text-2xl md:text-3xl font-bold tracking-tight">שאלות נפוצות</h2>
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

          {/* CTA */}
          <section className="mt-14 relative overflow-hidden rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.10] via-transparent to-[#c8a951]/[0.04] p-8">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)',
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-3 text-2xl md:text-3xl font-bold">{guide.ctaLabel}</h2>
              <p className="mb-6 text-white/70 leading-relaxed">
                צוות WeCcelerate ליווה סטארטאפים בפורטפוליו. שיחת הכרות ראשונה ללא עלות.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-6 py-3 font-bold rounded-xl shadow-lg shadow-[#c8a951]/20 hover:shadow-xl hover:shadow-[#c8a951]/30 transition-all"
                >
                  דברו איתנו
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href={guide.ctaServicePath}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white hover:border-white/40 hover:bg-white/[0.04] transition-all"
                >
                  עוד על השירות
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
              <h2 className="mb-5 text-2xl md:text-3xl font-bold tracking-tight">מדריכים קשורים</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {relatedGuides.map((g) => (
                  <Link
                    key={g.slug}
                    href={`/guides/${g.slug}`}
                    className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.04] transition-all"
                  >
                    <div className="mb-1 text-xs text-[#c8a951] uppercase tracking-wider font-semibold">
                      {GUIDE_CATEGORIES[g.category].he}
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
