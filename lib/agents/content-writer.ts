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
import {
  loadDailyContext,
  isQueryAlreadyCovered,
  summarizeRecentGuidesForPrompt,
  type DailyContext,
} from './daily-context';
import { loadJournal, summarizeJournalForWriter, type JournalSummary } from './journal';
import { generateLinkedInPost } from './linkedin-post-generator';
import { sendArticlePublishedEmail } from './article-published-email';
import { findCompetitorMentions } from '@/lib/seo/competitor-list';

const MODEL_RESEARCH = 'claude-sonnet-4-6';
// Opus is kept for the article writing (quality matters for SEO/GEO depth).
// A full 1800-2500-word Opus generation takes 100-200s — far past Vercel's 60s
// function limit — so the split pipeline writes the article ONE SECTION PER
// INVOCATION (see the WritingJob "sections" stage at the bottom of this file).
// Each section is ~300-450 words (~30-45s on Opus), which fits comfortably.
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

// DA-4 — let David ship more than one guide per writing day when the queue
// is long. MAX_ARTICLES_PER_DAY caps the daily Anthropic spend; BUDGET_MS
// keeps the cron well inside Vercel's 60s Hobby maxDuration (or 300s Pro)
// so we never time out mid-publish and orphan a gap in `in_progress`.
const MAX_ARTICLES_PER_DAY = 3;
const BUDGET_MS = 50_000; // leave headroom under maxDuration

export interface MultiWriteResult {
  attempted: number;
  published: number;
  drafts: number;
  results: WriteResult[];
  stoppedReason: 'budget' | 'cap' | 'queue-empty';
}

/**
 * Run the writer in a loop, producing up to MAX_ARTICLES_PER_DAY guides
 * per tick or until BUDGET_MS elapses. Stops early on the FIRST idle
 * result (no more eligible gaps) so we don't burn the budget polling
 * an empty queue.
 */
export async function writeGuidesForTick(opts?: {
  context?: DailyContext;
  journal?: JournalSummary;
}): Promise<MultiWriteResult> {
  const start = Date.now();
  const results: WriteResult[] = [];
  let stoppedReason: MultiWriteResult['stoppedReason'] = 'cap';

  // Reaper — reclaim any gap orphaned in `in_progress` by a previous run that
  // died mid-write before its catch block could reset status→open. The most
  // common cause is the Vercel function hitting its execution-time limit during
  // the research call (the writer's first, slowest Anthropic round-trip), which
  // hard-kills the process so neither `wrote-guide` nor `failed` is ever logged
  // and the gap is stranded — invisible to the `status: 'open'` picker forever.
  // The daily cron never overlaps itself, so anything still `in_progress` at the
  // START of a tick is by definition a leftover and safe to release.
  await reclaimOrphanedGaps();

  for (let i = 0; i < MAX_ARTICLES_PER_DAY; i++) {
    if (Date.now() - start >= BUDGET_MS) {
      stoppedReason = 'budget';
      break;
    }
    const r = await writeNextGuide(opts);
    results.push(r);
    // Idle reasons mean the queue is exhausted for today — don't keep
    // polling. Other non-ok reasons (policy fail, draft, etc.) consumed
    // a gap, so we can legitimately try another candidate.
    if (!r.ok && (r.reason?.startsWith('אין ContentGap') || r.reason?.startsWith('דילגתי על'))) {
      stoppedReason = 'queue-empty';
      break;
    }
  }

  const published = results.filter((r) => r.ok).length;
  const drafts = results.filter((r) => !r.ok && r.guideId).length;
  return { attempted: results.length, published, drafts, results, stoppedReason };
}

/**
 * Release gaps stranded in `in_progress` back to `open`. See the call site in
 * writeGuidesForTick for why a run-start sweep is the correct, no-overlap-safe
 * recovery. Returns the number reclaimed. Best-effort: a failure here must not
 * abort the writing tick, so callers don't await-throw on it.
 */
async function reclaimOrphanedGaps(): Promise<number> {
  try {
    // Only release gaps that DON'T have a live WritingJob. A gap whose job is
    // merely mid-flight (e.g. stalled between section batches) is NOT orphaned —
    // releasing it lets the next tick re-pick the same topic and spawn a
    // DUPLICATE job/article. Exclude any gap with a job not in done/failed.
    const liveJobGapIds = (
      await prisma.writingJob.findMany({
        where: { stage: { notIn: ['done', 'failed'] } },
        select: { gapId: true },
      })
    ).map((j: { gapId: string }) => j.gapId);

    const res = await prisma.contentGap.updateMany({
      where: { status: 'in_progress', id: { notIn: liveJobGapIds } },
      data: {
        status: 'open',
        rejectReason: 'Reclaimed by reaper: in_progress with no live writing job (previous run died).',
      },
    });
    if (res.count > 0) {
      await logDecision({
        agent: 'content-writer',
        action: 'reclaimed-orphans',
        reasoning:
          `שחררתי ${res.count} פערים שנתקעו ב-in_progress מריצה קודמת שמתה באמצע ` +
          `(כנראה timeout של הפונקציה בשלב המחקר). הם חוזרים לתור כדי שלא ייעלמו לתמיד.`,
        payload: { reclaimed: res.count },
        success: true,
      });
    }
    return res.count;
  } catch (e) {
    console.error('[reclaimOrphanedGaps] failed (non-fatal):', e);
    return 0;
  }
}

export async function writeNextGuide(opts?: { context?: DailyContext; journal?: JournalSummary }): Promise<WriteResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, reason: 'ANTHROPIC_API_KEY not set — agent disabled' };
  }

  const startedAt = Date.now();
  const ctx = opts?.context ?? (await loadDailyContext());
  const journal = opts?.journal ?? (await loadJournal());

  // 1. Pick the highest-priority open gap that wasn't already covered in
  //    the last 30 days. We page through candidates in priority order so a
  //    second-place gap can win when #1 was already addressed yesterday.
  //    Pool is 50, not 10, so a front-loaded list of recent duplicates
  //    doesn't strand David when the queue genuinely has fresh topics
  //    further down.
  // Cap by severity ≥ 50: severity-40 gaps come from queries with 30-60%
  // cite rate, which means we already have a presence. Spending an Anthropic
  // round-trip there is lower ROI than letting the queue stay focused on
  // 0% and <30% gaps. The cap is a queue-length governor too — without it,
  // a backlog of dozens of severity-40 entries crowds out fresher urgent
  // gaps.
  const candidates = await prisma.contentGap.findMany({
    where: { status: 'open', severity: { gte: 50 } },
    orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
    take: 50,
  });

  // Atomic claim: replace the previous SELECT+UPDATE race with a single
  // updateMany guarded on `status: 'open'`. If two writer ticks run in
  // parallel (cron retry, manual trigger), only the one whose updateMany
  // returns count=1 owns the gap. The loser falls through to the next
  // candidate.
  let gap: typeof candidates[number] | null = null;
  let skippedDuplicates = 0;
  let skippedRaces = 0;
  for (const candidate of candidates) {
    if (isQueryAlreadyCovered(candidate.query, ctx)) {
      skippedDuplicates += 1;
      continue;
    }
    const claim = await prisma.contentGap.updateMany({
      where: { id: candidate.id, status: 'open' },
      data: { status: 'in_progress' },
    });
    if (claim.count === 1) {
      gap = candidate;
      break;
    }
    // Lost the race or status changed between SELECT and UPDATE — try next.
    skippedRaces += 1;
  }

  if (!gap) {
    const reason = candidates.length === 0
      ? 'אין ContentGap פתוח — כל השאילתות מצוטטות מספיק טוב או הסתיימו. ממתין ל-Gap Analyzer הבא.'
      : `דילגתי על ${skippedDuplicates} פערים פתוחים כי כבר כתבתי עליהם ב-30 הימים האחרונים. אין נושא חדש לכתוב היום.`;
    await logDecision({
      agent: 'content-writer',
      action: candidates.length === 0 ? 'idle' : 'idle-all-covered',
      reasoning: reason,
      payload: { openGaps: candidates.length, skippedDuplicates },
      success: true,
    });
    return { ok: false, reason };
  }

  await logDecision({
    agent: 'content-writer',
    action: 'picked-gap',
    reasoning:
      `בחרתי לכתוב על "${gap.query}" כי severity=${gap.severity}` +
      (skippedDuplicates > 0 ? ` (דילגתי על ${skippedDuplicates} פערים שכבר כתבתי עליהם לאחרונה)` : '') +
      `. ` +
      (gap.competitors.length > 0
        ? `המתחרים שכן מצוטטים בנושא: ${gap.competitors.slice(0, 3).join(', ')} — ננתח את הגישה שלהם ונבנה תוכן עמוק יותר.`
        : 'אף מתחרה לא מצוטט בעצמו → הזדמנות לתפוס מקום ראשון.'),
    payload: { gapId: gap.id, query: gap.query, severity: gap.severity, competitors: gap.competitors, skippedDuplicates, skippedRaces },
  });

  // (Atomic claim already happened above — no separate mark step needed.)

  try {
    const research = await runResearch(gap.query, gap.competitors);
    const outline = await runOutline(gap.query, research.summary, research.sources);
    const rawArticle = await runWrite(gap.query, outline, research.sources, ctx, journal);
    // Belt-and-suspenders sanitization — Claude sometimes slips em-dashes
    // through despite the system prompt. Strip them before linting so we
    // don't reject an otherwise-good article on a cosmetic issue.
    const article = sanitizeArticleBody(rawArticle);
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

    // DA-3 — fact-check JSON parse failed twice. Save the article as a
    // DRAFT so the dashboard surfaces it for manual review instead of
    // silently shipping unverified copy. We still ran the policy gate,
    // so anything obviously broken is already blocked above.
    if (factCheck.unparsed) {
      const slug = await deriveUniqueSlug(article.titleHe, article.titleEn);
      const draft = await prisma.generatedGuide.create({
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
          factCheckScore: null,
          seoScore: seoLint.score,
          wordCount: countWords(article.contentHe),
          status: 'draft',
          publishedAt: null,
        },
      });
      // Keep the gap "in_progress" so a future re-fact-check can complete
      // the publish, but link it to the draft so the operator can find it.
      await prisma.contentGap.update({
        where: { id: gap.id },
        data: { generatedGuideId: draft.id, rejectReason: 'Fact-check unparseable; saved as draft for review.' },
      });
      await logDecision({
        agent: 'content-writer',
        action: 'saved-draft-unparsed-factcheck',
        reasoning:
          `שמרתי את המאמר על "${gap.query}" כטיוטה — ה-fact-check לא החזיר JSON תקין פעמיים. ` +
          `כדאי לעבור עליו ידנית ב-/admin לפני פרסום. slug: /guides/${slug}.`,
        payload: { gapId: gap.id, draftId: draft.id, slug, factCheckNotes: factCheck.notes },
        success: false,
        durationMs: Date.now() - startedAt,
      });
      return { ok: false, reason: 'Fact-check unparsed — saved as draft', guideId: draft.id, slug };
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

    const slug = await deriveUniqueSlug(article.titleHe, article.titleEn);

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

    // Notify Katrin: generate a LinkedIn post draft and email it with the
    // article link. Fire-and-forget — a failed notification does NOT block
    // the publish flow, since the guide is already live in the DB.
    notifyKatrinAboutArticle({
      titleHe: article.titleHe,
      slug,
      bodyExcerpt: article.contentHe,
      sourceQuery: gap.query,
      category: gap.category,
      wordCount: countWords(article.contentHe),
    }).catch((e) => {
      console.error('[notifyKatrinAboutArticle] failed:', e);
    });

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

async function runWrite(
  query: string,
  outline: string,
  sources: string[],
  ctx?: DailyContext,
  journal?: JournalSummary,
): Promise<ArticlePayload> {
  const recentGuidesBlock = ctx ? `\n\n---\n\n${summarizeRecentGuidesForPrompt(ctx)}\n\nאל תכפול אותם — אם הנושא כבר כוסה, תכתוב מזווית שונה לחלוטין או תפרט אספקט שלא נכלל. אסור להשתמש באותו slug, ואסור לחזור על אותו H1.\n` : '';
  const journalBlock = journal ? `\n\n---\n\n${summarizeJournalForWriter(journal)}\n` : '';

  const data = await callAnthropic({
    model: MODEL_WRITE,
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `${DAVID_WRITING_RULES_HE}

---

עובדות מאומתות על WeCcelerate (אלה המספרים היחידים שמותר לציין):
${JSON.stringify(VERIFIED_FACTS, null, 2)}${recentGuidesBlock}${journalBlock}

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
  /** True if BOTH parse attempts failed — caller should ship as draft, not published. */
  unparsed?: boolean;
}

async function runFactCheck(content: string, sources: string[]): Promise<FactCheckResult> {
  const basePrompt = `Fact-check this Hebrew article against the listed sources. For each numerical claim, date, or named entity, verify it appears in (or is reasonably consistent with) the sources.

Article (Hebrew, may be long):
${content.slice(0, 12_000)}

Sources:
${sources.slice(0, 12).join('\n')}

Return JSON only:
{
  "score": 0-100 (100 = every claim verified, 0 = mostly unsupported),
  "notes": "1-3 sentences on the worst offenders, English ok"
}`;

  const firstTry = extractText(await callAnthropic({
    model: MODEL_FACTCHECK,
    max_tokens: 1500,
    messages: [{ role: 'user', content: basePrompt }],
  }));
  const parsedFirst = safeParseJson<FactCheckResult>(firstTry);
  if (parsedFirst) return parsedFirst;

  // Don't silently fall back to score:50 — that was the death threshold and
  // killed articles invisibly. Retry once with a stricter "JSON only, no
  // prose" instruction; only if THAT fails do we accept a permissive default
  // so the article isn't blocked by Anthropic's parsing flakiness.
  const retry = extractText(await callAnthropic({
    model: MODEL_FACTCHECK,
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content:
          basePrompt +
          '\n\nIMPORTANT: respond with ONLY the JSON object. No markdown fences, no commentary, no leading whitespace. Start with { and end with }.',
      },
    ],
  }));
  const parsedRetry = safeParseJson<FactCheckResult>(retry);
  if (parsedRetry) return parsedRetry;

  // Both attempts failed to produce parseable JSON. DON'T auto-publish:
  // an unverified article going live unflagged was a real liability. We
  // emit an "unparsed" sentinel so the caller can save the draft with a
  // null score and `status: 'draft'`, surfacing it on the dashboard for
  // manual review instead of silently shipping. The numeric score (0) is
  // a placeholder — callers should check the `unparsed` flag first.
  return {
    score: 0,
    notes: 'Fact-check JSON parse failed twice — article saved as draft for manual review.',
    unparsed: true,
  };
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

  // Banned price commitments — specific NIS / USD amounts attached to a service.
  const bannedPrices: Array<{ re: RegExp; label: string }> = [
    { re: /\d{1,3}(?:,\d{3})*\s*ש[\"״]?ח/, label: 'specific NIS price' },
    { re: /\$\s?\d{1,3}(?:,\d{3})*\s+(?:for|עבור|תמורת)/i, label: 'specific USD price' },
    { re: /\b(?:עולה|costs?)\s+\$?\d{1,3}(?:,\d{3})*/i, label: '"costs X" price commitment' },
    { re: /equity[\-\s]?for[\-\s]?services.*?\d+[\-–]\d+%/i, label: 'specific equity %' },
    { re: /\b\d+[\-–]\d+%\s+(?:אקוויטי|equity|פלוס\s+דיוויי)/i, label: 'specific equity range' },
  ];
  for (const p of bannedPrices) {
    if (p.re.test(text)) violations.push(p.label);
  }

  // Banned time commitments — specific weeks/months promises attached to a service.
  const bannedTimes: Array<{ re: RegExp; label: string }> = [
    { re: /\bתוך\s+\d+[\-–]\d+\s*(שבועות|חודשים|שבועיים)/, label: 'time commitment "within X weeks/months"' },
    { re: /\bב[\-]?\d+[\-–]\d+\s*(שבועות|חודשים)\s+(?:בלבד|מתחילת|במקום)/, label: 'specific timeframe vs market average' },
    { re: /\bwithin\s+\d+[\-–]\d+\s+(weeks|months)/i, label: 'time commitment "within X weeks/months"' },
    { re: /\bin\s+\d+[\-–]\d+\s+(weeks|months)\s+(?:vs|instead\s+of)/i, label: 'specific time vs market average' },
  ];
  for (const p of bannedTimes) {
    if (p.re.test(text)) violations.push(p.label);
  }

  // Banned competitor mentions — we don't name competing accelerators /
  // Venture Builders on our own properties. See lib/seo/competitor-list.ts
  // for the authoritative list (covers 8200 EISP, The Junction, MassChallenge,
  // Y Combinator, Google for Startups, etc.).
  const competitorHits = findCompetitorMentions(text);
  if (competitorHits.length > 0) {
    violations.push(`mentions competitors: ${competitorHits.join(', ')}`);
  }

  // DA-17 — the em-dash / en-dash check was dead code: sanitizeArticleBody
  // (called before this lint) strips all em/en dashes to ASCII hyphens, so
  // by the time we got here `text` could never contain '—' or '–'. The
  // sanitizer is the source of truth; the policy lint no longer needs it.

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
  // 429 = rate limit, 529 = overloaded. Both deserve an exponential
  // backoff retry before we give up — they're the most common causes of
  // a single-shot failure that would otherwise mark a writing day as a
  // total loss.
  const RETRY_STATUSES = new Set([429, 529]);
  const BACKOFF_MS = [2_000, 4_000];

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(req),
        // 120s is well above the longest legitimate Claude call we've
        // seen (~90s for an 8000-token Hebrew article). Beyond that
        // we'd rather fail fast and let the cron's outer timeout
        // surface a clean error in the email.
        signal: AbortSignal.timeout(120_000),
      });
      if (res.ok) return res.json();
      const bodyText = await res.text();
      const err = new Error(`Anthropic ${res.status} [${req.model}]: ${bodyText.slice(0, 500)}`);
      if (RETRY_STATUSES.has(res.status) && attempt < BACKOFF_MS.length) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
        continue;
      }
      throw err;
    } catch (e) {
      // Network / abort errors — also retryable up to the cap.
      const err = e instanceof Error ? e : new Error(String(e));
      if (attempt < BACKOFF_MS.length && !err.message.startsWith('Anthropic ')) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt]));
        continue;
      }
      throw err;
    }
  }
  throw lastErr ?? new Error(`Anthropic failed after retries [${req.model}]`);
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
  // Try parsing the whole cleaned blob first — when the model obeyed the
  // "JSON only" instruction this is exactly right and avoids the nested-
  // brace slice fallback misparsing the article body (which contains
  // its own { } inside markdown / code samples).
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Fall through to slice-based recovery.
  }
  // Find the outermost {...} block. lastIndexOf('}') was the original
  // recovery path — keep it as a fallback for messy outputs.
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

// Letter-level Hebrew → Latin transliteration for slugs. Not linguistic
// perfection — just readable ASCII (the old hex-charcode fallback produced
// slugs like '5d05d95da-...' which are useless for SEO and ugly to share).
const HEBREW_TRANSLIT: Record<string, string> = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
  'ח': 'ch', 'ט': 't', 'י': 'i', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
  'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f',
  'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't',
};

async function deriveUniqueSlug(titleHe: string, titleEn?: string | null): Promise<string> {
  // Prefer the English title when the plan stage produced one — it slugifies
  // into real words. Otherwise transliterate the Hebrew letter-by-letter.
  const base = (titleEn && titleEn.trim()) || titleHe;
  const ascii = base
    .normalize('NFKD')
    .replace(/[֐-׿]/g, (c) => HEBREW_TRANSLIT[c] ?? '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '') || `guide-${Date.now()}`;

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

let _indexNowWarnedOnce = false;
export async function pingIndexNow(url: string): Promise<void> {
  // DA-16 — never ping with a hardcoded fallback key. The key MUST live in
  // INDEXNOW_KEY env (and a matching `${key}.txt` MUST be served from the
  // site root); without that the call is at best a no-op and at worst it
  // reveals our key publicly.
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    if (!_indexNowWarnedOnce) {
      console.warn('[pingIndexNow] INDEXNOW_KEY unset — skipping IndexNow ping (Bing will crawl on its own).');
      _indexNowWarnedOnce = true;
    }
    return;
  }
  try {
    await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'weccelerate.co.il',
        key,
        keyLocation: `https://weccelerate.co.il/${key}.txt`,
        urlList: [url],
      }),
    });
  } catch {
    /* non-fatal — Bing will eventually crawl on its own */
  }
}

/**
 * Replace em/en dashes with plain hyphens throughout the article. Em-dashes
 * are the single most reliable AI-tell in Hebrew prose, and the model
 * sometimes uses them despite the system-prompt forbidding them. This is
 * the pure-text safety net.
 */
function sanitizeArticleBody(a: ArticlePayload): ArticlePayload {
  const fix = (s: string | null | undefined): string =>
    typeof s === 'string' ? s.replace(/[—–]/g, '-') : '';
  return {
    titleHe: fix(a.titleHe),
    titleEn: a.titleEn ? fix(a.titleEn) : null,
    metaDescription: fix(a.metaDescription),
    contentHe: fix(a.contentHe),
    contentEn: a.contentEn ? fix(a.contentEn) : null,
  };
}

/**
 * Side-effect helper: generate a LinkedIn post draft + email it to Katrin.
 * Called fire-and-forget AFTER prisma.generatedGuide.create succeeds, so
 * any failure here is purely cosmetic — the guide is already live.
 * Exported: the admin publish-draft action reuses it so a manually-approved
 * draft gets the same Katrin email as an auto-published article.
 */
export async function notifyKatrinAboutArticle(opts: {
  titleHe: string;
  slug: string;
  bodyExcerpt: string;
  sourceQuery?: string | null;
  category?: string | null;
  wordCount: number;
}): Promise<void> {
  const articleUrl = `https://weccelerate.co.il/guides/${opts.slug}`;

  // Strip markdown noise from the excerpt so Claude works from clean Hebrew.
  const cleanExcerpt = opts.bodyExcerpt
    .replace(/^#+\s.*$/gm, '')          // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // bold
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → anchor text
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 1500);

  const postResult = await generateLinkedInPost({
    titleHe: opts.titleHe,
    url: articleUrl,
    bodyExcerpt: cleanExcerpt,
    sourceQuery: opts.sourceQuery ?? null,
    category: opts.category ?? null,
  });

  if (!postResult.ok || !postResult.post) {
    await logDecision({
      agent: 'content-writer',
      action: 'linkedin-post-failed',
      reasoning: `כשל בניסוח פוסט LinkedIn ל-"${opts.titleHe}": ${postResult.error ?? 'unknown'}`,
      payload: { slug: opts.slug, error: postResult.error },
      success: false,
    });
    return;
  }

  const emailResult = await sendArticlePublishedEmail({
    titleHe: opts.titleHe,
    slug: opts.slug,
    linkedInPost: postResult.post,
    imagePrompt: postResult.imagePrompt ?? null,
    shouldIncludeLogo: postResult.shouldIncludeLogo ?? false,
    imageStyle: postResult.imageStyle ?? null,
    imageRationale: postResult.imageRationale ?? null,
    topicHint: opts.sourceQuery ?? null,
    category: opts.category ?? null,
    wordCount: opts.wordCount,
  });

  await logDecision({
    agent: 'content-writer',
    action: emailResult.ok ? 'notified-katrin' : 'notify-katrin-failed',
    reasoning: emailResult.ok
      ? `שלחתי ל-${emailResult.recipient} מייל עם הקישור ל-"${opts.titleHe}" + פוסט מוכן ל-LinkedIn.`
      : `כשל בשליחת מייל ל-${emailResult.recipient}: ${emailResult.error ?? 'unknown'}`,
    payload: { slug: opts.slug, recipient: emailResult.recipient, error: emailResult.error },
    success: emailResult.ok,
  });
}

// =============================================================================
// SPLIT PIPELINE — WritingJob state machine
// =============================================================================
// The monolithic writeNextGuide() above runs research -> outline -> write ->
// fact-check -> persist in ONE invocation. That can never finish inside Vercel
// Hobby's 60s function limit (the Opus write alone takes 100-200s), so a guide
// was never actually published. This state machine splits the work so each
// stage runs in its OWN fresh serverless invocation, with intermediate
// artifacts persisted on a WritingJob row:
//
//   research -> gather sources (Sonnet + web_search)          [researchSummary/sources]
//   plan     -> title + meta + intro + section blueprint (Opus) [titleHe/intro/sectionPlan]
//   sections -> write ONE section per invocation (Opus), loops  [sectionContents/sectionIndex]
//   finalize -> assemble + fact-check + lint + persist + mail   [contentHe/generatedGuideId]
//
// Writing one section at a time is what keeps Opus (kept for quality) under the
// 60s limit. Each stage re-dispatches the next via an HTTP POST to
// /api/agents/writer-step, which acknowledges with 202 immediately and does its
// heavy work in `after()`. A daily reaper (resumeStalledWritingJobs) re-dispatches
// any job whose chain was broken by a dropped dispatch.

const STAGE_RETRY_CAP = 2; // dispatch attempts per stage before giving up

/** Resolve the base URL for self-dispatching the worker route. */
function writerBaseUrl(): string {
  if (process.env.WRITER_BASE_URL) return process.env.WRITER_BASE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'https://weccelerate.co.il';
}

/**
 * Fire an HTTP request that advances the given job by one stage. The target
 * route answers 202 immediately and runs the actual stage in its own `after()`,
 * so this returns within milliseconds and never blocks the caller's budget.
 * Best-effort: a dropped dispatch is recovered by resumeStalledWritingJobs.
 */
export async function dispatchWriterStep(jobId: string): Promise<void> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn('[dispatchWriterStep] CRON_SECRET unset — cannot dispatch writer step.');
    return;
  }
  try {
    await fetch(`${writerBaseUrl()}/api/agents/writer-step`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${secret}` },
      body: JSON.stringify({ jobId }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error('[dispatchWriterStep] dispatch failed (job will be retried by reaper):', e);
  }
}

/**
 * Claim the highest-priority open gap not already covered recently, mirroring
 * writeNextGuide's selection but returning the gap instead of writing inline.
 * Atomic claim via updateMany guarded on status:'open' so parallel ticks can't
 * double-claim. Returns null (with diagnostics) when nothing is eligible.
 */
async function claimNextGap(ctx: DailyContext): Promise<
  | { gap: { id: string; query: string; category: string | null; competitors: string[]; severity: number }; skippedDuplicates: number }
  | { gap: null; skippedDuplicates: number; candidates: number }
> {
  const candidates = await prisma.contentGap.findMany({
    where: { status: 'open', severity: { gte: 50 } },
    orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
    take: 50,
  });
  let skippedDuplicates = 0;
  for (const candidate of candidates) {
    if (isQueryAlreadyCovered(candidate.query, ctx)) { skippedDuplicates += 1; continue; }
    const claim = await prisma.contentGap.updateMany({
      where: { id: candidate.id, status: 'open' },
      data: { status: 'in_progress' },
    });
    if (claim.count === 1) {
      return { gap: candidate, skippedDuplicates };
    }
  }
  return { gap: null, skippedDuplicates, candidates: candidates.length };
}

export interface StartJobsResult {
  created: number;
  jobIds: string[];
  reason?: string;
}

/**
 * Entry point for writing days. Reclaims orphans, claims up to `target` gaps,
 * creates a WritingJob per claim, and kicks off each pipeline. Returns fast —
 * the articles complete asynchronously over the following minutes.
 *
 * target defaults to 1: get ONE article reliably published per day first. Raise
 * once the split pipeline has proven itself end-to-end in production.
 */
export async function startWritingJobs(opts?: { context?: DailyContext; target?: number }): Promise<StartJobsResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { created: 0, jobIds: [], reason: 'ANTHROPIC_API_KEY not set — agent disabled' };
  }
  await reclaimOrphanedGaps();

  const ctx = opts?.context ?? (await loadDailyContext());
  const target = Math.max(1, opts?.target ?? 1);
  const jobIds: string[] = [];

  for (let i = 0; i < target; i++) {
    const claim = await claimNextGap(ctx);
    if (!claim.gap) {
      if (jobIds.length === 0) {
        const reason = claim.candidates === 0
          ? 'אין ContentGap פתוח — כל השאילתות מצוטטות מספיק טוב. ממתין ל-Gap Analyzer הבא.'
          : `דילגתי על ${claim.skippedDuplicates} פערים שכבר כתבתי עליהם ב-30 הימים האחרונים. אין נושא חדש היום.`;
        await logDecision({
          agent: 'content-writer',
          action: claim.candidates === 0 ? 'idle' : 'idle-all-covered',
          reasoning: reason,
          payload: { openGaps: claim.candidates, skippedDuplicates: claim.skippedDuplicates },
          success: true,
        });
        return { created: 0, jobIds: [], reason };
      }
      break; // claimed at least one already; queue exhausted for the rest
    }

    const gap = claim.gap;
    const job = await prisma.writingJob.create({
      data: {
        gapId: gap.id,
        query: gap.query,
        category: gap.category ?? null,
        competitors: gap.competitors,
        stage: 'research',
      },
    });
    jobIds.push(job.id);

    await logDecision({
      agent: 'content-writer',
      action: 'picked-gap',
      reasoning:
        `בחרתי לכתוב על "${gap.query}" כי severity=${gap.severity}` +
        (claim.skippedDuplicates > 0 ? ` (דילגתי על ${claim.skippedDuplicates} פערים שכבר כיסיתי)` : '') +
        `. פתחתי WritingJob ${job.id} — הצנרת תרוץ בשלבים נפרדים (research -> plan -> sections -> finalize), סקציה בכל invocation, כדי לא להיחתך ב-timeout.`,
      payload: { gapId: gap.id, jobId: job.id, query: gap.query, severity: gap.severity },
      success: true,
    });
    // No self-dispatch. The external pinger (GET /api/cron/writer-pump, every
    // ~3 min) is the SOLE reliable driver — Vercel's `after()` self-dispatch
    // dropped too often and stalled jobs mid-pipeline. The pump advances this
    // job one step per call until it publishes.
  }

  return { created: jobIds.length, jobIds };
}

/**
 * Pump — the reliable driver for the writer pipeline. Advances up to `maxJobs`
 * non-terminal WritingJobs by ONE step each, picking the oldest first. Designed
 * to be hit every ~3 min by an external pinger (cron-job.org → GET
 * /api/cron/writer-pump), replacing the fragile `after()` self-dispatch that
 * dropped and stalled jobs.
 *
 * Concurrency-safe: a job is only picked if it's been idle > STALE_MS, and we
 * atomically "claim" it (bump updatedAt under a guard) before doing the slow
 * stage work — so an overlapping ping can't grab the same job. Each step
 * recomputes from persisted artifacts, so re-running a step is harmless.
 */
export async function pumpWritingJobs(maxJobs = 1): Promise<{ advanced: string[] }> {
  const STALE_MS = 90 * 1000; // a job untouched this long is free to advance
  const advanced: string[] = [];

  for (let i = 0; i < maxJobs; i++) {
    const cutoff = new Date(Date.now() - STALE_MS);
    const job = await prisma.writingJob.findFirst({
      where: { stage: { notIn: ['done', 'failed'] }, updatedAt: { lt: cutoff } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!job) break;

    // Atomic claim: bump updatedAt (via @updatedAt) only if still stale. If a
    // parallel ping already claimed it, count !== 1 and we skip to avoid
    // double-processing the same step.
    const claim = await prisma.writingJob.updateMany({
      where: { id: job.id, updatedAt: { lt: cutoff } },
      data: { attempts: { increment: 0 } },
    });
    if (claim.count !== 1) continue;

    await advanceWritingJob(job.id);
    advanced.push(job.id);
  }
  return { advanced };
}

/**
 * Daily backstop kept under the old name so the cron import is unchanged: a
 * single pump pass advancing a few jobs. The frequent external pinger does the
 * real work; this just guarantees forward progress even if the pinger is down.
 */
export async function resumeStalledWritingJobs(): Promise<{ resumed: number; jobIds: string[] }> {
  const { advanced } = await pumpWritingJobs(3);
  if (advanced.length > 0) {
    await logDecision({
      agent: 'content-writer',
      action: 'resumed-stalled-jobs',
      reasoning: `קידמתי ${advanced.length} עבודות כתיבה (pump יומי). ה-pinger החיצוני מקדם אותן כל כמה דקות.`,
      payload: { resumed: advanced.length, jobIds: advanced },
      success: true,
    });
  }
  return { resumed: advanced.length, jobIds: advanced };
}

/**
 * Advance ONE job by one stage. Called from /api/agents/writer-step inside
 * `after()`, so it owns a fresh 60s budget. On success it persists the stage
 * artifacts and dispatches the next stage; on error it retries the same stage
 * up to STAGE_RETRY_CAP, then fails the job and reopens the gap.
 */
export async function advanceWritingJob(jobId: string): Promise<void> {
  const job = await prisma.writingJob.findUnique({ where: { id: jobId } });
  if (!job) { console.warn(`[advanceWritingJob] job ${jobId} not found`); return; }
  if (job.stage === 'done' || job.stage === 'failed') return;

  try {
    switch (job.stage) {
      case 'research': {
        const research = await runResearch(job.query, job.competitors);
        await prisma.writingJob.update({
          where: { id: job.id },
          data: { researchSummary: research.summary, sources: research.sources, stage: 'plan', attempts: 0, error: null },
        });
        return; // pump advances to the 'plan' stage on its next pass
      }
      case 'plan': {
        // Opus, ONE call: title + meta + intro + the section blueprint. Small
        // output (~800-1200 tokens) so it finishes well under 60s. The heavy
        // body is written section-by-section in the next stage.
        const ctx = await loadDailyContext();
        const plan = await runArticlePlan(job.query, job.researchSummary ?? '', job.sources, ctx);
        await prisma.writingJob.update({
          where: { id: job.id },
          data: {
            titleHe: plan.titleHe,
            titleEn: plan.titleEn ?? null,
            metaDescription: plan.metaDescription,
            intro: plan.intro,
            sectionPlan: plan.sections,
            sectionIndex: 0,
            sectionContents: [],
            stage: 'sections',
            attempts: 0,
            error: null,
          },
        });
        return; // pump advances to the 'sections' stage on its next pass
      }
      case 'sections': {
        const plan = (job.sectionPlan ?? []) as SectionSpec[];
        let written = (job.sectionContents ?? []) as string[];
        let idx = job.sectionIndex ?? 0;

        // Write as MANY sections as fit in this invocation's time budget, not
        // just one. Each article was 8+ sections = 8+ dispatch hops, and every
        // hop is a chance for the `after()` dispatch to drop and stall the job
        // until the once-daily reaper. Batching sections cuts the hop count
        // (≈ N → ceil(N / sections-per-invocation)), shrinking the stall window.
        //
        // We persist after EACH section so a mid-batch crash never loses
        // completed work (the stage retry / reaper resumes from sectionIndex).
        // SECTIONS_BUDGET_MS leaves headroom under the route's 60s maxDuration
        // for the final DB write + dispatch fetch.
        const SECTIONS_BUDGET_MS = 42_000;
        const batchStart = Date.now();
        while (idx < plan.length && Date.now() - batchStart < SECTIONS_BUDGET_MS) {
          const md = await runSection(job.query, job.titleHe ?? '', plan, idx, job.sources);
          written = [...written, md];
          idx += 1;
          await prisma.writingJob.update({
            where: { id: job.id },
            data: { sectionContents: written, sectionIndex: idx, attempts: 0, error: null },
          });
        }

        // All sections written -> assemble the full markdown body and finalize.
        if (idx >= plan.length) {
          const body = assembleArticle(job.titleHe ?? '', job.intro ?? '', written);
          await prisma.writingJob.update({
            where: { id: job.id },
            data: { contentHe: body, stage: 'finalize', attempts: 0, error: null },
          });
        }
        // pump re-picks this job for the next section batch, or for 'finalize'
        return;
      }
      case 'finalize': {
        await finalizeWritingJob(job);
        return;
      }
      default:
        console.warn(`[advanceWritingJob] unknown stage '${job.stage}' for job ${job.id}`);
    }
  } catch (err) {
    await handleStageError(job, err);
  }
}

type WritingJobRow = NonNullable<Awaited<ReturnType<typeof prisma.writingJob.findUnique>>>;

/**
 * Persist a finished-but-gated article as a DRAFT GeneratedGuide instead of
 * discarding it. Marks the job done (so the pump stops churning on it) and
 * records the reject reason on the gap WITHOUT reopening it — reopening made
 * David rewrite the same topic into the same gate over and over.
 */
async function saveJobAsDraft(
  job: WritingJobRow,
  article: ArticlePayload,
  opts: {
    seoScore: number;
    factCheckScore: number | null;
    internalLinks: string[];
    sources: string[];
    reason: string;
    action: string;
    reasoningHe: string;
  },
): Promise<void> {
  const slug = await deriveUniqueSlug(article.titleHe, article.titleEn);
  const draft = await prisma.generatedGuide.create({
    data: {
      slug,
      titleHe: article.titleHe,
      titleEn: article.titleEn ?? null,
      metaDescription: article.metaDescription,
      category: job.category ?? 'general',
      contentHe: article.contentHe,
      contentEn: null,
      modelChain: [MODEL_RESEARCH, MODEL_WRITE, MODEL_FACTCHECK],
      citedSources: opts.sources.slice(0, 30),
      internalLinks: opts.internalLinks,
      factCheckScore: opts.factCheckScore,
      seoScore: opts.seoScore,
      wordCount: countWords(article.contentHe),
      status: 'draft',
      publishedAt: null,
    },
  });
  await prisma.writingJob.update({
    where: { id: job.id },
    data: { stage: 'done', generatedGuideId: draft.id, error: opts.reason },
  });
  await prisma.contentGap.update({
    where: { id: job.gapId },
    data: { generatedGuideId: draft.id, rejectReason: opts.reason },
  });
  await logDecision({
    agent: 'content-writer',
    action: opts.action,
    reasoning: `${opts.reasoningHe} slug: /guides/${slug} (draft).`,
    payload: { jobId: job.id, gapId: job.gapId, draftId: draft.id, slug, reason: opts.reason },
    success: false,
  });
}

/** Fact-check + lint + persist the draft held on a finalize-stage job. */
async function finalizeWritingJob(job: WritingJobRow): Promise<void> {
  // Sanitize the assembled body here — the section writers can still slip an
  // em-dash through despite the system prompt, and the body was stitched from
  // many calls without passing the per-article sanitizer.
  const article: ArticlePayload = sanitizeArticleBody({
    titleHe: job.titleHe ?? '',
    titleEn: job.titleEn ?? null,
    metaDescription: job.metaDescription ?? '',
    contentHe: job.contentHe ?? '',
    contentEn: null,
  });
  if (!article.titleHe || !article.contentHe) {
    throw new Error('finalize: draft missing titleHe/contentHe (sections stage did not assemble).');
  }

  const sources = job.sources ?? [];
  const internalLinks = pickInternalLinks(article.titleHe, article.contentHe);
  const seoLint = lintSeo(article);
  const policyLint = lintPolicy(article);

  // Policy gate — save as DRAFT for human review, don't discard.
  // These violations are usually one fixable sentence (e.g. a specific NIS
  // price the model invented). Failing the job threw away a complete 8-9
  // section article AND reopened the gap, so David rewrote the same topic
  // and hit the same wall — three articles died in that loop before this
  // was changed. A draft costs nothing and keeps the work.
  if (!policyLint.passed) {
    await saveJobAsDraft(job, article, {
      seoScore: seoLint.score,
      factCheckScore: null,
      internalLinks,
      sources,
      reason: `Policy: ${policyLint.violations.join('; ')}`,
      action: 'saved-draft-policy',
      reasoningHe:
        `שמרתי את המאמר על "${job.query}" כטיוטה (לא פורסם) — הפר כללי כתיבה: ${policyLint.violations.join('; ')}. ` +
        `בדרך כלל זה משפט אחד לתיקון. עבור עליו ופרסם ידנית.`,
    });
    return;
  }

  const factCheck = await runFactCheck(article.contentHe, sources);

  // Unparseable fact-check -> save as draft for manual review (don't auto-ship).
  if (factCheck.unparsed) {
    const slug = await deriveUniqueSlug(article.titleHe, article.titleEn);
    const draft = await prisma.generatedGuide.create({
      data: {
        slug,
        titleHe: article.titleHe,
        titleEn: article.titleEn ?? null,
        metaDescription: article.metaDescription,
        category: job.category ?? 'general',
        contentHe: article.contentHe,
        contentEn: null,
        modelChain: [MODEL_RESEARCH, MODEL_WRITE, MODEL_FACTCHECK],
        citedSources: sources.slice(0, 30),
        internalLinks,
        factCheckScore: null,
        seoScore: seoLint.score,
        wordCount: countWords(article.contentHe),
        status: 'draft',
        publishedAt: null,
      },
    });
    await prisma.writingJob.update({ where: { id: job.id }, data: { stage: 'done', generatedGuideId: draft.id } });
    await prisma.contentGap.update({
      where: { id: job.gapId },
      data: { generatedGuideId: draft.id, rejectReason: 'Fact-check unparseable; saved as draft for review.' },
    });
    await logDecision({
      agent: 'content-writer',
      action: 'saved-draft-unparsed-factcheck',
      reasoning: `שמרתי את המאמר על "${job.query}" כטיוטה — fact-check לא החזיר JSON תקין. עבור עליו ב-/admin. slug: /guides/${slug}.`,
      payload: { jobId: job.id, gapId: job.gapId, draftId: draft.id, slug },
      success: false,
    });
    return;
  }

  // Quality gate — below the floor the article is saved as DRAFT, not
  // discarded (same rationale as the policy gate above: a 55/100 article is
  // an edit away from publishable, not garbage).
  const QUALITY_FLOOR = 60;
  if (factCheck.score < QUALITY_FLOOR || seoLint.score < QUALITY_FLOOR) {
    await saveJobAsDraft(job, article, {
      seoScore: seoLint.score,
      factCheckScore: factCheck.score,
      internalLinks,
      sources,
      reason: `Quality below ${QUALITY_FLOOR} (fact ${factCheck.score}, seo ${seoLint.score})`,
      action: 'saved-draft-quality',
      reasoningHe:
        `שמרתי את המאמר על "${job.query}" כטיוטה (לא פורסם). ` +
        `Fact-check ${factCheck.score}/100, SEO ${seoLint.score}/100 (סף ${QUALITY_FLOOR}). עבור עליו ופרסם ידנית.`,
    });
    return;
  }

  // Publish.
  const slug = await deriveUniqueSlug(article.titleHe, article.titleEn);
  const generated = await prisma.generatedGuide.create({
    data: {
      slug,
      titleHe: article.titleHe,
      titleEn: article.titleEn ?? null,
      metaDescription: article.metaDescription,
      category: job.category ?? 'general',
      contentHe: article.contentHe,
      contentEn: null,
      modelChain: [MODEL_RESEARCH, MODEL_WRITE, MODEL_FACTCHECK],
      citedSources: sources.slice(0, 30),
      internalLinks,
      factCheckScore: factCheck.score,
      seoScore: seoLint.score,
      wordCount: countWords(article.contentHe),
      status: 'published',
      publishedAt: new Date(),
    },
  });

  await prisma.writingJob.update({ where: { id: job.id }, data: { stage: 'done', generatedGuideId: generated.id, error: null } });
  await prisma.contentGap.update({
    where: { id: job.gapId },
    data: { status: 'published', generatedGuideId: generated.id, resolvedAt: new Date() },
  });

  pingIndexNow(`https://weccelerate.co.il/guides/${slug}`).catch(() => {});

  notifyKatrinAboutArticle({
    titleHe: article.titleHe,
    slug,
    bodyExcerpt: article.contentHe,
    sourceQuery: job.query,
    category: job.category,
    wordCount: countWords(article.contentHe),
  }).catch((e) => console.error('[notifyKatrinAboutArticle] failed:', e));

  await logDecision({
    agent: 'content-writer',
    action: 'wrote-guide',
    reasoning:
      `פרסמתי "${article.titleHe}" -> /guides/${slug}. ` +
      `${countWords(article.contentHe)} מילים, ${sources.length} מקורות, ` +
      `Fact-check ${factCheck.score}/100, SEO ${seoLint.score}/100, ${internalLinks.length} קישורים פנימיים. דחפתי ל-IndexNow.`,
    payload: { jobId: job.id, gapId: job.gapId, guideId: generated.id, slug, wordCount: countWords(article.contentHe) },
    success: true,
  });
}

/** Retry the current stage up to the cap, else fail the job and reopen the gap. */
async function handleStageError(job: WritingJobRow, err: unknown): Promise<void> {
  const reason = err instanceof Error ? err.message : String(err);
  const attempts = (job.attempts ?? 0) + 1;

  if (attempts <= STAGE_RETRY_CAP) {
    // Bump attempts + error and return. The error update refreshes updatedAt,
    // so the pump waits out STALE_MS before re-picking this job and retrying
    // the same stage from persisted artifacts (no self-dispatch).
    await prisma.writingJob.update({ where: { id: job.id }, data: { attempts, error: reason.slice(0, 1_000) } });
    return;
  }

  await prisma.writingJob.update({ where: { id: job.id }, data: { stage: 'failed', error: reason.slice(0, 1_000) } });
  await prisma.contentGap.update({
    where: { id: job.gapId },
    data: { status: 'open', rejectReason: `Writer failed at ${job.stage}: ${reason.slice(0, 500)}` },
  });
  await logDecision({
    agent: 'content-writer',
    action: 'failed',
    reasoning: `נכשל בשלב ${job.stage} על "${job.query}" אחרי ${attempts} נסיונות. סיבה: ${reason.slice(0, 200)}. הפער חוזר לתור.`,
    payload: { jobId: job.id, gapId: job.gapId, stage: job.stage, error: reason },
    success: false,
  });
}

// --- Chunked-writing stage helpers (Opus, one section per invocation) --------

interface SectionSpec { heading: string; brief: string }

interface ArticlePlan {
  titleHe: string;
  titleEn?: string | null;
  metaDescription: string;
  intro: string;
  sections: SectionSpec[];
}

/**
 * Plan stage — Opus, ONE small call: produce title + meta + intro + the section
 * blueprint (headings + one-line briefs). Deliberately does NOT write section
 * bodies, so the output stays ~800-1200 tokens and finishes well under 60s.
 */
async function runArticlePlan(
  query: string,
  summary: string,
  sources: string[],
  ctx?: DailyContext,
): Promise<ArticlePlan> {
  const recentGuidesBlock = ctx
    ? `\n\n---\n\n${summarizeRecentGuidesForPrompt(ctx)}\n\nאל תכתוב על נושא שכבר כוסה — אם כן, זווית שונה לחלוטין. אסור לחזור על אותו H1.\n`
    : '';

  const data = await callAnthropic({
    model: MODEL_WRITE,
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `${DAVID_WRITING_RULES_HE}

---

עובדות מאומתות על WeCcelerate (אלה המספרים היחידים שמותר לציין):
${JSON.stringify(VERIFIED_FACTS, null, 2)}${recentGuidesBlock}

---

תכנן מדריך SEO בעברית לשאילתה: "${query}"

סיכום מחקר:
${summary}

מקורות:
${sources.slice(0, 10).join('\n')}

החזר JSON בלבד — תוכנית קצרה, בלי לכתוב את גוף הסקציות:
{
  "titleHe": "כותרת citation-bait, 25-65 תווים",
  "titleEn": "אופציונלי",
  "metaDescription": "150-160 תווים, value-prop לא הבטחה",
  "intro": "פסקת פתיחה אחת בעברית (80-140 מילים), בלי כותרת H1, עם משפט citation-bait",
  "sections": [{ "heading": "## כותרת סקציה", "brief": "במשפט-שניים: מה הסקציה מכסה" }]
}

חוקים לתוכנית:
- 5-7 סקציות תוכן.
- הסקציה לפני-האחרונה חייבת להיות בדיוק "## שאלות נפוצות" (הבריף יציין: 5-7 שאלות ותשובות).
- הסקציה האחרונה חייבת להיות בדיוק "## איך WeCcelerate יכולה לעזור" (תיאור-שירות, לא הבטחה).
- כל heading בעברית, ממוקד, בלי מספור.`,
      },
    ],
  });

  const parsed = safeParseJson<ArticlePlan>(extractText(data));
  if (!parsed?.titleHe || !parsed.intro || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Article plan returned malformed JSON');
  }
  parsed.sections = parsed.sections
    .filter((s) => s && typeof s.heading === 'string')
    .map((s) => ({ heading: s.heading.trim().startsWith('#') ? s.heading.trim() : `## ${s.heading.trim()}`, brief: s.brief ?? '' }));
  if (parsed.sections.length === 0) throw new Error('Article plan produced no usable sections');
  return parsed;
}

/**
 * Sections stage — Opus writes EXACTLY ONE section (~300-450 words, ~30-45s)
 * given the full blueprint for context. Called once per section by the state
 * machine, each in its own fresh 60s invocation. Returns plain section markdown.
 */
async function runSection(
  query: string,
  titleHe: string,
  plan: SectionSpec[],
  idx: number,
  sources: string[],
): Promise<string> {
  const section = plan[idx];
  const blueprint = plan
    .map((s, i) => `${i + 1}. ${s.heading}${i === idx ? '   <-- כתוב את זו עכשיו' : ''}`)
    .join('\n');
  const allowedSlugs = (GUIDES as readonly Guide[]).map((g) => g.slug).join(', ');
  const isFaq = section.heading.includes('שאלות נפוצות');
  const isHelp = section.heading.includes('WeCcelerate');

  const data = await callAnthropic({
    model: MODEL_WRITE,
    max_tokens: 1600,
    messages: [
      {
        role: 'user',
        content: `${DAVID_WRITING_RULES_HE}

---

אתה כותב סקציה אחת בלבד מתוך מדריך SEO בעברית בשם "${titleHe}" (שאילתה: "${query}").

מבנה המדריך המלא (להקשר ורצף — אל תכתוב את כולן, רק את המסומנת):
${blueprint}

כתוב עכשיו אך ורק את הסקציה:
${section.heading}
מה לכסות: ${section.brief}

דרישות:
- התחל בדיוק עם הכותרת "${section.heading}", ואז גוף הסקציה.
- 250-450 מילים בעברית (RTL).
- משפט אחד citation-bait (הגדרה/עובדה כללית מהתחום — לא על WeCcelerate ספציפית).
- קישורים פנימיים מותר רק בפורמט [טקסט](/guides/SLUG) ל-slugs הבאים: ${allowedSlugs}
${isFaq ? '- זו סקציית FAQ: 5-7 שאלות ותשובות. התשובות בלשון תיאור-שירות, לא הבטחה.' : ''}
${isHelp ? '- תאר את הvalue שהיזם מקבל מהשירותים, בלשון "אנחנו מציעים", לא "אנחנו עושים/נביא".' : ''}
- בלי מקפים ארוכים. בלי להמציא נתונים על WeCcelerate.

מקורות (צטט כשרלוונטי, רק חיצוניים):
${sources.slice(0, 8).join('\n')}

החזר רק את ה-markdown של הסקציה. בלי JSON, בלי הקדמות, בלי הסברים.`,
      },
    ],
  });

  const md = extractText(data).trim();
  if (!md) throw new Error(`Section ${idx} ("${section.heading}") came back empty`);
  return md;
}

/** Stitch the H1, intro, and rendered sections into the final article markdown. */
function assembleArticle(titleHe: string, intro: string, sections: string[]): string {
  const body = sections.map((s) => s.trim()).filter(Boolean).join('\n\n');
  return `# ${titleHe.trim()}\n\n${intro.trim()}\n\n${body}`;
}
