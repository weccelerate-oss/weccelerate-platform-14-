/**
 * Recent Activity Component
 * 
 * Displays a timeline of recent project activities and updates.
 * Shows actions like file uploads, status changes, notes added, etc.
 */

'use client';

import { motion } from 'framer-motion';
import {
  FileText,
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
// ACTIVITY TYPE MAPPING
// =============================================================================

const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  'project.created': {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    label: 'פרויקט נוצר',
  },
  'project.updated': {
    icon: <RefreshCw className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'פרויקט עודכן',
  },
  'project.status_changed': {
    icon: <ArrowUpRight className="w-4 h-4" />,
    color: 'text-royal-600',
    bgColor: 'bg-royal-100',
    label: 'סטטוס שונה',
  },
  'file.uploaded': {
    icon: <Upload className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'קובץ הועלה',
  },
  'note.added': {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'הערה נוספה',
  },
  'meeting.scheduled': {
    icon: <Calendar className="w-4 h-4" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'פגישה נקבעה',
  },
  'user.login': {
    icon: <User className="w-4 h-4" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'התחברות',
  },
  default: {
    icon: <Clock className="w-4 h-4" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'פעולה',
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function getActivityConfig(action: string): ActivityConfig {
  return ACTIVITY_CONFIG[action] || ACTIVITY_CONFIG.default;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
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
  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 text-sm">אין פעילות אחרונה</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.slice(0, 8).map((activity, index) => {
        const config = getActivityConfig(activity.action);
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute right-5 top-10 w-0.5 h-full bg-slate-100" />
            )}

            {/* Icon */}
            <div className={cn(
              'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              config.bgColor,
              config.color
            )}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {config.label}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {activity.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* View all link */}
      {activities.length > 8 && (
        <div className="pt-3 text-center">
          <a
            href="/portal/activity"
            className="text-sm text-royal-600 hover:text-royal-700 font-medium"
          >
            צפייה בכל הפעילות ←
          </a>
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
