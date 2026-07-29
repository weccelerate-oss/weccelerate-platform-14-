/**
 * Onboarding layout.
 *
 * Exists purely to put a SessionProvider around the set-password flow: after
 * the entrepreneur picks a permanent password we clear `mustChangePassword`
 * inside the live session (useSession().update) instead of signing them out,
 * so a brand-new user walks straight into the portal still logged in.
 */

import { auth } from '@/lib/auth';
import { SessionProvider } from '@/components/providers/session-provider';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
