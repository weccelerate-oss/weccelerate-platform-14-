'use client';

/**
 * The tracker screen: state, toolbar, responsive grid/cards, import, print.
 * Serves both the founder (readOnly=false) and the advisor/admin read-only view.
 */

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Plus, Undo2, Upload } from 'lucide-react';
import { useTrackerRows } from '@/components/trackers/use-tracker-rows';
import TrackerToolbar from '@/components/trackers/tracker-toolbar';
import TrackerGrid from '@/components/trackers/tracker-grid';
import TrackerCards from '@/components/trackers/tracker-cards';
import TrackerRowSheet from '@/components/trackers/tracker-row-sheet';
import ImportDialog from '@/components/trackers/import-dialog';
import { csvFilename, toCsv, toTsv } from '@/lib/trackers/csv';
import { TRACKERS, sanitizeRow, type TrackerSlug } from '@/lib/trackers/schema';

interface TrackerScreenProps {
  slug: TrackerSlug;
  initialRows: Array<Record<string, unknown>>;
  initialVersion: string;
  readOnly?: boolean;
  /** Shown in the read-only banner. */
  ownerName?: string | null;
}

export default function TrackerScreen({
  slug,
  initialRows,
  initialVersion,
  readOnly = false,
  ownerName,
}: TrackerScreenProps) {
  const definition = TRACKERS[slug];
  const state = useTrackerRows(slug, initialRows, initialVersion, readOnly);

  const [search, setSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const visibleRows = useMemo(() => {
    const q = search.trim().normalize('NFC').toLowerCase();
    if (!q) return state.rows;
    return state.rows.filter((row) =>
      definition.columns
        .map((c) => String(row[c.key] ?? ''))
        .join(' ')
        .normalize('NFC')
        .toLowerCase()
        .includes(q),
    );
  }, [definition.columns, search, state.rows]);

  const warningCount = useMemo(
    () =>
      state.rows.reduce(
        (sum, row) =>
          sum + Object.keys(sanitizeRow(slug, row as Record<string, unknown>).warnings).length,
        0,
      ),
    [slug, state.rows],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv(state.rows as Array<Record<string, unknown>>, slug);
    const today = new Date().toISOString().slice(0, 10);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvFilename(slug, today);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [slug, state.rows]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        toTsv(state.rows as Array<Record<string, unknown>>, slug),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the CSV button still works */
    }
  }, [slug, state.rows]);

  const handleMerge = useCallback(
    (updates: Array<{ clientId: string; values: Record<string, string | null> }>) => {
      for (const u of updates) {
        for (const [field, value] of Object.entries(u.values)) {
          state.updateCell(u.clientId, field, value);
        }
      }
    },
    [state],
  );

  const sheetRow = sheetId ? state.rows.find((r) => r.clientId === sheetId) ?? null : null;

  return (
    <div>
      {readOnly && (
        <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-[#c8a951]/25 bg-[#c8a951]/[0.06] px-4 py-3 print:hidden">
          <Eye className="w-4 h-4 text-[#c8a951]" />
          <span className="text-[13px] text-white/75">
            צפייה בלבד — הנתונים של {ownerName || 'היזם'}
          </span>
        </div>
      )}

      <TrackerToolbar
        readOnly={readOnly}
        rowCount={state.rows.length}
        warningCount={warningCount}
        search={search}
        onSearch={setSearch}
        onAdd={state.addRow}
        onImport={() => setImportOpen(true)}
        onExport={handleExport}
        onCopy={handleCopy}
        onPrint={() => window.print()}
        onRefresh={() => void state.refresh()}
        saveState={state.saveState}
        savedAt={state.savedAt}
        errorMessage={state.errorMessage}
        importProgress={state.importProgress}
        copied={copied}
      />

      {state.rows.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] py-16 text-center">
          <p className="text-white/50 mb-5">{definition.emptyHint}</p>
          {!readOnly && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={state.addRow}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] px-5 py-2.5 text-[13px] font-bold text-[#1d1704] hover:brightness-105 transition"
              >
                <Plus className="w-4 h-4" />
                הוסיפו שורה ראשונה
              </button>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] px-5 py-2.5 text-[13px] font-semibold text-white/70 hover:border-[#c8a951]/40 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
                ייבוא מאקסל
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <TrackerGrid
              definition={definition}
              rows={visibleRows}
              readOnly={readOnly}
              onCell={state.updateCell}
              onCommit={() => void state.flushNow()}
              onDelete={state.deleteRow}
              onMove={state.moveRow}
              onDuplicate={state.duplicateRow}
            />
          </div>
          <div className="md:hidden">
            <TrackerCards
              definition={definition}
              rows={visibleRows}
              onOpen={setSheetId}
            />
          </div>
        </>
      )}

      {search && visibleRows.length === 0 && state.rows.length > 0 && (
        <p className="mt-5 text-center text-[13px] text-white/40">לא נמצאו תוצאות ל&quot;{search}&quot;</p>
      )}

      {/* Undo strip — what makes the soft delete visible to the founder. */}
      <AnimatePresence>
        {state.pendingUndo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 rounded-xl border border-white/[0.12] bg-[#0b1024] px-4 py-3 shadow-2xl print:hidden"
          >
            <span className="text-[13px] text-white/70">
              „{state.pendingUndo.label}” נמחקה
            </span>
            <button
              type="button"
              onClick={state.undoDelete}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#e8d48b] hover:underline"
            >
              <Undo2 className="w-3.5 h-3.5" />
              בטל
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <TrackerRowSheet
        definition={definition}
        row={sheetRow}
        readOnly={readOnly}
        onClose={() => setSheetId(null)}
        onCell={state.updateCell}
        onCommit={() => void state.flushNow()}
        onDelete={state.deleteRow}
      />

      <ImportDialog
        open={importOpen}
        definition={definition}
        existingRows={state.rows}
        onClose={() => setImportOpen(false)}
        onApply={state.importRows}
        onMerge={handleMerge}
      />
    </div>
  );
}
