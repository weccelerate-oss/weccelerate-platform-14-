/**
 * POST /api/advisor/desk-reply
 *   Body: { answerId, body }
 *
 * The logged-in advisor replies from their desk (/advisor). Same effect as the
 * emailed-link route (/api/advisor/reply) — a thread message plus an in-portal
 * notification for the entrepreneur — but authorized by session + assignment
 * instead of a signed token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { advisorDisplayName } from '@/lib/advisors';

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

    const advisor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, role: true, isActive: true },
    });
    // Admins can watch the desk but not speak as an advisor — a reply must
    // carry the name of the person the entrepreneur was actually assigned.
    if (!advisor?.isActive || advisor.role !== 'MENTOR') {
      return NextResponse.json({ error: 'האזור הזה מיועד למלווים' }, { status: 403 });
    }

    const limit = rateLimit(`advisor-desk-reply:${advisor.id}`, { limit: 60, windowSeconds: 60 * 60 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'יותר מדי תגובות בשעה — נסה שוב מאוחר יותר' }, { status: 429 });
    }

    const payload = await req.json().catch(() => null);
    const { answerId, body } = (payload ?? {}) as { answerId?: string; body?: string };
    if (!answerId || typeof answerId !== 'string') {
      return NextResponse.json({ error: 'answerId required' }, { status: 400 });
    }
    const text = typeof body === 'string' ? body.trim().slice(0, 4000) : '';
    if (text.length < 2) {
      return NextResponse.json({ error: 'כתוב תגובה לפני השליחה' }, { status: 400 });
    }

    const answer = await prisma.userJourneyAnswer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        advisorRequestedAt: true,
        user: { select: { id: true, advisorId: true } },
        question: { select: { prompt: true } },
      },
    });
    if (!answer) {
      return NextResponse.json({ error: 'התשובה לא נמצאה' }, { status: 404 });
    }
    // Authorization: this entrepreneur is mine, and they actually asked.
    if (answer.user?.advisorId !== advisor.id) {
      return NextResponse.json({ error: 'היזם הזה אינו משויך אליך' }, { status: 403 });
    }
    if (!answer.advisorRequestedAt) {
      return NextResponse.json({ error: 'היזם עוד לא שלח את התשובה הזו לעיונך' }, { status: 409 });
    }

    const advisorName = advisorDisplayName(advisor);
    const comment = await prisma.answerComment.create({
      data: {
        answerId: answer.id,
        authorType: 'ADVISOR',
        authorName: advisorName,
        authorId: advisor.id,
        body: text,
      },
    });

    try {
      await prisma.notification.create({
        data: {
          userId: answer.user.id,
          type: 'success',
          title: `${advisorName} הגיב/ה לתשובה שלך`,
          message: `על השאלה: "${(answer.question?.prompt ?? '').slice(0, 80)}"`,
          link: '/portal/journey',
        },
      });
    } catch {
      /* best effort */
    }

    try {
      await prisma.activityLog.create({
        data: {
          action: 'journey.advisor_replied',
          description: `${advisorName} replied on "${(answer.question?.prompt ?? '').slice(0, 60)}"`,
          userId: answer.user.id,
          metadata: { advisorId: advisor.id, answerId: answer.id, source: 'desk' },
        },
      });
    } catch {
      /* audit best-effort */
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        authorType: 'ADVISOR',
        authorName: advisorName,
        body: text,
        createdAt: comment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[advisor/desk-reply] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
