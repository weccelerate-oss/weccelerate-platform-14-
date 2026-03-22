import { Metadata } from 'next';
import { AnalyticsDashboard } from './analytics-dashboard';

export const metadata: Metadata = {
  title: 'אנליטיקס | מערכת ניהול WeCcelerate',
  description: 'ניתוח פניות ואנליטיקס של אתר WeCcelerate',
};

export const dynamic = 'force-dynamic';

const ACTION_LABELS: Record<string, string> = {
  'click.phone': 'שיחות טלפון',
  'click.whatsapp': 'הודעות WhatsApp',
  'click.email': 'אימיילים',
  'click.maps': 'ניווט Google Maps',
  'click.waze': 'ניווט Waze',
  'form.contact_submit': 'שליחת טופס',
  'lead.contact_fallback': 'טופס (גיבוי)',
};

const TRACKED_ACTIONS = Object.keys(ACTION_LABELS);

async function getAnalyticsData() {
  try {
    const { prisma } = await import('@/lib/db');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── Last 30 days for daily chart ──
    const logs = await prisma.activityLog.findMany({
      where: {
        action: { in: TRACKED_ACTIONS },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { action: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byAction: Record<string, number> = {};
    for (const a of TRACKED_ACTIONS) byAction[a] = 0;

    let contactsToday = 0;
    let contactsThisWeek = 0;
    let contactsThisMonth = 0;

    const dailyMap: Record<string, Record<string, number>> = {};

    for (const log of logs) {
      const date = new Date(log.createdAt);
      const dayKey = date.toISOString().split('T')[0];

      if (!dailyMap[dayKey]) dailyMap[dayKey] = { total: 0 };
      dailyMap[dayKey][log.action] = (dailyMap[dayKey][log.action] || 0) + 1;
      dailyMap[dayKey].total += 1;

      if (date >= monthStart) {
        contactsThisMonth++;
        byAction[log.action] = (byAction[log.action] || 0) + 1;
      }
      if (date >= weekAgo) contactsThisWeek++;
      if (date >= todayStart) contactsToday++;
    }

    // Fill missing days
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      daily.push({
        date: key,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        total: dailyMap[key]?.total || 0,
        ...Object.fromEntries(TRACKED_ACTIONS.map((a) => [a, dailyMap[key]?.[a] || 0])),
      });
    }

    // Channels for pie chart
    const channels = Object.entries(byAction)
      .filter(([, count]) => count > 0)
      .map(([action, count]) => ({
        name: ACTION_LABELS[action] || action,
        value: count,
        action,
      }));

    // ── Monthly history (last 12 months) ──
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const monthlyLogs = await prisma.activityLog.findMany({
      where: {
        action: { in: TRACKED_ACTIONS },
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { action: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build monthly buckets
    const monthlyMap: Record<string, Record<string, number>> = {};

    for (const log of monthlyLogs) {
      const d = new Date(log.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0 };
        for (const a of TRACKED_ACTIONS) monthlyMap[monthKey][a] = 0;
      }
      monthlyMap[monthKey][log.action] += 1;
      monthlyMap[monthKey].total += 1;
    }

    // Generate all 12 months (even empty ones)
    const HEBREW_MONTHS = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
    ];

    const monthlyHistory = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const data = monthlyMap[monthKey] || { total: 0 };

      // Previous month for comparison
      const prevDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      const prevData = monthlyMap[prevKey] || { total: 0 };

      const change = prevData.total > 0
        ? Math.round(((data.total - prevData.total) / prevData.total) * 100)
        : data.total > 0 ? 100 : 0;

      monthlyHistory.push({
        key: monthKey,
        label: `${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        shortLabel: HEBREW_MONTHS[d.getMonth()],
        year: d.getFullYear(),
        total: data.total,
        prevTotal: prevData.total,
        change,
        byAction: Object.fromEntries(
          TRACKED_ACTIONS.map((a) => [a, data[a] || 0])
        ),
      });
    }

    // ── Recent activity feed (last 7 days, individual entries) ──
    const recentLogs = await prisma.activityLog.findMany({
      where: {
        action: { in: TRACKED_ACTIONS },
        createdAt: { gte: weekAgo },
      },
      select: { id: true, action: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const recentActivity = recentLogs.map((log) => ({
      id: log.id,
      action: log.action,
      label: ACTION_LABELS[log.action] || log.action,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));

    // ── Monthly activity logs (for month tab) ──
    const monthLogs = await prisma.activityLog.findMany({
      where: {
        action: { in: TRACKED_ACTIONS },
        createdAt: { gte: monthStart },
      },
      select: { id: true, action: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const monthActivity = monthLogs.map((log) => ({
      id: log.id,
      action: log.action,
      label: ACTION_LABELS[log.action] || log.action,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      daily,
      channels,
      totals: {
        today: contactsToday,
        thisWeek: contactsThisWeek,
        thisMonth: contactsThisMonth,
      },
      byAction,
      monthlyHistory,
      recentActivity,
      monthActivity,
    };
  } catch (error) {
    console.error('[Analytics]', error);
    return {
      daily: [],
      channels: [],
      totals: { today: 0, thisWeek: 0, thisMonth: 0 },
      byAction: {},
      monthlyHistory: [],
      recentActivity: [],
      monthActivity: [],
    };
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-8 py-4 sm:py-6 pt-14 lg:pt-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            אנליטיקס — פניות מהאתר
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            מעקב אחרי כל דרכי ההתקשרות: טלפון, WhatsApp, אימייל, ניווט וטפסים
          </p>
        </div>
      </header>

      <main className="p-4 sm:p-8">
        <AnalyticsDashboard data={data} />
      </main>
    </div>
  );
}
