/**
 * POST /api/bot/log
 *
 * Fire-and-forget sink for AI crawler visits detected in middleware.ts.
 * Body: { bot, path, host, method?, referer?, country?, userAgent? }
 *
 * DESIGN NOTES:
 *   - NO AUTH. This endpoint is called from our own middleware (server-side),
 *     so the caller is the same process. We rely on the fact that middleware
 *     only invokes this after `detectAiBot(userAgent)` matches one of the 18
 *     known bot signatures — random POSTs from the internet will still land
 *     here, but they must supply a `bot` name that matches our allowlist to
 *     be recorded. Non-matching rows are rejected silently.
 *   - ASYNC + SHORT CIRCUIT. We use force-dynamic and return 204 before the
 *     DB write resolves so middleware never blocks on DB latency. If the DB
 *     is down, bot hits are dropped — acceptable because Vercel's console
 *     still has the structured log from middleware.ts.
 *   - ALLOWLIST is intentionally duplicated here (not imported from
 *     middleware.ts) because middleware runs on the Edge runtime and
 *     imports are limited. Keep them in sync — if you add a new bot to
 *     middleware.ts AI_BOT_SIGNATURES, also add it to KNOWN_BOTS below.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { LIVE_RETRIEVAL_BOTS, categorizeBot } from '@/lib/seo/bot-categories';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Where to deliver the "we got our first live citation" alert.
const GEO_ALERT_RECIPIENT =
  process.env.GEO_ALERT_EMAIL ?? 'weccelerate@gmail.com';

const KNOWN_BOTS = new Set([
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'GoogleOther',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'FacebookBot',
  'Bytespider',
  'cohere-ai',
  'DuckAssistBot',
  'Amazonbot',
]);

interface BotLogPayload {
  bot: string;
  path: string;
  host: string;
  method?: string;
  referer?: string | null;
  country?: string | null;
  userAgent?: string | null;
}

function isValidPayload(value: unknown): value is BotLogPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.bot === 'string' &&
    typeof v.path === 'string' &&
    typeof v.host === 'string' &&
    (v.method === undefined || typeof v.method === 'string') &&
    (v.referer === undefined || v.referer === null || typeof v.referer === 'string') &&
    (v.country === undefined || v.country === null || typeof v.country === 'string') &&
    (v.userAgent === undefined || v.userAgent === null || typeof v.userAgent === 'string')
  );
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    // Silent — middleware should always send valid JSON.
    return new NextResponse(null, { status: 204 });
  }

  if (!isValidPayload(payload) || !KNOWN_BOTS.has(payload.bot)) {
    return new NextResponse(null, { status: 204 });
  }

  // AWAIT the write — Vercel serverless functions terminate as soon as the
  // response is returned, so a fire-and-forget `void prisma.create(...)`
  // gets killed before the DB write flushes. The DB roundtrip is ~100ms,
  // and the caller (middleware) already runs this with its own 2s timeout
  // and swallows any error, so awaiting here doesn't slow the user-facing
  // request.
  try {
    await prisma.botVisit.create({
      data: {
        bot: payload.bot,
        path: payload.path.slice(0, 512),
        host: payload.host.slice(0, 255),
        method: (payload.method ?? 'GET').slice(0, 10),
        referer: payload.referer?.slice(0, 512) ?? null,
        country: payload.country?.slice(0, 8) ?? null,
        userAgent: payload.userAgent?.slice(0, 512) ?? null,
      },
    });

    // Citation-milestone alert: when we see a live-retrieval bot for the
    // first time ever (per bot kind), email the team. This is the moment
    // GEO actually started paying off — actual users are getting our page
    // back as part of an LLM answer.
    if (categorizeBot(payload.bot) === 'live_retrieval') {
      await sendCitationAlertIfFirstTime(payload).catch((err) => {
        console.error(
          JSON.stringify({
            event: 'geo-alert-error',
            error: err instanceof Error ? err.message : String(err),
            bot: payload.bot,
            ts: new Date().toISOString(),
          }),
        );
      });
    }
  } catch (err: unknown) {
    // Failure modes: DB down, migration not applied, connection pool
    // exhausted. Log to Vercel console — middleware already swallowed any
    // error from this request, so a 500 here is harmless.
    console.error(
      JSON.stringify({
        event: 'bot-log-error',
        error: err instanceof Error ? err.message : String(err),
        bot: payload.bot,
        path: payload.path,
        ts: new Date().toISOString(),
      }),
    );
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * Sends an alert email the FIRST time we ever see a given live-retrieval bot.
 * The check uses count===1 because the row we just inserted is included.
 * Subsequent visits from the same bot kind are silent (no spam).
 */
async function sendCitationAlertIfFirstTime(payload: BotLogPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const totalForThisBot = await prisma.botVisit.count({
    where: { bot: payload.bot },
  });
  if (totalForThisBot !== 1) return;

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const url = `https://${payload.host}${payload.path}`;
  const liveBotsLabel = LIVE_RETRIEVAL_BOTS.includes(
    payload.bot as (typeof LIVE_RETRIEVAL_BOTS)[number],
  )
    ? `Live retrieval bot — משתמש שאל ${
        payload.bot === 'PerplexityBot' ? 'Perplexity' :
        payload.bot.startsWith('ChatGPT') ? 'ChatGPT' :
        payload.bot.startsWith('Claude') ? 'Claude' : 'LLM'
      } ולמדה ה-LLM שלף את הדף שלך כדי לצטט.`
    : 'Bot חדש זוהה.';

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to: GEO_ALERT_RECIPIENT,
    subject: `🎯 GEO/AEO milestone — ${payload.bot} ביקר באתר בפעם הראשונה`,
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px;">
          <div style="font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">GEO/AEO Milestone</div>
          <h1 style="margin: 8px 0 0; font-size: 28px;">קיבלת ציטוט ראשון מ-${payload.bot} 🎯</h1>
        </div>

        <p style="font-size: 16px; line-height: 1.6;">${liveBotsLabel}</p>

        <div style="background: #f1f5f9; border-right: 4px solid #10b981; padding: 16px 20px; margin: 24px 0; border-radius: 6px;">
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">דף שנקרא</div>
          <div style="font-size: 16px; font-family: monospace; margin-top: 4px;">${url}</div>
          ${payload.country ? `<div style="font-size: 12px; color: #64748b; margin-top: 8px;">מדינה: ${payload.country}</div>` : ''}
        </div>

        <h2 style="font-size: 18px; margin-top: 32px;">מה זה אומר</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          זה לא בוט שסורק לאימון — זה בוט שמופעל <strong>בזמן אמת</strong> כשמשתמש שואל שאלה ב-LLM.
          המשמעות: אדם אמיתי שאל את ${payload.bot.split('-')[0]} משהו שגרם לו לגלוש לדף שלך כדי לצטט את התוכן בתשובה.
        </p>

        <h2 style="font-size: 18px; margin-top: 32px;">צעדים מומלצים</h2>
        <ol style="font-size: 14px; line-height: 1.8; color: #475569;">
          <li>בדוק את הדף שנקרא — הוא ההתחלה של ההצלחה ב-GEO. הרחב אותו ושכפל לדפים דומים.</li>
          <li>שאל את אותו ה-LLM מה הוא יודע על WeCcelerate — תראה אם אתה מצוטט בתשובה.</li>
          <li>בדוק את <a href="https://weccelerate.co.il/admin/bot-analytics" style="color: #10b981;">דשבורד ה-Bot Analytics</a> לראות את המגמה.</li>
        </ol>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">
          הודעה אוטומטית מ-WeCcelerate GEO Alert<br>
          נשלחת רק בפעם הראשונה שכל סוג של live-retrieval bot מופיע. ביקורים נוספים מאותו bot — לא ייצרו מייל נוסף.
        </p>
      </body>
      </html>
    `,
  });

  console.log(
    JSON.stringify({
      event: 'geo-citation-alert-sent',
      bot: payload.bot,
      path: payload.path,
      recipient: GEO_ALERT_RECIPIENT,
      ts: new Date().toISOString(),
    }),
  );
}
