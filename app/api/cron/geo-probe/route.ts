/**
 * GET /api/cron/geo-probe
 *
 * Vercel cron entrypoint. Asks each configured LLM (Perplexity, OpenAI, …)
 * the queries in lib/seo/geo-probes.ts and persists the answers + whether
 * WeCcelerate was mentioned/cited.
 *
 * Schedule lives in vercel.json. Auth via CRON_SECRET (Vercel sets this in
 * the request automatically when triggered by their cron scheduler).
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllProbes } from '@/lib/seo/geo-probes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes — probe runs are slow.

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runAllProbes();

  console.log(
    JSON.stringify({
      event: 'geo-probe-run',
      summary,
      ts: new Date().toISOString(),
    }),
  );

  return NextResponse.json({ ok: true, ...summary });
}
