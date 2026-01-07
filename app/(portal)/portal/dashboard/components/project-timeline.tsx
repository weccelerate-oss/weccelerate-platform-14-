/**
 * Project Timeline Component
 * 
 * Visual representation of the project status from Pipedrive.
 * Shows a horizontal stepper with completed, in-progress, and pending states.
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
  PartyPopper,
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
  label: string;
  labelHe: string;
  icon: React.ReactNode;
  description: string;
}

// =============================================================================
// TIMELINE CONFIGURATION
// =============================================================================

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'DRAFT',
    label: 'Draft',
    labelHe: 'טיוטה',
    icon: <Circle className="w-5 h-5" />,
    description: 'הפרויקט נוצר',
  },
  {
    id: 'CHARACTERIZATION',
    label: 'Characterization',
    labelHe: 'אפיון',
    icon: <FileSearch className="w-5 h-5" />,
    description: 'אפיון הפרויקט והגדרת יעדים',
  },
  {
    id: 'MARKET_RESEARCH',
    label: 'Market Research',
    labelHe: 'מחקר שוק',
    icon: <Target className="w-5 h-5" />,
    description: 'מחקר שוק והבנת הלקוח',
  },
  {
    id: 'BUSINESS_MODEL',
    label: 'Business Model',
    labelHe: 'מודל עסקי',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'פיתוח מודל עסקי',
  },
  {
    id: 'DEVELOPMENT',
    label: 'Development',
    labelHe: 'פיתוח',
    icon: <Code className="w-5 h-5" />,
    description: 'פיתוח המוצר / השירות',
  },
  {
    id: 'FUNDING_PREP',
    label: 'Funding Prep',
    labelHe: 'הכנה לגיוס',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'הכנת חומרים לגיוס הון',
  },
  {
    id: 'ACTIVE_FUNDING',
    label: 'Active Funding',
    labelHe: 'גיוס פעיל',
    icon: <Rocket className="w-5 h-5" />,
    description: 'תהליך גיוס הון פעיל',
  },
  {
    id: 'POST_FUNDING',
    label: 'Post Funding',
    labelHe: 'לאחר גיוס',
    icon: <TrendingUp className="w-5 h-5" />,
    description: 'צמיחה לאחר גיוס',
  },
  {
    id: 'SCALING',
    label: 'Scaling',
    labelHe: 'סקיילינג',
    icon: <Building2 className="w-5 h-5" />,
    description: 'הרחבת הפעילות',
  },
  {
    id: 'GRADUATED',
    label: 'Graduated',
    labelHe: 'בוגר',
    icon: <Award className="w-5 h-5" />,
    description: 'סיום התוכנית בהצלחה!',
  },
];

// Get step index from status
function getStepIndex(status: ProjectStatus): number {
  const index = TIMELINE_STEPS.findIndex((step) => step.id === status);
  return index >= 0 ? index : 0;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProjectTimeline({ status, stage, timeline }: TimelineProps) {
  const currentStepIndex = getStepIndex(status);
  
  // Parse custom timeline if available
  const customTimeline = timeline?.stages as Array<{
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
  }> | undefined;

  return (
    <div className="relative">
      {/* Desktop Timeline - Horizontal */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-6 right-6 left-6 h-1 bg-slate-200 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-l from-royal-500 to-emerald-500 rounded-full"
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center"
                  style={{ width: '10%' }}
                >
                  {/* Step circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center',
                      'transition-all duration-300',
                      isCompleted && 'bg-emerald-500 text-white',
                      isCurrent && 'bg-royal-500 text-white ring-4 ring-royal-200',
                      isPending && 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {step.icon}
                      </motion.div>
                    ) : (
                      step.icon
                    )}
                    
                    {/* Pulse effect for current step */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-royal-500"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    )}
                  </motion.div>

                  {/* Step label */}
                  <div className="mt-3 text-center">
                    <p className={cn(
                      'text-xs font-medium',
                      isCompleted && 'text-emerald-600',
                      isCurrent && 'text-royal-600',
                      isPending && 'text-slate-400'
                    )}>
                      {step.labelHe}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-royal-50 rounded-xl border border-royal-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-royal-100 rounded-lg text-royal-600">
              {TIMELINE_STEPS[currentStepIndex]?.icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                שלב נוכחי: {TIMELINE_STEPS[currentStepIndex]?.labelHe}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {TIMELINE_STEPS[currentStepIndex]?.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden">
        <div className="relative pr-8">
          {/* Vertical line */}
          <div className="absolute right-3 top-0 bottom-0 w-0.5 bg-slate-200">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full bg-gradient-to-b from-emerald-500 to-royal-500"
            />
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Step circle */}
                  <div className={cn(
                    'absolute right-0 w-6 h-6 rounded-full flex items-center justify-center',
                    'transition-all duration-300 -translate-x-1/2',
                    isCompleted && 'bg-emerald-500 text-white',
                    isCurrent && 'bg-royal-500 text-white ring-2 ring-royal-200',
                    isPending && 'bg-slate-200 text-slate-400'
                  )}>
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Circle className="w-2 h-2 fill-current" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className={cn(
                    'flex-1 pb-2',
                    isCurrent && 'bg-royal-50 -mr-2 -ml-2 px-4 py-3 rounded-xl border border-royal-100'
                  )}>
                    <p className={cn(
                      'font-medium text-sm',
                      isCompleted && 'text-emerald-600',
                      isCurrent && 'text-royal-600',
                      isPending && 'text-slate-400'
                    )}>
                      {step.labelHe}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-slate-500 mt-1">
                        {step.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Timeline (if provided) */}
      {customTimeline && customTimeline.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-4">אבני דרך מותאמות אישית</h4>
          <div className="space-y-3">
            {customTimeline.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  item.status === 'completed' && 'bg-emerald-50',
                  item.status === 'in-progress' && 'bg-royal-50',
                  item.status === 'upcoming' && 'bg-slate-50'
                )}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  item.status === 'completed' && 'bg-emerald-500',
                  item.status === 'in-progress' && 'bg-royal-500 animate-pulse',
                  item.status === 'upcoming' && 'bg-slate-300'
                )} />
                <span className="flex-1 text-sm">{item.name}</span>
                {item.endDate && (
                  <span className="text-xs text-slate-500">
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
