'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Users2 } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

const VALUES = [
  {
    icon: Trophy,
    title: 'ניסיון מוכח',
    headline: '200+ יזמים · $150M+ גיוסים',
    description:
      'לא התחלנו אתמול. בנינו עשרות סטארטאפים, ראינו את כל התרחישים, ואנחנו יודעים מה עובד — ומה לא.',
    image: '/images/landing-assets/landing/value-experience.png',
  },
  {
    icon: Target,
    title: 'מעטפת 360°',
    headline: 'מהרעיון ועד השוק — הכול',
    description:
      'אסטרטגיה, פיננסים, פיתוח מוצר, שיווק, משפטי ומשקיעים. הכול תחת גג אחד, בלי צורך להתפזר בין ספקים.',
    image: '/images/landing-assets/landing/value-360.png',
  },
  {
    icon: Users2,
    title: 'צוות מלא של מומחים',
    headline: 'כל המומחים — במחיר של אחד',
    description:
      'אתם מקבלים CTO, מנהל מוצר, יועץ עסקי, אנשי שיווק, ויועצים משפטיים — כולם עובדים על החברה שלכם.',
    image: '/images/landing-assets/landing/value-team.png',
  },
];

export default function ValueProps() {
  return (
    <section className="relative py-20 md:py-24 bg-[#050914]">
      <div className="container-corporate">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#c8a951] text-sm font-bold uppercase tracking-[0.22em] mb-4">
              למה אנחנו
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              שלושה דברים שעושים את ההבדל
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {VALUES.map((value, idx) => {
            const Icon = value.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 120}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group h-full rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-[#c8a951]/30 hover:from-[#c8a951]/[0.04] transition-all duration-500 text-center flex flex-col"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
                    <SafeImage
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-[#050914]/30 to-transparent" />
                  </div>

                  {/* Floating icon — uses negative margin on a flex item to overlap the image above */}
                  <div className="relative flex justify-center -mt-8 mb-4 z-10">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.15 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c8a951] to-[#e8d48b] border-4 border-[#050914] shadow-xl shadow-[#c8a951]/40"
                    >
                      <Icon className="w-8 h-8 text-[#070b1e]" />
                    </motion.div>
                  </div>

                  <div className="px-8 pb-8 pt-2 flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                    <p className="text-[#e8d48b] font-semibold text-sm mb-4">{value.headline}</p>
                    <p className="text-white/55 text-sm leading-relaxed">{value.description}</p>
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
