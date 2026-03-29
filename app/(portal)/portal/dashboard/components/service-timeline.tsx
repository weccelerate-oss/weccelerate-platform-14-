/**
 * Service Journey — Interactive Roadmap
 *
 * Displays purchased WeCcelerate services as an interactive startup journey map.
 * Nodes connected by a winding path, with file management per service.
 *
 * - Entrepreneur: view/download files
 * - Admin: upload files to each service node
 */

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  Upload,
  Download,
  FileText,
  TrendingUp,
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
  ChevronDown,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchedService } from '@/lib/service-matcher';

// =============================================================================
// TYPES
// =============================================================================

interface ServiceTimelineProps {
  services: MatchedService[];
  projectId?: string;
  isAdmin?: boolean;
}

interface PortalFile {
  name: string;
  url: string;
  size: string;
  type: string;
}

// =============================================================================
// ICON MAP
// =============================================================================

const ICON_MAP: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Presentation: <FileText className="w-5 h-5" />,
  Megaphone: <Megaphone className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  ClipboardList: <ClipboardList className="w-5 h-5" />,
  FileCheck: <FileCheck className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
};

// Service images from portal folder
const SERVICE_IMAGES: Record<string, string> = {
  'financial-plan': '/images/portal/course-financial.png',
  'pitch-deck': '/images/portal/course-investments.png',
  'marketing-plan': '/images/portal/course-business.png',
  'canvas-model': '/images/portal/course-business.png',
  'landing-page': '/images/portal/project-hero.png',
  'strategic-consulting': '/images/portal/timeline-progress.png',
  'investor-prep': '/images/portal/course-investments.png',
  'business-plan': '/images/portal/course-business.png',
  'market-research': '/images/portal/course-financial.png',
  'brief': '/images/portal/empty-state.png',
  'one-pager': '/images/portal/course-business.png',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

// =============================================================================
// SVG PATH CONNECTOR
// =============================================================================

function PathConnector({ isCompleted, index }: { isCompleted: boolean; index: number }) {
  return (
    <div className="flex justify-center py-1">
      <svg width="40" height="36" viewBox="0 0 40 36" className="overflow-visible">
        <motion.path
          d={index % 2 === 0
            ? "M20 0 C20 12, 8 18, 20 36"
            : "M20 0 C20 12, 32 18, 20 36"
          }
          fill="none"
          strokeWidth="2"
          strokeDasharray={isCompleted ? "0" : "4 4"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.08 }}
          className={isCompleted ? 'stroke-emerald-500' : 'stroke-white/10'}
        />
        {/* Animated glow dot on path */}
        {!isCompleted && (
          <motion.circle
            r="2"
            fill="#c8a951"
            animate={{
              offsetDistance: ['0%', '100%'],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={index % 2 === 0
                ? "M20 0 C20 12, 8 18, 20 36"
                : "M20 0 C20 12, 32 18, 20 36"
              }
            />
          </motion.circle>
        )}
      </svg>
    </div>
  );
}

// =============================================================================
// SERVICE NODE
// =============================================================================

function ServiceNode({
  service,
  index,
  isAdmin,
  projectId,
  isLast,
}: {
  service: MatchedService;
  index: number;
  isAdmin: boolean;
  projectId?: string;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const icon = ICON_MAP[service.icon] || <FileText className="w-5 h-5" />;
  const bgImage = SERVICE_IMAGES[service.id];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setUploadMsg({ type: 'error', text: 'הקובץ גדול מדי (מקסימום 4MB)' });
      return;
    }
    setUploadingFor(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', projectId);
      const res = await fetch('/api/portal/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      setUploadMsg({ type: 'success', text: `"${file.name}" הועלה` });
      setTimeout(() => setUploadMsg(null), 3000);
    } catch {
      setUploadMsg({ type: 'error', text: 'העלאה נכשלה' });
    } finally {
      setUploadingFor(false);
    }
  };

  // Alternate layout direction for winding path feel
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div
        className={cn(
          'relative group cursor-pointer',
          'flex gap-4 items-start',
          isEven ? 'flex-row' : 'flex-row-reverse',
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Node circle */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden',
              service.allDone
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.1] group-hover:border-[#c8a951]/30'
            )}
          >
            {/* Background image hint */}
            {bgImage && (
              <div className="absolute inset-0 opacity-20">
                <img src={bgImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="relative z-10">
              {service.allDone ? <Check className="w-7 h-7" strokeWidth={2.5} /> : icon}
            </div>
          </div>
          {/* Step number */}
          <div className={cn(
            'absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center',
            service.allDone
              ? 'bg-emerald-600 text-white'
              : 'bg-[#c8a951] text-[#070b1e]'
          )}>
            {index + 1}
          </div>
        </div>

        {/* Content card */}
        <div
          className={cn(
            'flex-1 rounded-2xl border transition-all duration-300 overflow-hidden',
            service.allDone
              ? 'bg-emerald-500/[0.04] border-emerald-500/15 hover:border-emerald-500/25'
              : 'bg-white/[0.02] border-white/[0.06] hover:border-[#c8a951]/20 hover:bg-white/[0.03]'
          )}
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className={cn(
                  'text-base sm:text-lg font-bold',
                  service.allDone ? 'text-emerald-400' : 'text-white'
                )}>
                  {service.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {service.completedDate && (
                    <span className="text-xs text-white/40">{formatDate(service.completedDate)}</span>
                  )}
                  <span className={cn(
                    'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                    service.allDone
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-[#c8a951]/10 text-[#c8a951] border border-[#c8a951]/20'
                  )}>
                    {service.allDone ? <><Check className="w-3 h-3" /> הושלם</> : <><Clock className="w-3 h-3" /> בתהליך</>}
                  </span>
                </div>
              </div>

              {/* Expand indicator */}
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                className="mt-1"
              >
                <ChevronDown className="w-5 h-5 text-white/30" />
              </motion.div>
            </div>

            {/* Mini progress */}
            <div className="mt-3">
              <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(service.completedActivities / service.totalActivities) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={cn(
                    'h-full rounded-full',
                    service.allDone ? 'bg-emerald-500' : 'bg-[#c8a951]'
                  )}
                />
              </div>
              <p className="text-[10px] text-white/30 mt-1">
                {service.completedActivities}/{service.totalActivities} פעולות
              </p>
            </div>
          </div>

          {/* Expanded: Files section */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/[0.04] pt-4">
                  {/* Google Drive sync badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[11px] text-white/30">מסונכרן עם תיקיית Portal</span>
                  </div>

                  {/* Upload message */}
                  {uploadMsg && (
                    <div className={cn(
                      'p-2.5 rounded-lg text-xs mb-3',
                      uploadMsg.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    )}>
                      {uploadMsg.text}
                    </div>
                  )}

                  {service.allDone ? (
                    <>
                      {/* Admin: Upload area */}
                      {isAdmin && (
                        <label className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border border-dashed cursor-pointer transition-all mb-3',
                          uploadingFor
                            ? 'border-[#c8a951]/20 bg-[#c8a951]/[0.02]'
                            : 'border-white/[0.1] hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.03]'
                        )}>
                          {uploadingFor ? (
                            <div className="w-8 h-8 border-2 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#c8a951]/10 flex items-center justify-center">
                              <Upload className="w-4 h-4 text-[#c8a951]" />
                            </div>
                          )}
                          <div>
                            <span className="text-sm text-white/70 font-medium block">
                              {uploadingFor ? 'מעלה...' : 'העלה קובץ לשירות זה'}
                            </span>
                            <span className="text-[10px] text-white/30">PDF, Word, Excel, תמונה (עד 4MB)</span>
                          </div>
                          <input type="file" className="hidden" disabled={uploadingFor}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                            onChange={handleUpload}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                      )}

                      {/* Entrepreneur: View files placeholder */}
                      {!isAdmin && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#c8a951]/15 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/70 font-medium">קבצי {service.name}</p>
                              <p className="text-[10px] text-white/30">קבצים שהועלו על ידי הצוות</p>
                            </div>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 text-xs font-medium text-[#c8a951] bg-[#c8a951]/10 rounded-lg border border-[#c8a951]/20 hover:bg-[#c8a951]/15 transition-colors"
                            >
                              צפה בקבצים
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <Clock className="w-5 h-5 text-white/20 mx-auto mb-1.5" />
                      <p className="text-xs text-white/30">השירות בתהליך - הקבצים יהיו זמינים לאחר השלמתו</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Path connector to next node */}
      {!isLast && <PathConnector isCompleted={service.allDone} index={index} />}
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ServiceTimeline({ services, projectId, isAdmin = false }: ServiceTimelineProps) {
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

  return (
    <div className="space-y-6">
      {/* Journey header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0d1321] to-[#070b1e] p-5 sm:p-6 border border-white/[0.06]">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#c8a951]/[0.04] rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/[0.04] rounded-full blur-[60px]" />
          <img src="/images/portal/dashboard-hero.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">המסע היזמי שלך</h3>
              <p className="text-sm text-white/40 mt-0.5">
                {doneCount === totalCount
                  ? 'כל השירותים הושלמו בהצלחה!'
                  : `${doneCount} מתוך ${totalCount} שירותים הושלמו`}
              </p>
            </div>
            {progressPercent === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
              >
                <Trophy className="w-6 h-6 text-emerald-400" />
              </motion.div>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-l from-emerald-400 to-[#c8a951] rounded-full relative"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" style={{ animationDuration: '2s' }} />
              </motion.div>
            </div>
            <span className="text-lg font-bold text-[#c8a951] min-w-[48px] text-left">{progressPercent}%</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1.5 mt-4">
            {services.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all',
                  s.allDone ? 'bg-emerald-500' : 'bg-white/[0.08]'
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Journey path — service nodes */}
      <div className="px-2 sm:px-4">
        {services.map((service, index) => (
          <ServiceNode
            key={service.id}
            service={service}
            index={index}
            isAdmin={isAdmin}
            projectId={projectId}
            isLast={index === services.length - 1}
          />
        ))}
      </div>

      {/* Journey completion */}
      {progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-sm font-semibold">
            <Trophy className="w-4 h-4" />
            כל הכבוד! השלמת את כל השירותים
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ServiceTimeline;
