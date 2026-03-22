'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES
// =============================================================================

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, dir } = useLanguage();
  const callbackUrl = searchParams.get('callbackUrl') || '/portal';
  const errorParam = searchParams.get('error');

  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isRtl = dir === 'rtl';

  // Validation
  function validateEmail(email: string): string | undefined {
    if (!email) return t('login.form.error.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return t('login.form.error.emailInvalid');
    }
    return undefined;
  }

  function validatePassword(password: string): string | undefined {
    if (!password) return t('login.form.error.passwordRequired');
    if (password.length < 6) return t('login.form.error.passwordShort');
    return undefined;
  }

  // Handle OAuth error from URL
  const getInitialError = (): string | undefined => {
    if (errorParam === 'OAuthAccountNotLinked') {
      return t('login.form.error.oauthLinked');
    }
    if (errorParam === 'CredentialsSignin') {
      return t('login.form.error.wrongCredentials');
    }
    return undefined;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    // Add initial OAuth error if present
    const initialError = getInitialError();
    if (initialError && !newErrors.general) {
      newErrors.general = initialError;
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          redirect: false,
          callbackUrl,
        });


        if (result?.error) {
          let errorMessage = t('login.form.error.wrongCredentials');

          if (result.error.includes('נסיונות התחברות רבים') || result.error.includes('Too many')) {
            errorMessage = t('login.form.error.tooManyAttempts');
          } else if (result.error.includes('החשבון אינו פעיל') || result.error.includes('inactive')) {
            errorMessage = t('login.form.error.accountInactive');
          } else if (result.error.includes('Google')) {
            errorMessage = t('login.form.error.googleAccount');
          } else if (result.error.includes('שגיאה בשרת') || result.error.includes('server')) {
            errorMessage = t('login.form.error.serverError');
          }

          setErrors({ general: errorMessage });
          return;
        }

        if (result?.ok) {
          setIsSuccess(true);
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: t('login.form.error.loginError') });
      }
    });
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* General Error */}
        <AnimatePresence mode="wait">
          {(errors.general || getInitialError()) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-red-400 text-sm">
                {errors.general || getInitialError()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State */}
        <AnimatePresence mode="wait">
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
              role="status"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-emerald-400 text-sm">
                {t('login.form.redirecting')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-white/70">
            {t('login.form.email')}
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
              value={formData.email}
              onChange={handleChange}
              disabled={isPending || isSuccess}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(
                'w-full py-3 rounded-xl',
                isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4',
                'bg-white/[0.05] border text-white placeholder-white/30',
                'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.email ? 'border-red-500' : 'border-white/[0.08]'
              )}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-red-400 text-sm" role="alert">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-white/70">
              {t('login.form.password')}
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-[#c8a951] hover:text-[#e8d48b] transition-colors"
            >
              {t('login.form.forgotPassword')}
            </a>
          </div>
          <div className="relative">
            <div className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-white/30`}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isPending || isSuccess}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
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
              aria-label={showPassword ? t('login.form.hidePassword') : t('login.form.showPassword')}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-red-400 text-sm" role="alert">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-white/[0.1] bg-white/[0.05] text-[#c8a951] focus:ring-[#c8a951]/50"
          />
          <label htmlFor="remember" className="text-sm text-white/50">
            {t('login.form.rememberMe')}
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isPending || isSuccess}
          whileHover={{ scale: isPending || isSuccess ? 1 : 1.02 }}
          whileTap={{ scale: isPending || isSuccess ? 1 : 0.98 }}
          className={cn(
            'w-full py-4 rounded-xl font-bold',
            'flex items-center justify-center gap-2',
            'transition-all duration-300',
            isSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] shadow-lg shadow-[#c8a951]/25',
            'disabled:opacity-70 disabled:cursor-not-allowed'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('login.form.connecting')}</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>{t('login.form.successMsg')}</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>{t('login.form.submit')}</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Security Notice */}
      <div className="px-8 py-6 border-t border-white/[0.06]">
        <p className="text-xs text-white/30 text-center">
          {t('login.form.security1')}{' '}
          <br />
          {t('login.form.security2')}
        </p>
      </div>
    </div>
  );
}
