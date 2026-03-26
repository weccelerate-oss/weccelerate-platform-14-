/**
 * Welcome Onboarding Component
 *
 * Premium onboarding experience for new entrepreneurs without active projects.
 * Modern design with step-by-step guidance and useful resources.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  FileText,
  Users,
  Target,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  Play,
  ChevronLeft,
  ArrowLeft,
  Zap,
  BookOpen,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  href: string;
  color: string;
  iconBg: string;
  completed?: boolean;
}

// =============================================================================
// DATA
// =============================================================================

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'ברוכים הבאים!',
    description: 'החשבון שלך נוצר ע״י הצוות שלנו',
    icon: <Users className="w-5 h-5" />,
    action: 'הושלם',
    href: '/portal/dashboard',
    color: 'text-violet-600',
    iconBg: 'bg-violet-50',
    completed: true,
  },
  {
    id: 'project',
    title: 'הפרויקט שלך בדרך',
    description: 'הצוות שלנו ייצור את הפרויקט עבורך בקרוב',
    icon: <Target className="w-5 h-5" />,
    action: 'ממתין',
    href: '/portal/dashboard',
    color: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'documents',
    title: 'מסמכים ישותפו אתך',
    description: 'הצוות יעלה מסמכים רלוונטיים לפרויקט שלך',
    icon: <FileText className="w-5 h-5" />,
    action: 'ממתין',
    href: '/portal/dashboard',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    id: 'meeting',
    title: 'קבע פגישה ראשונה',
    description: 'שלח הודעה לצוות לתיאום פגישה',
    icon: <Calendar className="w-5 h-5" />,
    action: 'שלח וואטסאפ',
    href: `https://wa.me/972555647538?text=${encodeURIComponent('היי, אשמח לתאם פגישת היכרות')}`,
    color: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
];

const QUICK_RESOURCES = [
  {
    title: 'מדריך ליזם המתחיל',
    description: 'כל מה שצריך לדעת',
    icon: <Play className="w-4 h-4" />,
    tag: '5 דק׳',
    color: 'text-royal-600',
    bg: 'bg-royal-50',
  },
  {
    title: 'תבנית תכנית עסקית',
    description: 'תבנית מוכנה להורדה',
    icon: <FileText className="w-4 h-4" />,
    tag: 'PDF',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: "צ'אט עם הצוות",
    description: 'יש שאלות? אנחנו כאן',
    icon: <MessageSquare className="w-4 h-4" />,
    tag: 'מיידי',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function WelcomeOnboarding({ user }: WelcomeOnboardingProps) {
  const [completedSteps] = useState<string[]>(['profile']);
  const firstName = user.name?.split(' ')[0] || 'יזם';
  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-base font-bold text-slate-900">WeCcelerate</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-md">
              פורטל יזמים
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
              {firstName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10 sm:py-14">
        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-royal-50 text-royal-700 rounded-full text-sm font-medium mb-5"
          >
            <Sparkles className="w-4 h-4" />
            <span>ברוכים הבאים למשפחת WeCcelerate!</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            שלום, {firstName}!
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            בואו נתחיל את המסע היזמי שלך -
            הנה כמה צעדים פשוטים להתחלה.
          </p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-xs text-slate-400 font-medium">התקדמות</span>
            <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-l from-emerald-500 to-royal-500 rounded-full"
              />
            </div>
            <span className="text-xs font-bold text-slate-600">
              {completedSteps.length}/{ONBOARDING_STEPS.length}
            </span>
          </div>
        </motion.div>

        {/* Onboarding Steps */}
        <div className="mb-14">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
            צעדים ראשונים
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);

              return (
                <motion.a
                  key={step.id}
                  href={step.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    'relative p-5 rounded-2xl border-2 transition-all duration-200 group',
                    'hover:shadow-lg hover:-translate-y-0.5',
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  {/* Step number badge */}
                  <div className={cn(
                    'absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm',
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-500 border border-slate-200'
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : step.iconBg,
                      isCompleted ? '' : step.color
                    )}>
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        'font-semibold text-sm mb-0.5',
                        isCompleted ? 'text-emerald-700' : 'text-slate-900'
                      )}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">{step.description}</p>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold',
                        isCompleted ? 'text-emerald-600' : 'text-royal-600'
                      )}>
                        {isCompleted ? 'הושלם' : step.action}
                        {!isCompleted && <ChevronLeft className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Quick Resources */}
        <div className="mb-14">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5">
            משאבים שימושיים
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {QUICK_RESOURCES.map((resource, index) => (
              <motion.button
                key={resource.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.06 }}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-right group"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105',
                    resource.bg,
                    resource.color
                  )}>
                    {resource.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-sm text-slate-900">{resource.title}</h3>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                        {resource.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{resource.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute -top-16 -left-16 w-64 h-64 bg-royal-500/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-medium mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  <span>התחלה מהירה</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  מוכנים להתחיל?
                </h2>
                <p className="text-slate-400 mb-6 max-w-md">
                  צרו את הפרויקט הראשון שלכם ותתחילו לעקוב אחרי ההתקדמות בזמן אמת.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                  <a
                    href={`https://wa.me/972555647538?text=${encodeURIComponent('היי, אני רוצה להתחיל את התהליך')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors text-sm"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>דברו אתנו</span>
                  </a>
                  <a
                    href={`https://wa.me/972555647538?text=${encodeURIComponent('היי, אשמח לתאם פגישת היכרות')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/15 transition-colors border border-white/10 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>קבע פגישת היכרות</span>
                  </a>
                </div>
              </div>

              {/* Illustration */}
              <div className="hidden sm:flex w-36 h-36 flex-shrink-0 items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center">
                  <Rocket className="w-16 h-16 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100">
        <p>
          צריכים עזרה?{' '}
          <a href="/sites/main/contact" className="text-royal-600 hover:underline font-medium">צרו קשר</a>
          {' '}או שלחו לנו{' '}
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '972555647538'}`} className="text-emerald-600 hover:underline font-medium">וואטסאפ</a>
        </p>
      </footer>
    </div>
  );
}

export default WelcomeOnboarding;
