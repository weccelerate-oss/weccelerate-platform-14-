/**
 * /admin/advisors — the advisor (mentor) roster.
 *
 * Add a mentor, rename one, move them to a new address, deactivate one who
 * left. Each row shows the load that matters when deciding who to assign:
 * how many entrepreneurs they hold and how many requests are still waiting on
 * them.
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { threadState } from '@/lib/advisors';
import { AdvisorsClient, type AdvisorRow } from './advisors-client';

export const metadata: Metadata = { title: 'מלווים | ניהול' };
export const dynamic = 'force-dynamic';

interface MentorRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  mustChangePassword: boolean;
  _count: { advisees: number };
}

export default async function AdvisorsPage() {
  const mentors: MentorRow[] = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      mustChangePassword: true,
      _count: { select: { advisees: true } },
    },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  });

  // Open requests per advisor: an answer sent for review whose last word came
  // from the entrepreneur. Counted here rather than in the client so the row
  // shows a real workload, not just a headcount.
  const pending = await prisma.userJourneyAnswer.findMany({
    where: { advisorRequestedAt: { not: null }, user: { advisorId: { not: null } } },
    select: {
      advisorRequestedAt: true,
      user: { select: { advisorId: true } },
      comments: { select: { authorType: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  const waitingByAdvisor = new Map<string, number>();
  for (const a of pending as Array<{
    advisorRequestedAt: Date;
    user: { advisorId: string | null } | null;
    comments: Array<{ authorType: string; createdAt: Date }>;
  }>) {
    const advisorId = a.user?.advisorId;
    if (!advisorId) continue;
    if (threadState(a.advisorRequestedAt, a.comments).awaitingReply) {
      waitingByAdvisor.set(advisorId, (waitingByAdvisor.get(advisorId) ?? 0) + 1);
    }
  }

  const rows: AdvisorRow[] = mentors.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    isActive: m.isActive,
    advisees: m._count.advisees,
    waiting: waitingByAdvisor.get(m.id) ?? 0,
    lastLoginAt: m.lastLoginAt ? m.lastLoginAt.toISOString() : null,
    neverSignedIn: !m.lastLoginAt,
    mustChangePassword: m.mustChangePassword,
  }));

  // How many entrepreneurs have a mentor at all. Not having one is now the
  // ordinary state — the mentor is added when someone needs one — so this is a
  // reach figure, not a warning.
  const assigned = await prisma.user.count({
    where: { role: 'ENTREPRENEUR', advisorId: { not: null } },
  });

  return <AdvisorsClient advisors={rows} assignedEntrepreneurs={assigned} />;
}
