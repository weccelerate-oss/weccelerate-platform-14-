'use client';

/**
 * Phone-only sticky bar at the bottom of content pages (guides, services,
 * comparisons, blog, pillar pages). Appears after the reader has scrolled a
 * screen, hides while the page's own lead form is on screen, and offers the
 * two actions that produce leads: the intro-call form and the WhatsApp gate.
 *
 * On phones it replaces the floating WhatsApp button (the float hides via
 * `body[data-sticky-bar]`), so nothing overlaps the bar.
 */

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Send } from 'lucide-react';
import { openWhatsAppGate } from '@/lib/leads/whatsapp-gate';
import { useLanguage } from '@/lib/i18n';

const SHOW_ON = [/^\/guides\/.+/, /^\/services\/.+/, /^\/comparisons/, /^\/blog/, /^\/funding-guide/, /^\/medtech-guide/, /^\/faq/, /^\/about/, /^\/investors/, /^\/medtech$/, /^\/tech-development/];
const SCROLL_TRIGGER = 480;

export function StickyLeadBar() {
  const pathname = usePathname() || '';
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const enabled = SHOW_ON.some((re) => re.test(pathname));

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_TRIGGER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, pathname]);

  // Hide the bar while any lead form is on screen — no point nagging next to it.
  useEffect(() => {
    if (!enabled) return;
    const forms = Array.from(document.querySelectorAll<HTMLElement>('#lead-form, form[data-lead-form]'));
    if (!forms.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setFormVisible(entries.some((e) => e.isIntersecting)), { threshold: 0.15 });
    forms.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, [enabled, pathname]);

  const visible = enabled && scrolled && !formVisible;

  useEffect(() => {
    if (visible) document.body.setAttribute('data-sticky-bar', '1');
    else document.body.removeAttribute('data-sticky-bar');
    return () => document.body.removeAttribute('data-sticky-bar');
  }, [visible]);

  if (!enabled) return null;

  const goToForm = () => {
    const el = document.querySelector<HTMLElement>('#lead-form') || document.querySelector<HTMLElement>('form[data-lead-form]');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => el.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true }), 600);
    } else {
      window.location.assign('/contact');
    }
  };

  return (
    <div
      aria-hidden={!visible}
      className={`md:hidden fixed inset-x-0 bottom-0 z-[9997] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
    >
      <div className="mx-3 mb-3 rounded-2xl border border-[#c8a951]/30 bg-[#0d1321]/95 backdrop-blur shadow-2xl shadow-black/40 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center gap-2">
        <button
          type="button"
          onClick={goToForm}
          tabIndex={visible ? 0 : -1}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] font-bold text-[15px] py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c8a951]/60"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          {t('lead.sticky.cta')}
        </button>
        <button
          type="button"
          onClick={() => openWhatsAppGate({ location: 'sticky-bar' })}
          tabIndex={visible ? 0 : -1}
          aria-label="WhatsApp"
          className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60"
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
