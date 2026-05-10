/**
 * GET /api/cron/gap-analyze
 *
 * Runs after the daily geo-probe cron. Aggregates the last 14 days of
 * probe results, opens new ContentGap rows for queries with low/zero
 * citation rates, and closes gaps that are now performing well.
 *
 * Schedule: 06:30 UTC (30 minutes after geo-probe).
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeGaps } from '@/lib/agents/gap-analyzer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const summary = await analyzeGaps();
  console.log(JSON.stringify({ event: 'gap-analyze-run', summary, ts: new Date().toISOString() }));
  return NextResponse.json({ ok: true, ...summary });
}
