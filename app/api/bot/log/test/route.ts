/**
 * GET /api/bot/log/test
 *
 * TEMPORARY diagnostic endpoint. Synchronously writes one BotVisit row and
 * returns the actual result (or the actual error). Used to debug why the
 * fire-and-forget writes from /api/bot/log were silently failing.
 *
 * REMOVE this file once the root cause is fixed.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    dbHost: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).host
      : null,
    prismaModelExists: typeof (prisma as { botVisit?: unknown }).botVisit === 'object',
  };

  try {
    const row = await prisma.botVisit.create({
      data: {
        bot: 'GPTBot',
        path: `/diagnostic-${Date.now()}`,
        host: 'weccelerate.co.il',
        method: 'GET',
        userAgent: 'diagnostic-endpoint',
      },
    });
    return NextResponse.json({
      ok: true,
      ...diagnostics,
      createdRow: { id: row.id, bot: row.bot, path: row.path },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        ...diagnostics,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.split('\n').slice(0, 5) : undefined,
      },
      { status: 500 },
    );
  }
}
