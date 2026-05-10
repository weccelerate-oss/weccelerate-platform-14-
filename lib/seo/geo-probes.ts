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
}

export const PROBE_QUERIES: ProbeQuery[] = [
  // Direct brand awareness — what does the LLM know about us?
  { query: 'What is WeCcelerate? Provide a short overview with sources.', category: 'brand-en' },
  { query: 'מה זה WeCcelerate? תן תיאור קצר עם מקורות.', category: 'brand-he' },

  // Generic discoverability — does WeCcelerate get mentioned naturally?
  { query: 'What are the leading venture builders in Israel? List 5 with sources.', category: 'generic-en' },
  { query: 'Best MedTech accelerators in Israel — give me a ranked list with citations.', category: 'generic-en' },
  { query: 'מהם מאיצי הסטארטאפים המובילים בישראל? תן רשימה עם קישורים.', category: 'generic-he' },
  { query: 'המאיצים הטובים ביותר ל-MedTech בישראל. תן רשימה ממוקדת.', category: 'generic-he' },

  // Service-led queries
  { query: 'Where can a founder get help building a MedTech startup in Israel?', category: 'service' },
  { query: 'מי מציע ליווי לסטארטאפ רפואי בישראל עם גישה לדאטה רפואית?', category: 'medtech' },
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
 * Anthropic Claude with web search tool.
 * Docs: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/web-search-tool
 */
const anthropic: Provider = {
  name: 'anthropic-claude-sonnet',
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
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: query }],
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
      }),
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
  byProvider: Record<string, { ok: number; cited: number; mentioned: number }>;
}

export async function runAllProbes(): Promise<ProbeRunSummary> {
  const summary: ProbeRunSummary = {
    total: 0,
    succeeded: 0,
    failed: 0,
    cited: 0,
    mentioned: 0,
    byProvider: {},
  };

  const activeProviders = PROVIDERS.filter((p) => p.hasKey());
  if (activeProviders.length === 0) {
    return summary; // No API keys configured — nothing to do.
  }

  for (const provider of activeProviders) {
    summary.byProvider[provider.name] = { ok: 0, cited: 0, mentioned: 0 };

    for (const { query, category } of PROBE_QUERIES) {
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
        // Persist the failure so we can see API outages on the timeline.
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

      // Small spacing between requests to be polite to the providers.
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return summary;
}
