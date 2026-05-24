// MANUAL-TRIGGER ONLY — not on cron schedule. See david-daily/ for the scheduled entry point.
/**
 * GET /api/cron/content-publish
 *
 * Writer agent — picks the highest-priority ContentGap, generates a
 * Hebrew guide, fact-checks, and publishes. No longer scheduled;
 * david-daily owns the writing stage. Kept as a manual force-write
 * endpoint for ops debugging.
 *
 * Designed to be idempotent and safe: if anything fails the gap is
 * returned to "open" state and the next run can retry.
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeNextGuide } from '@/lib/agents/content-writer';
import { requireCron } from '@/lib/auth/require-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Hobby plan cap; Pro plan can extend to 800s

export async function GET(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;
  const result = await writeNextGuide();
  console.log(JSON.stringify({ event: 'content-publish-run', result, ts: new Date().toISOString() }));
  return NextResponse.json(result);
}
