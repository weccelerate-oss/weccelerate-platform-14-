/**
 * POST /api/admin/geo-probe/run
 *
 * Manual trigger of the same probe run that the daily cron does. Used to
 * test the pipeline before or instead of waiting for the cron.
 *
 * Gated by ADMIN_TOKEN — same token used by IndexNow and other admin
 * endpoints (see docs/MANUAL-ACTIONS-FOR-ALON.md P3).
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAllProbes } from '@/lib/seo/geo-probes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runAllProbes();
  return NextResponse.json({ ok: true, ...summary });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    configured: {
      perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    cronSchedule: 'daily at 06:00 UTC (see vercel.json)',
    note: 'POST to this endpoint to trigger a probe run on demand.',
  });
}
