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

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <div className="flex">
        <AdminSidebar user={adminUser} />
        <main className="flex-1 mr-0 lg:mr-64">
          {children}
        </main>
      </div>
    </div>
  );
}