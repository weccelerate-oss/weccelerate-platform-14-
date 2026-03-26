/**
 * Stats Cards Component
 *
 * Premium dashboard metrics with visual indicators and micro-animations.
 */

'use client';

import { motion } from 'framer-motion';
import {
  Target,
  DollarSign,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, File } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface StatsCardsProps {
  project: Project & { files: File[] };
}

interface StatCard {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  progress?: number;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(amount: number | null, currency: string): string {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getProgressPercentage(raised: number | null, target: number | null): number {
  if (!raised || !target || target === 0) return 0;
  return Math.min(100, Math.round((raised / target) * 100));
}

function getStageLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'טיוטה',
    CHARACTERIZATION: 'אפיון',
    MARKET_RESEARCH: 'מחקר שוק',
    BUSINESS_MODEL: 'מודל עסקי',
    DEVELOPMENT: 'פיתוח',
    FUNDING_PREP: 'הכנה לגיוס',
    ACTIVE_FUNDING: 'גיוס פעיל',
    POST_FUNDING: 'לאחר גיוס',
    SCALING: 'סקיילינג',
    GRADUATED: 'בוגר',
    ON_HOLD: 'מושהה',
    CANCELLED: 'בוטל',
  };
  return labels[status] || status;
}

// =============================================================================
// COLOR SYSTEM
// =============================================================================

const colorConfig = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    progressBg: 'bg-blue-100',
    progressFill: 'bg-blue-500',
    ring: 'ring-blue-100',
  },
  green: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    progressBg: 'bg-emerald-100',
    progressFill: 'bg-emerald-500',
    ring: 'ring-emerald-100',
  },
  purple: {
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    progressBg: 'bg-violet-100',
    progressFill: 'bg-violet-500',
    ring: 'ring-violet-100',
  },
  orange: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    progressBg: 'bg-amber-100',
    progressFill: 'bg-amber-500',
    ring: 'ring-amber-100',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function StatsCards({ project }: StatsCardsProps) {
  const fundingRaised = project.fundingRaised ? Number(project.fundingRaised) : 0;
  const targetFunding = project.targetFunding ? Number(project.targetFunding) : 0;
  const fundingProgress = getProgressPercentage(fundingRaised, targetFunding);

  const stats: StatCard[] = [
    {
      label: 'שלב נוכחי',
      value: `${project.stage}/10`,
      subValue: getStageLabel(project.status),
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      progress: Math.min(100, (project.stage / 10) * 100),
    },
    {
      label: 'גיוס הון',
      value: formatCurrency(fundingRaised, project.fundingCurrency),
      subValue: targetFunding > 0 ? `מתוך ${formatCurrency(targetFunding, project.fundingCurrency)}` : 'יעד לא הוגדר',
      change: fundingProgress > 0 ? fundingProgress : undefined,
      changeLabel: 'מהיעד',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green',
      progress: fundingProgress,
    },
    {
      label: 'גודל הצוות',
      value: project.teamSize?.toString() || '0',
      subValue: 'אנשי צוות',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
    },
    {
      label: 'מסמכים',
      value: project.files.length.toString(),
      subValue: 'קבצים בכספת',
      icon: <FileText className="w-5 h-5" />,
      color: 'orange',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const colors = colorConfig[stat.color];

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:border-[#c8a951]/20 hover:shadow-[0_0_30px_rgba(200,169,81,0.06)] transition-all duration-300 group"
          >
            {/* Header: Icon + Trend */}
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-105',
                colors.iconBg,
                colors.iconColor
              )}>
                {stat.icon}
              </div>
              {stat.change !== undefined && (
                <div className={cn(
                  'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                  stat.change >= 50
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-amber-700 bg-amber-50'
                )}>
                  {stat.change >= 50 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span>{stat.change}%</span>
                </div>
              )}
            </div>

            {/* Value */}
            <p className="text-xl sm:text-2xl font-bold text-white mb-0.5 tracking-tight">
              {stat.value}
            </p>
            {stat.subValue && (
              <p className="text-xs text-white/50 mb-1">
                {stat.subValue}
              </p>
            )}

            {/* Progress bar */}
            {stat.progress !== undefined && stat.progress > 0 && (
              <div className="mt-3">
                <div className={cn('h-1 rounded-full overflow-hidden', colors.progressBg)}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + index * 0.06 }}
                    className={cn('h-full rounded-full', colors.progressFill)}
                  />
                </div>
              </div>
            )}

            {/* Label */}
            <p className="text-[11px] text-white/30 mt-2 font-medium uppercase tracking-wider">
              {stat.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

export default StatsCards;
