'use client';

/**
 * Import: paste or upload -> map columns -> preview -> apply.
 *
 * The mapping step is what actually solves column-order mismatch, and the
 * preview is what lets a human catch a dd/mm inversion before it becomes 200
 * wrong dates. Neither is optional.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, FileUp, Loader2, X } from 'lucide-react';
import {
  decodeFileBytes,
  detectDelimiter,
  formatHebrewDate,
  isRowNumberHeader,
  looksLikeHeader,
  matchHeaders,
  parseDelimited,
  parseHebrewDate,
  type DecodedEncoding,
} from '@/lib/trackers/csv';
import { rowDedupeKey, type DraftRow, type TrackerDefinition } from '@/lib/trackers/schema';

type DuplicateMode = 'skip' | 'add' | 'merge';

interface ImportDialogProps {
  open: boolean;
  definition: TrackerDefinition;
  existingRows: DraftRow[];
  onClose: () => void;
  onApply: (rows: Array<Record<string, string | null>>) => Promise<void>;
  onMerge: (updates: Array<{ clientId: string; values: Record<string, string | null> }>) => void;
}

const ENCODINGS: Array<{ value: DecodedEncoding | 'auto'; label: string }> = [
  { value: 'auto', label: 'זיהוי אוטומטי' },
  { value: 'utf-8', label: 'UTF-8' },
  { value: 'windows-1255', label: 'Windows-1255 (עברית)' },
  { value: 'utf-16le', label: 'UTF-16' },
];

export default function ImportDialog({
  open,
  definition,
  existingRows,
  onClose,
  onApply,
  onMerge,
}: ImportDialogProps) {
  const [raw, setRaw] = useState('');
  const [grid, setGrid] = useState<string[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [sawRowNumber, setSawRowNumber] = useState(false);
  const [encoding, setEncoding] = useState<DecodedEncoding | 'auto'>('auto');
  const [detected, setDetected] = useState<string | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>('skip');
  const [busy, setBusy] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const reset = useCallback(() => {
    setRaw('');
    setGrid([]);
    setMapping({});
    setSawRowNumber(false);
    setDetected(null);
    setFileError(null);
    setDuplicateMode('skip');
  }, []);

  const ingest = useCallback(
    (text: string) => {
      const delimiter = detectDelimiter(text);
      const parsed = parseDelimited(text, delimiter);
      if (!parsed.length) {
        setFileError('לא נמצאו שורות');
        return;
      }
      const match = matchHeaders(parsed[0], definition.slug);
      const header = looksLikeHeader(match);

      setGrid(parsed);
      setHasHeader(header);
      setSawRowNumber(match.sawRowNumber);
      setFileError(null);

      if (header) {
        setMapping(match.mapping);
      } else {
        // No header — fall back to positional order, skipping a leading
        // row-number column if one is obviously there.
        const offset = definition.showRowNumber && isRowNumberHeader(parsed[0][0]) ? 1 : 0;
        const positional: Record<string, number> = {};
        definition.columns.forEach((col, i) => {
          positional[col.key] = i + offset < parsed[0].length ? i + offset : -1;
        });
        setMapping(positional);
      }
    },
    [definition],
  );

  const onPaste = useCallback(
    (text: string) => {
      setRaw(text);
      if (text.trim()) ingest(text);
      else setGrid([]);
    },
    [ingest],
  );

  const onFile = useCallback(
    async (file: File) => {
      setFileError(null);
      if (/\.xlsx?$/i.test(file.name) && !/\.csv$/i.test(file.name)) {
        setFileError(
          'קובץ אקסל (.xlsx) לא נתמך. סמנו את הטבלה באקסל, Ctrl+C, והדביקו כאן — או שמרו כ-CSV UTF-8.',
        );
        return;
      }
      const buffer = await file.arrayBuffer();
      const decoded = decodeFileBytes(buffer, encoding === 'auto' ? undefined : encoding);
      setDetected(decoded.encoding + (decoded.guessed ? ' (משוער)' : ''));
      setRaw(decoded.text);
      ingest(decoded.text);
    },
    [encoding, ingest],
  );

  // ---------------------------------------------------------------------------
  // Mapped preview
  // ---------------------------------------------------------------------------

  const mapped = useMemo(() => {
    const body = hasHeader ? grid.slice(1) : grid;
    const warnings: string[] = [];
    let badDates = 0;
    let blanks = 0;

    const rows = body
      .map((cells) => {
        const out: Record<string, string | null> = {};
        let anything = false;

        for (const col of definition.columns) {
          const idx = mapping[col.key];
          const cell = idx >= 0 ? (cells[idx] ?? '') : '';
          if (col.kind === 'date') {
            const iso = parseHebrewDate(cell);
            if (cell.trim() && !iso) badDates++;
            out[col.key] = iso;
            if (iso) anything = true;
          } else {
            const v = cell.trim();
            out[col.key] = v;
            if (v) anything = true;
          }
        }

        if (!anything) {
          blanks++;
          return null;
        }
        return out;
      })
      .filter(Boolean) as Array<Record<string, string | null>>;

    if (sawRowNumber) warnings.push("עמודת „מס'” תתעלם — המספור מתעדכן אוטומטית");
    if (badDates) warnings.push(`${badDates} תאריכים לא זוהו — יישארו ריקים`);
    if (blanks) warnings.push(`${blanks} שורות ריקות ידולגו`);

    const ragged = body.some((r) => r.length !== (grid[0]?.length ?? 0));
    if (ragged) warnings.push('חלק מהשורות באורך שונה — בדקו את המיפוי');

    // Duplicate detection against existing rows and within the batch.
    const existingKeys = new Map<string, DraftRow>();
    for (const r of existingRows) {
      const k = rowDedupeKey(definition.slug, r as Record<string, unknown>);
      if (k) existingKeys.set(k, r);
    }

    const seen = new Set<string>();
    const fresh: Array<Record<string, string | null>> = [];
    const dupes: Array<{ values: Record<string, string | null>; existing: DraftRow }> = [];

    for (const row of rows) {
      const key = rowDedupeKey(definition.slug, row);
      const hit = key ? existingKeys.get(key) : undefined;
      if (hit || (key && seen.has(key))) {
        if (hit) dupes.push({ values: row, existing: hit });
        continue;
      }
      if (key) seen.add(key);
      fresh.push(row);
    }

    return { rows, fresh, dupes, warnings };
  }, [definition, existingRows, grid, hasHeader, mapping, sawRowNumber]);

  const apply = useCallback(async () => {
    setBusy(true);
    try {
      if (duplicateMode === 'add') {
        await onApply(mapped.rows);
      } else {
        if (duplicateMode === 'merge' && mapped.dupes.length) {
          // Fill empty fields only. Never let an imported blank overwrite a
          // value the founder typed — that is the classic merge trap.
          onMerge(
            mapped.dupes.map(({ values, existing }) => {
              const patch: Record<string, string | null> = {};
              for (const col of definition.columns) {
                const incoming = values[col.key];
                const current = existing[col.key];
                const currentEmpty =
                  current === null || current === undefined || String(current).trim() === '';
                if (currentEmpty && incoming) patch[col.key] = incoming;
              }
              return { clientId: existing.clientId, values: patch };
            }),
          );
        }
        await onApply(mapped.fresh);
      }
      reset();
      onClose();
    } finally {
      setBusy(false);
    }
  }, [definition, duplicateMode, mapped, onApply, onClose, onMerge, reset]);

  const willAdd = duplicateMode === 'add' ? mapped.rows.length : mapped.fresh.length;
  const sourceHeaders = grid[0] ?? [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="w-full max-w-3xl max-h-[88dvh] overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#0b1024] p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">ייבוא מאקסל</h3>
                <p className="text-[13px] text-white/45 mt-1">
                  סמנו את הטבלה באקסל, Ctrl+C, והדביקו כאן — או העלו קובץ CSV
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="סגור"
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1 — source */}
            <textarea
              value={raw}
              onChange={(e) => onPaste(e.target.value)}
              rows={grid.length ? 3 : 7}
              dir="ltr"
              placeholder="הדביקו כאן…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[12px] text-white/80 outline-none focus:border-[#c8a951]/40 font-mono"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] px-3.5 py-2 text-[13px] font-semibold text-white/70 hover:border-[#c8a951]/40 hover:text-white transition-colors"
              >
                <FileUp className="w-3.5 h-3.5" />
                העלאת קובץ CSV
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                  e.target.value = '';
                }}
              />

              <label className="flex items-center gap-2 text-[12px] text-white/40">
                קידוד
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value as DecodedEncoding | 'auto')}
                  className="rounded-lg border border-white/10 bg-[#0b1024] px-2 py-1 text-[12px] text-white/70"
                >
                  {ENCODINGS.map((e2) => (
                    <option key={e2.value} value={e2.value}>
                      {e2.label}
                    </option>
                  ))}
                </select>
              </label>

              {detected && <span className="text-[12px] text-white/30">זוהה: {detected}</span>}
            </div>

            {fileError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] p-3 text-[13px] text-amber-200/90">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {fileError}
              </div>
            )}

            {grid.length > 0 && (
              <>
                {/* Step 2 — mapping */}
                <div className="mt-6">
                  <h4 className="text-[13px] font-bold text-[#e8d48b] mb-3">התאמת עמודות</h4>
                  <label className="mb-3 flex items-center gap-2 text-[12px] text-white/50">
                    <input
                      type="checkbox"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                      className="accent-[#c8a951]"
                    />
                    השורה הראשונה היא כותרות
                  </label>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {definition.columns.map((col) => (
                      <div key={col.key} className="flex items-center gap-2">
                        <span className="w-32 shrink-0 text-[12px] text-white/60 truncate">
                          {col.label}
                        </span>
                        <select
                          value={mapping[col.key] ?? -1}
                          onChange={(e) =>
                            setMapping((m) => ({ ...m, [col.key]: Number(e.target.value) }))
                          }
                          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-[#0b1024] px-2 py-1.5 text-[12px] text-white/75"
                        >
                          <option value={-1}>— התעלם —</option>
                          {sourceHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              {hasHeader ? h || `עמודה ${i + 1}` : `עמודה ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {mapped.warnings.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {mapped.warnings.map((w) => (
                      <li
                        key={w}
                        className="flex items-start gap-2 text-[12px] text-amber-200/80"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Duplicates */}
                {mapped.dupes.length > 0 && (
                  <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-[13px] font-semibold text-white/75 mb-2.5">
                      נמצאו {mapped.dupes.length} שורות שכבר קיימות
                    </p>
                    <div className="space-y-2">
                      {(
                        [
                          ['skip', 'דלג על כפילויות'],
                          ['merge', 'עדכן שורות קיימות (רק שדות ריקים)'],
                          ['add', 'הוסף הכל בכל זאת'],
                        ] as Array<[DuplicateMode, string]>
                      ).map(([mode, label]) => (
                        <label key={mode} className="flex items-center gap-2 text-[12px] text-white/60">
                          <input
                            type="radio"
                            checked={duplicateMode === mode}
                            onChange={() => setDuplicateMode(mode)}
                            className="accent-[#c8a951]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3 — preview */}
                <div className="mt-6">
                  <h4 className="text-[13px] font-bold text-[#e8d48b] mb-3">
                    תצוגה מקדימה (10 ראשונות)
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                          {definition.columns.map((c) => (
                            <th
                              key={c.key}
                              className="px-2.5 py-2 text-right font-semibold text-white/50 whitespace-nowrap"
                            >
                              {c.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {mapped.rows.slice(0, 10).map((row, i) => (
                          <tr key={i}>
                            {definition.columns.map((c) => (
                              <td
                                key={c.key}
                                className="px-2.5 py-1.5 text-white/70 max-w-[160px] truncate"
                              >
                                {c.kind === 'date'
                                  ? formatHebrewDate(row[c.key])
                                  : row[c.key] || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-[12px] text-white/40">
                    {mapped.rows.length} שורות זוהו
                  </span>
                  <button
                    type="button"
                    onClick={apply}
                    disabled={busy || willAdd === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#c8a951] to-[#e8d48b] px-5 py-2.5 text-[13px] font-bold text-[#1d1704] hover:brightness-105 transition disabled:opacity-40"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowLeft className="w-4 h-4" />
                    )}
                    ייבא {willAdd} שורות
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
