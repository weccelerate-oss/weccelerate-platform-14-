/**
 * API Route: Founder trackers (bulk autosave)
 *
 * POST /api/portal/trackers/calls | /leads
 *   Body: { upserts: Row[], deletes: string[], baseVersion?: string }
 *   Saves the whole dirty set in one request and returns the clientId -> id
 *   map so the grid can adopt server ids.
 *
 * GET /api/portal/trackers/calls | /leads
 *   Fresh rows + version. Used by the conflict-refresh button.
 *
 * Why bulk rather than per-row: pasting 40 rows from Excel would fire 40
 * requests and immediately trip the per-minute bucket; reordering is inherently
 * multi-row; and the pagehide flush is one fire-and-forget shot that had better
 * land.
 *
 * OWNERSHIP: there is deliberately no ownerId in the request body. This route
 * only ever writes to session.user.id, which removes the entire IDOR class by
 * construction. Advisors and admins read through the server pages, never here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { isSameOrigin } from '@/lib/http/same-origin';
import { featuresFor } from '@/lib/entitlements';
import {
  TRACKERS,
  TRACKER_LIMITS,
  clampPosition,
  isRowEmpty,
  isTrackerSlug,
  sanitizeRow,
  type TrackerSlug,
} from '@/lib/trackers/schema';
import {
  countTrackerRows,
  getTrackerRows,
  getTrackerVersion,
  trackerModel,
} from '@/lib/trackers/repository';

export const dynamic = 'force-dynamic';

interface IncomingRow {
  clientId?: string;
  id?: string;
  position?: number;
  [field: string]: unknown;
}

/** A @db.Date column wants a Date at UTC midnight, or null. */
function toDbDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function resolveSlug(
  params: Promise<{ tracker: string }>,
): Promise<TrackerSlug | null> {
  const { tracker } = await params;
  return isTrackerSlug(tracker) ? tracker : null;
}

async function requireOwner(req: NextRequest, slug: TrackerSlug | null) {
  if (!isSameOrigin(req)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  if (!slug) {
    return { error: NextResponse.json({ error: 'Unknown tracker' }, { status: 404 }) };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const userId = session.user.id;

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, featureOverrides: true, advisorId: true, isActive: true },
  });
  if (!dbUser?.isActive) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!featuresFor(dbUser).trackers) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { userId };
}

// ---------------------------------------------------------------------------
// POST — bulk save
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tracker: string }> },
) {
  try {
    const slug = await resolveSlug(params);
    const gate = await requireOwner(req, slug);
    if ('error' in gate) return gate.error;
    const { userId } = gate;
    const tracker = slug as TrackerSlug;

    // Reject an oversized body before buffering it.
    const declared = Number(req.headers.get('content-length') ?? 0);
    if (declared > TRACKER_LIMITS.maxBodyBytes) {
      return NextResponse.json({ error: 'הבקשה גדולה מדי' }, { status: 413 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const upserts: IncomingRow[] = Array.isArray(body.upserts) ? body.upserts : [];
    const deletes: string[] = Array.isArray(body.deletes)
      ? body.deletes.filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
      : [];
    const baseVersion: string = typeof body.baseVersion === 'string' ? body.baseVersion : '';

    if (
      upserts.length > TRACKER_LIMITS.maxRowsPerRequest ||
      deletes.length > TRACKER_LIMITS.maxRowsPerRequest
    ) {
      return NextResponse.json({ error: 'יותר מדי שורות בבקשה אחת' }, { status: 400 });
    }

    // Autosave debounces to ~1.2s bursts; 40/min leaves room for fast typing
    // plus explicit flushes.
    const limit = rateLimit(`tracker-save:${userId}`, { limit: 40, windowSeconds: 60 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }
    // An import is a different shape of traffic — cap it separately per hour.
    if (upserts.length > 50) {
      const importLimit = rateLimit(`tracker-import:${userId}`, {
        limit: 20,
        windowSeconds: 3600,
      });
      if (!importLimit.allowed) {
        return NextResponse.json(
          { error: 'יותר מדי ייבואים בשעה האחרונה' },
          { status: 429, headers: { 'Retry-After': '600' } },
        );
      }
    }

    // Conflict: another tab (or the founder's phone) saved after this client
    // last read. Last-write-wins without a signal eventually eats an afternoon.
    if (baseVersion) {
      const current = await getTrackerVersion(userId, tracker);
      if (current && current > baseVersion) {
        return NextResponse.json(
          { ok: false, conflict: true, error: 'הטבלה עודכנה במקום אחר' },
          { status: 409 },
        );
      }
    }

    const model = trackerModel(tracker);

    // Split before touching the DB so the row-cap check is accurate.
    const creates: Array<{ clientId: string; data: Record<string, unknown> }> = [];
    const updates: Array<{ id: string; data: Record<string, unknown> }> = [];

    for (const raw of upserts) {
      const { value } = sanitizeRow(tracker, raw as Record<string, unknown>);
      const data: Record<string, unknown> = { position: clampPosition(raw.position) };

      // Which fields are dates comes from the column definition, not from a
      // guess at the field name.
      for (const col of TRACKERS[tracker].columns) {
        const v = value[col.key];
        data[col.key] = col.kind === 'date' ? toDbDate(v) : v;
      }

      const id = typeof raw.id === 'string' && raw.id ? raw.id : '';
      if (id) {
        updates.push({ id, data });
      } else {
        // A brand-new row with nothing in it is a UI artifact, not data.
        if (isRowEmpty(tracker, value)) continue;
        creates.push({ clientId: String(raw.clientId ?? ''), data });
      }
    }

    if (creates.length) {
      const existing = await countTrackerRows(userId, tracker);
      if (existing + creates.length > TRACKER_LIMITS.maxRows) {
        return NextResponse.json(
          { error: `הגעת למקסימום ${TRACKER_LIMITS.maxRows.toLocaleString('he-IL')} שורות` },
          { status: 400 },
        );
      }
    }

    const saved: Array<{ clientId: string; id: string; updatedAt: string }> = [];

    // Soft-delete. The userId in the where clause IS the ownership guard: it
    // turns a forged id into a no-op instead of a cross-tenant delete. Do not
    // "optimize" this into delete({ where: { id } }).
    if (deletes.length) {
      await model.updateMany({
        where: { id: { in: deletes }, userId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }

    // Same guard on updates — updateMany with a compound where matches 0 rows
    // for someone else's id rather than throwing or succeeding.
    for (const u of updates) {
      await model.updateMany({ where: { id: u.id, userId }, data: u.data });
    }

    for (const c of creates) {
      const row = await model.create({
        data: { ...c.data, userId },
        select: { id: true, updatedAt: true },
      });
      saved.push({
        clientId: c.clientId,
        id: row.id,
        updatedAt: row.updatedAt?.toISOString?.() ?? new Date().toISOString(),
      });
    }

    const serverVersion = await getTrackerVersion(userId, tracker);

    return NextResponse.json({ ok: true, saved, serverVersion });
  } catch (err) {
    console.error('[trackers] POST failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET — fresh rows (conflict refresh)
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tracker: string }> },
) {
  try {
    const slug = await resolveSlug(params);
    const gate = await requireOwner(req, slug);
    if ('error' in gate) return gate.error;

    const tracker = slug as TrackerSlug;
    const [rows, version] = await Promise.all([
      getTrackerRows(gate.userId, tracker),
      getTrackerVersion(gate.userId, tracker),
    ]);

    return NextResponse.json({ ok: true, rows, version });
  } catch (err) {
    console.error('[trackers] GET failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
