import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PortalNavbar } from './components/portal-navbar';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/portal');
  }

  return (
    <div className="min-h-screen bg-[#070b1e]" dir="rtl">
      <PortalNavbar
        userName={session.user.name || 'יזם'}
        userEmail={session.user.email || ''}
      />
      {children}
    </div>
  );
}
