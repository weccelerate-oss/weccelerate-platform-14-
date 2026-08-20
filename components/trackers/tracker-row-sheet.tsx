'use client';

/**
 * Mobile edit sheet — every field of one row, stacked and labelled.
 * Overlay pattern follows app/(admin)/admin/events/event-form-dialog.tsx,
 * restyled for the dark portal.
 */

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import TrackerCell from '@/components/trackers/tracker-cell';
import { sanitizeRow, type DraftRow, type TrackerDefinition } from '@/lib/trackers/schema';

interface TrackerRowSheetProps {
  definition: TrackerDefinition;
  row: DraftRow | null;
  readOnly: boolean;
  onClose: () => void;
  onCell: (clientId: string, field: string, value: string | null) => void;
  onCommit: () => void;
  onDelete: (clientId: string) => void;
}

export default function TrackerRowSheet({
  definition,
  row,
  readOnly,
  onClose,
  onCell,
  onCommit,
  onDelete,
}: TrackerRowSheetProps) {
  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, row]);

  const warnings = row
    ? sanitizeRow(definition.slug, row as Record<string, unknown>).warnings
    : {};

  return (
    <AnimatePresence>
      {row && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="w-full max-h-[88dvh] overflow-y-auto rounded-t-3xl border-t border-white/[0.1] bg-[#0b1024] p-5 pb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                {readOnly ? 'פרטי שורה' : 'עריכת שורה'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="סגור"
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {definition.columns.map((col) => (
                <div key={col.key}>
                  <label className="block text-[12px] font-semibold text-[#c8a951] mb-1.5">
                    {col.label}
                  </label>
                  <div className="rounded-lg border border-white/10 bg-white/[0.03]">
                    <TrackerCell
                      column={col}
                      value={(row[col.key] as string | null) ?? ''}
                      warning={warnings[col.key]}
                      readOnly={readOnly}
                      onChange={(v) => onCell(row.clientId, col.key, v)}
                      onCommit={onCommit}
                    />
                  </div>
                  {warnings[col.key] && (
                    <p className="mt-1 text-[11px] text-amber-300/70">{warnings[col.key]}</p>
                  )}
                </div>
              ))}
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  onDelete(row.clientId);
                  onClose();
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                מחק שורה
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
