'use client';

import { motion } from 'framer-motion';
import { Activity, Database, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { GradientBlob, Sparkles } from '@/components/landing-helpers/FloatingDecor';

const FEATURES = [
  {
    icon: Database,
    title: 'גישה למאגר אנונימי',
    text: 'דאטה מ-מאגר נתונים קליני בשותפות לאומית',
  },
  {
    icon: Activity,
    title: 'ניטור בזמן אמת',
    text: 'פעילות קלינית רחבת היקף מנותחים אלגוריתמית',
  },
  {
    icon: ShieldCheck,
    title: 'אישור הלסינקי',
    text: 'הליך מואץ לצוות הסטארטאפ — ימים, לא חודשים',
  },
];

export default function BioScanShowcase() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[#040B16]">
      {/* Decorative blob behind the showcase */}
      <GradientBlob
        color="rgba(6, 182, 212, 0.15)"
        size={700}
        position={{ top: '50%', left: '50%' }}
      />
      <Sparkles color="#06B6D4" count={20} />

      <div className="container-corporate relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — visual */}
          <ScrollReveal variant="left">
            <motion.div
              className="relative aspect-square sm:aspect-[5/4] lg:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/20 group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <SafeImage
                src="/images/landing-assets/leumit/section-divider-1.png"
                alt="הצצה למערכת הדאטה הרפואית של לאומית"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {/* Tinted overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#040B16] via-transparent to-cyan-500/15" />

              {/* Floating data card overlay */}
              <motion.div
                className="absolute top-3 sm:top-6 right-3 sm:right-6 bg-[#040B16]/85 border border-cyan-400/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl shadow-cyan-500/20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-cyan-300/80 mb-1">
                  גישה לדאטה
                </div>
                <div className="text-lg sm:text-xl font-bold bg-gradient-to-l from-cyan-300 to-[#D4AF37] bg-clip-text text-transparent">
                  מאגר קליני רחב
                </div>
                <div className="text-[9px] sm:text-[10px] text-white/50 mt-1">בכפוף לאישור ועדת הלסינקי</div>
              </motion.div>

              {/* Bottom floating tag */}
              <motion.div
                className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 bg-[#040B16]/85 border border-[#D4AF37]/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl shadow-[#D4AF37]/10"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-300">מחובר · LIVE</span>
                </div>
                <div className="text-[10px] sm:text-xs text-white/60 mt-1.5">פעילות קלינית רחבה</div>
              </motion.div>

              {/* Animated scan line */}
              <motion.div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)',
                  boxShadow: '0 0 20px rgba(6,182,212,0.6)',
                }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </ScrollReveal>

          {/* Right — copy */}
          <div className="text-right">
            <ScrollReveal variant="up">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                BIO-SCAN ENGINE
              </div>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={100}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                גישה{' '}
                <span className="bg-gradient-to-l from-cyan-300 to-[#D4AF37] bg-clip-text text-transparent">
                  ייחודית
                </span>
                {' '}לדאטה רפואית
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={200}>
              <p className="text-white/60 text-lg leading-relaxed mb-10">
                בשותפות עם לאומית, יזמי MedTech שלנו מקבלים גישה ייחודית למאגר הדאטה הרפואי של אחת מקופות החולים הגדולות בישראל — לצורכי מחקר, אימות מודלים, ופיילוטים קליניים.
              </p>
            </ScrollReveal>

            <div className="space-y-4 mb-10">
              {FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <ScrollReveal key={idx} variant="right" delay={300 + idx * 100}>
                    <motion.div
                      whileHover={{ x: -6 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02] hover:border-cyan-500/25 hover:bg-cyan-500/[0.03] transition-all group cursor-default"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-[#D4AF37]/10 border border-cyan-500/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-base mb-0.5">{feature.title}</h3>
                        <p className="text-white/50 text-sm">{feature.text}</p>
                      </div>
                    </motion.div>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal variant="up" delay={700}>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                למדו על תהליך הקבלה לתוכנית
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </a>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
