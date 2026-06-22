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
import { startWritingJobs } from '@/lib/agents/content-writer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const analyze = await analyzeGaps();
  // Kicks off the split pipeline (research -> write -> finalize), each stage in
  // its own invocation. Returns immediately with the WritingJob id(s); the
  // article publishes asynchronously over the next few minutes.
  const result = await startWritingJobs();
  return NextResponse.json({
    ok: true,
    analyze,
    write: result,
    note: 'Article(s) finish asynchronously via the split pipeline. Track in writing_jobs / /admin/geo-plan.',
  });
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
      'pick highest-severity open gap → create WritingJob',
      '[stage research] Anthropic Sonnet + web_search',
      '[stage write] outline + 1800-2500 words HE (Anthropic Sonnet)',
      '[stage finalize] fact-check (Sonnet) → SEO/policy lint → persist GeneratedGuide → IndexNow → email Katrin',
      'each stage runs in its own invocation, chained via after() — fits Hobby 60s limit',
    ],
    cronSchedule: 'daily 06:00 UTC',
  });
}
