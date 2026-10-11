/**
 * Which guide category a YouTube video belongs to, from its title, tags and
 * description. Drives the lead form and the "related guides" block on
 * /videos/[slug], so a fundraising video points at fundraising guides and
 * tags its lead with the investors service.
 *
 * Keyword buckets, checked most-specific first; anything unmatched is a
 * general startup video.
 */

import { prisma } from '@/lib/db';
import { GUIDES } from '@/lib/seo/guides-catalog';

export type VideoTopic = 'medtech' | 'fundraising' | 'product-development' | 'startup-basics';

const RULES: Array<[VideoTopic, RegExp]> = [
  ['medtech', /רפוא|מדיקל|med ?tech|בריאות|לאומית|קליני|רופא|מטופל|digital health/i],
  ['fundraising', /משקיע|גיוס|השקע|הון סיכון|\bvc\b|אנג'ל|angel|פיץ'?|pitch|מצגת|קרן|exit|אקזיט/i],
  ['product-development', /אפליקצי|פיתוח|מוצר|\bmvp\b|תוכנה|\bapp\b|\bai\b|בינה מלאכותית|טכנולוג|אב.?טיפוס|הנדס/i],
];

export function videoTopic(text: string): VideoTopic {
  for (const [topic, re] of RULES) if (re.test(text)) return topic;
  return 'startup-basics';
}

export interface RelatedGuide {
  href: string;
  title: string;
}

/** Hebrew words worth matching on: three letters or more, no punctuation. */
function words(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3),
  );
}

/**
 * Up to `limit` guides in the video's category, ordered by how many title
 * words they share with the video. Published generated guides and the static
 * catalog are both candidates. Never throws: a DB failure just means the
 * static catalog alone.
 */
export async function relatedGuides(topic: VideoTopic, videoText: string, limit = 3): Promise<RelatedGuide[]> {
  const cats = topic === 'medtech' ? ['medtech', 'regulatory'] : [topic];
  const pool: RelatedGuide[] = GUIDES.filter((g) => cats.includes(g.category)).map((g) => ({
    href: `/guides/${g.slug}`,
    title: g.h1,
  }));

  try {
    const generated = await prisma.generatedGuide.findMany({
      where: { status: 'published', category: { in: cats } },
      select: { slug: true, titleHe: true },
      orderBy: { publishedAt: 'desc' },
      take: 60,
    });
    for (const g of generated as Array<{ slug: string; titleHe: string }>) {
      pool.push({ href: `/guides/${g.slug}`, title: g.titleHe });
    }
  } catch {
    /* static catalog is enough */
  }

  const vw = words(videoText);
  const seen = new Set<string>();
  return pool
    .filter((g) => (seen.has(g.href) ? false : (seen.add(g.href), true)))
    .map((g, i) => ({ g, i, score: [...words(g.title)].filter((w) => vw.has(w)).length }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, limit)
    .map(({ g }) => g);
}
