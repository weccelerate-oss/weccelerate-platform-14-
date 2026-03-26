/**
 * Welcome Onboarding Component
 *
 * Displayed when an entrepreneur's project hasn't been set up yet.
 * Focuses on the journey they're already in, not on starting something new.
 * Provides access to the learning center and team communication.
 */

'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  FileText,
  Target,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  Briefcase,
  Rocket,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { COURSES_DATA, getTotalLessons } from '@/lib/courses-data';

// =============================================================================
// TYPES
// =============================================================================

interface WelcomeOnboardingProps {
  user: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  };
}

// =============================================================================
// JOURNEY STAGES
// =============================================================================

const JOURNEY_STAGES = [
  {
    id: 'onboarding',
    title: 'הצטרפות לתוכנית',
    description: 'נרשמת בהצלחה לפורטל היזמים',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    completed: true,
  },
  {
    id: 'setup',
    title: 'הקמת הפרויקט',
    description: 'הצוות שלנו מכין את הפרויקט שלך - זה ייקח רגע',
    icon: <Target className="w-5 h-5" />,
    color: 'text-blue-600',
    iconBg: 'bg-blue-50',
    current: true,
  },
  {
    id: 'mentoring',
    title: 'ליווי אישי',
    description: 'פגישות עם מנטור ותמיכה מקצועית',
    icon: <Calendar className="w-5 h-5" />,
    color: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
  {
    id: 'growth',
    title: 'צמיחה והתפתחות',
    description: 'מעקב אחר התקדמות וגיוס הון',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
];

// =============================================================================
// FEATURED COURSES (from the course data)
// =============================================================================

const FEATURED_COURSES = [
  {
    title: 'דוחות כספיים',
    description: 'אבני היסוד של כל חברה ומיזם',
    lessonsCount: COURSES_DATA[0]?.subcategories[0]?.lessons.length || 10,
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    title: 'תוכנית עסקית',
    description: 'מפת הדרכים של הסטארטאפ שלך',
    lessonsCount: COURSES_DATA[1]?.subcategories[0]?.lessons.length || 3,
    icon: <Briefcase className="w-5 h-5" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  {
    title: 'השקעות וצמיחה',
    description: 'גיוס הון, סוגי משקיעים ואסטרטגיות',
    lessonsCount: COURSES_DATA[2]?.subcategories[0]?.lessons.length || 13,
    icon: <Rocket className="w-5 h-5" />,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function WelcomeOnboarding({ user }: WelcomeOnboardingProps) {
  const firstName = user.name?.split(' ')[0] || 'יזם';
  const totalLessons = getTotalLessons();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-base font-bold text-slate-900">WeCcelerate</span>
            <span className="px-2 py-0.5 bg-royal-50 text-royal-700 text-[10px] font-semibold rounded-md">
              פורטל יזמים
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-slate-500">{user.company || user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
              {firstName.charAt(0)}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              title="התנתק"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-slate-500 text-base max-w-lg">
            הפרויקט שלך בהכנה. בינתיים, אפשר להתחיל ללמוד ולהתכונן למסע היזמי.
          </p>
        </motion.div>

        {/* Journey Progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 mb-6"
        >
          <h2 className="text-[15px] font-semibold text-slate-900 mb-5">
            המסע שלך ב-WeCcelerate
          </h2>
          <div className="space-y-4">
            {JOURNEY_STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    stage.completed ? 'bg-emerald-100 text-emerald-600' : stage.current ? cn(stage.iconBg, stage.color, 'ring-2 ring-blue-200') : 'bg-slate-100 text-slate-400'
                  )}>
                    {stage.icon}
                  </div>
                  {index < JOURNEY_STAGES.length - 1 && (
                    <div className={cn(
                      'w-0.5 h-6 mt-1',
                      stage.completed ? 'bg-emerald-300' : 'bg-slate-200'
                    )} />
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      'font-semibold text-sm',
                      stage.completed ? 'text-emerald-700' : stage.current ? 'text-slate-900' : 'text-slate-400'
                    )}>
                      {stage.title}
                    </h3>
                    {stage.completed && (
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">הושלם</span>
                    )}
                    {stage.current && (
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        כרגע
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    'text-xs mt-0.5',
                    stage.completed || stage.current ? 'text-slate-500' : 'text-slate-400'
                  )}>
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Center CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 mb-6"
        >
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-violet-500/15 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white">מרכז הלמידה</h2>
            </div>
            <p className="text-slate-300 mb-5 max-w-lg leading-relaxed">
              בזמן שהפרויקט שלך בהקמה, נצל את הזמן ללמוד את הבסיס.
              {totalLessons} שיעורי וידאו בנושאי פיננסים, עסקים, השקעות ופיתוח - כל מה שיזם צריך לדעת.
            </p>

            {/* Featured course cards */}
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {FEATURED_COURSES.map((course, index) => (
                <motion.div
                  key={course.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', 'bg-white/10')}>
                    <span className="text-white">{course.icon}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{course.title}</h3>
                  <p className="text-slate-400 text-xs mb-2">{course.description}</p>
                  <span className="text-[11px] text-cyan-400 font-medium">{course.lessonsCount} שיעורים</span>
                </motion.div>
              ))}
            </div>

            <a
              href="/portal/learning"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>התחל ללמוד</span>
            </a>
          </div>
        </motion.div>

        {/* WhatsApp contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-slate-900 mb-1">יש שאלות? אנחנו כאן</h3>
              <p className="text-xs text-slate-500 mb-3">הצוות שלנו זמין בוואטסאפ לכל שאלה או בקשה</p>
              <a
                href={`https://wa.me/972555647538?text=${encodeURIComponent('היי, אני יזם/ת בתוכנית ויש לי שאלה')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>שלח הודעה</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100">
        <p>
          WeCcelerate &mdash; מאיצים יזמות
        </p>
      </footer>
    </div>
  );
}

export default WelcomeOnboarding;
