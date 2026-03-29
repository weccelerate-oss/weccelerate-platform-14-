/**
 * Startup Journey Maze — Interactive Service Roadmap
 *
 * An immersive, gamified journey map showing WeCcelerate services.
 * Each service is a "station" along a winding maze path.
 *
 * Role-based:
 * - Entrepreneur: view/download files from Portal
 * - Admin: upload deliverables to entrepreneur's Portal
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  Upload,
  Download,
  Eye,
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
  ChevronDown,
  Trophy,
  HardDrive,
  Zap,
  MapPin,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchedService } from '@/lib/service-matcher';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectFile {
  id: string;
  name: string;
  displayName: string | null;
  url: string;
  size: number | null;
  mimeType: string | null;
}

interface ServiceTimelineProps {
  services: MatchedService[];
  projectId?: string;
  isAdmin?: boolean;
  files?: ProjectFile[];
}

// =============================================================================
// CONSTANTS
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

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

const FILE_ICONS: Record<string, string> = {
  pdf: 'text-red-400',
  pptx: 'text-orange-400',
  xlsx: 'text-emerald-400',
  docx: 'text-blue-400',
};

// =============================================================================
// MAZE PATH SVG
// =============================================================================

function MazePath({ completed, index, total }: { completed: boolean; index: number; total: number }) {
  const isEven = index % 2 === 0;

  return (
    <div className="relative h-12 flex items-center justify-center overflow-visible">
      <svg width="200" height="48" viewBox="0 0 200 48" className="overflow-visible">
        {/* Maze corridor walls */}
        <motion.path
          d={isEven
            ? "M100 0 C100 10, 60 14, 60 24 C60 34, 100 38, 100 48"
            : "M100 0 C100 10, 140 14, 140 24 C140 34, 100 38, 100 48"
          }
          fill="none"
          strokeWidth="16"
          className="stroke-white/[0.02]"
        />
        {/* Inner path */}
        <motion.path
          d={isEven
            ? "M100 0 C100 10, 60 14, 60 24 C60 34, 100 38, 100 48"
            : "M100 0 C100 10, 140 14, 140 24 C140 34, 100 38, 100 48"
          }
          fill="none"
          strokeWidth="2"
          strokeDasharray={completed ? "0" : "6 4"}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className={completed ? 'stroke-emerald-500/60' : 'stroke-white/[0.08]'}
        />
        {/* Glow for completed */}
        {completed && (
          <motion.path
            d={isEven
              ? "M100 0 C100 10, 60 14, 60 24 C60 34, 100 38, 100 48"
              : "M100 0 C100 10, 140 14, 140 24 C140 34, 100 38, 100 48"
            }
            fill="none"
            strokeWidth="6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="stroke-emerald-400"
            filter="url(#glow)"
          />
        )}
        {/* Traveling particle for in-progress */}
        {!completed && (
          <circle r="3" fill="#c8a951" opacity="0.8">
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={isEven
                ? "M100 0 C100 10, 60 14, 60 24 C60 34, 100 38, 100 48"
                : "M100 0 C100 10, 140 14, 140 24 C140 34, 100 38, 100 48"
              }
            />
          </circle>
        )}
        {/* Glow filter definition */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

// =============================================================================
// STATION NODE
// =============================================================================

function StationNode({
  service,
  index,
  isAdmin,
  projectId,
  totalStations,
  files: allFiles,
}: {
  service: MatchedService;
  index: number;
  isAdmin: boolean;
  projectId?: string;
  totalStations: number;
  files: ProjectFile[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const icon = ICON_MAP[service.icon] || <FileText className="w-5 h-5" />;
  // Match files to this service by name keywords
  const serviceFiles = allFiles.filter((f) => {
    const fileName = (f.displayName || f.name).toLowerCase();
    const serviceName = service.name.toLowerCase();
    const words = serviceName.split(' ').filter(w => w.length > 2);
    return words.some(w => fileName.includes(w));
  });
  const isEven = index % 2 === 0;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setUploadMsg({ type: 'error', text: 'גדול מדי (מקס 4MB)' }); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (projectId) fd.append('projectId', projectId);
      const res = await fetch('/api/portal/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      setUploadMsg({ type: 'success', text: `"${file.name}" הועלה` });
      setTimeout(() => setUploadMsg(null), 3000);
    } catch { setUploadMsg({ type: 'error', text: 'העלאה נכשלה' }); }
    finally { setUploading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn('relative', isEven ? 'sm:pr-8' : 'sm:pl-8')}
    >
      {/* Station card */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative rounded-2xl border cursor-pointer transition-all duration-500 overflow-hidden group',
          service.allDone
            ? 'border-emerald-500/20 hover:border-emerald-500/40'
            : 'border-white/[0.06] hover:border-[#c8a951]/25',
          // Perspective depth effect
          isEven ? 'sm:mr-12 lg:mr-20' : 'sm:ml-12 lg:ml-20',
        )}
      >
        {/* Ambient glow background */}
        <div className={cn(
          'absolute inset-0 transition-opacity duration-500',
          service.allDone ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          <div className={cn(
            'absolute inset-0',
            service.allDone
              ? 'bg-gradient-to-br from-emerald-500/[0.06] to-transparent'
              : 'bg-gradient-to-br from-[#c8a951]/[0.04] to-transparent'
          )} />
        </div>

        {/* Inner content */}
        <div className="relative z-10 p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Station icon with ring */}
            <div className="relative flex-shrink-0">
              {/* Outer ring */}
              <div className={cn(
                'absolute -inset-1.5 rounded-2xl transition-all duration-500',
                service.allDone
                  ? 'bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-white/[0.02]'
              )} />
              <div className={cn(
                'relative w-14 h-14 rounded-xl flex items-center justify-center transition-all',
                service.allDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/[0.05] text-white/50'
              )}>
                {service.allDone ? <Check className="w-6 h-6" strokeWidth={2.5} /> : icon}
              </div>
              {/* Step badge */}
              <div className={cn(
                'absolute -top-3 -right-3 w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center shadow-lg',
                service.allDone ? 'bg-emerald-600 text-white' : 'bg-[#c8a951] text-[#070b1e]'
              )}>
                {index + 1}
              </div>
            </div>

            {/* Station info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={cn(
                    'text-base sm:text-lg font-bold leading-tight',
                    service.allDone ? 'text-emerald-400' : 'text-white'
                  )}>
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {service.completedDate && (
                      <span className="text-xs text-white/35">{formatDate(service.completedDate)}</span>
                    )}
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
                      service.allDone
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-[#c8a951]/10 text-[#c8a951] border border-[#c8a951]/20'
                    )}>
                      {service.allDone ? <><Check className="w-3 h-3" /> הושלם</> : <><Clock className="w-3 h-3" /> בתהליך</>}
                    </span>
                  </div>
                </div>

                {/* Expand */}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="mt-1 flex-shrink-0">
                  <ChevronDown className="w-5 h-5 text-white/25 group-hover:text-white/40 transition-colors" />
                </motion.div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(service.completedActivities / service.totalActivities) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={cn('h-full rounded-full', service.allDone ? 'bg-emerald-500' : 'bg-[#c8a951]')}
                  />
                </div>
                <p className="text-[10px] text-white/25 mt-1">{service.completedActivities}/{service.totalActivities} פעולות</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded: Control Panel Interior */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="relative px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-white/[0.04]">
                {/* Status badge */}
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-3.5 h-3.5 text-white/25" />
                  <span className="text-[11px] text-white/25">
                    {isAdmin ? 'ניהול קבצי Portal' : 'מחובר ל-Portal Drive — צפייה בלבד'}
                  </span>
                  {!isAdmin && (
                    <Shield className="w-3 h-3 text-white/20" />
                  )}
                </div>

                {uploadMsg && (
                  <div className={cn(
                    'p-2.5 rounded-lg text-xs mb-3',
                    uploadMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  )}>
                    {uploadMsg.text}
                  </div>
                )}

                {service.allDone ? (
                  <div className="space-y-2">
                    {/* File list from project */}
                    {serviceFiles.map((file) => {
                      const ext = getFileExt(file.name);
                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.04]',
                            FILE_ICONS[ext] || 'text-white/40'
                          )}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/75 font-medium truncate">{file.displayName || file.name}</p>
                            <p className="text-[10px] text-white/25">{formatFileSize(file.size)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/40 hover:text-white/70"
                              title="צפה אונליין"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={file.url}
                              download={file.name}
                              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/40 hover:text-white/70"
                              title="הורד"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    {serviceFiles.length === 0 && (
                      <div className="text-center py-4">
                        <FileText className="w-5 h-5 text-white/15 mx-auto mb-1.5" />
                        <p className="text-xs text-white/25">עדיין לא הועלו קבצים לשירות זה</p>
                      </div>
                    )}

                    {/* Admin upload gate */}
                    {isAdmin && (
                      <label
                        className={cn(
                          'flex items-center gap-3 p-3.5 rounded-xl border border-dashed cursor-pointer transition-all mt-2',
                          uploading ? 'border-[#c8a951]/20' : 'border-white/[0.08] hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.02]'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {uploading ? (
                          <div className="w-8 h-8 border-2 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#c8a951]/10 flex items-center justify-center">
                            <Upload className="w-4 h-4 text-[#c8a951]" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-white/60 font-medium">העלה קובץ סופי ל-Portal של היזם</p>
                          <p className="text-[10px] text-white/25">PDF, Word, Excel, תמונה (עד 4MB)</p>
                        </div>
                        <input type="file" className="hidden" disabled={uploading}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                          onChange={handleUpload}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-5 h-5 text-white/15 mx-auto mb-1.5" />
                    <p className="text-xs text-white/25">השירות בתהליך — הקבצים יהיו זמינים לאחר השלמתו</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// =============================================================================
// COMPASS TRACKER
// =============================================================================

function CompassTracker({ current, total, percent }: { current: number; total: number; percent: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        {/* Compass ring */}
        <svg width="40" height="40" viewBox="0 0 40 40" className="transform -rotate-90">
          <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
          <motion.circle
            cx="20" cy="20" r="17"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${percent * 1.07} 107`}
            initial={{ strokeDasharray: '0 107' }}
            animate={{ strokeDasharray: `${percent * 1.07} 107` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={percent === 100 ? 'stroke-emerald-400' : 'stroke-[#c8a951]'}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className={cn('w-4 h-4', percent === 100 ? 'text-emerald-400' : 'text-[#c8a951]')} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-white/70">תחנה {current} מתוך {total}</p>
        <p className="text-[10px] text-white/30">{percent === 100 ? 'המסע הושלם!' : 'בדרך להצלחה'}</p>
      </div>
    </div>
  );
}

// =============================================================================
// POWER CORE PROGRESS BAR
// =============================================================================

function PowerCore({ percent, done, total }: { percent: number; done: number; total: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">{done} מתוך {total} שירותים</span>
        <div className={cn(
          'flex items-center gap-1.5 text-sm font-bold',
          percent === 100 ? 'text-emerald-400' : 'text-[#c8a951]'
        )}>
          <Zap className="w-4 h-4" />
          {percent}%
        </div>
      </div>

      {/* The bar */}
      <div className="relative h-4 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
        {/* Inner track marks */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-white/[0.03] h-full" />
          ))}
        </div>

        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'absolute inset-y-0 right-0 rounded-full',
            percent === 100
              ? 'bg-gradient-to-l from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-l from-[#c8a951] to-[#e8d48b]'
          )}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all',
              i < done ? 'bg-emerald-500/70' : 'bg-white/[0.06]'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ServiceTimeline({ services, projectId, isAdmin = false, files = [] }: ServiceTimelineProps) {
  const doneCount = useMemo(() => services.filter((s) => s.allDone).length, [services]);
  const totalCount = services.length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Find current station (first incomplete, or last if all done)
  const currentStation = useMemo(() => {
    const idx = services.findIndex((s) => !s.allDone);
    return idx >= 0 ? idx + 1 : totalCount;
  }, [services, totalCount]);

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white/15" />
        </div>
        <h3 className="text-sm font-semibold text-white/60 mb-1">המסע טרם התחיל</h3>
        <p className="text-xs text-white/30">השירותים שרכשת מ-WeCcelerate יופיעו כאן כמפת מסע</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Journey Console Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1525] via-[#0a0f1e] to-[#070b1e]" />
        <div className="absolute inset-0">
          <img src="/images/portal/dashboard-hero.png" alt="" className="w-full h-full object-cover opacity-[0.03]" />
        </div>
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#c8a951]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/[0.03] rounded-full blur-[80px]" />

        <div className="relative z-10 p-5 sm:p-6">
          {/* Top row: Title + Compass */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-[#c8a951] rounded-full animate-pulse" />
                <span className="text-[10px] text-[#c8a951] font-semibold uppercase tracking-widest">WeCcelerate Journey</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">המסע היזמי שלך</h2>
              <p className="text-sm text-white/35 mt-1">
                {progressPercent === 100 ? 'כל התחנות הושלמו — המסע נגמר בהצלחה!' : 'עוקב אחרי ההתקדמות שלך בתוכנית'}
              </p>
            </div>
            <CompassTracker current={currentStation} total={totalCount} percent={progressPercent} />
          </div>

          {/* Power Core */}
          <PowerCore percent={progressPercent} done={doneCount} total={totalCount} />
        </div>
      </div>

      {/* Maze Journey */}
      <div className="relative px-1 sm:px-4">
        {/* Vertical center line (maze backbone) */}
        <div className="absolute right-1/2 translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.04] via-white/[0.08] to-white/[0.04] hidden sm:block" />

        {services.map((service, index) => (
          <div key={service.id}>
            <StationNode
              service={service}
              index={index}
              isAdmin={isAdmin}
              projectId={projectId}
              totalStations={totalCount}
              files={files}
            />
            {index < services.length - 1 && (
              <MazePath
                completed={service.allDone}
                index={index}
                total={totalCount}
              />
            )}
          </div>
        ))}
      </div>

      {/* Journey Completion */}
      {progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center py-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">כל הכבוד! השלמת את כל התחנות במסע</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ServiceTimeline;
