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

  // Auto-provisioned accounts log in with a temp password and must pick a
  // permanent one before they get to the portal. The forced set-password
  // page lives outside this layout (at /onboarding/set-password) so there
  // is no redirect loop and it can be styled standalone.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session.user as any).mustChangePassword) {
    redirect('/onboarding/set-password');
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
