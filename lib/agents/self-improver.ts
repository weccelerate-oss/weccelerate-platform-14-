/**
 * Self-Improver — the agent that watches the agent.
 *
 * Runs daily after the writer. Looks at every guide we've published in
 * the last 30 days and asks: "did the gap actually close?" If a guide
 * is >14 days old and the original query is still uncited, the gap is
 * reopened with a "needs-deeper-treatment" hint so the next writer run
 * tries a different angle.
 *
 * Also triggers competitor surge alerts: if a competitor host shows up
 * in citations significantly more this week than last, log it loudly.
 */

import { prisma } from '@/lib/db';
import { logDecision } from './decision-log';

const REFRESH_AFTER_DAYS = 14;
const COMPETITOR_SURGE_MULTIPLIER = 2; // 2× growth week-over-week = surge

export interface ImproveSummary {
  guidesEvaluated: number;
  guidesRefreshed: number;
  competitorSurges: number;
  competitorsTracked: number;
}

export async function runSelfImprover(): Promise<ImproveSummary> {
  const summary: ImproveSummary = {
    guidesEvaluated: 0,
    guidesRefreshed: 0,
    competitorSurges: 0,
    competitorsTracked: 0,
  };

  // -- Step 1: refresh underperforming guides --
  const refreshCutoff = new Date(Date.now() - REFRESH_AFTER_DAYS * 86_400_000);
  const matureGuides = await prisma.generatedGuide.findMany({
    where: {
      status: 'published',
      publishedAt: { lt: refreshCutoff },
      firstCitedAt: null, // never cited yet
    },
    take: 50,
  });
  summary.guidesEvaluated = matureGuides.length;

  for (const guide of matureGuides) {
    // Reopen the original gap so the writer takes another shot, with a
    // hint to try a different angle this time.
    const originalGap = await prisma.contentGap.findFirst({
      where: { generatedGuideId: guide.id },
    });
    if (!originalGap) continue;

    await prisma.contentGap.update({
      where: { id: originalGap.id },
      data: {
        status: 'open',
        severity: Math.min(100, originalGap.severity + 15),
        rejectReason: `מאמר קודם (${guide.slug}) פורסם לפני ${REFRESH_AFTER_DAYS}+ ימים אך לא הביא ציטוטים. נסה זווית חדשה — אולי כותרת אחרת, פירוט עמוק יותר, או case study.`,
      },
    });

    await logDecision({
      agent: 'self-improver',
      action: 'queued-refresh',
      reasoning:
        `המאמר "${guide.titleHe}" פורסם לפני ${REFRESH_AFTER_DAYS}+ ימים, אך עדיין לא קיבל ציטוט. ` +
        `החזרתי את הפער "${originalGap.query}" לתור (severity ${originalGap.severity + 15}) עם הוראה לכותב לנסות זווית אחרת בריצה הבאה.`,
      payload: { guideId: guide.id, slug: guide.slug, gapId: originalGap.id },
    });
    summary.guidesRefreshed += 1;
  }

  // -- Step 2: competitor surge detection --
  // Compare last 7 days vs the 7 before that.
  const now = new Date();
  const oneWeek = 7 * 86_400_000;
  const recent = new Date(now.getTime() - oneWeek);
  const prior = new Date(now.getTime() - 2 * oneWeek);

  type CompetitorRow = { competitor_host: string; recent_count: bigint; prior_count: bigint };
  const surgeRows = await prisma.$queryRaw<CompetitorRow[]>`
    WITH expanded AS (
      SELECT timestamp,
             SUBSTRING(url FROM '^(?:https?://)?([^/]+)') AS competitor_host
      FROM geo_probes,
           UNNEST(cited_urls) AS url
      WHERE error IS NULL
        AND timestamp >= ${prior}
    )
    SELECT competitor_host,
           SUM(CASE WHEN timestamp >= ${recent} THEN 1 ELSE 0 END)::bigint AS recent_count,
           SUM(CASE WHEN timestamp <  ${recent} THEN 1 ELSE 0 END)::bigint AS prior_count
    FROM expanded
    WHERE competitor_host IS NOT NULL
      AND competitor_host NOT LIKE '%weccelerate%'
    GROUP BY competitor_host
    HAVING SUM(CASE WHEN timestamp >= ${recent} THEN 1 ELSE 0 END) > 0
  `;

  for (const row of surgeRows) {
    const recentN = Number(row.recent_count);
    const priorN = Number(row.prior_count);
    summary.competitorsTracked += 1;

    const isSurge =
      recentN >= 3 &&
      (priorN === 0 || recentN >= priorN * COMPETITOR_SURGE_MULTIPLIER);

    if (isSurge) {
      summary.competitorSurges += 1;
      await logDecision({
        agent: 'competitor-watch',
        action: 'surge-detected',
        reasoning:
          `המתחרה ${row.competitor_host} זינק בציטוטים: ${priorN} → ${recentN} בשבועיים האחרונים ` +
          `(פי ${priorN === 0 ? '∞' : Math.round((recentN / priorN) * 10) / 10}). ` +
          `שווה לבדוק מה הם פרסמו לאחרונה ולשקול לכתוב תגובת תוכן חזקה יותר.`,
        payload: { host: row.competitor_host, recentCount: recentN, priorCount: priorN },
      });
    }
  }

  await logDecision({
    agent: 'self-improver',
    action: 'completed',
    reasoning:
      `סיימתי הערכה עצמית. בדקתי ${summary.guidesEvaluated} מאמרים שעברו ${REFRESH_AFTER_DAYS}+ ימים. ` +
      `החזרתי לרענון: ${summary.guidesRefreshed}. ` +
      `מתחרים שזיהיתי בעלייה: ${summary.competitorSurges} מתוך ${summary.competitorsTracked} שעוקבים אחריהם.`,
    payload: { ...summary },
  });

  return summary;
}
