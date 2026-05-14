/**
 * GET /api/cron/david-daily
 *
 * Single Vercel cron entrypoint that runs דוד's full daily pipeline. The
 * stages that actually run depend on the day of the week (see daily-plan.ts):
 *   - Sun/Mon/Tue/Thu — probe → analyze → write → report
 *   - Wed/Fri — probe → analyze → improve → report  (no new writing)
 *   - Sat — probe → analyze → report  (quiet day)
 *
 * Every day starts by loading a 7-day context briefing so the writer doesn't
 * repeat topics it already covered, the report can show continuity ("yesterday
 * I did X, today Y, tomorrow Z"), and probe selection respects per-query
 * cadence instead of asking the same questions every morning.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllProbes } from '@/lib/seo/geo-probes';
import { analyzeGaps } from '@/lib/agents/gap-analyzer';
import { writeNextGuide } from '@/lib/agents/content-writer';
import { runSelfImprover } from '@/lib/agents/self-improver';
import { loadDailyContext, type DailyContext } from '@/lib/agents/daily-context';
import { planForToday, planForTomorrow } from '@/lib/agents/daily-plan';
import { logDecision } from '@/lib/agents/decision-log';
import { loadJournal } from '@/lib/agents/journal';
import { writeDailyJournalEntry } from '@/lib/agents/journal';
import { runBiweeklyReplan, shouldRunReplan } from '@/lib/agents/biweekly-replanner';
import { prisma } from '@/lib/db';
import { DAVID, DAVID_EMAIL_FROM, DAVID_EMAIL_TO } from '@/lib/agents/david';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

interface StageResult {
  stage: string;
  ok: boolean;
  durationMs: number;
  detail: unknown;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = planForToday();
  const tomorrow = planForTomorrow();
  const ctx = await loadDailyContext();
  const journal = await loadJournal();

  // Log the morning briefing so the operator (and David tomorrow) can see
  // what context shaped today's decisions.
  await logDecision({
    agent: 'gap-analyzer',
    action: 'daily-briefing',
    reasoning:
      `בוקר טוב. היום ${today.plan.label}. ${today.plan.description}\n` +
      `אתמול ביצעתי ${ctx.yesterdayDecisions.length} פעולות. ` +
      `ב-30 הימים האחרונים פרסמתי ${ctx.recentGuides.length} מאמרים — לא אכתוב על נושא שכבר כיסיתי. ` +
      `יש ${ctx.openGaps.length} פערים פתוחים בתור.`,
    payload: {
      weekday: today.weekday,
      shouldWrite: today.plan.shouldWrite,
      shouldImprove: today.plan.shouldImprove,
      probeFocus: today.plan.probeFocus,
      recentGuidesCount: ctx.recentGuides.length,
      openGapsCount: ctx.openGaps.length,
      yesterdayActionsCount: ctx.yesterdayDecisions.length,
    },
  });

  const results: StageResult[] = [];

  // Stage 1: Probe — always runs (cadence selection inside handles "nothing due today").
  results.push(await runStage('probe', () => runAllProbes()));
  // Stage 2: Analyze — always runs.
  results.push(await runStage('analyze', () => analyzeGaps()));
  // Stage 3: Write — only on writing days. Pass both context (recent guides
  // dedupe) AND journal (avoid past mistakes / imitate past wins).
  if (today.plan.shouldWrite) {
    results.push(await runStage('write', () => writeNextGuide({ context: ctx, journal })));
  } else {
    results.push({
      stage: 'write',
      ok: true,
      durationMs: 0,
      detail: null,
      skipped: true,
      skipReason: `${today.plan.label} — לא יום כתיבה.`,
    });
  }
  // Stage 4: Self-improve — only on improvement days.
  if (today.plan.shouldImprove) {
    results.push(await runStage('improve', () => runSelfImprover()));
  } else {
    results.push({
      stage: 'improve',
      ok: true,
      durationMs: 0,
      detail: null,
      skipped: true,
      skipReason: `${today.plan.label} — לא יום self-improvement.`,
    });
  }
  // Stage 5: Biweekly replan — runs only when last replan was >14d ago,
  // otherwise no-op. Uses Claude Sonnet to draw conclusions from the
  // 14-day journal and emit a structured strategic memo.
  if (await shouldRunReplan()) {
    results.push(await runStage('replan', () => runBiweeklyReplan()));
  } else {
    results.push({
      stage: 'replan',
      ok: true,
      durationMs: 0,
      detail: null,
      skipped: true,
      skipReason: 'תוכנית שבועיים אחרונה עדיין טרייה (פחות מ-14 ימים).',
    });
  }

  // Stage 6: Report.
  results.push(await runStage('report', () => sendDailyReport(ctx, today, tomorrow, results)));

  // Stage 7: Append today's entry to the journal — David's diary. Reads back
  // tomorrow morning and informs every decision.
  await writeDailyJournalEntry(results);

  return NextResponse.json({ ok: true, weekday: today.weekday, plan: today.plan.label, results });
}

async function runStage<T>(name: string, fn: () => Promise<T>): Promise<StageResult> {
  const start = Date.now();
  try {
    const detail = await fn();
    return { stage: name, ok: true, durationMs: Date.now() - start, detail };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(JSON.stringify({ event: 'david-stage-error', stage: name, error }));
    return { stage: name, ok: false, durationMs: Date.now() - start, detail: null, error };
  }
}

// Inlined daily report so we don't carry an HTTP roundtrip just to send mail.
async function sendDailyReport(
  ctx: DailyContext,
  today: ReturnType<typeof planForToday>,
  tomorrow: ReturnType<typeof planForTomorrow>,
  stages: StageResult[],
): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.RESEND_API_KEY) return { sent: false, reason: 'RESEND_API_KEY missing' };

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const decisions = await prisma.agentDecision.findMany({
    where: { timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
  });
  const probesToday = await prisma.geoProbe.count({ where: { timestamp: { gte: since } } });
  const newGuides = await prisma.generatedGuide.findMany({
    where: { publishedAt: { gte: since } },
    select: { slug: true, titleHe: true, wordCount: true },
  });
  const openGapsCount = await prisma.contentGap.count({ where: { status: 'open' } });

  type DecisionRow = { timestamp: Date; agent: string; action: string; reasoning: string; success: boolean };

  const todayLabel = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  const decisionsHtml = decisions.length === 0
    ? '<p style="color:#94a3b8;font-style:italic;">לא ביצעתי פעולות אוטומטיות ב-24 השעות האחרונות.</p>'
    : (decisions as DecisionRow[]).map((d) => `
      <div style="border-right:4px solid ${d.success ? '#10b981' : '#ef4444'};background:#f8fafc;padding:12px 16px;margin-bottom:8px;border-radius:6px;">
        <div style="font-size:11px;color:#64748b;font-family:monospace;">
          ${new Date(d.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          · ${d.agent} · <code>${d.action}</code>
        </div>
        <div style="margin-top:6px;font-size:14px;color:#1e293b;line-height:1.5;">${d.reasoning}</div>
      </div>
    `).join('');

  type GuideRow = { slug: string; titleHe: string; wordCount: number | null };
  const guidesHtml = newGuides.length === 0
    ? '<p style="color:#94a3b8;">לא פרסמתי מאמר חדש היום.</p>'
    : `<ul style="padding-right:20px;">${(newGuides as GuideRow[]).map((g) =>
        `<li><a href="https://weccelerate.co.il/guides/${g.slug}" style="color:#3b82f6;">${g.titleHe}</a> ${g.wordCount ? `(${g.wordCount} מילים)` : ''}</li>`,
      ).join('')}</ul>`;

  // Probe stage detail tells us how many calls actually went out vs were skipped.
  const probeStage = stages.find((s) => s.stage === 'probe');
  const probeDetail = (probeStage?.detail ?? {}) as {
    scheduled?: number;
    skippedNotDue?: number;
    cited?: number;
    mentioned?: number;
  };

  const stagesHtml = stages.map((s) => {
    const status = s.skipped ? '⏸ דילגתי' : s.ok ? '✅ הצלחה' : '❌ כשל';
    const detail = s.skipped
      ? s.skipReason ?? ''
      : s.error
        ? `שגיאה: ${s.error}`
        : `(${Math.round(s.durationMs / 100) / 10}s)`;
    return `<li style="margin-bottom:4px;"><strong>${s.stage}</strong> — ${status} ${detail}</li>`;
  }).join('');

  // Recent guides — David's "what did I do this week" memory, surfaced.
  const memoryHtml = ctx.recentGuides.length === 0
    ? '<p style="color:#94a3b8;">לא פרסמתי מאמרים ב-30 הימים האחרונים.</p>'
    : `<ul style="padding-right:20px;font-size:13px;color:#475569;">${ctx.recentGuides.slice(0, 8).map((g) =>
        `<li><a href="https://weccelerate.co.il/guides/${g.slug}" style="color:#3b82f6;">${g.titleHe}</a> · ${g.publishedAt ? new Date(g.publishedAt).toLocaleDateString('he-IL') : ''}</li>`,
      ).join('')}</ul>`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<body style="font-family:-apple-system,sans-serif;max-width:680px;margin:32px auto;padding:0 20px;color:#1e293b;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;padding:28px;border-radius:12px;margin-bottom:24px;">
    <div style="font-size:13px;opacity:0.85;text-transform:uppercase;letter-spacing:1px;">${DAVID.emoji} ${DAVID.name} מדווח</div>
    <h1 style="margin:6px 0 0;font-size:24px;">${today.plan.label} — ${todayLabel}</h1>
    <p style="margin:10px 0 0;font-size:14px;opacity:0.95;line-height:1.5;">${today.plan.description}</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:24px;font-weight:bold;color:#1e293b;">${probesToday}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">בדיקות LLM היום</div>
      ${probeDetail.skippedNotDue !== undefined ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px;">דילגתי על ${probeDetail.skippedNotDue} שלא הגיעו לקדנציה</div>` : ''}
    </div>
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:24px;font-weight:bold;color:#1e293b;">${newGuides.length}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">מאמרים שפרסמתי</div>
    </div>
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:24px;font-weight:bold;color:#1e293b;">${openGapsCount}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">פערים פתוחים בתור</div>
    </div>
  </div>

  <h2 style="font-size:18px;margin-top:28px;color:#1e293b;">📋 שלבי הריצה היום</h2>
  <ul style="padding-right:20px;color:#475569;">${stagesHtml}</ul>

  ${newGuides.length > 0 ? `<h2 style="font-size:18px;margin-top:28px;color:#1e293b;">📝 מה פרסמתי היום</h2>${guidesHtml}` : ''}

  <h2 style="font-size:18px;margin-top:28px;color:#1e293b;">🧠 מה עשיתי ולמה</h2>
  ${decisionsHtml}

  <h2 style="font-size:18px;margin-top:28px;color:#1e293b;">📚 הזיכרון שלי — מה כיסיתי לאחרונה</h2>
  <p style="font-size:13px;color:#64748b;margin-bottom:8px;">לא אכפיל את הנושאים האלה כשאבחר את המאמר הבא:</p>
  ${memoryHtml}

  <h2 style="font-size:18px;margin-top:28px;color:#1e293b;">🔮 מה מחר</h2>
  <p style="background:#fef3c7;padding:12px 16px;border-radius:6px;font-size:14px;color:#78350f;line-height:1.6;">
    <strong>${tomorrow.plan.label}</strong> — ${tomorrow.plan.description}
  </p>

  <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
  <p style="font-size:12px;color:#94a3b8;text-align:center;">
    ${DAVID.emoji} זהו דוח אוטומטי מ-${DAVID.fullName}.<br>
    עוד פרטים: <a href="https://weccelerate.co.il/admin/geo-plan" style="color:#3b82f6;">/admin/geo-plan</a>
  </p>
</body>
</html>`;

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: DAVID_EMAIL_FROM,
    to: DAVID_EMAIL_TO,
    subject: `${DAVID.emoji} ${today.plan.label} — ${new Date().toLocaleDateString('he-IL')}`,
    html,
  });

  return { sent: true };
}
