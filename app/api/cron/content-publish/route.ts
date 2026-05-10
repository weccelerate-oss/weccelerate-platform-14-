/**
 * GET /api/cron/content-publish
 *
 * Daily writer agent. Runs once per day, picks the highest-priority
 * ContentGap, generates a Hebrew guide, fact-checks, and publishes.
 *
 * Schedule: 07:00 UTC (after geo-probe at 06:00 and gap-analyze at 06:30).
 *
 * Designed to be idempotent and safe: if anything fails the gap is
 * returned to "open" state and the next run can retry.
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeNextGuide } from '@/lib/agents/content-writer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 600; // up to 10 minutes — multi-stage agent

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await writeNextGuide();
  console.log(JSON.stringify({ event: 'content-publish-run', result, ts: new Date().toISOString() }));
  return NextResponse.json(result);
}
