'use client';

import { ArrowLeft, Sparkles as SparklesIcon } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { Sparkles } from '@/components/landing-helpers/FloatingDecor';

export default function FinalCTA() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background image (graceful) */}
      <div className="absolute inset-0 z-0 opacity-30">
        <SafeImage
          src="/images/landing-assets/landing/cta-bg.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(200,169,81,0.12) 0%, #070b1e 70%)',
        }}
      />

      <Sparkles color="#C8A951" count={25} className="z-[2]" />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(200,169,81,0.15) 0%, transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

      <div className="container-corporate relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal variant="up">
            <div className="inline-flex items-center gap-2 bg-[#c8a951]/10 border border-[#c8a951]/30 text-[#e8d48b] text-xs font-bold uppercase tracking-[0.22em] px-5 py-2.5 rounded-full mb-8 backdrop-blur-sm">
              <SparklesIcon className="w-4 h-4" />
              השבוע נותרו 3 מקומות
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.05]">
              הרעיון שלכם מחכה.
              <br />
              <span className="bg-gradient-to-l from-[#c8a951] via-[#e8d48b] to-[#c8a951] bg-clip-text text-transparent">
                בואו נתחיל.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={200}>
            <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-12 max-w-2xl mx-auto">
              20 דקות של שיחה יכולות לחסוך לכם שנים של טעויות. ההצעה שלנו: שיחה חינמית עם יועץ בכיר, היום.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={300}>
            <a
              href="#form"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-12 py-5 text-xl font-bold hover:scale-[1.05] hover:shadow-2xl hover:shadow-[#c8a951]/40 transition-all duration-300 rounded-xl shadow-xl shadow-[#c8a951]/25"
            >
              כן, רוצה שיחת ייעוץ חינם
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </a>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={400}>
            <p className="text-xs text-white/40 mt-6">
              או התקשרו ישירות:{' '}
              <a href="tel:+972555647538" dir="ltr" className="text-[#c8a951] hover:text-[#e8d48b] font-semibold">
                +972-55-564-7538
              </a>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
