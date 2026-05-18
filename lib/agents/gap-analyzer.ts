/**
 * Gap Analyzer — turns GEO Probe results into ContentGap rows.
 *
 * Runs daily after the Probe (cron at 06:30 UTC). For each query the Probe
 * has asked over the last 14 days:
 *   - If 0% citation rate → severity 100 (urgent gap)
 *   - If <30% citation rate → severity 70 (weak presence)
 *   - If 30–60% → severity 40 (could be stronger)
 *   - If >60% → no gap created
 *
 * Already-open gaps for the same query are de-duped.
 */

import { prisma } from '@/lib/db';
import { logDecision } from './decision-log';

const LOOKBACK_DAYS = 14;
const NO_CITE_SEVERITY = 100;
const LOW_CITE_SEVERITY = 70;
const MEDIUM_CITE_SEVERITY = 40;
const STRONG_THRESHOLD_PCT = 60;

export interface AnalyzeSummary {
  queriesAnalyzed: number;
  newGaps: number;
  refreshedGaps: number;
  resolvedGaps: number;
}

export async function analyzeGaps(): Promise<AnalyzeSummary> {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000);

  // Aggregate citation rate per query.
  const stats = await prisma.$queryRaw<
    Array<{
      query: string;
      category: string | null;
      total: bigint;
      cited: bigint;
      competitors: string[] | null;
    }>
  >`
    SELECT query,
           MAX(category) AS category,
           COUNT(*)::bigint AS total,
           SUM(CASE WHEN cited THEN 1 ELSE 0 END)::bigint AS cited,
           ARRAY_AGG(DISTINCT host) FILTER (WHERE host IS NOT NULL) AS competitors
    FROM (
      SELECT query, category, cited, error,
             SUBSTRING(url FROM '^(?:https?://)?([^/]+)') AS host
      FROM geo_probes,
           UNNEST("citedUrls") AS url
      WHERE timestamp >= ${since}
        AND error IS NULL
    ) AS expanded
    GROUP BY query
  `;

  const summary: AnalyzeSummary = {
    queriesAnalyzed: stats.length,
    newGaps: 0,
    refreshedGaps: 0,
    resolvedGaps: 0,
  };

  for (const row of stats) {
    const total = Number(row.total);
    const cited = Number(row.cited);
    const ratePct = total > 0 ? Math.round((cited / total) * 100) : 0;

    // Strong presence — close any open gap for this query.
    if (ratePct >= STRONG_THRESHOLD_PCT) {
      const closed = await prisma.contentGap.updateMany({
        where: { query: row.query, status: 'open' },
        data: { status: 'published', resolvedAt: new Date() },
      });
      summary.resolvedGaps += closed.count;
      continue;
    }

    const severity =
      ratePct === 0 ? NO_CITE_SEVERITY :
      ratePct < 30 ? LOW_CITE_SEVERITY :
      MEDIUM_CITE_SEVERITY;

    // Strip our own host from the competitor list.
    const competitors = (row.competitors ?? []).filter(
      (h: string) => h && !h.toLowerCase().includes('weccelerate.co.il'),
    );

    // Find an existing open gap for the same query (idempotent).
    const existing = await prisma.contentGap.findFirst({
      where: { query: row.query, status: { in: ['open', 'in_progress'] } },
    });

    if (existing) {
      await prisma.contentGap.update({
        where: { id: existing.id },
        data: { severity, competitors, detectedAt: new Date() },
      });
      summary.refreshedGaps += 1;
    } else {
      await prisma.contentGap.create({
        data: {
          source: ratePct === 0 ? 'probe-no-cite' : 'probe-low-rate',
          query: row.query,
          category: row.category ?? null,
          severity,
          competitors,
        },
      });
      summary.newGaps += 1;
    }
  }

  // Persist decision log so the morning digest can explain what changed.
  await logDecision({
    agent: 'gap-analyzer',
    action: 'analyzed',
    reasoning:
      `סרקתי ${summary.queriesAnalyzed} שאילתות מ-${LOOKBACK_DAYS} הימים האחרונים. ` +
      `פערים חדשים: ${summary.newGaps}. ` +
      `פערים שעודכנו: ${summary.refreshedGaps}. ` +
      `פערים שנסגרו (כי הציטוט מספיק חזק עכשיו): ${summary.resolvedGaps}.`,
    payload: { ...summary },
    success: true,
  });

  return summary;
}

/** Pick the highest-severity open gap (fairness: prefer ones we haven't tried). */
export async function pickNextGap() {
  return prisma.contentGap.findFirst({
    where: { status: 'open' },
    orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
  });
}
