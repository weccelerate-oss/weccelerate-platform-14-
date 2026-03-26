/**
 * Quick Actions Component
 *
 * Prominent action cards with contextual filtering based on project stage.
 * Clean, interactive design with visual hierarchy.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Upload,
  Calendar,
  MessageSquare,
  FileText,
  Video,
  BookOpen,
  Users,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  ChevronLeft,
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
  color: string;
  iconBg: string;
  priority?: number;
  stages?: ProjectStatus[];
}

// =============================================================================
// ACTIONS
// =============================================================================

const ALL_ACTIONS: ActionItem[] = [
  {
    id: 'learning',
    label: 'מרכז הלמידה',
    description: 'קורסים להעשרה במסע היזמי',
    icon: <BookOpen className="w-4 h-4" />,
    href: '/portal/learning',
    color: 'text-royal-600',
    iconBg: 'bg-royal-50',
    priority: 1,
  },
  {
    id: 'progress',
    label: 'ציר הזמן',
    description: 'צפה בהתקדמות הפרויקט',
    icon: <TrendingUp className="w-4 h-4" />,
    href: '/portal/dashboard',
    color: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    priority: 2,
  },
  {
    id: 'documents',
    label: 'מסמכים',
    description: 'צפה במסמכים שלך',
    icon: <FileText className="w-4 h-4" />,
    href: '/portal/dashboard',
    color: 'text-blue-600',
    iconBg: 'bg-blue-50',
    priority: 3,
  },
  {
    id: 'whatsapp',
    label: 'שיחה עם הצוות',
    description: 'שלח הודעה בוואטסאפ',
    icon: <MessageSquare className="w-4 h-4" />,
    href: 'https://wa.me/972555647538',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    priority: 4,
  },
  {
    id: 'schedule',
    label: 'תיאום פגישה',
    description: 'קבע פגישה עם המנטור',
    icon: <Calendar className="w-4 h-4" />,
    href: `https://wa.me/972555647538?text=${encodeURIComponent('היי, אשמח לתאם פגישה')}`,
    color: 'text-violet-600',
    iconBg: 'bg-violet-50',
    priority: 5,
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function QuickActions({ project }: QuickActionsProps) {
  const relevantActions = ALL_ACTIONS
    .filter((action) => {
      if (!action.stages) return true;
      return action.stages.includes(project.status);
    })
    .sort((a, b) => (a.priority || 99) - (b.priority || 99))
    .slice(0, 4);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-slate-900">פעולות מהירות</h2>
        </div>
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-1">
        {relevantActions.map((action, index) => (
          <motion.a
            key={action.id}
            href={action.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.04 }}
            className="flex items-center gap-3 p-3 sm:p-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all group cursor-pointer"
          >
            {/* Icon */}
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
              action.iconBg,
              action.color
            )}>
              {action.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm">{action.label}</p>
              {action.description && (
                <p className="text-[11px] text-slate-400 truncate">{action.description}</p>
              )}
            </div>

            {/* Arrow */}
            <ChevronLeft className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all flex-shrink-0" />
          </motion.a>
        ))}
      </div>

      {/* Spacer */}
      <div className="h-2" />
    </div>
  );
}

export default QuickActions;
