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

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
