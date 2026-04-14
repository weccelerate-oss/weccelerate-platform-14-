'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Shield, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { Sparkles, FloatingOrbs, GradientBlob } from '@/components/landing-helpers/FloatingDecor';

const ROTATING_WORDS = [
  'לסטארטאפ',
  'לאפליקציה',
  'למוצר',
  'לעסק',
  'למיזם חדש',
];

export default function HeroLanding() {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIdx((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-bg-poster.jpeg"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#070b1e]/90 via-[#070b1e]/75 to-[#070b1e]" />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,169,81,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Sparkle particles overlay (graceful if missing) */}
      <div className="absolute inset-0 z-[2] opacity-60 pointer-events-none mix-blend-screen">
        <SafeImage
          src="/images/landing-assets/landing/hero-overlay-particles.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <Sparkles color="#C8A951" count={30} className="z-[3]" />
      <FloatingOrbs color="rgba(200, 169, 81, 0.45)" count={6} className="z-[3]" />
      <GradientBlob
        color="rgba(200, 169, 81, 0.18)"
        size={700}
        position={{ top: '50%', left: '50%' }}
        className="z-[2]"
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/40 to-transparent z-[3]" />

      <div className="container-corporate relative z-10 py-24 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Big branded logo at top of hero */}
          <ScrollReveal variant="up">
            <motion.div
              className="relative inline-block mb-8"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[140px] rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(200,169,81,0.18) 0%, transparent 70%)',
                }}
              />
              <Image
                src="/images/logos/weccelerate-logo-wide.jpeg"
                alt="WeCcelerate"
                width={400}
                height={100}
                className="relative h-20 sm:h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(200,169,81,0.45)]"
                style={{ mixBlendMode: 'screen' }}
                priority
              />
            </motion.div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={50}>
            <div className="inline-flex items-center gap-2 bg-[#c8a951]/10 border border-[#c8a951]/30 text-[#e8d48b] text-xs font-bold uppercase tracking-[0.22em] px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm">
              <span
                className="w-2 h-2 rounded-full bg-[#c8a951]"
                style={{ boxShadow: '0 0 10px 2px rgba(200,169,81,0.7)' }}
              />
              Venture Builder · ישראל
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-8 leading-[1]">
              יש לך{' '}
              <span className="bg-gradient-to-l from-[#c8a951] via-[#e8d48b] to-[#c8a951] bg-clip-text text-transparent">
                רעיון
              </span>
              ?
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={200}>
            <div className="h-16 md:h-20 flex items-center justify-center mb-2">
              <p className="text-2xl sm:text-3xl md:text-4xl text-white/85 font-medium">
                <span
                  key={wordIdx}
                  className="inline-block text-[#e8d48b] font-bold animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {ROTATING_WORDS[wordIdx]}
                </span>
                <span className="text-white/60">?</span>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={300}>
            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto">
              אחרי שליווינו 200+ יזמים וגייסנו יחד מעל{' '}
              <span className="text-white font-bold">$150M</span>, יש לנו את הדרך עבורך.
              <br className="hidden sm:inline" />
              בואו נתחיל בשיחה.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={400}>
            <motion.a
              href="#form"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05 }}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-5 text-lg md:text-xl font-bold hover:shadow-2xl hover:shadow-[#c8a951]/40 transition-all duration-300 rounded-xl shadow-xl shadow-[#c8a951]/20 mb-8 relative overflow-hidden"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.2)' }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative">קבלו שיחת ייעוץ חינם</span>
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform relative" />
            </motion.a>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={500}>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c8a951]" />
                20 דקות
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c8a951]" />
                ללא התחייבות
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#c8a951]" />
                עם יועץ בכיר
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
