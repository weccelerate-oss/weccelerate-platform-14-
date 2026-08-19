'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import ProductJourney from '@/components/services/ProductJourney';
import ServiceCaseStudies from '@/components/services/ServiceCaseStudies';


// =============================================================================
// MARKETING CONTENT — Client wrapper for i18n
// =============================================================================

export default function MarketingContent() {
 const { t, dir } = useLanguage();
 const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

 return (
 <main id="main-content">
 {/* ================================================================= */}
 {/* HERO SECTION — with background image + fade-in (1.5s) */}
 {/* ================================================================= */}
 <section className="relative py-16 md:py-24 overflow-hidden min-h-[400px] flex items-center">
 {/* Background Image */}
 <Image
 src="/images/services/marketing/Hero-Section.png"
 alt="Marketing, Advertising & PR"
 fill
 className="object-cover"
 priority
 quality={90}
 />

 {/* Dark overlay for text readability */}
 <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/80 via-[#070b1e]/70 to-[#070b1e]/90" />

 {/* Gold accent line */}
 <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

 <div className="container-corporate relative z-10">
 {/* Breadcrumb */}
 <motion.nav
 aria-label="Breadcrumb"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 1, delay: 0.3 }}
 className="mb-10"
 >
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
 {t('service.marketing.title')}
 </li>
 </ol>
 </motion.nav>

 {/* Content — Centered, slow fade-in 1.5s */}
 <div className="max-w-3xl mx-auto text-center">
 {/* Label */}
 <motion.span
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1.5, ease: 'easeOut' }}
 className="inline-block text-[#c8a951] text-sm font-bold uppercase tracking-[0.2em] mb-6"
 >
 {t('service.marketing.tag')}
 </motion.span>

 {/* Title */}
 <motion.h1
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1.5, ease: 'easeOut', delay: 0.15 }}
 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.15]"
 >
 {t('service.marketing.title.line1')}
 <br />
 <span className="bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent">
 {t('service.marketing.title.line2')}
 </span>
 </motion.h1>

 {/* Subtitle */}
 <motion.p
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
 className="text-xl text-white/50 leading-relaxed mb-10 max-w-xl mx-auto"
 >
 {t('service.marketing.subtitle')}
 </motion.p>

 {/* CTA Button */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 1.5, ease: 'easeOut', delay: 0.45 }}
 >
 <Link
 href="/contact?service=marketing&source=service-page"
 className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 rounded-sm shadow-lg shadow-[#c8a951]/20"
 >
 {t('service.marketing.cta.hero')}
 <DirArrow className="w-5 h-5" />
 </Link>
 </motion.div>
 </div>
 </div>
 </section>

 {/* ================================================================= */}
 {/* INTERACTIVE TIMELINE SECTION */}
 {/* ================================================================= */}
 <ProductJourney
     serviceId="marketing"
     processHeading={t('service.marketing.timeline.heading')}
     processSteps={[
     { title: t('service.marketing.step4.title'), text: t('service.marketing.step4.text') },
     { title: t('service.marketing.step1.title'), text: t('service.marketing.step1.text') },
     { title: t('service.marketing.step2.title'), text: t('service.marketing.step2.text') },
     { title: t('service.marketing.step3.title'), text: t('service.marketing.step3.text') },
     ]}
    />

 {/* ================================================================= */}
 {/* CASE STUDIES — real ventures from this service */}
 {/* ================================================================= */}
 <ServiceCaseStudies serviceId="marketing" />

 {/* ================================================================= */}
 {/* CTA SECTION */}
 {/* ================================================================= */}
 <section className="relative py-24 sm:py-32 overflow-hidden">
 <div className="absolute inset-0 bg-[#050810]" />

 {/* Ambient glow */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c8a951]/[0.03] rounded-full blur-[150px] pointer-events-none" />

 <div className="container-corporate relative z-10 text-center">
 <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
 {t('service.marketing.cta.ready')}
 </h2>
 <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
 {t('service.marketing.cta.text')}
 </p>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 <Link
 href="/contact?service=marketing&source=service-cta"
 className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-4 text-lg font-bold hover:scale-[1.03] transition-all duration-300 rounded-sm shadow-lg shadow-[#c8a951]/20"
 >
 {t('service.marketing.cta.talk')}
 <DirArrow className="w-5 h-5" />
 </Link>
 <Link
 href="/services"
 className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/30 transition-all rounded-sm"
 >
 {dir === 'rtl' ? 'כל השירותים' : 'All Services'}
 </Link>
 </div>
 </div>
 </section>
 </main>
 );
}
