/**
 * Generate a LinkedIn post draft for a newly-published article.
 *
 * The post is sent to Katrin's inbox so she can copy-paste it into
 * LinkedIn herself (we don't auto-post — humans publish, machines draft).
 *
 * Tone goals:
 *   - Hebrew, RTL
 *   - Reads like an Israeli operator wrote it, not an LLM
 *   - No em-dashes / en-dashes (explicit forbidden tokens)
 *   - No corporate-AI tells ('בעולם של היום', 'חשוב לציין', 'לסיכום')
 *   - Hook in line 1, concrete insight in lines 2-5, CTA + link at end
 *
 * GEO/AEO angle: every post that resurfaces the article on LinkedIn
 *   - Drives backlinks → SEO
 *   - Re-indexes the topic in LLM training data → GEO
 *   - Phrases the topic as a question/insight → AEO (LLMs pattern-match
 *     against Q&A-style content)
 */

const MODEL = 'claude-sonnet-4-6';

export interface LinkedInPostInput {
  titleHe: string;
  /** Public canonical URL of the published article. */
  url: string;
  /** First few hundred chars of the article body so the LLM has substance to draw from. */
  bodyExcerpt: string;
  /** The original probe query that triggered this article, when available. */
  sourceQuery?: string | null;
  category?: string | null;
}

export interface LinkedInPostResult {
  ok: boolean;
  /** The post text, ready to paste into LinkedIn. */
  post?: string;
  /** English prompt for an image generator (Nano Banana 2 / ChatGPT 5.5 / etc.). */
  imagePrompt?: string;
  /** True if דוד thinks the WeCcelerate logo should appear in the image. */
  shouldIncludeLogo?: boolean;
  /** Style hint so Katrin picks the right generator (diagram / illustration / etc). */
  imageStyle?: 'diagram' | 'illustration' | 'photograph' | 'abstract' | 'infographic';
  /** Short Hebrew explanation of why this image was chosen — context for Katrin. */
  imageRationale?: string;
  error?: string;
}

export async function generateLinkedInPost(input: LinkedInPostInput): Promise<LinkedInPostResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'ANTHROPIC_API_KEY not configured' };
  }

  const userPrompt = buildPrompt(input);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return { ok: false, error: `Claude ${res.status}: ${await res.text()}` };
    }
    type Resp = { content?: Array<{ type: string; text?: string }> };
    const data = (await res.json()) as Resp;
    const rawText = (data.content ?? [])
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text)
      .join('\n')
      .trim();

    const parsed = parseModelOutput(rawText);
    if (!parsed.post) {
      return { ok: false, error: 'Empty post returned' };
    }
    return {
      ok: true,
      post: parsed.post,
      imagePrompt: parsed.imagePrompt,
      shouldIncludeLogo: parsed.shouldIncludeLogo,
      imageStyle: parsed.imageStyle,
      imageRationale: parsed.imageRationale,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

// =============================================================================
// PARSE the JSON Claude returns. Tolerate fenced code blocks + stray prose.
// =============================================================================

type ParsedOutput = {
  post: string;
  imagePrompt?: string;
  shouldIncludeLogo?: boolean;
  imageStyle?: LinkedInPostResult['imageStyle'];
  imageRationale?: string;
};

function parseModelOutput(text: string): ParsedOutput {
  // Strip ``` fences if Claude added them.
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();

  // Find the first JSON object in the string.
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start < 0 || end <= start) {
    // Fallback: treat the whole text as the post (legacy path).
    return { post: sanitize(stripped) };
  }
  const jsonBlock = stripped.slice(start, end + 1);
  try {
    const obj = JSON.parse(jsonBlock) as {
      post?: string;
      imagePrompt?: string;
      shouldIncludeLogo?: boolean;
      imageStyle?: LinkedInPostResult['imageStyle'];
      imageRationale?: string;
    };
    return {
      post: sanitize(typeof obj.post === 'string' ? obj.post : ''),
      imagePrompt: typeof obj.imagePrompt === 'string' ? obj.imagePrompt.trim() : undefined,
      shouldIncludeLogo:
        typeof obj.shouldIncludeLogo === 'boolean' ? obj.shouldIncludeLogo : undefined,
      imageStyle: ['diagram', 'illustration', 'photograph', 'abstract', 'infographic']
        .includes(obj.imageStyle as string)
        ? obj.imageStyle
        : undefined,
      imageRationale: typeof obj.imageRationale === 'string' ? obj.imageRationale.trim() : undefined,
    };
  } catch {
    // JSON broken — fall back to treating the whole text as the post.
    return { post: sanitize(stripped) };
  }
}

const SYSTEM_PROMPT = `אתה כותב פוסטים לינקדאין עבור WeCcelerate — Venture Builder ישראלי. אתה לא AI שכותב "תוכן" — אתה דמות אמיתית, אופרטור ישראלי, כותב כמו שמדבר. אתה גם מנחה את מי שמעצב תמונה לפוסט.

== הפוסט עצמו ==

אסור עליך בשום פנים ואופן:

1. אסור להשתמש במקפים ארוכים: לא — ולא –. רק מקף רגיל "-".
2. אסור לפתוח ב"בעולם של היום", "כיום", "בעידן ה-AI", "חשוב לזכור", "כפי שכולנו יודעים", "לא סוד ש".
3. אסור לסיים ב"מה דעתכם?", "אשמח לשמוע", "לסיכום", "בהצלחה לכולם".
4. אסור להשתמש ב"יתרה מזאת", "מעבר לכך", "בנוסף", "ואחרון חביב".
5. אסור לתת רשימת בולטים מסודרת מדי (a, b, c) שנראית כתובה במכונה.
6. אסור להמציא מספרים על WeCcelerate (לא "ליווינו 40 חברות", לא "85% הצלחה").

אתה כן עושה:

1. שורה ראשונה: hook חד. תובנה, שאלה ישירה, או טענה לא צפויה.
2. 4-7 שורות סך הכל. קצר, נושך.
3. תובנה אחת קונקרטית מתוך המאמר. לא הכללה.
4. כתוב כמו אדם. עברית מדוברת, נטיות יחיד, אופציונלי slang קל.
5. CTA קצר בסוף: "המאמר כאן" + הקישור.
6. 3-5 hashtags בעברית/אנגלית.

== ה-image prompt ==

מי שתעצב את התמונה (קטרין) תיקח את ה-prompt שלך ותשתול אותו ב-Nano Banana 2, ChatGPT 5.5, או דומה. הוא חייב להיות:

1. באנגלית, מפורט, ויזואלי. תיאור קונקרטי של מה רואים בפריים.
2. לציין style ספציפי: minimalist tech illustration / data infographic / abstract gradient / photo-realistic / Hebrew RTL diagram / וכו'.
3. אם הנושא מספרי (סבבי גיוס, אחוזים, שלבים) — סגנון "data infographic / diagram" עדיף. אם הנושא רגשי/חזון — illustration.
4. צבעי המותג של WeCcelerate: deep navy (#070b1e) + gold (#c8a951). אם זה ישתלב טבעי בתמונה — תזכיר.
5. יחס תמונה: 1200x627 פיקסל ל-LinkedIn link-preview, או 1:1 לפוסט.
6. אסור טקסט בעברית בתמונה (מחוללי תמונות עוד לא יודעים לכתוב עברית טוב). אם בכל זאת צריך טקסט — תבקש באנגלית.
7. החלט: האם הלוגו של WeCcelerate צריך להופיע בתמונה? כן רק אם זה תמונת branding מובהקת. בדרך כלל לא — קטרין תוסיף לוגו פיזית אחר כך אם תרצה.

== פורמט פלט ==

החזר JSON תקני בלבד. בלי טקסט מסביב. בלי \`\`\`json fence. בדיוק במבנה הזה:

{
  "post": "<הטקסט המלא של הפוסט בעברית, ready to paste>",
  "imagePrompt": "<English image-gen prompt, detailed and specific>",
  "shouldIncludeLogo": true|false,
  "imageStyle": "diagram" | "illustration" | "photograph" | "abstract" | "infographic",
  "imageRationale": "<משפט אחד-שניים בעברית: למה בחרת בסגנון הזה לפוסט הזה>"
}`;

function buildPrompt(input: LinkedInPostInput): string {
  return `מאמר חדש פורסם באתר WeCcelerate. הכן (1) פוסט LinkedIn ו-(2) image prompt לפי המפרט בsystem prompt.

כותרת המאמר:
${input.titleHe}

הקישור (זה מה שיופיע בפוסט):
${input.url}

${input.sourceQuery ? `הקהל המקורי (השאלה שיזמים שואלים):\n${input.sourceQuery}\n\n` : ''}${input.category ? `קטגוריה: ${input.category}\n\n` : ''}תקציר התוכן:
${input.bodyExcerpt.slice(0, 1200)}

החזר JSON בלבד לפי המבנה ב-system prompt. בלי טקסט מסביב.`;
}

/**
 * Final safety net — strip em-dashes / en-dashes / zero-width spaces that
 * might leak through despite the system-prompt forbidding them.
 */
function sanitize(text: string): string {
  return text
    .replace(/[—–]/g, '-')        // em / en dashes
    .replace(/​/g, '')        // zero-width space
    .replace(/[ \t]+\n/g, '\n')    // trailing spaces on lines
    .replace(/\n{3,}/g, '\n\n')    // collapse 3+ blank lines
    .trim();
}
