import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SetPasswordForm } from './SetPasswordForm';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'הגדרת סיסמה חדשה — WeCcelerate',
};

export const dynamic = 'force-dynamic';

export default async function SetPasswordPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/onboarding/set-password');
  }

  // If the user already has a permanent password (no flag), send them straight to the portal.
  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { mustChangePassword: true, name: true, email: true },
  });

  if (!u || u.mustChangePassword === false) {
    redirect('/portal');
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#050810] px-4 sm:px-6 py-12 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#050810] to-[#070b1e]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8a951]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-3">
            שלב חד פעמי
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            ברוך הבא, {u.name}
          </h1>
          <p className="text-white/55 text-sm">
            לפני הכניסה הראשונה לפורטל — בחר סיסמה קבועה במקום הסיסמה הזמנית.
          </p>
        </div>

        <SetPasswordForm userEmail={u.email} />
      </div>
    </main>
  );
}
