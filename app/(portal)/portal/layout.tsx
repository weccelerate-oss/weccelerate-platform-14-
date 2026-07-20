import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PortalNavbar } from './components/portal-navbar';
import { RouteCinematic } from './components/route-cinematic';

// Defense-in-depth alongside the robots.txt disallow — a stray link to a
// portal URL must not get it indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
    <div className="min-h-screen bg-[#070b1e] relative" dir="rtl">
      {/* Deep-glass ambience: breathing aurora blobs behind every portal page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="wc-aurora" style={{ width: 520, height: 420, background: 'rgba(200,169,81,.13)', top: '-8%', right: '-6%' }} />
        <div className="wc-aurora" style={{ width: 460, height: 460, background: 'rgba(70,90,220,.14)', top: '34%', left: '-9%', animationDelay: '-8s' }} />
        <div className="wc-aurora" style={{ width: 400, height: 360, background: 'rgba(130,80,220,.10)', bottom: '-8%', right: '24%', animationDelay: '-15s' }} />
      </div>
      <RouteCinematic />
      <div className="relative z-10">
        <PortalNavbar
          userName={session.user.name || 'יזם'}
          userEmail={session.user.email || ''}
        />
        {children}
      </div>
    </div>
  );
}
