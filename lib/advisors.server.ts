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
