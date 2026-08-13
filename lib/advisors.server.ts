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
