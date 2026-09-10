'use client';

/**
 * Compact lead form — the one form that goes on the homepage, every service
 * page and (later) inside guides.
 *
 * Four fields (name, phone, email, stage) + the offer line. On a delivered
 * lead it fires the conversion event and sends the visitor to /thanks, which
 * is the URL analytics and ad platforms count as a conversion. Anything the
 * server did NOT deliver (spam hold, rate limit) stays inline with the
 * server's message and fires nothing.
 */

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, AlertCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { submitContactForm, type FormState } from '@/app/actions/leads';
import { trackLead } from '@/lib/analytics/meta-pixel';
import { LeadHiddenFields } from '@/components/forms/LeadHiddenFields';
import { useLanguage } from '@/lib/i18n';

export interface LeadFormProps {
  /** Form type recorded on the lead: home_cta | service | guide_inline | ... */
  formType: string;
  /** Service slug preselected for this form (service pages). */
  service?: string | null;
  site?: string;
  /** Override the heading; defaults to the free-consultation offer. */
  heading?: string;
  subheading?: string;
  /** Show the optional message box (off by default to keep it short). */
  withMessage?: boolean;
  /** Extra classes for the outer <form>. */
  className?: string;
  /** Where to send the visitor after a delivered lead. */
  thanksPath?: string;
}

const initialState: FormState = { success: false, message: '' };

const inputBase =
  'w-full px-4 py-3 bg-white/[0.05] border text-white placeholder-white/30 rounded-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50 focus:border-transparent ' +
  'disabled:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed';

export function LeadForm({
  formType,
  service,
  site = 'main',
  heading,
  subheading,
  withMessage = false,
  className = '',
  thanksPath = '/thanks',
}: LeadFormProps) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  // A delivered lead is on its way to /thanks; keep the form locked meanwhile.
  const redirecting = state.success && !!state.delivered;

  useEffect(() => {
    if (state.success && state.delivered) {
      trackLead(service ? `${formType}:${service}` : formType);
      const qs = new URLSearchParams({ from: formType });
      if (service) qs.set('service', service);
      router.push(`${thanksPath}?${qs.toString()}`);
    } else if (state.success && formRef.current) {
      formRef.current.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const err = (name: string) => state.errors?.[name]?.[0];
  const stages: Array<[string, string]> = [
    ['', t('contact.form.stage.select')],
    ['idea', t('contact.form.stage.idea')],
    ['mvp', t('contact.form.stage.mvp')],
    ['early', t('contact.form.stage.early')],
    ['growth', t('contact.form.stage.growth')],
    ['scale', t('contact.form.stage.scale')],
  ];

  const busy = isPending || redirecting;

  return (
    <form ref={formRef} action={formAction} noValidate className={`space-y-4 ${className}`}>
      <LeadHiddenFields site={site} formType={formType} service={service ?? null} />

      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {heading ?? t('lead.offer.title')}
        </h3>
        <p className="text-white/55 text-sm mt-1.5 leading-relaxed">
          {subheading ?? t('lead.offer.sub')}
        </p>
      </div>

      {/* Server outcome that is NOT a delivered lead: rate-limit / spam hold */}
      {state.success && !state.delivered && !redirecting && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 flex items-start gap-2 text-sm" role="status">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-emerald-300">{state.message}</p>
        </div>
      )}
      {!state.success && state.message && !state.errors && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-2 text-sm" role="alert">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-red-300">{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${formType}-name`} className="sr-only">{t('contact.form.name')}</label>
          <input
            id={`${formType}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            disabled={busy}
            placeholder={`${t('contact.form.name')} *`}
            aria-invalid={err('name') ? 'true' : undefined}
            className={`${inputBase} ${err('name') ? 'border-red-500' : 'border-white/[0.08]'}`}
          />
          {err('name') && <p className="mt-1 text-xs text-red-400" role="alert">{err('name')}</p>}
        </div>
        <div>
          <label htmlFor={`${formType}-phone`} className="sr-only">{t('contact.form.phone')}</label>
          <input
            id={`${formType}-phone`}
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            disabled={busy}
            placeholder="050-000-0000 *"
            aria-invalid={err('phone') ? 'true' : undefined}
            className={`${inputBase} text-start ${err('phone') ? 'border-red-500' : 'border-white/[0.08]'}`}
          />
          {err('phone') && <p className="mt-1 text-xs text-red-400" role="alert">{err('phone')}</p>}
        </div>
        <div>
          <label htmlFor={`${formType}-email`} className="sr-only">{t('contact.form.email')}</label>
          <input
            id={`${formType}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
            disabled={busy}
            placeholder="email@example.com *"
            aria-invalid={err('email') ? 'true' : undefined}
            className={`${inputBase} text-start ${err('email') ? 'border-red-500' : 'border-white/[0.08]'}`}
          />
          {err('email') && <p className="mt-1 text-xs text-red-400" role="alert">{err('email')}</p>}
        </div>
        <div className="relative">
          <label htmlFor={`${formType}-stage`} className="sr-only">{t('contact.form.stage')}</label>
          <select
            id={`${formType}-stage`}
            name="stage"
            disabled={busy}
            defaultValue=""
            className={`${inputBase} appearance-none border-white/[0.08] pe-10`}
          >
            {stages.map(([v, label]) => (
              <option key={v} value={v} className="bg-[#0d1321] text-white">{label}</option>
            ))}
          </select>
          <svg className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {withMessage && (
        <div>
          <label htmlFor={`${formType}-message`} className="sr-only">{t('contact.form.message')}</label>
          <textarea
            id={`${formType}-message`}
            name="message"
            rows={3}
            disabled={busy}
            placeholder={t('contact.form.placeholder.message')}
            className={`${inputBase} border-white/[0.08] resize-none`}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] hover:opacity-90 text-[#070b1e] font-bold py-3.5 px-6 rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#c8a951]/50"
      >
        {busy ? (
          <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />{t('contact.form.sending')}</>
        ) : (
          <><Send className="w-5 h-5" aria-hidden="true" />{t('lead.form.button')}</>
        )}
      </button>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/45">
        <li className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" aria-hidden="true" />{t('lead.trust.reply')}</li>
        <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />{t('lead.trust.privacy')}</li>
      </ul>
      <p className="text-[11px] text-white/35 leading-relaxed">
        {t('contact.form.privacy')}
        <a href={lang === 'en' ? '/en/privacy' : '/privacy'} className="text-[#c8a951] hover:text-[#e8d48b]">{t('contact.form.privacyLink')}</a>
        {t('contact.form.privacySuffix')}
      </p>
    </form>
  );
}
