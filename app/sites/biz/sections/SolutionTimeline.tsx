'use client';

import { Search, Target, Rocket, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

const PHASES = [
  {
    num: '01',
    icon: Search,
    title: 'אבחון והיתכנות',
    duration: '2-4 שבועות',
    description:
      'ניתוח הזדמנות עסקית, מחקר שוק ראשוני, בדיקת התאמה לליבת הארגון וגיבוש הצעת ערך מקדמית.',
    deliverables: ['דוח היתכנות', 'ניתוח שוק', 'המלצה אסטרטגית'],
    image: '/images/landing-assets/biz/phase-01-discovery.png',
  },
  {
    num: '02',
    icon: Target,
    title: 'עיצוב המודל העסקי',
    duration: '4-6 שבועות',
    description:
      'בניית מודל עסקי מלא, מצגת למשקיעים, תוכנית פיננסית, הגדרת KPI-ים ותוכנית יישום מפורטת.',
    deliverables: ['Business Model', 'מודל פיננסי', 'Pitch Deck', 'תוכנית עבודה'],
    image: '/images/landing-assets/biz/phase-02-design.png',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'בניית MVP ו-Validation',
    duration: '3-6 חודשים',
    description:
      'פיתוח מוצר מינימלי מתפקד, בדיקות שוק, פיילוטים ראשונים עם לקוחות, ואיסוף דאטה לאימות המודל.',
    deliverables: ['MVP מוכן', 'פיילוטים', 'Product-Market Fit'],
    image: '/images/landing-assets/biz/phase-03-mvp.png',
  },
  {
    num: '04',
    icon: Award,
    title: 'השקה ו-Spin-off',
    duration: '6-12 חודשים',
    description:
      'השקה מסחרית, גיוס סבב ראשון מחברות הון סיכון ברשת שלנו, ובניית צוות עצמאי. היציאה שלכם מתוזמנת להצלחה.',
    deliverables: ['חברה עצמאית', 'סבב גיוס', 'צוות מנהל'],
    image: '/images/landing-assets/biz/phase-04-launch.png',
  },
];

export default function SolutionTimeline() {
  return (
    <section
      id="process"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #070b1e 0%, #0a1020 50%, #070b1e 100%)',
      }}
    >
      {/* Background blueprint pattern (graceful fallback) */}
      <div className="absolute inset-0 z-0 opacity-15">
        <SafeImage
          src="/images/landing-assets/biz/timeline-bg.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-transparent to-[#070b1e]" />
      </div>

      <div className="container-corporate relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              המתודולוגיה
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
              איך אנחנו{' '}
              <span className="bg-gradient-to-l from-emerald-300 to-[#D4AF37] bg-clip-text text-transparent">
                בונים מיזם
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={200}>
            <p className="text-lg text-white/55 leading-relaxed">
              4 שלבים. שקיפות מלאה. בכל שלב יש decision point שבו אתם מחליטים להמשיך או לעצור — בלי סיכון מיותר.
            </p>
          </ScrollReveal>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Timeline line */}
          <div className="relative">
            <div className="hidden md:block absolute top-0 bottom-0 right-[30px] w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />

            <div className="space-y-8">
              {PHASES.map((phase, idx) => {
                const Icon = phase.icon;
                return (
                  <ScrollReveal key={idx} variant="right" delay={idx * 120}>
                    <div className="relative flex flex-col md:flex-row gap-6 md:gap-8">
                      {/* Number + Icon */}
                      <div className="flex-shrink-0 flex md:flex-col items-center gap-4 md:gap-2">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-[#D4AF37]/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                            <Icon className="w-7 h-7 text-emerald-400" />
                          </div>
                          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#070b1e] border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center justify-center">
                            {phase.num}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8 md:pb-0">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-500 overflow-hidden group">
                          {/* Phase image strip */}
                          <div className="relative h-32 sm:h-36 overflow-hidden">
                            <SafeImage
                              src={phase.image}
                              alt={phase.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1020] via-[#0a1020]/30 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent" />
                          </div>

                          <div className="p-6 md:p-8">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="text-xl md:text-2xl font-bold text-white">
                                {phase.title}
                              </h3>
                              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                {phase.duration}
                              </span>
                            </div>
                            <p className="text-white/55 leading-relaxed mb-5 text-sm md:text-base">
                              {phase.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {phase.deliverables.map((d, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                                >
                                  ✓ {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
