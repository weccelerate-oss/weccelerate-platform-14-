/**
 * דוד's journal — long-term memory of what worked and what failed.
 *
 * Every action David takes leaves an `agent_decisions` row. This module
 * reads back across a long window (90 days) and extracts two things the
 * writer/scheduler can act on:
 *
 *   ✅ WINS — guides that received their first LLM citation, recent gaps
 *      that resolved themselves (cite-rate climbed past the threshold),
 *      successful policy/quality passes. The writer uses these to imitate
 *      structure: "we had success on topic X — try the same approach for
 *      topic Y in the same family."
 *
 *   ❌ FAILURES — policy gate rejections, quality-floor rejections,
 *      duplicate-skip events. The writer/gap-picker uses these to avoid
 *      the same mistake: a query that's been rejected for policy violations
 *      twice deserves either a gentler prompt or to be deprioritized.
 *
 * Once per cron run (`writeDailyJournalEntry`) we ALSO emit a single
 * "daily-summary" decision row that consolidates the day. This is the
 * journal-file the operator asked for — append-only, queryable, and
 * David reads back from it next morning.
 */

import { prisma } from '@/lib/db';
import { logDecision } from './decision-log';

// =============================================================================
// READ — what David remembers
// =============================================================================

const WINDOW_DAYS = 90;

export interface JournalWin {
  kind: 'guide-cited' | 'gap-resolved' | 'streak';
  date: Date;
  title: string;
  detail: string;
  related?: { slug?: string; query?: string };
}

export interface JournalFailure {
  kind: 'policy' | 'quality-low' | 'fact-check-low' | 'idle-no-topic' | 'probe-error';
  date: Date;
  title: string;
  detail: string;
  related?: { query?: string; slug?: string };
  /** How many times this same failure has repeated — David should escalate. */
  repeatCount: number;
}

export interface JournalSummary {
  windowDays: number;
  wins: JournalWin[];
  failures: JournalFailure[];
  /** Patterns worth surfacing to the writer's prompt. */
  insights: string[];
}

export async function loadJournal(): Promise<JournalSummary> {
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000);

  const wins: JournalWin[] = [];
  const failures: JournalFailure[] = [];

  // -- WINS: published guides that received a first citation in window.
  try {
    const citedGuides = await prisma.generatedGuide.findMany({
      where: {
        firstCitedAt: { gte: since, not: null },
      },
      orderBy: { firstCitedAt: 'desc' },
      take: 20,
      select: {
        slug: true,
        titleHe: true,
        publishedAt: true,
        firstCitedAt: true,
        category: true,
      },
    });

    for (const g of citedGuides) {
      if (!g.firstCitedAt) continue;
      const daysToFirstCite =
        g.publishedAt
          ? Math.floor((g.firstCitedAt.getTime() - g.publishedAt.getTime()) / 86_400_000)
          : null;
      wins.push({
        kind: 'guide-cited',
        date: g.firstCitedAt,
        title: g.titleHe,
        detail:
          `הציטוט הראשון הגיע${daysToFirstCite !== null ? ` תוך ${daysToFirstCite} ימים מהפרסום` : ''}` +
          ` · קטגוריה ${g.category}`,
        related: { slug: g.slug },
      });
    }
  } catch {
    // ignore — table may not exist yet
  }

  // -- WINS: gaps that closed because cite-rate climbed past threshold.
  try {
    const resolvedGaps = await prisma.contentGap.findMany({
      where: {
        status: 'published',
        resolvedAt: { gte: since, not: null },
      },
      orderBy: { resolvedAt: 'desc' },
      take: 15,
      select: { query: true, resolvedAt: true, severity: true, category: true },
    });
    for (const g of resolvedGaps) {
      if (!g.resolvedAt) continue;
      wins.push({
        kind: 'gap-resolved',
        date: g.resolvedAt,
        title: `הפער "${g.query}" נסגר`,
        detail: `הציטוטים על השאלה הזו עלו מעל סף ה-60% — אין צורך לכתוב עליה שוב כרגע. severity היה ${g.severity}.`,
        related: { query: g.query },
      });
    }
  } catch {
    // ignore
  }

  // -- FAILURES: policy/quality rejections in window.
  try {
    const skipDecisions = await prisma.agentDecision.findMany({
      where: {
        timestamp: { gte: since },
        action: { in: ['skipped-publish-policy', 'skipped-publish-quality'] },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: {
        timestamp: true,
        action: true,
        reasoning: true,
        payload: true,
      },
    });

    // Group by query to compute repeat count.
    type PayloadShape = { query?: string; gapId?: string; violations?: string[] };
    const byQuery = new Map<string, number>();
    for (const d of skipDecisions) {
      const p = (d.payload as PayloadShape | null) ?? {};
      const q = p.query ?? '__unknown__';
      byQuery.set(q, (byQuery.get(q) ?? 0) + 1);
    }

    for (const d of skipDecisions.slice(0, 15)) {
      const p = (d.payload as PayloadShape | null) ?? {};
      const q = p.query ?? null;
      const repeatCount = q ? byQuery.get(q) ?? 1 : 1;
      const isPolicy = d.action === 'skipped-publish-policy';
      failures.push({
        kind: isPolicy ? 'policy' : 'quality-low',
        date: d.timestamp,
        title: q ? `"${q}" נדחה — ${isPolicy ? 'הפרת policy' : 'איכות מתחת לסף'}` : 'כתיבה נדחתה',
        detail: d.reasoning,
        related: q ? { query: q } : undefined,
        repeatCount,
      });
    }
  } catch {
    // ignore
  }

  // -- FAILURES: idle days where the queue was empty.
  try {
    const idle = await prisma.agentDecision.findMany({
      where: {
        timestamp: { gte: since },
        action: { in: ['idle', 'idle-all-covered'] },
      },
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: { timestamp: true, action: true, reasoning: true },
    });
    for (const d of idle) {
      failures.push({
        kind: 'idle-no-topic',
        date: d.timestamp,
        title: d.action === 'idle-all-covered' ? 'יום כתיבה פסחתי — כל הנושאים כוסו' : 'יום כתיבה פסחתי — אין פערים פתוחים',
        detail: d.reasoning,
        repeatCount: 1,
      });
    }
  } catch {
    // ignore
  }

  // -- INSIGHTS: pattern extraction.
  const insights: string[] = [];

  // Insight 1: which categories produced wins.
  const winCategoriesCount = new Map<string, number>();
  for (const w of wins) {
    if (w.kind !== 'guide-cited') continue;
    // We can't get category here without re-querying; skip for now.
    void winCategoriesCount;
  }
  if (wins.filter((w) => w.kind === 'guide-cited').length >= 3) {
    insights.push(
      `📈 ב-${WINDOW_DAYS} הימים האחרונים קיבלנו ציטוטים על ${wins.filter((w) => w.kind === 'guide-cited').length} מאמרים — האסטרטגיה עובדת. שמור על הפורמט.`,
    );
  }

  // Insight 2: repeated policy failures are a red flag.
  const repeatedPolicyFailures = failures.filter((f) => f.kind === 'policy' && f.repeatCount >= 2);
  if (repeatedPolicyFailures.length > 0) {
    const queries = Array.from(new Set(repeatedPolicyFailures.map((f) => f.related?.query).filter(Boolean))).slice(0, 3);
    insights.push(
      `⚠️ נושאים עם הפרות policy חוזרות (${repeatedPolicyFailures.length}): ${queries.join(', ')}. שקול prompt קפדני יותר על הנושאים האלה או deprioritize.`,
    );
  }

  // Insight 3: idle days suggest the gap analyzer needs more probe coverage.
  if (failures.filter((f) => f.kind === 'idle-no-topic').length >= 2) {
    insights.push(
      '💡 דוד דילג על מספר ימי כתיבה כי לא היה תור. שקול להוסיף שאילתות probe חדשות או להקטין את סף ה-cite-rate שמסגיר פער.',
    );
  }

  return { windowDays: WINDOW_DAYS, wins, failures, insights };
}

// =============================================================================
// WRITE — David's daily summary entry
// =============================================================================

/**
 * Write a single 'daily-summary' AgentDecision row that consolidates today.
 * Called at the END of the cron pipeline so the journal includes everything
 * that happened in this run.
 */
export async function writeDailyJournalEntry(stages: Array<{
  stage: string;
  ok: boolean;
  skipped?: boolean;
  detail?: unknown;
}>): Promise<void> {
  const stageStatusLine = stages
    .map((s) => `${s.stage}: ${s.skipped ? '⏸ skip' : s.ok ? '✓' : '✗ fail'}`)
    .join(' · ');

  // Pull today's quick wins and pains from the in-flight stage details so
  // the summary reflects this exact run, not a separate query.
  const writeStage = stages.find((s) => s.stage === 'write');
  const writeDetail = (writeStage?.detail ?? {}) as { ok?: boolean; slug?: string; reason?: string };
  const probeStage = stages.find((s) => s.stage === 'probe');
  const probeDetail = (probeStage?.detail ?? {}) as { scheduled?: number; cited?: number; mentioned?: number };

  const summaryParts: string[] = [
    `📝 סיכום יומי: ${stageStatusLine}.`,
  ];
  if (probeDetail.scheduled !== undefined) {
    summaryParts.push(
      `🤖 ${probeDetail.scheduled} שאילתות נשאלו, ${probeDetail.cited ?? 0} מצוטטים, ${probeDetail.mentioned ?? 0} אזכורים.`,
    );
  }
  if (writeStage?.skipped) {
    summaryParts.push('✍️ לא יום כתיבה.');
  } else if (writeDetail.ok && writeDetail.slug) {
    summaryParts.push(`✍️ פרסמתי /guides/${writeDetail.slug}.`);
  } else if (!writeDetail.ok && writeDetail.reason) {
    summaryParts.push(`✍️ לא פרסמתי — ${writeDetail.reason}`);
  }

  await logDecision({
    agent: 'gap-analyzer', // 'gap-analyzer' is one of the allowed agent values; semantically this is "system"
    action: 'daily-summary',
    reasoning: summaryParts.join(' '),
    payload: {
      date: new Date().toISOString().slice(0, 10),
      stages: stages.map((s) => ({ stage: s.stage, ok: s.ok, skipped: s.skipped ?? false })),
    },
    success: true,
  });
}

// =============================================================================
// HELPERS — for prompts
// =============================================================================

/**
 * Compact text block for injection into the writer's prompt. Tells the
 * writer what David already learned, so the writer can imitate wins and
 * avoid the same failures.
 */
export function summarizeJournalForWriter(j: JournalSummary): string {
  const lines: string[] = ['## הזיכרון של דוד — מה כדאי ומה לא:'];

  if (j.wins.length > 0) {
    lines.push('\n### ✅ מה הצליח לאחרונה (תחקה את הפורמט):');
    for (const w of j.wins.slice(0, 5)) {
      lines.push(`- ${w.title} — ${w.detail}`);
    }
  }

  if (j.failures.length > 0) {
    lines.push('\n### ❌ מה נכשל לאחרונה (אל תחזור על אותה טעות):');
    for (const f of j.failures.slice(0, 5)) {
      const repeatTag = f.repeatCount > 1 ? ` (חזר ${f.repeatCount} פעמים)` : '';
      lines.push(`- ${f.title}${repeatTag} — ${f.detail}`);
    }
  }

  if (j.insights.length > 0) {
    lines.push('\n### 💡 תובנות:');
    for (const i of j.insights) {
      lines.push(`- ${i}`);
    }
  }

  if (lines.length === 1) {
    return ''; // nothing to share
  }

  return lines.join('\n');
}
