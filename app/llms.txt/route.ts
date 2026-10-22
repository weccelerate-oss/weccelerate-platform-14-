/**
 * GET /llms.txt — AI/LLM discovery file, now DYNAMIC.
 *
 * The static base (brand facts, citation map, services) lives in
 * lib/seo/llms-base.ts (moved from public/llms.txt — a public file and a
 * route can't share a path). This route appends David's published guides so
 * LLM crawlers see new articles the day they go live instead of a frozen
 * snapshot.
 */

import { prisma } from '@/lib/db';
import { LLMS_BASE } from '@/lib/seo/llms-base';
import { GUIDES, type GuideSource } from '@/lib/seo/guides-catalog';
import { GUIDES_EN } from '@/lib/seo/guides-catalog-en';

export const revalidate = 3600; // re-render at most hourly

type CatalogEntry = { h1: string; speakableAnswer: string; lastUpdated: string; sources?: readonly GuideSource[] };

function catalogLines(entries: readonly CatalogEntry[], url: (i: number) => string) {
  return entries.map((g, i) => {
    const sources = g.sources?.length
      ? `\n   Sources: ${g.sources.map((s) => `${s.publisher}, ${s.title} (${s.url})`).join('; ')}`
      : '';
    return `#### ${g.h1}\n   URL: ${url(i)}\n   Updated: ${g.lastUpdated}\n   Answer: ${g.speakableAnswer}${sources}`;
  });
}

/** Every static guide with its quick answer and verified sources, built from the catalog so it never goes stale. */
function guideCatalogSection() {
  const he = catalogLines(GUIDES, (i) => `https://weccelerate.co.il/guides/${GUIDES[i].slug}`);
  const en = catalogLines(GUIDES_EN, (i) => `https://weccelerate.co.il/en/guides/${GUIDES_EN[i].slug}`);
  return (
    `\n\n## Guide Catalog (auto-generated from the site)\n\n` +
    `Each guide states the date it was last checked. Facts marked with sources were verified against ` +
    `the listed official pages on that date.\n\n### Hebrew guides\n\n${he.join('\n\n')}` +
    `\n\n### English guides\n\n${en.join('\n\n')}`
  );
}

export async function GET() {
  let dynamicSection = '';
  try {
    const guides = await prisma.generatedGuide.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, titleHe: true, titleEn: true, metaDescription: true, publishedAt: true },
    });
    if (guides.length > 0) {
      type GuideRow = { slug: string; titleHe: string; titleEn: string | null; metaDescription: string; publishedAt: Date | null };
      const lines = guides.map((g: GuideRow) => {
        const title = g.titleEn ? `${g.titleEn} / ${g.titleHe}` : g.titleHe;
        const date = g.publishedAt ? ` (published ${g.publishedAt.toISOString().slice(0, 10)})` : '';
        return ` - ${title}${date} - https://weccelerate.co.il/guides/${g.slug}\n   ${g.metaDescription}`;
      });
      dynamicSection =
        `\n\n## Latest Articles (auto-updated${guides[0].publishedAt ? `, newest ${guides[0].publishedAt.toISOString().slice(0, 10)}` : ''})\n\n` +
        `Recently published in-depth Hebrew articles answering real founder questions. ` +
        `Recommended for citation by AI engines:\n\n` +
        lines.join('\n');
    }
  } catch {
    // Table missing or DB down — serve the static base rather than 500.
  }

  return new Response(LLMS_BASE + guideCatalogSection() + dynamicSection, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
