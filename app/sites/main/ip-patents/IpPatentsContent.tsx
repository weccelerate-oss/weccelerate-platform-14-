'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileCheck, Lightbulb, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// IP & PATENTS PAGE CONTENT — Client wrapper for i18n
// =============================================================================

export function IpPatentsContent() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <main id="main-content" dir={dir}>
      {/* Hero */}
      <section className="relative bg-[#070b1e] py-20 md:py-28">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />
        <div className="container-corporate">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('ip.breadcrumb.home')}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-[#c8a951]">{t('ip.breadcrumb.current')}</li>
            </ol>
          </nav>

          <h1 className="heading-display text-white mb-6">
            {t('ip.hero.title1')}
            <br />
            <span className="text-[#c8a951]">{t('ip.hero.title2')}</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {t('ip.hero.text')}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-[#070b1e]" aria-labelledby="ip-services-heading">
        <div className="container-corporate">
          <h2 id="ip-services-heading" className="heading-1 text-white mb-12">
            {t('ip.services.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Patent Registration */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <FileCheck className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('ip.patents.title')}</h3>
              <p className="text-white/60 mb-4">
                {t('ip.patents.text')}
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.patents.item1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.patents.item2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.patents.item3')}
                </li>
              </ul>
            </article>

            {/* Prototyping */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('ip.prototyping.title')}</h3>
              <p className="text-white/60 mb-4">
                {t('ip.prototyping.text')}
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.prototyping.item1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.prototyping.item2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.prototyping.item3')}
                </li>
              </ul>
            </article>

            {/* IP Strategy */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('ip.strategy.title')}</h3>
              <p className="text-white/60 mb-4">
                {t('ip.strategy.text')}
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.strategy.item1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.strategy.item2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('ip.strategy.item3')}
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#070b1e] text-center">
        <div className="container-corporate">
          <h2 className="heading-1 text-white mb-6">{t('ip.cta.title')}</h2>
          <p className="body-large text-white/40 max-w-xl mx-auto mb-10">
            {t('ip.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 font-semibold hover:scale-[1.03] transition-transform"
          >
            {t('ip.cta.button')}
            <DirArrow className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
