'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Rocket, Trophy } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { Sparkles, GradientBlob } from '@/components/landing-helpers/FloatingDecor';

const JOURNEY = [
  {
    icon: Lightbulb,
    label: 'הרעיון',
    text: 'הכל מתחיל ברעיון. אצלנו, גם הוא מקבל יחס כמו לסטארטאפ-יוניקורן.',
    image: '/images/landing-assets/landing/journey-idea.png',
    rotate: -3,
  },
  {
    icon: Rocket,
    label: 'הפיתוח',
    text: 'צוות שלם של מומחים נכנס לפעולה — טכני, עסקי, שיווקי, משפטי.',
    image: '/images/landing-assets/landing/journey-build.png',
    rotate: 2,
  },
  {
    icon: Trophy,
    label: 'ההצלחה',
    text: 'מהשקה ראשונה ועד גיוס שמשנה לכם את החיים. ואנחנו עוד שם, צמודים.',
    image: '/images/landing-assets/landing/journey-success.png',
    rotate: -2,
  },
];

export default function JourneyShowcase() {
  return (
    <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden bg-[#070b1e]">
      <GradientBlob
        color="rgba(200, 169, 81, 0.15)"
        size={700}
        position={{ top: '50%', left: '50%' }}
      />
      <Sparkles color="#C8A951" count={25} />

      <div className="container-corporate relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
              המסע
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              מרעיון על מפית{' '}
              <span className="bg-gradient-to-l from-[#c8a951] via-[#e8d48b] to-[#c8a951] bg-clip-text text-transparent">
                לסיפור הצלחה
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={200}>
            <p className="text-white/55 text-base sm:text-lg">
              ככה זה נראה כשעובדים איתנו. שלושה רגעים מהמסע שלכם.
            </p>
          </ScrollReveal>
        </div>

        {/* Polaroid-style scattered photos */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-4 max-w-6xl mx-auto">
          {JOURNEY.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 150}>
                <motion.div
                  initial={{ rotate: item.rotate }}
                  whileHover={{ rotate: 0, scale: 1.05, y: -10 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="relative bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-[#c8a951]/10 group"
                  style={{ transformOrigin: 'center center' }}
                >
                  {/* Polaroid photo */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4">
                    <SafeImage
                      src={item.image}
                      alt={item.label}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/60 via-transparent to-transparent" />

                    {/* Step number badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#c8a951] text-[#070b1e] text-sm font-bold flex items-center justify-center shadow-lg shadow-[#c8a951]/40">
                      {idx + 1}
                    </div>

                    {/* Floating icon */}
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="absolute bottom-3 left-3 w-11 h-11 rounded-xl bg-gradient-to-br from-[#c8a951]/30 to-[#e8d48b]/20 border border-[#c8a951]/40 backdrop-blur-md flex items-center justify-center"
                    >
                      <Icon className="w-5 h-5 text-[#e8d48b]" />
                    </motion.div>
                  </div>

                  {/* Caption */}
                  <div className="px-2 pb-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#e8d48b] mb-1.5 text-center">
                      {item.label}
                    </h3>
                    <p className="text-white/55 text-xs sm:text-sm leading-relaxed text-center">
                      {item.text}
                    </p>
                  </div>

                  {/* Decorative tape (top) */}
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/10 rounded-sm pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.05) 4px, rgba(255,255,255,0.05) 8px)',
                    }}
                  />
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA hint */}
        <ScrollReveal variant="up" delay={500}>
          <div className="text-center mt-14">
            <a
              href="#form"
              className="inline-flex items-center gap-2 text-base text-[#c8a951] hover:text-[#e8d48b] font-semibold transition-colors group"
            >
              להתחיל את המסע שלי
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
