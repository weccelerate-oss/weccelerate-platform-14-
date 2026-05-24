// MANUAL-TRIGGER ONLY — not on cron schedule. See david-daily/ for the scheduled entry point.
import { NextRequest, NextResponse } from 'next/server';
import { runSelfImprover } from '@/lib/agents/self-improver';
import { requireCron } from '@/lib/auth/require-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const unauth = requireCron(req);
  if (unauth) return unauth;
  const summary = await runSelfImprover();
  return NextResponse.json({ ok: true, ...summary });
}
