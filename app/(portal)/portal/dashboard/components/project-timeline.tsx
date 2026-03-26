/**
 * Project Timeline Component
 *
 * Displays project progress through stages.
 * Uses Pipedrive pipeline stages when available, falls back to hardcoded steps.
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
  // DB-based (fallback)
  status: ProjectStatus;
  stage: number;
  timeline?: Record<string, unknown> | null;
  // Pipedrive-based (preferred)
  pipedriveStages?: { id: number; name: string; orderNr: number }[];
  currentStageId?: number;
  dealStatus?: string;
}

interface TimelineStep {
  id: string;
  labelHe: string;
  icon: React.ReactNode;
  description: string;
}

// =============================================================================
// FALLBACK TIMELINE CONFIGURATION
// =============================================================================

const FALLBACK_STEPS: TimelineStep[] = [
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

function getFallbackStepIndex(status: ProjectStatus): number {
  const index = FALLBACK_STEPS.findIndex((step) => step.id === status);
  return index >= 0 ? index : 0;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProjectTimeline({
  status,
  stage,
  timeline,
  pipedriveStages,
  currentStageId,
  dealStatus,
}: TimelineProps) {
  // Determine if we should use Pipedrive stages
  const usePipedrive = pipedriveStages && pipedriveStages.length > 0 && currentStageId !== undefined;

  // Build the steps array
  const steps: { id: string; label: string; icon: React.ReactNode }[] = usePipedrive
    ? pipedriveStages.map((s, i) => ({
        id: String(s.id),
        label: s.name,
        icon: <Circle className="w-4 h-4" />,
      }))
    : FALLBACK_STEPS.map((s) => ({
        id: s.id,
        label: s.labelHe,
        icon: s.icon,
      }));

  // Find current step index
  let currentStepIndex: number;
  if (usePipedrive) {
    if (dealStatus === 'won') {
      // All stages completed
      currentStepIndex = steps.length;
    } else if (dealStatus === 'lost') {
      currentStepIndex = pipedriveStages.findIndex((s) => s.id === currentStageId);
      if (currentStepIndex < 0) currentStepIndex = 0;
    } else {
      currentStepIndex = pipedriveStages.findIndex((s) => s.id === currentStageId);
      if (currentStepIndex < 0) currentStepIndex = 0;
    }
  } else {
    currentStepIndex = getFallbackStepIndex(status);
  }

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1
    ? (Math.min(currentStepIndex, totalSteps - 1) / (totalSteps - 1)) * 100
    : 100;

  // For "won" deals, progress is 100%
  const finalProgress = (usePipedrive && dealStatus === 'won') ? 100 : progressPercent;

  const currentStepLabel = currentStepIndex < steps.length
    ? steps[currentStepIndex].label
    : steps[steps.length - 1]?.label || '';
  const currentStepDescription = usePipedrive
    ? (dealStatus === 'won' ? 'הפרויקט הושלם בהצלחה!' : `שלב נוכחי בצינור העסקאות`)
    : (FALLBACK_STEPS[currentStepIndex]?.description || '');

  return (
    <div className="space-y-6">
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative px-2">
          {/* Background track */}
          <div className="absolute top-5 right-5 left-5 h-[3px] bg-white/[0.06] rounded-full" />

          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${finalProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute top-5 right-5 h-[3px] bg-gradient-to-l from-[#e8d48b] to-[#c8a951] rounded-full"
            style={{ maxWidth: 'calc(100% - 40px)' }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = usePipedrive
                ? (dealStatus === 'won' || index < currentStepIndex)
                : index < currentStepIndex;
              const isCurrent = usePipedrive
                ? (dealStatus !== 'won' && index === currentStepIndex)
                : index === currentStepIndex;
              const isPending = !isCompleted && !isCurrent;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative"
                  style={{ width: `${100 / totalSteps}%` }}
                >
                  {/* Step circle */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                    className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
                      isCurrent && 'bg-[#c8a951] text-[#070b1e] shadow-md shadow-[#c8a951]/30 ring-[3px] ring-[#c8a951]/20',
                      isPending && 'bg-white/[0.06] text-white/30 border-2 border-white/[0.08]'
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
                        className="absolute inset-0 rounded-full bg-[#c8a951]"
                        animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <p className={cn(
                    'mt-2.5 text-[10px] font-medium text-center leading-tight max-w-[70px]',
                    isCompleted && 'text-emerald-400',
                    isCurrent && 'text-[#c8a951] font-semibold',
                    isPending && 'text-white/30'
                  )}>
                    {step.label}
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
          className={cn(
            'mt-6 flex items-center gap-3 p-3.5 rounded-xl border',
            usePipedrive && dealStatus === 'won'
              ? 'bg-emerald-500/[0.06] border-emerald-500/15'
              : 'bg-[#c8a951]/[0.06] border-[#c8a951]/15'
          )}
        >
          <div className={cn(
            'p-2 rounded-lg',
            usePipedrive && dealStatus === 'won'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-[#c8a951]/10 text-[#c8a951]'
          )}>
            {usePipedrive && dealStatus === 'won' ? (
              <Check className="w-4 h-4" />
            ) : (
              currentStepIndex < steps.length ? steps[currentStepIndex].icon : <Check className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {usePipedrive && dealStatus === 'won'
                ? 'הפרויקט הושלם!'
                : `שלב נוכחי: ${currentStepLabel}`}
            </p>
            <p className="text-xs text-white/50 mt-0.5">
              {currentStepDescription}
            </p>
          </div>
          <div className={cn(
            'mr-auto text-xs font-semibold px-2.5 py-1 rounded-lg border',
            usePipedrive && dealStatus === 'won'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-[#c8a951] bg-[#c8a951]/10 border-[#c8a951]/20'
          )}>
            {usePipedrive && dealStatus === 'won'
              ? `${totalSteps}/${totalSteps}`
              : `${Math.min(currentStepIndex + 1, totalSteps)}/${totalSteps}`}
          </div>
        </motion.div>
      </div>

      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden">
        <div className="relative pr-8">
          {/* Vertical line */}
          <div className="absolute right-[11px] top-0 bottom-0 w-[2px] bg-white/[0.06] rounded-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${finalProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full bg-gradient-to-b from-emerald-500 to-[#c8a951] rounded-full"
            />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = usePipedrive
                ? (dealStatus === 'won' || index < currentStepIndex)
                : index < currentStepIndex;
              const isCurrent = usePipedrive
                ? (dealStatus !== 'won' && index === currentStepIndex)
                : index === currentStepIndex;
              const isPending = !isCompleted && !isCurrent;

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
                    isCurrent && 'bg-[#c8a951] text-[#070b1e] ring-2 ring-[#c8a951]/20',
                    isPending && 'bg-white/[0.06] border-2 border-white/[0.08] text-white/30'
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
                    isCurrent && 'bg-[#c8a951]/[0.06] -mr-1 px-3 py-2 rounded-lg border border-[#c8a951]/15'
                  )}>
                    <p className={cn(
                      'font-medium text-sm',
                      isCompleted && 'text-emerald-400',
                      isCurrent && 'text-[#c8a951]',
                      isPending && 'text-white/30'
                    )}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-white/50 mt-0.5">{currentStepDescription}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectTimeline;
