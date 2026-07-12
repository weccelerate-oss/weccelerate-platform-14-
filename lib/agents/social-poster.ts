/**
 * Social Poster — derives ready-to-paste social drafts from David's guides.
 *
 * Runs inside the daily cron AFTER the report window opens: for every guide
 * published in the last 24h that doesn't have drafts yet, one Sonnet call
 * produces a LinkedIn post, a Facebook post, and 3 short video hooks. The
 * drafts are logged as an AgentDecision (agent 'social-poster'), which makes
 * them appear inside the existing daily email automatically — the operator
 * copy-pastes what they like. Nothing is auto-published.
 *
 * Dedup: the AgentDecision payload records the guide id; a guide that already
 * has a 'drafted-posts' decision is skipped on re-runs.
 */

import { prisma } from '@/lib/db';
import { logDecision } from '@/lib/agents/decision-log';

const MODEL_SOCIAL = 'claude-sonnet-4-6';

export interface SocialPosterResult {
  drafted: number;
  skipped: number;
}

export async function runSocialPoster(): Promise<SocialPosterResult> {
  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const guides = await prisma.generatedGuide.findMany({
    where: { status: 'published', publishedAt: { gte: since } },
    select: { id: true, slug: true, titleHe: true, metaDescription: true, category: true },
  });
  if (guides.length === 0) return { drafted: 0, skipped: 0 };

  // Which of these already have drafts (idempotency across cron re-runs)?
  const existing = await prisma.agentDecision.findMany({
    where: {
      agent: 'social-poster',
      action: 'drafted-posts',
      timestamp: { gte: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    },
    select: { payload: true },
  });
  const alreadyDrafted = new Set(
    existing
      .map((d: { payload: unknown }) => (d.payload as { guideId?: string } | null)?.guideId)
      .filter(Boolean),
  );

  let drafted = 0;
  let skipped = 0;

  for (const guide of guides) {
    if (alreadyDrafted.has(guide.id)) { skipped++; continue; }

    const url = `https://weccelerate.co.il/guides/${guide.slug}`;
    const prompt =
      `אתה מנהל הסושיאל של WeCcelerate — Venture Builder ישראלי המתמחה ב-MedTech (שותפות עם לאומית). ` +
      `פורסם עכשיו מדריך חדש באתר:\n` +
      `כותרת: ${guide.titleHe}\n` +
      `תקציר: ${guide.metaDescription}\n` +
      `קטגוריה: ${guide.category}\nקישור: ${url}\n\n` +
      `כל פוסט נבנה לפי מבנה חמשת החלקים שלנו, זורם כטקסט אחד בלי כותרות ביניים:\n` +
      `(א) הוק חזק שתופס את העין, מותר פרובוקטיבי. (ב) הצגה עצמית של משפט אחד. ` +
      `(ג) הצגת הבעיה מנקודת מבט היזם שחווה אותה. (ד) הצגת הפתרון — תובנה קונקרטית מהמדריך + הקישור. ` +
      `(ה) קריאה לפעולה שמזמינה ליצור איתנו קשר כדי שנפתור להם את הבעיה הספציפית שלהם.\n\n` +
      `כתוב:\n` +
      `1. פוסט LinkedIn (עד 140 מילים, עברית, טון מקצועי-אישי, עד 3 האשטגים).\n` +
      `2. פוסט Facebook לקבוצות יזמים (עד 100 מילים, ישיר וחברי, אותו מבנה בגרסה מרוככת).\n` +
      `3. שלושה hooks של עד 12 מילים לפתיחת סרטון רילס על הנושא (חלק א׳ בלבד — הכי פרובוקטיבי שיש).\n\n` +
      `אל תמציא נתונים שלא מופיעים בתקציר. בלי מקפים ארוכים (— –), רק "-". פורמט: כותרות "LinkedIn:", "Facebook:", "Hooks:".`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_SOCIAL,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
      const text = (data.content ?? [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text ?? '')
        .join('\n')
        .trim();
      if (!text) throw new Error('empty social drafts response');

      await logDecision({
        agent: 'social-poster',
        action: 'drafted-posts',
        reasoning:
          `טיוטות סושיאל למאמר "${guide.titleHe}" — מוכנות להעתקה (לא פורסם אוטומטית):\n\n${text}`,
        payload: { guideId: guide.id, slug: guide.slug },
        success: true,
      });
      drafted++;
    } catch (e) {
      await logDecision({
        agent: 'social-poster',
        action: 'draft-failed',
        reasoning: `נכשלה יצירת טיוטות סושיאל ל"${guide.titleHe}": ${e instanceof Error ? e.message : String(e)}`,
        payload: { guideId: guide.id },
        success: false,
      });
    }
  }

  return { drafted, skipped };
}
