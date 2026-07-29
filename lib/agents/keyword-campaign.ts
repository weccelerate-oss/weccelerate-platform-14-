/**
 * Keyword Campaign — turns the content plan into writing work, on demand.
 * =======================================================================
 *
 * WHY THIS EXISTS SEPARATELY FROM gap-analyzer.ts
 *
 * David's original topic queue had exactly one source: the GEO probe. Every
 * ContentGap came from "an LLM was asked one of our 28 strategic queries and
 * didn't cite us". That is a fine *reactive* signal and a terrible *coverage*
 * mechanism — it can only ever surface topics we already thought to probe.
 *
 * The owner's keyword research (183 phrases, 16,220 monthly searches) is the
 * proactive half. This module is its entry point into the pipeline: it takes
 * the deterministic plan from topic-strategy.ts, optionally deepens each brief
 * with an LLM expansion pass, and writes ContentGap rows the existing writer
 * already knows how to consume.
 *
 * DESIGN NOTES
 *
 * - Idempotent. Re-running never duplicates: gaps are keyed on the brief id
 *   carried in `brief.id`, and an existing row for that brief is updated in
 *   place rather than re-inserted. Safe to run on every deploy.
 *
 * - severity = brief.priority (50-100). That is deliberate: the writer's gap
 *   picker filters `severity >= 50` and orders by severity desc, so campaign
 *   briefs slot into the SAME priority queue as probe gaps with no special
 *   casing. A severity-100 "we are invisible for this query" probe gap and a
 *   severity-100 "1,410 monthly searches" pillar compete on equal footing,
 *   which is the correct trade.
 *
 * - The LLM expansion is OPTIONAL and degrades cleanly. Without an API key (or
 *   on any failure) the campaign still seeds with the deterministic template
 *   questions. Coverage never depends on a network call succeeding.
 */

import { prisma } from '@/lib/db';
import { logDecision } from './decision-log';
import {
  buildContentPlan,
  keywordCoverage,
  type ArticleBrief,
} from './topic-strategy';

const MODEL_EXPAND = 'claude-sonnet-4-6';

// =============================================================================
// LLM EXPANSION — infer the questions no template could predict
// =============================================================================

/**
 * Ask Claude what a real Israeli founder would ALSO ask around this brief.
 *
 * The template engine in topic-strategy.ts produces reliable, grammatical
 * questions — but by construction it can only permute the phrases we already
 * have. It will never produce "מי הבעלים של הקוד אם נפרדים מהספק?" because
 * nothing in the research file hints at it. That question is exactly the kind
 * an answer engine gets asked and exactly the kind we want to own.
 *
 * Returns the merged question list (templates first, inferred appended, capped)
 * plus any extra long-tail phrases worth weaving into the body. Returns the
 * input unchanged on any failure — this is an enhancement, never a dependency.
 */
export async function expandBriefWithLlm(brief: ArticleBrief): Promise<ArticleBrief> {
  if (!process.env.ANTHROPIC_API_KEY) return brief;

  const prompt = `אתה אסטרטג תוכן של WeCcelerate, Venture Builder ישראלי.

אנחנו כותבים מאמר בעברית שמכוון לביטוי המדויק: "${brief.primaryKeyword}"
כוונת החיפוש: ${brief.intent}
זווית המאמר: ${brief.angleHe}

ביטויים נוספים מאותו אשכול שהמאמר צריך לכסות:
${brief.secondaryKeywords.slice(0, 12).map((k) => `- ${k}`).join('\n') || '- (אין)'}

שאלות שכבר יש לנו (נוצרו אוטומטית מתבניות):
${brief.targetQuestions.map((q) => `- ${q}`).join('\n')}

המשימה שלך: לחשוב מה יזם ישראלי אמיתי ישאל את ChatGPT או את גוגל בנושא הזה
שהרשימה שלמעלה לא מכסה. תתמקד בשאלות שהתשובה עליהן מסוכנת אם היא שגויה -
כסף, בעלות, רגולציה, זמן, טעויות שעולות ביוקר. ספציפיות לישראל עדיפה
(רשות החדשנות, רשם החברות, מע"מ, תקנות ניירות ערך, ועדת הלסינקי, וכו').

אל תחזור על שאלות שכבר ברשימה ואל תנסח מחדש אותה שאלה.

בנוסף: השאלות הקיימות נוצרו מתבניות אוטומטיות, ולכן חלקן יוצאות לא הגיוניות
לנושא הזה (למשל "כמה זמן לוקח משקיע כשיר?" - שאלה שאף אחד לא שואל). סמן ב-drop
כל שאלה קיימת שנשמעת לא טבעית בעברית או לא מתאימה לנושא. העתק אותה בדיוק
כפי שהיא מופיעה למעלה.

החזר JSON בלבד:
{
  "questions": ["6-10 שאלות חדשות, כל אחת שאלה מלאה בעברית עם סימן שאלה"],
  "drop": ["שאלות קיימות שצריך להסיר, מועתקות מילה-במילה"],
  "longTail": ["3-6 ביטויי חיפוש נוספים שסביר שנחפשים ולא מופיעים ברשימה"]
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_EXPAND,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) return brief;

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = (data.content ?? [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text!)
      .join('\n');

    const parsed = parseJsonBlock<{ questions?: string[]; drop?: string[]; longTail?: string[] }>(text);
    if (!parsed) return brief;

    const inferred = (parsed.questions ?? [])
      .filter((q) => typeof q === 'string' && q.trim().length > 8)
      .map((q) => q.trim());
    const longTail = (parsed.longTail ?? [])
      .filter((k) => typeof k === 'string' && k.trim().length > 3)
      .map((k) => k.trim());

    // Prune template questions the model judged unnatural. The generator can
    // only permute phrases, so for some topics it emits questions nobody would
    // ask ("כמה זמן לוקח משקיע כשיר?"). Those would otherwise be forced into
    // the FAQ verbatim, since verbatim phrasing is exactly what we instruct.
    // Guard rail: never drop below 4 questions, so a model that over-prunes
    // (or misreads the instruction) cannot gut the AEO surface.
    const dropSet = new Set(
      (parsed.drop ?? [])
        .filter((q): q is string => typeof q === 'string')
        .map((q) => q.trim().toLowerCase().replace(/[?.!]+$/, '')),
    );
    const kept = brief.targetQuestions.filter(
      (q) => !dropSet.has(q.trim().toLowerCase().replace(/[?.!]+$/, '')),
    );
    const surviving = kept.length >= 4 ? kept : brief.targetQuestions;

    return {
      ...brief,
      // Surviving templates first: they are the phrasings closest to measured
      // demand. Inferred questions extend reach into what only a human asks.
      targetQuestions: dedupe([...surviving, ...inferred]).slice(0, 16),
      secondaryKeywords: dedupe([...brief.secondaryKeywords, ...longTail]),
    };
  } catch {
    return brief; // enhancement only — never block seeding on this
  }
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase().replace(/[?.!]+$/, '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item.trim());
  }
  return out;
}

function parseJsonBlock<T>(text: string): T | null {
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

// =============================================================================
// SEEDING
// =============================================================================

export interface SeedResult {
  planned: number;
  created: number;
  updated: number;
  skippedAlreadyWritten: number;
  expanded: number;
  coverage: ReturnType<typeof keywordCoverage>;
}

/**
 * Write the content plan into ContentGap rows.
 *
 * @param opts.expand      run the LLM expansion pass per brief (costs ~1 Sonnet
 *                         call each; set false for a dry, free seed)
 * @param opts.limit       cap how many briefs to seed (highest priority first)
 * @param opts.onProgress  called per brief so a CLI can render a progress line
 */
export async function seedKeywordCampaign(opts?: {
  expand?: boolean;
  limit?: number;
  onProgress?: (done: number, total: number, brief: ArticleBrief) => void;
}): Promise<SeedResult> {
  const expand = opts?.expand ?? true;
  const plan = buildContentPlan();
  const briefs = opts?.limit ? plan.slice(0, opts.limit) : plan;

  const result: SeedResult = {
    planned: briefs.length,
    created: 0,
    updated: 0,
    skippedAlreadyWritten: 0,
    expanded: 0,
    coverage: keywordCoverage(),
  };

  for (let i = 0; i < briefs.length; i++) {
    let brief = briefs[i];

    // A brief whose gap already produced a published guide is done. Don't
    // reopen it — that is the loop that had David rewriting the same topic.
    const existing = await findGapForBrief(brief.id);
    if (existing && existing.status === 'published') {
      result.skippedAlreadyWritten += 1;
      opts?.onProgress?.(i + 1, briefs.length, brief);
      continue;
    }

    if (expand) {
      const before = brief.targetQuestions.length;
      brief = await expandBriefWithLlm(brief);
      if (brief.targetQuestions.length > before) result.expanded += 1;
    }

    const data = {
      source: 'keyword-campaign',
      query: campaignQueryFor(brief),
      category: brief.category,
      severity: brief.priority,
      competitors: [] as string[],
      brief: brief as unknown as object,
    };

    if (existing) {
      await prisma.contentGap.update({
        where: { id: existing.id },
        // Reset a previously-failed row back to open so a re-seed retries it,
        // but never touch one that is mid-flight (in_progress) — that would
        // let a second job claim the same topic.
        data: existing.status === 'in_progress' ? data : { ...data, status: 'open', rejectReason: null },
      });
      result.updated += 1;
    } else {
      await prisma.contentGap.create({ data });
      result.created += 1;
    }

    opts?.onProgress?.(i + 1, briefs.length, brief);
  }

  await logDecision({
    agent: 'content-writer',
    action: 'seeded-keyword-campaign',
    reasoning:
      `טענתי את תוכנית התוכן ממחקר הביטויים: ${result.planned} מאמרים מתוכננים ` +
      `(${result.coverage.pillars} עמודי עוגן + ${result.coverage.clusters} עמודי אשכול), ` +
      `שמכסים ${result.coverage.routedKeywords}/${result.coverage.totalKeywords} ביטויים ` +
      `בנפח חיפוש כולל של ${result.coverage.totalVolume} בחודש. ` +
      `נוצרו ${result.created}, עודכנו ${result.updated}, דילגתי על ${result.skippedAlreadyWritten} שכבר פורסמו. ` +
      `${result.expanded} בריפים הועשרו בשאלות שנגזרו מחשיבה על מה שהמשתמש באמת ישאל.`,
    payload: {
      planned: result.planned,
      created: result.created,
      updated: result.updated,
      skipped: result.skippedAlreadyWritten,
      expanded: result.expanded,
      keywords: result.coverage.totalKeywords,
      orphans: result.coverage.orphanKeywords.length,
      volume: result.coverage.totalVolume,
    },
    success: true,
  });

  return result;
}

/**
 * The `query` stored on the gap. It doubles as the writer's research prompt and
 * as the human-readable label in the daily report, so it must read like a real
 * search — the primary keyword verbatim, since that is exactly what we want to
 * rank for and exactly what the researcher should go read about.
 */
function campaignQueryFor(brief: ArticleBrief): string {
  return brief.primaryKeyword;
}

/** Find the gap previously seeded for a brief id, if any. */
async function findGapForBrief(briefId: string) {
  const rows = await prisma.contentGap.findMany({
    where: { source: 'keyword-campaign' },
    select: { id: true, status: true, brief: true },
  });
  return rows.find((r: { brief: unknown }) => (r.brief as { id?: string } | null)?.id === briefId) ?? null;
}

// =============================================================================
// STATUS
// =============================================================================

export interface CampaignStatus {
  totalBriefs: number;
  seeded: number;
  open: number;
  inProgress: number;
  published: number;
  /** Keyword phrases with no published article behind them yet. */
  uncoveredKeywords: string[];
  /** Monthly search volume already served by a published article. */
  volumeCovered: number;
  volumeTotal: number;
}

/** What the campaign has actually delivered so far. Read-only. */
export async function campaignStatus(): Promise<CampaignStatus> {
  const plan = buildContentPlan();
  const coverage = keywordCoverage();

  const gaps = await prisma.contentGap.findMany({
    where: { source: 'keyword-campaign' },
    select: { status: true, brief: true },
  });

  const statusByBrief = new Map<string, string>();
  for (const g of gaps) {
    const id = (g.brief as { id?: string } | null)?.id;
    if (id) statusByBrief.set(id, g.status);
  }

  const uncovered: string[] = [];
  let volumeCovered = 0;
  for (const brief of plan) {
    if (statusByBrief.get(brief.id) === 'published') {
      volumeCovered += brief.volume;
    } else {
      uncovered.push(brief.primaryKeyword, ...brief.secondaryKeywords);
    }
  }

  return {
    totalBriefs: plan.length,
    seeded: statusByBrief.size,
    open: gaps.filter((g: { status: string }) => g.status === 'open').length,
    inProgress: gaps.filter((g: { status: string }) => g.status === 'in_progress').length,
    published: gaps.filter((g: { status: string }) => g.status === 'published').length,
    uncoveredKeywords: uncovered,
    volumeCovered,
    volumeTotal: coverage.totalVolume,
  };
}
