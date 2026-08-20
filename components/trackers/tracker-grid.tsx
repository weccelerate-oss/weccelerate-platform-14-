'use client';

/**
 * Desktop grid. CSS Grid rather than <table> — there is no <table> anywhere in
 * the portal and the column widths come from the schema.
 *
 * Three traps specific to this design system, all handled here:
 *
 *  1. The scroll container must NOT carry .wc-glass. That class sets
 *     overflow:hidden, which changes the sticky containing block and silently
 *     breaks both the sticky header and the sticky first column.
 *  2. The sticky column needs an OPAQUE background. Portal surfaces are
 *     bg-white/[0.03]; a translucent sticky cell shows other cells sliding
 *     underneath it.
 *  3. RTL + overflow-x-auto opens scrolled to the wrong end on iOS Safari.
 *     Same remedy the journey already uses for its chapter rail.
 */

import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import TrackerCell from '@/components/trackers/tracker-cell';
import { sanitizeRow, type TrackerDefinition, type DraftRow } from '@/lib/trackers/schema';

interface TrackerGridProps {
  definition: TrackerDefinition;
  rows: DraftRow[];
  readOnly: boolean;
  onCell: (clientId: string, field: string, value: string | null) => void;
  onCommit: () => void;
  onDelete: (clientId: string) => void;
  onMove: (clientId: string, direction: -1 | 1) => void;
  onDuplicate: (clientId: string) => void;
}

const ROW_ACTIONS_WIDTH = '104px';
const ROW_NUMBER_WIDTH = '52px';

export default function TrackerGrid({
  definition,
  rows,
  readOnly,
  onCell,
  onCommit,
  onDelete,
  onMove,
  onDuplicate,
}: TrackerGridProps) {
  const scroller = useRef<HTMLDivElement | null>(null);

  // Trap 3: land at the RTL origin on first paint.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
  }, []);

  const template = [
    definition.showRowNumber ? ROW_NUMBER_WIDTH : null,
    ...definition.columns.map((c) => c.width),
    readOnly ? null : ROW_ACTIONS_WIDTH,
  ]
    .filter(Boolean)
    .join(' ');

  const stickyCell =
    'sticky right-0 z-10 bg-[#0b1024] border-l border-white/[0.06]';

  return (
    // Trap 1: a plain wrapper, no .wc-glass.
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03]">
      <div ref={scroller} className="overflow-x-auto rounded-3xl">
        <div style={{ minWidth: 'max-content' }}>
          {/* Header */}
          <div
            className="sticky top-0 z-20 grid bg-[#0b1024]/95 backdrop-blur-sm border-b border-white/[0.08]"
            style={{ gridTemplateColumns: template }}
          >
            {definition.showRowNumber && (
              <div
                className={cn(
                  'px-2 py-3 text-[11px] font-bold text-white/40 text-center',
                  stickyCell,
                  'bg-[#0b1024]',
                )}
              >
                מס&apos;
              </div>
            )}
            {definition.columns.map((col, i) => (
              <div
                key={col.key}
                className={cn(
                  'px-3 py-3 text-[12px] font-bold text-[#e8d48b] whitespace-nowrap',
                  // Trap 2: the first column is sticky and must be opaque.
                  !definition.showRowNumber && i === 0 && stickyCell,
                )}
              >
                {col.label}
              </div>
            ))}
            {!readOnly && <div className="px-3 py-3" />}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.05]">
            {rows.map((row, index) => {
              const { warnings } = sanitizeRow(definition.slug, row as Record<string, unknown>);
              return (
                <div
                  key={row.clientId}
                  className="grid items-center hover:bg-white/[0.02] transition-colors"
                  style={{ gridTemplateColumns: template }}
                >
                  {definition.showRowNumber && (
                    <div
                      className={cn(
                        'px-2 py-1 text-[12px] text-white/30 text-center tabular-nums',
                        stickyCell,
                      )}
                    >
                      {index + 1}
                    </div>
                  )}

                  {definition.columns.map((col, i) => (
                    <div
                      key={col.key}
                      className={cn(
                        'px-1 py-1 min-w-0',
                        !definition.showRowNumber && i === 0 && stickyCell,
                      )}
                    >
                      <TrackerCell
                        column={col}
                        value={(row[col.key] as string | null) ?? ''}
                        warning={warnings[col.key]}
                        readOnly={readOnly}
                        onChange={(v) => onCell(row.clientId, col.key, v)}
                        onCommit={onCommit}
                      />
                    </div>
                  ))}

                  {!readOnly && (
                    <div className="flex items-center justify-end gap-0.5 px-2">
                      <button
                        type="button"
                        onClick={() => onMove(row.clientId, -1)}
                        disabled={index === 0}
                        aria-label="הזז למעלה"
                        className="p-1.5 rounded-md text-white/30 hover:text-[#e8d48b] hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(row.clientId, 1)}
                        disabled={index === rows.length - 1}
                        aria-label="הזז למטה"
                        className="p-1.5 rounded-md text-white/30 hover:text-[#e8d48b] hover:bg-white/[0.06] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicate(row.clientId)}
                        aria-label="שכפל שורה"
                        className="p-1.5 rounded-md text-white/30 hover:text-[#e8d48b] hover:bg-white/[0.06] transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row.clientId)}
                        aria-label="מחק שורה"
                        className="p-1.5 rounded-md text-white/30 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
