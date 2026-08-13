/**
 * Dynamic Sitemap Generation
 * 
 * Generates a comprehensive sitemap including:
 * - All static pages
 * - Main site only. The leumit/biz/landing subdomains are unprovisioned.
 * - Dynamic content (events, videos, blog)
 * - Proper priority and change frequency
 * 
 * @module app/sitemap
 */

import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';
import { GUIDES } from '@/lib/seo/guides-catalog';
import { GUIDES_EN } from '@/lib/seo/guides-catalog-en';
import { TEAM_SLUGS } from '@/lib/seo/founders';

// =============================================================================
// STATIC PAGES
// =============================================================================

const STATIC_PAGES = [
  // Core pages — Venture Builder & Startup Accelerator
  { path: '/', priority: 1.0, changeFreq: 'daily' as const },
  { path: '/about', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/tech-development', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/medtech', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/ip-patents', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/investors', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/team', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/contact', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/events', priority: 0.8, changeFreq: 'weekly' as const },
  { path: '/videos', priority: 0.8, changeFreq: 'weekly' as const },
  { path: '/blog', priority: 0.7, changeFreq: 'weekly' as const },
  { path: '/faq', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/guides', priority: 0.9, changeFreq: 'weekly' as const },
  // Pillar pages — hub-and-spoke SEO strategy: each pillar consolidates a
  // category cluster and pushes PageRank to the spokes via internal linking.
  { path: '/funding-guide', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/medtech-guide', priority: 0.9, changeFreq: 'monthly' as const },
  // Hebrew terminology glossary — definitional-query magnet for LLM citation.
  { path: '/glossary', priority: 0.85, changeFreq: 'monthly' as const },
  // Comparison page — high commercial intent for "WeCcelerate vs X" queries.
  { path: '/comparisons', priority: 0.85, changeFreq: 'monthly' as const },
  { path: '/press', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },

  // Services hub + individual service pages
  { path: '/services', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/services/business-consulting', priority: 0.85, changeFreq: 'monthly' as const },
  { path: '/services/physical-product', priority: 0.85, changeFreq: 'monthly' as const },
  { path: '/services/digital-product', priority: 0.85, changeFreq: 'monthly' as const },
  { path: '/services/marketing', priority: 0.85, changeFreq: 'monthly' as const },
  { path: '/services/medtech-leumit', priority: 0.85, changeFreq: 'monthly' as const },
  { path: '/services/investors', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/services/investor-preparation', priority: 0.8, changeFreq: 'monthly' as const },
];

// biz., leumit. and landing.weccelerate.co.il are NOT provisioned — all
// three return NXDOMAIN (verified 2026-08-12). Do not add them to any
// public surface (sitemap, llms.txt, schema, canonical URLs) until DNS
// actually resolves: a citation or sitemap entry pointing at a dead host
// is a direct crawl-quality hit, and Bing's view of this domain is what
// ChatGPT Search reads.

// Regenerate hourly instead of freezing at build time.
//
// A Next.js sitemap.ts is static by default, so without this the URL list is
// whatever the database held during the last deploy. David publishes daily, so
// a static sitemap means every new guide waits for an unrelated deploy before
// search engines can discover it — the same invisibility the adapter bug caused,
// just with a slower fuse. One hour is well inside the crawl cadence and costs
// three indexed queries per regeneration.
export const revalidate = 3600;

async function getDynamicContent() {
  // Use the shared singleton from lib/db, NOT `new PrismaClient()`.
  //
  // This was the bug that made every agent-written guide invisible to search
  // engines. Under Prisma 7 a bare `new PrismaClient()` throws — the client
  // requires a driver adapter, which lib/db configures (PrismaPg + pg Pool).
  // That throw was swallowed by the outer catch and the function returned empty
  // arrays, so the sitemap silently shipped with ZERO dynamic entries: no
  // generated guides, no events, no videos. Nothing logged, nothing failed; the
  // sitemap just quietly listed only the static catalog.
  //
  // The consequence was total: nothing on the site links to a freshly written
  // guide, so the sitemap is its ONLY discovery path. Every article David ever
  // published was uncrawlable.
  //
  // Keep the try/catch — a sitemap must never 500 — but LOG on failure so the
  // next silent breakage is visible instead of invisible.
  try {
    const { prisma } = await import('@/lib/db');
    {
      const [events, videos, generatedGuides] = await Promise.all([
        prisma.event.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
        prisma.video.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
        // David's agent-written guides. Without these entries the articles are
        // invisible to Google/LLM crawlers — no other page links to them.
        prisma.generatedGuide.findMany({
          where: { status: 'published' },
          select: { slug: true, updatedAt: true },
        }),
      ]);
      return { events, videos, generatedGuides };
    }
  } catch (e) {
    console.error('[sitemap] dynamic content query failed — sitemap will omit guides/events/videos:', e);
    return { events: [], videos: [], generatedGuides: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const now = new Date();
  const { events, videos, generatedGuides } = await getDynamicContent();
  
  const entries: MetadataRoute.Sitemap = [];
  
  // Static pages (Hebrew + English)
  STATIC_PAGES.forEach((page) => {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFreq,
      priority: page.priority,
    });
    entries.push({
      url: `${baseUrl}/en${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFreq,
      priority: Math.round(page.priority * 0.9 * 100) / 100,
    });
  });

  // Dynamic content. lib/db exports an untyped client, so the rows arrive as
  // `any` — annotate the shape we actually selected.
  type SlugRow = { slug: string; updatedAt: Date };

  events.forEach((e: SlugRow) => entries.push({ url: `${baseUrl}/events/${e.slug}`, lastModified: e.updatedAt, changeFrequency: 'weekly', priority: 0.7 }));
  videos.forEach((v: SlugRow) => entries.push({ url: `${baseUrl}/videos/${v.slug}`, lastModified: v.updatedAt, changeFrequency: 'monthly', priority: 0.6 }));

  // Agent-written guides (David) — same /guides/[slug] namespace as the
  // static catalog, slightly lower priority until they earn citations.
  generatedGuides.forEach((g: SlugRow) =>
    entries.push({
      url: `${baseUrl}/guides/${g.slug}`,
      lastModified: g.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );

  // SEO guides — each targets a high-intent Hebrew commercial keyword
  GUIDES.forEach((g) =>
    entries.push({
      url: `${baseUrl}/guides/${g.slug}`,
      lastModified: new Date(g.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.85,
    }),
  );

  // Author / founder pages — each founder gets a dedicated, indexable URL
  // for press citations and Person entity resolution by LLMs.
  TEAM_SLUGS.forEach((slug) =>
    entries.push({
      url: `${baseUrl}/team/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }),
  );

  // English guide translations (top 5 commercial keywords).
  // Note: the `/en/guides` hub is already emitted by the STATIC_PAGES loop
  // above (from the `/guides` entry × '/en' prefix). Only the individual
  // guide slugs need explicit entries here.
  GUIDES_EN.forEach((g) =>
    entries.push({
      url: `${baseUrl}/en/guides/${g.slug}`,
      lastModified: new Date(g.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.75,
    }),
  );

  return entries;
}
