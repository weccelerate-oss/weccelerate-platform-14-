'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import ProductJourney from '@/components/services/ProductJourney';
import ServiceCaseStudies from '@/components/services/ServiceCaseStudies';


// =============================================================================
// MEDTECH CONTENT — Client wrapper for i18n
// =============================================================================

export default function MedTechContent() {
 const { t, dir } = useLanguage();
 const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

 return (
 <main id="main-content">
 {/* ================================================================= */}
 {/* PREMIUM HERO */}
 {/* ================================================================= */}
 <section className="relative py-16 md:py-24 overflow-hidden min-h-[400px] flex items-center">
 {/* Background Image */}
 <Image
 src="/images/hero/hero-medtech.jpg"
 alt="MedTech Track — Leumit WeCcelerate"
 fill
 className="object-cover z-0"
 priority
 quality={85}
 />

 {/* Dark overlay for text readability */}
 <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#040B16]/85 via-[#040B16]/75 to-[#040B16]/90" />

 {/* Cyan accent lines */}
 <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-[2]" />
 <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent z-[2]" />

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
 <li className="text-cyan-400 font-medium">
 {t('service.medtech.breadcrumb')}
 </li>
 </ol>
 </nav>

 {/* Content — Centered */}
 <div className="max-w-3xl mx-auto text-center">
 {/* Strategic Partnership Badge */}
 <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-8 shadow-lg shadow-cyan-500/5">
 <span
 className="w-2 h-2 rounded-full bg-cyan-400"
 style={{ boxShadow: '0 0 8px 2px rgba(6,182,212,0.5)' }}
 />
 {t('service.medtech.partnership')}
 </div>

 {/* English label */}
 <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-6">
 {t('service.medtech.tag')}
 </p>

 {/* Title */}
 <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
 {t('service.medtech.title.line1')}{' '}
 <span className="bg-gradient-to-r from-cyan-400 to-[#D4AF37] bg-clip-text text-transparent">
 {t('service.medtech.title.medtech')}
 </span>
 <br />
 <span className="text-white/90">{t('service.medtech.title.line2')}</span>
 </h1>

 {/* Subtitle */}
 <p className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
 {t('service.medtech.subtitle')}
 </p>

 {/* Partnership Logo */}
 <div className="relative flex justify-center mb-12">
 {/* Soft radial glow behind logo */}
 <div
 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[120px] rounded-full pointer-events-none"
 style={{
 background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, rgba(212,175,55,0.04) 50%, transparent 80%)',
 }}
 />
 <Image
 src="/images/leumit-weccelerate.png"
 alt="Leumit WeCcelerate Strategic Partnership"
 width={320}
 height={80}
 className="relative h-14 sm:h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]"
 priority
 />
 </div>

 {/* CTA */}
 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/contact?service=medtech-leumit&source=service-hero"
 className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 rounded-lg shadow-lg shadow-cyan-500/20"
 >
 {t('service.medtech.cta.hero')}
 <DirArrow className="w-5 h-5" />
 </Link>
 <Link
 href="/medtech"
 className="inline-flex items-center gap-2 border border-white/15 text-white/60 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/25 transition-all rounded-lg"
 >
 {t('service.medtech.cta.moreInfo')}
 </Link>
 </div>
 </div>
 </div>
 </section>

 {/* ================================================================= */}
 {/* BIO-SCAN INTERACTIVE PANEL */}
 {/* ================================================================= */}
 <ProductJourney
     serviceId="medtech-leumit"
     processHeading={t('service.medtech.timeline.heading')}
     processSteps={[
     { title: t('service.medtech.step1.title'), text: t('service.medtech.step1.text') },
     { title: t('service.medtech.step2.title'), text: t('service.medtech.step2.text') },
     { title: t('service.medtech.step3.title'), text: t('service.medtech.step3.text') },
     ]}
    />

 {/* ================================================================= */}
 {/* CASE STUDIES — real ventures from this service */}
 {/* ================================================================= */}
 <ServiceCaseStudies serviceId="medtech-leumit" />

 {/* ================================================================= */}
 {/* CTA SECTION */}
 {/* ================================================================= */}
 <section className="relative py-24 sm:py-32 overflow-hidden">
 <div className="absolute inset-0 bg-[#040B16]" />

 {/* Ambient glow */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

 {/* Top accent */}
 <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

 <div className="container-corporate relative z-10 text-center">
 <span className="inline-block text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">
 {t('service.medtech.readyInnovate')}
 </span>
 <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
 {t('service.medtech.cta.ready')}
 </h2>
 <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
 {t('service.medtech.cta.text')}
 </p>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/contact?service=medtech-leumit&source=service-cta"
 className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 rounded-lg shadow-lg shadow-cyan-500/20"
 >
 {t('service.medtech.cta.apply')}
 <DirArrow className="w-5 h-5" />
 </Link>
 <Link
 href="/services"
 className="inline-flex items-center gap-2 border border-white/15 text-white/60 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/25 transition-all rounded-lg"
 >
 {dir === 'rtl' ? 'כל השירותים' : 'All Services'}
 </Link>
 </div>
 </div>
 </section>
 </main>
 );
}
