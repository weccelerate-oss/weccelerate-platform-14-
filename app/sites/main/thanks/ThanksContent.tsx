'use client';

/**
 * /thanks — the page every delivered lead lands on.
 *
 * Its URL is the conversion goal for GA4, Google Ads and Meta, so it must
 * only be reachable after a real submission (forms redirect here; direct
 * visits are harmless but noindex). Content: what happens next, three
 * guides to read meanwhile, and a direct line for anything urgent.
 */

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Phone, MessageCircle, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { TrackedLink } from '@/components/ui/TrackedLink';
import { useLanguage } from '@/lib/i18n';
import { WHATSAPP_PHONE } from '@/lib/leads/whatsapp-gate';

/** Slugs from lib/seo/guides-catalog.ts. English readers get the guides hub. */
const GUIDES: Array<{ slug: string; he: string; en: string }> = [
  { slug: 'eich-lehakim-startup', he: 'איך מקימים סטארטאפ: המדריך המלא', en: 'How to start a startup: the full guide' },
  { slug: 'pitch-deck-startup', he: 'איך בונים מצגת משקיעים שמגייסת', en: 'Building a pitch deck that raises' },
  { slug: 'eich-bonim-mvp', he: 'MVP: מה לבנות קודם ומה לדחות', en: 'MVP: what to build first' },
];

export default function ThanksContent() {
  const { t, lang, dir } = useLanguage();
  const params = useSearchParams();
  const from = params.get('from') || '';
  const isWhatsApp = from === 'whatsapp_gate';
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <main className="relative min-h-[80vh] bg-[#070b1e] pt-32 pb-24 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#c8a951]/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="container-corporate relative z-10 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" aria-hidden="true" />
          </div>
          <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em]">{t('thanks.tag')}</p>
        </div>

        <h1 className="heading-display text-white mb-5 text-balance">{t('thanks.title')}</h1>
        <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-2xl">
          {isWhatsApp ? t('thanks.sub.whatsapp') : t('thanks.sub')}
        </p>

        <ol className="space-y-4 mb-12">
          {[t('thanks.step1'), t('thanks.step2'), t('thanks.step3')].map((step, i) => (
            <li key={step} className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full border border-[#c8a951]/40 text-[#c8a951] text-sm font-bold flex items-center justify-center flex-shrink-0 tabular-nums">
                {i + 1}
              </span>
              <p className="text-white/80 leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          <TrackedLink
            trackAction="click.phone"
            trackMeta={{ location: 'thanks' }}
            href="tel:+972555647538"
            className="flex items-center gap-3 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] p-4 rounded-sm transition-colors"
          >
            <Phone className="w-5 h-5 text-[#c8a951]" aria-hidden="true" />
            <div>
              <p className="text-xs text-white/45">{t('thanks.urgent')}</p>
              <p className="text-white font-semibold" dir="ltr">055-564-7538</p>
            </div>
          </TrackedLink>
          <TrackedLink
            trackAction="click.whatsapp"
            trackMeta={{ location: 'thanks', gate: 'bypass-after-lead' }}
            href={`https://wa.me/${WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] p-4 rounded-sm transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" aria-hidden="true" />
            <div>
              <p className="text-xs text-white/45">WhatsApp</p>
              <p className="text-white font-semibold">{t('thanks.whatsapp')}</p>
            </div>
          </TrackedLink>
        </div>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#c8a951]" aria-hidden="true" />
          {t('thanks.meanwhile')}
        </h2>
        <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06] mb-12">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={lang === 'en' ? '/en/guides' : `/guides/${g.slug}`}
                className="flex items-center justify-between gap-4 py-4 text-white/80 hover:text-[#e8d48b] transition-colors"
              >
                <span>{lang === 'en' ? g.en : g.he}</span>
                <DirArrow className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <DirArrow className="w-4 h-4 rotate-180" aria-hidden="true" />
          {t('thanks.back')}
        </Link>
      </div>
    </main>
  );
}
