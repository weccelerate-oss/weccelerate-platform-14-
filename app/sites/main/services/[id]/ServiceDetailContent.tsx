'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Target, Box, Code2, HeartPulse, TrendingUp, Handshake, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { servicesHe, servicesEn, type Service } from '@/lib/services-data';
import ServiceFullSections from '@/components/services/ServiceFullSections';

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ElementType> = {
  'business-consulting': Target,
  'physical-product': Box,
  'digital-product': Code2,
  'medtech-leumit': HeartPulse,
  'investors': TrendingUp,
  'investor-preparation': Handshake,
};

// =============================================================================
// SERVICE DETAIL CONTENT — Client component for i18n
// =============================================================================

export function ServiceDetailContent({ serviceId }: { serviceId: string }) {
  const { t, dir, lang } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const servicesList = lang === 'he' ? servicesHe : servicesEn;
  const service = servicesList.find((s) => s.id === serviceId);

  // Fallback to Hebrew if not found in English
  const fallback = servicesHe.find((s) => s.id === serviceId);
  const svc: Service | undefined = service || fallback;

  if (!svc) return null;

  const Icon = iconMap[svc.id] || Target;
  const isPremium = svc.isPremium;

  // Extract key highlights from sections for the capabilities strip
  const highlights = svc.fullContent.sections.slice(0, 4).map((s) => s.title);

  return (
    <main id="main-content">
      {/* ================================================================= */}
      {/* HERO SECTION — with background image                              */}
      {/* ================================================================= */}
      <section className="relative py-16 md:py-24 overflow-hidden min-h-[400px] flex items-center">
        {/* Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svc.imageSrc}
          alt={svc.title}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#070b1e]/85 via-[#070b1e]/75 to-[#070b1e]/90" />

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
                {svc.title}
              </li>
            </ol>
          </nav>

          {/* Content — Centered */}
          <div className="max-w-3xl mx-auto text-center">
            {/* Icon badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#c8a951]/15 mb-6">
              <Icon className="w-8 h-8 text-[#c8a951]" />
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.15]">
              {svc.title}
            </h1>

            {isPremium && (
              <span className="inline-flex items-center gap-1.5 mb-6 bg-blue-500/15 text-blue-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-500/20">
                {t('service.detail.leumitPartnership')}
              </span>
            )}

            {/* Subtitle */}
            <p className="text-xl text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
              {svc.fullContent.intro}
            </p>

            {/* CTA Button */}
            <Link
              href={`/contact?service=${serviceId}&source=service-page`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#c8a951]/20"
            >
              {t('service.detail.talk')}
              <DirArrow className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* HIGHLIGHTS STRIP                                                  */}
      {/* ================================================================= */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#070b1e]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="container-corporate relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((label) => (
              <div
                key={label}
                className="flex items-start gap-4 p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl"
              >
                <div className="w-10 h-10 rounded-lg bg-[#c8a951]/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#c8a951]" />
                </div>
                <p className="font-semibold text-white text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SERVICE DETAILS — "מה כולל השירות?"                               */}
      {/* ================================================================= */}
      <ServiceFullSections serviceId={serviceId} />

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            {t('service.detail.readyTitle')}
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            {t('service.detail.readyText')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/contact?service=${serviceId}&source=service-cta`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-[#c8a951]/20"
            >
              {t('service.detail.talk')}
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
