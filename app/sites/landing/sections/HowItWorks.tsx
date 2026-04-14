'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Map, Users, Award } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

const STEPS = [
  {
    num: '1',
    icon: MessageCircle,
    title: 'שיחת היכרות',
    duration: '20 דקות · חינם',
    description: 'נכיר אתכם, נשמע על הרעיון, נבין מה הצרכים והאתגרים.',
    image: '/images/landing-assets/landing/step-1-call.png',
  },
  {
    num: '2',
    icon: Map,
    title: 'תוכנית פעולה',
    duration: 'תוך שבוע',
    description: 'נבנה יחד מסלול אישי: מה לעשות, באיזה סדר, ומה יעלה.',
    image: '/images/landing-assets/landing/step-2-plan.png',
  },
  {
    num: '3',
    icon: Users,
    title: 'ליווי צמוד',
    duration: 'עד ההצלחה',
    description: 'הצוות שלנו עובד לצד שלכם — לא במקומכם. אנחנו שותפים, לא ספקים.',
    image: '/images/landing-assets/landing/step-3-support.png',
  },
  {
    num: '4',
    icon: Award,
    title: 'השקה והצלחה',
    duration: 'יחד',
    description: 'מהגיוס הראשון ועד הכניסה לשוק הבינלאומי — ממשיכים לצד שלכם.',
    image: '/images/landing-assets/landing/step-4-success.png',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 md:py-24 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
              איך זה עובד
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              פשוט. ברור. בלי הפתעות.
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 100}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative h-full rounded-2xl border border-white/8 bg-white/[0.02] hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.02] transition-all duration-500 overflow-hidden"
                >
                  {/* Step image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c8a951]/0 to-transparent group-hover:from-[#c8a951]/10 transition-all duration-500" />

                    {/* Floating number + icon */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8a951]/30 to-[#e8d48b]/20 border border-[#c8a951]/40 backdrop-blur-md flex items-center justify-center"
                      >
                        <Icon className="w-6 h-6 text-[#e8d48b]" />
                      </motion.div>
                    </div>
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#c8a951] text-[#070b1e] text-base font-bold flex items-center justify-center shadow-lg shadow-[#c8a951]/30">
                      {step.num}
                    </div>
                  </div>

                  <div className="p-6 pt-5">
                    <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-[#e8d48b]/70 text-xs font-semibold mb-3">{step.duration}</p>
                    <p className="text-white/55 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
