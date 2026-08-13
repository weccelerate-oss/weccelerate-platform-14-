/**
 * POST /api/portal/notifications/read
 *   Body: { ids: string[] }  — mark these notifications read
 *
 * Scoped to the caller's own notifications: the updateMany filters on userId,
 * so passing someone else's id changes nothing rather than erroring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    const { ids } = (payload ?? {}) as { ids?: unknown };
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids required' }, { status: 400 });
    }
    const clean = ids.filter((i): i is string => typeof i === 'string').slice(0, 100);
    if (clean.length === 0) {
      return NextResponse.json({ error: 'ids required' }, { status: 400 });
    }

    const res = await prisma.notification.updateMany({
      where: { id: { in: clean }, userId: session.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true, updated: res.count });
  } catch (error) {
    console.error('[notifications/read] failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
