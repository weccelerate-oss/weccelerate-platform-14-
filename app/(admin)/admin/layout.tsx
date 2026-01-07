/**
 * Admin Layout
 * 
 * Protected layout for admin-only pages.
 * Verifies ADMIN role before rendering.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AdminSidebar } from './components/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify authentication and admin role
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/portal/dashboard?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-slate-100" dir="rtl">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar user={session.user} />
        
        {/* Main content */}
        <main className="flex-1 mr-64">
          {children}
        </main>
      </div>
    </div>
  );
}
