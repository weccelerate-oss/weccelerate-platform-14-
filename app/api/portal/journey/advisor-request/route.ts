/**
 * POST /api/portal/journey/advisor-request
 *   Body: { questionId, note? }
 *
 * INVESTOR_PREP feature: the entrepreneur sends an answer to their human
 * advisor for review. Stamps advisorRequestedAt, stores the optional note as
 * the first thread message, and emails the advisor a signed reply link.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { hasFeature } from '@/lib/entitlements';
import { signAdvisorToken } from '@/lib/journey/advisor-token';
import { sendAdvisorReviewEmail } from '@/lib/journey/advisor-email';
import { notifyAdmins } from '@/lib/advisors.server';

const PORTAL_URL = 'https://weccelerate.co.il';

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

    const limit = rateLimit(`advisor-request:${userId}`, { limit: 10, windowSeconds: 60 * 60 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'שלחת הרבה בקשות בשעה האחרונה — תן למלווה רגע לנשום :)' },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        plan: true,
        featureOverrides: true,
        advisorId: true,
        advisor: { select: { id: true, name: true, email: true, isActive: true } },
      },
    });
    if (!user || !hasFeature(user, 'humanMentor')) {
      return NextResponse.json(
        { error: 'ליווי אישי זמין בחבילת ההכנה למשקיעים — דבר איתנו לפרטים' },
        { status: 403 },
      );
    }
    // The advisor must be an assigned, still-active roster member. A
    // deactivated advisor is treated as no advisor rather than mailing a
    // closed account into the void.
    const advisor = user.advisor?.isActive ? user.advisor : null;
    if (!advisor) {
      return NextResponse.json(
        { error: 'לא הוגדר לך מלווה אישי עדיין — פנה לצוות ונחבר אותך' },
        { status: 409 },
      );
    }

    const body = await req.json().catch(() => null);
    const { questionId, note } = (body ?? {}) as { questionId?: string; note?: string };
    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json({ error: 'questionId required' }, { status: 400 });
    }

    const answer = await prisma.userJourneyAnswer.findUnique({
      where: { userId_questionId: { userId, questionId } },
      include: { question: { include: { chapter: { select: { name: true } } } } },
    });
    if (!answer || (answer.content ?? '').trim().length < 10) {
      return NextResponse.json(
        { error: 'כתוב תשובה לפני ששולחים אותה למלווה' },
        { status: 400 },
      );
    }

    const safeNote = typeof note === 'string' && note.trim() ? note.trim().slice(0, 2000) : null;

    await prisma.userJourneyAnswer.update({
      where: { id: answer.id },
      data: { advisorRequestedAt: new Date() },
    });

    let noteComment = null;
    if (safeNote) {
      noteComment = await prisma.answerComment.create({
        data: {
          answerId: answer.id,
          authorType: 'ENTREPRENEUR',
          authorName: user.name || 'היזם',
          body: safeNote,
        },
      });
    }

    const token = signAdvisorToken(answer.id, advisor.email);
    const reviewUrl = `${PORTAL_URL}/advisor/${token}`;

    const emailRes = await sendAdvisorReviewEmail({
      to: advisor.email,
      advisorName: advisor.name,
      entrepreneurName: user.name || 'היזם',
      chapterName: answer.question?.chapter?.name ?? '',
      questionPrompt: answer.question?.prompt ?? '',
      answerContent: answer.content ?? '',
      aiFeedback: answer.aiFeedback ?? null,
      entrepreneurNote: safeNote,
      reviewUrl,
    });

    // In-desk notification for the advisor. The email is the nudge; this is
    // what makes the request visible when they open /advisor in the morning
    // even if the mail was missed or filtered.
    try {
      await prisma.notification.create({
        data: {
          userId: advisor.id,
          type: 'info',
          title: `${user.name || 'יזם'} ביקש/ה את המשוב שלך`,
          message: `על השאלה: "${(answer.question?.prompt ?? '').slice(0, 80)}"`,
          link: '/advisor',
        },
      });
    } catch {
      /* best effort */
    }

    await notifyAdmins({
      title: `${user.name || 'יזם'} ביקש/ה משוב מ${advisor.name}`,
      message: `"${(answer.question?.prompt ?? '').slice(0, 70)}" — הפנייה נשלחה, השעון רץ.`,
      type: 'info',
    });

    try {
      await prisma.activityLog.create({
        data: {
          action: emailRes.ok ? 'journey.advisor_requested' : 'journey.advisor_request_email_failed',
          description: `Advisor review ${emailRes.ok ? 'requested' : 'EMAIL FAILED'} for question "${(answer.question?.prompt ?? '').slice(0, 60)}" → ${advisor.name} <${advisor.email}>`,
          userId,
          metadata: {
            questionId,
            advisorId: advisor.id,
            advisorEmail: advisor.email,
            ...(emailRes.ok ? {} : { error: emailRes.error }),
          },
        },
      });
    } catch {
      /* audit best-effort */
    }

    if (!emailRes.ok) {
      console.error('[advisor-request] email failed:', emailRes.error);
      return NextResponse.json(
        { error: 'הבקשה נרשמה אבל שליחת המייל למלווה נכשלה — הצוות יטפל' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      advisorRequestedAt: new Date().toISOString(),
      comment: noteComment
        ? {
            id: noteComment.id,
            authorType: 'ENTREPRENEUR',
            authorName: user.name || 'היזם',
            body: safeNote,
            createdAt: noteComment.createdAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error('[advisor-request] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
