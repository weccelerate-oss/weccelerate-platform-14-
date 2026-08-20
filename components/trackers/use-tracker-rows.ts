'use client';

/**
 * FOUNDER TRACKERS — row state, autosave and the beacon flush.
 *
 * Adapted from the journey's autosave (app/(portal)/portal/journey/journey-content.tsx),
 * with three deliberate changes:
 *
 *   1. 1.2s debounce, not 10s. Ten seconds of unsaved state in a spreadsheet
 *      feels like data loss waiting to happen.
 *   2. New rows flush immediately. That guarantees every row already holds a
 *      server id by the time a pagehide beacon fires — a beacon cannot read a
 *      response, so without this the clientId->id map is lost and the row
 *      duplicates on next load.
 *   3. The save status is visible. The journey saves silently by owner
 *      decision; a founder who just pasted 200 rows needs to see it land.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TRACKER_LIMITS,
  emptyRow,
  isRowEmpty,
  type DraftRow,
  type TrackerSlug,
} from '@/lib/trackers/schema';

const DEBOUNCE_MS = 1200;

export type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';

export interface UseTrackerRows {
  rows: DraftRow[];
  saveState: SaveState;
  savedAt: string | null;
  errorMessage: string | null;
  updateCell: (clientId: string, field: string, value: string | null) => void;
  addRow: () => void;
  deleteRow: (clientId: string) => void;
  undoDelete: () => void;
  pendingUndo: { clientId: string; label: string } | null;
  moveRow: (clientId: string, direction: -1 | 1) => void;
  duplicateRow: (clientId: string) => void;
  importRows: (incoming: Array<Record<string, string | null>>) => Promise<void>;
  importProgress: { done: number; total: number } | null;
  refresh: () => Promise<void>;
  flushNow: () => Promise<void>;
}

let counter = 0;
function nextClientId(): string {
  counter += 1;
  return `c${Date.now().toString(36)}-${counter}`;
}

function withClientIds(rows: Array<Record<string, unknown>>): DraftRow[] {
  return rows.map((r) => ({ ...(r as DraftRow), clientId: nextClientId() }));
}

export function useTrackerRows(
  slug: TrackerSlug,
  initialRows: Array<Record<string, unknown>>,
  initialVersion: string,
  readOnly: boolean,
): UseTrackerRows {
  const [rows, setRows] = useState<DraftRow[]>(() => withClientIds(initialRows));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [pendingUndo, setPendingUndo] = useState<{ clientId: string; label: string } | null>(null);

  /** clientIds whose values differ from the server. */
  const dirty = useRef<Set<string>>(new Set());
  /** server ids awaiting a soft delete. */
  const removals = useRef<Set<string>>(new Set());
  const rowsRef = useRef<DraftRow[]>(rows);
  const versionRef = useRef<string>(initialVersion);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const deletedStash = useRef<{ row: DraftRow; index: number } | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  rowsRef.current = rows;

  const endpoint = `/api/portal/trackers/${slug}`;

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------

  const buildPayload = useCallback(() => {
    const upserts = rowsRef.current
      .filter((r) => dirty.current.has(r.clientId))
      .filter((r) => r.id || !isRowEmpty(slug, r))
      .map((r, _i) => ({
        ...r,
        position: rowsRef.current.findIndex((x) => x.clientId === r.clientId),
      }));

    return {
      upserts,
      deletes: Array.from(removals.current),
      baseVersion: versionRef.current,
    };
  }, [slug]);

  const flushNow = useCallback(async () => {
    if (readOnly) return;
    if (inFlight.current) return;
    if (dirty.current.size === 0 && removals.current.size === 0) return;

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    const payload = buildPayload();
    if (payload.upserts.length === 0 && payload.deletes.length === 0) {
      dirty.current.clear();
      return;
    }

    // Claim this batch before awaiting, so edits made during the request are
    // recorded as a fresh dirty set rather than being lost.
    const claimed = new Set(payload.upserts.map((r) => r.clientId));
    claimed.forEach((id) => dirty.current.delete(id));
    const claimedDeletes = new Set(payload.deletes);
    claimedDeletes.forEach((id) => removals.current.delete(id));

    inFlight.current = true;
    setSaveState('saving');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setSaveState('conflict');
        setErrorMessage('הטבלה עודכנה במקום אחר');
        return;
      }
      if (!res.ok) {
        // Put the batch back so the next flush retries it.
        claimed.forEach((id) => dirty.current.add(id));
        claimedDeletes.forEach((id) => removals.current.add(id));
        const body = await res.json().catch(() => null);
        setSaveState('error');
        setErrorMessage(body?.error ?? 'השמירה נכשלה');
        return;
      }

      const body = await res.json();
      versionRef.current = body.serverVersion ?? versionRef.current;

      // Adopt server ids for rows that were created.
      if (Array.isArray(body.saved) && body.saved.length) {
        setRows((prev) =>
          prev.map((row) => {
            const hit = body.saved.find((s: any) => s.clientId === row.clientId);
            return hit ? { ...row, id: hit.id, updatedAt: hit.updatedAt } : row;
          }),
        );
      }

      setSaveState(dirty.current.size > 0 ? 'dirty' : 'saved');
      setSavedAt(
        new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      );
      setErrorMessage(null);
    } catch (err) {
      claimed.forEach((id) => dirty.current.add(id));
      claimedDeletes.forEach((id) => removals.current.add(id));
      setSaveState('error');
      setErrorMessage('אין חיבור — השינויים לא נשמרו');
    } finally {
      inFlight.current = false;
    }
  }, [buildPayload, endpoint, readOnly]);

  const schedule = useCallback(() => {
    if (readOnly) return;
    setSaveState('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flushNow();
    }, DEBOUNCE_MS);
  }, [flushNow, readOnly]);

  // ---------------------------------------------------------------------------
  // Page-hide flush
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (readOnly) return;

    const beaconFlush = () => {
      if (dirty.current.size === 0 && removals.current.size === 0) return;
      const payload = buildPayload();
      if (!payload.upserts.length && !payload.deletes.length) return;

      const body = JSON.stringify(payload);

      // sendBeacon silently returns false above ~64KB. Chunk, and check the
      // return value — this is the likeliest cause of a rare "my last edit
      // vanished" report.
      if (body.length <= TRACKER_LIMITS.maxBeaconBytes) {
        const ok = navigator.sendBeacon?.(
          endpoint,
          new Blob([body], { type: 'application/json' }),
        );
        if (ok) {
          dirty.current.clear();
          removals.current.clear();
        }
        return;
      }

      let chunk: typeof payload.upserts = [];
      let size = 0;
      const send = (rowsChunk: typeof payload.upserts, deletes: string[]) => {
        const b = JSON.stringify({ upserts: rowsChunk, deletes, baseVersion: '' });
        navigator.sendBeacon?.(endpoint, new Blob([b], { type: 'application/json' }));
      };

      for (const row of payload.upserts) {
        const rowSize = JSON.stringify(row).length;
        if (size + rowSize > TRACKER_LIMITS.maxBeaconBytes && chunk.length) {
          send(chunk, []);
          chunk = [];
          size = 0;
        }
        chunk.push(row);
        size += rowSize;
      }
      if (chunk.length || payload.deletes.length) send(chunk, payload.deletes);
      dirty.current.clear();
      removals.current.clear();
    };

    const onHide = () => beaconFlush();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') beaconFlush();
    };

    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [buildPayload, endpoint, readOnly]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  const markDirty = useCallback((clientId: string) => {
    dirty.current.add(clientId);
  }, []);

  const updateCell = useCallback(
    (clientId: string, field: string, value: string | null) => {
      if (readOnly) return;
      setRows((prev) =>
        prev.map((r) => (r.clientId === clientId ? { ...r, [field]: value } : r)),
      );
      markDirty(clientId);
      schedule();
    },
    [markDirty, readOnly, schedule],
  );

  const addRow = useCallback(() => {
    if (readOnly) return;
    const row = emptyRow(slug, rowsRef.current.length, nextClientId());
    setRows((prev) => [...prev, row]);
    markDirty(row.clientId);
    // Not flushed yet: an all-empty row is dropped server-side. It saves as
    // soon as the founder types anything into it.
    setSaveState('dirty');
  }, [markDirty, readOnly, slug]);

  const duplicateRow = useCallback(
    (clientId: string) => {
      if (readOnly) return;
      const source = rowsRef.current.find((r) => r.clientId === clientId);
      if (!source) return;
      const copy: DraftRow = { ...source, id: '', clientId: nextClientId(), updatedAt: '' };
      setRows((prev) => {
        const i = prev.findIndex((r) => r.clientId === clientId);
        const next = [...prev];
        next.splice(i + 1, 0, copy);
        return next;
      });
      markDirty(copy.clientId);
      void flushNow();
    },
    [flushNow, markDirty, readOnly],
  );

  const deleteRow = useCallback(
    (clientId: string) => {
      if (readOnly) return;
      const index = rowsRef.current.findIndex((r) => r.clientId === clientId);
      if (index < 0) return;
      const row = rowsRef.current[index];

      deletedStash.current = { row, index };
      setRows((prev) => prev.filter((r) => r.clientId !== clientId));
      dirty.current.delete(clientId);

      const label =
        String(row.contactName ?? row.companyName ?? '').trim() || 'שורה';
      setPendingUndo({ clientId, label });

      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => {
        // The undo window closed — now it is safe to tell the server.
        if (row.id) removals.current.add(row.id);
        deletedStash.current = null;
        setPendingUndo(null);
        void flushNow();
      }, 8000);
    },
    [flushNow, readOnly],
  );

  const undoDelete = useCallback(() => {
    const stash = deletedStash.current;
    if (!stash) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setRows((prev) => {
      const next = [...prev];
      next.splice(Math.min(stash.index, next.length), 0, stash.row);
      return next;
    });
    markDirty(stash.row.clientId);
    deletedStash.current = null;
    setPendingUndo(null);
    schedule();
  }, [markDirty, schedule]);

  const moveRow = useCallback(
    (clientId: string, direction: -1 | 1) => {
      if (readOnly) return;
      setRows((prev) => {
        const i = prev.findIndex((r) => r.clientId === clientId);
        const j = i + direction;
        if (i < 0 || j < 0 || j >= prev.length) return prev;
        const next = [...prev];
        [next[i], next[j]] = [next[j], next[i]];
        // Position is derived from array order, so both moved rows are dirty.
        markDirty(next[i].clientId);
        markDirty(next[j].clientId);
        return next;
      });
      void flushNow();
    },
    [flushNow, markDirty, readOnly],
  );

  // ---------------------------------------------------------------------------
  // Import — chunked through the same endpoint
  // ---------------------------------------------------------------------------

  const importRows = useCallback(
    async (incoming: Array<Record<string, string | null>>) => {
      if (readOnly || incoming.length === 0) return;

      const base = rowsRef.current.length;
      const drafts: DraftRow[] = incoming.map((values, i) => ({
        ...(emptyRow(slug, base + i, nextClientId()) as DraftRow),
        ...values,
      })) as DraftRow[];

      setRows((prev) => [...prev, ...drafts]);
      setImportProgress({ done: 0, total: drafts.length });
      setSaveState('saving');

      const size = TRACKER_LIMITS.importChunkSize;
      try {
        for (let i = 0; i < drafts.length; i += size) {
          const chunk = drafts.slice(i, i + size).map((row, k) => ({
            ...row,
            position: base + i + k,
          }));

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // No baseVersion: an import intentionally appends on top of
            // whatever is there rather than failing on a stale token.
            body: JSON.stringify({ upserts: chunk, deletes: [], baseVersion: '' }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => null);
            setSaveState('error');
            setErrorMessage(body?.error ?? 'הייבוא נכשל');
            setImportProgress(null);
            return;
          }

          const body = await res.json();
          versionRef.current = body.serverVersion ?? versionRef.current;
          if (Array.isArray(body.saved) && body.saved.length) {
            setRows((prev) =>
              prev.map((row) => {
                const hit = body.saved.find((s: any) => s.clientId === row.clientId);
                return hit ? { ...row, id: hit.id, updatedAt: hit.updatedAt } : row;
              }),
            );
          }

          setImportProgress({ done: Math.min(i + size, drafts.length), total: drafts.length });
        }

        setSaveState('saved');
        setSavedAt(
          new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        );
      } finally {
        setImportProgress(null);
      }
    },
    [endpoint, readOnly, slug],
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(endpoint, { method: 'GET' });
      if (!res.ok) return;
      const body = await res.json();
      dirty.current.clear();
      removals.current.clear();
      versionRef.current = body.version ?? '';
      setRows(withClientIds(body.rows ?? []));
      setSaveState('idle');
      setErrorMessage(null);
    } catch {
      /* leave the grid as-is; the status pill already shows the problem */
    }
  }, [endpoint]);

  return useMemo(
    () => ({
      rows,
      saveState,
      savedAt,
      errorMessage,
      updateCell,
      addRow,
      deleteRow,
      undoDelete,
      pendingUndo,
      moveRow,
      duplicateRow,
      importRows,
      importProgress,
      refresh,
      flushNow,
    }),
    [
      rows,
      saveState,
      savedAt,
      errorMessage,
      updateCell,
      addRow,
      deleteRow,
      undoDelete,
      pendingUndo,
      moveRow,
      duplicateRow,
      importRows,
      importProgress,
      refresh,
      flushNow,
    ],
  );
}
