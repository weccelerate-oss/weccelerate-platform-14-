/**
 * GET /api/cron/writer-pump
 *
 * The reliable driver for דוד's writer pipeline. Advances the oldest active
 * WritingJob by ONE step (research → plan → sections-batch → finalize) and
 * returns. Meant to be hit every ~3 minutes by an external scheduler
 * (cron-job.org), because Vercel Hobby allows only daily crons and the
 * in-process `after()` self-dispatch dropped too often and stalled jobs.
 *
 * Idempotent + concurrency-safe: pumpWritingJobs only picks a job idle for
 * > 90s and atomically claims it, so overlapping pings can't double-process.
 * Auth reuses CRON_SECRET (same Bearer token as the other crons), so the
 * public internet can't drive it.
 *
 * Setup (one-time, at cron-job.org or any scheduler):
 *   URL:    https://weccelerate.co.il/api/cron/writer-pump
 *   Method: GET
 *   Header: Authorization: Bearer <CRON_SECRET>
 *   Every:  3 minutes
 */

import { NextRequest, NextResponse, after } from 'next/server';
import { requireCron } from '@/lib/auth/require-cron';
import { pumpWritingJobs } from '@/lib/agents/content-writer';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;

  // Liveness proof for the daily report: a stale heartbeat means the external
  // pinger stopped (or was never configured) and jobs are crawling on the
  // once-daily backstop. Best-effort — a missing table must not break pumping.
  await prisma.agentHeartbeat
    .upsert({
      where: { name: 'writer-pump' },
      create: { name: 'writer-pump' },
      // Writing name-to-same-value forces a real UPDATE so @updatedAt bumps
      // (an empty update object can skip the write entirely).
      update: { name: 'writer-pump' },
    })
    .catch(() => {});

  // Respond IMMEDIATELY and do the slow pump work post-response. A single
  // pump step (an Opus section batch) runs 30-50s, but cron-job.org's free
  // tier stops waiting at 30s and logs "Failed (timeout)" — and repeatedly
  // "failing" jobs get auto-disabled there, which would silently kill the
  // writer again. after() keeps the invocation alive to maxDuration while
  // the pinger already got its 200. This is same-invocation after() (safe),
  // NOT the dropped-dispatch fetch chaining that stalled jobs before.
  after(async () => {
    try {
      const result = await pumpWritingJobs(1);
      if (result.advanced.length > 0) {
        console.log(JSON.stringify({ event: 'writer-pump-advanced', jobIds: result.advanced }));
      }
    } catch (e) {
      console.error(JSON.stringify({ event: 'writer-pump-error', error: e instanceof Error ? e.message : String(e) }));
    }
  });

  return NextResponse.json({ ok: true, accepted: true });
}
