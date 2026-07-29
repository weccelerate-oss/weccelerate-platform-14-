/**
 * Keyword Campaign Runner — write every planned article in one session.
 * =====================================================================
 *
 * WHY THIS RUNS LOCALLY AND NOT AS A CRON
 *
 * David's production pipeline is shaped entirely around Vercel's serverless
 * limits: one article per day, advanced one stage per ping, because a full Opus
 * article takes 100-200s and the function budget is 60s. Worse, the daily cron
 * (/api/cron/david-daily) runs probe + analyze BEFORE the write stage, and on a
 * Hobby plan those two alone consume the whole 60s — which is why the write
 * stage logged one picked-gap in seven days while 39 gaps sat open.
 *
 * That architecture cannot deliver 69 articles. This script drives the exact
 * same WritingJob state machine from a normal Node process, where there is no
 * function timeout, so it can run all of them to completion in one pass with
 * real concurrency.
 *
 * Same state machine means: same policy gate, same fact-check, same self-
 * revision, same DB rows, fully resumable. Kill it halfway and re-run — jobs
 * pick up from their persisted stage.
 *
 * USAGE
 *   npx tsx scripts/seo/campaign-run.ts --env=<path-to-env-with-ANTHROPIC_API_KEY>
 *
 *   --env=PATH        extra env file to load (e.g. the pulled Vercel env)
 *   --concurrency=N   articles in flight at once           (default 4)
 *   --limit=N         only the top N briefs by priority    (default: all)
 *   --seed-only       seed the queue, write nothing
 *   --open-jobs       seed + open a WritingJob per brief, then stop (no API key
 *                     needed — pure DB work). Pair with campaign-drive.ts to let
 *                     the deployed app do the writing with its own key.
 *   --no-expand       skip the LLM question-expansion pass (free, faster)
 *   --resume          skip seeding, just drive existing jobs to completion
 *   --dry             print the plan and exit, touch nothing
 */

import fs from 'fs';
import path from 'path';

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : 'true';
};
const num = (name: string, fallback: number): number => {
  const v = flag(name);
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const CONCURRENCY = num('concurrency', 4);
const LIMIT = flag('limit') ? num('limit', 0) : undefined;
const SEED_ONLY = Boolean(flag('seed-only'));
const OPEN_JOBS_ONLY = Boolean(flag('open-jobs'));
const NO_EXPAND = Boolean(flag('no-expand'));
const RESUME = Boolean(flag('resume'));
const DRY = Boolean(flag('dry'));

// -----------------------------------------------------------------------------
// Env — load .env files before importing anything that reads process.env
// -----------------------------------------------------------------------------

function loadEnvFile(file: string): number {
  if (!fs.existsSync(file)) return 0;
  let n = 0;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    if (process.env[key]) continue; // first definition wins; real env beats files
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '');
    n += 1;
  }
  return n;
}

// -----------------------------------------------------------------------------
// Pretty output
// -----------------------------------------------------------------------------

const t0 = Date.now();
const elapsed = () => {
  const s = Math.round((Date.now() - t0) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const log = (msg: string) => console.log(`[${elapsed()}] ${msg}`);
const rule = (title: string) => console.log(`\n${'='.repeat(72)}\n  ${title}\n${'='.repeat(72)}`);

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const extraEnv = flag('env');
  if (extraEnv) {
    const resolved = path.resolve(extraEnv);
    const loaded = loadEnvFile(resolved);
    console.log(`env: loaded ${loaded} vars from ${resolved}`);
  }
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Point --env at a file that defines it.');
    process.exit(1);
  }

  const { buildContentPlan, keywordCoverage } = await import('@/lib/agents/topic-strategy');
  const coverage = keywordCoverage();
  const plan = LIMIT ? buildContentPlan().slice(0, LIMIT) : buildContentPlan();

  rule('CONTENT PLAN');
  console.log(`  keywords in research file : ${coverage.totalKeywords}`);
  console.log(`  routed to an article      : ${coverage.routedKeywords}  (orphans: ${coverage.orphanKeywords.length})`);
  console.log(`  monthly search volume     : ${coverage.totalVolume.toLocaleString()}`);
  console.log(`  articles planned          : ${plan.length}  (${coverage.pillars} pillars + ${coverage.clusters} clusters)`);
  console.log(`  concurrency               : ${CONCURRENCY}`);
  if (coverage.orphanKeywords.length > 0) {
    console.log(`  WARNING unrouted keywords : ${coverage.orphanKeywords.join(', ')}`);
  }

  if (DRY) {
    rule('BRIEFS (dry run — nothing written)');
    for (const b of plan) {
      console.log(`  [${b.priority}] ${b.role.padEnd(7)} vol=${String(b.volume).padStart(4)}  ${b.primaryKeyword}`);
      console.log(`        +${b.secondaryKeywords.length} secondary, ${b.targetQuestions.length} questions`);
    }
    return;
  }

  // Seeding and opening jobs are pure DB work and need no model access; only
  // writing (or the LLM expansion pass) actually calls Anthropic.
  const needsAnthropic = !(SEED_ONLY || OPEN_JOBS_ONLY) || !NO_EXPAND;
  if (needsAnthropic && !process.env.ANTHROPIC_API_KEY) {
    console.error('\nANTHROPIC_API_KEY is not set — the writer cannot run.');
    console.error('Pull it from Vercel first:');
    console.error('  npx vercel env pull .env.production.local --environment=production');
    console.error('then re-run with --env=.env.production.local');
    process.exit(1);
  }

  const { prisma } = await import('@/lib/db');
  const { seedKeywordCampaign, campaignStatus } = await import('@/lib/agents/keyword-campaign');
  const { advanceWritingJob } = await import('@/lib/agents/content-writer');

  // ---- 1. Seed -------------------------------------------------------------
  if (!RESUME) {
    rule('SEEDING QUEUE');
    if (!NO_EXPAND) {
      log(`running LLM question-expansion on ${plan.length} briefs (one Sonnet call each)...`);
    }
    const seed = await seedKeywordCampaign({
      expand: !NO_EXPAND,
      limit: LIMIT,
      onProgress: (done, total, brief) => {
        if (done % 5 === 0 || done === total) {
          log(`  seeded ${done}/${total}  (latest: ${brief.primaryKeyword})`);
        }
      },
    });
    log(`created ${seed.created}, updated ${seed.updated}, already published ${seed.skippedAlreadyWritten}, expanded ${seed.expanded}`);
  }

  if (SEED_ONLY) {
    const status = await campaignStatus();
    rule('SEED COMPLETE');
    console.log(`  briefs seeded: ${status.seeded}/${status.totalBriefs}  open: ${status.open}`);
    await prisma.$disconnect();
    return;
  }

  // ---- 2. Open a WritingJob per unwritten brief ----------------------------
  // startWritingJobs() in content-writer.ts defaults to ONE job per call and is
  // gated behind the daily plan's writing-day check. Neither is appropriate
  // here: we are deliberately draining the whole queue in one session, so we
  // claim every eligible gap ourselves using the same atomic guard it uses.
  rule('OPENING WRITING JOBS');
  const jobIds = await openJobsForCampaign(prisma, LIMIT);
  log(`${jobIds.length} jobs ready to run`);

  if (OPEN_JOBS_ONLY) {
    rule('JOBS OPENED — writing handed off');
    console.log(`  ${jobIds.length} WritingJobs are queued at stage 'research'.`);
    console.log('  Drive them through the deployed app (which holds the API key):');
    console.log('    npx tsx scripts/seo/campaign-drive.ts --env=.env.production.local');
    await prisma.$disconnect();
    return;
  }

  if (jobIds.length === 0) {
    log('nothing to write — every brief already has a published article or a live job.');
    await printStatus(prisma, campaignStatus);
    await prisma.$disconnect();
    return;
  }

  // ---- 3. Drive every job to a terminal stage ------------------------------
  rule(`WRITING ${jobIds.length} ARTICLES (concurrency ${CONCURRENCY})`);
  const outcomes = await runPool(jobIds, CONCURRENCY, (jobId, index) =>
    driveJob(prisma, advanceWritingJob, jobId, index, jobIds.length),
  );

  // ---- 4. Report -----------------------------------------------------------
  rule('RESULTS');
  const published = outcomes.filter((o) => o.result === 'published');
  const drafted = outcomes.filter((o) => o.result === 'draft');
  const failed = outcomes.filter((o) => o.result === 'failed');
  console.log(`  published : ${published.length}`);
  console.log(`  drafted   : ${drafted.length}   (gated — needs a look in /admin)`);
  console.log(`  failed    : ${failed.length}`);
  for (const f of failed) console.log(`     FAIL  ${f.query}  —  ${f.error?.slice(0, 120)}`);
  for (const d of drafted) console.log(`     DRAFT ${d.query}  —  ${d.error?.slice(0, 120)}`);

  await printStatus(prisma, campaignStatus);

  console.log('\nNext: verify the articles are actually findable:');
  console.log('  npx tsx scripts/seo/campaign-verify.ts --env=<same env file>');

  await prisma.$disconnect();
}

// -----------------------------------------------------------------------------
// Job orchestration
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Db = any;

/**
 * Claim every open keyword-campaign gap and open a WritingJob for each.
 *
 * Uses the same `updateMany` guarded on `status: 'open'` that claimNextGap()
 * uses, so a gap can never be claimed twice even if this script is run in two
 * terminals at once. Gaps that already have a live (non-terminal) job are left
 * alone and picked up by the resume path instead.
 */
async function openJobsForCampaign(prisma: Db, limit?: number): Promise<string[]> {
  // Resume first: any campaign job still mid-pipeline from a previous run.
  const liveJobs: Array<{ id: string }> = await prisma.writingJob.findMany({
    where: { stage: { notIn: ['done', 'failed'] } },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  const jobIds = liveJobs.map((j) => j.id);

  const gaps: Array<{ id: string; query: string; category: string | null; competitors: string[]; brief: unknown }> =
    await prisma.contentGap.findMany({
      where: { source: 'keyword-campaign', status: 'open' },
      orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
      ...(limit ? { take: limit } : {}),
    });

  for (const gap of gaps) {
    const claim = await prisma.contentGap.updateMany({
      where: { id: gap.id, status: 'open' },
      data: { status: 'in_progress' },
    });
    if (claim.count !== 1) continue; // lost the race — another runner owns it

    const job = await prisma.writingJob.create({
      data: {
        gapId: gap.id,
        query: gap.query,
        category: gap.category ?? null,
        competitors: gap.competitors ?? [],
        brief: (gap.brief ?? null) as object | null,
        stage: 'research',
      },
    });
    jobIds.push(job.id);
  }

  return jobIds;
}

interface Outcome {
  jobId: string;
  query: string;
  result: 'published' | 'draft' | 'failed';
  slug?: string;
  error?: string;
}

/**
 * Advance one job until it reaches a terminal stage.
 *
 * advanceWritingJob() performs exactly one stage per call (and, in the sections
 * stage, as many sections as fit a 42s budget) — that chunking exists for
 * serverless, and locally it simply means we loop. The step cap is a runaway
 * guard: a healthy article needs research + plan + ~3 section batches +
 * finalize, plus up to 2 self-revision rounds, so 40 is generous.
 */
async function driveJob(
  prisma: Db,
  advance: (jobId: string) => Promise<void>,
  jobId: string,
  index: number,
  total: number,
): Promise<Outcome> {
  const MAX_STEPS = 40;
  const label = `[${String(index + 1).padStart(2)}/${total}]`;
  let query = '';

  for (let step = 0; step < MAX_STEPS; step++) {
    const job = await prisma.writingJob.findUnique({ where: { id: jobId } });
    if (!job) return { jobId, query, result: 'failed', error: 'job row disappeared' };
    query = job.query;

    if (job.stage === 'done') {
      const guide = job.generatedGuideId
        ? await prisma.generatedGuide.findUnique({ where: { id: job.generatedGuideId } })
        : null;
      // A job reaches 'done' both when it publishes AND when a gated article is
      // parked as a hidden draft. Only the guide's own status distinguishes them.
      if (guide?.status === 'published') {
        log(`${label} PUBLISHED  ${guide.titleHe}  ->  /guides/${guide.slug}`);
        return { jobId, query, result: 'published', slug: guide.slug };
      }
      log(`${label} DRAFT      ${query}  (${job.error ?? 'gated'})`);
      return { jobId, query, result: 'draft', slug: guide?.slug, error: job.error ?? undefined };
    }

    if (job.stage === 'failed') {
      log(`${label} FAILED     ${query}  (${(job.error ?? '').slice(0, 100)})`);
      return { jobId, query, result: 'failed', error: job.error ?? undefined };
    }

    const before = `${job.stage}:${job.sectionIndex ?? 0}`;
    await advance(jobId);
    const after = await prisma.writingJob.findUnique({
      where: { id: jobId },
      select: { stage: true, sectionIndex: true, attempts: true },
    });
    const now = `${after?.stage}:${after?.sectionIndex ?? 0}`;
    if (before !== now) log(`${label} ${before} -> ${now}  ${query.slice(0, 44)}`);

    // A stage that neither advanced nor errored means the model returned
    // something unusable and handleStageError bumped attempts. Give the API a
    // moment rather than hammering it in a tight loop.
    if (before === now && (after?.attempts ?? 0) > 0) {
      await sleep(3_000);
    }
  }

  return { jobId, query, result: 'failed', error: `exceeded ${MAX_STEPS} steps without finishing` };
}

/** Run tasks with a fixed number in flight. Preserves input order in results. */
async function runPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function lane() {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        results[i] = await worker(items[i], i);
      } catch (e) {
        results[i] = { result: 'failed', error: e instanceof Error ? e.message : String(e) } as R;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, lane));
  return results;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function printStatus(prisma: Db, campaignStatus: () => Promise<any>) {
  const status = await campaignStatus();
  const pct = status.volumeTotal > 0 ? Math.round((status.volumeCovered / status.volumeTotal) * 100) : 0;
  rule('CAMPAIGN COVERAGE');
  console.log(`  briefs published : ${status.published}/${status.totalBriefs}`);
  console.log(`  search volume served : ${status.volumeCovered.toLocaleString()} / ${status.volumeTotal.toLocaleString()} per month (${pct}%)`);
  console.log(`  still open : ${status.open}   in progress : ${status.inProgress}`);
}

main().catch((e) => {
  console.error('\ncampaign-run failed:', e);
  process.exit(1);
});
