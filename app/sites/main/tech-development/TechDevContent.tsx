'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  Rocket,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TECH DEVELOPMENT PAGE CONTENT — Client wrapper for i18n
// =============================================================================

export function TechDevContent() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const diffItems = [
    t('tech.diff.item1'),
    t('tech.diff.item2'),
    t('tech.diff.item3'),
    t('tech.diff.item4'),
  ];

  const comparisonRows = [
    { shop: t('tech.diff.shop1'), partner: t('tech.diff.partner1') },
    { shop: t('tech.diff.shop2'), partner: t('tech.diff.partner2') },
    { shop: t('tech.diff.shop3'), partner: t('tech.diff.partner3') },
    { shop: t('tech.diff.shop4'), partner: t('tech.diff.partner4') },
  ];

  return (
    <main id="main-content" dir={dir}>
      {/* Hero */}
      <section className="relative bg-[#070b1e] py-20 md:py-28">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />
        <div className="container-corporate">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('tech.breadcrumb.home')}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-[#c8a951]">{t('tech.breadcrumb.current')}</li>
            </ol>
          </nav>

          <h1 className="heading-display text-white mb-6">
            {t('tech.hero.title1')}
            <br />
            <span className="text-[#c8a951]">{t('tech.hero.title2')}</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {t('tech.hero.text')}
          </p>
        </div>
      </section>

      {/* Tech Partner Differentiator */}
      <section
        className="section-padding bg-[#070b1e] border-b border-white/[0.06]"
        aria-labelledby="differentiator-heading"
      >
        <div className="container-corporate">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-[#c8a951] uppercase tracking-wider">
                {t('tech.diff.tag')}
              </span>
              <h2 id="differentiator-heading" className="heading-1 text-white mt-3 mb-6">
                {t('tech.diff.title')}
              </h2>
              <p className="body-large text-white/60 mb-8">
                {t('tech.diff.text')}
              </p>
              <ul className="space-y-4">
                {diffItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-[#c8a951] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="bg-[#0d1321] p-8">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-6">
                {t('tech.diff.aside.title')}
              </h3>
              <div className="space-y-4">
                {comparisonRows.map((row) => (
                  <div key={row.shop} className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/[0.03] p-3 text-white/40 line-through">
                      {row.shop}
                    </div>
                    <div className="bg-[#c8a951]/10 p-3 text-white font-medium">
                      {row.partner}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-[#0d1321]" aria-labelledby="services-heading">
        <div className="container-corporate">
          <h2 id="services-heading" className="heading-1 text-white mb-12">
            {t('tech.services.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* MVP Development */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <Rocket className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('tech.mvp.title')}</h3>
              <p className="text-white/60 mb-4">
                {t('tech.mvp.text')}
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.mvp.item1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.mvp.item2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.mvp.item3')}
                </li>
              </ul>
            </article>

            {/* CTO as a Service */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('tech.cto.title')}</h3>
              <p className="text-white/60 mb-4">
                {t('tech.cto.text')}
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.cto.item1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.cto.item2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.cto.item3')}
                </li>
              </ul>
            </article>

            {/* Post-MVP Scaling */}
            <article className="bg-white/[0.03] border border-white/[0.06] p-8 hover:border-[#c8a951]/40 transition-colors">
              <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-[#c8a951]" />
              </div>
              <h3 className="heading-3 text-white mb-3">{t('tech.scaling.title')}</h3>
              <p className="text-white/60 mb-4">
                {t('tech.scaling.text')}
              </p>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.scaling.item1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.scaling.item2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                  {t('tech.scaling.item3')}
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#070b1e] text-center">
        <div className="container-corporate">
          <h2 className="heading-1 text-white mb-6">{t('tech.cta.title')}</h2>
          <p className="body-large text-white/40 max-w-xl mx-auto mb-10">
            {t('tech.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 font-semibold hover:scale-[1.03] transition-transform"
          >
            {t('tech.cta.button')}
            <DirArrow className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
