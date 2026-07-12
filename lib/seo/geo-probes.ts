/**
 * GEO Probe — actively asks LLMs questions to measure if/when WeCcelerate
 * is cited. Counterpart to BotVisit (passive bot listener).
 *
 * One run hits each (provider, query) combination, parses the answer for
 * brand mentions and citations of weccelerate.co.il, and persists a row.
 *
 * Providers are guarded behind env vars so the system works with whichever
 * subset of API keys is configured:
 *   - PERPLEXITY_API_KEY   → Perplexity Sonar (search-grounded)
 *   - OPENAI_API_KEY       → OpenAI Chat Completions w/ search
 * Add more providers by appending to PROVIDERS below.
 */

import { prisma } from '@/lib/db';
import { logDecision } from '@/lib/agents/decision-log';

// =============================================================================
// QUERIES — what we ask each LLM
// =============================================================================

export interface ProbeQuery {
  query: string;
  category: 'brand-en' | 'brand-he' | 'generic-en' | 'generic-he' | 'service' | 'medtech';
  /**
   * How often this query should be asked, in days. The runner only re-asks
   * a (provider, query) pair after this many days have passed since the last
   * successful run. Brand queries refresh weekly (LLM training cadence is
   * rough); long-tail discovery queries refresh every 2-4 weeks since a
   * single new article rarely shifts them faster than that.
   */
  cadenceDays: number;
}

/**
 * Strategic query pool. Each query is asked on rotation, NOT daily — so
 * the API budget covers ~5x more topics without burning extra calls. The
 * runner picks queries whose `cadenceDays` window has elapsed.
 */
export const PROBE_QUERIES: ProbeQuery[] = [
  // PHRASING RULE (owner directive 2026-07-12): every query must read like a
  // real person typing into Google/ChatGPT — short, precise, direct. No
  // prompt-engineering suffixes ("list 5 with sources", "תן רשימה עם
  // קישורים") — humans don't ask like that, so probing like that measures
  // the wrong answers. NOTE: changing a query's text resets its (provider,
  // query) probe history, so edit existing queries only when needed.

  // ---------- CORE INDEX (every 3 days) ----------
  // The ~10 queries that define the daily GEO score trend. A 3-day cadence
  // keeps the GeoDailySnapshot graph responsive (the rolling 14-day window
  // then always holds 4-5 fresh samples per query) at a cost of a few extra
  // API calls per day. Everything below stays on the slower rotation.
  { query: 'What is WeCcelerate?', category: 'brand-en', cadenceDays: 3 },
  { query: 'מה זה WeCcelerate?', category: 'brand-he', cadenceDays: 3 },
  { query: 'What are the best venture builders in Israel?', category: 'generic-en', cadenceDays: 3 },
  { query: 'Best MedTech accelerator in Israel', category: 'generic-en', cadenceDays: 3 },
  { query: 'מהם המאיצים המובילים לסטארטאפים בישראל?', category: 'generic-he', cadenceDays: 3 },
  { query: 'איזה מאיץ הכי מתאים לסטארטאפ מדטק בישראל?', category: 'generic-he', cadenceDays: 3 },

  // ---------- BRAND (bi-weekly) ----------
  { query: 'Who founded WeCcelerate?', category: 'brand-en', cadenceDays: 14 },
  { query: 'מי הקים את WeCcelerate?', category: 'brand-he', cadenceDays: 14 },
  { query: 'How is WeCcelerate different from other Israeli accelerators?', category: 'brand-en', cadenceDays: 14 },

  // ---------- GENERIC DISCOVERABILITY (bi-weekly) ----------
  { query: 'Top startup studios for healthtech in Israel', category: 'generic-en', cadenceDays: 21 },
  { query: 'Which Israeli accelerators specialize in early-stage MedTech?', category: 'generic-en', cadenceDays: 21 },
  { query: 'Best venture studios for non-technical founders in Israel', category: 'generic-en', cadenceDays: 21 },
  { query: 'מי בונה סטארטאפים מאפס בישראל?', category: 'generic-he', cadenceDays: 21 },
  { query: 'איפה כדאי ליזם רפואי להתחיל בישראל?', category: 'generic-he', cadenceDays: 21 },
  // Idea-stage / business-planning queries — Gemini currently answers these
  // with Targo Consulting + Seedbiz. Probing them lets David measure the gap
  // and write positioning content (without naming the competitors).
  { query: 'מי מלווה יזמים בשלב הרעיון בישראל?', category: 'generic-he', cadenceDays: 14 },
  { query: 'Who helps first-time founders in Israel write a business plan?', category: 'generic-en', cadenceDays: 14 },

  // ---------- SERVICE-LED (every 3 weeks) ----------
  { query: 'Where can I get help building a MedTech startup in Israel?', category: 'service', cadenceDays: 21 },
  { query: 'How can an Israeli health startup get anonymized clinical data?', category: 'service', cadenceDays: 21 },
  { query: 'CTO as a service in Israel', category: 'service', cadenceDays: 21 },
  { query: 'שירות CTO לסטארטאפים בישראל', category: 'service', cadenceDays: 21 },
  { query: 'איך מקימים סטארטאפ בלי מייסד טכני?', category: 'service', cadenceDays: 21 },
  { query: 'מי יכול לבנות לי MVP בישראל?', category: 'service', cadenceDays: 21 },

  // ---------- MEDTECH DEEP (most strategic — core two every 3 days) ----------
  { query: 'מי מלווה סטארטאפ רפואי בישראל עם גישה לדאטה רפואית?', category: 'medtech', cadenceDays: 3 },
  { query: 'How does a MedTech startup get into a Leumit clinical pilot?', category: 'medtech', cadenceDays: 3 },
  { query: 'How do I get FDA 510(k) clearance for a digital health device?', category: 'medtech', cadenceDays: 21 },
  { query: 'מי עוזר לעבור את ועדת הלסינקי בישראל?', category: 'medtech', cadenceDays: 21 },
  { query: 'מי השותפים של לאומית שירותי בריאות בתחום המאיצים?', category: 'medtech', cadenceDays: 21 },
  { query: 'Who works with Digital Therapeutics startups in Israel?', category: 'medtech', cadenceDays: 21 },
  { query: 'How do MedTech startups in Israel access HMO patient data?', category: 'medtech', cadenceDays: 28 },
  { query: 'מסלול MedTech של לאומית — למי זה מתאים?', category: 'medtech', cadenceDays: 14 },
];

// =============================================================================
// DETECTION — figure out if a response mentions/cites us
// =============================================================================

const BRAND_PATTERNS = [
  /weccelerate/i,
  /wec[\s-]?celerate/i,
  /\bwe[\s-]?accelerate\b/i,
  /וויסלרייט/,
  /ויסלרייט/,
];

const CANONICAL_HOST_PATTERNS = [
  /weccelerate\.co\.il/i,
  /(^|\.)weccelerate\.co\.il/i,
];

interface DetectionResult {
  mentioned: boolean;
  cited: boolean;
  position: number | null;
}

function detectMentions(response: string, citedUrls: string[]): DetectionResult {
  const mentioned = BRAND_PATTERNS.some((p) => p.test(response));

  // Position = where in the response WeCcelerate first appears, by character offset.
  let firstOffset = -1;
  for (const p of BRAND_PATTERNS) {
    const m = response.match(p);
    if (m && typeof m.index === 'number') {
      if (firstOffset === -1 || m.index < firstOffset) firstOffset = m.index;
    }
  }
  // Convert offset → ordinal position (1 = first paragraph) using simple line count.
  const position =
    firstOffset >= 0
      ? response.slice(0, firstOffset).split(/\n/).length
      : null;

  // Cited = canonical host appears anywhere in the URL list OR raw response.
  const inUrls = citedUrls.some((u) =>
    CANONICAL_HOST_PATTERNS.some((p) => {
      try {
        return p.test(new URL(u).host);
      } catch {
        return p.test(u);
      }
    }),
  );
  const inText = CANONICAL_HOST_PATTERNS.some((p) => p.test(response));
  const cited = inUrls || inText;

  return { mentioned, cited, position };
}

// =============================================================================
// PROVIDERS — adapters for each LLM API
// =============================================================================

interface ProbeAnswer {
  response: string;
  citedUrls: string[];
}

interface Provider {
  name: string;          // e.g. 'perplexity-sonar'
  hasKey: () => boolean;
  ask: (query: string) => Promise<ProbeAnswer>;
}

/**
 * Perplexity Sonar — search-grounded; returns citations natively.
 * Docs: https://docs.perplexity.ai/api-reference/chat-completions
 */
const perplexity: Provider = {
  name: 'perplexity-sonar',
  hasKey: () => Boolean(process.env.PERPLEXITY_API_KEY),
  async ask(query: string): Promise<ProbeAnswer> {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content:
              'You are a research assistant. Answer concisely with citations to authoritative sources.',
          },
          { role: 'user', content: query },
        ],
        return_citations: true,
        max_tokens: 700,
      }),
    });
    if (!res.ok) {
      throw new Error(`Perplexity ${res.status}: ${await res.text()}`);
    }
    const data: {
      choices?: Array<{ message?: { content?: string } }>;
      citations?: string[];
    } = await res.json();
    return {
      response: data.choices?.[0]?.message?.content ?? '',
      citedUrls: Array.isArray(data.citations) ? data.citations : [],
    };
  },
};

/**
 * OpenAI Chat Completions with web-search-enabled model.
 * Returns answers with inline sources (parsed from response text).
 * Docs: https://platform.openai.com/docs/guides/tools-web-search
 */
const openai: Provider = {
  name: 'openai-gpt4o-search',
  hasKey: () => Boolean(process.env.OPENAI_API_KEY),
  async ask(query: string): Promise<ProbeAnswer> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-search-preview',
        messages: [{ role: 'user', content: query }],
        max_tokens: 700,
      }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    }
    const data: {
      choices?: Array<{
        message?: {
          content?: string;
          annotations?: Array<{ url_citation?: { url?: string } }>;
        };
      }>;
    } = await res.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content ?? '';
    // Pull cited URLs from annotations (gpt-4o search format) plus a regex
    // fallback for inline markdown links.
    const fromAnnotations =
      (message?.annotations
        ?.map((a) => a.url_citation?.url)
        .filter((u): u is string => typeof u === 'string')) ?? [];
    const fromText = Array.from(content.matchAll(/\bhttps?:\/\/[^\s)\]]+/gi)).map((m) => m[0]);
    const citedUrls = Array.from(new Set([...fromAnnotations, ...fromText]));
    return { response: content, citedUrls };
  },
};

/**
 * Anthropic Claude Haiku with web search tool.
 * Haiku chosen over Sonnet for the probe: 5-10s per call vs 30-50s with
 * Sonnet+web_search. 8 parallel calls fit comfortably under Vercel's 60s
 * function budget, where Sonnet calls didn't.
 * For probe purposes (measure citations) Haiku's reasoning is sufficient —
 * the heavier writing is still done by Opus in content-writer.ts.
 * Docs: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/web-search-tool
 */
const anthropic: Provider = {
  name: 'anthropic-claude-haiku',
  hasKey: () => Boolean(process.env.ANTHROPIC_API_KEY),
  async ask(query: string): Promise<ProbeAnswer> {
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
        messages: [{ role: 'user', content: query }],
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    }
    const data: {
      content?: Array<
        | { type: 'text'; text: string }
        | { type: 'web_search_tool_result'; content?: Array<{ url?: string }> }
        | { type: string; [k: string]: unknown }
      >;
    } = await res.json();
    const blocks = data.content ?? [];
    const text = blocks
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n\n');
    const fromTool = blocks
      .filter(
        (b): b is { type: 'web_search_tool_result'; content?: Array<{ url?: string }> } =>
          b.type === 'web_search_tool_result',
      )
      .flatMap((b) =>
        (b.content ?? [])
          .map((r) => r.url)
          .filter((u): u is string => typeof u === 'string'),
      );
    const fromText = Array.from(text.matchAll(/\bhttps?:\/\/[^\s)\]]+/gi)).map((m) => m[0]);
    const citedUrls = Array.from(new Set([...fromTool, ...fromText]));
    return { response: text, citedUrls };
  },
};

/**
 * Google Gemini 3.1 Flash-Lite with Google Search grounding.
 *
 * Why Gemini matters for GEO/AEO: Google's AI Overviews + Search Generative
 * Experience rank-then-cite from the live web via this same grounding
 * surface — so when Gemini cites us, we're effectively winning the SGE box.
 *
 * Why flash-lite over pro-preview: probes are measurement, not content
 * generation. We need consistent, fast, ground-the-web behavior — and
 * flash-lite is BETTER at this in practice:
 *   - Pro-preview took 30+s per call (blew Vercel Hobby's 60s budget
 *     when stacked × 24 queries × 4 providers).
 *   - Flash-lite is ~3-5s per call.
 *   - Flash models are less "self-assured" — they invoke google_search
 *     more aggressively, so we get more grounding URLs (which is the
 *     whole point of the probe).
 *   - Smoke test: flash-lite returned 7 grounding chunks vs pro-preview's
 *     0 for the same brand probe.
 * Pro-preview is reserved for actual content generation (where the
 * writer agent uses Claude Opus anyway).
 *
 * Docs: https://ai.google.dev/gemini-api/docs/grounding
 */
const gemini: Provider = {
  name: 'gemini-3.1-flash-lite',
  hasKey: () => Boolean(process.env.GEMINI_API_KEY),
  async ask(query: string): Promise<ProbeAnswer> {
    const model = 'gemini-3.1-flash-lite';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: query }] }],
          // google_search is the grounding tool — Gemini hits the live web
          // and returns groundingMetadata with the URLs it consulted.
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.2 },
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );
    if (!res.ok) {
      throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    }
    type GeminiResponse = {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        groundingMetadata?: {
          groundingChunks?: Array<{ web?: { uri?: string } }>;
          // Some responses use webSearchQueries / searchEntryPoint instead;
          // the chunks array is the canonical citation list.
        };
      }>;
    };
    const data = (await res.json()) as GeminiResponse;
    const cand = data.candidates?.[0];
    const text = (cand?.content?.parts ?? [])
      .map((p) => p.text ?? '')
      .filter(Boolean)
      .join('\n');
    const fromGrounding = (cand?.groundingMetadata?.groundingChunks ?? [])
      .map((c) => c.web?.uri)
      .filter((u): u is string => typeof u === 'string');
    const fromText = Array.from(text.matchAll(/\bhttps?:\/\/[^\s)\]]+/gi)).map((m) => m[0]);
    const citedUrls = Array.from(new Set([...fromGrounding, ...fromText]));
    return { response: text, citedUrls };
  },
};

const PROVIDERS: Provider[] = [perplexity, openai, anthropic, gemini];

// =============================================================================
// RUNNER
// =============================================================================

export interface ProbeRunSummary {
  total: number;
  succeeded: number;
  failed: number;
  cited: number;
  mentioned: number;
  skippedNotDue: number;          // queries postponed because last asked < cadenceDays ago
  scheduled: number;              // queries actually attempted today
  byProvider: Record<string, { ok: number; cited: number; mentioned: number }>;
}

/**
 * Decide which (provider, query) pairs are due today based on each query's
 * cadenceDays. A pair is due if it was last asked successfully more than
 * cadenceDays ago — or never asked at all. Hard cap of `maxQueries` keeps
 * us under Vercel's 60s function budget.
 */
async function selectDueQueries(
  providers: Provider[],
  maxQueries: number,
): Promise<Array<{ provider: Provider; query: ProbeQuery; lastAskedAt: Date | null }>> {
  // Fetch the latest successful timestamp per (provider, query). Errors
  // don't count — a failed run shouldn't postpone the next attempt.
  const lastAskedRows = await prisma.$queryRaw<
    Array<{ provider: string; query: string; last_asked: Date | null }>
  >`
    SELECT provider, query, MAX(timestamp) AS last_asked
    FROM geo_probes
    WHERE error IS NULL
    GROUP BY provider, query
  `;
  const lastAskedMap = new Map<string, Date>();
  for (const row of lastAskedRows) {
    if (row.last_asked) lastAskedMap.set(`${row.provider}|${row.query}`, row.last_asked);
  }

  const now = Date.now();
  const candidates: Array<{ provider: Provider; query: ProbeQuery; lastAskedAt: Date | null; dueScore: number }> = [];

  for (const provider of providers) {
    for (const query of PROBE_QUERIES) {
      const lastAskedAt = lastAskedMap.get(`${provider.name}|${query.query}`) ?? null;
      const ageDays = lastAskedAt
        ? (now - lastAskedAt.getTime()) / 86_400_000
        : Number.POSITIVE_INFINITY; // never asked → most overdue
      if (ageDays >= query.cadenceDays) {
        // dueScore = how overdue it is (higher = more urgent). Prevents the
        // same subset from always winning when many queries become due
        // simultaneously.
        const dueScore = ageDays === Number.POSITIVE_INFINITY ? 9999 : ageDays - query.cadenceDays;
        candidates.push({ provider, query, lastAskedAt, dueScore });
      }
    }
  }

  candidates.sort((a, b) => b.dueScore - a.dueScore);
  return candidates.slice(0, maxQueries).map(({ provider, query, lastAskedAt }) => ({
    provider,
    query,
    lastAskedAt,
  }));
}

export async function runAllProbes(opts?: { maxQueries?: number }): Promise<ProbeRunSummary> {
  // Vercel Hobby caps the function at 60s. With ~10s per call running in
  // parallel, ~24 calls is the safe ceiling. Pro plan can raise this.
  const MAX_QUERIES = opts?.maxQueries ?? 24;

  const summary: ProbeRunSummary = {
    total: 0,
    succeeded: 0,
    failed: 0,
    cited: 0,
    mentioned: 0,
    skippedNotDue: 0,
    scheduled: 0,
    byProvider: {},
  };

  const activeProviders = PROVIDERS.filter((p) => p.hasKey());
  if (activeProviders.length === 0) {
    return summary; // No API keys configured — nothing to do.
  }

  // Initialize per-provider counters
  for (const provider of activeProviders) {
    summary.byProvider[provider.name] = { ok: 0, cited: 0, mentioned: 0 };
  }

  // Cadence-aware selection: only run pairs that are actually due today.
  const due = await selectDueQueries(activeProviders, MAX_QUERIES);
  const totalPairs = activeProviders.length * PROBE_QUERIES.length;
  summary.scheduled = due.length;
  summary.skippedNotDue = totalPairs - due.length;

  if (due.length === 0) {
    // Nothing's due — David already covered all queries within their
    // cadence windows. This is the *desired* state on quiet days.
    return summary;
  }

  // Parallelize: each (provider, query) is one independent call.
  const tasks: Promise<void>[] = [];
  for (const { provider, query } of due) {
    tasks.push(runOneProbe(provider, query.query, query.category, summary));
  }
  await Promise.allSettled(tasks);

  // DA-11: total-outage alarm. If every probe failed, log a decision so
  // tomorrow's journal/insights pick it up — without this the failure
  // was silent because the *stage* didn't throw (Promise.allSettled
  // swallows each rejection).
  if (summary.total > 0 && summary.failed === summary.total) {
    await logDecision({
      agent: 'system',
      action: 'all-probes-failed',
      reasoning:
        `כל ${summary.total} השאילתות נכשלו השעה. ` +
        `ספקים פעילים: ${activeProviders.map((p) => p.name).join(', ')}. ` +
        `סביר ש-API key פג, rate limit, או downtime של הספק.`,
      payload: {
        total: summary.total,
        failed: summary.failed,
        byProvider: summary.byProvider,
        providersTried: activeProviders.map((p) => p.name),
      },
      success: false,
    });
  }

  return summary;
}

async function runOneProbe(
  provider: Provider,
  query: string,
  category: ProbeQuery['category'],
  summary: ProbeRunSummary,
): Promise<void> {
  summary.total += 1;
  const start = Date.now();
  try {
    const answer = await provider.ask(query);
    const detection = detectMentions(answer.response, answer.citedUrls);

    await prisma.geoProbe.create({
      data: {
        provider: provider.name,
        query,
        category,
        response: answer.response.slice(0, 8_000),
        citedUrls: answer.citedUrls.slice(0, 50),
        mentioned: detection.mentioned,
        cited: detection.cited,
        position: detection.position,
        durationMs: Date.now() - start,
      },
    });

    summary.succeeded += 1;
    summary.byProvider[provider.name].ok += 1;
    if (detection.mentioned) {
      summary.mentioned += 1;
      summary.byProvider[provider.name].mentioned += 1;
    }
    if (detection.cited) {
      summary.cited += 1;
      summary.byProvider[provider.name].cited += 1;
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    await prisma.geoProbe
      .create({
        data: {
          provider: provider.name,
          query,
          category,
          response: '',
          citedUrls: [],
          mentioned: false,
          cited: false,
          durationMs: Date.now() - start,
          error: err.slice(0, 1_000),
        },
      })
      .catch(() => {
        /* swallow — DB might be down too */
      });
    summary.failed += 1;
    console.error(
      JSON.stringify({
        event: 'geo-probe-error',
        provider: provider.name,
        query,
        error: err,
        ts: new Date().toISOString(),
      }),
    );
  }
}
