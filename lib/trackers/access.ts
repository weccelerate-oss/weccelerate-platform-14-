/**
 * FOUNDER TRACKERS — the single place tracker visibility is decided.
 *
 * Server-only. Call resolveTrackerAccess() at the top of every server page and
 * every API route handler, BEFORE any tracker query runs. Never call it from a
 * client component and never let the client supply the viewer identity.
 *
 * The role is read fresh from the DB rather than from the session token, the
 * same way app/advisor/page.tsx does it, so revoking an advisor assignment
 * takes effect immediately instead of waiting for the JWT to rotate.
 */

import { prisma } from '@/lib/db';

export type TrackerViewMode = 'owner' | 'readonly';

export interface TrackerOwner {
  id: string;
  name: string | null;
  company: string | null;
}

export interface TrackerAccess {
  allowed: boolean;
  mode: TrackerViewMode;
  owner: TrackerOwner | null;
  reason?: 'not-found' | 'forbidden' | 'inactive';
}

const DENIED = (reason: TrackerAccess['reason']): TrackerAccess => ({
  allowed: false,
  mode: 'readonly',
  owner: null,
  reason,
});

/**
 * Who may see ownerId's trackers.
 *
 *   owner              -> edit
 *   ADMIN              -> read-only
 *   assigned MENTOR    -> read-only
 *   everyone else      -> denied
 *
 * Note there is deliberately no "advisor may edit" branch. A founder's prospect
 * list is theirs; an advisor overwriting a cell mid-call is worse than the value
 * of letting them type. Advisor participation, if it is ever wanted, belongs in
 * a comment or a review flag on a separate table.
 */
export async function resolveTrackerAccess(
  viewerId: string,
  ownerId: string,
): Promise<TrackerAccess> {
  if (!viewerId || !ownerId) return DENIED('forbidden');

  try {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, name: true, company: true, advisorId: true, isActive: true },
    });

    if (!owner) return DENIED('not-found');

    const ownerView: TrackerOwner = {
      id: owner.id,
      name: owner.name ?? null,
      company: owner.company ?? null,
    };

    if (viewerId === ownerId) {
      if (!owner.isActive) return DENIED('inactive');
      return { allowed: true, mode: 'owner', owner: ownerView };
    }

    const viewer = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { id: true, role: true, isActive: true },
    });

    if (!viewer || !viewer.isActive) return DENIED('forbidden');

    if (viewer.role === 'ADMIN') {
      return { allowed: true, mode: 'readonly', owner: ownerView };
    }

    if (viewer.role === 'MENTOR' && owner.advisorId === viewer.id) {
      return { allowed: true, mode: 'readonly', owner: ownerView };
    }

    return DENIED('forbidden');
  } catch (err) {
    // Fail closed. A DB hiccup must not open somebody else's prospect list.
    console.error('[trackers] resolveTrackerAccess failed:', err);
    return DENIED('forbidden');
  }
}
