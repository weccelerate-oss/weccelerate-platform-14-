/**
 * Project Timeline Component
 *
 * Shows what the entrepreneur needs to do and what they've completed,
 * based on Pipedrive deal activities (not pipeline stages).
 */

'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Circle,
  Phone,
  Calendar,
  ClipboardList,
  Mail,
  Video,
  Clock,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface ActivityStep {
  id: number;
  type: string;
  subject: string;
  done: boolean;
  dueDate: string | null;
  dueTime: string | null;
  addTime: string;
  markedDoneTime: string | null;
  location: string | null;
}

interface TimelineProps {
  dealActivities?: ActivityStep[];
  dealStatus?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const TYPE_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="w-3.5 h-3.5" />,
  meeting: <Calendar className="w-3.5 h-3.5" />,
  bd_meeting: <Calendar className="w-3.5 h-3.5" />,
  task: <ClipboardList className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  deadline: <Clock className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
};

const TYPE_LABELS: Record<string, string> = {
  call: 'שיחה',
  meeting: 'פגישה',
  bd_meeting: 'פגישה',
  task: 'משימה',
  email: 'אימייל',
  deadline: 'דדליין',
  video: 'וידאו',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProjectTimeline({ dealActivities, dealStatus }: TimelineProps) {
  const activities = dealActivities || [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden opacity-40">
          <img src="/images/portal/empty-state.png" alt="" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm text-white/50">אין פעילויות עדיין</p>
        <p className="text-xs text-white/30 mt-1">הפעילויות שלך ב-WeCcelerate יופיעו כאן</p>
      </div>
    );
  }

  // Sort: pending first (by due date), then done (by done time)
  const sorted = [...activities].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const dateA = a.dueDate || a.addTime;
    const dateB = b.dueDate || b.addTime;
    return dateA.localeCompare(dateB);
  });

  const doneCount = sorted.filter((a) => a.done).length;
  const totalCount = sorted.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress summary */}
      <div className="relative flex items-center gap-4 p-3 rounded-xl overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/portal/timeline-progress.png" alt="" className="w-full h-full object-cover opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0d1321]/90" />
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">
              {doneCount} מתוך {totalCount} פעילויות הושלמו
            </span>
            <span className="text-sm font-bold text-[#c8a951]">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-l from-[#e8d48b] to-[#c8a951] rounded-full"
            />
          </div>
        </div>
        {progressPercent === 100 && (
          <div className="p-2 bg-emerald-500/10 rounded-xl relative z-10">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Activities list */}
      <div className="relative pr-6">
        {/* Vertical line */}
        <div className="absolute right-[9px] top-2 bottom-2 w-[2px] bg-white/[0.06] rounded-full">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="w-full bg-gradient-to-b from-emerald-500 to-[#c8a951] rounded-full"
          />
        </div>

        <div className="space-y-1">
          {sorted.map((activity, index) => {
            const icon = TYPE_ICONS[activity.type] || <Circle className="w-3.5 h-3.5" />;
            const label = TYPE_LABELS[activity.type] || activity.type;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'relative flex items-start gap-3 py-2.5 px-3 rounded-xl transition-colors',
                  activity.done ? 'opacity-70' : 'hover:bg-white/[0.02]'
                )}
              >
                {/* Circle on the line */}
                <div className={cn(
                  'absolute right-0 w-[20px] h-[20px] rounded-full flex items-center justify-center -translate-x-[1px]',
                  activity.done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#0d1321] border-2 border-white/[0.15] text-white/30'
                )}>
                  {activity.done ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  ) : (
                    <Circle className="w-1.5 h-1.5 fill-current" />
                  )}
                </div>

                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  activity.done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-white/40'
                )}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[11px] font-medium px-1.5 py-0.5 rounded',
                      activity.done
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-[#c8a951]/10 text-[#c8a951]'
                    )}>
                      {label}
                    </span>
                    {activity.dueDate && (
                      <span className="text-[10px] text-white/30">
                        {formatDate(activity.dueDate)}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    'text-sm mt-0.5 leading-snug',
                    activity.done ? 'text-white/40 line-through' : 'text-white/80'
                  )}>
                    {activity.subject}
                  </p>
                </div>

                {/* Done indicator */}
                {activity.done && (
                  <div className="flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProjectTimeline;
