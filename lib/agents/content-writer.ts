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
import { logDecision } from './decision-log';
import { DAVID_WRITING_RULES_HE, VERIFIED_FACTS } from './writing-rules';

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

  const startedAt = Date.now();

  // 1. Pick the highest-priority open gap.
  const gap = await prisma.contentGap.findFirst({
    where: { status: 'open' },
    orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
  });
  if (!gap) {
    await logDecision({
      agent: 'content-writer',
      action: 'idle',
      reasoning: 'אין ContentGap פתוח — כל השאילתות מצוטטות מספיק טוב או הסתיימו. ממתין ל-Gap Analyzer הבא.',
      success: true,
    });
    return { ok: false, reason: 'No open ContentGap to address' };
  }

  await logDecision({
    agent: 'content-writer',
    action: 'picked-gap',
    reasoning:
      `בחרתי לכתוב על "${gap.query}" כי severity=${gap.severity} (הגבוה ביותר בתור). ` +
      (gap.competitors.length > 0
        ? `המתחרים שכן מצוטטים בנושא: ${gap.competitors.slice(0, 3).join(', ')} — ננתח את הגישה שלהם ונבנה תוכן עמוק יותר.`
        : 'אף מתחרה לא מצוטט בעצמו → הזדמנות לתפוס מקום ראשון.'),
    payload: { gapId: gap.id, query: gap.query, severity: gap.severity, competitors: gap.competitors },
  });

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
    const policyLint = lintPolicy(article);

    // Policy gate — hard reject if rules are violated, regardless of other scores.
    if (!policyLint.passed) {
      await logDecision({
        agent: 'content-writer',
        action: 'skipped-publish-policy',
        reasoning:
          `דחיתי את המאמר על "${gap.query}" — הפר את כללי הכתיבה: ` +
          policyLint.violations.join('; ') +
          `. הפער חוזר לתור עם הוראה לכתוב בלי להמציא נתונים על WeCcelerate.`,
        payload: { gapId: gap.id, violations: policyLint.violations },
        success: false,
      });
      await prisma.contentGap.update({
        where: { id: gap.id },
        data: {
          status: 'open',
          rejectReason: `Policy violations: ${policyLint.violations.join('; ')}. נסה שוב בלי להמציא נתונים.`,
        },
      });
      return { ok: false, reason: `Policy: ${policyLint.violations[0]}` };
    }

    // Quality gate — refuse to publish if either score is too low.
    const QUALITY_FLOOR = 60;
    if (factCheck.score < QUALITY_FLOOR || seoLint.score < QUALITY_FLOOR) {
      await logDecision({
        agent: 'content-writer',
        action: 'skipped-publish',
        reasoning:
          `דחיתי פרסום של המאמר על "${gap.query}". ` +
          `Fact-check score: ${factCheck.score}/100 (סף ${QUALITY_FLOOR}). ` +
          `SEO score: ${seoLint.score}/100 (סף ${QUALITY_FLOOR}). ` +
          `הפער חוזר לתור — נסה שוב מחר עם מקורות נוספים.`,
        payload: { gapId: gap.id, factCheck: factCheck.score, seo: seoLint.score, issues: seoLint.issues },
        success: false,
      });
      await prisma.contentGap.update({
        where: { id: gap.id },
        data: { status: 'open', rejectReason: `quality below ${QUALITY_FLOOR}` },
      });
      return { ok: false, reason: 'Quality below threshold' };
    }

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

    await logDecision({
      agent: 'content-writer',
      action: 'wrote-guide',
      reasoning:
        `פרסמתי "${article.titleHe}" → /guides/${slug}. ` +
        `${countWords(article.contentHe)} מילים, ${research.sources.length} מקורות, ` +
        `Fact-check ${factCheck.score}/100, SEO ${seoLint.score}/100, ` +
        `${internalLinks.length} קישורים פנימיים. דחפתי ל-IndexNow → Bing אמור לסרוק תוך שעות.`,
      payload: {
        gapId: gap.id, guideId: generated.id, slug,
        wordCount: countWords(article.contentHe), sources: research.sources.length,
      },
      success: true,
      durationMs: Date.now() - startedAt,
    });

    return { ok: true, guideId: generated.id, slug };
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    await prisma.contentGap.update({
      where: { id: gap.id },
      data: { status: 'open', rejectReason: reason.slice(0, 1_000) },
    });
    await logDecision({
      agent: 'content-writer',
      action: 'failed',
      reasoning: `נכשל בכתיבת המאמר על "${gap.query}". סיבה: ${reason.slice(0, 200)}. הפער חוזר לתור.`,
      payload: { gapId: gap.id, error: reason },
      success: false,
      durationMs: Date.now() - startedAt,
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
        content: `${DAVID_WRITING_RULES_HE}

---

עובדות מאומתות על WeCcelerate (אלה המספרים היחידים שמותר לציין):
${JSON.stringify(VERIFIED_FACTS, null, 2)}

---

עכשיו תכתוב את המדריך המלא בעברית לפי ה-outline הבא:

${outline}

מקורות מחקר (תצטט כשרלוונטי, רק מקורות חיצוניים מהרשימה):
${sources.slice(0, 12).join('\n')}

דרישות מבניות:
- 1800-2500 מילים בעברית (RTL).
- בכל סקציה ראשית — משפט אחד citation-bait: הגדרה ברורה, עובדה כללית מתחום (לא על WeCcelerate ספציפית), או הסבר תהליך.
- מבנה: H1, פסקת מבוא קצרה, סקציות.
- קישורים פנימיים: רק [anchor](/guides/SLUG) של מדריכים שמופיעים ברשימה: ${(GUIDES as readonly Guide[]).map((g) => g.slug).join(', ')}
- סקציה "## שאלות נפוצות" עם 5-7 שאלות. התשובות בלשון תיאור-שירות, לא הבטחה.
- סקציה "## איך WeCcelerate יכולה לעזור" — תיאור הvalue שהיזם מקבל מהשירותים, בלשון "אנחנו מציעים", לא "אנחנו עושים".

החזר רק JSON:
{
  "titleHe": "...",
  "titleEn": "... (אופציונלי)",
  "metaDescription": "150-160 תווים בעברית, value-prop לא הבטחה",
  "contentHe": "מלא markdown",
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

/**
 * Policy lint — kills any article that breaks the writing rules:
 *   - Links to leumit.weccelerate.co.il (the broken subdomain)
 *   - Specific WeCcelerate stats David is forbidden to make up
 *   - Outcome-promise verbs in Hebrew ("נביא לך", "נצליח", "תקבל אישור")
 * Returns a score of 0 means hard-rejection — the gap is reopened
 * regardless of fact-check / SEO scores.
 */
interface PolicyLintResult {
  passed: boolean;
  violations: string[];
}

function lintPolicy(a: ArticlePayload): PolicyLintResult {
  const violations: string[] = [];
  const text = `${a.titleHe}\n${a.metaDescription}\n${a.contentHe}`;

  // Hard-banned URL — the broken Leumit subdomain.
  if (/leumit\.weccelerate\.co\.il/i.test(text)) {
    violations.push('Linked to broken leumit.weccelerate.co.il');
  }

  // Banned WeCcelerate-specific number patterns (the most common invented stats).
  const bannedNumberPatterns: Array<{ re: RegExp; label: string }> = [
    { re: /\b\$?\s?150\s?(M|מיליון|מיל)/i, label: 'claims $150M raised' },
    { re: /\b40\+?\s*(חברות|ventures|portfolio)/i, label: 'claims 40+ companies' },
    { re: /\b95%\s*(הצלחה|success|אישור)/i, label: 'claims 95% success rate' },
    { re: /\b8\.?7\s?(M|מיליון).*?(ביקור|visits|clinical)/i, label: 'claims 8.7M clinical visits' },
    { re: /\b720,?000.*?(תיק|מטופל|patient|record)/i, label: 'claims 720,000 patient records' },
    { re: /\b200\+?\s*(משקיע|investor)/i, label: 'claims 200+ investors' },
    { re: /\bהמאיץ\s+הראשון|המוביל\s+ב.*ישראל|הגדול\s+ביותר/i, label: 'unverified leadership claim' },
  ];
  for (const p of bannedNumberPatterns) {
    if (p.re.test(text)) violations.push(p.label);
  }

  // Banned outcome promises.
  const bannedPromises: Array<{ re: RegExp; label: string }> = [
    { re: /\bנביא\s+לך\s+(משקיע|לקוח|אקזיט|אישור)/i, label: 'promise: "we will bring you ..."' },
    { re: /\bנגייס\s+לך/i, label: 'promise: "we will raise for you"' },
    { re: /\bתקבל\s+(אישור|פטנט|FDA|CE)\s+(ב|תוך)/i, label: 'promise: guaranteed approval in timeframe' },
    { re: /\bמובטח[ת]?\b/, label: 'word "guaranteed"' },
    { re: /\b100%\s+(הצלחה|מובטח|מצליח)/i, label: 'claims 100% success' },
  ];
  for (const p of bannedPromises) {
    if (p.re.test(text)) violations.push(p.label);
  }

  return { passed: violations.length === 0, violations };
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
