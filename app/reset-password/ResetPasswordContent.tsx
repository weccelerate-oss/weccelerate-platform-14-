'use client';

import { useActionState, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { resetPassword, type AuthActionState } from '@/app/actions/auth';

// =============================================================================
// PASSWORD STRENGTH
// =============================================================================

function getPasswordStrength(pw: string): { level: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { level: 1, label: 'weak' };
  if (score <= 2) return { level: 2, label: 'fair' };
  if (score <= 3) return { level: 3, label: 'good' };
  return { level: 4, label: 'strong' };
}

const strengthColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-emerald-500',
};

// =============================================================================
// RESET PASSWORD CONTENT
// =============================================================================

export function ResetPasswordContent() {
  const { t, dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    resetPassword,
    { success: false, message: '' }
  );

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const strength = getPasswordStrength(password);

  // Redirect to login on success after a delay
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/login?reset=true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  // Check for missing token/email
  const isMissingParams = !token || !email;
  const isTokenError = !state.success && state.message && (state.message.includes('token') || state.message.includes('expired'));

  const validatePassword = (pw: string): boolean => {
    if (!pw) {
      setErrors((prev) => ({ ...prev, password: t('reset.error.passwordRequired') }));
      return false;
    }
    if (pw.length < 8) {
      setErrors((prev) => ({ ...prev, password: t('reset.error.passwordShort') }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  const validateConfirm = (confirm: string): boolean => {
    if (confirm !== password) {
      setErrors((prev) => ({ ...prev, confirm: t('reset.error.passwordMismatch') }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirm: undefined }));
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

        <AnimatePresence mode="wait">
          {/* Missing token/email */}
          {isMissingParams ? (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {t('reset.error.invalidToken')}
              </h1>
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 mt-4 text-[#c8a951] hover:text-[#e8d48b] font-medium transition-colors text-sm"
              >
                {t('reset.requestNew')}
              </Link>
            </motion.div>
          ) : state.success ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                {t('reset.successTitle')}
              </h1>
              <p className="text-white/50 text-sm mb-6">
                {t('reset.successText')}
              </p>
              <Link
                href="/login?reset=true"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {t('reset.goToLogin')}
              </Link>
            </motion.div>
          ) : (
            /* Form State */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Heading */}
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {t('reset.title')}
                </h1>
                <p className="text-white/40 text-sm">
                  {t('reset.subtitle')}
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
                <form action={formAction} className="p-8 space-y-6">
                  {/* Hidden fields */}
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="email" value={email} />

                  {/* Error from server */}
                  <AnimatePresence>
                    {(isTokenError || (!state.success && state.message && state.message !== '')) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-red-400 text-sm">
                            {isTokenError ? t('reset.error.invalidToken') : t('reset.error.generic')}
                          </span>
                          {isTokenError && (
                            <Link
                              href="/forgot-password"
                              className="block mt-2 text-[#c8a951] text-xs hover:text-[#e8d48b] transition-colors"
                            >
                              {t('reset.requestNew')}
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-white/70">
                      {t('reset.password')}
                    </label>
                    <div className="relative">
                      <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        dir="ltr"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) validatePassword(e.target.value);
                        }}
                        onBlur={() => password && validatePassword(password)}
                        disabled={isPending}
                        className={cn(
                          'w-full py-3 rounded-xl',
                          isRtl ? 'pr-10 pl-12' : 'pl-10 pr-12',
                          'bg-white/[0.05] border text-white placeholder-white/30',
                          'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          errors.password ? 'border-red-500' : 'border-white/[0.08]'
                        )}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors`}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm">{errors.password}</p>
                    )}

                    {/* Strength indicator */}
                    {password.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-colors duration-300',
                              level <= strength.level
                                ? strengthColors[strength.level]
                                : 'bg-white/[0.08]'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70">
                      {t('reset.confirmPassword')}
                    </label>
                    <div className="relative">
                      <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        dir="ltr"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirm) validateConfirm(e.target.value);
                        }}
                        onBlur={() => confirmPassword && validateConfirm(confirmPassword)}
                        disabled={isPending}
                        className={cn(
                          'w-full py-3 rounded-xl',
                          isRtl ? 'pr-10 pl-12' : 'pl-10 pr-12',
                          'bg-white/[0.05] border text-white placeholder-white/30',
                          'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          errors.confirm ? 'border-red-500' : 'border-white/[0.08]'
                        )}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors`}
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirm && (
                      <p className="text-red-400 text-sm">{errors.confirm}</p>
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
                        <span>{t('reset.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>{t('reset.submit')}</span>
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
