'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, HeartPulse, Shield, FlaskConical, Stethoscope } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// MEDTECH PAGE CONTENT — Client wrapper for i18n
// =============================================================================

export function MedTechPageContent() {
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
                  {t('medtech.breadcrumb.home')}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-[#c8a951]">{t('medtech.breadcrumb.current')}</li>
            </ol>
          </nav>

          <h1 data-speakable className="heading-display text-white mb-6">
            {t('medtech.hero.title1')}
            <br />
            <span className="text-[#c8a951]">{t('medtech.hero.title2')}</span>
          </h1>
          <p data-speakable className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {t('medtech.hero.text')}
          </p>
        </div>
      </section>

      {/* Leumit Partnership */}
      <section
        className="section-padding bg-[#070b1e] border-b border-white/[0.06]"
        aria-labelledby="leumit-heading"
      >
        <div className="container-corporate">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
              {t('medtech.partnership.tag')}
            </span>
            <h2 id="leumit-heading" data-speakable className="heading-1 text-white mt-3 mb-6">
              {t('medtech.partnership.title')}
            </h2>
            <p data-speakable className="body-large text-white/60 mb-6">
              {t('medtech.partnership.text')}
            </p>
            <ul className="space-y-3">
              {[
                t('medtech.partnership.item1'),
                t('medtech.partnership.item2'),
                t('medtech.partnership.item3'),
                t('medtech.partnership.item4'),
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70">
                  <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* MedTech Differentiators — 4 Value Props */}
      <section className="section-padding bg-[#0d1321]" aria-labelledby="differentiators-heading">
        <div className="container-corporate">
          <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
            {t('medtech.diff.tag')}
          </span>
          <h2 id="differentiators-heading" className="heading-1 text-white mt-3 mb-4">
            {t('medtech.diff.title')}
          </h2>
          <p className="body-large text-white/60 max-w-3xl mb-12">
            {t('medtech.diff.text')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 1. Access to Medical Data */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('medtech.diff.data.title')}</h3>
              <p className="text-sm text-white/60 mb-4">
                {t('medtech.diff.data.text')}
              </p>
              <p className="text-xs font-semibold text-[#c8a951] uppercase">
                {t('medtech.diff.data.label')}
              </p>
            </article>

            {/* 2. Clinical Trials Management */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <Stethoscope className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('medtech.diff.trials.title')}</h3>
              <p className="text-sm text-white/60 mb-4">
                {t('medtech.diff.trials.text')}
              </p>
              <p className="text-xs font-semibold text-[#c8a951] uppercase">
                {t('medtech.diff.trials.label')}
              </p>
            </article>

            {/* 3. Market Research & Early-Stage Consulting */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <FlaskConical className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('medtech.diff.helsinki.title')}</h3>
              <p className="text-sm text-white/60 mb-4">
                {t('medtech.diff.helsinki.text')}
              </p>
              <p className="text-xs font-semibold text-[#c8a951] uppercase">
                {t('medtech.diff.helsinki.label')}
              </p>
            </article>

            {/* 4. Digital Health Innovation */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <HeartPulse className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('medtech.diff.digital.title')}</h3>
              <p className="text-sm text-white/60 mb-4">
                {t('medtech.diff.digital.text')}
              </p>
              <p className="text-xs font-semibold text-[#c8a951] uppercase">
                {t('medtech.diff.digital.label')}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Regulatory Support */}
      <section className="section-padding bg-[#070b1e]" aria-labelledby="regulatory-heading">
        <div className="container-corporate">
          <h2 id="regulatory-heading" className="heading-1 text-white mb-4">
            {t('medtech.regulatory.title')}
          </h2>
          <p className="body-large text-white/60 max-w-3xl mb-12">
            {t('medtech.regulatory.text')}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <article className="border border-white/[0.06] p-8">
              <FlaskConical className="w-8 h-8 text-[#c8a951] mb-4" />
              <h3 className="heading-3 text-white mb-3">{t('medtech.regulatory.helsinki.title')}</h3>
              <p className="text-white/60">
                {t('medtech.regulatory.helsinki.text')}
              </p>
            </article>

            <article className="border border-white/[0.06] p-8">
              <Stethoscope className="w-8 h-8 text-[#c8a951] mb-4" />
              <h3 className="heading-3 text-white mb-3">{t('medtech.regulatory.pilots.title')}</h3>
              <p className="text-white/60">
                {t('medtech.regulatory.pilots.text')}
              </p>
            </article>

            <article className="border border-white/[0.06] p-8">
              <HeartPulse className="w-8 h-8 text-[#c8a951] mb-4" />
              <h3 className="heading-3 text-white mb-3">{t('medtech.regulatory.fda.title')}</h3>
              <p className="text-white/60">
                {t('medtech.regulatory.fda.text')}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#070b1e] text-center">
        <div className="container-corporate">
          <h2 className="heading-1 text-white mb-6">{t('medtech.cta.title')}</h2>
          <p className="body-large text-white/40 max-w-xl mx-auto mb-10">
            {t('medtech.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 font-semibold hover:scale-[1.03] transition-transform"
          >
            {t('medtech.cta.button')}
            <DirArrow className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
