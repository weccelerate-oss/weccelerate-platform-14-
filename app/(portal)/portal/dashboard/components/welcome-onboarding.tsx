/**
 * Welcome Onboarding Component
 * 
 * Displayed when user has no active project.
 * Guides them through the onboarding process.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  FileText,
  Users,
  Target,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  Play,
  ChevronLeft,
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
  completed?: boolean;
}

// =============================================================================
// DATA
// =============================================================================

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'השלם את הפרופיל',
    description: 'הוסף פרטים על עצמך והחברה שלך',
    icon: <Users className="w-6 h-6" />,
    action: 'עדכן פרופיל',
    href: '/portal/settings/profile',
  },
  {
    id: 'project',
    title: 'צור פרויקט חדש',
    description: 'התחל לעקוב אחרי ההתקדמות שלך',
    icon: <Target className="w-6 h-6" />,
    action: 'צור פרויקט',
    href: '/portal/project/new',
  },
  {
    id: 'documents',
    title: 'העלה מסמכים',
    description: 'שתף את התכנית העסקית או המצגת שלך',
    icon: <FileText className="w-6 h-6" />,
    action: 'העלאת קבצים',
    href: '/portal/files/upload',
  },
  {
    id: 'meeting',
    title: 'קבע פגישה ראשונה',
    description: 'תאם שיחה עם המנטור שלך',
    icon: <Calendar className="w-6 h-6" />,
    action: 'קביעת פגישה',
    href: '/portal/meetings/schedule',
  },
];

const QUICK_RESOURCES = [
  {
    title: 'מדריך ליזם המתחיל',
    description: 'כל מה שצריך לדעת כדי להתחיל',
    icon: <Play className="w-5 h-5" />,
    type: 'video',
    duration: '5 דק׳',
  },
  {
    title: 'תבנית תכנית עסקית',
    description: 'תבנית מוכנה להורדה',
    icon: <FileText className="w-5 h-5" />,
    type: 'document',
  },
  {
    title: "צ'אט עם הצוות",
    description: 'יש שאלות? אנחנו כאן',
    icon: <MessageSquare className="w-5 h-5" />,
    type: 'chat',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function WelcomeOnboarding({ user }: WelcomeOnboardingProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>(['profile']); // Demo: profile completed

  const firstName = user.name?.split(' ')[0] || 'יזם';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-royal-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-xl font-bold bg-gradient-to-l from-royal-600 to-cyan-500 bg-clip-text text-transparent"
              >
                WeCcelerate
              </a>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                פורטל יזמים
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user.email}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                {firstName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-royal-100 text-royal-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>ברוכים הבאים למשפחה!</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            שלום, {firstName}! 👋
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            אנחנו שמחים שהצטרפת. בואו נתחיל את המסע היזמי שלך - 
            הנה כמה צעדים פשוטים להתחלה.
          </p>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-sm text-slate-500">התקדמות:</span>
            <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / ONBOARDING_STEPS.length) * 100}%` }}
                className="h-full bg-gradient-to-l from-royal-500 to-emerald-500"
              />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {completedSteps.length}/{ONBOARDING_STEPS.length}
            </span>
          </div>
        </motion.div>

        {/* Onboarding Steps */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            צעדים ראשונים
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              
              return (
                <motion.a
                  key={step.id}
                  href={step.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'relative p-6 rounded-2xl border-2 transition-all duration-300',
                    'hover:shadow-lg hover:-translate-y-1',
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-royal-300'
                  )}
                >
                  {/* Step number */}
                  <div className={cn(
                    'absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'p-3 rounded-xl',
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-royal-100 text-royal-600'
                    )}>
                      {step.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className={cn(
                        'font-semibold mb-1',
                        isCompleted ? 'text-emerald-700' : 'text-slate-900'
                      )}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3">
                        {step.description}
                      </p>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-sm font-medium',
                        isCompleted ? 'text-emerald-600' : 'text-royal-600'
                      )}>
                        {isCompleted ? 'הושלם' : step.action}
                        {!isCompleted && <ChevronLeft className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* Quick Resources */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            משאבים שימושיים
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_RESOURCES.map((resource, index) => (
              <motion.button
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-royal-300 hover:shadow-md transition-all text-right group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-royal-100 group-hover:text-royal-600 transition-colors">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {resource.description}
                    </p>
                    {resource.duration && (
                      <span className="text-xs text-royal-600 mt-1 inline-block">
                        {resource.duration}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-royal-600 via-royal-700 to-purple-800 p-8 md:p-12 text-white">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Content */}
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  מוכנים להתחיל?
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  צרו את הפרויקט הראשון שלכם ותתחילו לעקוב אחרי ההתקדמות בזמן אמת.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <a
                    href="/portal/project/new"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-royal-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>צור פרויקט חדש</span>
                  </a>
                  <a
                    href="/portal/meetings/schedule"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>קבע פגישת היכרות</span>
                  </a>
                </div>
              </div>

              {/* Illustration */}
              <div className="w-48 h-48 flex-shrink-0">
                <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Rocket className="w-24 h-24 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500">
        <p>
          צריכים עזרה?{' '}
          <a href="/contact" className="text-royal-600 hover:underline">
            צרו קשר
          </a>
          {' '}או שלחו לנו{' '}
          <a href="https://wa.me/972535551234" className="text-emerald-600 hover:underline">
            וואטסאפ
          </a>
        </p>
      </footer>
    </div>
  );
}

export default WelcomeOnboarding;
