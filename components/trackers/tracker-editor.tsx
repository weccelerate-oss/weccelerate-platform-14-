'use client';

/**
 * The editor panel — a side drawer on desktop, a bottom sheet on phones.
 *
 * This replaces cell-by-cell typing in a grid. One record at a time, every
 * field labelled and full width, chips for status and relevance so the two
 * most-repeated values are one click rather than typing.
 *
 * "שמור והוסף עוד" is the point of the whole thing: after a morning of calls a
 * founder enters several records in a row, and re-opening the panel each time
 * is the friction that makes people go back to Excel.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Trash2, X } from 'lucide-react';
import TrackerField from '@/components/trackers/tracker-field';
import { sanitizeRow, type DraftRow, type TrackerDefinition } from '@/lib/trackers/schema';

interface TrackerEditorProps {
  definition: TrackerDefinition;
  row: DraftRow | null;
  readOnly: boolean;
  onClose: () => void;
  onCell: (clientId: string, field: string, value: string | null) => void;
  onCommit: () => void;
  onDelete: (clientId: string) => void;
  onSaveAndNew: () => void;
}

export default function TrackerEditor({
  definition,
  row,
  readOnly,
  onClose,
  onCell,
  onCommit,
  onDelete,
  onSaveAndNew,
}: TrackerEditorProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [row?.clientId]);

  useEffect(() => {
    if (!row) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCommit();
        onClose();
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        onCommit();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onCommit, row]);

  const warnings = row
    ? sanitizeRow(definition.slug, row as Record<string, unknown>).warnings
    : {};

  const title = row
    ? String(row[definition.columns[0].key] ?? '').trim() ||
      (definition.slug === 'calls' ? 'שיחה חדשה' : 'פנייה חדשה')
    : '';

  return (
    <AnimatePresence>
      {row && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end sm:items-stretch sm:justify-start bg-black/70 backdrop-blur-sm"
          onClick={() => {
            onCommit();
            onClose();
          }}
        >
          <motion.div
            // Bottom sheet on phones, left-edge drawer on desktop (RTL page, so
            // the drawer slides in from the physical left).
            initial={{ y: '100%', x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="w-full sm:w-[460px] max-h-[88dvh] sm:max-h-none sm:h-full overflow-y-auto rounded-t-3xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-white/[0.1] bg-[#0b1024] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0b1024] px-5 py-4">
              <h3 className="text-[17px] font-bold text-white truncate">
                {readOnly ? title : title}
              </h3>
              <button
                type="button"
                onClick={() => {
                  onCommit();
                  onClose();
                }}
                aria-label="סגור"
                className="shrink-0 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              {definition.columns.map((col, i) => (
                <TrackerField
                  key={col.key}
                  column={col}
                  value={(row[col.key] as string | null) ?? ''}
                  warning={warnings[col.key]}
                  readOnly={readOnly}
                  autoFocus={i === 0 && !readOnly && !String(row[col.key] ?? '').trim()}
                  onChange={(v) => onCell(row.clientId, col.key, v)}
                />
              ))}
            </div>

            {!readOnly && (
              <div className="sticky bottom-0 border-t border-white/[0.07] bg-[#0b1024] px-5 py-4 space-y-2.5">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onCommit();
                      onClose();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] px-4 py-3 text-[14px] font-bold text-[#1d1704] hover:brightness-105 transition"
                  >
                    <Check className="w-4 h-4" />
                    שמור וסגור
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onCommit();
                      onSaveAndNew();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c8a951]/40 px-4 py-3 text-[14px] font-semibold text-[#e8d48b] hover:bg-[#c8a951]/10 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    שמור והוסף עוד
                  </button>
                </div>

                {confirmDelete ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(row.clientId);
                        onClose();
                      }}
                      className="flex-1 rounded-xl bg-red-500/15 border border-red-500/40 py-2.5 text-[13px] font-bold text-red-200 hover:bg-red-500/25 transition-colors"
                    >
                      כן, מחק
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-xl border border-white/[0.12] py-2.5 text-[13px] font-semibold text-white/60 hover:text-white transition-colors"
                    >
                      ביטול
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] py-2.5 text-[13px] font-semibold text-white/45 hover:text-red-300 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    מחיקה
                  </button>
                )}

                <p className="text-center text-[11px] text-white/25">
                  נשמר אוטומטית · Ctrl+Enter לסגירה
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
