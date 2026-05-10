/**
 * Client component for the bot-analytics page. Receives pre-aggregated data
 * from the server and renders charts + tables. Client-only because recharts
 * needs browser APIs.
 */

'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BotCount {
  bot: string;
  count: number;
}

export interface BotAnalyticsData {
  now: string;
  totals: { last7d: number; last30d: number; allTime: number };
  perBot: {
    last7d: BotCount[];
    last30d: BotCount[];
    allTime: BotCount[];
  };
  topPaths30d: Array<{ path: string; count: number }>;
  timeline: Array<Record<string, number | string>>;
  botsSeen: string[];
  botColors: Record<string, string>;
  recent: Array<{
    id: string;
    bot: string;
    path: string;
    host: string;
    country: string | null;
    timestamp: string;
  }>;
  geo: {
    stage: {
      stage: 0 | 1 | 2 | 3;
      label: string;
      description: string;
      color: 'slate' | 'amber' | 'blue' | 'green';
    };
    counts: { training: number; search: number; liveRetrieval: number };
    firstLiveRetrieval: { timestamp: string; bot: string; path: string } | null;
    lastLiveRetrieval: { timestamp: string; bot: string; path: string } | null;
  };
}

type Window = 'last7d' | 'last30d' | 'allTime';

const WINDOW_LABELS: Record<Window, string> = {
  last7d: '7 ימים אחרונים',
  last30d: '30 ימים אחרונים',
  allTime: 'מאז ומתמיד',
};

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border p-5 text-start transition ${
        active
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value.toLocaleString('he-IL')}</div>
      <div className="mt-1 text-xs text-slate-400">ביקורים</div>
    </button>
  );
}

const GEO_STAGE_STYLES: Record<
  'slate' | 'amber' | 'blue' | 'green',
  { bg: string; border: string; text: string; pillBg: string; pillText: string }
> = {
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    pillBg: 'bg-slate-200',
    pillText: 'text-slate-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    pillBg: 'bg-amber-200',
    pillText: 'text-amber-900',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    pillBg: 'bg-blue-200',
    pillText: 'text-blue-900',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    pillBg: 'bg-emerald-200',
    pillText: 'text-emerald-900',
  },
};

function GeoStatusCard({ geo }: { geo: BotAnalyticsData['geo'] }) {
  const styles = GEO_STAGE_STYLES[geo.stage.color];
  const stageDots = [0, 1, 2, 3].map((n) => (
    <span
      key={n}
      className={`h-2.5 w-8 rounded-full ${
        n <= geo.stage.stage ? 'bg-current opacity-90' : 'bg-current opacity-15'
      }`}
    />
  ));

  const daysSince = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const days = Math.floor(ms / 86400000);
    if (days === 0) return 'היום';
    if (days === 1) return 'אתמול';
    return `לפני ${days} ימים`;
  };

  return (
    <section className={`rounded-xl border-2 p-6 ${styles.bg} ${styles.border}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${styles.pillBg} ${styles.pillText}`}
            >
              שלב {geo.stage.stage} / 3
            </span>
            <h2 className={`text-2xl font-bold ${styles.text}`}>{geo.stage.label}</h2>
          </div>
          <p className={`mt-2 max-w-xl text-sm ${styles.text}`}>{geo.stage.description}</p>
        </div>
        <div className={`flex flex-col gap-1 ${styles.text}`} aria-hidden>
          <div className="flex items-center gap-1">{stageDots}</div>
          <div className="text-xs opacity-75">התקדמות GEO</div>
        </div>
      </div>

      {/* Category counts */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-amber-700">
            Training crawlers
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-900">{geo.counts.training}</div>
          <div className="mt-1 text-xs text-amber-700">
            GPTBot, ClaudeBot, Google-Extended וכו׳ — אימון מודלים
          </div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
            Search index
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-900">{geo.counts.search}</div>
          <div className="mt-1 text-xs text-blue-700">
            OAI-SearchBot, PerplexityBot — בונים את גרף הציטוט
          </div>
        </div>
        <div
          className={`rounded-lg border p-4 ${
            geo.counts.liveRetrieval > 0
              ? 'border-emerald-300 bg-emerald-50/60'
              : 'border-slate-200 bg-slate-50/60'
          }`}
        >
          <div
            className={`text-xs font-medium uppercase tracking-wide ${
              geo.counts.liveRetrieval > 0 ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            Live retrieval ⭐
          </div>
          <div
            className={`mt-1 text-2xl font-bold ${
              geo.counts.liveRetrieval > 0 ? 'text-emerald-900' : 'text-slate-400'
            }`}
          >
            {geo.counts.liveRetrieval}
          </div>
          <div
            className={`mt-1 text-xs ${
              geo.counts.liveRetrieval > 0 ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            ChatGPT-User, Perplexity-User — משתמשים מקבלים אותך כתשובה
          </div>
        </div>
      </div>

      {/* First/last citation timestamps */}
      {geo.firstLiveRetrieval && (
        <div className={`mt-5 rounded-lg border bg-white/60 p-4 ${styles.border}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className={`text-xs font-medium ${styles.text} opacity-75`}>
                ציטוט ראשון אי פעם
              </div>
              <div className={`mt-1 font-semibold ${styles.text}`}>
                {daysSince(geo.firstLiveRetrieval.timestamp)}{' '}
                <span className="text-xs font-normal opacity-75">
                  · {geo.firstLiveRetrieval.bot} → {geo.firstLiveRetrieval.path}
                </span>
              </div>
            </div>
            {geo.lastLiveRetrieval && (
              <div>
                <div className={`text-xs font-medium ${styles.text} opacity-75`}>
                  ציטוט אחרון
                </div>
                <div className={`mt-1 font-semibold ${styles.text}`}>
                  {daysSince(geo.lastLiveRetrieval.timestamp)}{' '}
                  <span className="text-xs font-normal opacity-75">
                    · {geo.lastLiveRetrieval.bot} → {geo.lastLiveRetrieval.path}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function BotAnalyticsDashboard({ data }: { data: BotAnalyticsData }) {
  const [activeWindow, setActiveWindow] = useState<Window>('last30d');
  const [botFilter, setBotFilter] = useState<string | 'ALL'>('ALL');

  const perBot = data.perBot[activeWindow];
  const totals = data.totals;

  const timeline = useMemo(() => {
    if (botFilter === 'ALL') return data.timeline;
    return data.timeline.map((row) => {
      const next: Record<string, number | string> = { day: row.day };
      next[botFilter] = (row[botFilter] as number | undefined) ?? 0;
      return next;
    });
  }, [botFilter, data.timeline]);

  const filteredRecent = useMemo(() => {
    if (botFilter === 'ALL') return data.recent;
    return data.recent.filter((r) => r.bot === botFilter);
  }, [botFilter, data.recent]);

  const botsToPlot = botFilter === 'ALL' ? data.botsSeen : [botFilter];

  return (
    <div className="space-y-8">
      {/* GEO Status — top-of-page summary */}
      <GeoStatusCard geo={data.geo} />

      {/* Stat cards */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <StatCard
          label="7 ימים אחרונים"
          value={totals.last7d}
          active={activeWindow === 'last7d'}
          onClick={() => setActiveWindow('last7d')}
        />
        <StatCard
          label="30 ימים אחרונים"
          value={totals.last30d}
          active={activeWindow === 'last30d'}
          onClick={() => setActiveWindow('last30d')}
        />
        <StatCard
          label="מאז ומתמיד"
          value={totals.allTime}
          active={activeWindow === 'allTime'}
          onClick={() => setActiveWindow('allTime')}
        />
      </div>

      {/* Bot filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">סינון לפי bot:</span>
        <button
          onClick={() => setBotFilter('ALL')}
          className={`rounded-full px-3 py-1 text-sm transition ${
            botFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          הכל
        </button>
        {data.botsSeen.map((b) => (
          <button
            key={b}
            onClick={() => setBotFilter(b)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              botFilter === b
                ? 'text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            style={botFilter === b ? { backgroundColor: data.botColors[b] ?? '#475569' } : {}}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Per-bot bar chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          ביקורים לפי bot — {WINDOW_LABELS[activeWindow]}
        </h2>
        {perBot.length === 0 ? (
          <div className="py-10 text-center text-slate-500">אין נתונים לחלון הזמן הזה.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={perBot} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bot" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="ביקורים" radius={[4, 4, 0, 0]}>
                {perBot.map((entry) => (
                  <rect key={entry.bot} fill={data.botColors[entry.bot] ?? '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Top paths */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          10 הדפים המבוקרים ביותר ע"י bots (30 ימים)
        </h2>
        {data.topPaths30d.length === 0 ? (
          <div className="py-10 text-center text-slate-500">אין נתונים.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 font-medium">#</th>
                  <th className="py-2 font-medium">נתיב</th>
                  <th className="py-2 font-medium">ביקורים</th>
                </tr>
              </thead>
              <tbody>
                {data.topPaths30d.map((row, i) => (
                  <tr key={row.path} className="border-b border-slate-100">
                    <td className="py-2 text-slate-500">{i + 1}</td>
                    <td className="py-2 font-mono text-xs text-slate-800">{row.path}</td>
                    <td className="py-2 font-semibold">{row.count.toLocaleString('he-IL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          ציר זמן — ביקורים יומיים (30 יום){botFilter !== 'ALL' ? ` · סינון: ${botFilter}` : ''}
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {botsToPlot.map((b) => (
              <Line
                key={b}
                type="monotone"
                dataKey={b}
                stroke={data.botColors[b] ?? '#64748b'}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Recent visits */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          50 ביקורים אחרונים{botFilter !== 'ALL' ? ` · סינון: ${botFilter}` : ''}
        </h2>
        {filteredRecent.length === 0 ? (
          <div className="py-10 text-center text-slate-500">אין ביקורים לסינון הזה.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 font-medium">זמן</th>
                  <th className="py-2 font-medium">bot</th>
                  <th className="py-2 font-medium">נתיב</th>
                  <th className="py-2 font-medium">מארח</th>
                  <th className="py-2 font-medium">מדינה</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2 text-xs text-slate-500">
                      {new Date(r.timestamp).toLocaleString('he-IL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: data.botColors[r.bot] ?? '#64748b' }}
                      >
                        {r.bot}
                      </span>
                    </td>
                    <td className="py-2 font-mono text-xs text-slate-800">{r.path}</td>
                    <td className="py-2 text-xs text-slate-500">{r.host}</td>
                    <td className="py-2 text-xs text-slate-500">{r.country ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
