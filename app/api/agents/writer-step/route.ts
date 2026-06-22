/**
 * POST /api/agents/writer-step
 *
 * One stage of דוד's split writer pipeline (see lib/agents/content-writer.ts,
 * "SPLIT PIPELINE — WritingJob state machine"). The monolithic writer can't
 * finish inside Vercel's 60s function limit, so each WritingJob advances one
 * stage per invocation: research -> write -> finalize.
 *
 * This route ACKNOWLEDGES with 202 immediately and runs the (slow) stage work
 * in `after()`, so it owns a full fresh 60s budget per stage and the caller's
 * dispatch fetch never blocks. Each stage re-dispatches the next by POSTing
 * back here; the final stage stops the chain. Auth reuses the cron secret so
 * the endpoint can't be driven by the public internet.
 */

import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { requireCron } from '@/lib/auth/require-cron';
import { advanceWritingJob } from '@/lib/agents/content-writer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Each stage must fit here. Sonnet research/write/fact-check each run well
// under 60s; Vercel Hobby caps to 60 regardless (see david-daily route note).
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;

  let jobId: string | undefined;
  try {
    const body = (await req.json()) as { jobId?: string };
    jobId = body.jobId;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }

  // Heavy work runs after the response is sent — Vercel keeps the function
  // alive for it up to maxDuration, giving the stage a full fresh budget.
  const id = jobId;
  after(() => advanceWritingJob(id));

  return NextResponse.json({ ok: true, jobId, accepted: true }, { status: 202 });
}
