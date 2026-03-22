/**
 * Project Timeline Component
 *
 * Clean, modern horizontal stepper showing project progress through stages.
 * Features smooth animations, responsive design, and clear visual hierarchy.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Circle,
  FileSearch,
  Lightbulb,
  Code,
  Rocket,
  TrendingUp,
  Award,
  Building2,
  Target,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface TimelineProps {
  status: ProjectStatus;
  stage: number;
  timeline?: Record<string, unknown> | null;
}

interface TimelineStep {
  id: ProjectStatus;
  labelHe: string;
  icon: React.ReactNode;
  description: string;
}

// =============================================================================
// TIMELINE CONFIGURATION
// =============================================================================

const TIMELINE_STEPS: TimelineStep[] = [
  { id: 'DRAFT', labelHe: 'טיוטה', icon: <Circle className="w-4 h-4" />, description: 'הפרויקט נוצר' },
  { id: 'CHARACTERIZATION', labelHe: 'אפיון', icon: <FileSearch className="w-4 h-4" />, description: 'אפיון הפרויקט והגדרת יעדים' },
  { id: 'MARKET_RESEARCH', labelHe: 'מחקר שוק', icon: <Target className="w-4 h-4" />, description: 'מחקר שוק והבנת הלקוח' },
  { id: 'BUSINESS_MODEL', labelHe: 'מודל עסקי', icon: <Lightbulb className="w-4 h-4" />, description: 'פיתוח מודל עסקי' },
  { id: 'DEVELOPMENT', labelHe: 'פיתוח', icon: <Code className="w-4 h-4" />, description: 'פיתוח המוצר / השירות' },
  { id: 'FUNDING_PREP', labelHe: 'הכנה לגיוס', icon: <Briefcase className="w-4 h-4" />, description: 'הכנת חומרים לגיוס הון' },
  { id: 'ACTIVE_FUNDING', labelHe: 'גיוס פעיל', icon: <Rocket className="w-4 h-4" />, description: 'תהליך גיוס הון פעיל' },
  { id: 'POST_FUNDING', labelHe: 'לאחר גיוס', icon: <TrendingUp className="w-4 h-4" />, description: 'צמיחה לאחר גיוס' },
  { id: 'SCALING', labelHe: 'סקיילינג', icon: <Building2 className="w-4 h-4" />, description: 'הרחבת הפעילות' },
  { id: 'GRADUATED', labelHe: 'בוגר', icon: <Award className="w-4 h-4" />, description: 'סיום התוכנית בהצלחה!' },
];

function getStepIndex(status: ProjectStatus): number {
  const index = TIMELINE_STEPS.findIndex((step) => step.id === status);
  return index >= 0 ? index : 0;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProjectTimeline({ status, stage, timeline }: TimelineProps) {
  const currentStepIndex = getStepIndex(status);
  const progressPercent = (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100;

  const customTimeline = timeline?.stages as Array<{
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
  }> | undefined;

  return (
    <div className="space-y-6">
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative px-2">
          {/* Background track */}
          <div className="absolute top-5 right-5 left-5 h-[3px] bg-slate-100 rounded-full" />

          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-5 right-5 h-[3px] bg-gradient-to-l from-emerald-500 to-royal-500 rounded-full"
            style={{ maxWidth: 'calc(100% - 40px)' }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative"
                  style={{ width: `${100 / TIMELINE_STEPS.length}%` }}
                >
                  {/* Step circle */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
                      isCurrent && 'bg-royal-500 text-white shadow-md shadow-royal-500/30 ring-[3px] ring-royal-100',
                      isPending && 'bg-white text-slate-300 border-2 border-slate-200'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      step.icon
                    )}

                    {/* Pulse for current */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-royal-400"
                        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <p className={cn(
                    'mt-2.5 text-[10px] font-medium text-center leading-tight max-w-[60px]',
                    isCompleted && 'text-emerald-600',
                    isCurrent && 'text-royal-600 font-semibold',
                    isPending && 'text-slate-400'
                  )}>
                    {step.labelHe}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center gap-3 p-3.5 bg-gradient-to-l from-royal-50 to-slate-50 rounded-xl border border-royal-100/60"
        >
          <div className="p-2 bg-white rounded-lg text-royal-600 shadow-sm">
            {TIMELINE_STEPS[currentStepIndex]?.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              שלב נוכחי: {TIMELINE_STEPS[currentStepIndex]?.labelHe}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {TIMELINE_STEPS[currentStepIndex]?.description}
            </p>
          </div>
          <div className="mr-auto text-xs font-semibold text-royal-600 bg-white px-2.5 py-1 rounded-lg shadow-sm">
            {currentStepIndex + 1}/{TIMELINE_STEPS.length}
          </div>
        </motion.div>
      </div>

      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden">
        <div className="relative pr-8">
          {/* Vertical line */}
          <div className="absolute right-[11px] top-0 bottom-0 w-[2px] bg-slate-100 rounded-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full bg-gradient-to-b from-emerald-500 to-royal-500 rounded-full"
            />
          </div>

          <div className="space-y-4">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative flex items-start gap-3"
                >
                  {/* Circle */}
                  <div className={cn(
                    'absolute right-0 w-6 h-6 rounded-full flex items-center justify-center -translate-x-1/2',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-royal-500 text-white ring-2 ring-royal-200',
                    isPending && 'bg-white border-2 border-slate-200 text-slate-300'
                  )}>
                    {isCompleted ? (
                      <Check className="w-3 h-3" strokeWidth={3} />
                    ) : (
                      <Circle className="w-2 h-2 fill-current" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    'flex-1 pb-1',
                    isCurrent && 'bg-royal-50 -mr-1 px-3 py-2 rounded-lg border border-royal-100'
                  )}>
                    <p className={cn(
                      'font-medium text-sm',
                      isCompleted && 'text-emerald-600',
                      isCurrent && 'text-royal-700',
                      isPending && 'text-slate-400'
                    )}>
                      {step.labelHe}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Timeline */}
      {customTimeline && customTimeline.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            אבני דרך מותאמות
          </h4>
          <div className="space-y-2">
            {customTimeline.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-lg transition-colors',
                  item.status === 'completed' && 'bg-emerald-50/60',
                  item.status === 'in-progress' && 'bg-royal-50/60',
                  item.status === 'upcoming' && 'bg-slate-50'
                )}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  item.status === 'completed' && 'bg-emerald-500',
                  item.status === 'in-progress' && 'bg-royal-500 animate-pulse',
                  item.status === 'upcoming' && 'bg-slate-300'
                )} />
                <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                {item.endDate && (
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(item.endDate).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTimeline;
