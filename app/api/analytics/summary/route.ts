import { NextResponse } from 'next/server';

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
  try {
    const { prisma } = await import('@/lib/db');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all relevant logs for the last 30 days
    const logs = await prisma.activityLog.findMany({
      where: {
        action: { in: TRACKED_ACTIONS },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        action: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by action for current month
    const byAction: Record<string, number> = {};
    for (const a of TRACKED_ACTIONS) {
      byAction[a] = 0;
    }

    let contactsToday = 0;
    let contactsThisWeek = 0;
    let contactsThisMonth = 0;

    // Build daily breakdown for last 30 days
    const dailyMap: Record<string, Record<string, number>> = {};

    for (const log of logs) {
      const date = new Date(log.createdAt);
      const dayKey = date.toISOString().split('T')[0];

      // Daily breakdown
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { total: 0 };
      }
      dailyMap[dayKey][log.action] = (dailyMap[dayKey][log.action] || 0) + 1;
      dailyMap[dayKey].total += 1;

      // Period totals
      if (date >= monthStart) {
        contactsThisMonth++;
        byAction[log.action] = (byAction[log.action] || 0) + 1;
      }
      if (date >= weekAgo) {
        contactsThisWeek++;
      }
      if (date >= todayStart) {
        contactsToday++;
      }
    }

    // Convert daily map to sorted array
    const daily = Object.entries(dailyMap)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      daily,
      totals: {
        today: contactsToday,
        thisWeek: contactsThisWeek,
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
