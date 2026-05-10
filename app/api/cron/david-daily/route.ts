/**
 * GET /api/cron/david-daily
 *
 * Single Vercel cron entrypoint that runs דוד's full daily pipeline
 * sequentially: probe → analyze → write → improve → report.
 *
 * Why one route instead of five: Vercel's Hobby plan caps cron jobs at
 * a tight number, so we collapse the schedule into a single 06:00 UTC
 * trigger and let the agent run each stage in order. Each stage is
 * still independently invokable via /api/admin/* for manual testing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllProbes } from '@/lib/seo/geo-probes';
import { analyzeGaps } from '@/lib/agents/gap-analyzer';
import { writeNextGuide } from '@/lib/agents/content-writer';
import { runSelfImprover } from '@/lib/agents/self-improver';
import { prisma } from '@/lib/db';
import { DAVID, DAVID_EMAIL_FROM, DAVID_EMAIL_TO } from '@/lib/agents/david';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Hobby plan cap — Pro plan can extend to 800s

interface StageResult {
  stage: string;
  ok: boolean;
  durationMs: number;
  detail: unknown;
  error?: string;
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: StageResult[] = [];

  // 1. Probe LLMs
  results.push(await runStage('probe', () => runAllProbes()));
  // 2. Analyze gaps
  results.push(await runStage('analyze', () => analyzeGaps()));
  // 3. Write a guide for the highest-priority gap
  results.push(await runStage('write', () => writeNextGuide()));
  // 4. Self-improvement (refresh underperforming guides)
  results.push(await runStage('improve', () => runSelfImprover()));
  // 5. Daily email report
  results.push(await runStage('report', () => sendDailyReport()));

  return NextResponse.json({ ok: true, results });
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
async function sendDailyReport(): Promise<{ sent: boolean; reason?: string }> {
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

  const today = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
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

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<body style="font-family:-apple-system,sans-serif;max-width:680px;margin:32px auto;padding:0 20px;color:#1e293b;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;padding:28px;border-radius:12px;margin-bottom:24px;">
    <div style="font-size:13px;opacity:0.85;text-transform:uppercase;letter-spacing:1px;">${DAVID.emoji} ${DAVID.name} מדווח</div>
    <h1 style="margin:6px 0 0;font-size:24px;">דוח יומי — ${today}</h1>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
    <div style="background:#f1f5f9;padding:14px;border-radius:8px;text-align:center;">
      <div style="font-size:24px;font-weight:bold;color:#1e293b;">${probesToday}</div>
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;">בדיקות LLM היום</div>
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
  ${newGuides.length > 0 ? `<h2 style="font-size:18px;margin-top:28px;color:#1e293b;">📝 מה פרסמתי היום</h2>${guidesHtml}` : ''}
  <h2 style="font-size:18px;margin-top:28px;color:#1e293b;">🧠 מה עשיתי ולמה</h2>
  ${decisionsHtml}
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
    subject: `${DAVID.emoji} דוח יומי מ-${DAVID.name} — ${new Date().toLocaleDateString('he-IL')}`,
    html,
  });

  return { sent: true };
}
