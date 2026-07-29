/**
 * Keyword Campaign Verifier — prove the articles are actually findable.
 * =====================================================================
 *
 * WHAT "FINDABLE" HONESTLY MEANS, AND WHAT THIS CAN PROVE TODAY
 *
 * There are two different questions and they have very different answers:
 *
 *   A. "Is every technical precondition for being found satisfied?"
 *      Verifiable RIGHT NOW, deterministically. A page that 200s, is
 *      indexable, carries valid Article + FAQPage schema, contains its target
 *      keyword in the H1, sits in the sitemap, and has been pushed to IndexNow
 *      is a page search engines and answer engines CAN find and CAN cite.
 *      Every one of those is a hard pass/fail and this script checks all of them.
 *
 *   B. "Do Google and the LLMs actually cite us for these phrases?"
 *      NOT verifiable right now, by anyone, for any site. Google must crawl,
 *      index, and rank the page (days to weeks). LLMs with live retrieval need
 *      the page in their search index; LLMs without it need a training refresh
 *      (months). A tool claiming to confirm this minutes after publishing would
 *      be lying.
 *
 * So this script does the only intellectually honest thing: it hard-verifies
 * (A), and for (B) it records a dated BASELINE — asking the real engines the
 * real target keywords today and logging whether we are cited. Re-run it in a
 * week and a month with --baseline-only and the delta is the actual proof that
 * the content worked. The first run is the "before" photo.
 *
 * USAGE
 *   npx tsx scripts/seo/campaign-verify.ts --env=<env file>
 *
 *   --env=PATH        env file to load (needs DATABASE_URL; API keys for probes)
 *   --base=URL        site to verify        (default https://weccelerate.co.il)
 *   --skip-probe      technical checks only, no LLM calls
 *   --baseline-only   just re-measure LLM citations (for the week/month re-run)
 *   --probe-limit=N   how many keywords to probe   (default 12)
 *   --indexnow        submit every verified URL to IndexNow
 */

/* eslint-disable @typescript-eslint/no-explicit-any --
 * This script's job is to inspect things whose shape we deliberately do not
 * control: JSON-LD blocks scraped out of live HTML, and raw response bodies
 * from four different LLM vendors. Modelling those as typed interfaces would
 * assert a contract we cannot enforce and would hide exactly the malformations
 * this verifier exists to detect. The dynamic access is confined to this file. */

import fs from 'fs';
import path from 'path';

// -----------------------------------------------------------------------------
// CLI + env
// -----------------------------------------------------------------------------

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  return hit.includes('=') ? hit.split('=').slice(1).join('=') : 'true';
};

const BASE = (flag('base') ?? 'https://weccelerate.co.il').replace(/\/$/, '');
const SKIP_PROBE = Boolean(flag('skip-probe'));
const BASELINE_ONLY = Boolean(flag('baseline-only'));
const PROBE_LIMIT = Number(flag('probe-limit') ?? 12);
const DO_INDEXNOW = Boolean(flag('indexnow'));

function loadEnvFile(file: string): void {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

// -----------------------------------------------------------------------------
// Output
// -----------------------------------------------------------------------------

let passCount = 0;
let failCount = 0;
let warnCount = 0;

const rule = (t: string) => console.log(`\n${'='.repeat(74)}\n  ${t}\n${'='.repeat(74)}`);
const pass = (m: string) => { passCount++; console.log(`  PASS  ${m}`); };
const fail = (m: string) => { failCount++; console.log(`  FAIL  ${m}`); };
const warn = (m: string) => { warnCount++; console.log(`  WARN  ${m}`); };
const info = (m: string) => console.log(`        ${m}`);

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const extraEnv = flag('env');
  if (extraEnv) loadEnvFile(path.resolve(extraEnv));
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Point --env at a file that defines it.');
    process.exit(1);
  }

  const { prisma } = await import('@/lib/db');

  // The campaign's own articles — identified by the gap that commissioned them.
  const gaps = await prisma.contentGap.findMany({
    where: { source: 'keyword-campaign', status: 'published' },
    select: { brief: true, generatedGuideId: true },
  });
  const guideIds = gaps.map((g: { generatedGuideId: string | null }) => g.generatedGuideId).filter(Boolean) as string[];
  const guides = await prisma.generatedGuide.findMany({
    where: { id: { in: guideIds }, status: 'published' },
  });
  const briefByGuideId = new Map<string, any>();
  for (const g of gaps) {
    if (g.generatedGuideId) briefByGuideId.set(g.generatedGuideId, g.brief);
  }

  console.log(`site: ${BASE}`);
  console.log(`campaign articles published: ${guides.length}`);

  if (guides.length === 0 && !BASELINE_ONLY) {
    console.error('\nNo published campaign articles found. Run campaign-run.ts first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!BASELINE_ONLY) {
    await checkSiteLevel(guides);
    await checkPages(guides, briefByGuideId);
    if (DO_INDEXNOW) await submitIndexNow(guides);
  }

  if (!SKIP_PROBE) {
    await probeBaseline(prisma, briefByGuideId, guides);
  }

  rule('SUMMARY');
  console.log(`  passed: ${passCount}   failed: ${failCount}   warnings: ${warnCount}`);
  if (failCount === 0) {
    console.log('\n  Every technical precondition for discovery is satisfied.');
    console.log('  Ranking and LLM citation now depend on crawl + index time.');
    console.log('  Re-run with --baseline-only in 7 and 30 days to measure the lift.');
  } else {
    console.log('\n  Fix the FAILs above — those are hard blockers to being found.');
  }

  await prisma.$disconnect();
  process.exit(failCount === 0 ? 0 : 1);
}

// -----------------------------------------------------------------------------
// Site-level checks
// -----------------------------------------------------------------------------

async function checkSiteLevel(guides: any[]) {
  rule('SITE-LEVEL: crawlability');

  // robots.txt must not merely exist — it must explicitly welcome the AI
  // crawlers, since a blanket allow can still be overridden per-agent.
  try {
    const res = await fetch(`${BASE}/robots.txt`);
    const txt = await res.text();
    if (!res.ok) {
      fail(`robots.txt returned ${res.status}`);
    } else {
      pass('robots.txt reachable');
      for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bingbot']) {
        if (txt.includes(bot)) pass(`robots.txt names ${bot}`);
        else warn(`robots.txt does not name ${bot} (falls back to User-agent: *)`);
      }
      if (/Disallow:\s*\/\s*$/m.test(txt)) fail('robots.txt contains a site-wide Disallow: /');
    }
  } catch (e) {
    fail(`robots.txt unreachable: ${msg(e)}`);
  }

  // Sitemap is the ONLY discovery path for these articles — nothing else on the
  // site links to a brand-new guide, so an omission here means the page is
  // effectively invisible no matter how good it is.
  try {
    const res = await fetch(`${BASE}/sitemap.xml`);
    const xml = await res.text();
    if (!res.ok) {
      fail(`sitemap.xml returned ${res.status}`);
      return;
    }
    pass(`sitemap.xml reachable (${(xml.match(/<url>/g) ?? []).length} urls)`);

    const missing = guides.filter((g) => !xml.includes(`/guides/${g.slug}`));
    if (missing.length === 0) {
      pass(`all ${guides.length} campaign articles are in the sitemap`);
    } else {
      fail(`${missing.length} articles missing from sitemap: ${missing.slice(0, 5).map((g) => g.slug).join(', ')}`);
    }
  } catch (e) {
    fail(`sitemap.xml unreachable: ${msg(e)}`);
  }
}

// -----------------------------------------------------------------------------
// Per-page checks
// -----------------------------------------------------------------------------

async function checkPages(guides: any[], briefByGuideId: Map<string, any>) {
  rule(`PER-ARTICLE: ${guides.length} pages`);

  const linkCache = new Map<string, boolean>();
  let allGood = 0;

  for (const g of guides) {
    const url = `${BASE}/guides/${g.slug}`;
    const brief = briefByGuideId.get(g.id);
    const problems: string[] = [];
    const notes: string[] = [];

    let html = '';
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'WeCcelerate-Verifier/1.0' } });
      if (!res.ok) {
        fail(`${g.slug} -> HTTP ${res.status}`);
        continue;
      }
      html = await res.text();
    } catch (e) {
      fail(`${g.slug} -> unreachable: ${msg(e)}`);
      continue;
    }

    // --- indexability ---
    if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) problems.push('page is noindex');
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    if (!canonical) problems.push('no canonical link');
    else if (!canonical.includes(`/guides/${g.slug}`)) problems.push(`canonical points elsewhere: ${canonical}`);

    // --- structured data ---
    const schemas = extractJsonLd(html);
    const types = schemas.map((s) => s['@type']);
    if (!types.includes('Article')) problems.push('no Article JSON-LD');
    if (!types.includes('BreadcrumbList')) problems.push('no BreadcrumbList JSON-LD');

    const faq = schemas.find((s) => s['@type'] === 'FAQPage');
    if (!faq) {
      // This is THE most common silent failure: the FAQ renders visually but
      // the markdown used bold text instead of ### headings, so extractFaqs()
      // finds zero pairs and the schema is dropped. No error anywhere.
      problems.push('no FAQPage JSON-LD (FAQ questions are probably not "### " headings)');
    } else {
      const qs = Array.isArray(faq.mainEntity) ? faq.mainEntity.length : 0;
      if (qs < 3) problems.push(`FAQPage has only ${qs} questions`);
      else notes.push(`${qs} FAQ entries`);
    }

    if (!/data-speakable/.test(html)) problems.push('no [data-speakable] block for voice/AI answers');

    // --- keyword targeting ---
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
    const text = stripTags(html);
    if (brief?.primaryKeyword) {
      if (!h1.includes(brief.primaryKeyword)) {
        problems.push(`H1 missing exact keyword "${brief.primaryKeyword}"`);
      }
      const secondaries: string[] = brief.secondaryKeywords ?? [];
      const hits = secondaries.filter((k) => text.includes(k)).length;
      if (secondaries.length > 0 && hits === 0) problems.push('no secondary keywords present in body');
      else if (secondaries.length > 0) notes.push(`${hits}/${secondaries.length} secondary kw`);

      const questions: string[] = brief.targetQuestions ?? [];
      const answered = questions.filter((q) => text.includes(q.replace(/\?+$/, ''))).length;
      if (questions.length > 0) {
        if (answered === 0) problems.push('none of the target questions appear verbatim');
        else notes.push(`${answered}/${questions.length} questions verbatim`);
      }
    }

    // --- internal links resolve ---
    const internal = Array.from(html.matchAll(/href=["'](\/(?:guides|services)\/[^"'#?]+)["']/g)).map((m) => m[1]);
    for (const href of Array.from(new Set(internal)).slice(0, 8)) {
      if (!linkCache.has(href)) {
        try {
          const r = await fetch(`${BASE}${href}`, { method: 'HEAD' });
          linkCache.set(href, r.ok);
        } catch {
          linkCache.set(href, false);
        }
      }
      if (!linkCache.get(href)) problems.push(`broken internal link ${href}`);
    }

    if (problems.length === 0) {
      allGood++;
      pass(`${g.slug}  [${notes.join(', ')}]`);
    } else {
      fail(`${g.slug}`);
      for (const p of problems) info(`- ${p}`);
    }
  }

  console.log(`\n  ${allGood}/${guides.length} articles fully clean`);
}

function extractJsonLd(html: string): any[] {
  const out: any[] = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {
      /* a malformed block is reported by the caller via the missing @type */
    }
  }
  return out;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

// -----------------------------------------------------------------------------
// IndexNow
// -----------------------------------------------------------------------------

async function submitIndexNow(guides: any[]) {
  rule('INDEXNOW SUBMISSION');
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    warn('INDEXNOW_KEY not set — skipping. Bing/Yandex will still crawl via sitemap, just slower.');
    info('To enable: set INDEXNOW_KEY and serve the same value at /<key>.txt');
    return;
  }
  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(BASE).host,
        key,
        keyLocation: `${BASE}/${key}.txt`,
        urlList: guides.map((g) => `${BASE}/guides/${g.slug}`),
      }),
    });
    if (res.ok || res.status === 202) pass(`submitted ${guides.length} urls to IndexNow (HTTP ${res.status})`);
    else fail(`IndexNow returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
  } catch (e) {
    fail(`IndexNow submission failed: ${msg(e)}`);
  }
}

// -----------------------------------------------------------------------------
// Discoverability baseline — the "before" photo
// -----------------------------------------------------------------------------

/**
 * Ask the real engines the real target keywords and record whether we are
 * cited. On the first run this is a BASELINE, not a verdict: pages published
 * minutes ago are not in anyone's index yet. Its value is comparative — run it
 * again at day 7 and day 30 and the change is the measurement that matters.
 *
 * Results are written to GeoProbe so the existing admin graph and the daily
 * report pick them up alongside the strategic-query probes.
 */
async function probeBaseline(prisma: any, briefByGuideId: Map<string, any>, guides: any[]) {
  rule('DISCOVERABILITY BASELINE (LLM citation check)');

  const keywords = Array.from(
    new Set(
      guides
        .map((g) => briefByGuideId.get(g.id)?.primaryKeyword)
        .filter((k): k is string => typeof k === 'string'),
    ),
  ).slice(0, PROBE_LIMIT);

  if (keywords.length === 0) {
    warn('no campaign keywords to probe');
    return;
  }

  const providers = activeProviders();
  if (providers.length === 0) {
    warn('no LLM API keys available — skipping the baseline. Set GEMINI_API_KEY / PERPLEXITY_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY.');
    return;
  }

  info(`probing ${keywords.length} keywords across ${providers.length} engines (${providers.map((p) => p.name).join(', ')})`);
  info('a fresh page is not indexed yet — treat today\'s numbers as the "before" line.\n');

  let cited = 0;
  let total = 0;

  for (const kw of keywords) {
    // Ask it the way a person would, not as a bare keyword — that is what the
    // probe phrasing rule in geo-probes.ts requires and what matches reality.
    const question = `${kw} - למי לפנות בישראל?`;
    for (const provider of providers) {
      total++;
      try {
        const answer = await provider.ask(question);
        const hit = /weccelerate/i.test(answer.text) || answer.urls.some((u) => /weccelerate\.co\.il/i.test(u));
        if (hit) cited++;
        console.log(`  ${hit ? 'CITED    ' : 'not cited'} ${provider.name.padEnd(22)} ${kw}`);

        await prisma.geoProbe.create({
          data: {
            provider: provider.name,
            query: question,
            category: 'generic-he',
            response: answer.text.slice(0, 8_000),
            citedUrls: answer.urls.slice(0, 50),
            mentioned: /weccelerate/i.test(answer.text),
            cited: hit,
            durationMs: 0,
          },
        }).catch(() => { /* probe logging is best-effort */ });
      } catch (e) {
        console.log(`  ERROR     ${provider.name.padEnd(22)} ${kw}  (${msg(e).slice(0, 60)})`);
      }
    }
  }

  const pct = total > 0 ? Math.round((cited / total) * 100) : 0;
  console.log(`\n  baseline citation rate: ${cited}/${total} (${pct}%) on ${new Date().toISOString().slice(0, 10)}`);
  info('re-run: npx tsx scripts/seo/campaign-verify.ts --baseline-only --env=<env file>');
}

interface Probe {
  name: string;
  ask: (q: string) => Promise<{ text: string; urls: string[] }>;
}

function activeProviders(): Probe[] {
  const out: Probe[] = [];

  if (process.env.GEMINI_API_KEY) {
    out.push({
      name: 'gemini-grounded',
      async ask(q) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: q }] }],
              tools: [{ google_search: {} }],
              generationConfig: { maxOutputTokens: 700, temperature: 0.2 },
            }),
            signal: AbortSignal.timeout(60_000),
          },
        );
        if (!res.ok) throw new Error(`Gemini ${res.status}`);
        const d: any = await res.json();
        const c = d.candidates?.[0];
        const text = (c?.content?.parts ?? []).map((p: any) => p.text ?? '').join('\n');
        const urls = (c?.groundingMetadata?.groundingChunks ?? [])
          .map((x: any) => x.web?.uri)
          .filter(Boolean) as string[];
        return { text, urls };
      },
    });
  }

  if (process.env.PERPLEXITY_API_KEY) {
    out.push({
      name: 'perplexity-sonar',
      async ask(q) {
        const res = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [{ role: 'user', content: q }],
            return_citations: true,
            max_tokens: 700,
          }),
          signal: AbortSignal.timeout(60_000),
        });
        if (!res.ok) throw new Error(`Perplexity ${res.status}`);
        const d: any = await res.json();
        return { text: d.choices?.[0]?.message?.content ?? '', urls: d.citations ?? [] };
      },
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    out.push({
      name: 'anthropic-claude-haiku',
      async ask(q) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            messages: [{ role: 'user', content: q }],
            tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
          }),
          signal: AbortSignal.timeout(60_000),
        });
        if (!res.ok) throw new Error(`Anthropic ${res.status}`);
        const d: any = await res.json();
        const blocks = d.content ?? [];
        const text = blocks.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
        const urls = blocks
          .filter((b: any) => b.type === 'web_search_tool_result')
          .flatMap((b: any) => (b.content ?? []).map((r: any) => r.url).filter(Boolean));
        return { text, urls };
      },
    });
  }

  return out;
}

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

main().catch((e) => {
  console.error('\ncampaign-verify failed:', e);
  process.exit(1);
});
