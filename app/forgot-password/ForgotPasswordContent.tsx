'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { requestPasswordReset, type AuthActionState } from '@/app/actions/auth';

// =============================================================================
// FORGOT PASSWORD CONTENT
// =============================================================================

export function ForgotPasswordContent() {
  const { t, dir, lang } = useLanguage();
  const isRtl = dir === 'rtl';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  // Wrap server action to inject lang
  const actionWithLang = async (prevState: AuthActionState, formData: FormData) => {
    formData.set('lang', lang);
    return requestPasswordReset(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    actionWithLang,
    { success: false, message: '' }
  );

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError(t('forgot.error.emailRequired'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError(t('forgot.error.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[#050810] px-4 sm:px-6 py-12 relative overflow-hidden"
      dir={dir}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#050810] to-[#070b1e]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8a951]/[0.04] rounded-full blur-[160px] pointer-events-none" />
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

        {/* Success State */}
        <AnimatePresence mode="wait">
          {state.success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <MailCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {t('forgot.successTitle')}
              </h1>
              <p className="text-white/50 text-sm mb-2 leading-relaxed max-w-sm mx-auto">
                {t('forgot.successText')}
              </p>
              <p className="text-white/30 text-xs mb-8">
                {t('forgot.successCheck')}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[#c8a951] hover:text-[#e8d48b] font-medium transition-colors text-sm"
              >
                <BackArrow className="w-4 h-4" />
                {t('forgot.backToLogin')}
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t('forgot.title')}
                </h1>
                <p className="text-white/40 text-sm">
                  {t('forgot.subtitle')}
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
                <form action={formAction} className="p-8 space-y-6">
                  {/* Error */}
                  <AnimatePresence>
                    {!state.success && state.message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <span className="text-red-400 text-sm">
                          {t('forgot.error.generic')}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-white/70">
                      {t('forgot.email')}
                    </label>
                    <div className="relative">
                      <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`}>
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        onBlur={() => email && validateEmail(email)}
                        disabled={isPending}
                        className={cn(
                          'w-full py-3 rounded-xl',
                          isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4',
                          'bg-white/[0.05] border text-white placeholder-white/30',
                          'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          emailError ? 'border-red-500' : 'border-white/[0.08]'
                        )}
                        placeholder="your@email.com"
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-400 text-sm">{emailError}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isPending}
                    whileHover={{ scale: isPending ? 1 : 1.02 }}
                    whileTap={{ scale: isPending ? 1 : 0.98 }}
                    className={cn(
                      'w-full py-4 rounded-xl font-bold',
                      'flex items-center justify-center gap-2',
                      'bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e]',
                      'shadow-lg shadow-[#c8a951]/25',
                      'transition-all duration-300',
                      'disabled:opacity-70 disabled:cursor-not-allowed'
                    )}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('forgot.sending')}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>{t('forgot.submit')}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Back to login */}
              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  <BackArrow className="w-4 h-4" />
                  {t('forgot.backToLogin')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust Badge */}
        <div className="mt-10 flex items-center justify-center gap-2 text-white/20">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs">{t('login.form.security1')}</span>
        </div>
      </div>
    </main>
  );
}
