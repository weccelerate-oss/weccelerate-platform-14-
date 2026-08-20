'use client';

/**
 * One labelled field inside the editor panel.
 *
 * This is the roomy counterpart to the old grid cell: full-width input, real
 * label, and — for chip fields — one-click values so status and relevance never
 * have to be typed.
 */

import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrackerColumn } from '@/lib/trackers/schema';

interface TrackerFieldProps {
  column: TrackerColumn;
  value: string | null;
  warning?: string;
  readOnly: boolean;
  autoFocus?: boolean;
  onChange: (value: string | null) => void;
}

const inputBase =
  'w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-white/90 ' +
  'placeholder:text-white/25 outline-none transition-colors ' +
  'focus:border-[#c8a951]/50 focus:bg-white/[0.05]';

export default function TrackerField({
  column,
  value,
  warning,
  readOnly,
  autoFocus,
  onChange,
}: TrackerFieldProps) {
  const text = value ?? '';
  const border = warning ? 'border-amber-400/40' : 'border-white/10';

  const isLtr = column.kind === 'url' || column.key === 'email' || column.key === 'phone';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-[12.5px] font-semibold text-[#c8a951]">{column.label}</label>
        {column.kind === 'url' && /^https?:\/\//i.test(text) && (
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11.5px] text-[#e8d48b] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            פתח
          </a>
        )}
      </div>

      {readOnly ? (
        <div
          className={cn(
            'rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-[14px]',
            text ? 'text-white/80' : 'text-white/25',
            column.kind === 'longtext' && 'whitespace-pre-wrap',
            isLtr && 'text-left',
          )}
          dir={isLtr ? 'ltr' : undefined}
        >
          {text || '—'}
        </div>
      ) : column.kind === 'longtext' ? (
        <textarea
          value={text}
          rows={5}
          maxLength={column.maxLength}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={column.placeholder}
          className={cn(inputBase, border, 'resize-y leading-relaxed')}
        />
      ) : column.kind === 'date' ? (
        <input
          type="date"
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value || null)}
          className={cn(inputBase, border, 'tabular-nums [color-scheme:dark]')}
        />
      ) : column.kind === 'chip' ? (
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(column.suggestions ?? []).map((s) => {
              const active = text === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChange(active ? '' : s)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
                    active
                      ? 'bg-gradient-to-l from-[#c8a951] to-[#e8d48b] text-[#1d1704]'
                      : 'border border-white/[0.12] text-white/55 hover:border-[#c8a951]/40 hover:text-white/80',
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <input
            value={text}
            maxLength={column.maxLength}
            autoFocus={autoFocus}
            onChange={(e) => onChange(e.target.value)}
            placeholder="או הקלידו ערך משלכם"
            className={cn(inputBase, border, 'text-[13px]')}
          />
        </div>
      ) : (
        <input
          value={text}
          maxLength={column.maxLength}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          placeholder={column.placeholder}
          inputMode={column.key === 'phone' ? 'tel' : column.key === 'email' ? 'email' : 'text'}
          dir={isLtr ? 'ltr' : undefined}
          className={cn(inputBase, border, isLtr && 'text-left')}
        />
      )}

      {warning && <p className="mt-1.5 text-[11.5px] text-amber-300/75">{warning}</p>}
    </div>
  );
}
