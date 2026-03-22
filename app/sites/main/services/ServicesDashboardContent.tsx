'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Briefcase, Cpu, Smartphone, HeartPulse, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { servicesHe, servicesEn, Service } from '@/lib/services-data';
import { useState } from 'react';

// =============================================================================
// ICONS PER SERVICE
// =============================================================================

const serviceIcons: Record<string, React.ElementType> = {
  'business-consulting': Briefcase,
  'physical-product': Cpu,
  'digital-product': Smartphone,
  'medtech-leumit': HeartPulse,
};

// =============================================================================
// SERVICES DASHBOARD CONTENT
// =============================================================================

export default function ServicesDashboardContent() {
  const { t, dir, lang } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const services = lang === 'he' ? servicesHe : servicesEn;

  return (
    <main id="main-content">
      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#070b1e]" />

        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #c8a951 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #c8a951 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ambient glows */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] bg-[#c8a951]/[0.04] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-[#c8a951]/[0.03] rounded-full blur-[120px] pointer-events-none" />

        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        <div className="container-corporate relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/70 transition-colors">
                  {t('services.breadcrumb.home')}
                </Link>
              </li>
              <li><DirArrow className="w-3 h-3 inline mx-1" /></li>
              <li className="text-[#c8a951]">
                {t('services.breadcrumb.current')}
              </li>
            </ol>
          </nav>

          {/* Heading */}
          <div className="max-w-3xl">
            <span className="inline-block text-[#c8a951] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              {t('services.hero.tag')}
            </span>
            <h1 data-speakable className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t('services.hero.title')}
            </h1>
            <p data-speakable className="text-xl text-white/50 leading-relaxed">
              {t('services.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SERVICES GRID                                                     */}
      {/* ================================================================= */}
      <section className="relative bg-[#070b1e] py-20 md:py-28">
        <div className="container-corporate">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                lang={lang}
                dir={dir}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* BOTTOM CTA                                                        */}
      {/* ================================================================= */}
      <section className="relative bg-[#070b1e] pb-28">
        {/* Top separator */}
        <div className="container-corporate">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-20" />
        </div>

        <div className="container-corporate text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('services.cta.title')}
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
            {t('services.cta.text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 rounded-sm"
          >
            {t('services.cta.button')}
            {dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </section>
    </main>
  );
}

// =============================================================================
// SERVICE CARD
// =============================================================================

function ServiceCard({
  service,
  lang,
  dir,
}: {
  service: Service;
  lang: string;
  dir: string;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const Icon = serviceIcons[service.id] || Briefcase;
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300">
      {/* Premium badge */}
      {service.isPremium && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#c8a951]/20 text-[#c8a951] text-xs font-bold px-3 py-1.5 rounded-full border border-[#c8a951]/30 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-[#c8a951]" />
          {t('services.card.premium')}
        </div>
      )}

      {/* Service image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={service.imageSrc}
          alt={service.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/60 to-transparent" />

        {/* Icon */}
        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-[#c8a951]/10 border border-[#c8a951]/20 flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-6 h-6 text-[#c8a951]" />
        </div>

        {/* Partnership logos for MedTech */}
        {service.isPremium && (
          <div className="absolute bottom-4 left-4 z-10">
            <Image
              src="/images/leumit-weccelerate.png"
              alt="Leumit × WeCcelerate"
              width={140}
              height={40}
              className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#c8a951] transition-colors">
          {service.title}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed mb-4">
          {service.shortDescription}
        </p>

        {/* Expandable sections preview */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-[#c8a951]/70 hover:text-[#c8a951] text-sm font-medium transition-colors mb-4 cursor-pointer"
        >
          {expanded ? t('services.card.hideDetails') : t('services.card.included')}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="space-y-3 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {service.fullContent.sections.map((section, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#c8a951]/60 shrink-0" />
                <div>
                  <span className="text-white/70 font-medium">{section.title}</span>
                  <span className="text-white/30"> — {section.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Link */}
        <Link
          href={`/services/${service.id}`}
          className="inline-flex items-center gap-2 text-[#c8a951] font-semibold text-sm hover:gap-3 transition-all duration-200 group/link"
        >
          {t('services.card.viewFull')}
          <DirArrow className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 rtl:group-hover/link:-translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
