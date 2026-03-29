/**
 * Service Timeline Component
 *
 * Shows the services the entrepreneur purchased from WeCcelerate,
 * matched from Pipedrive activities. Each service shows:
 * - Service name (from WeCcelerate's service catalog)
 * - Date completed/due
 * - Status (done / in progress)
 * - File upload area for completed services
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Circle,
  Clock,
  Upload,
  FileText,
  TrendingUp,
  Presentation,
  Megaphone,
  LayoutGrid,
  Globe,
  Compass,
  Users,
  ClipboardList,
  FileCheck,
  Search,
  X,
  FolderOpen,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchedService } from '@/lib/service-matcher';

// =============================================================================
// TYPES
// =============================================================================

interface ServiceTimelineProps {
  services: MatchedService[];
  projectId?: string;
}

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Presentation: <Presentation className="w-5 h-5" />,
  Megaphone: <Megaphone className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  ClipboardList: <ClipboardList className="w-5 h-5" />,
  FileCheck: <FileCheck className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ServiceTimeline({ services, projectId }: ServiceTimelineProps) {
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{ serviceId: string; type: 'success' | 'error'; text: string } | null>(null);

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
          <Clock className="w-7 h-7 text-white/20" />
        </div>
        <h3 className="text-sm font-semibold text-white/70 mb-1">אין שירותים עדיין</h3>
        <p className="text-xs text-white/40">השירותים שרכשת מ-WeCcelerate יופיעו כאן</p>
      </div>
    );
  }

  const doneCount = services.filter((s) => s.allDone).length;
  const totalCount = services.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleFileUpload = async (serviceId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadMessage({ serviceId, type: 'error', text: 'הקובץ גדול מדי (מקסימום 4MB)' });
      return;
    }

    setUploadingFor(serviceId);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', projectId);

      const response = await fetch('/api/portal/upload', { method: 'POST', body: formData });
      if (response.status === 413) throw new Error('הקובץ גדול מדי');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'העלאה נכשלה');

      setUploadMessage({ serviceId, type: 'success', text: `"${file.name}" הועלה בהצלחה` });
      setTimeout(() => setUploadMessage(null), 3000);
    } catch (err) {
      setUploadMessage({ serviceId, type: 'error', text: err instanceof Error ? err.message : 'העלאה נכשלה' });
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">
              {doneCount} מתוך {totalCount} שירותים הושלמו
            </span>
            <span className="text-sm font-bold text-[#c8a951]">{progressPercent}%</span>
          </div>
          <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-l from-[#e8d48b] to-[#c8a951] rounded-full"
            />
          </div>
        </div>
        {progressPercent === 100 && (
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Service cards */}
      <div className="space-y-3">
        {services.map((service, index) => {
          const icon = ICON_MAP[service.icon] || <FileText className="w-5 h-5" />;
          const isUploading = uploadingFor === service.id;
          const msg = uploadMessage?.serviceId === service.id ? uploadMessage : null;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'rounded-2xl border transition-all overflow-hidden',
                service.allDone
                  ? 'bg-emerald-500/[0.04] border-emerald-500/15'
                  : 'bg-white/[0.02] border-white/[0.08] hover:border-[#c8a951]/20'
              )}
            >
              {/* Service header */}
              <div className="flex items-center gap-4 p-4 sm:p-5">
                {/* Status circle */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  service.allDone
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-[#c8a951]/10 text-[#c8a951]'
                )}>
                  {service.allDone ? <Check className="w-6 h-6" strokeWidth={2.5} /> : icon}
                </div>

                {/* Service info */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    'text-base font-semibold',
                    service.allDone ? 'text-emerald-400' : 'text-white'
                  )}>
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {service.completedDate && (
                      <span className="text-xs text-white/40">
                        {formatDate(service.completedDate)}
                      </span>
                    )}
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      service.allDone
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-[#c8a951]/10 text-[#c8a951] border border-[#c8a951]/20'
                    )}>
                      {service.allDone ? 'הושלם ✓' : 'בתהליך'}
                    </span>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                  <span className={cn(
                    'text-lg font-bold',
                    service.allDone ? 'text-emerald-400' : 'text-[#c8a951]'
                  )}>
                    {service.completedActivities}/{service.totalActivities}
                  </span>
                  <span className="text-[10px] text-white/30">פעולות</span>
                </div>
              </div>

              {/* Upload area for completed services */}
              {service.allDone && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  {/* Upload message */}
                  {msg && (
                    <div className={cn(
                      'p-2.5 rounded-lg text-xs mb-3',
                      msg.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    )}>
                      {msg.text}
                    </div>
                  )}

                  {/* Upload button */}
                  <label className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border border-dashed cursor-pointer transition-all',
                    isUploading
                      ? 'border-white/[0.06] bg-white/[0.02]'
                      : 'border-white/[0.1] hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.03]'
                  )}>
                    {isUploading ? (
                      <div className="w-8 h-8 border-2 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Upload className="w-4 h-4 text-white/40" />
                      </div>
                    )}
                    <div className="flex-1">
                      <span className="text-sm text-white/60 font-medium">
                        {isUploading ? 'מעלה...' : 'העלה קובץ לשירות זה'}
                      </span>
                      <span className="block text-[10px] text-white/30">PDF, Word, Excel, תמונה (עד 4MB)</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      disabled={isUploading}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => handleFileUpload(service.id, e)}
                    />
                  </label>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ServiceTimeline;
