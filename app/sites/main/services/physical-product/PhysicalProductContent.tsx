'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import CADPanel from './CADPanel';


// =============================================================================
// PHYSICAL PRODUCT CONTENT — Client wrapper for i18n
// =============================================================================

export default function PhysicalProductContent() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <main id="main-content">
      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <section className="relative py-16 md:py-24 overflow-hidden min-h-[400px] flex items-center">
        {/* Background Image */}
        <Image
          src="/images/hero/hero-business.jpg"
          alt="Physical Product Development"
          fill
          className="object-cover z-0"
          priority
          quality={85}
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#070b1e]/80 via-[#070b1e]/70 to-[#070b1e]/90" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/25 to-transparent z-[2]" />

        <div className="container-corporate relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/70 transition-colors">
                  {t('service.breadcrumb.home')}
                </Link>
              </li>
              <li><DirArrow className="w-3 h-3 inline mx-1" /></li>
              <li>
                <Link href="/services" className="hover:text-white/70 transition-colors">
                  {t('service.breadcrumb.services')}
                </Link>
              </li>
              <li><DirArrow className="w-3 h-3 inline mx-1" /></li>
              <li className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent font-medium">
                {t('service.physical.breadcrumb')}
              </li>
            </ol>
          </nav>

          {/* Content — Centered */}
          <div className="max-w-3xl mx-auto text-center">
            {/* Tech label */}
            <span className="inline-block font-mono text-[#c8a951]/60 text-xs tracking-[0.25em] uppercase mb-6">
              {t('service.physical.tag')}
            </span>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.15]">
              {t('service.physical.title.line1')}
              <br />
              <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
                {t('service.physical.title.line2')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
              {t('service.physical.subtitle')}
            </p>

            {/* CTA Button */}
            <Link
              href="/contact?service=physical-product&source=service-page"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#c8a951]/20"
            >
              {t('service.physical.cta.hero')}
              <DirArrow className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* INTERACTIVE CAD PANEL                                             */}
      {/* ================================================================= */}
      <CADPanel />

      {/* ================================================================= */}
      {/* CTA SECTION                                                       */}
      {/* ================================================================= */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#050810]" />

        {/* Blueprint texture faded */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c8a951]/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="container-corporate relative z-10 text-center">
          <span className="inline-block font-mono text-[#c8a951]/50 text-[10px] tracking-[0.3em] uppercase mb-6">
            INITIATE_PROJECT
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            {t('service.physical.cta.ready')}
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            {t('service.physical.cta.text')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact?service=physical-product&source=service-cta"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#c8a951]/20"
            >
              {t('service.physical.cta.talk')}
              <DirArrow className="w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/30 transition-all"
            >
              {dir === 'rtl' ? 'כל השירותים' : 'All Services'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
