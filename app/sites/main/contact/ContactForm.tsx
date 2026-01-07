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
 */

import { useActionState, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitContactForm, type FormState } from '@/app/actions/leads';
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
// VALIDATION SCHEMA
// =============================================================================

const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'השם חייב להכיל לפחות 2 תווים')
    .max(100, 'השם ארוך מדי'),
  email: z
    .string()
    .min(1, 'אימייל הוא שדה חובה')
    .email('כתובת אימייל לא תקינה'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]{7,20}$/.test(val),
      'מספר טלפון לא תקין'
    ),
  company: z
    .string()
    .max(100, 'שם החברה ארוך מדי')
    .optional(),
  stage: z
    .enum(['idea', 'mvp', 'early', 'growth', 'scale', ''])
    .optional(),
  message: z
    .string()
    .max(2000, 'ההודעה ארוכה מדי')
    .optional(),
});

type FormData = z.infer<typeof ContactFormSchema>;
type FieldErrors = Partial<Record<keyof FormData, string>>;

// =============================================================================
// PROJECT STAGES
// =============================================================================

const PROJECT_STAGES = [
  { value: '', label: 'בחר שלב...' },
  { value: 'idea', label: 'רעיון / מחקר' },
  { value: 'mvp', label: 'בפיתוח MVP' },
  { value: 'early', label: 'שלב מוקדם (יש מוצר)' },
  { value: 'growth', label: 'צמיחה (יש לקוחות)' },
  { value: 'scale', label: 'Scale (מגייסים / מתרחבים)' },
];

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
  type = 'text',
  required = false,
  error,
  icon: Icon,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
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

  // Validate a single field
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    try {
      const fieldSchema = ContactFormSchema.shape[name];
      fieldSchema.parse(value);
      return undefined;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
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
        <div className="bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">ההודעה נשלחה בהצלחה!</h3>
            <p className="text-green-700 text-sm mt-1">{state.message}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!state.success && state.message && !state.errors && (
        <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">שגיאה בשליחת הטופס</h3>
            <p className="text-red-700 text-sm mt-1">{state.message}</p>
          </div>
        </div>
      )}

      {/* Name Field */}
      <FormField
        id="name"
        label="שם מלא"
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
          className={`
            w-full pr-10 pl-4 py-3 bg-white border text-slate-900
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${getFieldError('name') ? 'border-red-300' : 'border-slate-200'}
          `}
          placeholder="ישראל ישראלי"
        />
      </FormField>

      {/* Email Field */}
      <FormField
        id="email"
        label="אימייל"
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
          className={`
            w-full pr-10 pl-4 py-3 bg-white border text-slate-900
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${getFieldError('email') ? 'border-red-300' : 'border-slate-200'}
          `}
          placeholder="email@example.com"
          dir="ltr"
        />
      </FormField>

      {/* Phone Field */}
      <FormField
        id="phone"
        label="טלפון"
        error={getFieldError('phone')}
        icon={Phone}
      >
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={isPending}
          className={`
            w-full pr-10 pl-4 py-3 bg-white border text-slate-900
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${getFieldError('phone') ? 'border-red-300' : 'border-slate-200'}
          `}
          placeholder="050-000-0000"
          dir="ltr"
        />
      </FormField>

      {/* Company Field */}
      <FormField
        id="company"
        label="שם החברה / סטארטאפ"
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
            w-full pr-10 pl-4 py-3 bg-white border text-slate-900
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${getFieldError('company') ? 'border-red-300' : 'border-slate-200'}
          `}
          placeholder="שם הסטארטאפ"
        />
      </FormField>

      {/* Project Stage Dropdown */}
      <FormField
        id="stage"
        label="שלב הפרויקט"
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
            w-full pr-10 pl-4 py-3 bg-white border text-slate-900 appearance-none
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${getFieldError('stage') ? 'border-red-300' : 'border-slate-200'}
          `}
        >
          {PROJECT_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </FormField>

      {/* Message Field */}
      <FormField
        id="message"
        label="הודעה"
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
            w-full pr-10 pl-4 py-3 bg-white border text-slate-900 resize-none
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
            disabled:bg-slate-100 disabled:cursor-not-allowed
            ${getFieldError('message') ? 'border-red-300' : 'border-slate-200'}
          `}
          placeholder={
            serviceParam
              ? `מתעניין/ת בשירות: ${serviceParam}\n\nספרו לנו על הפרויקט שלכם...`
              : 'ספרו לנו על הסטארטאפ שלכם ובמה נוכל לעזור...'
          }
          defaultValue={
            sourceParam
              ? `הגעתי מ: ${sourceParam}\n\n`
              : ''
          }
        />
      </FormField>

      {/* Privacy Notice */}
      <p className="text-xs text-slate-500">
        בלחיצה על "שלח" אתם מסכימים ל
        <a href="/privacy" className="text-yellow-600 hover:underline">מדיניות הפרטיות</a>
        {' '}שלנו. המידע ישמש ליצירת קשר בלבד.
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className={`
          w-full flex items-center justify-center gap-3 
          bg-yellow-500 hover:bg-yellow-400 
          text-slate-900 font-semibold py-4 px-6
          transition-all duration-200
          disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
        `}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            שולח...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            שלח הודעה
          </>
        )}
      </button>
    </form>
  );
}
