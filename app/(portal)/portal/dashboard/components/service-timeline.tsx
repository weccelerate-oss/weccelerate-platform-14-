/**
 * Startup Growth Network — Premium Service Journey
 *
 * A sophisticated network topology showing WeCcelerate services
 * as interconnected nodes in a clean, schematic layout.
 *
 * Role-based:
 * - Entrepreneur: view/download files from Google Drive Portal
 * - Admin: upload deliverables
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Clock, Upload, Download, Eye, FileText, TrendingUp,
  Megaphone, LayoutGrid, Globe, Compass, Users, ClipboardList,
  FileCheck, Search, ChevronDown, Trophy, HardDrive, Zap, MapPin, Shield,
  FileSpreadsheet, Presentation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MatchedService } from '@/lib/service-matcher';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectFile {
  id: string; name: string; displayName: string | null; url: string; size: number | null; mimeType: string | null;
}

interface DriveFileDisplay {
  id: string; name: string; mimeType: string; size: string; webViewLink: string; webContentLink: string | null; downloadLink: string; modifiedTime: string;
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
  FileText: <FileText className="w-5 h-5" />, TrendingUp: <TrendingUp className="w-5 h-5" />,
  Presentation: <Presentation className="w-5 h-5" />, Megaphone: <Megaphone className="w-5 h-5" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5" />, Globe: <Globe className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />, Users: <Users className="w-5 h-5" />,
  ClipboardList: <ClipboardList className="w-5 h-5" />, FileCheck: <FileCheck className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
};

function getFileIcon(name: string, mimeType: string) {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || name.endsWith('.xlsx') || name.endsWith('.xls'))
    return { icon: <FileSpreadsheet className="w-4 h-4" />, color: 'text-emerald-400' };
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || name.endsWith('.pptx') || name.endsWith('.ppt'))
    return { icon: <Presentation className="w-4 h-4" />, color: 'text-orange-400' };
  if (mimeType.includes('pdf') || name.endsWith('.pdf'))
    return { icon: <FileText className="w-4 h-4" />, color: 'text-red-400' };
  if (mimeType.includes('document') || mimeType.includes('word') || name.endsWith('.docx'))
    return { icon: <FileText className="w-4 h-4" />, color: 'text-blue-400' };
  return { icon: <FileText className="w-4 h-4" />, color: 'text-white/40' };
}

function formatDate(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSize(b: string | number | null): string {
  const bytes = Number(b);
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// =============================================================================
// NETWORK NODE
// =============================================================================

function NetworkNode({
  service, index, total, isAdmin, projectId, files, driveFiles,
}: {
  service: MatchedService; index: number; total: number; isAdmin: boolean;
  projectId?: string; files: ProjectFile[]; driveFiles: DriveFileDisplay[];
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const icon = ICON_MAP[service.icon] || <FileText className="w-5 h-5" />;
  const isEven = index % 2 === 0;

  // Match Drive files to service
  const svcDriveFiles = driveFiles.filter((f) => {
    const name = f.name.toLowerCase();
    return service.name.split(' ').filter(w => w.length > 2).some(w => name.includes(w.toLowerCase()));
  });

  const svcDbFiles = files.filter((f) => {
    const name = (f.displayName || f.name).toLowerCase();
    return service.name.split(' ').filter(w => w.length > 2).some(w => name.includes(w.toLowerCase()));
  });

  const allFiles = [
    ...svcDriveFiles.map(f => ({ id: f.id, name: f.name, viewUrl: f.webViewLink, downloadUrl: f.downloadLink, size: f.size, mimeType: f.mimeType, source: 'drive' as const })),
    ...svcDbFiles.map(f => ({ id: f.id, name: f.displayName || f.name, viewUrl: f.url, downloadUrl: f.url, size: String(f.size || 0), mimeType: f.mimeType || '', source: 'db' as const })),
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4194304) { setMsg({ ok: false, text: 'מקסימום 4MB' }); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Connection line to next node */}
      {index < total - 1 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full h-10 z-0">
          <div className={cn(
            'w-px h-full mx-auto',
            service.allDone ? 'bg-gradient-to-b from-emerald-500/60 to-emerald-500/20' : 'bg-gradient-to-b from-white/[0.08] to-transparent'
          )} />
          {service.allDone && (
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ y: [0, 32], opacity: [1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeIn' }}
            />
          )}
        </div>
      )}

      {/* Node card */}
      <div
        className={cn(
          'relative rounded-2xl border overflow-hidden transition-all duration-300',
          service.allDone
            ? 'border-emerald-500/15 hover:border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.04)]'
            : 'border-white/[0.06]',
        )}
      >
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-sm" />

        {/* Glow accent line */}
        <div className={cn(
          'absolute top-0 right-0 w-1 h-full rounded-full',
          service.allDone ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-white/[0.04]'
        )} />

        {/* Clickable header area */}
        <div
          className={cn('relative z-10 p-4 sm:p-5', service.allDone && 'cursor-pointer')}
          onClick={() => service.allDone && setOpen(!open)}
        >
          <div className="flex items-center gap-4">
            {/* Node indicator */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center border transition-all',
                service.allDone
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/40'
              )}>
                {service.allDone ? <Check className="w-7 h-7" strokeWidth={2} /> : icon}
              </div>
              {/* Coordinate badge */}
              <div className={cn(
                'absolute -top-2 -left-2 min-w-[24px] h-6 px-1.5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center',
                service.allDone ? 'bg-emerald-600 text-white' : 'bg-[#c8a951] text-[#070b1e]'
              )}>
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-bold text-base sm:text-lg tracking-tight',
                service.allDone ? 'text-white' : 'text-white/60'
              )}>
                {service.name}
              </h3>
              <div className="flex items-center gap-2.5 mt-1">
                {service.completedDate && (
                  <span className="text-xs text-white/30 font-mono">{formatDate(service.completedDate)}</span>
                )}
                <span className={cn(
                  'text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-md uppercase',
                  service.allDone
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.04] text-white/30 border border-white/[0.06]'
                )}>
                  {service.allDone ? 'בוצע!' : 'בתהליך'}
                </span>
                {allFiles.length > 0 && service.allDone && (
                  <span className="text-[10px] text-white/20 font-mono">{allFiles.length} קבצים</span>
                )}
              </div>
            </div>

            {/* Data coordinates */}
            <div className="hidden sm:flex flex-col items-end flex-shrink-0 gap-0.5">
              <span className={cn('text-lg font-mono font-bold', service.allDone ? 'text-emerald-400/70' : 'text-white/15')}>
                {service.completedActivities}/{service.totalActivities}
              </span>
              <span className="text-[9px] text-white/20 uppercase tracking-widest">פעולות</span>
            </div>

            {/* Expand arrow */}
            {service.allDone && (
              <motion.div animate={{ rotate: open ? 180 : 0 }} className="flex-shrink-0">
                <ChevronDown className="w-4 h-4 text-white/20" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Expanded: Files Panel */}
        <AnimatePresence>
          {open && service.allDone && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 border-t border-white/[0.04]">
                {/* Portal badge */}
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-500/50" />
                  <span className="text-[10px] text-white/25 font-mono tracking-wide">
                    {isAdmin ? 'ADMIN · PORTAL MANAGEMENT' : 'מחובר ל-Drive Portal — צפייה בלבד'}
                  </span>
                  {!isAdmin && <Shield className="w-3 h-3 text-white/15" />}
                </div>

                {msg && (
                  <div className={cn('p-2.5 rounded-lg text-xs mb-3 border', msg.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-red-500/10 text-red-400 border-red-500/15')}>
                    {msg.text}
                  </div>
                )}

                {/* Files list */}
                <div className="space-y-1.5">
                  {allFiles.map((f) => {
                    const fi = getFileIcon(f.name, f.mimeType);
                    return (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-white/[0.08] transition-colors group" onClick={(e) => e.stopPropagation()}>
                        <div className={cn('w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center', fi.color)}>
                          {fi.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/75 font-medium truncate">{f.name}</p>
                          <p className="text-[10px] text-white/20">
                            {f.source === 'drive' && <><HardDrive className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />Drive · </>}
                            {formatSize(f.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <a href={f.viewUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors" title="צפה אונליין">
                            <Eye className="w-4 h-4" />
                          </a>
                          <a href={f.downloadUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors" title="הורד">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}

                  {allFiles.length === 0 && (
                    <div className="text-center py-4">
                      <FileText className="w-5 h-5 text-white/10 mx-auto mb-1.5" />
                      <p className="text-[11px] text-white/20">אין קבצים זמינים עדיין</p>
                    </div>
                  )}
                </div>

                {/* Admin upload */}
                {isAdmin && (
                  <label className="flex items-center gap-3 p-3 mt-2 rounded-xl border border-dashed border-white/[0.08] hover:border-[#c8a951]/25 cursor-pointer transition-colors" onClick={(e) => e.stopPropagation()}>
                    {uploading
                      ? <div className="w-8 h-8 border-2 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                      : <div className="w-8 h-8 rounded-lg bg-[#c8a951]/10 flex items-center justify-center"><Upload className="w-4 h-4 text-[#c8a951]" /></div>}
                    <div>
                      <span className="text-xs text-white/50 font-medium">{uploading ? 'מעלה...' : 'העלה קובץ סופי ל-Portal'}</span>
                      <span className="block text-[9px] text-white/20">עד 4MB</span>
                    </div>
                    <input type="file" className="hidden" disabled={uploading} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png" onChange={handleUpload} />
                  </label>
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

  if (!services || total === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-8 h-8 text-white/10 mx-auto mb-3" />
        <p className="text-sm text-white/40">המסע טרם התחיל</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Network Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
        <div className="absolute inset-0 bg-[#0a0e1a]" />
        <div className="absolute inset-0 bg-[url('/images/portal/dashboard-hero.png')] bg-cover bg-center opacity-[0.03]" />

        {/* Schematic grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 p-5 sm:p-6">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn('w-2 h-2 rounded-full', pct === 100 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-[#c8a951] animate-pulse')} />
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Network Status</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">השירותים שלך ב-WeCcelerate</h2>
              <p className="text-sm text-white/30 mt-1 font-light">
                {pct === 100 ? 'כל התחנות ברשת הושלמו בהצלחה' : `${doneCount} מתוך ${total} שירותים הושלמו`}
              </p>
            </div>

            {/* Compass / Coordinate display */}
            <div className="flex items-center gap-3 bg-white/[0.02] rounded-xl px-4 py-3 border border-white/[0.06]">
              <div className="relative w-11 h-11">
                <svg viewBox="0 0 44 44" className="-rotate-90">
                  <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                  <motion.circle cx="22" cy="22" r="19" fill="none" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${pct * 1.19} 119`}
                    initial={{ strokeDasharray: '0 119' }}
                    animate={{ strokeDasharray: `${pct * 1.19} 119` }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className={pct === 100 ? 'stroke-emerald-400' : 'stroke-[#c8a951]'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn('text-xs font-mono font-bold', pct === 100 ? 'text-emerald-400' : 'text-[#c8a951]')}>{pct}%</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-mono font-bold text-white/60">{doneCount}/{total}</p>
                <p className="text-[9px] text-white/20 uppercase tracking-widest">{pct === 100 ? 'Complete' : 'Active'}</p>
              </div>
            </div>
          </div>

          {/* Power bar */}
          <div className="relative h-2.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.04]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn('absolute inset-y-0 right-0 rounded-full', pct === 100 ? 'bg-gradient-to-l from-emerald-500 to-emerald-400' : 'bg-gradient-to-l from-[#c8a951] to-[#e8d48b]')}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            </motion.div>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5 mt-3">
            {services.map((s, i) => (
              <motion.div key={s.id}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.06 }}
                className={cn('h-1 flex-1 rounded-full origin-right', s.allDone ? 'bg-emerald-500/50' : 'bg-white/[0.04]')}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Network Nodes */}
      <div className="space-y-10 px-1">
        {services.map((service, i) => (
          <NetworkNode
            key={service.id}
            service={service}
            index={i}
            total={total}
            isAdmin={isAdmin}
            projectId={projectId}
            files={files}
            driveFiles={driveFiles}
          />
        ))}
      </div>

      {/* Completion */}
      {pct === 100 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center py-4">
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06]">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">כל הכבוד! כל התחנות ברשת הושלמו</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ServiceTimeline;
