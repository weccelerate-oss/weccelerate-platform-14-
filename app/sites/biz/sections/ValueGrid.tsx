'use client';

import { motion } from 'framer-motion';
import {
  UsersRound,
  Workflow,
  Network,
  HandshakeIcon,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

const VALUES = [
  {
    icon: UsersRound,
    title: 'צוות יעודי מהיום הראשון',
    description: 'CTO, מנהל מוצר, דיזיינר, מפתחים — צוות שלם מתכנסים סביב המיזם שלכם מיד.',
    image: '/images/landing-assets/biz/value-team.png',
  },
  {
    icon: Workflow,
    title: 'מתודולוגיה מובנית',
    description: 'תהליך עבודה מוסדר לכל שלב — מ-Feasibility ועד Spin-off. ידע ותהליכים שעוברים מסטארטאפ לסטארטאפ.',
    image: '/images/landing-assets/biz/value-method.png',
  },
  {
    icon: Network,
    title: 'רשת משקיעים ושותפים',
    description: 'היכרות עם משקיעים, אנג׳לים ושותפים אסטרטגיים — בהתאמה לשלב, לתחום ולמודל העסקי שלכם.',
    image: '/images/landing-assets/biz/value-network.png',
  },
  {
    icon: HandshakeIcon,
    title: 'שותפות אסטרטגית',
    description: 'אנחנו לא ספקים — אנחנו שותפים. אתם חלק מכל החלטה מהותית לאורך הדרך.',
    image: '/images/landing-assets/biz/value-partnership.png',
  },
  {
    icon: DollarSign,
    title: 'גמישות בתמחור',
    description: 'Equity, Success Fee, Retainer, או שילוב. המודל מתאים את עצמו למבנה ולצרכים שלכם.',
    image: '/images/landing-assets/biz/value-pricing.png',
  },
  {
    icon: ShieldCheck,
    title: 'יציאה נקייה',
    description: 'IP מלא נשאר אצלכם. הסכם שותפות ברור, ללא מלכודות, עם נקודות יציאה שקופות.',
    image: '/images/landing-assets/biz/value-ip.png',
  },
];

export default function ValueGrid() {
  return (
    <section className="relative py-20 md:py-28 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              מה אתם מקבלים
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              6 דברים שלא תקבלו במקום אחר
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {VALUES.map((value, idx) => {
            const Icon = value.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 80}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative h-full rounded-2xl border border-white/8 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all duration-500 overflow-hidden"
                >
                  {/* Image strip */}
                  <div className="relative h-32 overflow-hidden">
                    <SafeImage
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-[#D4AF37]/10 group-hover:from-emerald-500/15 transition-all duration-500" />

                    <motion.div
                      whileHover={{ rotate: 8, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="absolute bottom-3 right-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md"
                    >
                      <Icon className="w-6 h-6 text-emerald-300" />
                    </motion.div>
                  </div>

                  <div className="p-6 pt-5">
                    <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
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
