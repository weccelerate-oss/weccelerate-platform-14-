'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles as SparklesIcon } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { Sparkles } from '@/components/landing-helpers/FloatingDecor';

export default function MissionMoment() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Big edge-to-edge background image */}
      <SafeImage
        src="/images/landing-assets/leumit/mission-moment.png"
        alt="חזון: לעזור לישראלים להוביל בחדשנות רפואית"
        fill
        className="object-cover z-0"
        sizes="100vw"
      />

      {/* Multi-layer gradient overlay for cinematic depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#040B16]/95 via-[#040B16]/60 to-[#040B16]/95" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#040B16] via-transparent to-[#040B16]/60" />

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(6,182,212,0.18) 0%, transparent 70%)',
        }}
      />

      <Sparkles color="#06B6D4" count={25} className="z-[3]" />

      {/* Top + bottom golden accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent z-[3]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent z-[3]" />

      <div className="container-corporate relative z-10 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="up">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-[#D4AF37]/20 border border-cyan-400/40 backdrop-blur-md shadow-2xl shadow-cyan-500/30 mb-8"
            >
              <Heart className="w-8 h-8 text-cyan-300" fill="currentColor" />
            </motion.div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={100}>
            <p className="text-[#D4AF37] text-xs sm:text-sm font-bold uppercase tracking-[0.28em] mb-6 flex items-center justify-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              החזון שלנו
              <SparklesIcon className="w-4 h-4" />
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={200}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8 leading-[1.15]">
              ישראל היא מעצמת ה-MedTech הבאה.
              <br />
              <span className="bg-gradient-to-l from-cyan-300 via-cyan-200 to-[#D4AF37] bg-clip-text text-transparent">
                אנחנו כאן לבנות אותה איתכם.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={300}>
            <p className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
              כל סטארטאפ רפואי שאנחנו מלווים מציל חיים בעוד דרך אחת. אנחנו מאמינים שהשילוב
              הייחודי בין מאגר המטופלים של לאומית, מומחיות עסקית, ורגולציה בינלאומית — הוא
              ההזדמנות של ישראל להפוך לליבת חדשנות רפואית עולמית.
            </p>
          </ScrollReveal>

          {/* Decorative quote attribution */}
          <ScrollReveal variant="up" delay={400}>
            <div className="inline-flex items-center gap-3 text-xs text-white/40 uppercase tracking-[0.18em]">
              <span className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-400/40" />
              צוות Leumit × WeCcelerate
              <span className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-400/40" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
