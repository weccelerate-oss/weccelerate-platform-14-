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
  'form.contact': 'שליחת טופס',
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

    // ── Last 30 days — DB-level aggregation (no row streaming into Node) ──
    const [todayCount, weekCount, monthGroup, dailyRaw, monthlyRaw, recentLogs, monthLogs] = await Promise.all([
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
        FROM "activity_logs"
        WHERE "action" = ANY(${TRACKED_ACTIONS}::text[])
          AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY day, "action"
      `,
      prisma.$queryRaw<Array<{ month: Date; action: string; count: bigint }>>`
        SELECT date_trunc('month', "createdAt") AS month, "action", COUNT(*)::bigint AS count
        FROM "activity_logs"
        WHERE "action" = ANY(${TRACKED_ACTIONS}::text[])
          AND "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 11, 1)}
        GROUP BY month, "action"
      `,
      prisma.activityLog.findMany({
        where: { action: { in: TRACKED_ACTIONS }, createdAt: { gte: weekAgo } },
        select: { id: true, action: true, metadata: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      prisma.activityLog.findMany({
        where: { action: { in: TRACKED_ACTIONS }, createdAt: { gte: monthStart } },
        select: { id: true, action: true, metadata: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
    ]);

    const byAction: Record<string, number> = {};
    for (const a of TRACKED_ACTIONS) byAction[a] = 0;
    let contactsThisMonth = 0;
    for (const row of monthGroup) {
      byAction[row.action] = row._count._all;
      contactsThisMonth += row._count._all;
    }
    const contactsToday = todayCount;
    const contactsThisWeek = weekCount;

    const dailyMap: Record<string, Record<string, number>> = {};
    for (const row of dailyRaw) {
      const dayKey = new Date(row.day).toISOString().split('T')[0];
      const count = Number(row.count);
      if (!dailyMap[dayKey]) dailyMap[dayKey] = { total: 0 };
      dailyMap[dayKey][row.action] = count;
      dailyMap[dayKey].total += count;
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

    // ── Monthly history (last 12 months) — already aggregated via monthlyRaw ──
    const monthlyMap: Record<string, Record<string, number>> = {};
    for (const row of monthlyRaw) {
      const d = new Date(row.month);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = Number(row.count);
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0 };
        for (const a of TRACKED_ACTIONS) monthlyMap[monthKey][a] = 0;
      }
      monthlyMap[monthKey][row.action] = count;
      monthlyMap[monthKey].total += count;
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

    // ── Recent activity feed (already fetched in the Promise.all above) ──
    const recentActivity = recentLogs.map((log: { id: string; action: string; metadata: unknown; createdAt: Date }) => ({
      id: log.id,
      action: log.action,
      label: ACTION_LABELS[log.action] || log.action,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));

    const monthActivity = monthLogs.map((log: { id: string; action: string; metadata: unknown; createdAt: Date }) => ({
      id: log.id,
      action: log.action,
      label: ACTION_LABELS[log.action] || log.action,
      metadata: log.metadata as Record<string, unknown> | null,
      createdAt: log.createdAt.toISOString(),
    }));

    // Debug: raw distinct actions ALL-TIME (no date filter) so we can see
    // every row in the table. Also count total rows and surface the 5 most
    // recent for visual confirmation.
    const [allActionsRaw, totalRows, sampleRows] = await Promise.all([
      prisma.$queryRaw<Array<{ action: string; count: bigint; latest: Date }>>`
        SELECT "action", COUNT(*)::bigint AS count, MAX("createdAt") AS latest
        FROM "activity_logs"
        GROUP BY "action"
        ORDER BY count DESC
      `,
      prisma.activityLog.count(),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { action: true, createdAt: true, metadata: true },
      }),
    ]);
    const allActions = allActionsRaw.map((r) => ({
      action: r.action,
      count: Number(r.count),
      latest: r.latest ? new Date(r.latest).toISOString() : '—',
      tracked: TRACKED_ACTIONS.includes(r.action),
    }));
    const debugInfo = {
      totalRows,
      sampleRows: sampleRows.map((r: { action: string; createdAt: Date; metadata: unknown }) => ({
        action: r.action,
        createdAt: r.createdAt.toISOString(),
        name: ((r.metadata as Record<string, unknown> | null) || {}).name as string | undefined,
      })),
    };

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
      allActions,
      debugInfo,
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
      allActions: [],
      debugInfo: { totalRows: 0, sampleRows: [] },
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
        {/* Debug panel — what's actually in ActivityLog vs what's tracked */}
        <details className="mb-6 bg-white border border-slate-200 rounded-lg p-4 text-sm" open>
          <summary className="cursor-pointer font-medium text-slate-700">
            🔍 ניפוי — ActivityLog: {data.debugInfo.totalRows} שורות, {data.allActions.length} actions ייחודיים
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b">
                  <th className="text-start py-2 pe-4">Action</th>
                  <th className="text-start py-2 pe-4">Count</th>
                  <th className="text-start py-2 pe-4">הפעם האחרונה</th>
                  <th className="text-start py-2">סופר באנליטיקס?</th>
                </tr>
              </thead>
              <tbody>
                {data.allActions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 text-slate-400">
                      הטבלה ריקה לגמרי
                    </td>
                  </tr>
                ) : (
                  data.allActions.map((a) => (
                    <tr key={a.action} className="border-b border-slate-50">
                      <td className="py-2 pe-4 font-mono text-xs">{a.action}</td>
                      <td className="py-2 pe-4 font-mono">{a.count}</td>
                      <td className="py-2 pe-4 font-mono text-xs">{a.latest}</td>
                      <td className="py-2">
                        {a.tracked ? (
                          <span className="text-emerald-600">✓ כן</span>
                        ) : (
                          <span className="text-red-600">✗ לא</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {data.debugInfo.sampleRows.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-slate-500 mb-2">5 השורות האחרונות (כל תקופה):</div>
                <ul className="space-y-1 font-mono text-xs">
                  {data.debugInfo.sampleRows.map((r, i) => (
                    <li key={i}>
                      <span className="text-slate-400">{r.createdAt}</span> ·{' '}
                      <span className="text-slate-700">{r.action}</span> ·{' '}
                      <span className="text-slate-500">{r.name || '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>

        <AnalyticsDashboard data={data} />
      </main>
    </div>
  );
}
