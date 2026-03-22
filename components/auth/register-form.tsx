'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface FormData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  acceptTerms?: string;
  general?: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateName(name: string): string | undefined {
  if (!name.trim()) return 'נדרש שם מלא';
  if (name.trim().length < 2) return 'שם חייב להכיל לפחות 2 תווים';
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (!email) return 'נדרש אימייל';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'אימייל לא תקין';
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'נדרשת סיסמה';
  if (password.length < 8) return 'סיסמה חייבת להכיל לפחות 8 תווים';
  return undefined;
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  return strength;
}

function getStrengthLabel(strength: number): { label: string; color: string } {
  switch (strength) {
    case 0: return { label: '', color: '' };
    case 1: return { label: 'חלשה', color: 'text-red-400' };
    case 2: return { label: 'בינונית', color: 'text-yellow-400' };
    case 3: return { label: 'טובה', color: 'text-[#c8a951]' };
    case 4: return { label: 'חזקה', color: 'text-emerald-400' };
    default: return { label: '', color: '' };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getStrengthLabel(passwordStrength);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      acceptTerms: !formData.acceptTerms ? 'יש לאשר את תנאי השימוש' : undefined,
    };

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.acceptTerms;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setErrors({ general: data.message || 'שגיאה ביצירת החשבון. נסה שוב' });
          return;
        }

        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push('/login?registered=true');
      } catch (error) {
        console.error('Register error:', error);
        setErrors({ general: 'שגיאה בהרשמה. נסה שוב' });
      }
    });
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        {/* General Error */}
        <AnimatePresence mode="wait">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{errors.general}</span>
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
                החשבון נוצר בהצלחה! מעביר אותך להתחברות...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-white/70">
            שם מלא
          </label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <User className="w-5 h-5" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isPending || isSuccess}
              className={cn(
                'w-full pr-10 pl-4 py-3 rounded-xl',
                'bg-white/[0.05] border text-white placeholder-white/30',
                'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.name ? 'border-red-500' : 'border-white/[0.08]'
              )}
              placeholder="ישראל ישראלי"
            />
          </div>
          {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="reg-email" className="block text-sm font-medium text-white/70">
            אימייל
          </label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="reg-email"
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isPending || isSuccess}
              className={cn(
                'w-full pr-10 pl-4 py-3 rounded-xl',
                'bg-white/[0.05] border text-white placeholder-white/30',
                'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-right',
                errors.email ? 'border-red-500' : 'border-white/[0.08]'
              )}
              placeholder="your@email.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="reg-password" className="block text-sm font-medium text-white/70">
            סיסמה
          </label>
          <div className="relative">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isPending || isSuccess}
              className={cn(
                'w-full pr-10 pl-12 py-3 rounded-xl',
                'bg-white/[0.05] border text-white placeholder-white/30',
                'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.password ? 'border-red-500' : 'border-white/[0.08]'
              )}
              placeholder="לפחות 8 תווים"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-300',
                      passwordStrength >= level
                        ? level <= 1
                          ? 'bg-red-500'
                          : level <= 2
                          ? 'bg-yellow-500'
                          : level <= 3
                          ? 'bg-[#c8a951]'
                          : 'bg-emerald-400'
                        : 'bg-white/[0.06]'
                    )}
                  />
                ))}
              </div>
              <p className={cn('text-xs', strengthInfo.color)}>
                {strengthInfo.label}
              </p>
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={isPending || isSuccess}
              className="mt-1 w-4 h-4 rounded border-white/[0.1] bg-white/[0.05] text-[#c8a951] focus:ring-[#c8a951]/50"
            />
            <label htmlFor="acceptTerms" className="text-sm text-white/50 leading-relaxed">
              אני מאשר/ת את{' '}
              <Link href="/terms" className="text-[#c8a951] hover:text-[#e8d48b] transition-colors">
                תנאי השימוש
              </Link>{' '}
              ואת{' '}
              <Link href="/privacy" className="text-[#c8a951] hover:text-[#e8d48b] transition-colors">
                מדיניות הפרטיות
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-400 text-sm">{errors.acceptTerms}</p>
          )}
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
              <span>יוצר חשבון...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>נוצר בהצלחה!</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>צור חשבון</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
