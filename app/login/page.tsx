/**
 * Login Page
 * 
 * Secure authentication page for the Entrepreneur Portal.
 * Features:
 * - Email/Password login with validation
 * - Google OAuth (optional)
 * - Rate limiting feedback
 * - Accessible design
 * - RTL support for Hebrew
 * 
 * @module app/login/page
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'התחברות | WeCcelerate',
  description: 'התחברו לפורטל היזמים של WeCcelerate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12"
      dir="rtl"
    >
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/20 mb-4">
            <span className="text-2xl font-bold text-white">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            ברוכים הבאים
          </h1>
          <p className="text-slate-400">
            התחברו לפורטל היזמים של WeCcelerate
          </p>
        </div>

        {/* Login Form */}
        <Suspense 
          fallback={
            <div className="flex items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            אין לך חשבון?{' '}
            <a href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              הרשמה
            </a>
          </p>
          <p className="mt-4 text-xs text-slate-600">
            © 2024 WeCcelerate. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </main>
  );
}
