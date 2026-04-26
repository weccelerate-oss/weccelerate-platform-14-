/**
 * /admin/bot-analytics
 *
 * Surfaces the BotVisit rows captured by middleware.ts + /api/bot/log.
 * Measures GEO/AEO effectiveness — are AI crawlers (GPTBot, ClaudeBot,
 * PerplexityBot, etc.) scanning us, which pages, and is traffic growing?
 *
 * This is a Server Component — all DB aggregation happens at request time,
 * client gets pre-computed numbers to render into charts. That keeps the
 * DB query details out of the browser and lets us cache later if needed.
 */

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { BotAnalyticsDashboard, type BotAnalyticsData } from './dashboard';

export const metadata: Metadata = {
  title: 'ביקורי AI Bots | מערכת ניהול WeCcelerate',
  description: 'ניתוח ביקורי סורקי AI (GPTBot, ClaudeBot, Perplexity ועוד) באתר WeCcelerate',
};

export const dynamic = 'force-dynamic';

const BOT_COLORS: Record<string, string> = {
  GPTBot: '#10a37f', // OpenAI green
  'ChatGPT-User': '#14b8a6',
  'OAI-SearchBot': '#0d9488',
  ClaudeBot: '#d97757', // Anthropic orange
  'Claude-Web': '#f97316',
  'anthropic-ai': '#ea580c',
  PerplexityBot: '#6366f1', // Indigo
  'Perplexity-User': '#8b5cf6',
  'Google-Extended': '#4285f4', // Google blue
  GoogleOther: '#34a853',
  'Applebot-Extended': '#000000',
  CCBot: '#a3a3a3',
  'Meta-ExternalAgent': '#1877f2',
  FacebookBot: '#0866ff',
  Bytespider: '#fe2c55',
  'cohere-ai': '#39a1f4',
  DuckAssistBot: '#de5833',
  Amazonbot: '#ff9900',
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function getBotAnalytics(): Promise<BotAnalyticsData> {
  const now = new Date();
  const sevenDaysAgo = daysAgo(7);
  const thirtyDaysAgo = daysAgo(30);

  // Run all counts in parallel — one round-trip each, no row-streaming.
  const [
    total7d,
    total30d,
    totalAll,
    perBot7d,
    perBot30d,
    perBotAll,
    topPaths30d,
    dailyRaw30d,
    recent,
  ] = await Promise.all([
    prisma.botVisit.count({ where: { timestamp: { gte: sevenDaysAgo } } }),
    prisma.botVisit.count({ where: { timestamp: { gte: thirtyDaysAgo } } }),
    prisma.botVisit.count(),

    prisma.botVisit.groupBy({
      by: ['bot'],
      where: { timestamp: { gte: sevenDaysAgo } },
      _count: { _all: true },
      orderBy: { _count: { bot: 'desc' } },
    }),
    prisma.botVisit.groupBy({
      by: ['bot'],
      where: { timestamp: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { _count: { bot: 'desc' } },
    }),
    prisma.botVisit.groupBy({
      by: ['bot'],
      _count: { _all: true },
      orderBy: { _count: { bot: 'desc' } },
    }),

    prisma.botVisit.groupBy({
      by: ['path'],
      where: { timestamp: { gte: thirtyDaysAgo } },
      _count: { _all: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    }),

    // Daily timeline (last 30 days) — grouped at DB level via raw SQL for speed.
    // Prisma's groupBy doesn't support date_trunc directly in all adapters.
    prisma.$queryRaw<Array<{ day: Date; bot: string; count: bigint }>>`
      SELECT date_trunc('day', timestamp) AS day, bot, COUNT(*)::bigint AS count
      FROM bot_visits
      WHERE timestamp >= ${thirtyDaysAgo}
      GROUP BY day, bot
      ORDER BY day ASC
    `,

    prisma.botVisit.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
      select: {
        id: true,
        bot: true,
        path: true,
        host: true,
        timestamp: true,
        country: true,
      },
    }),
  ]);

  const dailyRows = dailyRaw30d.map((r: { day: Date; bot: string; count: bigint }) => ({
    day: r.day.toISOString().slice(0, 10),
    bot: r.bot,
    count: Number(r.count),
  }));

  // Build per-day stacked series for the timeline chart.
  const dayMap = new Map<string, Record<string, number | string>>();
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i).toISOString().slice(0, 10);
    dayMap.set(d, { day: d });
  }
  const botsSeen = new Set<string>();
  for (const row of dailyRows) {
    botsSeen.add(row.bot);
    const entry = dayMap.get(row.day);
    if (entry) entry[row.bot] = (entry[row.bot] as number | undefined ?? 0) + row.count;
  }
  const timeline = Array.from(dayMap.values());

  type GroupByRow = { bot: string; _count: { _all: number } };
  type PathGroupRow = { path: string; _count: { _all: number } };
  type RecentRow = {
    id: string;
    bot: string;
    path: string;
    host: string;
    country: string | null;
    timestamp: Date;
  };

  return {
    now: now.toISOString(),
    totals: { last7d: total7d, last30d: total30d, allTime: totalAll },
    perBot: {
      last7d: (perBot7d as GroupByRow[]).map((r) => ({ bot: r.bot, count: r._count._all })),
      last30d: (perBot30d as GroupByRow[]).map((r) => ({ bot: r.bot, count: r._count._all })),
      allTime: (perBotAll as GroupByRow[]).map((r) => ({ bot: r.bot, count: r._count._all })),
    },
    topPaths30d: (topPaths30d as PathGroupRow[]).map((r) => ({
      path: r.path,
      count: r._count._all,
    })),
    timeline,
    botsSeen: Array.from(botsSeen).sort(),
    botColors: BOT_COLORS,
    recent: (recent as RecentRow[]).map((r) => ({
      id: r.id,
      bot: r.bot,
      path: r.path,
      host: r.host,
      country: r.country,
      timestamp: r.timestamp.toISOString(),
    })),
  };
}

export default async function BotAnalyticsPage() {
  let data: BotAnalyticsData | null = null;
  let error: string | null = null;

  try {
    data = await getBotAnalytics();
  } catch (e) {
    // Most likely the `bot_visits` table doesn't exist yet — migration
    // hasn't been applied. Surface a clear message rather than a 500.
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="p-6 md:p-10" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">ביקורי AI Bots</h1>
        <p className="mt-2 text-slate-600">
          מדד GEO/AEO — כמה סורקי בינה מלאכותית מבקרים באתר, אילו דפים, ומגמות לאורך זמן.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <div className="font-semibold">שגיאה בטעינת הנתונים</div>
          <p className="mt-1 text-sm">
            ייתכן שטבלת <code className="rounded bg-amber-100 px-1">bot_visits</code> עדיין לא
            קיימת במסד. הרץ <code className="rounded bg-amber-100 px-1">npm run db:push</code> או{' '}
            <code className="rounded bg-amber-100 px-1">npm run db:migrate</code> כדי להחיל את
            הסכמה העדכנית.
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-amber-100/60 p-3 text-xs">{error}</pre>
        </div>
      ) : data ? (
        <BotAnalyticsDashboard data={data} />
      ) : null}
    </div>
  );
}
