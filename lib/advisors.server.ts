/**
 * Advisor lookups that touch the database. Server-only — the client-safe
 * constants (roster, avatar, display name) live in lib/advisors.ts.
 */

import { prisma } from '@/lib/db';

export interface AdvisorSummary {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

/**
 * Every account that may act as an advisor: MENTOR role, active. Used by the
 * admin assignment dropdown — the admin picks from these, never free text.
 */
export async function listAdvisors(): Promise<AdvisorSummary[]> {
  const rows = await prisma.user.findMany({
    where: { role: 'MENTOR', isActive: true },
    select: { id: true, name: true, email: true, isActive: true },
    orderBy: { name: 'asc' },
  });
  return rows as AdvisorSummary[];
}

/**
 * The advisor assigned to an entrepreneur, or null. Also used as the
 * authorization check on the advisor desk: an advisor may only open threads
 * belonging to their own advisees.
 */
export async function getAdvisorFor(userId: string): Promise<AdvisorSummary | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      advisor: { select: { id: true, name: true, email: true, isActive: true } },
    },
  });
  return (row?.advisor as AdvisorSummary | undefined) ?? null;
}

/**
 * Copy a thread event to every active admin.
 *
 * The admin needs to see the conversation as it happens: whether a mentor is
 * sitting on a request, how they answer, and whether an entrepreneur is
 * flooding them. Best-effort — a failed notification must never break the
 * reply that triggered it.
 */
export async function notifyAdmins(input: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}): Promise<void> {
  try {
    const admins: Array<{ id: string }> = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: input.type ?? 'info',
        title: input.title,
        message: input.message,
        link: '/admin/advisor-threads',
      })),
    });
  } catch {
    /* best effort */
  }
}

/**
 * Tell the entrepreneur their answer got a reply — in the portal and by email.
 *
 * All three reply paths (the mentor's desk, the mentor's emailed link, and an
 * admin stepping in) go through here, so the entrepreneur's experience cannot
 * drift between them. The notification carries a preview of the reply so the
 * updates panel says something, not just "you have a message".
 *
 * Best-effort throughout: a mail failure must never lose the reply itself,
 * which is already saved by the time we get here.
 */
export async function notifyEntrepreneurOfReply(input: {
  entrepreneurId: string;
  authorName: string;
  /** True when the house replied rather than the assigned mentor. */
  fromTeam?: boolean;
  questionPrompt: string;
  chapterName?: string | null;
  replyBody: string;
}): Promise<{ emailed: boolean; error?: string }> {
  const preview =
    input.replyBody.length > 110 ? `${input.replyBody.slice(0, 110)}…` : input.replyBody;

  try {
    await prisma.notification.create({
      data: {
        userId: input.entrepreneurId,
        type: 'success',
        title: `${input.authorName} הגיב/ה לתשובה שלך`,
        message: preview,
        link: '/portal/journey',
      },
    });
  } catch {
    /* best effort */
  }

  let emailed = false;
  let error: string | undefined;
  try {
    const user: { email: string; name: string } | null = await prisma.user.findUnique({
      where: { id: input.entrepreneurId },
      select: { email: true, name: true },
    });
    if (user?.email) {
      const { sendAdvisorReplyEmail } = await import('@/lib/journey/advisor-reply-email');
      const res = await sendAdvisorReplyEmail({
        to: user.email,
        entrepreneurName: user.name,
        authorName: input.authorName,
        fromTeam: input.fromTeam,
        questionPrompt: input.questionPrompt,
        chapterName: input.chapterName ?? null,
        replyBody: input.replyBody,
      });
      emailed = res.ok;
      if (!res.ok) error = res.error;
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  if (!emailed && error) {
    console.error('[notifyEntrepreneurOfReply] email failed:', error);
  }
  return { emailed, error };
}
