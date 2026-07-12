/**
 * /enter?t=<token> — one-click portal entry from re-engagement emails.
 *
 * The page auto-submits the sign-in form on load (client helper), so for the
 * entrepreneur it feels like: click the email button → you're in the portal.
 * Their existing password is untouched and keeps working at /login.
 */

import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { AutoSubmit } from './auto-submit';

export const dynamic = 'force-dynamic';

export default async function EnterPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  if (!t) redirect('/login');

  async function enter() {
    'use server';
    try {
      await signIn('magic-token', { token: t, redirectTo: '/portal' });
    } catch (err) {
      // NEXT_REDIRECT is the SUCCESS path (signIn redirects) — rethrow it.
      if (err && typeof err === 'object' && 'digest' in err && String((err as { digest: string }).digest).startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      // Invalid/expired link → the normal login still works.
      redirect('/login?error=link-expired');
    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#070b1e] px-4 font-heebo"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#c8a951]/25 bg-white/[0.03] p-10 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">רגע, מכניסים אותך…</h1>
        <p className="mb-8 text-white/60">פותחים לך את פורטל היזמים של WeCcelerate.</p>
        <form id="magic-enter-form" action={enter}>
          <AutoSubmit formId="magic-enter-form" />
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#c8a951] to-[#e8d48b] px-6 py-3.5 font-bold text-[#070b1e]"
          >
            כניסה לפורטל ←
          </button>
        </form>
        <p className="mt-6 text-xs text-white/40">
          אם הכפתור לא עובד — הקישור פג תוקף. אפשר להיכנס כרגיל בעמוד ההתחברות.
        </p>
      </div>
    </main>
  );
}
