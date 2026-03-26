/**
 * Recent Activity Component
 *
 * Clean activity timeline with color-coded entries and relative timestamps.
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
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    label: 'פרויקט נוצר',
  },
  'project.updated': {
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'פרויקט עודכן',
  },
  'project.status_changed': {
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    color: 'text-royal-600',
    bgColor: 'bg-royal-50',
    label: 'סטטוס שונה',
  },
  'file.uploaded': {
    icon: <Upload className="w-3.5 h-3.5" />,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    label: 'קובץ הועלה',
  },
  'note.added': {
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'הערה נוספה',
  },
  'meeting.scheduled': {
    icon: <Calendar className="w-3.5 h-3.5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    label: 'פגישה נקבעה',
  },
  'user.login': {
    icon: <User className="w-3.5 h-3.5" />,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
    label: 'התחברות',
  },
  default: {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
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
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-50 flex items-center justify-center">
          <Clock className="w-5 h-5 text-slate-300" />
        </div>
        <p className="text-sm text-slate-500">אין פעילות אחרונה</p>
        <p className="text-xs text-slate-400 mt-1">הפעילות שלך תופיע כאן</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {activities.slice(0, 6).map((activity, index) => {
        const config = getConfig(activity.action);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.04 }}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition-colors group"
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
              <p className="text-sm text-slate-800 leading-snug">
                <span className="font-medium">{config.label}</span>
              </p>
              {activity.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {activity.description}
                </p>
              )}
            </div>

            {/* Time */}
            <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium">
              {formatRelativeTime(activity.createdAt)}
            </span>
          </motion.div>
        );
      })}

      {/* View all */}
      {activities.length > 6 && (
        <div className="pt-2 text-center">
          <span className="text-xs text-slate-400 font-medium">
            מציג 6 אחרונות
          </span>
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
