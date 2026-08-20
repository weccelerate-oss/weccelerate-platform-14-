'use client';

/**
 * One editable cell. Long text renders as a single truncated line and opens an
 * anchored popover to edit — keeping every row the same height is what makes an
 * 11-column grid scannable.
 */

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatHebrewDate } from '@/lib/trackers/csv';
import type { TrackerColumn } from '@/lib/trackers/schema';

interface TrackerCellProps {
  column: TrackerColumn;
  value: string | null;
  warning?: string;
  readOnly: boolean;
  onChange: (value: string | null) => void;
  onCommit: () => void;
}

const baseInput =
  'w-full bg-transparent text-[13px] text-white/85 placeholder:text-white/25 ' +
  'outline-none focus:ring-1 focus:ring-[#c8a951]/50 rounded-md px-2 py-1.5 ' +
  'transition-colors hover:bg-white/[0.03] focus:bg-white/[0.05]';

export default function TrackerCell({
  column,
  value,
  warning,
  readOnly,
  onChange,
  onCommit,
}: TrackerCellProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const text = value ?? '';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
        onCommit();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        onCommit();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onCommit, open]);

  const ring = warning ? 'ring-1 ring-amber-400/40' : '';

  // ---- read-only rendering -------------------------------------------------
  if (readOnly) {
    if (column.kind === 'date') {
      return (
        <div className="px-2 py-1.5 text-[13px] text-white/70 tabular-nums">
          {formatHebrewDate(text)}
        </div>
      );
    }
    if (column.kind === 'url' && /^https?:\/\//i.test(text)) {
      return (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1.5 text-[13px] text-[#e8d48b] hover:underline truncate"
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{text}</span>
        </a>
      );
    }
    return (
      <div className="px-2 py-1.5 text-[13px] text-white/70 truncate" title={text}>
        {text}
      </div>
    );
  }

  // ---- long text -----------------------------------------------------------
  if (column.kind === 'longtext') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          title={text}
          className={cn(
            'group flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-right',
            'text-[13px] text-white/85 hover:bg-white/[0.04] transition-colors',
            ring,
          )}
        >
          <span className={cn('truncate flex-1', !text && 'text-white/25')}>
            {text || column.placeholder || '—'}
          </span>
          <Pencil className="w-3 h-3 shrink-0 text-white/20 group-hover:text-[#c8a951]" />
        </button>

        {open && (
          <div
            ref={popoverRef}
            className="absolute z-30 top-full mt-1 right-0 w-[min(420px,80vw)] rounded-xl border border-[#c8a951]/25 bg-[#0b1024] p-3 shadow-2xl"
          >
            <label className="block text-[11px] font-semibold text-[#c8a951] mb-2">
              {column.label}
            </label>
            <textarea
              autoFocus
              value={text}
              maxLength={column.maxLength}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  setOpen(false);
                  onCommit();
                }
              }}
              rows={6}
              className="w-full resize-y rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-[13px] text-white/85 outline-none focus:border-[#c8a951]/40"
              placeholder={column.placeholder}
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-white/35">
              <span>Ctrl+Enter לסגירה</span>
              <span className="tabular-nums">
                {text.length}/{column.maxLength}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- date ----------------------------------------------------------------
  if (column.kind === 'date') {
    return (
      <input
        type="date"
        value={text}
        onChange={(e) => onChange(e.target.value || null)}
        onBlur={onCommit}
        className={cn(baseInput, 'tabular-nums [color-scheme:dark]', ring)}
      />
    );
  }

  // ---- chip (free text with suggestions) -----------------------------------
  if (column.kind === 'chip') {
    const listId = `sug-${column.key}`;
    return (
      <>
        <input
          list={listId}
          value={text}
          maxLength={column.maxLength}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          placeholder={column.placeholder}
          className={cn(baseInput, ring)}
        />
        <datalist id={listId}>
          {(column.suggestions ?? []).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </>
    );
  }

  // ---- url + text ----------------------------------------------------------
  return (
    <div className="relative flex items-center">
      <input
        value={text}
        maxLength={column.maxLength}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        placeholder={column.placeholder}
        inputMode={column.key === 'phone' ? 'tel' : column.key === 'email' ? 'email' : 'text'}
        dir={column.kind === 'url' || column.key === 'email' ? 'ltr' : undefined}
        className={cn(
          baseInput,
          ring,
          (column.kind === 'url' || column.key === 'email' || column.key === 'phone') &&
            'text-left',
        )}
        title={warning || text}
      />
      {column.kind === 'url' && /^https?:\/\//i.test(text) && (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 px-1 text-[#c8a951]/70 hover:text-[#e8d48b]"
          aria-label="פתח קישור"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
