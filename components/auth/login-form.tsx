/**
 * Login Form Component
 * 
 * Secure login form with:
 * - Client-side validation
 * - Server action for authentication
 * - CSRF protection (handled by NextAuth)
 * - Rate limiting feedback
 * - Password visibility toggle
 * - Loading states
 * - Error handling
 * 
 * @module components/auth/login-form
 */

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
// VALIDATION
// =============================================================================

function validateEmail(email: string): string | undefined {
  if (!email) return 'נדרש אימייל';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'אימייל לא תקין';
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'נדרשת סיסמה';
  if (password.length < 6) return 'סיסמה חייבת להכיל לפחות 6 תווים';
  return undefined;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // Handle OAuth error from URL
  const getInitialError = (): string | undefined => {
    if (errorParam === 'OAuthAccountNotLinked') {
      return 'אימייל זה כבר רשום עם שיטת התחברות אחרת';
    }
    if (errorParam === 'CredentialsSignin') {
      return 'אימייל או סיסמה שגויים';
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
          // Handle specific error messages from the server
          let errorMessage = 'אימייל או סיסמה שגויים';
          
          if (result.error.includes('נסיונות התחברות רבים')) {
            errorMessage = 'נסיונות התחברות רבים מדי. נסה שוב בעוד 15 דקות';
          } else if (result.error.includes('החשבון אינו פעיל')) {
            errorMessage = 'החשבון אינו פעיל. אנא פנה לתמיכה';
          } else if (result.error.includes('Google')) {
            errorMessage = 'משתמש זה רשום באמצעות חשבון Google';
          } else if (result.error.includes('שגיאה בשרת')) {
            errorMessage = 'שגיאה בשרת. נסה שוב מאוחר יותר';
          }

          setErrors({ general: errorMessage });
          return;
        }

        if (result?.ok) {
          setIsSuccess(true);
          // Short delay for success animation
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'שגיאה בהתחברות. נסה שוב' });
      }
    });
  };

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    startTransition(async () => {
      await signIn('google', { callbackUrl });
    });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
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
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
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
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-400 text-sm">
                התחברת בהצלחה! מעביר אותך...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            אימייל
          </label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
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
              className={cn(
                'w-full pr-10 pl-4 py-3 rounded-xl',
                'bg-slate-800/50 border text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-right', // RTL alignment for Hebrew
                errors.email ? 'border-red-500' : 'border-slate-700'
              )}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              סיסמה
            </label>
            <a 
              href="/forgot-password" 
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              שכחת סיסמה?
            </a>
          </div>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
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
              className={cn(
                'w-full pr-10 pl-12 py-3 rounded-xl',
                'bg-slate-800/50 border text-white placeholder-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.password ? 'border-red-500' : 'border-slate-700'
              )}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
          />
          <label htmlFor="remember" className="text-sm text-slate-400">
            זכור אותי
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isPending || isSuccess}
          whileHover={{ scale: isPending || isSuccess ? 1 : 1.01 }}
          whileTap={{ scale: isPending || isSuccess ? 1 : 0.99 }}
          className={cn(
            'w-full py-4 rounded-xl font-semibold text-white',
            'flex items-center justify-center gap-2',
            'transition-all duration-300',
            isSuccess
              ? 'bg-emerald-600'
              : 'bg-gradient-to-l from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25',
            'disabled:opacity-70 disabled:cursor-not-allowed'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>מתחבר...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>התחברת בהצלחה!</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>התחבר</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Security Notice */}
      <div className="px-8 py-6 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          ההתחברות מאובטחת באמצעות הצפנת SSL.{' '}
          <br />
          לעולם לא נשתף את המידע שלך עם צד שלישי.
        </p>
      </div>
    </div>
  );
}
