// MANUAL-TRIGGER ONLY — not on cron schedule. See david-daily/ for the scheduled entry point.
/**
 * GET /api/cron/geo-probe
 *
 * Asks each configured LLM (Perplexity, OpenAI, …) the queries in
 * lib/seo/geo-probes.ts and persists the answers + whether WeCcelerate
 * was mentioned/cited.
 *
 * Auth via CRON_SECRET. No longer scheduled — david-daily orchestrates;
 * this stays as a manual probe endpoint for debugging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllProbes } from '@/lib/seo/geo-probes';
import { requireCron } from '@/lib/auth/require-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Hobby plan cap; Pro plan can extend to 800s

export async function GET(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;

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
