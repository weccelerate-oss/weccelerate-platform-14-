'use client';

/**
 * Mobile list. An 11-column grid is not rendered at all below md — each row
 * becomes a card showing only the mobilePriority: 1 fields, and tapping it
 * opens the full-field sheet.
 */

import { ChevronLeft } from 'lucide-react';
import { formatHebrewDate } from '@/lib/trackers/csv';
import type { DraftRow, TrackerDefinition } from '@/lib/trackers/schema';

interface TrackerCardsProps {
  definition: TrackerDefinition;
  rows: DraftRow[];
  onOpen: (clientId: string) => void;
}

export default function TrackerCards({ definition, rows, onOpen }: TrackerCardsProps) {
  const primary = definition.columns.filter((c) => c.mobilePriority === 1);
  const titleCol = primary[0] ?? definition.columns[0];
  const rest = primary.slice(1);

  return (
    <div className="space-y-3">
      {rows.map((row, index) => {
        const title = String(row[titleCol.key] ?? '').trim();
        return (
          <button
            key={row.clientId}
            type="button"
            onClick={() => onOpen(row.clientId)}
            className="wc-glass w-full rounded-2xl p-4 text-right"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {definition.showRowNumber && (
                    <span className="text-[11px] text-white/30 tabular-nums">{index + 1}</span>
                  )}
                  <span className="font-bold text-white/90 truncate">
                    {title || 'ללא שם'}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                  {rest.map((col) => {
                    const raw = row[col.key];
                    const text =
                      col.kind === 'date'
                        ? formatHebrewDate(raw as string | null)
                        : String(raw ?? '').trim();
                    if (!text) return null;
                    return col.kind === 'chip' ? (
                      <span
                        key={col.key}
                        className="rounded-full border border-[#c8a951]/30 bg-[#c8a951]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#e8d48b]"
                      >
                        {text}
                      </span>
                    ) : (
                      <span key={col.key} className="text-[12px] text-white/45">
                        {text}
                      </span>
                    );
                  })}
                </div>
              </div>

              <ChevronLeft className="w-4 h-4 shrink-0 text-white/25 mt-1" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
