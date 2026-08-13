/**
 * POST /api/portal/journey/comment
 *   Body: { questionId, body }
 *
 * The entrepreneur replies in the human-mentor thread on their own answer
 * (INVESTOR_PREP feature). Advisor replies come through /api/advisor/reply.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { hasFeature } from '@/lib/entitlements';
import { notifyAdmins } from '@/lib/advisors.server';

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

    const limit = rateLimit(`journey-comment:${userId}`, { limit: 30, windowSeconds: 60 * 60 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'יותר מדי הודעות — נסה שוב מאוחר יותר' }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        plan: true,
        featureOverrides: true,
        advisorId: true,
        advisor: { select: { id: true, isActive: true } },
      },
    });
    if (!user || !hasFeature(user, 'humanMentor')) {
      return NextResponse.json({ error: 'השיחה עם מלווה זמינה בחבילת ההכנה למשקיעים' }, { status: 403 });
    }

    const payload = await req.json().catch(() => null);
    const { questionId, body } = (payload ?? {}) as { questionId?: string; body?: string };
    const text = typeof body === 'string' ? body.trim().slice(0, 4000) : '';
    if (!questionId || text.length < 2) {
      return NextResponse.json({ error: 'כתוב הודעה לפני השליחה' }, { status: 400 });
    }

    const answer = await prisma.userJourneyAnswer.findUnique({
      where: { userId_questionId: { userId, questionId } },
      select: { id: true, advisorRequestedAt: true, question: { select: { prompt: true } } },
    });
    if (!answer) {
      return NextResponse.json({ error: 'אין עדיין תשובה לשאלה הזו' }, { status: 404 });
    }

    const comment = await prisma.answerComment.create({
      data: {
        answerId: answer.id,
        authorType: 'ENTREPRENEUR',
        authorName: user.name || 'היזם',
        authorId: userId,
        body: text,
      },
    });

    // Surface the follow-up on the advisor's desk. Without this a reply inside
    // an already-open thread was invisible until they happened to reopen it.
    if (user.advisor?.isActive && answer.advisorRequestedAt) {
      try {
        await prisma.notification.create({
          data: {
            userId: user.advisor.id,
            type: 'info',
            title: `${user.name || 'היזם'} הוסיף/ה הודעה בשיחה`,
            message: `על השאלה: "${(answer.question?.prompt ?? '').slice(0, 80)}"`,
            link: '/advisor',
          },
        });
      } catch {
        /* best effort */
      }
    }

    await notifyAdmins({
      title: `${user.name || 'היזם'} הוסיף/ה הודעה בשיחה עם המלווה`,
      message: `"${(answer.question?.prompt ?? '').slice(0, 70)}"`,
      type: 'info',
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        authorType: 'ENTREPRENEUR',
        authorName: user.name || 'היזם',
        body: text,
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[journey/comment] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
