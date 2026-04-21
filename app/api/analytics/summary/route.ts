import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

const TRACKED_ACTIONS = [
  'click.phone',
  'click.whatsapp',
  'click.email',
  'click.maps',
  'click.waze',
  'form.contact_submit',
  'lead.contact_fallback',
];

export async function GET() {
  // Admin-only endpoint
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
  }

  try {
    const { prisma } = await import('@/lib/db');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Push aggregation to Postgres with grouped counts + period totals — avoids
    // streaming thousands of rows into Node memory on every request.
    const [todayCount, weekCount, monthGroup, dailyRaw] = await Promise.all([
      prisma.activityLog.count({
        where: { action: { in: TRACKED_ACTIONS }, createdAt: { gte: todayStart } },
      }),
      prisma.activityLog.count({
        where: { action: { in: TRACKED_ACTIONS }, createdAt: { gte: weekAgo } },
      }),
      prisma.activityLog.groupBy({
        by: ['action'],
        where: { action: { in: TRACKED_ACTIONS }, createdAt: { gte: monthStart } },
        _count: { _all: true },
      }),
      prisma.$queryRaw<Array<{ day: Date; action: string; count: bigint }>>`
        SELECT date_trunc('day', "createdAt") AS day, "action", COUNT(*)::bigint AS count
        FROM "ActivityLog"
        WHERE "action" = ANY(${TRACKED_ACTIONS}::text[])
          AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY day, "action"
        ORDER BY day ASC
      `,
    ]);

    const byAction: Record<string, number> = {};
    for (const a of TRACKED_ACTIONS) byAction[a] = 0;
    let contactsThisMonth = 0;
    for (const row of monthGroup) {
      byAction[row.action] = row._count._all;
      contactsThisMonth += row._count._all;
    }

    const dailyMap: Record<string, Record<string, number>> = {};
    for (const row of dailyRaw) {
      const dayKey = new Date(row.day).toISOString().split('T')[0];
      const count = Number(row.count);
      if (!dailyMap[dayKey]) dailyMap[dayKey] = { total: 0 };
      dailyMap[dayKey][row.action] = count;
      dailyMap[dayKey].total += count;
    }
    const daily = Object.entries(dailyMap)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      daily,
      totals: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: contactsThisMonth,
      },
      byAction,
    });
  } catch (error) {
    console.error('[Analytics Summary]', error);
    return NextResponse.json(
      {
        daily: [],
        totals: { today: 0, thisWeek: 0, thisMonth: 0 },
        byAction: {},
      },
      { status: 200 }
    );
  }
}
