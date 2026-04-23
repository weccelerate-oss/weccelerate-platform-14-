'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Navigation,
  FileText,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface MonthlyEntry {
  key: string;
  label: string;
  shortLabel: string;
  year: number;
  total: number;
  prevTotal: number;
  change: number;
  byAction: Record<string, number>;
}

interface ActivityEntry {
  id: string;
  action: string;
  label: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AnalyticsData {
  daily: Array<Record<string, string | number>>;
  channels: Array<{ name: string; value: number; action: string }>;
  totals: { today: number; thisWeek: number; thisMonth: number };
  byAction: Record<string, number>;
  monthlyHistory: MonthlyEntry[];
  recentActivity: ActivityEntry[];
  monthActivity: ActivityEntry[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CHANNEL_COLORS: Record<string, string> = {
  'click.phone': '#3b82f6',
  'click.whatsapp': '#22c55e',
  'click.email': '#f59e0b',
  'click.maps': '#ef4444',
  'click.waze': '#06b6d4',
  'form.contact_submit': '#8b5cf6',
  'lead.contact_fallback': '#a855f7',
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#a855f7'];

const CHANNEL_ICONS: Record<string, typeof Phone> = {
  'click.phone': Phone,
  'click.whatsapp': MessageCircle,
  'click.email': Mail,
  'click.maps': MapPin,
  'click.waze': Navigation,
  'form.contact_submit': FileText,
  'lead.contact_fallback': FileText,
};

const ACTION_LABELS: Record<string, string> = {
  'click.phone': 'טלפון',
  'click.whatsapp': 'WhatsApp',
  'click.email': 'אימייל',
  'click.maps': 'Google Maps',
  'click.waze': 'Waze',
  'form.contact_submit': 'טופס יצירת קשר',
  'lead.contact_fallback': 'טופס (גיבוי)',
};

const ACTION_LABELS_SHORT: Record<string, string> = {
  'click.phone': 'טלפון',
  'click.whatsapp': 'WhatsApp',
  'click.email': 'אימייל',
  'click.maps': 'Maps',
  'click.waze': 'Waze',
  'form.contact_submit': 'טופס',
  'lead.contact_fallback': 'גיבוי',
};

// =============================================================================
// COMPONENT
// =============================================================================

type TimeTab = 'today' | 'week' | 'month';

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { daily, channels, totals, byAction, monthlyHistory, recentActivity, monthActivity } = data;
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TimeTab>('today');

  // Current & previous month for KPI comparison
  const currentMonth = monthlyHistory.length > 0 ? monthlyHistory[monthlyHistory.length - 1] : null;
  const prevMonth = monthlyHistory.length > 1 ? monthlyHistory[monthlyHistory.length - 2] : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KPICard
          label="פניות היום"
          value={totals.today}
          icon={TrendingUp}
          color="border-l-blue-600"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KPICard
          label="פניות השבוע"
          value={totals.thisWeek}
          icon={Users}
          color="border-l-emerald-600"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KPICard
          label="פניות החודש"
          value={totals.thisMonth}
          icon={Calendar}
          color="border-l-purple-600"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          change={currentMonth?.change}
          prevValue={prevMonth?.total}
        />
        <KPICard
          label="חודש קודם"
          value={prevMonth?.total || 0}
          icon={Calendar}
          color="border-l-slate-400"
          iconBg="bg-slate-50"
          iconColor="text-slate-500"
          subtitle={prevMonth?.shortLabel}
        />
      </div>

      {/* ── Activity Feed with Tabs ── */}
      <ActivityFeed
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recentActivity={recentActivity}
        monthActivity={monthActivity}
        totals={totals}
      />

      {/* ── Area Chart — Daily Contacts ── */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-lg overflow-hidden">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
          פניות יומיות — 30 ימים אחרונים
        </h2>
        <div className="w-full h-[220px] sm:h-[300px] -mr-4 sm:mr-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                  direction: 'rtl',
                  fontSize: '13px',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#c8a951"
                fill="#c8a951"
                fillOpacity={0.15}
                strokeWidth={2}
                name="סה״כ פניות"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Monthly History Table ── */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            היסטוריית פניות חודשית
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            השוואה חודש-על-חודש עם פירוט לפי ערוץ
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/30">
                <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3">חודש</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">סה״כ</th>
                <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">שינוי</th>
                {Object.entries(ACTION_LABELS_SHORT).map(([action, label]) => (
                  <th key={action} className="text-center text-xs font-semibold text-slate-500 px-3 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthlyHistory].reverse().map((month, idx) => (
                <tr
                  key={month.key}
                  className={cn(
                    'border-b border-slate-100 hover:bg-slate-50 transition-colors',
                    idx === 0 && 'bg-royal-50/30 font-medium'
                  )}
                >
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-900">{month.label}</span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="text-sm font-bold text-slate-900">
                      {month.total.toLocaleString('he-IL')}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    <ChangeIndicator change={month.change} />
                  </td>
                  {Object.keys(ACTION_LABELS_SHORT).map((action) => {
                    const count = month.byAction[action] || 0;
                    return (
                      <td key={action} className="text-center px-3 py-3">
                        <span className={cn(
                          'text-sm',
                          count > 0 ? 'text-slate-900' : 'text-slate-300'
                        )}>
                          {count || '—'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Expandable cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {[...monthlyHistory].reverse().map((month, idx) => {
            const isExpanded = expandedMonth === month.key;
            const isCurrent = idx === 0;

            return (
              <div key={month.key}>
                <button
                  onClick={() => setExpandedMonth(isExpanded ? null : month.key)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3.5 transition-colors',
                    isCurrent ? 'bg-royal-50/30' : 'hover:bg-slate-50 active:bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      isCurrent ? 'bg-royal-500' : 'bg-slate-300'
                    )} />
                    <div className="text-right">
                      <p className={cn(
                        'text-sm',
                        isCurrent ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                      )}>
                        {month.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      {month.total.toLocaleString('he-IL')}
                    </span>
                    <ChangeIndicator change={month.change} compact />
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ACTION_LABELS_SHORT).map(([action, label]) => {
                        const count = month.byAction[action] || 0;
                        const Icon = CHANNEL_ICONS[action] || FileText;
                        const color = CHANNEL_COLORS[action] || '#64748b';

                        return (
                          <div
                            key={action}
                            className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-slate-100"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <Icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{count}</p>
                              <p className="text-[10px] text-slate-500">{label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comparison with previous */}
                    {month.prevTotal > 0 && (
                      <div className="mt-2 px-2 py-1.5 text-[11px] text-slate-500 text-center">
                        חודש קודם: {month.prevTotal} פניות
                        {month.change !== 0 && (
                          <span className={cn(
                            'mr-1 font-semibold',
                            month.change > 0 ? 'text-emerald-600' : 'text-red-500'
                          )}>
                            ({month.change > 0 ? '+' : ''}{month.change}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two Column: Bar Chart + Pie Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bar Chart */}
        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-lg">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
            פירוט לפי ערוץ — החודש
          </h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(byAction)
                  .filter(([, count]) => count > 0)
                  .map(([action, count]) => ({
                    name: ACTION_LABELS_SHORT[action] || action,
                    count,
                    action,
                  }))}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    direction: 'rtl',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" name="פניות" radius={[0, 4, 4, 0]}>
                  {Object.entries(byAction)
                    .filter(([, count]) => count > 0)
                    .map(([action], index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHANNEL_COLORS[action] || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart — legend below instead of inline labels */}
        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-lg">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
            התפלגות ערוצים — החודש
          </h2>
          {channels.length > 0 ? (
            <div>
              <div className="w-full h-[200px] sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channels}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {channels.map((entry, index) => (
                        <Cell
                          key={`pie-${index}`}
                          fill={CHANNEL_COLORS[entry.action] || PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                        direction: 'rtl',
                        fontSize: '13px',
                      }}
                      formatter={(value, name) => [`${(value as number) ?? 0} פניות`, String(name ?? '')]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 px-2">
                {channels.map((entry, index) => {
                  const total = channels.reduce((sum, c) => sum + c.value, 0);
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={entry.action} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: CHANNEL_COLORS[entry.action] || PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-700 truncate">{entry.name}</span>
                      <span className="text-xs text-slate-400 mr-auto">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-slate-400 text-sm">
              אין נתונים עדיין
            </div>
          )}
        </div>
      </div>

      {/* ── Channel Detail Cards ── */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
          סיכום לפי ערוץ התקשרות — החודש הנוכחי
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(byAction).map(([action, count]) => {
            const Icon = CHANNEL_ICONS[action] || FileText;
            const color = CHANNEL_COLORS[action] || '#64748b';

            // Get prev month value for this action
            const prevCount = prevMonth?.byAction[action] || 0;
            const actionChange = prevCount > 0
              ? Math.round(((count - prevCount) / prevCount) * 100)
              : count > 0 ? 100 : 0;

            return (
              <div
                key={action}
                className="flex items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-lg"
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{count}</p>
                    {count > 0 && prevCount > 0 && (
                      <span className={cn(
                        'text-[10px] font-semibold',
                        actionChange > 0 ? 'text-emerald-600' : actionChange < 0 ? 'text-red-500' : 'text-slate-400'
                      )}>
                        {actionChange > 0 ? '+' : ''}{actionChange}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                    {ACTION_LABELS[action] || action}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Monthly Trend Chart ── */}
      {monthlyHistory.length > 2 && (
        <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-lg">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">
            מגמת פניות — 12 חודשים אחרונים
          </h2>
          <div className="w-full h-[220px] sm:h-[280px] -mr-4 sm:mr-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    direction: 'rtl',
                    fontSize: '13px',
                  }}
                  formatter={(value: number | undefined) => [value ?? 0, 'פניות']}
                  labelFormatter={(label: unknown) => String(label ?? '')}
                />
                <Bar dataKey="total" name="סה״כ פניות" fill="#c8a951" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// KPI Card
// =============================================================================

function KPICard({
  label,
  value,
  icon: Icon,
  color,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-600',
  change,
  prevValue,
  subtitle,
}: {
  label: string;
  value: number;
  icon: typeof TrendingUp;
  color: string;
  iconBg?: string;
  iconColor?: string;
  change?: number;
  prevValue?: number;
  subtitle?: string;
}) {
  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${color} p-4 sm:p-6 rounded-sm`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', iconColor)} />
        </div>
        {change !== undefined && change !== 0 && (
          <ChangeIndicator change={change} />
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5">
        {value.toLocaleString('he-IL')}
      </p>
      <p className="text-xs sm:text-sm text-slate-500">{label}</p>
      {subtitle && (
        <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>
      )}
      {prevValue !== undefined && prevValue > 0 && (
        <p className="text-[10px] text-slate-400 mt-1">
          חודש קודם: {prevValue}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Change Indicator
// =============================================================================

// =============================================================================
// Activity Feed
// =============================================================================

function ActivityFeed({
  activeTab,
  setActiveTab,
  recentActivity,
  monthActivity,
  totals,
}: {
  activeTab: TimeTab;
  setActiveTab: (tab: TimeTab) => void;
  recentActivity: ActivityEntry[];
  monthActivity: ActivityEntry[];
  totals: { today: number; thisWeek: number; thisMonth: number };
}) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const filteredActivity = (() => {
    switch (activeTab) {
      case 'today':
        return recentActivity.filter((a) => new Date(a.createdAt) >= todayStart);
      case 'week':
        return recentActivity.filter((a) => new Date(a.createdAt) >= weekAgo);
      case 'month':
        return monthActivity;
    }
  })();

  const tabCount = activeTab === 'today' ? totals.today : activeTab === 'week' ? totals.thisWeek : totals.thisMonth;

  // Group by date
  const grouped: Record<string, ActivityEntry[]> = {};
  for (const entry of filteredActivity) {
    const d = new Date(entry.createdAt);
    const isToday = d >= todayStart;
    const isYesterday =
      d >= new Date(todayStart.getTime() - 24 * 60 * 60 * 1000) && d < todayStart;
    const dayKey = isToday
      ? 'היום'
      : isYesterday
        ? 'אתמול'
        : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(entry);
  }

  const TABS: { key: TimeTab; label: string; count: number }[] = [
    { key: 'today', label: 'היום', count: totals.today },
    { key: 'week', label: 'השבוע', count: totals.thisWeek },
    { key: 'month', label: 'החודש', count: totals.thisMonth },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header with Tabs */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-royal-600" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              פעילות מפורטת
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            {tabCount} פניות
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.label}
              <span className={cn(
                'mr-1.5 text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tab.key
                  ? 'bg-royal-100 text-royal-700'
                  : 'bg-slate-200 text-slate-500'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredActivity.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {activeTab === 'today' ? 'אין פניות היום עדיין' :
               activeTab === 'week' ? 'אין פניות השבוע' : 'אין פניות החודש'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([dayLabel, entries]) => (
            <div key={dayLabel}>
              {/* Day Header */}
              <div className="sticky top-0 z-10 bg-slate-50 px-4 sm:px-6 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  {dayLabel} — {entries.length} פניות
                </span>
              </div>

              {/* Entries */}
              <div className="divide-y divide-slate-50">
                {entries.map((entry) => {
                  const Icon = CHANNEL_ICONS[entry.action] || FileText;
                  const color = CHANNEL_COLORS[entry.action] || '#64748b';
                  const time = new Date(entry.createdAt);
                  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

                  const meta = entry.metadata;
                  const page = meta?.page as string | undefined;
                  const site = meta?.site as string | undefined;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-slate-50/50 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {entry.label}
                        </p>
                        {(page || site) && (
                          <p className="text-[11px] text-slate-400 truncate">
                            {site && <span>אתר: {site}</span>}
                            {site && page && <span> • </span>}
                            {page && <span>דף: {page}</span>}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-left">
                        <span className="text-sm font-mono text-slate-500">{timeStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Change Indicator
// =============================================================================

function ChangeIndicator({ change, compact = false }: { change: number; compact?: boolean }) {
  if (change === 0) {
    return (
      <span className={cn(
        'inline-flex items-center gap-0.5 text-slate-400 font-medium',
        compact ? 'text-[10px]' : 'text-xs px-1.5 py-0.5 bg-slate-50 rounded-md'
      )}>
        <Minus className="w-3 h-3" />
        {!compact && <span>0%</span>}
      </span>
    );
  }

  const isPositive = change > 0;

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 font-semibold',
      compact ? 'text-[10px]' : 'text-xs px-1.5 py-0.5 rounded-md',
      isPositive
        ? compact ? 'text-emerald-600' : 'text-emerald-700 bg-emerald-50'
        : compact ? 'text-red-500' : 'text-red-600 bg-red-50'
    )}>
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      <span>{isPositive ? '+' : ''}{change}%</span>
    </span>
  );
}
