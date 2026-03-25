'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, TrendingUp, Presentation, Handshake } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function InvestorsContent() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="relative bg-[#070b1e] py-20 md:py-28 overflow-hidden">
        <Image
          src="/images/investors-hero.png"
          alt=""
          fill
          className="object-cover z-0"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/80 via-[#070b1e]/60 to-[#070b1e]/90 z-[1]" />
        <div className="absolute bottom-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent z-[2]" />
        <div className="container-corporate relative z-10">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t('investors.breadcrumb.home')}
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-[#c8a951]">{t('investors.breadcrumb.current')}</li>
            </ol>
          </nav>

          <h1 data-speakable className="heading-display text-white mb-6">
            {t('investors.hero.title1')}
            <br />
            <span className="text-[#c8a951]">{t('investors.hero.title2')}</span>
          </h1>
          <p data-speakable className="text-xl text-white/60 max-w-2xl leading-relaxed">
            {t('investors.hero.text')}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-[#070b1e]" aria-labelledby="funding-heading">
        <div className="container-corporate">
          <h2 id="funding-heading" data-speakable className="heading-1 text-white mb-12">
            {t('investors.process.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pitch Deck */}
            <article className="bg-white/[0.03] border border-white/[0.06] overflow-hidden group">
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src="/images/investors-pitch-deck.png"
                  alt={t('investors.pitchDeck.title')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/30 to-transparent" />
              </div>
              <div className="p-8">
                <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                  <Presentation className="w-6 h-6 text-[#c8a951]" />
                </div>
                <h3 className="heading-3 text-white mb-3">{t('investors.pitchDeck.title')}</h3>
                <p className="text-white/60 mb-4">
                  {t('investors.pitchDeck.text')}
                </p>
                <ul className="space-y-2 text-sm text-white/40">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.pitchDeck.item1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.pitchDeck.item2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.pitchDeck.item3')}
                  </li>
                </ul>
              </div>
            </article>

            {/* Investor Matching */}
            <article className="bg-white/[0.03] border border-white/[0.06] overflow-hidden group">
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src="/images/investors-matching.png"
                  alt={t('investors.matching.title')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/30 to-transparent" />
              </div>
              <div className="p-8">
                <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                  <Handshake className="w-6 h-6 text-[#c8a951]" />
                </div>
                <h3 className="heading-3 text-white mb-3">{t('investors.matching.title')}</h3>
                <p className="text-white/60 mb-4">
                  {t('investors.matching.text')}
                </p>
                <ul className="space-y-2 text-sm text-white/40">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.matching.item1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.matching.item2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.matching.item3')}
                  </li>
                </ul>
              </div>
            </article>

            {/* Fundraising Strategy */}
            <article className="bg-white/[0.03] border border-white/[0.06] overflow-hidden group">
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src="/images/investors-strategy.png"
                  alt={t('investors.strategy.title')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/30 to-transparent" />
              </div>
              <div className="p-8">
                <div className="w-12 h-12 bg-[#c8a951]/10 flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-[#c8a951]" />
                </div>
                <h3 className="heading-3 text-white mb-3">{t('investors.strategy.title')}</h3>
                <p className="text-white/60 mb-4">
                  {t('investors.strategy.text')}
                </p>
                <ul className="space-y-2 text-sm text-white/40">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.strategy.item1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.strategy.item2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#c8a951] rounded-full" />
                    {t('investors.strategy.item3')}
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Investor Network Stats */}
      <section className="relative section-padding overflow-hidden" aria-labelledby="network-heading">
        <Image
          src="/images/investors-network.png"
          alt=""
          fill
          className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-[#0d1321]/85 z-[1]" />
        <div className="container-corporate relative z-10 text-center">
          <h2 id="network-heading" className="heading-1 text-white mb-12">
            {t('investors.network.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-bold text-white">50+</p>
              <p className="text-sm text-white/60 mt-1">{t('investors.network.vcs')}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">200+</p>
              <p className="text-sm text-white/60 mt-1">{t('investors.network.angels')}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">$50M+</p>
              <p className="text-sm text-white/60 mt-1">{t('investors.network.raised')}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">85%</p>
              <p className="text-sm text-white/60 mt-1">{t('investors.network.success')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative section-padding overflow-hidden text-center">
        <Image
          src="/images/investors-cta.png"
          alt=""
          fill
          className="object-cover z-0"
        />
        <div className="absolute inset-0 bg-[#070b1e]/85 z-[1]" />
        <div className="container-corporate relative z-10">
          <h2 className="heading-1 text-white mb-6">{t('investors.cta.title')}</h2>
          <p className="body-large text-white/40 max-w-xl mx-auto mb-10">
            {t('investors.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 font-semibold hover:scale-[1.03] transition-transform"
          >
            {t('investors.cta.button')}
            <DirArrow className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
