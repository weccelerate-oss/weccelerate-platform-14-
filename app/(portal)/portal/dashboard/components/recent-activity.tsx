/**
 * Recent Activity Component
 *
 * Clean activity timeline with color-coded entries and relative timestamps.
 * Dark premium theme.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Upload,
  MessageSquare,
  RefreshCw,
  User,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityLog } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface RecentActivityProps {
  activities: ActivityLog[];
}

interface ActivityConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}

// =============================================================================
// CONFIG
// =============================================================================

const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  'project.created': {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    label: 'פרויקט נוצר',
  },
  'project.updated': {
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    label: 'פרויקט עודכן',
  },
  'project.status_changed': {
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    color: 'text-[#c8a951]',
    bgColor: 'bg-[#c8a951]/10',
    label: 'סטטוס שונה',
  },
  'file.uploaded': {
    icon: <Upload className="w-3.5 h-3.5" />,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    label: 'קובץ הועלה',
  },
  'note.added': {
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    label: 'הערה נוספה',
  },
  'meeting.scheduled': {
    icon: <Calendar className="w-3.5 h-3.5" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    label: 'פגישה נקבעה',
  },
  'user.login': {
    icon: <User className="w-3.5 h-3.5" />,
    color: 'text-white/40',
    bgColor: 'bg-white/[0.04]',
    label: 'התחברות',
  },
  default: {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-white/40',
    bgColor: 'bg-white/[0.04]',
    label: 'פעולה',
  },
};

function getConfig(action: string): ActivityConfig {
  return ACTIVITY_CONFIG[action] || ACTIVITY_CONFIG.default;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דק׳`;
  if (diffHours < 24) return `לפני ${diffHours} שע׳`;
  if (diffDays === 1) return 'אתמול';
  if (diffDays < 7) return `לפני ${diffDays} ימים`;

  return new Date(date).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden opacity-40">
          <img src="/images/portal/empty-state.png" alt="" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm text-white/50">אין פעילות אחרונה</p>
        <p className="text-xs text-white/30 mt-1">הפעילות שלך תופיע כאן</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0.5">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none opacity-[0.04]">
        <img src="/images/portal/activity-icons.png" alt="" className="w-full h-full object-contain" />
      </div>
      {activities.slice(0, 6).map((activity, index) => {
        const config = getConfig(activity.action);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.04 }}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
          >
            {/* Icon */}
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
              config.bgColor,
              config.color
            )}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 leading-snug">
                <span className="font-medium text-white/90">{config.label}</span>
              </p>
              {activity.description && (
                <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">
                  {activity.description}
                </p>
              )}
            </div>

            {/* Time */}
            <span className="text-[10px] text-white/30 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium">
              {formatRelativeTime(activity.createdAt)}
            </span>
          </motion.div>
        );
      })}

      {/* View all */}
      {activities.length > 6 && (
        <div className="pt-2 text-center">
          <span className="text-xs text-white/30 font-medium">
            מציג 6 אחרונות
          </span>
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
