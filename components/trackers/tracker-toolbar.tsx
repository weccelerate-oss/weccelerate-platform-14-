'use client';

/**
 * Toolbar: add / import / export / copy / print / search, plus the save status.
 *
 * The status pill is a deliberate departure from the journey, whose autosave is
 * silent by owner decision. Here it is not optional — somebody who just
 * imported 200 records has to see that it landed.
 */

import { AlertTriangle, Check, Copy, Download, Loader2, Plus, Printer, RefreshCw, Search, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SaveState } from '@/components/trackers/use-tracker-rows';

interface TrackerToolbarProps {
  readOnly: boolean;
  addLabel: string;
  countNoun: string;
  rowCount: number;
  warningCount: number;
  search: string;
  onSearch: (value: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onRefresh: () => void;
  saveState: SaveState;
  savedAt: string | null;
  errorMessage: string | null;
  importProgress: { done: number; total: number } | null;
  copied: boolean;
}

const secondaryBtn =
  'inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] px-3.5 py-2 ' +
  'text-[13px] font-semibold text-white/70 hover:border-[#c8a951]/40 hover:text-white ' +
  'transition-colors disabled:opacity-40';

function SaveStatus({
  saveState,
  savedAt,
  errorMessage,
  importProgress,
  onRefresh,
}: Pick<
  TrackerToolbarProps,
  'saveState' | 'savedAt' | 'errorMessage' | 'importProgress' | 'onRefresh'
>) {
  if (importProgress) {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] text-white/50">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        מייבא {importProgress.done}/{importProgress.total}
      </span>
    );
  }

  if (saveState === 'saving') {
    return (
      <span className="inline-flex items-center gap-2 text-[12px] text-white/50">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        שומר…
      </span>
    );
  }

  if (saveState === 'conflict') {
    return (
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[12px] font-semibold text-amber-200"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        עודכן במקום אחר — רענן
      </button>
    );
  }

  if (saveState === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-red-300">
        <AlertTriangle className="w-3.5 h-3.5" />
        {errorMessage ?? 'לא נשמר'}
      </span>
    );
  }

  if (saveState === 'dirty') {
    return <span className="text-[12px] text-white/35">שינויים לא שמורים…</span>;
  }

  if (saveState === 'saved' && savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-white/40">
        <Check className="w-3.5 h-3.5 text-emerald-400/70" />
        נשמר ב-{savedAt}
      </span>
    );
  }

  return null;
}

export default function TrackerToolbar(props: TrackerToolbarProps) {
  const {
    readOnly,
    addLabel,
    countNoun,
    rowCount,
    warningCount,
    search,
    onSearch,
    onAdd,
    onImport,
    onExport,
    onCopy,
    onPrint,
    copied,
  } = props;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 print:hidden">
      <div className="relative flex-1 min-w-[180px] max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="חיפוש"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] py-2 pr-9 pl-3 text-[13px] text-white/85 placeholder:text-white/25 outline-none focus:border-[#c8a951]/40"
        />
      </div>

      <span className="text-[12px] text-white/35 tabular-nums">
        {rowCount.toLocaleString('he-IL')} {countNoun}
      </span>

      {warningCount > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/[0.07] px-2.5 py-1 text-[12px] text-amber-200/90">
          <AlertTriangle className="w-3.5 h-3.5" />
          {warningCount} שדות לבדיקה
        </span>
      )}

      <div className="flex-1" />

      <SaveStatus {...props} />

      {!readOnly && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] px-4 py-2 text-[13px] font-bold text-[#1d1704] shadow-[0_8px_26px_-10px_rgba(200,169,81,.6)] hover:brightness-105 transition"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      )}

      {/* Nobody imports a spreadsheet from a phone, and hiding these removes the
          two most breakable affordances from the smallest screen. */}
      {!readOnly && (
        <button type="button" onClick={onImport} className={cn(secondaryBtn, 'hidden sm:inline-flex')}>
          <Upload className="w-3.5 h-3.5" />
          ייבוא
        </button>
      )}

      {/* Nothing to export yet — an export button over an empty list is an
          invitation to download a blank file. */}
      {rowCount > 0 && (
        <>
          <button type="button" onClick={onExport} className={cn(secondaryBtn, 'hidden sm:inline-flex')}>
            <Download className="w-3.5 h-3.5" />
            ייצוא לאקסל
          </button>
          <button type="button" onClick={onCopy} className={cn(secondaryBtn, 'hidden sm:inline-flex')}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'הועתק' : 'העתק ללוח'}
          </button>
          <button type="button" onClick={onPrint} className={cn(secondaryBtn, 'hidden lg:inline-flex')}>
            <Printer className="w-3.5 h-3.5" />
            הדפסה
          </button>
        </>
      )}
    </div>
  );
}
