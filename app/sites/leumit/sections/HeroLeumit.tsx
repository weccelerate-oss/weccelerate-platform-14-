'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Stethoscope, ShieldCheck } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { FloatingOrbs, Sparkles, GradientBlob } from '@/components/landing-helpers/FloatingDecor';

export default function HeroLeumit() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      <Image
        src="/images/hero/hero-medtech.jpg"
        alt="ליווי MedTech בשותפות עם לאומית"
        fill
        className="object-cover z-0"
        priority
        quality={85}
        sizes="100vw"
      />

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#040B16]/92 via-[#040B16]/80 to-[#040B16]" />
      <div
        className="absolute inset-0 z-[2] opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(6,182,212,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Decorative floating cells overlay (gracefully missing) */}
      <div className="absolute inset-0 z-[2] opacity-50 pointer-events-none mix-blend-screen">
        <SafeImage
          src="/images/landing-assets/leumit/hero-floating-cells.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Cute floating orbs in cyan */}
      <FloatingOrbs color="rgba(6, 182, 212, 0.4)" count={8} className="z-[3]" />
      <Sparkles color="#D4AF37" count={15} className="z-[3]" />
      <GradientBlob
        color="rgba(6, 182, 212, 0.12)"
        size={600}
        position={{ top: '40%', left: '50%' }}
        className="z-[2]"
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent z-[3]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent z-[3]" />

      <div className="container-corporate relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Big partnership lockup */}
          <ScrollReveal variant="up">
            <motion.div
              className="relative inline-block mb-8"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Soft radial glow behind logo */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[140px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, rgba(212,175,55,0.08) 50%, transparent 80%)',
                }}
              />
              <Image
                src="/images/leumit-weccelerate.png"
                alt="Leumit × WeCcelerate Strategic Partnership"
                width={400}
                height={100}
                className="relative h-20 sm:h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                priority
              />
            </motion.div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={50}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-[0.22em] px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm">
              <span
                className="w-2 h-2 rounded-full bg-cyan-400"
                style={{ boxShadow: '0 0 10px 2px rgba(6,182,212,0.6)' }}
              />
              שותפות אסטרטגית · Leumit × WeCcelerate
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={100}>
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.28em] mb-6">
              MEDTECH ACCELERATOR
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.05]">
              יש לך רעיון{' '}
              <span className="bg-gradient-to-l from-cyan-400 via-cyan-300 to-[#D4AF37] bg-clip-text text-transparent">
                לסטארטאפ רפואי
              </span>
              ?
              <br />
              <span className="text-white/95">בואו נהפוך אותו למציאות.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={300}>
            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto">
              ליווי מעטפת 360° ליזמי רפואה דיגיטלית — מהרעיון לאישור הרגולטורי, עם גישה
              למאגר המטופלים של לאומית, רופאים מומחים וייעוץ FDA ישיר.
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
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-9 py-4 text-base font-bold hover:scale-[1.05] hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 rounded-lg shadow-lg shadow-cyan-500/20 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Stethoscope className="w-5 h-5 relative" />
                <span className="relative">קבלו שיחת ייעוץ רפואית</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform relative" />
              </a>
              <a
                href="#tracks"
                className="inline-flex items-center gap-2 border border-white/15 text-white/70 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/30 hover:text-white transition-all rounded-lg"
              >
                <ShieldCheck className="w-5 h-5" />
                צפו בתוכנית המלאה
              </a>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={500}>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                ללא התחייבות
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                ייעוץ ראשוני חינם
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                מענה תוך 24 שעות
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-cyan-400/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
