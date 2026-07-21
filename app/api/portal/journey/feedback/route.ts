/**
 * API Route: Founder Journey — AI mentor feedback ("כוכבי")
 *
 * POST /api/portal/journey/feedback
 *   Body: { questionId }
 *   Reads the user's saved answer for that question, asks the model to review
 *   it the way an Israeli investor would, caches the feedback on the answer
 *   row (aiFeedback / aiFeedbackAt) and returns it.
 *
 * Cost control: a DB-backed monthly pool per user (default 30, tunable via
 * SiteSetting `ai.mentor_feedback_monthly_limit` — see lib/ai-quota.ts),
 * plus a small in-memory burst limiter against rapid-fire clicking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { tryConsume, refund } from '@/lib/ai-quota';
import { hasFeature } from '@/lib/entitlements';

const FEEDBACK_MODEL = 'claude-sonnet-4-6';
const QUOTA_FEATURE = 'mentor_feedback';

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || !host) {
    const referer = req.headers.get('referer');
    if (!referer) return true;
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'המשוב של כוכבי אינו זמין כרגע' },
        { status: 503 },
      );
    }

    // Plan gate — FREE (future self-signup) doesn't include the AI mentor.
    const planUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, featureOverrides: true },
    });
    if (!hasFeature(planUser, 'mentorAi')) {
      return NextResponse.json(
        { error: 'המשוב של כוכבי זמין בחבילות הליווי שלנו — דבר איתנו לשדרוג' },
        { status: 403 },
      );
    }

    // Burst guard only — the real cap is the DB-backed monthly pool below.
    const burst = rateLimit(`journey-feedback:${userId}`, { limit: 5, windowSeconds: 60 });
    if (!burst.allowed) {
      return NextResponse.json(
        { error: 'רגע, כוכבי עוד קורא... נסה שוב בעוד דקה' },
        { status: 429 },
      );
    }

    const body = await req.json().catch(() => null);
    const questionId = (body as { questionId?: string } | null)?.questionId;
    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json({ error: 'questionId required' }, { status: 400 });
    }

    const question = await prisma.journeyQuestion.findUnique({
      where: { id: questionId },
      include: { chapter: { select: { name: true, investorLook: true } } },
    });
    if (!question) {
      return NextResponse.json({ error: 'Unknown question' }, { status: 404 });
    }

    const answer = await prisma.userJourneyAnswer.findUnique({
      where: { userId_questionId: { userId, questionId } },
      select: { content: true },
    });
    const content = (answer?.content ?? '').trim();
    if (content.length < 10) {
      return NextResponse.json(
        { error: 'כתוב תשובה (לפחות כמה מילים) לפני בקשת משוב' },
        { status: 400 },
      );
    }

    // Monthly pool — consume one slot atomically before paying for the call.
    const quota = await tryConsume(userId, QUOTA_FEATURE);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            quota.limit <= 0
              ? 'המשוב של כוכבי כבוי כרגע במערכת'
              : `ניצלת את כל ${quota.limit} המשובים לחודש הזה — המכסה מתחדשת ב-1 בחודש הבא. צריך יותר? דבר עם המלווה שלך.`,
          remaining: 0,
          limit: quota.limit,
        },
        { status: 429 },
      );
    }

    const prompt = [
      'אתה "כוכבי" — הכוכב המלווה של פורטל היזמים של WeCcelerate, ומנטור השקעות ישראלי ותיק.',
      'יזם עונה על שאלות הכנה לפגישת משקיעים. תן משוב על התשובה שלו — ישיר, חם ומקצועי, בעברית, בגוף שני.',
      '',
      `הפרק: ${question.chapter?.name ?? ''}`,
      question.chapter?.investorLook ? `מה משקיע מחפש בפרק הזה: ${question.chapter.investorLook}` : '',
      `השאלה: ${question.prompt}`,
      question.helper ? `הכוונה לתשובה טובה: ${question.helper}` : '',
      '',
      'התשובה של היזם:',
      '"""',
      content.slice(0, 4000),
      '"""',
      '',
      'תן משוב בן 3 חלקים קצרים (עד ~150 מילים סה"כ):',
      '1. מה חזק בתשובה (משפט אחד).',
      '2. מה חסר או מה משקיע יתקוף (1–2 נקודות ספציפיות).',
      '3. איך לחדד — צעד קונקרטי אחד לשיפור.',
      'בלי כותרות מודגשות, בלי פתיחות חגיגיות. ישר לעניין.',
    ]
      .filter(Boolean)
      .join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: FEEDBACK_MODEL,
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[journey/feedback] Anthropic error:', res.status, detail.slice(0, 300));
      // Our failure, not the entrepreneur's — give the slot back.
      await refund(userId, QUOTA_FEATURE);
      return NextResponse.json(
        { error: 'כוכבי עמוס כרגע — נסה שוב בעוד רגע' },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const feedback = (data.content ?? [])
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!feedback) {
      await refund(userId, QUOTA_FEATURE);
      return NextResponse.json(
        { error: 'כוכבי לא הצליח לנסח משוב — נסה שוב' },
        { status: 502 },
      );
    }

    await prisma.userJourneyAnswer.update({
      where: { userId_questionId: { userId, questionId } },
      data: { aiFeedback: feedback, aiFeedbackAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      feedback,
      remaining: quota.remaining,
      limit: quota.limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[journey/feedback] failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
