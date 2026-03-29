/**
 * Service Network — Ultra-Premium Enterprise Dashboard
 *
 * Vertical spine timeline with glassmorphism cards.
 * Clean, sharp, Vercel/Stripe-grade UI.
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Clock, Upload, Download, Eye, FileText, TrendingUp,
  Megaphone, LayoutGrid, Globe, Compass, Users, ClipboardList,
  FileCheck, Search, ChevronDown, Trophy, HardDrive, Zap, MapPin,
  Shield, FileSpreadsheet, Presentation,
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
  id: string; name: string; mimeType: string; size: string; webViewLink: string;
  webContentLink: string | null; downloadLink: string; modifiedTime: string;
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
  FileText: <FileText className="w-4 h-4" />, TrendingUp: <TrendingUp className="w-4 h-4" />,
  Presentation: <Presentation className="w-4 h-4" />, Megaphone: <Megaphone className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />, Globe: <Globe className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />, Users: <Users className="w-4 h-4" />,
  ClipboardList: <ClipboardList className="w-4 h-4" />, FileCheck: <FileCheck className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
};

function fileIcon(name: string, mime: string) {
  if (mime.includes('spreadsheet') || mime.includes('excel') || name.endsWith('.xlsx'))
    return { icon: <FileSpreadsheet className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (mime.includes('presentation') || mime.includes('powerpoint') || name.endsWith('.pptx'))
    return { icon: <Presentation className="w-4 h-4" />, color: 'text-orange-400', bg: 'bg-orange-500/10' };
  if (mime.includes('pdf') || name.endsWith('.pdf'))
    return { icon: <FileText className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' };
  return { icon: <FileText className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' };
}

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

function fmtSize(b: string | number | null) {
  const n = Number(b); if (!n) return '';
  return n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;
}

// =============================================================================
// SPINE NODE
// =============================================================================

function SpineNode({
  service, index, total, isAdmin, projectId, files, driveFiles,
}: {
  service: MatchedService; index: number; total: number; isAdmin: boolean;
  projectId?: string; files: ProjectFile[]; driveFiles: DriveFileDisplay[];
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const icon = ICON_MAP[service.icon] || <FileText className="w-4 h-4" />;

  // Match files
  const matchedDrive = driveFiles.filter((f) => {
    const n = f.name.toLowerCase();
    return service.name.split(' ').filter(w => w.length > 2).some(w => n.includes(w.toLowerCase()));
  });
  const matchedDb = files.filter((f) => {
    const n = (f.displayName || f.name).toLowerCase();
    return service.name.split(' ').filter(w => w.length > 2).some(w => n.includes(w.toLowerCase()));
  });
  const allFiles = [
    ...matchedDrive.map(f => ({ id: f.id, name: f.name, viewUrl: f.webViewLink, dlUrl: f.downloadLink, size: f.size, mime: f.mimeType, src: 'drive' as const })),
    ...matchedDb.map(f => ({ id: f.id, name: f.displayName || f.name, viewUrl: f.url, dlUrl: f.url, size: String(f.size || 0), mime: f.mimeType || '', src: 'db' as const })),
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 4194304) { setMsg({ ok: false, text: 'מקסימום 4MB' }); return; }
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      if (projectId) fd.append('projectId', projectId);
      const res = await fetch('/api/portal/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      setMsg({ ok: true, text: `"${file.name}" הועלה` });
      setTimeout(() => setMsg(null), 3000);
    } catch { setMsg({ ok: false, text: 'נכשל' }); } finally { setUploading(false); }
  };

  const done = service.allDone;

  return (
    <div className="relative flex gap-5 sm:gap-8">
      {/* Spine column */}
      <div className="flex flex-col items-center flex-shrink-0 w-10 sm:w-12">
        {/* Dot */}
        <div className={cn(
          'relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center z-10 transition-all duration-500',
          done
            ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
            : 'bg-white/[0.03] ring-1 ring-white/[0.06]'
        )}>
          {done ? (
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          ) : (
            <span className={cn('transition-colors', done ? 'text-emerald-400' : 'text-white/25')}>
              {icon}
            </span>
          )}
          {/* Index */}
          <span className={cn(
            'absolute -top-1.5 -right-1.5 text-[9px] font-mono font-bold w-5 h-5 rounded-md flex items-center justify-center',
            done ? 'bg-emerald-600 text-white' : 'bg-white/[0.06] text-white/30'
          )}>
            {index + 1}
          </span>
        </div>

        {/* Line to next */}
        {index < total - 1 && (
          <div className="flex-1 w-px min-h-[40px] relative">
            <div className={cn(
              'absolute inset-0',
              done ? 'bg-gradient-to-b from-emerald-500/40 to-emerald-500/10' : 'bg-gradient-to-b from-white/[0.06] to-transparent'
            )} />
            {done && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-emerald-400/60"
                animate={{ top: ['0%', '100%'], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeIn' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8 sm:pb-10 min-w-0">
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'rounded-xl border backdrop-blur-xl overflow-hidden transition-all duration-300',
            done
              ? 'bg-white/[0.025] border-emerald-500/[0.12] hover:border-emerald-500/25 shadow-[0_4px_24px_rgba(0,0,0,0.2),0_0_0_1px_rgba(16,185,129,0.06)]'
              : 'bg-white/[0.015] border-white/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
          )}
        >
          {/* Header — clickable */}
          <div
            className={cn('p-4 sm:p-5', done && 'cursor-pointer')}
            onClick={() => done && setOpen(!open)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className={cn(
                  'text-[15px] sm:text-base font-semibold tracking-tight',
                  done ? 'text-white' : 'text-white/40'
                )}>
                  {service.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  {service.completedDate && (
                    <span className="text-[11px] text-white/25 font-mono">{fmtDate(service.completedDate)}</span>
                  )}
                  <span className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md',
                    done
                      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                      : 'bg-white/[0.03] text-white/25 ring-1 ring-white/[0.06]'
                  )}>
                    {done ? <><Check className="w-2.5 h-2.5" /> בוצע!</> : <><Clock className="w-2.5 h-2.5" /> בתהליך</>}
                  </span>
                  {allFiles.length > 0 && done && (
                    <span className="text-[10px] text-white/15 font-mono">{allFiles.length} קבצים</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={cn(
                  'text-sm font-mono font-bold hidden sm:block',
                  done ? 'text-emerald-500/50' : 'text-white/10'
                )}>
                  {service.completedActivities}/{service.totalActivities}
                </span>
                {done && (
                  <motion.div animate={{ rotate: open ? 180 : 0 }}>
                    <ChevronDown className="w-4 h-4 text-white/15" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded: File Portal */}
          <AnimatePresence>
            {open && done && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-white/[0.04]">
                  {/* Portal badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                    <HardDrive className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] text-white/20 tracking-wide">
                      {isAdmin ? 'ADMIN · PORTAL' : 'מחובר ל-Drive Portal — צפייה בלבד'}
                    </span>
                    {!isAdmin && <Shield className="w-2.5 h-2.5 text-white/10" />}
                  </div>

                  {msg && (
                    <div className={cn('p-2 rounded-lg text-xs mb-2 ring-1',
                      msg.ok ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 'bg-red-500/10 text-red-400 ring-red-500/20'
                    )}>{msg.text}</div>
                  )}

                  {/* File list */}
                  <div className="space-y-1">
                    {allFiles.map((f) => {
                      const fi = fileIcon(f.name, f.mime);
                      return (
                        <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] ring-1 ring-white/[0.04] hover:ring-white/[0.08] transition-all group">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', fi.bg, fi.color)}>
                            {fi.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-white/70 font-medium truncate">{f.name}</p>
                            <p className="text-[10px] text-white/20">
                              {f.src === 'drive' && <><HardDrive className="w-2.5 h-2.5 inline -mt-px mr-0.5" />Drive · </>}
                              {fmtSize(f.size)}
                            </p>
                          </div>
                          <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <a href={f.viewUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-md hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
                              title="צפה אונליין"
                              onClick={(e) => e.stopPropagation()}>
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                            <a href={f.dlUrl} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-md hover:bg-white/[0.06] text-white/60 hover:text-white transition-colors"
                              title="הורד"
                              onClick={(e) => e.stopPropagation()}>
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {allFiles.length === 0 && (
                    <div className="py-4 text-center">
                      <FileText className="w-5 h-5 text-white/8 mx-auto mb-1" />
                      <p className="text-[11px] text-white/15">אין קבצים זמינים</p>
                    </div>
                  )}

                  {/* Admin upload */}
                  {isAdmin && (
                    <label className="flex items-center gap-3 p-3 mt-2 rounded-lg ring-1 ring-dashed ring-white/[0.08] hover:ring-[#c8a951]/20 cursor-pointer transition-all"
                      onClick={(e) => e.stopPropagation()}>
                      {uploading
                        ? <div className="w-7 h-7 border-2 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                        : <div className="w-7 h-7 rounded-md bg-[#c8a951]/10 flex items-center justify-center"><Upload className="w-3.5 h-3.5 text-[#c8a951]" /></div>}
                      <span className="text-[11px] text-white/40">{uploading ? 'מעלה...' : 'העלה קובץ סופי ל-Portal'}</span>
                      <input type="file" className="hidden" disabled={uploading}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png" onChange={handleUpload} />
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN
// =============================================================================

export function ServiceTimeline({ services, projectId, isAdmin = false, files = [], driveFiles = [] }: ServiceTimelineProps) {
  const done = useMemo(() => services.filter(s => s.allDone).length, [services]);
  const total = services.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!services || total === 0) {
    return (
      <div className="py-12 text-center">
        <MapPin className="w-6 h-6 text-white/8 mx-auto mb-2" />
        <p className="text-sm text-white/25">המסע טרם התחיל</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.15em] mb-1">Service Network</p>
          <h2 className="text-lg font-semibold text-white tracking-tight">השירותים שלך ב-WeCcelerate</h2>
          <p className="text-sm text-white/30 mt-0.5">{done} מתוך {total} שירותים הושלמו</p>
        </div>

        {/* Progress ring */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 48 48" className="-rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" strokeWidth="2.5" className="stroke-white/[0.04]" />
              <motion.circle cx="24" cy="24" r="20" fill="none" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={`${pct * 1.257} 125.7`}
                initial={{ strokeDasharray: '0 125.7' }}
                animate={{ strokeDasharray: `${pct * 1.257} 125.7` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className={pct === 100 ? 'stroke-emerald-400' : 'stroke-[#c8a951]'}
              />
            </svg>
            <span className={cn('absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold',
              pct === 100 ? 'text-emerald-400' : 'text-[#c8a951]'
            )}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn('h-full rounded-full', pct === 100 ? 'bg-emerald-500' : 'bg-[#c8a951]')}
        />
      </div>

      {/* Spine + Nodes */}
      <div>
        {services.map((service, i) => (
          <SpineNode key={service.id} service={service} index={i} total={total}
            isAdmin={isAdmin} projectId={projectId} files={files} driveFiles={driveFiles} />
        ))}
      </div>

      {/* Completion */}
      {pct === 100 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pt-2 pb-4">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-emerald-400 bg-emerald-500/[0.06] ring-1 ring-emerald-500/15">
            <Trophy className="w-4 h-4" /> כל השירותים הושלמו
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default ServiceTimeline;
