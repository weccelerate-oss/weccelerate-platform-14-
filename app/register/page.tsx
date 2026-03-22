import { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { Loader2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'הרשמה | WeCcelerate',
  description: 'הצטרפו לפורטל היזמים של WeCcelerate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#050810] px-4 sm:px-6 py-12 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#050810] to-[#070b1e]" />

      {/* Ambient glow — gold behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8a951]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Image
              src="/images/logos/weccelerate-logo-wide.jpeg"
              alt="WeCcelerate"
              width={200}
              height={50}
              className="h-11 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            צרו חשבון חדש
          </h1>
          <p className="text-white/40 text-sm">
            הצטרפו לפורטל היזמים של WeCcelerate
          </p>
        </div>

        {/* Register Form */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
              <Loader2 className="w-8 h-8 text-[#c8a951] animate-spin" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-[#c8a951] hover:text-[#e8d48b] font-medium transition-colors">
              התחבר
            </Link>
          </p>
        </div>

        {/* Trust Badge */}
        <div className="mt-10 flex items-center justify-center gap-2 text-white/20">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs">מאובטח ומוצפן SSL</span>
        </div>
      </div>
    </main>
  );
}
