/**
 * דוד's biweekly retrospective + replan.
 *
 * Every 14 days, after collecting two weeks of journal entries, David runs
 * an LLM-powered retrospective:
 *   1. Read all wins + failures from the past 14 days.
 *   2. Ask Claude Sonnet to draw conclusions: which themes worked, which
 *      didn't, what to do differently.
 *   3. Output a structured Hebrew memo with:
 *      - תזת השבועיים הבאים (a 1-paragraph theme)
 *      - כיווני תוכן להעמיק (categories to invest in)
 *      - כיווני תוכן להאט (categories to deprioritize)
 *      - שאילתות חדשות שכדאי להוסיף ל-probe pool
 *      - אזהרות על דפוסים בעייתיים
 *   4. Save as an `AgentDecision` row with action='biweekly-replan' so the
 *      operator can see it in the dashboard, and so future runs know when
 *      the last replan happened.
 *
 * The static daily-plan stays in code; this replan is a *strategic memo*
 * that informs (but doesn't replace) the writer's prompt and the operator's
 * priorities. Lightweight by design — we don't want a runaway autonomous
 * strategy generator.
 */

import { prisma } from '@/lib/db';
import { logDecision } from './decision-log';
import { loadJournal, type JournalSummary } from './journal';

const REPLAN_INTERVAL_DAYS = 14;
const MODEL_REPLAN = 'claude-sonnet-4-6';

export interface BiweeklyPlanOutput {
  theme: string;
  invest: string[];     // categories / topics to lean into
  deprioritize: string[]; // categories / topics to slow down on
  newQueries: string[]; // probe queries worth adding
  warnings: string[];
  rawMemo: string;      // the full Hebrew memo, for display
}

export interface ReplanResult {
  ok: boolean;
  reason?: string;
  plan?: BiweeklyPlanOutput;
  /** True if we ran a fresh replan; false if the last one is still fresh enough. */
  fresh?: boolean;
}

/**
 * Returns true if it's time for a new replan (no replan in the last 14 days).
 */
export async function shouldRunReplan(now: Date = new Date()): Promise<boolean> {
  try {
    const last = await prisma.agentDecision.findFirst({
      where: { action: 'biweekly-replan' },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });
    if (!last) return true;
    const ageDays = (now.getTime() - last.timestamp.getTime()) / 86_400_000;
    return ageDays >= REPLAN_INTERVAL_DAYS;
  } catch {
    return false;
  }
}

/**
 * Loads the most recent biweekly replan (or null if there isn't one yet).
 * Used by the dashboard to display the latest strategic memo.
 */
export async function loadLatestReplan(): Promise<{
  date: Date;
  plan: BiweeklyPlanOutput;
} | null> {
  try {
    const last = await prisma.agentDecision.findFirst({
      where: { action: 'biweekly-replan' },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, payload: true, reasoning: true },
    });
    if (!last) return null;
    const payload = (last.payload ?? {}) as Partial<BiweeklyPlanOutput>;
    return {
      date: last.timestamp,
      plan: {
        theme: payload.theme ?? '',
        invest: payload.invest ?? [],
        deprioritize: payload.deprioritize ?? [],
        newQueries: payload.newQueries ?? [],
        warnings: payload.warnings ?? [],
        rawMemo: payload.rawMemo ?? last.reasoning,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Run the biweekly replan. Pulls the journal, asks Claude for conclusions,
 * persists the result. Idempotent: if shouldRunReplan() is false, returns
 * `{ ok: true, fresh: false }` and does nothing.
 */
export async function runBiweeklyReplan(): Promise<ReplanResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, reason: 'ANTHROPIC_API_KEY missing — replanner disabled' };
  }

  if (!(await shouldRunReplan())) {
    return { ok: true, fresh: false, reason: 'Last replan still fresh (<14d ago)' };
  }

  const journal = await loadJournal();

  // Pull supporting numbers — we want the LLM to see the actual scoreboard,
  // not just titles.
  const last14d = new Date(Date.now() - 14 * 86_400_000);
  let citationStats: Array<{ provider: string; rate: number; total: number }> = [];
  let publishedCount = 0;
  try {
    const stats = await prisma.$queryRaw<Array<{ provider: string; total: bigint; cited: bigint }>>`
      SELECT provider,
             COUNT(*)::bigint AS total,
             SUM(CASE WHEN cited THEN 1 ELSE 0 END)::bigint AS cited
      FROM geo_probes
      WHERE timestamp >= ${last14d} AND error IS NULL
      GROUP BY provider
    `;
    citationStats = stats.map((r) => ({
      provider: r.provider,
      total: Number(r.total),
      rate: Number(r.total) > 0 ? Math.round((Number(r.cited) / Number(r.total)) * 100) : 0,
    }));
    publishedCount = await prisma.generatedGuide.count({
      where: { status: 'published', publishedAt: { gte: last14d } },
    });
  } catch {
    // ignore
  }

  const prompt = buildReplanPrompt(journal, citationStats, publishedCount);

  let memo: string;
  try {
    const data = await callAnthropic(prompt);
    memo = extractText(data);
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: `Claude call failed: ${err}` };
  }

  const plan = parseReplanMemo(memo);

  await logDecision({
    agent: 'self-improver',
    action: 'biweekly-replan',
    reasoning: plan.theme || memo.slice(0, 500),
    payload: { ...plan },
    success: true,
  });

  return { ok: true, fresh: true, plan };
}

// =============================================================================
// PROMPT
// =============================================================================

function buildReplanPrompt(
  journal: JournalSummary,
  citationStats: Array<{ provider: string; rate: number; total: number }>,
  publishedCount: number,
): { model: string; system: string; user: string } {
  const winsBlock = journal.wins.length
    ? journal.wins.slice(0, 10).map((w) => `- ${w.title} — ${w.detail}`).join('\n')
    : '(אין wins ב-14 ימים אחרונים)';
  const failsBlock = journal.failures.length
    ? journal.failures.slice(0, 10).map((f) => {
        const repeat = f.repeatCount > 1 ? ` [חזר ${f.repeatCount}x]` : '';
        return `- ${f.title}${repeat} — ${f.detail.slice(0, 200)}`;
      }).join('\n')
    : '(אין כישלונות ב-14 ימים אחרונים)';
  const statsBlock = citationStats.length
    ? citationStats.map((s) => `${s.provider}: ${s.rate}% (${s.total} probes)`).join(' · ')
    : '(אין נתוני probe)';

  return {
    model: MODEL_REPLAN,
    system:
      'אתה דוד — אייג\'נט SEO/GEO/AEO של WeCcelerate. כל שבועיים אתה מבצע retrospective ומכין תוכנית אסטרטגית ל-14 הימים הבאים. אתה כותב בעברית, ישירות, בלי בולשיט. החלטות מבוססות על נתונים, לא על תיאוריות.',
    user: `## נתונים מ-14 הימים האחרונים

מאמרים שפרסמתי: ${publishedCount}
ציטוטים לפי ספק: ${statsBlock}

### ✅ הצלחות:
${winsBlock}

### ❌ כישלונות:
${failsBlock}

### 💡 תובנות אוטומטיות:
${journal.insights.length ? journal.insights.map((i) => `- ${i}`).join('\n') : '(אין)'}

---

## מה אני צריך ממך עכשיו

הכן memo אסטרטגי קצר ל-14 הימים הבאים. החזר JSON בדיוק במבנה הזה (בלי טקסט מסביב):

{
  "theme": "משפט אחד שמסכם את הפוקוס של השבועיים הקרובים",
  "invest": ["3-5 פריטים — כיוונים שכדאי להעמיק בהם בגלל מה שעבד"],
  "deprioritize": ["1-3 פריטים — כיוונים שכדאי להאט בגללם"],
  "newQueries": ["1-3 שאילתות חדשות לpool ה-probe שכדאי להוסיף, על בסיס מגמות חדשות"],
  "warnings": ["1-3 דפוסים מסוכנים שזיהית — לדוגמה הפרת policy חוזרת על אותו נושא"],
  "rawMemo": "פסקה אחת בעברית בולטת שמסבירה את ההיגיון מאחורי ההחלטות"
}

חוקים:
- בלי להמציא מספרים על WeCcelerate
- בלי להבטיח תוצאות
- אם אין מספיק נתונים — תגיד את זה ב-theme
- אסור לדחוף משימות שאין להן בסיס בנתונים`,
  };
}

// =============================================================================
// PARSING
// =============================================================================

function parseReplanMemo(text: string): BiweeklyPlanOutput {
  // Try to find a JSON block.
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const empty: BiweeklyPlanOutput = {
    theme: '',
    invest: [],
    deprioritize: [],
    newQueries: [],
    warnings: [],
    rawMemo: text.slice(0, 2000),
  };
  if (!jsonMatch) return empty;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Partial<BiweeklyPlanOutput>;
    return {
      theme: typeof parsed.theme === 'string' ? parsed.theme : '',
      invest: Array.isArray(parsed.invest) ? parsed.invest.filter((x): x is string => typeof x === 'string') : [],
      deprioritize: Array.isArray(parsed.deprioritize) ? parsed.deprioritize.filter((x): x is string => typeof x === 'string') : [],
      newQueries: Array.isArray(parsed.newQueries) ? parsed.newQueries.filter((x): x is string => typeof x === 'string') : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.filter((x): x is string => typeof x === 'string') : [],
      rawMemo: typeof parsed.rawMemo === 'string' ? parsed.rawMemo : text.slice(0, 2000),
    };
  } catch {
    return empty;
  }
}

// =============================================================================
// ANTHROPIC HTTP
// =============================================================================

async function callAnthropic(req: { model: string; system: string; user: string }): Promise<unknown> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: 1500,
      system: req.system,
      messages: [{ role: 'user', content: req.user }],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

function extractText(data: unknown): string {
  const d = data as { content?: Array<{ type: string; text?: string }> };
  if (!d?.content) return '';
  return d.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n');
}
