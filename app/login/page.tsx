import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginContent } from './LoginContent';

export const metadata: Metadata = {
  title: 'התחברות | WeCcelerate',
  description: 'התחברו לפורטל היזמים של WeCcelerate',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // A signed-in user has no business on the login form — "כניסה לפורטל" from
  // the homepage should drop them straight into their dashboard. Sending them
  // to /portal (not a role-specific URL) reuses the portal layout's existing
  // routing: MENTOR → /advisor, mustChangePassword → set-password, everyone
  // else → /portal/dashboard. This is the same destination a fresh login uses.
  const session = await auth();
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    // Relative paths only — a full URL here would be an open redirect.
    const dest =
      callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : '/portal';
    redirect(dest);
  }

  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
