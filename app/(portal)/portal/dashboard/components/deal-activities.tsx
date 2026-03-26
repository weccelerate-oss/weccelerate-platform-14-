/**
 * Deal Activities Component
 *
 * Shows Pipedrive deal activities (meetings, calls, tasks)
 * in the entrepreneur portal — so they can track real progress.
 */

'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Phone,
  Video,
  Calendar,
  Mail,
  ClipboardList,
  MapPin,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface DealActivityDisplay {
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

interface DealActivitiesProps {
  activities: DealActivityDisplay[];
}

// =============================================================================
// HELPERS
// =============================================================================

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <Phone className="w-3.5 h-3.5" />,
  meeting: <Calendar className="w-3.5 h-3.5" />,
  task: <ClipboardList className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  deadline: <Clock className="w-3.5 h-3.5" />,
  lunch: <Calendar className="w-3.5 h-3.5" />,
};

const ACTIVITY_COLORS: Record<string, { icon: string; bg: string }> = {
  call: { icon: 'text-blue-400', bg: 'bg-blue-500/10' },
  meeting: { icon: 'text-violet-400', bg: 'bg-violet-500/10' },
  task: { icon: 'text-amber-400', bg: 'bg-amber-500/10' },
  email: { icon: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  deadline: { icon: 'text-red-400', bg: 'bg-red-500/10' },
};

const ACTIVITY_LABELS: Record<string, string> = {
  call: 'שיחה',
  meeting: 'פגישה',
  task: 'משימה',
  email: 'אימייל',
  deadline: 'דדליין',
  lunch: 'ארוחה',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / 86400000);

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'מחר';
  if (diffDays === -1) return 'אתמול';
  if (diffDays < -1) return `לפני ${Math.abs(diffDays)} ימים`;
  if (diffDays < 7) return `בעוד ${diffDays} ימים`;

  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  return timeStr.slice(0, 5); // "HH:MM"
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DealActivities({ activities }: DealActivitiesProps) {
  if (!activities || activities.length === 0) return null;

  const doneCount = activities.filter((a) => a.done).length;
  const totalCount = activities.length;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-white/90">התקדמות בתהליך</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/50">
            {doneCount}/{totalCount}
          </span>
          <div className="p-1.5 bg-[#c8a951]/10 rounded-lg">
            <Activity className="w-3.5 h-3.5 text-[#c8a951]" />
          </div>
        </div>
      </div>

      {/* Activities list */}
      <div className="px-3 py-2 space-y-0.5 max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => {
          const icon = ACTIVITY_ICONS[activity.type] || <Circle className="w-3.5 h-3.5" />;
          const colors = ACTIVITY_COLORS[activity.type] || { icon: 'text-white/40', bg: 'bg-white/[0.04]' };
          const label = ACTIVITY_LABELS[activity.type] || activity.type;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className={cn(
                'flex items-start gap-3 p-2.5 rounded-xl transition-colors',
                activity.done ? 'opacity-60' : 'hover:bg-white/[0.02]'
              )}
            >
              {/* Status + Icon */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                {activity.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-white/20" />
                )}
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', colors.bg, colors.icon)}>
                  {icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded',
                    activity.done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-white/50'
                  )}>
                    {label}
                  </span>
                  {activity.dueDate && (
                    <span className={cn(
                      'text-[10px]',
                      activity.done ? 'text-white/30' : 'text-white/40'
                    )}>
                      {formatDate(activity.dueDate)}
                      {activity.dueTime && ` · ${formatTime(activity.dueTime)}`}
                    </span>
                  )}
                </div>
                <p className={cn(
                  'text-sm mt-1',
                  activity.done ? 'text-white/30 line-through' : 'text-white/80'
                )}>
                  {activity.subject}
                </p>
                {activity.location && !activity.done && (
                  <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DealActivities;
