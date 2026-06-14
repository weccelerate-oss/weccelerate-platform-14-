'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  FAQ_CATALOG,
  FAQ_INTENTS,
  type FaqIntent,
} from '@/lib/seo/faq-catalog';

export default function FaqContent() {
  const { t, lang, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const grouped = (Object.keys(FAQ_INTENTS) as FaqIntent[]).map((intent) => ({
    intent,
    label: FAQ_INTENTS[intent],
    items: FAQ_CATALOG.filter((f) => f.intent === intent),
  }));

  return (
    <main
      className="min-h-screen bg-[#070b1e] text-white font-heebo"
      id="main-content"
    >
      {/* Hero band */}
      <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-14 md:pt-36 md:pb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(200,169,81,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/40">
            <Link href="/" className="hover:text-white/80 transition-colors">{t('faq.breadcrumb.home')}</Link>
            <span className="mx-2">›</span>
            <span aria-current="page" className="text-white/80">{t('faq.breadcrumb.current')}</span>
          </nav>

          <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-4">
            {t('faq.hero.eyebrow')}
          </p>
          <h1 className="mb-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            {t('faq.hero.title')}
          </h1>
          <p
            data-speakable
            className="max-w-3xl text-base md:text-lg leading-relaxed text-white/60"
          >
            {t('faq.hero.intro')}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        {/* Quick nav */}
        <nav
          aria-label="FAQ sections"
          className="mb-12 rounded-2xl border border-white/8 bg-white/[0.02] p-5"
        >
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#c8a951]">
            {t('faq.quicknav.heading')}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {grouped.map(({ intent, label, items }) => (
              <li key={intent}>
                <a
                  href={`#${intent}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-white/75 transition-colors hover:bg-white/[0.04] hover:text-[#e8d48b]"
                >
                  <span>{label[lang]}</span>
                  <span className="text-xs text-white/30">{items.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {grouped.map(({ intent, label, items }) => (
            <section key={intent} id={intent} className="scroll-mt-24">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{label[lang]}</h2>
                <div className="hidden md:block h-px w-20 self-end bg-gradient-to-l from-[#c8a951] to-transparent" />
              </div>
              <div className="space-y-3">
                {items.map((faq) => (
                  <details
                    key={faq.id}
                    id={faq.id}
                    className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 open:border-[#c8a951]/30 open:bg-[#c8a951]/[0.04] transition-colors"
                  >
                    <summary className="flex cursor-pointer items-start justify-between gap-3 text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                      <span>{faq.question[lang]}</span>
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 text-[#c8a951] transition group-open:rotate-180"
                      >
                        ⌄
                      </span>
                    </summary>
                    <div className="mt-4 leading-relaxed text-white/70">{faq.answer[lang]}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-16 relative overflow-hidden rounded-2xl border border-[#c8a951]/30 bg-gradient-to-br from-[#c8a951]/[0.08] via-transparent to-[#c8a951]/[0.04] p-10 text-center">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <p className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.22em] mb-3">
              {t('faq.cta.eyebrow')}
            </p>
            <h2 className="mb-3 text-2xl md:text-3xl font-bold">{t('faq.cta.title')}</h2>
            <p className="mb-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto">
              {t('faq.cta.text')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-7 py-3.5 text-base font-bold rounded-xl shadow-lg shadow-[#c8a951]/20 hover:shadow-xl hover:shadow-[#c8a951]/30 transition-all"
            >
              {t('faq.cta.button')}
              <DirArrow className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
