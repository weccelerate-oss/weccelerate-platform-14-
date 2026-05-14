'use client';

import { motion } from 'framer-motion';
import { Quote, TrendingUp, Building, Briefcase } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SafeImage } from '@/components/landing-helpers/SafeImage';
import { Sparkles } from '@/components/landing-helpers/FloatingDecor';

export default function EnterpriseSpotlight() {
  return (
    <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden bg-[#070b1e]">
      <Sparkles color="#10B981" count={20} />

      <div className="container-corporate relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* Left — large feature image with overlapping cards */}
          <div className="lg:col-span-7 relative">
            <ScrollReveal variant="left">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="relative aspect-[5/4] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-500/20"
              >
                <SafeImage
                  src="/images/landing-assets/biz/spotlight-main.png"
                  alt="ארגונים מובילים בישראל בחרו ב-WeCcelerate Business"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-[#070b1e] via-transparent to-emerald-500/15" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070b1e]/80" />

                {/* Floating stat card top */}
                <motion.div
                  className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-[#070b1e]/85 border border-emerald-400/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl shadow-emerald-500/20"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-300/80 mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" />
                    היתרון
                  </div>
                  <div className="text-base sm:text-lg font-bold bg-gradient-to-l from-emerald-300 to-[#D4AF37] bg-clip-text text-transparent">
                    תהליך מובנה
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/50 mt-1">מ-Feasibility ועד Spin-off</div>
                </motion.div>

                {/* Floating stat card bottom right */}
                <motion.div
                  className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-[#070b1e]/85 border border-[#D4AF37]/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl shadow-[#D4AF37]/10"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                >
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#D4AF37]/80 mb-1 flex items-center gap-1.5">
                    <Building className="w-3 h-3" />
                    הצוות
                  </div>
                  <div className="text-base sm:text-lg font-bold text-white">צוות מומחים</div>
                  <div className="text-[9px] sm:text-[10px] text-white/50 mt-1">בלי לבנות יחידה פנימית</div>
                </motion.div>

                {/* Bottom-left brand badge */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ENTERPRISE PROVEN
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Floating bonus image card (desktop only) */}
            <ScrollReveal variant="up" delay={300}>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="hidden lg:block absolute -bottom-12 -right-8 w-48 h-32 rounded-2xl overflow-hidden border-4 border-[#070b1e] shadow-2xl shadow-emerald-500/20 z-10"
              >
                <SafeImage
                  src="/images/landing-assets/biz/spotlight-detail.png"
                  alt="פירוט מיזם"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/60 to-transparent" />
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Right — content */}
          <div className="lg:col-span-5 text-right">
            <ScrollReveal variant="right" delay={200}>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-[0.22em] px-4 py-2 rounded-full mb-6">
                <Briefcase className="w-3.5 h-3.5" />
                Trusted by Enterprises
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={300}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                כשתאגידים גדולים{' '}
                <span className="bg-gradient-to-l from-emerald-300 to-[#D4AF37] bg-clip-text text-transparent">
                  רוצים להזניק חדשנות
                </span>
                , הם מתקשרים אלינו.
              </h2>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={400}>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8">
                החל מקופות חולים גדולות ועד תאגידי ייצור מובילים — אנחנו השותף המקצועי
                שמלווה אותם מהרעיון ועד ה-Spin-off המוצלח. בלי לסכן את הליבה, בלי
                להעמיס על הצוות הקיים.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="right" delay={500}>
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-emerald-500/[0.05] to-transparent border-l-2 border-emerald-400/40">
                <Quote className="w-8 h-8 text-emerald-400/40 mb-3" />
                <p className="text-white/80 italic leading-relaxed mb-4 text-sm sm:text-base">
                  &ldquo;קיבלנו צוות מלא של מומחים תוך שבועיים, מתודולוגיה מוכחת, וגישה
                  לרשת משקיעים שלא היה לנו דרך אחרת להגיע אליהם. תוך שנה היה לנו מיזם
                  עצמאי שכבר גייס סבב Seed.&rdquo;
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400/30 to-[#D4AF37]/20 border border-emerald-400/30" />
                  <div>
                    <div className="text-white font-bold">סמנכ״ל אסטרטגיה</div>
                    <div className="text-white/40">קבוצת תעשייה מובילה · ישראל</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
