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
import { startWritingJobs, resumeStalledWritingJobs } from '@/lib/agents/content-writer';
import { runSelfImprover } from '@/lib/agents/self-improver';
import { loadDailyContext, type DailyContext } from '@/lib/agents/daily-context';
import { planForToday, planForTomorrow } from '@/lib/agents/daily-plan';
import { logDecision } from '@/lib/agents/decision-log';
import { writeDailyJournalEntry } from '@/lib/agents/journal';
import { runBiweeklyReplan, shouldRunReplan } from '@/lib/agents/biweekly-replanner';
import { writeGeoDailySnapshot, detectGeoRegression, geoSparklineDataUri } from '@/lib/agents/geo-snapshot';
import { runSocialPoster } from '@/lib/agents/social-poster';
import { prisma } from '@/lib/db';
import { DAVID, DAVID_EMAIL_FROM, DAVID_EMAIL_TO } from '@/lib/agents/david';
import { requireCron } from '@/lib/auth/require-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// The full pipeline (probe + analyze + write + improve + replan + report)
// has to fit here. Writing days run two Anthropic round-trips (writer +
// fact-check), each can take 30-90s for a 1500-word Hebrew article.
//
// Next.js segment configs must be statically analyzable LITERALS — using a
// ternary on process.env breaks the build with "Invalid segment configuration
// export detected". We previously tried that for Hobby/Pro switching and it
// caused 4 consecutive failed deploys. Going with a static 300 here: Vercel
// silently caps to the plan's actual limit, so a Hobby project still runs at
// 60s but the deploy doesn't reject. When upgrading to Pro this value takes
// effect automatically.
export const maxDuration = 300;

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
  const unauth = requireCron(req);
  if (unauth) return unauth;

  const today = planForToday();
  const tomorrow = planForTomorrow();
  const ctx = await loadDailyContext();

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
  // Stage 2.1: GEO snapshot — persist today's 0-100 score (rolling 14d window)
  // so the admin graph + email sparkline have one point per day. Always runs.
  results.push(await runStage('geo-snapshot', () => writeGeoDailySnapshot()));
  // Stage 2.5: Resume — re-dispatch any writing job whose stage chain was
  // broken by a dropped dispatch. Runs EVERY day (even non-writing days) so a
  // stalled article never waits more than ~24h to resume.
  results.push(await runStage('resume-jobs', () => resumeStalledWritingJobs()));

  // Stage 3: Write — only on writing days. Kicks off the split pipeline: claims
  // a gap, creates a WritingJob, and dispatches its first stage. The article
  // finishes asynchronously over the next few minutes (research -> write ->
  // finalize), each stage in its own invocation, so this returns fast and the
  // cron never times out mid-write. ctx drives recent-guide dedupe.
  if (today.plan.shouldWrite) {
    results.push(await runStage('write', () => startWritingJobs({ context: ctx })));
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

  // Stage 5.5: Social drafts — LinkedIn/Facebook/Reels-hook drafts for guides
  // published in the last 24h. Logged as decisions, so they render inside the
  // report email automatically. Nothing is auto-published.
  results.push(await runStage('social', () => runSocialPoster()));

  // Stage 6: Report.
  results.push(await runStage('report', () => sendDailyReport(ctx, today, tomorrow, results)));

  // Stage 7: Append today's entry to the journal — David's diary. Reads back
  // tomorrow morning and informs every decision. Best-effort: a journal write
  // failure must NOT poison the cron response (the operator already got the
  // email + the report stage already ran).
  await writeDailyJournalEntry(results).catch((e) =>
    console.error('journal-write-failed', e),
  );

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
    // HTML-escape the error excerpt. Anthropic 5xx bodies contain HTML and JSON
    // that would otherwise break the email layout (and on a bad day, exfil
    // markup into the rendered DOM). Widen the excerpt to 800 chars so the
    // operator can actually see what model + what status code came back —
    // 200 chars was clipping the response body before the useful part.
    const detail = s.skipped
      ? escapeHtml(s.skipReason ?? '')
      : s.error
        ? `<pre style="background:#fef2f2;color:#991b1b;padding:8px;border-radius:4px;font-size:11px;white-space:pre-wrap;word-break:break-word;margin:4px 0 0;">${escapeHtml(s.error.slice(0, 800))}</pre>`
        : `(${Math.round(s.durationMs / 100) / 10}s)`;
    return `<li style="margin-bottom:4px;"><strong>${s.stage}</strong> — ${status} ${detail}</li>`;
  }).join('');

  // DA-11: surface a red banner when EVERY probe failed — a silent total
  // outage was previously hidden inside a green "✅ הצלחה probe (12.3s)"
  // line because the *stage* didn't throw. The all-probes-failed decision
  // itself is logged inside runAllProbes (lib/seo/geo-probes.ts); here we
  // just render the operator-facing banner from the stage detail.
  const probeSummaryForBanner = (probeStage?.detail ?? {}) as {
    total?: number;
    failed?: number;
  };
  const allProbesFailed =
    probeStage?.ok === true &&
    typeof probeSummaryForBanner.total === 'number' &&
    typeof probeSummaryForBanner.failed === 'number' &&
    probeSummaryForBanner.total > 0 &&
    probeSummaryForBanner.failed === probeSummaryForBanner.total;
  const allProbesFailedBanner = allProbesFailed
    ? `<div style="background:#fef2f2;border:2px solid #dc2626;color:#991b1b;padding:14px 18px;border-radius:8px;margin-bottom:16px;font-weight:bold;">
        ⚠️ כל ${probeSummaryForBanner.total} השאילתות נכשלו היום. בדוק את ה-API keys של הספקים (Perplexity / OpenAI) ואת מצב Anthropic.
      </div>`
    : '';

  // Pinger liveness — the writer pipeline's SOLE driver is the external
  // pinger (cron-job.org → /api/cron/writer-pump every ~3 min). A stale (or
  // absent) heartbeat means articles are crawling on the once-daily backstop.
  // This replaces the old hardcoded "the pinger advances jobs" line that hid
  // a pinger that was never configured. try/catch: table may not exist yet.
  let pingerBanner = '';
  try {
    const hb = await prisma.agentHeartbeat.findUnique({ where: { name: 'writer-pump' } });
    const staleMs = hb ? Date.now() - hb.lastSeenAt.getTime() : Infinity;
    if (staleMs > 30 * 60 * 1000) {
      const lastSeen = hb
        ? `פעימה אחרונה: ${new Date(hb.lastSeenAt).toLocaleString('he-IL')}`
        : 'לא נרשמה פעימה מעולם — כנראה שה-pinger לא הוגדר ב-cron-job.org';
      pingerBanner = `<div style="background:#fef2f2;border:2px solid #dc2626;color:#991b1b;padding:14px 18px;border-radius:8px;margin-bottom:16px;font-weight:bold;">
        🔌 ה-pinger החיצוני של צנרת הכתיבה לא פועם. ${escapeHtml(lastSeen)}.<br>
        <span style="font-weight:normal;">בלעדיו מאמרים מתקדמים רק פעם ביום. הגדרה: GET https://weccelerate.co.il/api/cron/writer-pump כל 3 דקות עם Authorization: Bearer CRON_SECRET.</span>
      </div>`;
    }
  } catch { /* heartbeat table not migrated yet — skip the banner */ }

  // Publish watchdog — writing jobs older than 24h that still aren't done
  // mean the pipeline is stuck; say so in red instead of failing silently.
  let stuckJobsBanner = '';
  try {
    const stuck = await prisma.writingJob.count({
      where: {
        stage: { notIn: ['done', 'failed'] },
        createdAt: { lt: new Date(Date.now() - 24 * 3600 * 1000) },
      },
    });
    if (stuck > 0) {
      stuckJobsBanner = `<div style="background:#fef2f2;border:2px solid #dc2626;color:#991b1b;padding:14px 18px;border-radius:8px;margin-bottom:16px;font-weight:bold;">
        ⏳ ${stuck} עבודות כתיבה פתוחות מעל 24 שעות ולא פורסמו. בדוק את ה-pinger ואת טבלת writing_jobs (עמודות stage/error).
      </div>`;
    }
  } catch { /* table missing — skip */ }

  // GEO trend — sparkline of the last 30 daily snapshots + regression alert
  // (7-day avg dropped 10+ points vs the previous 7 days).
  let geoTrendHtml = '';
  let geoRegressionBanner = '';
  try {
    const spark = await geoSparklineDataUri(30);
    if (spark) {
      geoTrendHtml = `<div style="background:#f1f5f9;padding:14px 16px;border-radius:8px;margin-bottom:24px;">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:6px;">📈 מדד GEO — ‏30 יום · היום: <strong style="color:#7c3aed;font-size:14px;">${spark.latest}</strong>/100</div>
        <img src="${spark.uri}" width="260" height="48" alt="גרף מדד GEO" style="display:block;">
      </div>`;
    }
    const reg = await detectGeoRegression();
    if (reg?.regressed) {
      geoRegressionBanner = `<div style="background:#fef2f2;border:2px solid #dc2626;color:#991b1b;padding:14px 18px;border-radius:8px;margin-bottom:16px;font-weight:bold;">
        📉 נסיגת GEO: ממוצע השבוע ${reg.recentAvg} מול ${reg.previousAvg} בשבוע הקודם. מומלץ לתעדף רענון מאמרים קיימים על פני כתיבה חדשה.
      </div>`;
    }
  } catch { /* snapshot table not migrated yet — skip */ }

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

  ${allProbesFailedBanner}
  ${pingerBanner}
  ${stuckJobsBanner}
  ${geoRegressionBanner}
  ${geoTrendHtml}

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

/** Minimal HTML escaper for embedding untrusted error strings in the email body. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
