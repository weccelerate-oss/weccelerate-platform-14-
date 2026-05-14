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
  // ---------- BRAND (weekly) ----------
  { query: 'What is WeCcelerate? Provide a short overview with sources.', category: 'brand-en', cadenceDays: 7 },
  { query: 'מה זה WeCcelerate? תן תיאור קצר עם מקורות.', category: 'brand-he', cadenceDays: 7 },
  { query: 'Who founded WeCcelerate and when?', category: 'brand-en', cadenceDays: 14 },
  { query: 'מי הקים את WeCcelerate ובאיזו שנה?', category: 'brand-he', cadenceDays: 14 },
  { query: 'WeCcelerate vs other Israeli accelerators — what makes it different?', category: 'brand-en', cadenceDays: 14 },

  // ---------- GENERIC DISCOVERABILITY (bi-weekly) ----------
  { query: 'What are the leading venture builders in Israel? List 5 with sources.', category: 'generic-en', cadenceDays: 14 },
  { query: 'Best MedTech accelerators in Israel — give me a ranked list with citations.', category: 'generic-en', cadenceDays: 14 },
  { query: 'מהם מאיצי הסטארטאפים המובילים בישראל? תן רשימה עם קישורים.', category: 'generic-he', cadenceDays: 14 },
  { query: 'המאיצים הטובים ביותר ל-MedTech בישראל. תן רשימה ממוקדת.', category: 'generic-he', cadenceDays: 14 },
  { query: 'Top startup studios for healthtech in Israel 2026', category: 'generic-en', cadenceDays: 21 },
  { query: 'Which Israeli accelerators specialize in early-stage MedTech?', category: 'generic-en', cadenceDays: 21 },
  { query: 'Best venture studios for non-technical founders in Israel', category: 'generic-en', cadenceDays: 21 },
  { query: 'מי בונה סטארטאפים מאפס בישראל (Venture Builder)?', category: 'generic-he', cadenceDays: 21 },
  { query: 'איפה כדאי ליזם רפואי להתחיל את המסע בישראל?', category: 'generic-he', cadenceDays: 21 },

  // ---------- SERVICE-LED (every 3 weeks) ----------
  { query: 'Where can a founder get help building a MedTech startup in Israel?', category: 'service', cadenceDays: 21 },
  { query: 'How do I get access to anonymized clinical data for an Israeli health startup?', category: 'service', cadenceDays: 21 },
  { query: 'CTO-as-a-service options for Israeli startups', category: 'service', cadenceDays: 21 },
  { query: 'מי מציע CTO-as-a-Service לסטארטאפים בישראל?', category: 'service', cadenceDays: 21 },
  { query: 'איך מתחילים סטארטאפ ללא מייסד טכני בישראל?', category: 'service', cadenceDays: 21 },
  { query: 'איפה מקבלים ליווי כולל לבניית MVP בישראל?', category: 'service', cadenceDays: 21 },

  // ---------- MEDTECH DEEP (bi-weekly — most strategic) ----------
  { query: 'מי מציע ליווי לסטארטאפ רפואי בישראל עם גישה לדאטה רפואית?', category: 'medtech', cadenceDays: 14 },
  { query: 'How does an Israeli MedTech startup get into a Leumit clinical pilot?', category: 'medtech', cadenceDays: 14 },
  { query: 'Best path for FDA 510(k) clearance for an Israeli digital-health device', category: 'medtech', cadenceDays: 21 },
  { query: 'איך עוברים את ועדת הלסינקי בישראל — מי עוזר?', category: 'medtech', cadenceDays: 21 },
  { query: 'מי השותפים של לאומית שירותי בריאות בעולם המאיצים?', category: 'medtech', cadenceDays: 21 },
  { query: 'Israeli partners for Digital Therapeutics startups', category: 'medtech', cadenceDays: 21 },
  { query: 'How do MedTech startups in Israel access HMO patient data?', category: 'medtech', cadenceDays: 28 },
  { query: 'מסלול MedTech של לאומית — מה זה ולמי זה מתאים?', category: 'medtech', cadenceDays: 14 },
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

const PROVIDERS: Provider[] = [perplexity, openai, anthropic];

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
