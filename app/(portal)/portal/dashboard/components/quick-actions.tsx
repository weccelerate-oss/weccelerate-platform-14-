/**
 * Quick Actions Component
 * 
 * Card with quick action buttons for common portal tasks.
 * Contextual actions based on project status.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Upload,
  Calendar,
  MessageSquare,
  FileText,
  Video,
  ExternalLink,
  Sparkles,
  Users,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, ProjectStatus } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface QuickActionsProps {
  project: Project;
}

interface ActionItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color: string;
  bgColor: string;
  priority?: number;
  stages?: ProjectStatus[]; // Only show for these stages
}

// =============================================================================
// ACTION DEFINITIONS
// =============================================================================

const ALL_ACTIONS: ActionItem[] = [
  {
    id: 'upload',
    label: 'העלאת מסמך',
    description: 'הוסף מסמך חדש לפרויקט',
    icon: <Upload className="w-5 h-5" />,
    href: '/portal/documents/upload',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    priority: 1,
  },
  {
    id: 'schedule',
    label: 'תיאום פגישה',
    description: 'קבע פגישה עם המנטור שלך',
    icon: <Calendar className="w-5 h-5" />,
    href: '/portal/calendar/schedule',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    priority: 2,
  },
  {
    id: 'message',
    label: 'שליחת הודעה',
    description: 'צור קשר עם הצוות',
    icon: <MessageSquare className="w-5 h-5" />,
    href: '/portal/messages/new',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    priority: 3,
  },
  {
    id: 'business-plan',
    label: 'תבנית תוכנית עסקית',
    description: 'התחל לבנות את התוכנית',
    icon: <FileText className="w-5 h-5" />,
    href: '/portal/templates/business-plan',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    priority: 4,
    stages: ['CHARACTERIZATION', 'MARKET_RESEARCH', 'BUSINESS_MODEL'],
  },
  {
    id: 'pitch-deck',
    label: 'מצגת משקיעים',
    description: 'הכן את הפיץ׳ שלך',
    icon: <Video className="w-5 h-5" />,
    href: '/portal/templates/pitch-deck',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    priority: 5,
    stages: ['FUNDING_PREP', 'ACTIVE_FUNDING'],
  },
  {
    id: 'learning',
    label: 'מרכז הלמידה',
    description: 'קורסים וחומרי לימוד',
    icon: <BookOpen className="w-5 h-5" />,
    href: '/portal/learning',
    color: 'text-royal-600',
    bgColor: 'bg-royal-50 hover:bg-royal-100',
    priority: 6,
  },
  {
    id: 'investors',
    label: 'רשימת משקיעים',
    description: 'גש לרשימת המשקיעים',
    icon: <Users className="w-5 h-5" />,
    href: '/portal/investors',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100',
    priority: 7,
    stages: ['FUNDING_PREP', 'ACTIVE_FUNDING', 'POST_FUNDING'],
  },
  {
    id: 'progress',
    label: 'דיווח התקדמות',
    description: 'עדכן את הסטטוס שלך',
    icon: <TrendingUp className="w-5 h-5" />,
    href: '/portal/progress/update',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    priority: 8,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickActions({ project }: QuickActionsProps) {
  // Filter actions based on project status
  const relevantActions = ALL_ACTIONS
    .filter((action) => {
      if (!action.stages) return true;
      return action.stages.includes(project.status);
    })
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
    .slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">פעולות מהירות</h2>
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Actions grid */}
      <div className="p-4 space-y-2">
        {relevantActions.map((action, index) => (
          <motion.a
            key={action.id}
            href={action.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-all',
              action.bgColor,
              'group'
            )}
          >
            {/* Icon */}
            <div className={cn(
              'p-2 rounded-lg bg-white shadow-sm',
              action.color
            )}>
              {action.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm">
                {action.label}
              </p>
              {action.description && (
                <p className="text-xs text-slate-500 line-clamp-1">
                  {action.description}
                </p>
              )}
            </div>

            {/* Arrow */}
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
          </motion.a>
        ))}
      </div>

      {/* View all */}
      <div className="px-4 pb-4">
        <a
          href="/portal/actions"
          className="flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span>כל הפעולות</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default QuickActions;
