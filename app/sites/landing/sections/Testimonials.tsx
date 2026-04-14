'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  image: string;
  result: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'רותם לוי',
    role: 'מייסדת',
    company: 'Gesher',
    quote:
      'הם עזרו לי בתוכנית העסקית, בשיווק, בפיתוח הפלטפורמה, וגם גייסו לי כספים. הכול במקום אחד, עם אנשים שאכפת להם באמת.',
    image: '/images/landing-assets/landing/value-team.png',
    result: 'גיוס מוצלח',
    initials: 'רל',
  },
  {
    name: 'גיא שחם',
    role: 'מייסד',
    company: 'Grouping',
    quote:
      'אני יזם ותיק ועבדתי עם הרבה יועצים. הצוות של WeCcelerate הוא הראשון שעשה בפועל — לא רק דיבר. מקצועיים ברמה הכי גבוהה.',
    image: '/images/landing-assets/landing/testimonial-2.png',
    result: 'MVP תוך 4 חודשים',
    initials: 'גש',
  },
  {
    name: 'אריאל סנה',
    role: 'מייסד',
    company: 'Arine',
    quote:
      'פיתחנו מוצר פיזי מאפס. בלעדיהם לא היינו מצליחים. הליווי קצה לקצה עשה את כל ההבדל — מהעיצוב ועד הייצור.',
    image: '/images/landing-assets/landing/testimonial-3.png',
    result: 'מוצר בייצור',
    initials: 'אס',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-20 md:py-24 bg-[#050914]">
      <div className="container-corporate">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
              עדויות
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              מה יזמים אומרים עלינו
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, idx) => (
            <ScrollReveal key={idx} variant="up" delay={idx * 120}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group h-full p-8 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[#c8a951]/25 transition-all duration-500 relative overflow-hidden"
              >
                {/* Decorative gradient blob on hover */}
                <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#c8a951]/0 group-hover:bg-[#c8a951]/5 blur-3xl transition-all duration-700 pointer-events-none" />

                <div className="relative">
                  <Quote className="w-10 h-10 text-[#c8a951]/40 mb-4" />

                  <p className="text-white/75 leading-relaxed mb-6 text-sm md:text-base">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 pt-5 border-t border-white/5">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-[#c8a951]/30 to-[#e8d48b]/15 border-2 border-[#c8a951]/30 flex-shrink-0 flex items-center justify-center">
                      <SafeImage
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                        fallbackContent={
                          <span className="text-base font-bold text-[#c8a951]">{t.initials}</span>
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{t.name}</p>
                      <p className="text-white/50 text-xs">
                        {t.role} · {t.company}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <span className="text-xs text-[#c8a951] bg-[#c8a951]/10 border border-[#c8a951]/20 px-3 py-1 rounded-full whitespace-nowrap">
                      ✓ {t.result}
                    </span>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
