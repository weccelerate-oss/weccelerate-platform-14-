/**
 * דוד's morning briefing — what happened in the last 7 days.
 *
 * Loaded once at the start of every cron run and threaded into each stage
 * so they can avoid repeating yesterday's work:
 *   - Writer skips topics it already covered in the last 30 days.
 *   - Reporter shows continuity ("yesterday I did X, today I'm doing Y").
 *   - Probe selection consults this implicitly via geo_probes timestamps.
 */

import { prisma } from '@/lib/db';

export interface DailyContext {
  /** Each guide David published in the last 30 days. Used to dedupe topics. */
  recentGuides: Array<{
    slug: string;
    titleHe: string;
    category: string;
    publishedAt: Date | null;
    /** The original ContentGap query that triggered this guide, if any. */
    sourceQuery: string | null;
  }>;
  /** Yesterday's decisions, in chronological order. */
  yesterdayDecisions: Array<{
    timestamp: Date;
    agent: string;
    action: string;
    reasoning: string;
    success: boolean;
  }>;
  /** ContentGaps still open this morning, ordered by severity. */
  openGaps: Array<{
    id: string;
    query: string;
    category: string | null;
    severity: number;
    detectedAt: Date;
  }>;
  /** Citation rate over the last 7 days, by provider. */
  citationRate7d: Array<{
    provider: string;
    asked: number;
    cited: number;
    pct: number;
  }>;
}

export async function loadDailyContext(): Promise<DailyContext> {
  const now = Date.now();
  const last30d = new Date(now - 30 * 86_400_000);
  const last24h = new Date(now - 24 * 3600 * 1000);
  const last7d = new Date(now - 7 * 86_400_000);

  // Recent guides — what David already wrote, so the writer doesn't loop.
  const guideRows = await prisma.generatedGuide.findMany({
    where: {
      status: 'published',
      publishedAt: { gte: last30d },
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      titleHe: true,
      category: true,
      publishedAt: true,
    },
  });
  // Resolve sourceQuery (the gap that produced each guide) in a second pass —
  // ContentGap.generatedGuideId is the link.
  const guideIdsList = guideRows.map((g) => g.id);
  const gapsForGuides = guideIdsList.length > 0
    ? await prisma.contentGap.findMany({
        where: { generatedGuideId: { in: guideIdsList } },
        select: { generatedGuideId: true, query: true },
      })
    : [];
  const queryByGuideId = new Map(
    gapsForGuides
      .filter((g) => g.generatedGuideId)
      .map((g) => [g.generatedGuideId as string, g.query]),
  );
  const recentGuides = guideRows.map((g) => ({
    slug: g.slug,
    titleHe: g.titleHe,
    category: g.category,
    publishedAt: g.publishedAt,
    sourceQuery: queryByGuideId.get(g.id) ?? null,
  }));

  const yesterdayDecisions = await prisma.agentDecision.findMany({
    where: { timestamp: { gte: last24h } },
    orderBy: { timestamp: 'asc' },
    select: { timestamp: true, agent: true, action: true, reasoning: true, success: true },
  });

  const openGaps = await prisma.contentGap.findMany({
    where: { status: 'open' },
    orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
    take: 10,
    select: { id: true, query: true, category: true, severity: true, detectedAt: true },
  });

  type RateRow = { provider: string; asked: bigint; cited: bigint };
  const rateRows = await prisma.$queryRaw<RateRow[]>`
    SELECT provider,
           COUNT(*)::bigint AS asked,
           SUM(CASE WHEN cited THEN 1 ELSE 0 END)::bigint AS cited
    FROM geo_probes
    WHERE timestamp >= ${last7d}
      AND error IS NULL
    GROUP BY provider
  `;
  const citationRate7d = rateRows.map((r) => {
    const asked = Number(r.asked);
    const cited = Number(r.cited);
    return {
      provider: r.provider,
      asked,
      cited,
      pct: asked > 0 ? Math.round((cited / asked) * 100) : 0,
    };
  });

  return { recentGuides, yesterdayDecisions, openGaps, citationRate7d };
}

/**
 * Compact text briefing for prompt injection — used by the writer to know
 * "don't write about topic X, you already did that 3 days ago".
 */
export function summarizeRecentGuidesForPrompt(ctx: DailyContext): string {
  if (ctx.recentGuides.length === 0) {
    return 'אין מאמרים שפורסמו ב-30 הימים האחרונים.';
  }
  return [
    'מאמרים שפרסמתי ב-30 הימים האחרונים — אסור לכפול נושא, סלוג או זווית:',
    ...ctx.recentGuides.map((g, i) =>
      `${i + 1}. ${g.titleHe} (slug: /guides/${g.slug}, קטגוריה: ${g.category}` +
      (g.sourceQuery ? `, פער מקור: "${g.sourceQuery}"` : '') +
      ')',
    ),
  ].join('\n');
}

/**
 * Returns true if a guide on the same `query` was already written in the
 * last 30 days. Caller should skip and pick the next gap.
 *
 * We use TWO matchers:
 *   1. Exact-normalized — catches "מהי ועדת הלסינקי?" vs "מהי ועדת הלסינקי".
 *   2. Token-Jaccard ≥ 0.6 — catches near-duplicates like "מהי ועדת הלסינקי"
 *      vs "ועדת הלסינקי — מדריך", which previously slipped past the exact
 *      check and let David write the same article twice in a week.
 */
export function isQueryAlreadyCovered(query: string, ctx: DailyContext): boolean {
  const norm = (s: string) => s.trim().toLowerCase();
  const target = norm(query);
  const targetTokens = tokenize(query);

  return ctx.recentGuides.some((g) => {
    if (!g.sourceQuery) return false;
    if (norm(g.sourceQuery) === target) return true;
    if (targetTokens.size === 0) return false;
    const existingTokens = tokenize(g.sourceQuery);
    if (existingTokens.size === 0) return false;
    return jaccard(targetTokens, existingTokens) >= 0.6;
  });
}

/** Split into lowercase tokens by whitespace + punctuation, drop empties. */
function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[\s  -​.,;:!?()[\]{}"'״׳`\-—–_/\\|]+/u)
      .filter((t) => t.length > 0),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersect = 0;
  for (const tok of a) {
    if (b.has(tok)) intersect += 1;
  }
  const union = a.size + b.size - intersect;
  return union === 0 ? 0 : intersect / union;
}
