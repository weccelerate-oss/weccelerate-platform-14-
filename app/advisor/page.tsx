/**
 * The advisor desk — /advisor.
 *
 * The place an advisor opens every morning: every request their entrepreneurs
 * sent, which ones are still waiting on them, and the reply box. This is the
 * logged-in counterpart to the one-off signed links in the review emails
 * (/advisor/[token]) — same threads, no link hunting.
 *
 * Access: MENTOR (their own advisees only) or ADMIN (read-only overview of
 * every assigned thread, so the team can see what's stuck).
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AdvisorDesk, type DeskThread, type DeskAdvisee, type DeskComment } from './desk-client';
import type { BellNotification } from '@/components/notification-bell';

// Shapes of the rows the two queries below select. Declared here because the
// shared prisma client is untyped (lib/db.ts returns `any`).
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
  status: string;
  aiFeedback: string | null;
  advisorRequestedAt: Date;
  user: { id: string; name: string; company: string | null; advisor: { name: string } | null } | null;
  question: { prompt: string; chapter: { name: string } | null } | null;
  comments: CommentRow[];
}
interface AdviseeRow {
  id: string;
  name: string;
  company: string | null;
  plan: string;
  lastLoginAt: Date | null;
  advisor: { name: string } | null;
  _count: { journeyAnswers: number };
}

export const metadata: Metadata = {
  title: 'אזור המלווה | WeCcelerate',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function AdvisorDeskPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/advisor');
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true, isActive: true, mustChangePassword: true },
  });

  if (!me || !me.isActive || (me.role !== 'MENTOR' && me.role !== 'ADMIN')) {
    redirect('/portal');
  }
  // Seeded advisors arrive with a temp password — same one-time gate the
  // portal applies to auto-provisioned entrepreneurs.
  if (me.mustChangePassword) {
    redirect('/onboarding/set-password');
  }

  const isAdmin = me.role === 'ADMIN';
  // An admin sees every assigned thread; an advisor sees only their own.
  const adviseeFilter = isAdmin ? { advisorId: { not: null } } : { advisorId: me.id };

  const [answers, advisees] = await Promise.all([
    prisma.userJourneyAnswer.findMany({
      where: { advisorRequestedAt: { not: null }, user: adviseeFilter },
      include: {
        user: { select: { id: true, name: true, company: true, advisor: { select: { name: true } } } },
        question: { select: { prompt: true, chapter: { select: { name: true } } } },
        comments: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { advisorRequestedAt: 'desc' },
      take: 200,
    }),
    prisma.user.findMany({
      where: adviseeFilter,
      select: {
        id: true,
        name: true,
        company: true,
        plan: true,
        lastLoginAt: true,
        advisor: { select: { name: true } },
        _count: { select: { journeyAnswers: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  // `prisma` is typed as `any` in this codebase (lib/db.ts), so the rows are
  // annotated explicitly rather than inferred.
  const threads: DeskThread[] = (answers as AnswerRow[]).map((a: AnswerRow) => {
    const comments: DeskComment[] = (a.comments ?? []).map((c: CommentRow) => ({
      id: c.id,
      authorType: c.authorType as 'ENTREPRENEUR' | 'ADVISOR',
      authorName: c.authorName,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));

    // "Waiting on me" = the entrepreneur's side moved last. Their side moves
    // when they send the answer over (advisorRequestedAt) or add a message;
    // an advisor reply after that clears it.
    const requestedAtMs = a.advisorRequestedAt.getTime();
    let lastAdvisorAt: number | null = null;
    let lastEntrepreneurAt = requestedAtMs;
    for (const c of comments) {
      const at = Date.parse(c.createdAt);
      if (c.authorType === 'ADVISOR') {
        lastAdvisorAt = Math.max(lastAdvisorAt ?? 0, at);
      } else {
        lastEntrepreneurAt = Math.max(lastEntrepreneurAt, at);
      }
    }

    return {
      answerId: a.id,
      entrepreneur: {
        id: a.user?.id ?? '',
        name: a.user?.name ?? 'יזם',
        company: a.user?.company ?? null,
      },
      advisorName: a.user?.advisor?.name ?? null,
      chapterName: a.question?.chapter?.name ?? '',
      questionPrompt: a.question?.prompt ?? '',
      answerContent: a.content ?? '',
      answerStatus: a.status,
      aiFeedback: a.aiFeedback ?? null,
      requestedAt: a.advisorRequestedAt.toISOString(),
      lastActivityAt: new Date(Math.max(lastEntrepreneurAt, lastAdvisorAt ?? 0)).toISOString(),
      needsReply: lastAdvisorAt === null || lastEntrepreneurAt > lastAdvisorAt,
      comments,
    };
  });

  const deskAdvisees: DeskAdvisee[] = (advisees as AdviseeRow[]).map((u: AdviseeRow) => ({
    id: u.id,
    name: u.name,
    company: u.company ?? null,
    plan: u.plan,
    advisorName: u.advisor?.name ?? null,
    answersCount: u._count.journeyAnswers,
    openThreads: threads.filter((t) => t.entrepreneur.id === u.id).length,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));

  // Unread notifications for the bell. These used to be marked read on sight,
  // which meant a mentor who glanced at the desk lost the record of what came
  // in. The bell clears them on click instead.
  let notifications: BellNotification[] = [];
  try {
    const rows: Array<{
      id: string;
      title: string;
      message: string;
      link: string | null;
      type: string;
      createdAt: Date;
    }> = await prisma.notification.findMany({
      where: { userId: me.id, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });
    notifications = rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      link: n.link,
      type: n.type,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch {
    // A DB hiccup must not take the desk down for a badge.
  }

  return (
    <AdvisorDesk
      advisorName={me.name}
      isAdmin={isAdmin}
      threads={threads}
      advisees={deskAdvisees}
      notifications={notifications}
    />
  );
}
