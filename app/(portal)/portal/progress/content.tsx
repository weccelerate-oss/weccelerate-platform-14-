/**
 * Progress Page Content
 *
 * Full progress view with timeline and activities from Pipedrive.
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { ProjectTimeline } from '../dashboard/components/project-timeline';
import { DealActivities } from '../dashboard/components/deal-activities';
import type { DealActivityDisplay } from '../dashboard/components/deal-activities';

interface Props {
  projectName?: string;
  hasProject: boolean;
  dealActivities: DealActivityDisplay[];
  dealStatus?: string;
}

export function ProgressPageContent({
  projectName,
  hasProject,
  dealActivities,
  dealStatus,
}: Props) {
  return (
    <>
      {/* Header */}
      <div className="bg-[#0a0e27]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <a
            href="/portal/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/70 mb-4 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה ללוח הבקרה
          </a>
          <h1 className="text-2xl font-bold text-white">התקדמות</h1>
          {projectName && (
            <p className="text-sm text-white/50 mt-1">{projectName}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {!hasProject ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-12 text-center"
          >
            <TrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">אין נתוני התקדמות</h2>
            <p className="text-white/50 text-sm mb-6">לא נמצא פרויקט פעיל עם נתוני התקדמות.</p>
            <a href="/portal/dashboard" className="text-[#c8a951] hover:underline text-sm">
              חזרה ללוח הבקרה
            </a>
          </motion.div>
        ) : (
          <>
            {/* Timeline from Activities */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-[15px] font-semibold text-white/90">מה עשינו ומה נשאר</h2>
              </div>
              <div className="p-5">
                <ProjectTimeline
                  dealActivities={dealActivities}
                  dealStatus={dealStatus}
                />
              </div>
            </motion.div>

            {/* Activities Detail */}
            {dealActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DealActivities activities={dealActivities} />
              </motion.div>
            )}

            {/* Summary Stats */}
            {dealActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-3 gap-4"
              >
                <StatCard
                  label="סה״כ פעילויות"
                  value={dealActivities.length}
                  color="white"
                />
                <StatCard
                  label="הושלמו"
                  value={dealActivities.filter(a => a.done).length}
                  color="emerald"
                />
                <StatCard
                  label="ממתינות"
                  value={dealActivities.filter(a => !a.done).length}
                  color="amber"
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white/80 bg-white/[0.03] border-white/[0.08]',
    emerald: 'text-emerald-400 bg-emerald-500/[0.06] border-emerald-500/15',
    amber: 'text-[#c8a951] bg-[#c8a951]/[0.06] border-[#c8a951]/15',
  };

  return (
    <div className={`rounded-2xl border backdrop-blur-md p-4 text-center ${colorMap[color] || colorMap.white}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}
