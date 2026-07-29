/**
 * Campaign Driver — drain the writing queue through PRODUCTION.
 * ==============================================================
 *
 * WHY THIS EXISTS ALONGSIDE campaign-run.ts
 *
 * campaign-run.ts writes articles in this process, which needs ANTHROPIC_API_KEY
 * locally. That key is marked Sensitive in Vercel, so its value cannot be read
 * back by the CLI or the dashboard — `vercel env pull` returns it empty. Rather
 * than move a production secret onto a laptop, this script drives the deployed
 * app instead: production already holds the key, and we only need CRON_SECRET
 * (which is readable) to authenticate.
 *
 * Each request to /api/cron/writer-pump advances up to `--jobs` WritingJobs by
 * one stage each, inside that invocation's own 300s budget — so the 60s ceiling
 * that kills the daily cron never applies here. We keep several requests in
 * flight; pumpWritingJobs() atomically claims a job before working on it and
 * skips anything touched in the last 90s, so overlapping requests pick
 * different jobs instead of colliding.
 *
 * Progress is read from the database directly (DATABASE_URL pulls fine), not
 * inferred from the pump responses — the pump answers 202 immediately and does
 * its work in after(), so its response says nothing about what completed.
 *
 * USAGE
 *   npx tsx scripts/seo/campaign-drive.ts --env=.env.production.local
 *
 *   --env=PATH       env file with CRON_SECRET + DATABASE_URL
 *   --base=URL       deployment to drive     (default https://weccelerate.co.il)
 *   --parallel=N     requests in flight      (default 4)
 *   --jobs=N         jobs advanced per request, 1-5   (default 4)
 *   --interval=MS    delay between waves     (default 20000)
 *   --max-minutes=N  stop after N minutes    (default 180)
 *   --once           fire a single wave and exit
 */

import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : 'true';
};
const num = (name: string, fallback: number): number => {
  const v = Number(flag(name));
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

const BASE = (flag('base') ?? 'https://weccelerate.co.il').replace(/\/$/, '');
const PARALLEL = num('parallel', 4);
const JOBS_PER_REQUEST = Math.min(num('jobs', 4), 5);
const INTERVAL_MS = num('interval', 20_000);
const MAX_MINUTES = num('max-minutes', 180);
const ONCE = Boolean(flag('once'));

function loadEnvFile(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    if (!value || process.env[m[1]]) continue; // skip blanks (Vercel's Sensitive vars) and real env
    process.env[m[1]] = value;
  }
}

const t0 = Date.now();
const elapsed = () => {
  const s = Math.round((Date.now() - t0) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
const log = (m: string) => console.log(`[${elapsed()}] ${m}`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const extraEnv = flag('env');
  if (extraEnv) loadEnvFile(path.resolve(extraEnv));
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET is not set — cannot authenticate to the pump.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set — cannot read progress.');
    process.exit(1);
  }

  const { prisma } = await import('@/lib/db');

  console.log(`driving : ${BASE}/api/cron/writer-pump`);
  console.log(`waves   : ${PARALLEL} parallel x ${JOBS_PER_REQUEST} jobs, every ${INTERVAL_MS / 1000}s`);
  console.log(`stop at : ${MAX_MINUTES} minutes\n`);

  const deadline = Date.now() + MAX_MINUTES * 60_000;
  let wave = 0;

  for (;;) {
    const pending = await queueState(prisma);
    log(
      `queue: ${pending.active} active (${pending.byStage}) | published ${pending.published} | drafts ${pending.drafts} | failed ${pending.failed}`,
    );

    if (pending.active === 0) {
      log('queue drained — every job reached a terminal stage.');
      break;
    }
    if (Date.now() > deadline) {
      log(`stopping: hit the ${MAX_MINUTES}-minute cap with ${pending.active} jobs still active.`);
      break;
    }

    wave += 1;
    const results = await Promise.allSettled(
      Array.from({ length: PARALLEL }, () => pump()),
    );
    const ok = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    log(`wave ${wave}: ${ok}/${PARALLEL} pump requests accepted`);

    if (ONCE) break;
    await sleep(INTERVAL_MS);
  }

  const final = await queueState(prisma);
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  published : ${final.published}`);
  console.log(`  drafts    : ${final.drafts}   (gated — review at /admin/drafts)`);
  console.log(`  failed    : ${final.failed}`);
  console.log(`  active    : ${final.active}`);
  console.log('='.repeat(70));
  console.log('\nVerify findability:');
  console.log('  npx tsx scripts/seo/campaign-verify.ts --env=.env.production.local --indexnow');

  await prisma.$disconnect();
}

/** Fire one pump request. Returns true if the deployment accepted it. */
async function pump(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/cron/writer-pump?jobs=${JOBS_PER_REQUEST}`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      // The route answers 202 in milliseconds and pumps in after(); a long wait
      // here would mean something is wrong with the deployment, not the queue.
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      log(`  pump returned ${res.status}: ${(await res.text()).slice(0, 120)}`);
      return false;
    }
    return true;
  } catch (e) {
    log(`  pump request failed: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any -- lib/db exports an untyped client */
async function queueState(prisma: any) {
  const stages: Array<{ stage: string; _count: number }> = await prisma.writingJob.groupBy({
    by: ['stage'],
    _count: true,
  });
  const count = (s: string) => stages.find((r) => r.stage === s)?._count ?? 0;
  const active = stages
    .filter((r) => r.stage !== 'done' && r.stage !== 'failed')
    .reduce((sum, r) => sum + r._count, 0);

  return {
    active,
    failed: count('failed'),
    byStage: stages
      .filter((r) => r.stage !== 'done' && r.stage !== 'failed')
      .map((r) => `${r.stage}:${r._count}`)
      .join(' ') || 'none',
    published: await prisma.generatedGuide.count({ where: { status: 'published' } }),
    drafts: await prisma.generatedGuide.count({ where: { status: 'draft' } }),
  };
}

main().catch((e) => {
  console.error('\ncampaign-drive failed:', e);
  process.exit(1);
});
