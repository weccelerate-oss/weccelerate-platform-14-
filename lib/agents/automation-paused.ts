/**
 * David automation kill switch.
 *
 * 2026-09-09 — the owner paused ALL of David's autonomous work (daily
 * pipeline, GEO probes, gap analysis, writer pump, self-improve, daily
 * report) because the LLM/email spend was out of control. The only David
 * feature that stays live is the entrepreneur-portal answer review
 * (/api/portal/journey/feedback), which is user-initiated and quota-capped.
 *
 * Every /api/cron/* route that belongs to David calls `davidPausedResponse()`
 * right after auth and returns early. External pingers (cron-job.org, GitHub
 * Actions) that still hit the endpoints get a cheap 200 and nothing runs.
 *
 * To resume: set DAVID_AUTOMATION_ENABLED=1 on Vercel AND restore the cron
 * entries in vercel.json / the writer-pump workflow. Paused is the default
 * on purpose — a missing env var must never silently re-enable spend.
 */
import { NextResponse } from 'next/server';

export const DAVID_AUTOMATION_PAUSED = process.env.DAVID_AUTOMATION_ENABLED !== '1';

export function davidPausedResponse(route: string): Response | null {
  if (!DAVID_AUTOMATION_PAUSED) return null;
  return NextResponse.json({
    ok: true,
    paused: true,
    route,
    reason: 'David automation is paused by the owner (DAVID_AUTOMATION_ENABLED != 1). Nothing ran.',
  });
}
