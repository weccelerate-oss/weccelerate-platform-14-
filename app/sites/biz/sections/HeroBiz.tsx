'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Download } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { FloatingOrbs, GradientBlob } from '@/components/landing-helpers/FloatingDecor';

export default function HeroBiz() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      <Image
        src="/images/hero/corporate-hero.jpeg"
        alt="WeCcelerate Business — Venture Builder לארגונים"
        fill
        className="object-cover z-0"
        priority
        quality={85}
        sizes="100vw"
      />

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#070b1e]/92 via-[#070b1e]/78 to-[#070b1e]" />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(16,185,129,0.12) 0%, transparent 65%)',
        }}
      />

      {/* Geometric overlay (graceful if missing) */}
      <div className="absolute inset-0 z-[2] opacity-50 pointer-events-none mix-blend-screen">
        <SafeImage
          src="/images/landing-assets/biz/hero-overlay.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <FloatingOrbs color="rgba(16, 185, 129, 0.4)" count={7} className="z-[3]" />
      <GradientBlob
        color="rgba(16, 185, 129, 0.15)"
        size={650}
        position={{ top: '40%', left: '50%' }}
        className="z-[2]"
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent z-[3]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent z-[3]" />

      <div className="container-corporate relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Big WeCcelerate logo lockup */}
          <ScrollReveal variant="up">
            <motion.div
              className="relative inline-block mb-8"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[120px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, rgba(212,175,55,0.06) 50%, transparent 80%)',
                }}
              />
              <div className="relative flex items-center gap-4 justify-center">
                <Image
                  src="/images/logos/weccelerate-logo-wide.jpeg"
                  alt="WeCcelerate"
                  width={380}
                  height={95}
                  className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                  style={{ mixBlendMode: 'screen' }}
                  priority
                />
                <span className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-[0.2em] text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                  Business
                </span>
              </div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={50}>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-[0.22em] px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: '0 0 10px 2px rgba(16,185,129,0.6)' }}
              />
              For Enterprises · WeCcelerate Business
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={100}>
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.28em] mb-6">
              CORPORATE VENTURE BUILDING
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.05]">
              החברה שלכם{' '}
              <span className="bg-gradient-to-l from-emerald-300 via-emerald-400 to-[#D4AF37] bg-clip-text text-transparent">
                מוכנה למיזם הבא.
              </span>
              <br />
              <span className="text-white/95">אנחנו יודעים איך להקים אותו.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={300}>
            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto">
              אנחנו ה-Venture Builder של ארגונים בישראל — בונים לכם יחידה עצמאית, מוצר חדש,
              או מיזם אחות, מהרעיון ועד ההשקה. בלי לסכן את הליבה. בלי להעמיס על הצוות.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={400}>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-9 py-4 text-base font-bold hover:scale-[1.05] hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 rounded-lg shadow-lg shadow-emerald-500/20 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Building2 className="w-5 h-5 relative" />
                <span className="relative">בואו נתאם שיחה אסטרטגית</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform relative" />
              </a>
              <a
                href="#process"
                className="inline-flex items-center gap-2 border border-white/15 text-white/70 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/30 hover:text-white transition-all rounded-lg"
              >
                <Download className="w-5 h-5" />
                למדו על המתודולוגיה
              </a>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-emerald-400/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
