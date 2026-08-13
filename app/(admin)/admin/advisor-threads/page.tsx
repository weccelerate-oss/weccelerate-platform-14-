/**
 * /admin/advisor-threads — every mentor↔entrepreneur conversation, in one place.
 *
 * Answers three questions the admin cannot get anywhere else:
 *   - is a mentor sitting on a request? (waiting time, and what counts as late)
 *   - how does this mentor actually answer? (the full thread, verbatim)
 *   - is an entrepreneur flooding their mentor? (message counts per side)
 *
 * The admin can also reply in the thread — see adminReplyToThreadAction.
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { OVERDUE_AFTER_MS } from '@/lib/advisors';
import { AdvisorThreadsClient, type AdminThread } from './threads-client';

export const metadata: Metadata = { title: 'התכתבויות מלווים | ניהול' };
export const dynamic = 'force-dynamic';

interface CommentRow {
  id: string;
  authorType: string;
  authorName: string;
  body: string;
  createdAt: Date;
}

interface AnswerRow {
  id: string;
  content: string | null;
  aiFeedback: string | null;
  advisorRequestedAt: Date;
  user: {
    id: string;
    name: string;
    company: string | null;
    advisor: { id: string; name: string } | null;
  } | null;
  question: { prompt: string; chapter: { name: string } | null } | null;
  comments: CommentRow[];
}

export default async function AdvisorThreadsPage() {
  const session = await auth();

  const [rows, unreadCount] = await Promise.all([
    prisma.userJourneyAnswer.findMany({
      where: { advisorRequestedAt: { not: null } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            company: true,
            advisor: { select: { id: true, name: true } },
          },
        },
        question: { select: { prompt: true, chapter: { select: { name: true } } } },
        comments: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { advisorRequestedAt: 'desc' },
      take: 300,
    }),
    session?.user?.id
      ? prisma.notification.count({
          where: { userId: session.user.id, link: '/admin/advisor-threads', isRead: false },
        })
      : Promise.resolve(0),
  ]);

  const now = Date.now();

  const threads: AdminThread[] = (rows as AnswerRow[]).map((a: AnswerRow) => {
    const comments = (a.comments ?? []).map((c: CommentRow) => ({
      id: c.id,
      authorType: (c.authorType as AdminThread['comments'][number]['authorType']) ?? 'ENTREPRENEUR',
      authorName: c.authorName,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

    // The clock starts when the entrepreneur's side last moved and stops on the
    // first reply from the mentor or the house after that.
    const requestedAtMs = a.advisorRequestedAt.getTime();
    let lastFromHouseAt: number | null = null;
    let lastFromEntrepreneurAt = requestedAtMs;
    let entrepreneurMessages = 0;
    let advisorMessages = 0;

    for (const c of comments) {
      const at = Date.parse(c.createdAt);
      if (c.authorType === 'ENTREPRENEUR') {
        entrepreneurMessages += 1;
        lastFromEntrepreneurAt = Math.max(lastFromEntrepreneurAt, at);
      } else {
        if (c.authorType === 'ADVISOR') advisorMessages += 1;
        lastFromHouseAt = Math.max(lastFromHouseAt ?? 0, at);
      }
    }

    const awaitingReply = lastFromHouseAt === null || lastFromEntrepreneurAt > lastFromHouseAt;
    const waitingMs = awaitingReply ? now - lastFromEntrepreneurAt : 0;

    // How long the mentor took the first time — the honest measure of a
    // mentor's responsiveness, unaffected by later back-and-forth.
    const firstAdvisorReply = comments.find((c) => c.authorType === 'ADVISOR');
    const firstReplyMs = firstAdvisorReply
      ? Date.parse(firstAdvisorReply.createdAt) - requestedAtMs
      : null;

    return {
      answerId: a.id,
      entrepreneur: {
        id: a.user?.id ?? '',
        name: a.user?.name ?? 'יזם',
        company: a.user?.company ?? null,
      },
      advisor: a.user?.advisor ? { id: a.user.advisor.id, name: a.user.advisor.name } : null,
      chapterName: a.question?.chapter?.name ?? '',
      questionPrompt: a.question?.prompt ?? '',
      answerContent: a.content ?? '',
      aiFeedback: a.aiFeedback ?? null,
      requestedAt: a.advisorRequestedAt.toISOString(),
      awaitingReply,
      waitingMs,
      overdue: awaitingReply && waitingMs > OVERDUE_AFTER_MS,
      firstReplyMs,
      entrepreneurMessages,
      advisorMessages,
      comments,
    };
  });

  return (
    <AdvisorThreadsClient
      threads={threads}
      unreadCount={unreadCount}
      overdueAfterMs={OVERDUE_AFTER_MS}
    />
  );
}
