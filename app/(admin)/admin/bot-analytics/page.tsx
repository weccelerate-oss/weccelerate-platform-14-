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
import {
  TRAINING_CRAWLERS,
  SEARCH_INDEX_BOTS,
  LIVE_RETRIEVAL_BOTS,
  geoStage,
} from '@/lib/seo/bot-categories';
import { WEEKLY_PLAN, planForToday, planForTomorrow, type Weekday } from '@/lib/agents/daily-plan';
import { PROBE_QUERIES } from '@/lib/seo/geo-probes';
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
        kind: true,
        path: true,
        host: true,
        timestamp: true,
        country: true,
        region: true,
        city: true,
      },
    }),
  ]);

  // GEO stage signals — counts per category and first/last live-retrieval timestamps.
  // Restrict to crawl rows so referral records don't double-count.
  const [
    trainingCount,
    searchCount,
    liveRetrievalCount,
    firstLive,
    lastLive,
    referralCount,
    perReferralAll,
    firstReferral,
    lastReferral,
  ] = await Promise.all([
    prisma.botVisit.count({
      where: { kind: 'crawl', bot: { in: [...TRAINING_CRAWLERS] } },
    }),
    prisma.botVisit.count({
      where: { kind: 'crawl', bot: { in: [...SEARCH_INDEX_BOTS] } },
    }),
    prisma.botVisit.count({
      where: { kind: 'crawl', bot: { in: [...LIVE_RETRIEVAL_BOTS] } },
    }),
    prisma.botVisit.findFirst({
      where: { kind: 'crawl', bot: { in: [...LIVE_RETRIEVAL_BOTS] } },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, bot: true, path: true },
    }),
    prisma.botVisit.findFirst({
      where: { kind: 'crawl', bot: { in: [...LIVE_RETRIEVAL_BOTS] } },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, bot: true, path: true },
    }),
    prisma.botVisit.count({ where: { kind: 'referral' } }),
    prisma.botVisit.groupBy({
      by: ['bot'],
      where: { kind: 'referral' },
      _count: { _all: true },
      orderBy: { _count: { bot: 'desc' } },
    }),
    prisma.botVisit.findFirst({
      where: { kind: 'referral' },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true, bot: true, path: true, city: true, country: true },
    }),
    prisma.botVisit.findFirst({
      where: { kind: 'referral' },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true, bot: true, path: true, city: true, country: true },
    }),
  ]);

  const stage = geoStage({
    training: trainingCount,
    search: searchCount,
    liveRetrieval: liveRetrievalCount,
  });

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
    kind: string;
    path: string;
    host: string;
    country: string | null;
    region: string | null;
    city: string | null;
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
      kind: (r.kind === 'referral' ? 'referral' : 'crawl') as 'crawl' | 'referral',
      path: r.path,
      host: r.host,
      country: r.country,
      region: r.region,
      city: r.city,
      timestamp: r.timestamp.toISOString(),
    })),
    geo: {
      stage,
      counts: {
        training: trainingCount,
        search: searchCount,
        liveRetrieval: liveRetrievalCount,
      },
      firstLiveRetrieval: firstLive
        ? { timestamp: firstLive.timestamp.toISOString(), bot: firstLive.bot, path: firstLive.path }
        : null,
      lastLiveRetrieval: lastLive
        ? { timestamp: lastLive.timestamp.toISOString(), bot: lastLive.bot, path: lastLive.path }
        : null,
    },
    referrals: {
      total: referralCount,
      perSource: (perReferralAll as GroupByRow[]).map((r) => ({
        bot: r.bot,
        count: r._count._all,
      })),
      first: firstReferral
        ? {
            timestamp: firstReferral.timestamp.toISOString(),
            bot: firstReferral.bot,
            path: firstReferral.path,
            city: firstReferral.city,
            country: firstReferral.country,
          }
        : null,
      last: lastReferral
        ? {
            timestamp: lastReferral.timestamp.toISOString(),
            bot: lastReferral.bot,
            path: lastReferral.path,
            city: lastReferral.city,
            country: lastReferral.country,
          }
        : null,
    },
    probes: await getGeoProbeData(thirtyDaysAgo),
    plan: await getPlanData(),
  };
}

// ----------------------------------------------------------------------------
// PLAN DATA — what David is doing today, tomorrow, and the weekly schedule.
// Plus the live conditions that decide whether a guide will be written.
// ----------------------------------------------------------------------------
async function getPlanData() {
  const today = planForToday();
  const tomorrow = planForTomorrow();

  // What's in the writing queue right now (by priority).
  let openGaps: Array<{ id: string; query: string; severity: number; category: string | null; detectedAt: Date }> = [];
  let openGapsCount = 0;
  let recentGuidesCount = 0;
  let recentGuides: Array<{ slug: string; titleHe: string; publishedAt: Date | null }> = [];
  let dbAvailable = true;

  try {
    const last30d = new Date(Date.now() - 30 * 86_400_000);
    [openGapsCount, openGaps, recentGuidesCount, recentGuides] = await Promise.all([
      prisma.contentGap.count({ where: { status: 'open' } }),
      prisma.contentGap.findMany({
        where: { status: 'open' },
        orderBy: [{ severity: 'desc' }, { detectedAt: 'asc' }],
        take: 5,
        select: { id: true, query: true, severity: true, category: true, detectedAt: true },
      }),
      prisma.generatedGuide.count({
        where: { status: 'published', publishedAt: { gte: last30d } },
      }),
      prisma.generatedGuide.findMany({
        where: { status: 'published', publishedAt: { gte: last30d } },
        orderBy: { publishedAt: 'desc' },
        take: 5,
        select: { slug: true, titleHe: true, publishedAt: true },
      }),
    ]);
  } catch {
    dbAvailable = false;
  }

  // Snapshot of the writing-condition checklist.
  const conditions = [
    {
      label: 'ANTHROPIC_API_KEY מוגדר',
      ok: Boolean(process.env.ANTHROPIC_API_KEY),
      detail: process.env.ANTHROPIC_API_KEY
        ? 'Claude זמין לכתיבה ולfact-check'
        : 'בלי המפתח, פייפליין הכתיבה מושבת לחלוטין',
    },
    {
      label: 'היום יום כתיבה',
      ok: today.plan.shouldWrite,
      detail: today.plan.shouldWrite
        ? `${today.plan.label} — כתיבה מתוכננת`
        : `${today.plan.label} — לא יום כתיבה. מאמר חדש לא יפורסם.`,
    },
    {
      label: 'יש פערים פתוחים בתור',
      ok: openGapsCount > 0,
      detail: openGapsCount > 0
        ? `${openGapsCount} פערים פתוחים — דוד יבחר את הגבוה ביותר ב-severity`
        : 'אין פערים פתוחים. ה-Gap Analyzer יזהה כאלה אחרי probe הבא.',
    },
    {
      label: 'נושאים שטרם כוסו זמינים',
      ok: openGapsCount > recentGuidesCount, // rough heuristic
      detail: recentGuidesCount > 0
        ? `דוד דילג על ${recentGuidesCount} נושאים שכבר כוסו ב-30 ימים אחרונים`
        : 'לא פורסמו מאמרים ב-30 ימים אחרונים — אין סיכון לכפילות',
    },
  ];

  // The 3 quality gates — these run AFTER generation, so they're "always armed"
  // (no live status), but worth surfacing so the operator knows the bar.
  const qualityGates = [
    {
      label: 'Policy gate',
      detail: 'אסור: לינק לleumit.weccelerate.co.il, מספרים מומצאים על WeCcelerate, מחירים, התחייבויות זמן, אקוויטי %, "המוביל"/"הראשון" בלי הוכחה',
    },
    { label: 'Fact-check ≥ 60', detail: 'Claude Sonnet בודק כל טענה מול sources חיצוניים' },
    { label: 'SEO lint ≥ 60', detail: 'אורך כותרת, meta description, schema fields, internal linking' },
  ];

  return {
    weekly: (Object.entries(WEEKLY_PLAN) as Array<[Weekday, typeof WEEKLY_PLAN[Weekday]]>).map(
      ([day, plan]) => ({ day, ...plan }),
    ),
    today: { day: today.weekday, ...today.plan },
    tomorrow: { day: tomorrow.weekday, ...tomorrow.plan },
    probePoolSize: PROBE_QUERIES.length,
    openGapsCount,
    openGapsTop5: openGaps.map((g) => ({
      id: g.id,
      query: g.query,
      severity: g.severity,
      category: g.category,
      ageDays: Math.floor((Date.now() - g.detectedAt.getTime()) / 86_400_000),
    })),
    recentGuidesCount,
    recentGuides: recentGuides.map((g) => ({
      slug: g.slug,
      titleHe: g.titleHe,
      publishedAt: g.publishedAt?.toISOString() ?? null,
    })),
    conditions,
    qualityGates,
    dbAvailable,
  };
}

async function getGeoProbeData(since: Date) {
  // Use try/catch so the dashboard renders even before the geo_probes table
  // exists (i.e. before the user runs `npm run db:push` for this schema).
  try {
    const [total, recent, byProvider, citationRate30d] = await Promise.all([
      prisma.geoProbe.count(),
      prisma.geoProbe.findMany({
        orderBy: { timestamp: 'desc' },
        take: 30,
        select: {
          id: true,
          provider: true,
          query: true,
          category: true,
          mentioned: true,
          cited: true,
          citedUrls: true,
          timestamp: true,
          error: true,
        },
      }),
      prisma.geoProbe.groupBy({
        by: ['provider'],
        where: { timestamp: { gte: since } },
        _count: { _all: true },
      }),
      prisma.$queryRaw<Array<{ provider: string; total: bigint; cited: bigint }>>`
        SELECT provider,
               COUNT(*)::bigint AS total,
               SUM(CASE WHEN cited THEN 1 ELSE 0 END)::bigint AS cited
        FROM geo_probes
        WHERE timestamp >= ${since}
          AND error IS NULL
        GROUP BY provider
      `,
    ]);

    type ProviderGroupRow = { provider: string; _count: { _all: number } };
    type CitationRateRow = { provider: string; total: number; cited: number };
    type RecentProbeRow = {
      id: string;
      provider: string;
      query: string;
      category: string | null;
      mentioned: boolean;
      cited: boolean;
      citedUrls: string[];
      timestamp: Date;
      error: string | null;
    };

    return {
      installed: true,
      total,
      perProvider30d: (byProvider as ProviderGroupRow[]).map((b) => ({
        provider: b.provider,
        count: b._count._all,
      })),
      citationRate30d: (citationRate30d as unknown as CitationRateRow[]).map((r) => ({
        provider: r.provider,
        total: Number(r.total),
        cited: Number(r.cited),
        rate: Number(r.total) > 0 ? Math.round((Number(r.cited) / Number(r.total)) * 100) : 0,
      })),
      recent: (recent as RecentProbeRow[]).map((r) => ({
        id: r.id,
        provider: r.provider,
        query: r.query,
        category: r.category,
        mentioned: r.mentioned,
        cited: r.cited,
        citedUrls: r.citedUrls,
        timestamp: r.timestamp.toISOString(),
        error: r.error,
      })),
    };
  } catch {
    return {
      installed: false as const,
      total: 0,
      perProvider30d: [],
      citationRate30d: [],
      recent: [],
    };
  }
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

  const updatedAt = data?.now
    ? new Date(data.now).toLocaleString('he-IL', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="p-6 md:p-10" dir="rtl">
      <header className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">ביקורי AI Bots</h1>
            <p className="mt-1 text-sm text-slate-600">
              מדד GEO/AEO — סורקי AI שמבקרים באתר, ציטוטים בתשובות LLM, וקליקים אמיתיים.
            </p>
          </div>
          {updatedAt && (
            <div className="text-xs text-slate-500">
              עודכן <time dateTime={data?.now ?? undefined}>{updatedAt}</time>
            </div>
          )}
        </div>
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
