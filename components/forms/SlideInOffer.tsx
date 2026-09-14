'use client';

/**
 * Desktop-only slide-in on guide pages: after the reader has covered about
 * half the article, a small card slides in from the bottom corner offering
 * the intro call. One dismissal per session, never on phones (the sticky
 * bar covers those), never a blocking modal.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { trackClick } from '@/lib/analytics/track';

const KEY = 'wecc_slidein_dismissed';

export function SlideInOffer() {
  const pathname = usePathname() || '';
  const { t, dir } = useLanguage();
  const enabled = /^\/guides\/.+/.test(pathname) || /^\/(funding-guide|medtech-guide|comparisons)/.test(pathname);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(KEY) === '1'; } catch { /* private mode */ }
    if (dismissed) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const progress = (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight);
      const form = document.querySelector('#lead-form');
      const formOnScreen = form ? form.getBoundingClientRect().top < window.innerHeight : false;
      setShow(progress > 0.5 && !formOnScreen);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, pathname]);

  if (!enabled) return null;

  const dismiss = () => {
    setShow(false);
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
  };
  const go = () => {
    trackClick('click.email', { location: 'slide-in', kind: 'go-to-form' });
    dismiss();
    document.querySelector<HTMLElement>('#lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside
      role="complementary"
      aria-label={t('lead.slidein.title')}
      aria-hidden={!show}
      className={`hidden md:block fixed bottom-6 end-6 z-[9996] w-[320px] transition-all duration-300 ${show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}
    >
      <div className="relative rounded-2xl border border-[#c8a951]/30 bg-[#0d1321] p-5 shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('wa.gate.close')}
          tabIndex={show ? 0 : -1}
          className="absolute top-2 end-2 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/5"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
        <p className="text-[#c8a951] text-xs font-semibold tracking-[0.12em] mb-1">{t('lead.section.tag')}</p>
        <p className="text-white font-bold text-lg leading-snug pe-6">{t('lead.slidein.title')}</p>
        <p className="text-white/55 text-sm mt-1.5 leading-relaxed">{t('lead.slidein.text')}</p>
        <button
          type="button"
          onClick={go}
          tabIndex={show ? 0 : -1}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a951]/60"
        >
          {t('lead.sticky.cta')}
          <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? '' : 'rotate-180'}`} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
