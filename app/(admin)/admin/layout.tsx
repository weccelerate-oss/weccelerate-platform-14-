import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminSidebar } from './components/admin-sidebar';

// Defense-in-depth alongside the robots.txt disallow — a stray link to an
// admin URL must not get it indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if ((session.user as any).role !== 'ADMIN') {
    redirect('/portal?error=unauthorized');
  }

  const adminUser = {
    name: session.user.name || 'Admin',
    email: session.user.email || '',
    role: (session.user as any).role || 'ADMIN',
  };

  // Mentor threads that blew past the promised response window. Counted here so
  // the number is visible from every admin screen, not only when you go looking.
  let overdueThreads = 0;
  try {
    const { prisma } = await import('@/lib/db');
    const { OVERDUE_AFTER_MS } = await import('@/lib/advisors');
    const rows: Array<{ advisorRequestedAt: Date; comments: Array<{ authorType: string; createdAt: Date }> }> =
      await prisma.userJourneyAnswer.findMany({
        where: { advisorRequestedAt: { not: null }, user: { advisorId: { not: null } } },
        select: {
          advisorRequestedAt: true,
          comments: { select: { authorType: true, createdAt: true } },
        },
      });
    const now = Date.now();
    for (const r of rows) {
      let lastFromHouse: number | null = null;
      let lastFromEntrepreneur = r.advisorRequestedAt.getTime();
      for (const c of r.comments) {
        const at = c.createdAt.getTime();
        if (c.authorType === 'ENTREPRENEUR') lastFromEntrepreneur = Math.max(lastFromEntrepreneur, at);
        else lastFromHouse = Math.max(lastFromHouse ?? 0, at);
      }
      const awaiting = lastFromHouse === null || lastFromEntrepreneur > lastFromHouse;
      if (awaiting && now - lastFromEntrepreneur > OVERDUE_AFTER_MS) overdueThreads += 1;
    }
  } catch {
    // A DB hiccup must not take down every admin page for a badge.
  }

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <div className="flex">
        <AdminSidebar user={adminUser} badges={{ '/admin/advisor-threads': overdueThreads }} />
        <main className="flex-1 mr-0 lg:mr-64">
          {children}
        </main>
      </div>
    </div>
  );
}