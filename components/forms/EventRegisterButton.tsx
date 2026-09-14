'use client';

/**
 * Event registration through our own form instead of an external link, so
 * every registrant is a lead in the dashboard and in Pipedrive. Opens a
 * small dialog (name, phone, email); on success shows a confirmation and,
 * when the event also has an external page, a link to it.
 */

import { useActionState, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, X, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { submitEventRegistration, type FormState } from '@/app/actions/leads';
import { trackLead } from '@/lib/analytics/meta-pixel';
import { LeadHiddenFields } from '@/components/forms/LeadHiddenFields';
import { useLanguage } from '@/lib/i18n';

const initialState: FormState = { success: false, message: '' };

const fieldBase =
  'flex items-center rounded-xl bg-white/[0.05] border px-3 min-h-[44px] focus-within:ring-2 focus-within:ring-[#c8a951]/40 focus-within:border-transparent';
const inputBase = 'w-full min-w-0 bg-transparent text-white placeholder-white/35 text-base focus:outline-none disabled:opacity-50';

interface Props {
  eventId: string;
  eventName: string;
  /** Optional external event page (kept as a secondary link after signup). */
  externalUrl?: string | null;
  site?: string;
}

export function EventRegisterButton({ eventId, eventName, externalUrl, site = 'main' }: Props) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(submitEventRegistration, initialState);
  const firstRef = useRef<HTMLInputElement>(null);
  const isEn = lang === 'en';

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (state.success && state.delivered) trackLead(`event:${eventId}`);
  }, [state, eventId]);

  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-5 py-2.5 text-sm font-bold rounded-lg hover:scale-[1.03] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a951]/50"
      >
        {t('events.register')}
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-reg-title"
            className="relative w-full sm:max-w-md bg-[#0d1321] border border-white/[0.08] sm:rounded-2xl p-6 max-h-[94dvh] overflow-y-auto overflow-x-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={isEn ? 'Close' : 'סגירה'}
              className="absolute top-3 end-3 w-9 h-9 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <p className="text-[#c8a951] text-xs font-semibold tracking-[0.12em] mb-1.5">{t('events.register')}</p>
            <h2 id="event-reg-title" className="text-white text-xl font-black leading-tight pe-8">{eventName}</h2>

            {state.success ? (
              <div className="mt-5 space-y-4" role="status">
                <p className="flex items-start gap-2 text-emerald-300 text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {state.message}
                </p>
                {externalUrl && (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    {isEn ? 'Event page' : 'לעמוד האירוע'}
                  </a>
                )}
              </div>
            ) : (
              <form action={formAction} noValidate className="mt-5 flex flex-col gap-3">
                <LeadHiddenFields site={site} formType="event" />
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="eventName" value={eventName} />

                {!state.success && state.message && !state.errors && (
                  <p className="text-red-300 text-sm flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />{state.message}
                  </p>
                )}

                {([
                  ['name', 'text', `${t('contact.form.name')} *`, 'name', firstRef, false],
                  ['phone', 'tel', '050-000-0000 *', 'tel', null, true],
                  ['email', 'email', 'email@example.com *', 'email', null, true],
                ] as const).map(([name, type, placeholder, autoComplete, ref, ltr]) => (
                  <div key={name}>
                    <label htmlFor={`ev-${name}`} className="sr-only">{name}</label>
                    <div className={`${fieldBase} ${err(name) ? 'border-red-500' : 'border-white/[0.08]'}`}>
                      <input
                        ref={ref ?? undefined}
                        id={`ev-${name}`}
                        name={name}
                        type={type}
                        required
                        autoComplete={autoComplete}
                        dir={ltr ? 'ltr' : undefined}
                        disabled={isPending}
                        placeholder={placeholder}
                        aria-invalid={err(name) ? 'true' : undefined}
                        className={`${inputBase} ${ltr ? 'text-start' : ''}`}
                      />
                    </div>
                    {err(name) && <p className="mt-1 text-xs text-red-400" role="alert">{err(name)}</p>}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a951]/50"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
                  {t('events.register')}
                </button>
                <p className="text-[11px] text-white/35 leading-relaxed">{t('wa.gate.privacy')}</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
