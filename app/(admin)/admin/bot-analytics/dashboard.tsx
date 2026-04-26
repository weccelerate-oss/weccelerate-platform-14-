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
