/**
 * Contact Form Component
 * 
 * A fully-featured contact form with:
 * - Server action integration for Pipedrive lead creation
 * - UTM parameter tracking
 * - Source URL tracking
 * - Hebrew RTL support
 * - Validation and error handling
 * - Success/error states
 * 
 * @example
 * <ContactForm 
 *   site="main" 
 *   formType="contact"
 *   onSuccess={(leadId) => console.log('Lead created:', leadId)}
 * />
 */

'use client';

import { useActionState, useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { submitContactForm, type FormState } from '@/app/actions/leads';
import { HoneypotFields } from '@/components/forms/HoneypotFields';
import { cn } from '@/lib/utils';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface ContactFormProps {
  /** Site identifier for tracking */
  site?: 'main' | 'leumit' | 'biz' | 'landing';
  /** Form type for tracking */
  formType?: string;
  /** Callback when form is successfully submitted */
  onSuccess?: (leadId?: string) => void;
  /** Custom class name */
  className?: string;
  /** Show company field */
  showCompany?: boolean;
  /** Show message field */
  showMessage?: boolean;
  /** Custom submit button text */
  submitText?: string;
  /** Title above form */
  title?: string;
  /** Description below title */
  description?: string;
  /** Compact mode (smaller spacing) */
  compact?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ContactForm({
  site = 'main',
  formType = 'contact',
  onSuccess,
  className,
  showCompany = true,
  showMessage = true,
  submitText = 'שליחה',
  title,
  description,
  compact = false,
}: ContactFormProps) {
  // Form state using React 19 useActionState
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitContactForm,
    { success: false, message: '' }
  );

  // Tracking data
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [referrer, setReferrer] = useState('');

  // Get referrer on mount (client-side only)
  useEffect(() => {
    setReferrer(document.referrer);
  }, []);

  // Call onSuccess when form is submitted successfully
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess(state.leadId);
    }
  }, [state.success, state.leadId, onSuccess]);

  // Build source URL with current path
  const sourceUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : pathname;

  // Extract UTM parameters
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';

  // Success state
  if (state.success) {
    return (
      <div className={cn(
        'rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center',
        'border border-emerald-200',
        className
      )}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-emerald-800">
          תודה על פנייתך!
        </h3>
        <p className="text-emerald-700">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {(title || description) && (
        <div className={cn('mb-6 text-center', compact && 'mb-4')}>
          {title && (
            <h3 className="mb-2 text-2xl font-bold text-slate-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {state.message && !state.success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{state.message}</p>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className={cn('space-y-4', compact && 'space-y-3')}>
        {/* Spam-filter envelope */}
        <HoneypotFields />
        {/* Hidden tracking fields */}
        <input type="hidden" name="sourceUrl" value={sourceUrl} />
        <input type="hidden" name="referrerUrl" value={referrer} />
        <input type="hidden" name="utm_source" value={utmSource} />
        <input type="hidden" name="utm_medium" value={utmMedium} />
        <input type="hidden" name="utm_campaign" value={utmCampaign} />
        <input type="hidden" name="site" value={site} />
        <input type="hidden" name="formType" value={formType} />

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            שם מלא <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            disabled={isPending}
            className={cn(
              'w-full rounded-lg border border-slate-300 px-4 py-3',
              'focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20',
              'disabled:bg-slate-100 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              state.errors?.name && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
            placeholder="ישראל ישראלי"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            אימייל <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            dir="ltr"
            className={cn(
              'w-full rounded-lg border border-slate-300 px-4 py-3',
              'focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20',
              'disabled:bg-slate-100 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              state.errors?.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
            placeholder="example@email.com"
          />
          {state.errors?.email && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            טלפון
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            disabled={isPending}
            dir="ltr"
            className={cn(
              'w-full rounded-lg border border-slate-300 px-4 py-3',
              'focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20',
              'disabled:bg-slate-100 disabled:cursor-not-allowed',
              'transition-colors duration-200',
              state.errors?.phone && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
            placeholder="050-123-4567"
          />
          {state.errors?.phone && (
            <p className="mt-1 text-sm text-red-600">{state.errors.phone[0]}</p>
          )}
        </div>

        {/* Company */}
        {showCompany && (
          <div>
            <label htmlFor="company" className="mb-1 block text-sm font-medium text-slate-700">
              שם חברה / עסק
            </label>
            <input
              type="text"
              id="company"
              name="company"
              disabled={isPending}
              className={cn(
                'w-full rounded-lg border border-slate-300 px-4 py-3',
                'focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20',
                'disabled:bg-slate-100 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
              placeholder="שם החברה שלך"
            />
          </div>
        )}

        {/* Message */}
        {showMessage && (
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700">
              הודעה
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              disabled={isPending}
              className={cn(
                'w-full rounded-lg border border-slate-300 px-4 py-3',
                'focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20',
                'disabled:bg-slate-100 disabled:cursor-not-allowed',
                'transition-colors duration-200 resize-none'
              )}
              placeholder="במה נוכל לעזור לך?"
            />
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full rounded-lg px-6 py-3 font-semibold text-white',
            'bg-gradient-to-l from-royal-600 to-royal-700',
            'hover:from-royal-700 hover:to-royal-800',
            'focus:outline-none focus:ring-2 focus:ring-royal-500/50 focus:ring-offset-2',
            'disabled:opacity-70 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'flex items-center justify-center gap-2'
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>שולח...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5 rotate-180" />
              <span>{submitText}</span>
            </>
          )}
        </button>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-500">
          בלחיצה על &quot;{submitText}&quot; אני מסכים/ה ל
          <a href="/privacy" className="text-royal-600 hover:underline">
            מדיניות הפרטיות
          </a>
        </p>
      </form>
    </div>
  );
}

// =============================================================================
// NEWSLETTER FORM
// =============================================================================

interface NewsletterFormProps {
  site?: string;
  className?: string;
  placeholder?: string;
  buttonText?: string;
}

export function NewsletterForm({
  site = 'main',
  className,
  placeholder = 'כתובת האימייל שלך',
  buttonText = 'הרשמה',
}: NewsletterFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    formData.set('site', site);
    formData.set('sourceUrl', typeof window !== 'undefined' ? window.location.href : pathname);
    formData.set('utm_source', searchParams.get('utm_source') || '');

    try {
      const { submitNewsletterSignup } = await import('@/app/actions/leads');
      const result = await submitNewsletterSignup({ success: false, message: '' }, formData);
      
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch {
      setError('אירעה שגיאה. נא לנסות שוב.');
    } finally {
      setIsPending(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn('flex items-center gap-2 text-emerald-600', className)}>
        <CheckCircle2 className="h-5 w-5" />
        <span>תודה! נרשמת בהצלחה לניוזלטר</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <HoneypotFields />
      <input
        type="email"
        name="email"
        required
        disabled={isPending}
        placeholder={placeholder}
        dir="ltr"
        className={cn(
          'flex-1 rounded-lg border border-slate-300 px-4 py-2',
          'focus:border-royal-500 focus:outline-none focus:ring-2 focus:ring-royal-500/20',
          'disabled:bg-slate-100',
          error && 'border-red-500'
        )}
      />
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'rounded-lg bg-royal-600 px-6 py-2 font-medium text-white',
          'hover:bg-royal-700 disabled:opacity-70',
          'transition-colors duration-200'
        )}
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : buttonText}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </form>
  );
}

export default ContactForm;
