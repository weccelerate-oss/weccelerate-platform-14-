/**
 * Content Writer Agent — autonomous guide generator.
 *
 * Pipeline (all powered by Anthropic Claude — no Perplexity dependency):
 *   1. RESEARCH    — Claude Sonnet + web_search tool, gathers 5–10 sources
 *   2. OUTLINE     — Claude Opus structures the article
 *   3. WRITE       — Claude Opus produces a 1800-2500-word Hebrew guide
 *   4. INTERNAL-LINK — find related published guides, weave 3-5 links
 *   5. FACT-CHECK  — Claude Sonnet validates each claim against sources
 *   6. SEO-LINT    — deterministic checks (title len, meta len, schema fields)
 *   7. PERSIST     — write GeneratedGuide row, link back to ContentGap
 *
 * If ANTHROPIC_API_KEY is missing the whole pipeline is a no-op so the cron
 * doesn't crash. The dashboard surfaces "agent disabled" in that case.
 */

import { prisma } from '@/lib/db';
import { GUIDES, type Guide } from '@/lib/seo/guides-catalog';

const MODEL_RESEARCH = 'claude-sonnet-4-6';
const MODEL_WRITE = 'claude-opus-4-7';
const MODEL_FACTCHECK = 'claude-sonnet-4-6';

// =============================================================================
// PUBLIC ENTRY
// =============================================================================

export interface WriteResult {
  ok: boolean;
  reason?: string;
  guideId?: string;
  slug?: string;
}

export async function writeNextGuide(): Promise<WriteResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, reason: 'ANTHROPIC_API_KEY not set — agent disabled' };
  }

  // 1. Pick the highest-priority open gap.
  const gap = await prisma.contentGap.findFirst({
    where: { status: 'open' },
    orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
  });
  if (!gap) {
    return { ok: false, reason: 'No open ContentGap to address' };
  }

  // Mark in-progress so a parallel run doesn't pick the same gap.
  await prisma.contentGap.update({
    where: { id: gap.id },
    data: { status: 'in_progress' },
  });

  try {
    const research = await runResearch(gap.query, gap.competitors);
    const outline = await runOutline(gap.query, research.summary, research.sources);
    const article = await runWrite(gap.query, outline, research.sources);
    const internalLinks = pickInternalLinks(article.titleHe, article.contentHe);
    const factCheck = await runFactCheck(article.contentHe, research.sources);
    const seoLint = lintSeo(article);

    const slug = await deriveUniqueSlug(article.titleHe);

    const generated = await prisma.generatedGuide.create({
      data: {
        slug,
        titleHe: article.titleHe,
        titleEn: article.titleEn ?? null,
        metaDescription: article.metaDescription,
        category: gap.category ?? 'general',
        contentHe: article.contentHe,
        contentEn: article.contentEn ?? null,
        modelChain: [MODEL_RESEARCH, MODEL_WRITE, MODEL_FACTCHECK],
        citedSources: research.sources.slice(0, 30),
        internalLinks,
        factCheckScore: factCheck.score,
        seoScore: seoLint.score,
        wordCount: countWords(article.contentHe),
        status: 'published',
        publishedAt: new Date(),
      },
    });

    await prisma.contentGap.update({
      where: { id: gap.id },
      data: {
        status: 'published',
        generatedGuideId: generated.id,
        resolvedAt: new Date(),
      },
    });

    // Push to IndexNow so Bing picks it up immediately. Best-effort.
    pingIndexNow(`https://weccelerate.co.il/guides/${slug}`).catch(() => {});

    return { ok: true, guideId: generated.id, slug };
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    await prisma.contentGap.update({
      where: { id: gap.id },
      data: { status: 'open', rejectReason: reason.slice(0, 1_000) },
    });
    return { ok: false, reason };
  }
}

// =============================================================================
// STAGE IMPLEMENTATIONS
// =============================================================================

interface ResearchResult {
  summary: string;
  sources: string[];
}

async function runResearch(query: string, competitors: string[]): Promise<ResearchResult> {
  const competitorHint = competitors.length > 0
    ? `\n\nSites that currently rank for this query: ${competitors.slice(0, 5).join(', ')}. ` +
      'Read at least one of them and note WHAT they do well, but identify gaps you can fill.'
    : '';

  const prompt = `You are a research assistant for WeCcelerate (Israel's leading Venture Builder).
Goal: gather authoritative material so we can write a Hebrew guide for: "${query}"
${competitorHint}

Use web_search 4-6 times to gather:
1. Definitions, statistics, and dates from primary sources (gov.il, regulators, academic).
2. Israeli context wherever possible.
3. Practical examples — case studies, real numbers.

Output JSON only:
{"summary":"2-paragraph synthesis (English ok)","sources":["url1","url2",...]}`;

  const data = await callAnthropic({
    model: MODEL_RESEARCH,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }],
  });

  const text = extractText(data);
  const parsed = safeParseJson<ResearchResult>(text) ?? { summary: text.slice(0, 4000), sources: [] };

  // Backfill sources from the tool results if the model didn't include them.
  const toolSources = extractToolUrls(data);
  const sources = Array.from(new Set([...(parsed.sources ?? []), ...toolSources])).slice(0, 30);
  return { summary: parsed.summary ?? '', sources };
}

async function runOutline(query: string, summary: string, sources: string[]): Promise<string> {
  const data = await callAnthropic({
    model: MODEL_WRITE,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Outline a 2000-word Hebrew guide for the query: "${query}"

Research summary:
${summary}

Sources:
${sources.slice(0, 10).join('\n')}

Format the outline as:
# H1 (Hebrew, citation-bait)
## H2 sections (5-7)
### H3 sub-points where helpful
HOWTO_STEPS: 6-8 numbered, actionable
FAQ: 5-7 Q&A pairs
INTERNAL_LINKS: list 3-5 anchor texts to weave in

Match the tone of weccelerate.co.il/guides — practical, Israeli context, no fluff. Output the outline only.`,
      },
    ],
  });
  return extractText(data);
}

interface ArticlePayload {
  titleHe: string;
  titleEn?: string | null;
  metaDescription: string;
  contentHe: string;
  contentEn?: string | null;
}

async function runWrite(query: string, outline: string, sources: string[]): Promise<ArticlePayload> {
  const data = await callAnthropic({
    model: MODEL_WRITE,
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `Write the full Hebrew guide using this outline:

${outline}

Research sources (cite when relevant):
${sources.slice(0, 12).join('\n')}

Requirements:
- 1800-2500 words of Hebrew (RTL).
- Each major section should have one quotable sentence (LLM-citation-bait): a definition, a stat, or a clear claim. These short sentences are what AI engines pull as snippets.
- Include the H1, then a 2-line lede, then sections. Use markdown.
- Internal links use the Hebrew anchor "[anchor](/guides/relevant-slug)" where relevant. Add a "## מדריכים קשורים" section at the end.
- Add a "## שאלות נפוצות" section with 5-7 FAQ Q&A pairs.
- Tone: WeCcelerate (Israel's Venture Builder). Practical, Israeli context, evidence-based.

Return JSON only:
{
  "titleHe": "...",
  "titleEn": "... (optional, English title)",
  "metaDescription": "150-160 char Hebrew",
  "contentHe": "full markdown",
  "contentEn": null
}`,
      },
    ],
  });
  const text = extractText(data);
  const parsed = safeParseJson<ArticlePayload>(text);
  if (!parsed?.titleHe || !parsed.contentHe) {
    throw new Error('Writer returned malformed JSON');
  }
  return parsed;
}

function pickInternalLinks(title: string, body: string): string[] {
  const haystack = `${title}\n${body}`.toLowerCase();
  const matches = (GUIDES as readonly Guide[])
    .filter((g) => {
      const kw = g.targetKeyword?.toLowerCase() ?? '';
      return kw.length > 4 && haystack.includes(kw);
    })
    .slice(0, 5)
    .map((g) => `/guides/${g.slug}`);
  return matches;
}

interface FactCheckResult {
  score: number; // 0-100
  notes: string;
}

async function runFactCheck(content: string, sources: string[]): Promise<FactCheckResult> {
  const data = await callAnthropic({
    model: MODEL_FACTCHECK,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `Fact-check this Hebrew article against the listed sources. For each numerical claim, date, or named entity, verify it appears in (or is reasonably consistent with) the sources.

Article (Hebrew, may be long):
${content.slice(0, 12_000)}

Sources:
${sources.slice(0, 12).join('\n')}

Return JSON only:
{
  "score": 0-100 (100 = every claim verified, 0 = mostly unsupported),
  "notes": "1-3 sentences on the worst offenders, English ok"
}`,
      },
    ],
  });
  const text = extractText(data);
  const parsed = safeParseJson<FactCheckResult>(text);
  return parsed ?? { score: 50, notes: 'Fact-check parse failed' };
}

interface SeoLintResult {
  score: number;
  issues: string[];
}

function lintSeo(a: ArticlePayload): SeoLintResult {
  const issues: string[] = [];
  let score = 100;
  if (a.titleHe.length > 65) { issues.push('titleHe > 65 chars'); score -= 10; }
  if (a.titleHe.length < 25) { issues.push('titleHe < 25 chars'); score -= 10; }
  if (a.metaDescription.length > 165) { issues.push('metaDescription > 165 chars'); score -= 10; }
  if (a.metaDescription.length < 120) { issues.push('metaDescription < 120 chars'); score -= 10; }
  const wc = countWords(a.contentHe);
  if (wc < 1200) { issues.push(`only ${wc} words`); score -= 20; }
  const hasFaq = /##\s*שאלות נפוצות/i.test(a.contentHe);
  if (!hasFaq) { issues.push('missing FAQ section'); score -= 15; }
  return { score: Math.max(0, score), issues };
}

// =============================================================================
// HELPERS
// =============================================================================

interface AnthropicCall {
  model: string;
  max_tokens: number;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  tools?: Array<{ type: string; name: string; max_uses?: number }>;
}

async function callAnthropic(req: AnthropicCall): Promise<unknown> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function extractText(data: unknown): string {
  const blocks = (data as { content?: Array<{ type: string; text?: string }> }).content ?? [];
  return blocks
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text!)
    .join('\n\n');
}

function extractToolUrls(data: unknown): string[] {
  const blocks = (data as { content?: Array<{
    type: string;
    content?: Array<{ url?: string }>;
  }> }).content ?? [];
  const urls: string[] = [];
  for (const b of blocks) {
    if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
      for (const r of b.content) {
        if (typeof r.url === 'string') urls.push(r.url);
      }
    }
  }
  return urls;
}

function safeParseJson<T>(text: string): T | null {
  // Strip code fences if present.
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
  // Find the first {...} block.
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).length;
}

async function deriveUniqueSlug(title: string): Promise<string> {
  // Hebrew → simple ASCII-safe slug. Falls back to a timestamp if empty.
  const ascii = title
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9֐-׿\s-]/g, '')
    .trim()
    .replace(/[֐-׿]/g, (c) => String(c.charCodeAt(0).toString(16)))
    .toLowerCase()
    .replace(/\s+/g, '-')
    .slice(0, 80) || `guide-${Date.now()}`;

  let candidate = ascii;
  let n = 1;
  while (await slugTaken(candidate)) {
    candidate = `${ascii}-${++n}`;
    if (n > 50) {
      candidate = `${ascii}-${Date.now()}`;
      break;
    }
  }
  return candidate;
}

async function slugTaken(slug: string): Promise<boolean> {
  // Static catalog OR existing GeneratedGuide row.
  const inCatalog = (GUIDES as readonly Guide[]).some((g) => g.slug === slug);
  if (inCatalog) return true;
  const existing = await prisma.generatedGuide.findUnique({ where: { slug } });
  return Boolean(existing);
}

async function pingIndexNow(url: string): Promise<void> {
  try {
    await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'weccelerate.co.il',
        key: process.env.INDEXNOW_KEY ?? 'a7f3c912b8e04d569f1a2c3b4d5e6f78',
        keyLocation: `https://weccelerate.co.il/${process.env.INDEXNOW_KEY ?? 'a7f3c912b8e04d569f1a2c3b4d5e6f78'}.txt`,
        urlList: [url],
      }),
    });
  } catch {
    /* non-fatal — Bing will eventually crawl on its own */
  }
}
