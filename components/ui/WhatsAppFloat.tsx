'use client';

/**
 * Floating WhatsApp button + the WhatsApp gate ("gold card" direction).
 *
 * Before: every WhatsApp button opened wa.me directly, so two thirds of all
 * inquiries never touched a form or Pipedrive. Now the button (and any other
 * WhatsApp link that calls `openWhatsAppGate()`) opens a card: what do you
 * need (icon tiles), name, phone, optional email. The lead is recorded
 * through the same server action as the contact form, then the chat opens
 * with a prefilled message.
 *
 * The gate lives inside this component so every site layout that already
 * renders <WhatsAppFloat /> gets it without further wiring.
 */

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, X, MessageCircle, AlertCircle, ArrowLeft, User, Phone, Mail, MoreHorizontal } from 'lucide-react';
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

const fieldBase =
  'flex items-center gap-2 rounded-xl bg-white/[0.05] border px-3 py-2.5 sm:py-3 min-h-[44px] ' +
  'focus-within:ring-2 focus-within:ring-[#c8a951]/40 focus-within:border-transparent';
const inputBase =
  'w-full min-w-0 bg-transparent text-white placeholder-white/35 text-base sm:text-[15px] focus:outline-none disabled:opacity-50';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Stroke icons for the "what do you need" tiles, one consistent 2px style. */
function NeedIcon({ need, className }: { need: WhatsAppNeed; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (need) {
    case 'idea':
      return <svg {...common}><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" /></svg>;
    case 'product':
      return <svg {...common}><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>;
    case 'funding':
      return <svg {...common}><circle cx="8" cy="8" r="6" /><path d="M18.1 9.9A6 6 0 1 1 9.9 18.1" /><path d="M7 6h2v4" /></svg>;
    case 'medtech':
      return <svg {...common}><path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6z" /><path d="M3 12h4l2-3 2 5 2-2h4" /></svg>;
    default:
      return <MoreHorizontal className={className} aria-hidden="true" />;
  }
}

interface WhatsAppFloatProps {
  /** Site key recorded on the lead (main | leumit | biz | landing). */
  site?: string;
}

export function WhatsAppFloat({ site = 'main' }: WhatsAppFloatProps) {
  const { t, lang, dir } = useLanguage();
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

  // Focus + Escape + scroll lock while the card is open.
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
  const isEn = lang === 'en';
  const needLabel = WHATSAPP_NEEDS.find((n) => n.value === need)?.[isEn ? 'en' : 'he'] ?? '';
  const tiles = WHATSAPP_NEEDS.filter((n) => n.value !== 'other');
  const other = WHATSAPP_NEEDS.find((n) => n.value === 'other');

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
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(360px_300px_at_50%_30%,rgba(200,169,81,0.12),transparent_70%)]" aria-hidden="true" />

          {/* Gold → green hairline frame around the card */}
          <div className="relative w-full sm:max-w-[400px] p-px sm:rounded-[20px] bg-gradient-to-br from-[#e8d48b] via-[#c8a951]/20 to-[#25D366]/50 shadow-2xl">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="wa-gate-title"
              className="relative bg-[#0d1321] sm:rounded-[19px] p-5 sm:p-6 max-h-[94dvh] overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('wa.gate.close')}
                className="absolute top-3 end-3 w-9 h-9 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* Header: eyebrow + headline, WhatsApp badge at the far end */}
              <div className="flex items-start justify-between gap-3 pe-8">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[#c8a951] text-xs font-semibold tracking-[0.12em]">{t('wa.gate.eyebrow')}</span>
                  <h2 id="wa-gate-title" className="text-white text-[22px] sm:text-[26px] font-black leading-[1.15] whitespace-pre-line text-balance">
                    {state.success ? t('wa.gate.successTitle') : t('wa.gate.headline')}
                  </h2>
                  <p className="text-white/55 text-sm leading-relaxed">
                    {state.success ? (state.delivered ? t('wa.gate.success') : state.message) : t('wa.gate.sub')}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[14px] bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center flex-shrink-0">
                  <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-[#25D366]" />
                </div>
              </div>

              {state.success ? (
                <div className="mt-6" role="status">
                  {chatUrl && (
                    <a
                      href={chatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackClick('click.whatsapp', { location: opts.location, gate: 'manual-open' })}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#1ebe5b] hover:opacity-90 text-white font-extrabold py-[15px] px-6 rounded-xl transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
                    >
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                      {t('wa.gate.open')}
                    </a>
                  )}
                </div>
              ) : (
                <form action={formAction} noValidate className="mt-4 sm:mt-5 flex flex-col gap-3 sm:gap-4">
                  <LeadHiddenFields site={site} formType="whatsapp_gate" service={opts.service ?? null} />
                  <input type="hidden" name="message" value={needLabel ? `${t('wa.gate.need')} ${needLabel}` : ''} />

                  {!state.success && state.message && !state.errors && (
                    <p className="text-red-300 text-sm flex items-center gap-2" role="alert">
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />{state.message}
                    </p>
                  )}

                  {/* What do you need: 2×2 icon tiles + "something else" */}
                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-white/70 text-[13px] font-medium mb-1.5 sm:mb-2">{t('wa.gate.need')}</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {tiles.map((n) => {
                        const selected = need === n.value;
                        return (
                          <label
                            key={n.value}
                            className={`flex flex-row sm:flex-col items-center sm:items-start gap-2 px-3 py-2.5 sm:p-3 min-h-[44px] rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#c8a951]/50 ${
                              selected
                                ? 'border-[#c8a951] bg-[#c8a951]/10 text-white'
                                : 'border-white/10 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="need"
                              value={n.value}
                              checked={selected}
                              onChange={() => setNeed(n.value)}
                              disabled={isPending}
                              className="sr-only"
                            />
                            <NeedIcon need={n.value} className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] flex-shrink-0 ${selected ? 'text-[#e8d48b]' : 'text-white/70'}`} />
                            <span className={`text-[13px] sm:text-sm leading-tight ${selected ? 'font-semibold' : 'font-medium'}`}>{isEn ? n.en : n.he}</span>
                          </label>
                        );
                      })}
                    </div>
                    {other && (
                      <label
                        className={`flex items-center gap-2 px-3 py-2 sm:py-2.5 min-h-[40px] rounded-xl border border-dashed cursor-pointer text-[13px] transition-colors focus-within:ring-2 focus-within:ring-[#c8a951]/50 ${
                          need === 'other' ? 'border-[#c8a951] bg-[#c8a951]/10 text-white' : 'border-white/15 text-white/60 hover:bg-white/[0.04]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="need"
                          value="other"
                          checked={need === 'other'}
                          onChange={() => setNeed('other')}
                          disabled={isPending}
                          className="sr-only"
                        />
                        <NeedIcon need="other" className="w-4 h-4" />
                        {isEn ? other.en : other.he}
                      </label>
                    )}
                  </fieldset>

                  {/* Name + phone side by side, email below */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="wa-name" className="sr-only">{t('contact.form.name')}</label>
                      <div className={`${fieldBase} ${err('name') ? 'border-red-500' : 'border-white/[0.08]'}`}>
                        <User className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden="true" />
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
                          className={inputBase}
                        />
                      </div>
                      {err('name') && <p className="mt-1 text-xs text-red-400" role="alert">{err('name')}</p>}
                    </div>
                    <div>
                      <label htmlFor="wa-phone" className="sr-only">{t('contact.form.phone')}</label>
                      <div className={`${fieldBase} ${err('phone') ? 'border-red-500' : 'border-white/[0.08]'}`}>
                        <Phone className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden="true" />
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
                          className={`${inputBase} text-start`}
                        />
                      </div>
                      {err('phone') && <p className="mt-1 text-xs text-red-400" role="alert">{err('phone')}</p>}
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="wa-email" className="sr-only">{t('contact.form.email')}</label>
                      <div className={`${fieldBase} py-2.5 ${err('email') ? 'border-red-500' : 'border-white/[0.08]'}`}>
                        <Mail className="w-4 h-4 text-white/40 flex-shrink-0" aria-hidden="true" />
                        <input
                          id="wa-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          dir="ltr"
                          disabled={isPending}
                          placeholder={t('wa.gate.emailOptional')}
                          aria-invalid={err('email') ? 'true' : undefined}
                          className={`${inputBase} text-start sm:text-sm`}
                        />
                      </div>
                      {err('email') && <p className="mt-1 text-xs text-red-400" role="alert">{err('email')}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-2.5 pb-[env(safe-area-inset-bottom)]">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#25D366] to-[#1ebe5b] hover:opacity-90 text-white font-extrabold text-base py-3.5 sm:py-[15px] px-6 rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
                    >
                      {isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />{t('contact.form.sending')}</>
                      ) : (
                        <>{t('wa.gate.submit')}<ArrowLeft className={`w-[18px] h-[18px] ${dir === 'rtl' ? '' : 'rotate-180'}`} aria-hidden="true" /></>
                      )}
                    </button>
                    <p className="text-center text-[12px] text-white/40 leading-relaxed">{t('wa.gate.privacy')}</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
