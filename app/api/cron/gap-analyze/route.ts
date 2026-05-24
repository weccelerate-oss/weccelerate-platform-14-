// MANUAL-TRIGGER ONLY — not on cron schedule. See david-daily/ for the scheduled entry point.
/**
 * GET /api/cron/gap-analyze
 *
 * Runs after the daily geo-probe cron. Aggregates the last 14 days of
 * probe results, opens new ContentGap rows for queries with low/zero
 * citation rates, and closes gaps that are now performing well.
 *
 * No longer scheduled — david-daily orchestrates all stages. Kept as a
 * manual entrypoint for ops debugging (curl with the cron secret).
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeGaps } from '@/lib/agents/gap-analyzer';
import { requireCron } from '@/lib/auth/require-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;
  const summary = await analyzeGaps();
  console.log(JSON.stringify({ event: 'gap-analyze-run', summary, ts: new Date().toISOString() }));
  return NextResponse.json({ ok: true, ...summary });
}
