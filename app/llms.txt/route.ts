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

export const revalidate = 3600; // re-render at most hourly

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

  return new Response(LLMS_BASE + dynamicSection, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
