/**
 * POST /api/advisor/reply
 *   Body: { token, body }
 *
 * The advisor replies to an entrepreneur's answer via the signed link from
 * their email — no portal login. The token binds (answerId, advisorEmail);
 * we additionally verify the advisor is still the one assigned to that
 * entrepreneur. The reply lands in the thread and the entrepreneur gets an
 * in-portal notification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { verifyAdvisorToken } from '@/lib/journey/advisor-token';
import { advisorDisplayName } from '@/lib/advisors';
import { notifyAdmins } from '@/lib/advisors.server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null);
    const { token, body } = (payload ?? {}) as { token?: string; body?: string };
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    const verified = verifyAdvisorToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'הקישור פג תוקף — בקש מהיזם לשלוח שוב' }, { status: 401 });
    }

    const limit = rateLimit(`advisor-reply:${verified.advisorEmail}`, { limit: 30, windowSeconds: 60 * 60 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'יותר מדי תגובות בשעה — נסה שוב מאוחר יותר' }, { status: 429 });
    }

    const text = typeof body === 'string' ? body.trim().slice(0, 4000) : '';
    if (text.length < 2) {
      return NextResponse.json({ error: 'כתוב תגובה לפני השליחה' }, { status: 400 });
    }

    const answer = await prisma.userJourneyAnswer.findUnique({
      where: { id: verified.answerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            advisor: { select: { id: true, name: true, email: true, isActive: true } },
          },
        },
        question: { select: { prompt: true } },
      },
    });
    if (!answer) {
      return NextResponse.json({ error: 'התשובה לא נמצאה' }, { status: 404 });
    }
    // The token proves *which* advisor holds the link; the assignment proves
    // they still hold this entrepreneur. Reassigning an entrepreneur therefore
    // revokes every outstanding link the previous advisor was mailed.
    const advisor = answer.user?.advisor;
    if (!advisor?.isActive || advisor.email.toLowerCase() !== verified.advisorEmail) {
      return NextResponse.json({ error: 'הקישור אינו תואם ליזם הזה עוד' }, { status: 403 });
    }

    // The entrepreneur sees a person, not an inbox: the advisor's real name,
    // never the local part of their email (which is what this used to show).
    const advisorName = advisorDisplayName(advisor);
    const entrepreneurName = answer.user?.name || 'היזם';
    const comment = await prisma.answerComment.create({
      data: {
        answerId: answer.id,
        authorType: 'ADVISOR',
        authorName: advisorName,
        authorId: advisor.id,
        body: text,
      },
    });

    // In-portal notification for the entrepreneur.
    // The admin sees how the mentor answered — quality, tone and turnaround.
    await notifyAdmins({
      title: `${advisorName} השיב/ה ל${entrepreneurName}`,
      message: `"${(answer.question?.prompt ?? '').slice(0, 60)}" · ${text.slice(0, 90)}${text.length > 90 ? '…' : ''}`,
      type: 'success',
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
    console.error('[advisor/reply] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
