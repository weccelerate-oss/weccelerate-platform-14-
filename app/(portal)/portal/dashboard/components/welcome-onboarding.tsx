/**
 * Welcome Onboarding Component
 *
 * Shown when an entrepreneur's project isn't set up yet. The page leads
 * with the Learning Center — that's the thing they can actually do today
 * while the team prepares their project behind the scenes.
 */

'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Briefcase,
  Rocket,
  Clock,
  PlayCircle,
  ChevronLeft,
  Compass,
  Sparkles,
  FolderOpen,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COURSES_DATA, getTotalLessons } from '@/lib/courses-data';
import { Kochavi } from '../../components/kochavi';

interface WelcomeOnboardingProps {
  user: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  };
}

const FEATURED_CATEGORIES = [
  {
    title: 'מושגים פיננסיים',
    description: 'דוחות, רווחיות, יחסים פיננסיים',
    href: '/portal/learning',
    icon: TrendingUp,
    accent: 'from-sky-400/30 to-blue-600/10',
    iconColor: 'text-sky-300',
    borderColor: 'border-sky-400/20',
  },
  {
    title: 'מושגים עסקיים',
    description: 'תוכנית עסקית, מודל הכנסה, שוק יעד',
    href: '/portal/learning',
    icon: Briefcase,
    accent: 'from-emerald-400/30 to-emerald-700/10',
    iconColor: 'text-emerald-300',
    borderColor: 'border-emerald-400/20',
  },
  {
    title: 'השקעות וצמיחה',
    description: 'גיוסי הון, סוגי משקיעים, אסטרטגיות',
    href: '/portal/learning',
    icon: Rocket,
    accent: 'from-violet-400/30 to-purple-700/10',
    iconColor: 'text-violet-300',
    borderColor: 'border-violet-400/20',
  },
  {
    title: 'ניהול זמן',
    description: 'תעדוף, פוקוס, הרגלי עבודה של יזם',
    href: '/portal/learning',
    icon: Clock,
    accent: 'from-amber-400/30 to-amber-700/10',
    iconColor: 'text-amber-300',
    borderColor: 'border-amber-400/20',
  },
];

export function WelcomeOnboarding({ user }: WelcomeOnboardingProps) {
  const firstName = user.name?.split(' ')[0] || 'יזם';
  const totalLessons = getTotalLessons();
  const totalCategories = COURSES_DATA.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  return (
    <div>
      {/* Hero — full-bleed background image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/portal/learning-hero.png"
            alt=""
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/portal/welcome-hero.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/55 via-[#070b1e]/75 to-[#070b1e]" />
          {/* Subtle gold glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(200,169,81,0.10) 0%, transparent 70%)',
            }}
          />
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative z-10">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center sm:text-right"
          >
            <p className="text-[11px] font-semibold tracking-[0.3em] text-[#c8a951] uppercase mb-3">
              פורטל היזמים · WeCcelerate
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
              {getGreeting()}, {firstName}.
            </h1>
            <p className="text-white/65 text-base sm:text-lg max-w-2xl leading-relaxed sm:mx-0 mx-auto">
              הצוות שלנו כבר עובד על הפרויקט שלך. בזמן הזה — צא למסע ההכנה למשקיעים ולמד מכל שיעורי הווידאו שלנו.
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-px bg-white/[0.06] rounded-2xl border border-white/[0.08] overflow-hidden mb-8"
          >
            <div className="bg-[#070b1e]/60 backdrop-blur-sm p-4 sm:p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#c8a951] tabular-nums">{totalLessons}</p>
              <p className="text-[11px] sm:text-xs text-white/55 mt-1 tracking-wide">שיעורי וידאו</p>
            </div>
            <div className="bg-[#070b1e]/60 backdrop-blur-sm p-4 sm:p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#c8a951] tabular-nums">{totalCategories}</p>
              <p className="text-[11px] sm:text-xs text-white/55 mt-1 tracking-wide">קטגוריות לימוד</p>
            </div>
            <div className="bg-[#070b1e]/60 backdrop-blur-sm p-4 sm:p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-[#c8a951]">∞</p>
              <p className="text-[11px] sm:text-xs text-white/55 mt-1 tracking-wide">גישה בלתי מוגבלת</p>
            </div>
          </motion.div>

          {/* Founder Journey card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="wc-shine relative overflow-hidden rounded-3xl border border-[#c8a951]/30 bg-gradient-to-bl from-[#141126] via-[#0c0f26] to-[#070b1e] p-6 sm:p-10 mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#c8a951]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            {/* כוכבי מנופף לשלום מפינת הכרטיס */}
            <div className="absolute left-3 bottom-2 hidden sm:block opacity-95 pointer-events-none">
              <Kochavi size={96} anim="wave" />
            </div>

            <div className="relative">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c8a951] to-[#8b7330] flex items-center justify-center shadow-[0_4px_16px_rgba(200,169,81,0.4)]">
                  <Compass className="w-6 h-6 text-[#070b1e]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">מסע מרעיון למיזם</h2>
                  <p className="text-xs text-white/45 mt-0.5">7 תחנות · 100 שאלות משקיעים · שמירה אוטומטית</p>
                </div>
              </div>

              <p className="text-white/70 mb-6 max-w-2xl leading-relaxed text-sm sm:text-base">
                המסע שמכין אותך לחדר המשקיעים: ענה בקצב שלך על השאלות שמשקיעים באמת
                שואלים, קבל משוב אישי מהמנטור, וצפה בתשובות הסופיות שלך נאספות לתיק
                מוכנות מסודר — מוכן להדפסה לפני כל פגישה.
              </p>

              <div className="grid sm:grid-cols-3 gap-3 mb-7">
                <div className="rounded-xl border border-[#c8a951]/20 bg-white/[0.03] p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#e8d48b] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">מפת כוכבים אישית</h3>
                    <p className="text-xs text-white/55 leading-relaxed">כל תחנה שתסיים נחתמת בזהב</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#c8a951]/20 bg-white/[0.03] p-4 flex items-start gap-3">
                  <Wand2 className="w-5 h-5 text-[#e8d48b] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">משוב מהמנטור</h3>
                    <p className="text-xs text-white/55 leading-relaxed">ביקורת מקצועית על כל תשובה</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#c8a951]/20 bg-white/[0.03] p-4 flex items-start gap-3">
                  <FolderOpen className="w-5 h-5 text-[#e8d48b] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-0.5">תיק מוכנות</h3>
                    <p className="text-xs text-white/55 leading-relaxed">התשובות הסופיות במקום אחד</p>
                  </div>
                </div>
              </div>

              <a
                href="/portal/journey"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#c8a951] via-[#e8d48b] to-[#c8a951] text-[#070b1e] font-bold rounded-xl hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(200,169,81,0.45)] transition-all text-sm sm:text-base shadow-[0_4px_20px_rgba(200,169,81,0.25)]"
              >
                <Compass className="w-5 h-5" />
                <span>צא למסע</span>
                <ChevronLeft className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Featured Learning Center card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-bl from-[#0e1736] via-[#0a1024] to-[#070b1e] p-6 sm:p-10 mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#c8a951]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#c8a951] to-[#8b7330] flex items-center justify-center shadow-[0_4px_16px_rgba(200,169,81,0.4)]">
                  <GraduationCap className="w-6 h-6 text-[#070b1e]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">מרכז הלמידה</h2>
                  <p className="text-xs text-white/45 mt-0.5">שיעורים בעברית · נצפים בכל מכשיר</p>
                </div>
              </div>

              <p className="text-white/70 mb-7 max-w-2xl leading-relaxed text-sm sm:text-base">
                ספריית וידאו מקצועית בעברית — פיננסים, עסקים, גיוס הון וניהול. כתבנו אותה
                כדי שתבוא ערוכ/ה לפגישה הבאה שלך עם מנטור, משקיע, או רואה חשבון.
              </p>

              {/* Category grid */}
              <div className="grid sm:grid-cols-2 gap-3 mb-7">
                {FEATURED_CATEGORIES.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <motion.a
                      key={cat.title}
                      href={cat.href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.07 }}
                      className={cn(
                        'wc-shine group relative overflow-hidden rounded-xl border bg-white/[0.03] backdrop-blur-sm p-4 sm:p-5',
                        'hover:bg-white/[0.06] hover:scale-[1.02] hover:shadow-lg transition-all duration-200',
                        cat.borderColor,
                      )}
                    >
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-bl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
                          cat.accent,
                        )}
                      />
                      <div className="relative flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                          <Icon className={cn('w-5 h-5', cat.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-1.5">
                            {cat.title}
                            <ChevronLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all text-white/60" />
                          </h3>
                          <p className="text-xs text-white/55 leading-relaxed">{cat.description}</p>
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

              {/* Primary CTA */}
              <a
                href="/portal/learning"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#c8a951] via-[#e8d48b] to-[#c8a951] text-[#070b1e] font-bold rounded-xl hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(200,169,81,0.45)] transition-all text-sm sm:text-base shadow-[0_4px_20px_rgba(200,169,81,0.25)]"
              >
                <PlayCircle className="w-5 h-5" />
                <span>התחילו לצפות</span>
                <ChevronLeft className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* WhatsApp contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-white/90 mb-1">יש שאלה? אנחנו כאן.</h3>
                <p className="text-xs text-white/50 mb-3">
                  הצוות שלנו זמין בוואטסאפ — שאלה על שיעור, על התוכנית, או כל דבר אחר.
                </p>
                <a
                  href={`https://wa.me/972555647538?text=${encodeURIComponent('היי, אני יזם/ת בתוכנית ויש לי שאלה')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 font-medium rounded-xl hover:bg-emerald-500/15 transition-colors text-sm border border-emerald-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>שלח/י הודעה</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Tiny "what's next" hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>הפרויקט האישי שלך יפתח בלוח שלך ברגע שהצוות יסיים את ההכנה</span>
          </motion.div>
        </main>
      </div>

      <footer className="py-8 text-center text-sm text-white/30 border-t border-white/[0.06]">
        <p>WeCcelerate &mdash; מאיצים יזמות</p>
      </footer>
    </div>
  );
}

export default WelcomeOnboarding;
