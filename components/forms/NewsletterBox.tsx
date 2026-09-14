'use client';

/**
 * Email-only signup at the end of a guide, for readers who are not ready to
 * talk yet. Goes through the same server action + spam filter as every lead
 * (formType `newsletter`); it is tagged separately so the leads dashboard
 * does not count it against the monthly target.
 */

import { useActionState, useEffect, useRef } from 'react';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitNewsletterSignup, type FormState } from '@/app/actions/leads';
import { LeadHiddenFields } from '@/components/forms/LeadHiddenFields';

const initialState: FormState = { success: false, message: '' };

export function NewsletterBox({ site = 'main' }: { site?: string }) {
  const [state, formAction, isPending] = useActionState(submitNewsletterSignup, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) formRef.current.reset();
  }, [state.success]);

  return (
    <section aria-label="הרשמה למדריכים" className="mt-14 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">מדריכים חדשים ליזמים, ישירות למייל</h2>
          <p className="mt-1 text-sm text-white/55 leading-relaxed">בלי פרסומות. אפשר להסיר את עצמכם בכל רגע.</p>
        </div>
        {state.success ? (
          <p className="flex items-center gap-2 text-emerald-300 text-sm" role="status">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            {state.message}
          </p>
        ) : (
          <form ref={formRef} action={formAction} noValidate className="flex-1 flex flex-col gap-2">
            <LeadHiddenFields site={site} formType="newsletter" />
            <div className="flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">אימייל</label>
              <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 min-h-[44px] focus-within:ring-2 focus-within:ring-[#c8a951]/40">
                <Mail className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden="true" />
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  dir="ltr"
                  disabled={isPending}
                  placeholder="email@example.com"
                  aria-invalid={state.errors?.email ? 'true' : undefined}
                  className="w-full min-w-0 bg-transparent text-white placeholder-white/35 text-base focus:outline-none disabled:opacity-50 text-start"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] font-bold px-5 rounded-xl min-h-[44px] hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a951]/50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
                הרשמה
              </button>
            </div>
            {(state.errors?.email?.[0] || (!state.success && state.message)) && (
              <p className="flex items-center gap-1.5 text-xs text-red-400" role="alert">
                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                {state.errors?.email?.[0] || state.message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
