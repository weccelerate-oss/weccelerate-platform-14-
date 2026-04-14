'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';

interface CaseStudy {
  category: string;
  title: string;
  image: string;
  result: string;
  metric: string;
  description: string;
}

const CASES: CaseStudy[] = [
  {
    category: 'SaaS B2B',
    title: 'פלטפורמת ניהול לתעשיית הייצור',
    image: '/images/landing-assets/biz/case-saas.png',
    result: '$2.5M',
    metric: 'גויסו תוך 14 חודשים',
    description:
      'חברת ייצור מובילה הזניקה יחידת SaaS עצמאית למכירה לתעשיות נוספות. תוך פחות משנה — Product-Market Fit, 12 לקוחות משלמים, וסבב Seed מלא.',
  },
  {
    category: 'Hardware · IoT',
    title: 'מוצר חכם לחקלאות מדייקת',
    image: '/images/landing-assets/biz/case-hardware.png',
    result: '3 אב טיפוסים',
    metric: 'בשלושה חודשים',
    description:
      'חברת כימיה גדולה ביקשה להרחיב למוצר חומרה חכם. בנינו אב טיפוס פועל, פטנט זמני ראשון ו-LOI עם 5 חקלאים מובילים — הכל בשלושה חודשים.',
  },
  {
    category: 'MedTech',
    title: 'יחידה חדשה לטלה-רפואה',
    image: '/images/landing-assets/biz/case-medtech.png',
    result: '1,800+',
    metric: 'משתמשים פעילים בפיילוט',
    description:
      'קופת חולים אזורית רצתה להרחיב שירות טלה-רפואה דיגיטלי. יצאנו למסלול, השקנו MVP תוך 4 חודשים, והגענו ל-1,800+ משתמשים בפיילוט הראשון.',
  },
];

export default function CaseStudies() {
  return (
    <section id="cases" className="relative py-20 md:py-28 bg-[#070b1e]">
      <div className="container-corporate">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <ScrollReveal variant="up">
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.25em] mb-4">
              Case Studies
            </p>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={100}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              מיזמים שבנינו ללקוחות
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={200}>
            <p className="text-lg text-white/55 leading-relaxed">
              שלוש דוגמאות מתוך 40+ מיזמים שהקמנו לארגונים בישראל. מוכנים לדבר על שלכם?
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CASES.map((cs, idx) => (
            <ScrollReveal key={idx} variant="up" delay={idx * 120}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative rounded-2xl overflow-hidden border border-white/8 bg-white/[0.02] hover:border-emerald-500/30 transition-all duration-500 h-full flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SafeImage
                    src={cs.image}
                    alt={cs.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-[#D4AF37]/10 group-hover:from-emerald-500/15 transition-all duration-500" />

                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {cs.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                    {cs.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-white/5">
                    <span className="text-3xl font-bold bg-gradient-to-l from-emerald-300 to-[#D4AF37] bg-clip-text text-transparent">
                      {cs.result}
                    </span>
                    <span className="text-xs text-white/50">{cs.metric}</span>
                  </div>

                  <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">
                    {cs.description}
                  </p>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    בואו נדבר על מיזם דומה
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats bar */}
        <ScrollReveal variant="up" delay={400}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto p-8 rounded-2xl border border-white/8 bg-gradient-to-r from-emerald-500/[0.03] to-[#D4AF37]/[0.03]">
            <div className="text-center md:border-l border-white/10 first:border-l-0 md:px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">$150M+</div>
              <div className="text-xs text-white/40">גויסו ע״י לקוחות</div>
            </div>
            <div className="text-center md:border-l border-white/10 md:px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">40+</div>
              <div className="text-xs text-white/40">מיזמים שהוקמו</div>
            </div>
            <div className="text-center md:border-l border-white/10 md:px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">200+</div>
              <div className="text-xs text-white/40">משקיעים ברשת</div>
            </div>
            <div className="text-center md:border-l border-white/10 md:px-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">6+</div>
              <div className="text-xs text-white/40">שנות ניסיון מצטבר</div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
