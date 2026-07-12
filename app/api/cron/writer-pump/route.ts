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

import { NextRequest, NextResponse } from 'next/server';
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

  const result = await pumpWritingJobs(1);
  return NextResponse.json({ ok: true, ...result });
}
