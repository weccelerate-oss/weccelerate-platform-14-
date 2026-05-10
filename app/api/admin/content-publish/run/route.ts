/**
 * POST /api/admin/content-publish/run
 *
 * Manual trigger of the writer agent — useful for testing the pipeline
 * before letting the daily cron loose. Gated by ADMIN_TOKEN.
 *
 * Also runs analyzeGaps() first so a fresh gap is considered, not just
 * yesterday's snapshot.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeGaps } from '@/lib/agents/gap-analyzer';
import { writeNextGuide } from '@/lib/agents/content-writer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const analyze = await analyzeGaps();
  const result = await writeNextGuide();
  return NextResponse.json({ ok: true, analyze, write: result });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    configured: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
    },
    pipeline: [
      'analyze-gaps (geo_probes → content_gaps)',
      'pick highest-severity open gap',
      'research (Anthropic + web_search)',
      'outline (Anthropic Opus)',
      'write 1800-2500 words HE (Anthropic Opus)',
      'pick internal links (deterministic)',
      'fact-check (Anthropic Sonnet)',
      'SEO lint (deterministic)',
      'persist as GeneratedGuide',
      'IndexNow push to Bing/Yandex',
    ],
    cronSchedule: 'daily 07:00 UTC',
  });
}
