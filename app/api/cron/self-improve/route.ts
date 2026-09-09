// MANUAL-TRIGGER ONLY — not on cron schedule. See david-daily/ for the scheduled entry point.
import { NextRequest, NextResponse } from 'next/server';
import { runSelfImprover } from '@/lib/agents/self-improver';
import { requireCron } from '@/lib/auth/require-cron';
import { davidPausedResponse } from '@/lib/agents/automation-paused';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;
  const paused = davidPausedResponse('self-improve');
  if (paused) return paused;
  const summary = await runSelfImprover();
  return NextResponse.json({ ok: true, ...summary });
}
