/**
 * Stats Cards Component
 * 
 * Displays key project metrics in a dashboard grid.
 */

'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
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
    },
    {
      label: 'גיוס הון',
      value: formatCurrency(fundingRaised, project.fundingCurrency),
      subValue: `מתוך ${formatCurrency(targetFunding, project.fundingCurrency)}`,
      change: fundingProgress,
      changeLabel: 'מהיעד',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green',
    },
    {
      label: 'גודל הצוות',
      value: project.teamSize?.toString() || '-',
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

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-600',
      text: 'text-emerald-600',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-600',
    },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              'p-2 rounded-xl',
              colorClasses[stat.color].icon
            )}>
              {stat.icon}
            </div>
            {stat.change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                stat.change >= 50 ? 'text-emerald-600' : 'text-amber-600'
              )}>
                {stat.change >= 50 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{stat.change}%</span>
                {stat.changeLabel && (
                  <span className="text-slate-400 font-normal">{stat.changeLabel}</span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">
              {stat.value}
            </p>
            {stat.subValue && (
              <p className="text-sm text-slate-500">
                {stat.subValue}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-3">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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

export default StatsCards;
