'use client';

/**
 * One global listener for every email field on the site: when a field loses
 * focus with a mistyped mailbox domain (gmail.om, gmial.com, walla.co.ll…), a
 * "התכוונת ל…?" pill appears under it with a one-tap fix.
 *
 * The server corrects the same typos anyway (lib/leads/email-typo.ts); this
 * lets the person see the right address — and actually get their confirmation
 * email. Mounted once in the root layout; opt a field out with
 * data-email-hint="off".
 */

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fixEmailTypo } from '@/lib/leads/email-typo';

interface Hint {
  input: HTMLInputElement;
  suggestion: string;
  top: number;
  left: number;
  right: number;
}

const isEmailField = (el: EventTarget | null): el is HTMLInputElement =>
  el instanceof HTMLInputElement && (el.type === 'email' || el.name === 'email') && el.dataset.emailHint !== 'off';

function place(input: HTMLInputElement) {
  const r = input.getBoundingClientRect();
  return { top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right };
}

export function EmailTypoGuard() {
  const [hint, setHint] = useState<Hint | null>(null);

  useEffect(() => {
    const onBlur = (e: FocusEvent) => {
      if (!isEmailField(e.target)) return;
      const input = e.target;
      const fix = fixEmailTypo(input.value);
      if (fix.corrected) setHint({ input, suggestion: fix.email, ...place(input) });
    };
    // typing again in that field means they're handling it themselves
    const onInput = (e: Event) => setHint((h) => (h && h.input === e.target ? null : h));
    document.addEventListener('focusout', onBlur, true);
    document.addEventListener('input', onInput, true);
    return () => {
      document.removeEventListener('focusout', onBlur, true);
      document.removeEventListener('input', onInput, true);
    };
  }, []);

  // keep the pill under its field while the page (or a modal) scrolls
  const input = hint?.input;
  useEffect(() => {
    if (!input) return;
    const update = () => {
      const visible = input.isConnected && input.getBoundingClientRect().width > 0;
      setHint((h) => (!h ? h : visible ? { ...h, ...place(h.input) } : null));
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [input]);

  const apply = useCallback(() => {
    if (!hint) return;
    // native setter + input event so React-controlled fields pick the value up too
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(hint.input, hint.suggestion);
    hint.input.dispatchEvent(new Event('input', { bubbles: true }));
    setHint(null);
  }, [hint]);

  if (!hint) return null;
  const rtl = document.documentElement.dir !== 'ltr';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      style={{ position: 'fixed', top: hint.top, zIndex: 2147483000, ...(rtl ? { right: hint.right } : { left: hint.left }) }}
      className="flex items-center gap-2 rounded-xl border border-[#c8a951]/50 bg-[#0d1430] px-3 py-1.5 text-sm text-white shadow-lg shadow-black/30"
    >
      <span>
        התכוונת ל־
        <bdi dir="ltr" className="font-semibold text-[#e8d48b]">
          {hint.suggestion}
        </bdi>
        ?
      </span>
      <button
        type="button"
        onClick={apply}
        className="min-h-[36px] rounded-lg bg-gradient-to-r from-[#c8a951] to-[#e8d48b] px-3 text-xs font-bold text-[#070b1e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8d48b]"
      >
        כן, תקן
      </button>
      <button
        type="button"
        aria-label="סגור"
        onClick={() => setHint(null)}
        className="min-h-[36px] min-w-[28px] text-white/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8d48b] rounded"
      >
        ×
      </button>
    </div>,
    document.body,
  );
}
