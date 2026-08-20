/**
 * FOUNDER TRACKERS — read layer.
 *
 * Mirrors lib/journey/repository.ts: hand-declared row shapes (the Prisma
 * client here is untyped), and a try/catch that degrades to an empty list so a
 * DB hiccup renders an empty grid instead of a 500.
 *
 * AUTHORIZATION IS NOT DONE HERE. Every function takes an ownerId that the
 * CALLER has already cleared through resolveTrackerAccess() in
 * lib/trackers/access.ts. Do not call these with an id that came off a request
 * without running that check first.
 */

import { prisma } from '@/lib/db';
import {
  TRACKERS,
  TRACKER_LIMITS,
  type TrackerRow,
  type TrackerSlug,
} from '@/lib/trackers/schema';

/**
 * A @db.Date column comes back as a Date at UTC midnight. toISOString().slice
 * is the only correct way to render it — getDate()/toLocaleDateString would
 * shift it a day for anyone east of UTC, which is all of our users.
 */
function toDateString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : null;
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return new Date(0).toISOString();
}

function modelFor(slug: TrackerSlug) {
  return slug === 'calls' ? prisma.founderCallLog : prisma.founderOutreachLead;
}

function mapRow(slug: TrackerSlug, raw: any): TrackerRow {
  const row: TrackerRow = {
    id: raw.id,
    position: raw.position ?? 0,
    updatedAt: toIso(raw.updatedAt),
  };
  for (const col of TRACKERS[slug].columns) {
    row[col.key] = col.kind === 'date' ? toDateString(raw[col.key]) : (raw[col.key] ?? '');
  }
  return row;
}

export async function getTrackerRows(
  ownerId: string,
  slug: TrackerSlug,
): Promise<TrackerRow[]> {
  try {
    const rows = await modelFor(slug).findMany({
      where: { userId: ownerId, deletedAt: null },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      take: TRACKER_LIMITS.maxRows,
    });
    return (rows ?? []).map((r: any) => mapRow(slug, r));
  } catch (err) {
    console.error(`[trackers] getTrackerRows(${slug}) failed:`, err);
    return [];
  }
}

/**
 * Row counts for both trackers, for the journey tool pills. Kept separate from
 * getTrackerRows so the journey page can show "תיעוד שיחות (12)" without
 * loading a single row.
 */
export async function getTrackerCounts(
  ownerId: string,
): Promise<{ calls: number; leads: number }> {
  try {
    const [calls, leads] = await Promise.all([
      prisma.founderCallLog.count({ where: { userId: ownerId, deletedAt: null } }),
      prisma.founderOutreachLead.count({ where: { userId: ownerId, deletedAt: null } }),
    ]);
    return { calls: calls ?? 0, leads: leads ?? 0 };
  } catch (err) {
    console.error('[trackers] getTrackerCounts failed:', err);
    return { calls: 0, leads: 0 };
  }
}

/** Live row count for one tracker — the server-side guard against the cap. */
export async function countTrackerRows(
  ownerId: string,
  slug: TrackerSlug,
): Promise<number> {
  try {
    return (await modelFor(slug).count({ where: { userId: ownerId, deletedAt: null } })) ?? 0;
  } catch (err) {
    console.error(`[trackers] countTrackerRows(${slug}) failed:`, err);
    return 0;
  }
}

/** Newest updatedAt across a user's rows — the version token for conflict detection. */
export async function getTrackerVersion(
  ownerId: string,
  slug: TrackerSlug,
): Promise<string> {
  try {
    const newest = await modelFor(slug).findFirst({
      where: { userId: ownerId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });
    return newest?.updatedAt ? toIso(newest.updatedAt) : '';
  } catch (err) {
    console.error(`[trackers] getTrackerVersion(${slug}) failed:`, err);
    return '';
  }
}

export { modelFor as trackerModel };
