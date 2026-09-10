'use client';

/**
 * Floating WhatsApp button + the WhatsApp gate.
 *
 * Before: every WhatsApp button opened wa.me directly, so two thirds of all
 * inquiries never touched a form or Pipedrive. Now the button (and any other
 * WhatsApp link that calls `openWhatsAppGate()`) opens a small sheet: name,
 * phone, "what do you need". The lead is recorded through the same server
 * action as the contact form, then the chat opens with a prefilled message.
 *
 * The gate lives inside this component so every site layout that already
 * renders <WhatsAppFloat /> gets it without further wiring.
 */

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, X, MessageCircle, AlertCircle } from 'lucide-react';
import { submitContactForm, type FormState } from '@/app/actions/leads';
import { trackLead } from '@/lib/analytics/meta-pixel';
import { trackClick } from '@/lib/analytics/track';
import { LeadHiddenFields } from '@/components/forms/LeadHiddenFields';
import { useLanguage } from '@/lib/i18n';
import {
  WHATSAPP_GATE_EVENT,
  WHATSAPP_NEEDS,
  buildWhatsAppUrl,
  type WhatsAppGateOptions,
  type WhatsAppNeed,
} from '@/lib/leads/whatsapp-gate';

const initialState: FormState = { success: false, message: '' };

const inputBase =
  'w-full px-4 py-3 bg-white/[0.05] border text-white placeholder-white/30 rounded-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:border-transparent ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface WhatsAppFloatProps {
  /** Site key recorded on the lead (main | leumit | biz | landing). */
  site?: string;
}

export function WhatsAppFloat({ site = 'main' }: WhatsAppFloatProps) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<WhatsAppGateOptions>({ location: 'float-button' });
  const [need, setNeed] = useState<WhatsAppNeed | ''>('');
  const [name, setName] = useState('');
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const chatUrl = state.success ? buildWhatsAppUrl({ name, need, lang: lang === 'en' ? 'en' : 'he' }) : null;
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openGate = useCallback((o: WhatsAppGateOptions) => {
    setOpts(o);
    if (o.need) setNeed(o.need);
    setOpen(true);
    trackClick('click.whatsapp', { location: o.location, gate: 'open' });
  }, []);

  // Other WhatsApp buttons (navbar, contact page) dispatch this event.
  useEffect(() => {
    const handler = (e: Event) => openGate((e as CustomEvent<WhatsAppGateOptions>).detail);
    window.addEventListener(WHATSAPP_GATE_EVENT, handler);
    return () => window.removeEventListener(WHATSAPP_GATE_EVENT, handler);
  }, [openGate]);

  // Focus + Escape + scroll lock while the sheet is open.
  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  // Lead accepted → report it and try to open the chat right away.
  useEffect(() => {
    if (!state.success || !chatUrl) return;
    if (state.delivered) trackLead('whatsapp_gate');
    trackClick('click.whatsapp', { location: opts.location, gate: state.delivered ? 'lead' : 'pass' });
    try { window.open(chatUrl, '_blank', 'noopener'); } catch { /* popup blocked — button below */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const err = (k: string) => state.errors?.[k]?.[0];
  const needLabel = WHATSAPP_NEEDS.find((n) => n.value === need)?.[lang === 'en' ? 'en' : 'he'] ?? '';

  return (
    <>
      <button
        type="button"
        onClick={() => openGate({ location: 'float-button' })}
        aria-label={t('chrome.whatsapp.aria')}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-6 left-6 z-[9998] w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white shadow-lg shadow-black/25 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
      >
        <WhatsAppIcon className="w-7 h-7 fill-white" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wa-gate-title"
            className="relative w-full sm:max-w-md bg-[#0d1321] border border-white/[0.08] sm:rounded-sm shadow-2xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('wa.gate.close')}
              className="absolute top-3 end-3 w-9 h-9 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
                <WhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
              </div>
              <div>
                <h2 id="wa-gate-title" className="text-lg font-bold text-white leading-tight">{t('wa.gate.title')}</h2>
                <p className="text-white/50 text-xs mt-0.5">{t('wa.gate.sub')}</p>
              </div>
            </div>

            {state.success ? (
              <div className="space-y-4" role="status">
                <p className="text-emerald-300 text-sm leading-relaxed">
                  {state.delivered ? t('wa.gate.success') : state.message}
                </p>
                {chatUrl && (
                  <a
                    href={chatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick('click.whatsapp', { location: opts.location, gate: 'manual-open' })}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold py-3.5 px-6 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    {t('wa.gate.open')}
                  </a>
                )}
              </div>
            ) : (
              <form action={formAction} noValidate className="space-y-3">
                <LeadHiddenFields site={site} formType="whatsapp_gate" service={opts.service ?? null} />
                <input type="hidden" name="message" value={needLabel ? `${t('wa.gate.need')} ${needLabel}` : ''} />

                {!state.success && state.message && !state.errors && (
                  <p className="text-red-300 text-sm flex items-center gap-2" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />{state.message}
                  </p>
                )}

                <div>
                  <label htmlFor="wa-name" className="sr-only">{t('contact.form.name')}</label>
                  <input
                    ref={firstFieldRef}
                    id="wa-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    placeholder={`${t('contact.form.name')} *`}
                    aria-invalid={err('name') ? 'true' : undefined}
                    className={`${inputBase} ${err('name') ? 'border-red-500' : 'border-white/[0.08]'}`}
                  />
                  {err('name') && <p className="mt-1 text-xs text-red-400" role="alert">{err('name')}</p>}
                </div>
                <div>
                  <label htmlFor="wa-phone" className="sr-only">{t('contact.form.phone')}</label>
                  <input
                    id="wa-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                    disabled={isPending}
                    placeholder="050-000-0000 *"
                    aria-invalid={err('phone') ? 'true' : undefined}
                    className={`${inputBase} text-start ${err('phone') ? 'border-red-500' : 'border-white/[0.08]'}`}
                  />
                  {err('phone') && <p className="mt-1 text-xs text-red-400" role="alert">{err('phone')}</p>}
                </div>
                <div>
                  <label htmlFor="wa-email" className="sr-only">{t('contact.form.email')}</label>
                  <input
                    id="wa-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    disabled={isPending}
                    placeholder={t('wa.gate.emailOptional')}
                    aria-invalid={err('email') ? 'true' : undefined}
                    className={`${inputBase} text-start ${err('email') ? 'border-red-500' : 'border-white/[0.08]'}`}
                  />
                  {err('email') && <p className="mt-1 text-xs text-red-400" role="alert">{err('email')}</p>}
                </div>
                <fieldset>
                  <legend className="text-xs font-medium text-white/60 mb-2">{t('wa.gate.need')}</legend>
                  <div className="grid grid-cols-1 gap-1.5">
                    {WHATSAPP_NEEDS.map((n) => (
                      <label
                        key={n.value}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-sm border cursor-pointer text-sm transition-colors ${
                          need === n.value
                            ? 'border-[#25D366]/60 bg-[#25D366]/10 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-white/70 hover:bg-white/[0.05]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="need"
                          value={n.value}
                          checked={need === n.value}
                          onChange={() => setNeed(n.value)}
                          disabled={isPending}
                          className="accent-[#25D366]"
                        />
                        <span>{lang === 'en' ? n.en : n.he}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold py-3.5 px-6 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
                >
                  {isPending ? (
                    <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />{t('contact.form.sending')}</>
                  ) : (
                    <><WhatsAppIcon className="w-5 h-5 fill-white" />{t('wa.gate.submit')}</>
                  )}
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
