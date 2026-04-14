'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Users2, TrendingDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: 'החדשנות תקועה בוועדות',
    description:
      'הפרויקט המבטיח של השנה שעברה עדיין לא הגיע לאור. ה-POC תקוע ב-R&D. הפיילוט מחכה לתקציב הבא.',
    pain: 'אתם מפספסים זמן יקר — והמתחרים כבר שם.',
    image: '/images/landing-assets/biz/problem-stuck.jpg',
  },
  {
    icon: Users2,
    title: 'הצוות הפנימי עמוס מדי',
    description:
      'אין לכם ידיים פנויות לבנות מוצר חדש מאפס בלי לפגוע בליבה. הגיוס לוקח חודשים, והידע הטכני חסר.',
    pain: 'אתם יודעים מה צריך לעשות — רק לא יודעים מי יעשה את זה.',
    image: '/images/landing-assets/biz/problem-overload.jpg',
  },
  {
    icon: TrendingDown,
    title: 'הסיכון גבוה מדי לפתוח חברה חדשה',
    description:
      'ההנהלה והדירקטוריון רוצים לראות תוצאות מוכחות לפני שמתחייבים. אבל חדשנות לא עובדת ככה — היא דורשת אמונה מוקדמת.',
    pain: 'אין לכם עצם המתודולוגיה שמאזנת בין סיכון לתוצאה.',
    image: '/images/landing-assets/biz/problem-risk.jpg',
  },
];

export default function ProblemCards() {
  return (
    <section id="problem" className="relative py-20 md:py-28 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              האתגר
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
              זה נשמע מוכר?
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={200}>
            <p className="text-lg text-white/55 leading-relaxed">
              רוב הארגונים הגדולים רוצים לחדש. רק מעטים מצליחים. אלה שלושת המכשולים הכי
              נפוצים שאנחנו פוגשים אצל לקוחות שמגיעים אלינו.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PROBLEMS.map((problem, idx) => {
            const Icon = problem.icon;
            return (
              <ScrollReveal key={idx} variant="up" delay={idx * 100}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative h-full rounded-2xl border border-red-500/15 bg-gradient-to-b from-red-950/20 to-transparent hover:border-red-500/30 hover:from-red-950/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Image strip top */}
                  <div className="relative h-32 overflow-hidden">
                    <SafeImage
                      src={problem.image}
                      alt={problem.title}
                      fill
                      className="object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 to-transparent mix-blend-multiply" />

                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="absolute bottom-3 right-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/40 backdrop-blur-md"
                    >
                      <Icon className="w-6 h-6 text-red-300" />
                    </motion.div>
                  </div>

                  <div className="p-7 pt-6">
                    <h3 className="text-xl font-bold text-white mb-4">{problem.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed mb-5">
                      {problem.description}
                    </p>

                    <div className="pt-5 border-t border-red-500/10">
                      <p className="text-red-300/80 text-xs font-semibold">
                        {problem.pain}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal variant="up" delay={400}>
          <div className="text-center mt-14">
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              יש פתרון — ואנחנו עושים את זה כבר יותר משש שנים.{' '}
              <a href="#process" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
                בואו נראה איך ↓
              </a>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
