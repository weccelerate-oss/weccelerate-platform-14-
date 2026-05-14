/**
 * דוד's 14-day forecast.
 *
 * The cron is deterministic — for any future date we know:
 *   1. Which weekday plan will run (from daily-plan.ts).
 *   2. Which probe queries will be due (from each query's cadenceDays vs its
 *      last-asked timestamp). We simulate forward day-by-day, "consuming"
 *      a query's next-due date so the same query doesn't appear twice.
 *   3. Which open ContentGaps are available to write (those NOT already
 *      covered in the trailing 30 days, sorted by severity). We "consume"
 *      one gap per writing day, capped at the actual queue size.
 *
 * This file is pure — no DB writes, no API calls. Server-side, called once
 * per page load on /admin/bot-analytics.
 */

import { PROBE_QUERIES, type ProbeQuery } from '@/lib/seo/geo-probes';
import { planForToday, type Weekday } from './daily-plan';

const DAY_MS = 86_400_000;
const FORECAST_DAYS = 14;
const MAX_PROBES_PER_DAY = 24; // matches geo-probes.ts MAX_QUERIES default

export interface ForecastDay {
  date: string;            // YYYY-MM-DD
  weekday: Weekday;
  label: string;
  description: string;
  shouldWrite: boolean;
  shouldImprove: boolean;
  /** Probe queries due on this day (already cadence-aware, capped at MAX_PROBES_PER_DAY). */
  scheduledProbes: Array<{
    query: string;
    category: ProbeQuery['category'];
    cadenceDays: number;
    /** "fresh" = never asked before. */
    lastAskedDays: number | 'fresh';
  }>;
  /** What David is expected to write today, from the current open queue. */
  plannedWrite: { query: string; severity: number; category: string | null } | null;
  notes: string[];
}

export interface QuerySchedule {
  query: string;
  category: ProbeQuery['category'];
  cadenceDays: number;
  lastAskedAt: Date | null;
  /** Next date we'll re-ask this query (per cadence). */
  nextDueAt: Date;
  daysUntilNextAsk: number;
}

export interface ForecastInput {
  /** Latest probe timestamp per (provider, query). Provider is collapsed —
   * we forecast a single shared schedule across providers. */
  lastAskedByQuery: Map<string, Date>;
  /** Open content gaps, sorted desc by severity (writer's order). */
  openGaps: Array<{ id: string; query: string; severity: number; category: string | null }>;
  /** Topics already written in the last 30 days; the writer will skip them. */
  recentlyCoveredQueries: Set<string>;
  /** "Now" — defaults to current time, parametrized for tests. */
  now?: Date;
}

/**
 * Build the full 14-day forecast. Pure function.
 */
export function buildForecast(input: ForecastInput): {
  days: ForecastDay[];
  perQuerySchedule: QuerySchedule[];
} {
  const now = input.now ?? new Date();
  const todayStart = startOfDay(now);

  // --- Probe scheduling: walk each query forward, find its first due date.
  // Then keep walking to find subsequent dates within the 14-day window.
  const probeAssignments = new Map<string, Array<{ query: ProbeQuery; lastAskedDays: number | 'fresh' }>>();
  // dayKey → list of queries scheduled that day

  for (const q of PROBE_QUERIES) {
    const lastAt = input.lastAskedByQuery.get(q.query);
    let nextDueDate: Date;
    if (!lastAt) {
      // Never asked → due immediately (today).
      nextDueDate = todayStart;
    } else {
      const dueMs = lastAt.getTime() + q.cadenceDays * DAY_MS;
      nextDueDate = new Date(Math.max(dueMs, todayStart.getTime()));
      nextDueDate = startOfDay(nextDueDate);
    }

    // Walk forward and place this query on every cadence anniversary inside
    // the 14-day window.
    let cursor = nextDueDate;
    while (cursor.getTime() < todayStart.getTime() + FORECAST_DAYS * DAY_MS) {
      const key = isoDate(cursor);
      const ageDays = lastAt
        ? Math.floor((cursor.getTime() - lastAt.getTime()) / DAY_MS)
        : null;
      const list = probeAssignments.get(key) ?? [];
      list.push({
        query: q,
        lastAskedDays: ageDays === null ? 'fresh' : ageDays,
      });
      probeAssignments.set(key, list);
      cursor = new Date(cursor.getTime() + q.cadenceDays * DAY_MS);
    }
  }

  // --- Writing schedule: simulate gap consumption across writing days.
  const writableGaps = input.openGaps.filter(
    (g) => !input.recentlyCoveredQueries.has(g.query.trim().toLowerCase()),
  );
  // Track which gaps we've "used up" in the forecast.
  let writeCursor = 0;

  // --- Build per-day output.
  const days: ForecastDay[] = [];
  for (let i = 0; i < FORECAST_DAYS; i++) {
    const d = new Date(todayStart.getTime() + i * DAY_MS);
    const dayKey = isoDate(d);
    const planSnapshot = planForToday(d);

    // Cap probes at MAX_PROBES_PER_DAY (most-overdue first).
    const dueRaw = probeAssignments.get(dayKey) ?? [];
    const due = dueRaw
      .slice()
      .sort((a, b) => {
        const aDue = a.lastAskedDays === 'fresh' ? 9999 : a.lastAskedDays - a.query.cadenceDays;
        const bDue = b.lastAskedDays === 'fresh' ? 9999 : b.lastAskedDays - b.query.cadenceDays;
        return bDue - aDue;
      })
      .slice(0, MAX_PROBES_PER_DAY);

    // Notes: explain notable things.
    const notes: string[] = [];
    if (dueRaw.length > MAX_PROBES_PER_DAY) {
      notes.push(`${dueRaw.length - MAX_PROBES_PER_DAY} שאילתות נדחו ליום הבא (חרגנו מ-${MAX_PROBES_PER_DAY}/יום)`);
    }
    if (dueRaw.length === 0) {
      notes.push('אין שאילתות בקדנציה היום — כל השאילתות עדיין בתוך החלון שלהן');
    }

    // Pick what would be written today, if it's a writing day and the
    // queue still has uncovered gaps.
    let plannedWrite: ForecastDay['plannedWrite'] = null;
    if (planSnapshot.plan.shouldWrite && writeCursor < writableGaps.length) {
      const g = writableGaps[writeCursor];
      plannedWrite = { query: g.query, severity: g.severity, category: g.category };
      writeCursor += 1;
    } else if (planSnapshot.plan.shouldWrite && writableGaps.length === 0) {
      notes.push('יום כתיבה — אבל אין פערים פתוחים בתור');
    } else if (planSnapshot.plan.shouldWrite && writeCursor >= writableGaps.length) {
      notes.push('יום כתיבה — מוצה תור הכתיבה הנוכחי');
    }

    days.push({
      date: dayKey,
      weekday: planSnapshot.weekday,
      label: planSnapshot.plan.label,
      description: planSnapshot.plan.description,
      shouldWrite: planSnapshot.plan.shouldWrite,
      shouldImprove: planSnapshot.plan.shouldImprove,
      scheduledProbes: due.map((d) => ({
        query: d.query.query,
        category: d.query.category,
        cadenceDays: d.query.cadenceDays,
        lastAskedDays: d.lastAskedDays,
      })),
      plannedWrite,
      notes,
    });
  }

  // --- Per-query schedule table (one row per query).
  const perQuerySchedule: QuerySchedule[] = PROBE_QUERIES.map((q) => {
    const lastAt = input.lastAskedByQuery.get(q.query) ?? null;
    let nextDueAt: Date;
    if (!lastAt) {
      nextDueAt = todayStart;
    } else {
      nextDueAt = new Date(Math.max(lastAt.getTime() + q.cadenceDays * DAY_MS, todayStart.getTime()));
      nextDueAt = startOfDay(nextDueAt);
    }
    const daysUntilNextAsk = Math.max(
      0,
      Math.floor((nextDueAt.getTime() - todayStart.getTime()) / DAY_MS),
    );
    return {
      query: q.query,
      category: q.category,
      cadenceDays: q.cadenceDays,
      lastAskedAt: lastAt,
      nextDueAt,
      daysUntilNextAsk,
    };
  }).sort((a, b) => a.daysUntilNextAsk - b.daysUntilNextAsk);

  return { days, perQuerySchedule };
}

function startOfDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
