'use client';

/**
 * Contact Form Component
 *
 * Features:
 * - Zod validation with instant feedback
 * - Server action integration (createLead)
 * - Referrer tracking
 * - Loading states
 * - Success/Error handling
 * - Project stage dropdown
 * - i18n support via useLanguage()
 */

import { useActionState, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitContactForm, type FormState } from '@/app/actions/leads';
import { useLanguage } from '@/lib/i18n';
import { z } from 'zod';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Briefcase,
} from 'lucide-react';

// =============================================================================
// VALIDATION SCHEMA (dynamic — needs t() at runtime)
// =============================================================================

function createSchema(t: (key: string) => string) {
  return z.object({
    name: z
      .string()
      .min(2, t('contact.form.name'))
      .max(100),
    email: z
      .string()
      .min(1, t('contact.form.email'))
      .email(t('contact.form.email')),
    phone: z
      .string()
      .min(1, t('contact.form.phone'))
      .refine(
        (val) => /^[+]?\d[\d\s\-()]{6,19}$/.test(val) && val.replace(/\D/g, '').length >= 7,
        t('contact.form.phone')
      ),
    company: z
      .string()
      .max(100)
      .optional(),
    stage: z
      .enum(['idea', 'mvp', 'early', 'growth', 'scale', ''])
      .optional(),
    message: z
      .string()
      .max(2000)
      .optional(),
  });
}

type FormData = z.infer<ReturnType<typeof createSchema>>;
type FieldErrors = Partial<Record<keyof FormData, string>>;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: FormState = {
  success: false,
  message: '',
};

// =============================================================================
// FORM FIELD COMPONENT
// =============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

function FormField({
  id,
  label,
  required = false,
  error,
  icon: Icon,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-white/70 mb-2">
        {label}
        {required && <span className="text-red-400 mr-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5 text-white/30" />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-400 flex items-center gap-1" role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ContactForm() {
  const { t, dir } = useLanguage();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  // Form state
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  // Client-side validation errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Track referrer
  const [referrer, setReferrer] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  // Get service param for pre-filling
  const serviceParam = searchParams.get('service');
  const sourceParam = searchParams.get('source');

  // Set referrer on mount (client-side only)
  useEffect(() => {
    setReferrer(document.referrer);
    setCurrentUrl(window.location.href);
  }, []);

  // Reset form on success
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
      setFieldErrors({});
      setTouched(new Set());
    }
  }, [state.success]);

  // Build schema with translations
  const schema = createSchema(t);

  // Validate a single field
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    try {
      const fieldSchema = schema.shape[name];
      fieldSchema.parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message;
      }
      return undefined;
    }
  };

  // Handle field blur (validate on blur)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));

    const error = validateField(name as keyof FormData, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Handle field change (clear error on change)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Only validate if field was touched
    if (touched.has(name)) {
      const error = validateField(name as keyof FormData, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Get combined errors (server + client)
  const getFieldError = (name: keyof FormData): string | undefined => {
    // Client-side error takes priority
    if (fieldErrors[name]) return fieldErrors[name];
    // Server-side errors
    if (state.errors?.[name]?.[0]) return state.errors[name][0];
    return undefined;
  };

  // Project stages (translated)
  const projectStages = [
    { value: '', label: t('contact.form.stage.select') },
    { value: 'idea', label: t('contact.form.stage.idea') },
    { value: 'mvp', label: t('contact.form.stage.mvp') },
    { value: 'early', label: t('contact.form.stage.early') },
    { value: 'growth', label: t('contact.form.stage.growth') },
    { value: 'scale', label: t('contact.form.stage.scale') },
  ];

  const isRtl = dir === 'rtl';

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
      noValidate
    >
      {/* Hidden tracking fields */}
      <input type="hidden" name="sourceUrl" value={currentUrl} />
      <input type="hidden" name="referrerUrl" value={referrer} />
      <input type="hidden" name="site" value="main" />
      {searchParams.get('service') && (
        <input type="hidden" name="service" value={searchParams.get('service') || ''} />
      )}
      {searchParams.get('utm_source') && (
        <input type="hidden" name="utm_source" value={searchParams.get('utm_source') || ''} />
      )}
      {searchParams.get('utm_medium') && (
        <input type="hidden" name="utm_medium" value={searchParams.get('utm_medium') || ''} />
      )}
      {searchParams.get('utm_campaign') && (
        <input type="hidden" name="utm_campaign" value={searchParams.get('utm_campaign') || ''} />
      )}

      {/* Success Message */}
      {state.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-start gap-3" role="status">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-emerald-400">{t('contact.form.successTitle')}</h3>
            <p className="text-emerald-400 text-sm mt-1">{state.message}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!state.success && state.message && !state.errors && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-red-400">{t('contact.form.errorTitle')}</h3>
            <p className="text-red-400 text-sm mt-1">{state.message}</p>
          </div>
        </div>
      )}

      {/* Name Field */}
      <FormField
        id="name"
        label={t('contact.form.name')}
        required
        error={getFieldError('name')}
        icon={User}
      >
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          aria-invalid={getFieldError('name') ? 'true' : undefined}
          aria-describedby={getFieldError('name') ? 'name-error' : undefined}
          className={`
            w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/[0.05] border text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed
            ${getFieldError('name') ? 'border-red-500' : 'border-white/[0.08]'}
          `}
          placeholder={t('contact.form.placeholder.name')}
        />
      </FormField>

      {/* Email Field */}
      <FormField
        id="email"
        label={t('contact.form.email')}
        required
        error={getFieldError('email')}
        icon={Mail}
      >
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          aria-invalid={getFieldError('email') ? 'true' : undefined}
          aria-describedby={getFieldError('email') ? 'email-error' : undefined}
          className={`
            w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/[0.05] border text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed
            ${getFieldError('email') ? 'border-red-500' : 'border-white/[0.08]'}
          `}
          placeholder="email@example.com"
          dir="ltr"
        />
      </FormField>

      {/* Phone Field */}
      <FormField
        id="phone"
        label={t('contact.form.phone')}
        required
        error={getFieldError('phone')}
        icon={Phone}
      >
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          autoComplete="tel"
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          aria-invalid={getFieldError('phone') ? 'true' : undefined}
          aria-describedby={getFieldError('phone') ? 'phone-error' : undefined}
          className={`
            w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/[0.05] border text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed
            ${getFieldError('phone') ? 'border-red-500' : 'border-white/[0.08]'}
          `}
          placeholder="050-000-0000"
          dir="ltr"
        />
      </FormField>

      {/* Company Field */}
      <FormField
        id="company"
        label={t('contact.form.company')}
        error={getFieldError('company')}
        icon={Building2}
      >
        <input
          type="text"
          id="company"
          name="company"
          autoComplete="organization"
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          className={`
            w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/[0.05] border text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed
            ${getFieldError('company') ? 'border-red-500' : 'border-white/[0.08]'}
          `}
          placeholder={t('contact.form.placeholder.company')}
        />
      </FormField>

      {/* Project Stage Dropdown */}
      <FormField
        id="stage"
        label={t('contact.form.stage')}
        error={getFieldError('stage')}
        icon={Briefcase}
      >
        <select
          id="stage"
          name="stage"
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          className={`
            w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/[0.05] border text-white appearance-none
            focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed
            ${getFieldError('stage') ? 'border-red-500' : 'border-white/[0.08]'}
          `}
        >
          {projectStages.map((stage) => (
            <option key={stage.value} value={stage.value} className="bg-[#0d1321] text-white">
              {stage.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </FormField>

      {/* Message Field */}
      <FormField
        id="message"
        label={t('contact.form.message')}
        error={getFieldError('message')}
        icon={MessageSquare}
      >
        <textarea
          id="message"
          name="message"
          rows={5}
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          className={`
            w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white/[0.05] border text-white placeholder-white/30 resize-none
            focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent
            disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed
            ${getFieldError('message') ? 'border-red-500' : 'border-white/[0.08]'}
          `}
          placeholder={
            serviceParam
              ? `${t('contact.form.placeholder.messageService')} ${serviceParam}\n\n${t('contact.form.placeholder.message')}`
              : t('contact.form.placeholder.message')
          }
          defaultValue={
            sourceParam
              ? `${t('contact.form.placeholder.messageFrom')} ${sourceParam}\n\n`
              : ''
          }
        />
      </FormField>

      {/* Privacy Notice */}
      <p className="text-xs text-white/40">
        {t('contact.form.privacy')}
        <a href="/privacy" className="text-[#c8a951] hover:text-[#e8d48b]">{t('contact.form.privacyLink')}</a>
        {t('contact.form.privacySuffix')}
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={`
          w-full flex items-center justify-center gap-3
          bg-gradient-to-r from-[#c8a951] to-[#e8d48b] hover:opacity-90
          text-[#070b1e] font-semibold py-4 px-6
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50
        `}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('contact.form.sending')}
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {t('contact.form.sendButton')}
          </>
        )}
      </button>
    </form>
  );
}
