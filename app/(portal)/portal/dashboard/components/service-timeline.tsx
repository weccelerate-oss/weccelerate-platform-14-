/**
 * Startup Journey — Slalom Track
 *
 * Services displayed as stations along a winding slalom track.
 * Stations zigzag left-right across the screen with SVG path connecting them.
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

interface DriveFileDisplay {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
  webContentLink: string | null;
  downloadLink: string;
  modifiedTime: string;
}

interface ServiceTimelineProps {
  services: MatchedService[];
  projectId?: string;
  isAdmin?: boolean;
  files?: ProjectFile[];
  driveFiles?: DriveFileDisplay[];
}

// =============================================================================
// HELPERS
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

const FILE_COLORS: Record<string, string> = {
  pdf: 'text-red-400', pptx: 'text-orange-400', xlsx: 'text-emerald-400', docx: 'text-blue-400',
};

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSize(b: number | null): string {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

// =============================================================================
// SLALOM TRACK — the winding SVG path
// =============================================================================

function SlalomTrack({ count, doneCount }: { count: number; doneCount: number }) {
  // Each station is ~140px apart vertically, zigzagging between 25% and 75% horizontally
  const nodeSpacing = 140;
  const totalHeight = (count - 1) * nodeSpacing;
  const width = 100; // percentage-based thinking, actual SVG width

  // Build path points
  const points = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? 75 : 25, // zigzag percentage
    y: i * nodeSpacing + 30,
  }));

  // Build SVG path string with curves
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    pathD += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  // Calculate done path percentage
  const donePercent = count > 1 ? (doneCount / (count - 1)) * 100 : 100;

  return (
    <svg
      viewBox={`0 0 100 ${totalHeight + 60}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="trackGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <path d={pathD} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Completed track glow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(16,185,129,0.15)"
        strokeWidth="2"
        strokeDasharray={`${donePercent} ${100 - donePercent}`}
        strokeDashoffset="0"
        pathLength="100"
        filter="url(#trackGlow)"
      />

      {/* Completed track solid */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(16,185,129,0.5)"
        strokeWidth="0.5"
        strokeDasharray={`${donePercent} ${100 - donePercent}`}
        strokeDashoffset="0"
        pathLength="100"
      />

      {/* Station dots on path */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.5"
          className={i < doneCount ? 'fill-emerald-500' : i === doneCount ? 'fill-[#c8a951]' : 'fill-white/10'}
        />
      ))}
    </svg>
  );
}

// =============================================================================
// STATION CARD
// =============================================================================

function StationCard({
  service, index, isAdmin, projectId, files, driveFiles,
}: {
  service: MatchedService;
  index: number;
  isAdmin: boolean;
  projectId?: string;
  files: ProjectFile[];
  driveFiles: DriveFileDisplay[];
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const icon = ICON_MAP[service.icon] || <FileText className="w-5 h-5" />;
  const isEven = index % 2 === 0;

  // Match DB files to this service
  const svcFiles = files.filter((f) => {
    const name = (f.displayName || f.name).toLowerCase();
    return service.name.split(' ').filter(w => w.length > 2).some(w => name.includes(w.toLowerCase()));
  });

  // Match Drive files to this service
  const svcDriveFiles = driveFiles.filter((f) => {
    const name = f.name.toLowerCase();
    return service.name.split(' ').filter(w => w.length > 2).some(w => name.includes(w.toLowerCase()));
  });

  const allDisplayFiles = [
    ...svcDriveFiles.map(f => ({ id: f.id, name: f.name, viewUrl: f.webViewLink, downloadUrl: f.downloadLink, size: f.size, source: 'drive' as const })),
    ...svcFiles.map(f => ({ id: f.id, name: f.displayName || f.name, viewUrl: f.url, downloadUrl: f.url, size: String(f.size || 0), source: 'db' as const })),
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4194304) { setMsg({ ok: false, text: 'מקסימום 4MB' }); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (projectId) fd.append('projectId', projectId);
      const res = await fetch('/api/portal/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      setMsg({ ok: true, text: `"${file.name}" הועלה` });
      setTimeout(() => setMsg(null), 3000);
    } catch { setMsg({ ok: false, text: 'העלאה נכשלה' }); }
    finally { setUploading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? 40 : -40, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative w-[85%] sm:w-[45%]',
        isEven ? 'self-start' : 'self-end',
      )}
      style={{ marginTop: index === 0 ? 0 : '-8px' }}
    >
      <div
        onClick={() => setOpen(!open)}
        className={cn(
          'rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden group',
          service.allDone
            ? 'border-emerald-500/20 hover:border-emerald-500/35 shadow-[0_0_30px_rgba(16,185,129,0.06)]'
            : 'border-white/[0.06] hover:border-[#c8a951]/20'
        )}
      >
        {/* Ambient bg */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
          service.allDone ? 'bg-gradient-to-br from-emerald-500/[0.04] to-transparent' : 'bg-gradient-to-br from-[#c8a951]/[0.03] to-transparent'
        )} />

        <div className="relative z-10 p-4">
          <div className="flex items-center gap-3">
            {/* Node circle */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                service.allDone
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/[0.05] text-white/50'
              )}>
                {service.allDone ? <Check className="w-6 h-6" strokeWidth={2.5} /> : icon}
              </div>
              <div className={cn(
                'absolute -top-2 -right-2 w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center',
                service.allDone ? 'bg-emerald-600 text-white' : 'bg-[#c8a951] text-[#070b1e]'
              )}>
                {index + 1}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className={cn('font-bold text-sm sm:text-base', service.allDone ? 'text-emerald-400' : 'text-white')}>
                {service.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {service.completedDate && <span className="text-[11px] text-white/30">{formatDate(service.completedDate)}</span>}
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  service.allDone
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[#c8a951]/10 text-[#c8a951]'
                )}>
                  {service.allDone ? '✓ הושלם' : '⏳ בתהליך'}
                </span>
              </div>
            </div>

            <motion.div animate={{ rotate: open ? 180 : 0 }} className="flex-shrink-0">
              <ChevronDown className="w-4 h-4 text-white/20" />
            </motion.div>
          </div>

          {/* Mini bar */}
          <div className="mt-3 h-1 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(service.completedActivities / service.totalActivities) * 100}%` }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className={cn('h-full rounded-full', service.allDone ? 'bg-emerald-500' : 'bg-[#c8a951]')}
            />
          </div>
        </div>

        {/* Expanded panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5 mb-3">
                  <HardDrive className="w-3 h-3 text-white/20" />
                  <span className="text-[10px] text-white/20">
                    {isAdmin ? 'ניהול קבצי Portal' : 'Portal Drive — צפייה בלבד'}
                  </span>
                </div>

                {msg && (
                  <div className={cn('p-2 rounded-lg text-xs mb-2', msg.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                    {msg.text}
                  </div>
                )}

                {service.allDone ? (
                  <>
                    {allDisplayFiles.map((f) => (
                      <div key={f.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-1.5 hover:border-white/[0.08] transition-colors" onClick={(e) => e.stopPropagation()}>
                        <div className={cn('w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center', FILE_COLORS[getExt(f.name)] || 'text-white/40')}>
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/70 font-medium truncate">{f.name}</p>
                          <p className="text-[10px] text-white/20">
                            {f.source === 'drive' && <><HardDrive className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />Drive · </>}
                            {formatSize(Number(f.size) || null)}
                          </p>
                        </div>
                        <a href={f.viewUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors" title="צפה אונליין">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <a href={f.downloadUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors" title="הורד">
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                    {allDisplayFiles.length === 0 && (
                      <p className="text-center text-[11px] text-white/20 py-3">עדיין לא הועלו קבצים</p>
                    )}
                    {isAdmin && (
                      <label className="flex items-center gap-2.5 p-3 rounded-lg border border-dashed border-white/[0.08] hover:border-[#c8a951]/25 cursor-pointer mt-2 transition-colors" onClick={(e) => e.stopPropagation()}>
                        {uploading
                          ? <div className="w-7 h-7 border-2 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                          : <div className="w-7 h-7 rounded-md bg-[#c8a951]/10 flex items-center justify-center"><Upload className="w-3.5 h-3.5 text-[#c8a951]" /></div>
                        }
                        <span className="text-xs text-white/50">{uploading ? 'מעלה...' : 'העלה קובץ ל-Portal של היזם'}</span>
                        <input type="file" className="hidden" disabled={uploading} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp" onChange={handleUpload} />
                      </label>
                    )}
                  </>
                ) : (
                  <p className="text-center text-[11px] text-white/20 py-3">השירות בתהליך — קבצים יהיו זמינים לאחר השלמתו</p>
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
// MAIN COMPONENT
// =============================================================================

export function ServiceTimeline({ services, projectId, isAdmin = false, files = [], driveFiles = [] }: ServiceTimelineProps) {
  const doneCount = useMemo(() => services.filter(s => s.allDone).length, [services]);
  const total = services.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const currentStation = useMemo(() => {
    const idx = services.findIndex(s => !s.allDone);
    return idx >= 0 ? idx + 1 : total;
  }, [services, total]);

  if (!services || total === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-8 h-8 text-white/15 mx-auto mb-3" />
        <p className="text-sm text-white/50">המסע טרם התחיל</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5 sm:p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1525] to-[#070b1e]" />
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#c8a951]/[0.03] rounded-full blur-[80px]" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500/[0.03] rounded-full blur-[60px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-[#c8a951] rounded-full animate-pulse" />
                <span className="text-[10px] text-[#c8a951] font-semibold uppercase tracking-widest">Journey</span>
              </div>
              <h2 className="text-xl font-bold text-white">המסע היזמי שלך</h2>
            </div>
            {/* Compass */}
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
                  <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                  <circle cx="20" cy="20" r="17" fill="none" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${pct * 1.07} 107`}
                    className={pct === 100 ? 'stroke-emerald-400' : 'stroke-[#c8a951]'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Compass className={cn('w-4 h-4', pct === 100 ? 'text-emerald-400' : 'text-[#c8a951]')} />
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white/60">{currentStation}/{total}</p>
                <p className="text-[10px] text-white/25">{pct === 100 ? 'הושלם!' : 'בדרך'}</p>
              </div>
            </div>
          </div>

          {/* Power bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className={cn('h-full rounded-full relative', pct === 100 ? 'bg-gradient-to-l from-emerald-500 to-emerald-400' : 'bg-gradient-to-l from-[#c8a951] to-[#e8d48b]')}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
              </motion.div>
            </div>
            <span className={cn('text-sm font-bold min-w-[40px] text-left', pct === 100 ? 'text-emerald-400' : 'text-[#c8a951]')}>
              <Zap className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" />{pct}%
            </span>
          </div>

          {/* Step dots */}
          <div className="flex gap-1 mt-2">
            {services.map((s, i) => (
              <div key={s.id} className={cn('h-1.5 flex-1 rounded-full', s.allDone ? 'bg-emerald-500/60' : 'bg-white/[0.05]')} />
            ))}
          </div>
        </div>
      </div>

      {/* Slalom Track */}
      <div className="relative" style={{ minHeight: `${(total - 1) * 140 + 80}px` }}>
        {/* SVG slalom path behind cards */}
        <SlalomTrack count={total} doneCount={doneCount} />

        {/* Station cards in zigzag */}
        <div className="relative z-10 flex flex-col gap-6 px-2">
          {services.map((service, i) => (
            <StationCard
              key={service.id}
              service={service}
              index={i}
              isAdmin={isAdmin}
              projectId={projectId}
              files={files}
              driveFiles={driveFiles}
            />
          ))}
        </div>
      </div>

      {/* Finish */}
      {pct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-sm font-bold text-emerald-400">
            <Trophy className="w-4 h-4" /> כל הכבוד! סיימת את כל התחנות
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ServiceTimeline;
