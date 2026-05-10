import { NextRequest, NextResponse } from 'next/server';
import { runSelfImprover } from '@/lib/agents/self-improver';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const summary = await runSelfImprover();
  return NextResponse.json({ ok: true, ...summary });
}
