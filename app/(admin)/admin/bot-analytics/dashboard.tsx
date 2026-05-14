/**
 * Client component for the bot-analytics page.
 *
 * Layout: KPI hero → tabs → tab body.
 * The page used to be one giant scroll; the tabs split it into
 * Overview / GEO / Referrals / Bot Activity so the operator can scan a
 * single thing at a time.
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
import { countryLabel } from '@/lib/seo/country-names';

// =============================================================================
// TYPES — kept identical to before so page.tsx doesn't need changes
// =============================================================================

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
    kind: 'crawl' | 'referral';
    path: string;
    host: string;
    country: string | null;
    region: string | null;
    city: string | null;
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
  referrals: {
    total: number;
    perSource: BotCount[];
    first:
      | { timestamp: string; bot: string; path: string; city: string | null; country: string | null }
      | null;
    last:
      | { timestamp: string; bot: string; path: string; city: string | null; country: string | null }
      | null;
  };
  probes: {
    installed: boolean;
    total: number;
    perProvider30d: Array<{ provider: string; count: number }>;
    citationRate30d: Array<{ provider: string; total: number; cited: number; rate: number }>;
    recent: Array<{
      id: string;
      provider: string;
      query: string;
      category: string | null;
      mentioned: boolean;
      cited: boolean;
      citedUrls: string[];
      timestamp: string;
      error: string | null;
    }>;
  };
  plan: {
    weekly: Array<{
      day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
      label: string;
      probeFocus: string[];
      shouldWrite: boolean;
      shouldImprove: boolean;
      description: string;
    }>;
    today: {
      day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
      label: string;
      probeFocus: string[];
      shouldWrite: boolean;
      shouldImprove: boolean;
      description: string;
    };
    tomorrow: {
      day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
      label: string;
      probeFocus: string[];
      shouldWrite: boolean;
      shouldImprove: boolean;
      description: string;
    };
    probePoolSize: number;
    openGapsCount: number;
    openGapsTop5: Array<{
      id: string;
      query: string;
      severity: number;
      category: string | null;
      ageDays: number;
    }>;
    recentGuidesCount: number;
    recentGuides: Array<{ slug: string; titleHe: string; publishedAt: string | null }>;
    conditions: Array<{ label: string; ok: boolean; detail: string }>;
    qualityGates: Array<{ label: string; detail: string }>;
    dbAvailable: boolean;
    forecast: {
      days: Array<{
        date: string;
        weekday: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
        label: string;
        description: string;
        shouldWrite: boolean;
        shouldImprove: boolean;
        scheduledProbes: Array<{
          query: string;
          category: string;
          cadenceDays: number;
          lastAskedDays: number | 'fresh';
        }>;
        plannedWrite: { query: string; severity: number; category: string | null } | null;
        notes: string[];
      }>;
      perQuerySchedule: Array<{
        query: string;
        category: string;
        cadenceDays: number;
        lastAskedAt: string | null;
        nextDueAt: string;
        daysUntilNextAsk: number;
      }>;
    };
    journal: {
      windowDays: number;
      wins: Array<{ kind: string; date: string; title: string; detail: string }>;
      failures: Array<{ kind: string; date: string; title: string; detail: string; repeatCount: number }>;
      insights: string[];
    } | null;
    latestReplan: {
      date: string;
      plan: {
        theme: string;
        invest: string[];
        deprioritize: string[];
        newQueries: string[];
        warnings: string[];
        rawMemo: string;
      };
    } | null;
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function pathLabel(path: string): { label: string; icon: string } {
  if (path === '/' || path === '') return { label: 'דף הבית', icon: '🏠' };
  if (path === '/about') return { label: 'אודות', icon: 'ℹ️' };
  if (path === '/team') return { label: 'הצוות', icon: '👥' };
  if (path === '/press') return { label: 'בתקשורת', icon: '📰' };
  if (path === '/contact') return { label: 'צור קשר', icon: '📞' };
  if (path === '/medtech') return { label: 'מסלול MedTech', icon: '🩺' };
  if (path === '/investors') return { label: 'משקיעים', icon: '💰' };
  if (path === '/glossary') return { label: 'גלוסר', icon: '📖' };
  if (path === '/faq') return { label: 'שאלות נפוצות', icon: '❓' };
  if (path === '/blog') return { label: 'בלוג', icon: '✍️' };
  if (path === '/guides') return { label: 'רשימת מדריכים', icon: '📚' };
  if (path.startsWith('/en/guides/')) return { label: `מדריך EN: ${path.slice('/en/guides/'.length)}`, icon: '📘' };
  if (path.startsWith('/guides/')) return { label: `מדריך: ${path.slice('/guides/'.length)}`, icon: '📘' };
  if (path.startsWith('/en/glossary')) return { label: 'גלוסר באנגלית', icon: '📖' };
  if (path.startsWith('/en/medtech-guide')) return { label: 'מדריך MedTech (EN)', icon: '🩺' };
  if (path.startsWith('/en/funding-guide')) return { label: 'מדריך גיוס (EN)', icon: '💼' };
  if (path.startsWith('/en/')) return { label: `דף באנגלית: ${path.slice(4)}`, icon: '🇬🇧' };
  if (path.startsWith('/services/')) return { label: `שירות: ${path.slice('/services/'.length)}`, icon: '🛠️' };
  if (path.startsWith('/team/')) return { label: `דף איש צוות: ${path.slice('/team/'.length)}`, icon: '👤' };
  if (path.startsWith('/blog/')) return { label: `פוסט בלוג: ${path.slice('/blog/'.length)}`, icon: '✍️' };
  if (path.startsWith('/events/')) return { label: `אירוע: ${path.slice('/events/'.length)}`, icon: '📅' };
  if (path.startsWith('/videos/')) return { label: `סרטון: ${path.slice('/videos/'.length)}`, icon: '🎥' };
  return { label: path, icon: '🌐' };
}

function locationLabel(city: string | null, country: string | null): string {
  const c = countryLabel(country);
  const cityPart = city ? city : null;
  if (cityPart && c.name !== '—') return `${c.flag} ${cityPart}, ${c.name}`;
  if (c.name !== '—') return `${c.flag} ${c.name}`;
  return '—';
}

function locationDisplay(
  kind: 'crawl' | 'referral',
  city: string | null,
  country: string | null,
): { label: string; muted: boolean; tooltip: string } {
  const loc = locationLabel(city, country);
  if (kind === 'crawl') {
    return {
      label: loc === '—' ? '—' : `📡 דרך ${loc.replace(/^[^\s]+\s/, '')}`,
      muted: true,
      tooltip:
        'IP של ה-LLM data center — לא של המשתמש האמיתי. ChatGPT/Perplexity מפנים בקשות דרך POPs בעולם, גם אם המשתמש בישראל.',
    };
  }
  return {
    label: loc === '—' ? '—' : `👤 ${loc}`,
    muted: false,
    tooltip: 'מיקום אמיתי של המשתמש שלחץ על הקישור בתשובת ה-LLM (לא ה-LLM עצמו).',
  };
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);
  if (hours < 1) return 'לפני פחות משעה';
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days === 1) return 'אתמול';
  return `לפני ${days} ימים`;
}

// =============================================================================
// COLLAPSIBLE — used so the page isn't a wall of explanation text
// =============================================================================

function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group rounded-lg border border-slate-200 bg-slate-50/60 open:bg-slate-50"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <span className="text-xs text-slate-400 transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">{children}</div>
    </details>
  );
}

// =============================================================================
// HERO KPI STRIP — 4 numbers, the most important things to see at a glance
// =============================================================================

function HeroKpi({ data }: { data: BotAnalyticsData }) {
  const stageColors: Record<'slate' | 'amber' | 'blue' | 'green', { bg: string; text: string; ring: string }> = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-200' },
    green: { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200' },
  };
  const sc = stageColors[data.geo.stage.color];

  const kpis = [
    {
      label: 'ציטוטים אמיתיים',
      sub: 'Live retrieval bots',
      value: data.geo.counts.liveRetrieval,
      hint: data.geo.lastLiveRetrieval ? `אחרון: ${relativeTime(data.geo.lastLiveRetrieval.timestamp)}` : 'עוד אין',
      accent: 'border-emerald-300 bg-emerald-50 text-emerald-900',
      icon: '🟢',
    },
    {
      label: 'קליקים מ-LLMs',
      sub: 'Referral clicks',
      value: data.referrals.total,
      hint: data.referrals.last ? `אחרון: ${relativeTime(data.referrals.last.timestamp)}` : 'עוד אין',
      accent: 'border-blue-300 bg-blue-50 text-blue-900',
      icon: '👤',
    },
    {
      label: 'סריקות AI',
      sub: '7 ימים אחרונים',
      value: data.totals.last7d,
      hint: `מתוך ${data.totals.allTime.toLocaleString('he-IL')} בסה"כ`,
      accent: 'border-slate-300 bg-slate-50 text-slate-900',
      icon: '🤖',
    },
    {
      label: 'שלב GEO',
      sub: data.geo.stage.label,
      value: `${data.geo.stage.stage}/3`,
      hint: data.geo.stage.description.split('.')[0],
      accent: `border ${sc.ring} ${sc.bg} ${sc.text}`,
      icon: '📊',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className={`rounded-xl border-2 p-4 ${k.accent}`}>
          <div className="flex items-start justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{k.label}</div>
            <div className="text-lg" aria-hidden>{k.icon}</div>
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight">
            {typeof k.value === 'number' ? k.value.toLocaleString('he-IL') : k.value}
          </div>
          <div className="mt-1 text-xs opacity-75">{k.sub}</div>
          <div className="mt-2 text-[11px] opacity-60">{k.hint}</div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// TABS
// =============================================================================

type Tab = 'overview' | 'plan' | 'geo' | 'referrals' | 'bots';

const TAB_ORDER: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'overview', label: 'סקירה', icon: '📊' },
  { id: 'plan', label: 'התוכנית של דוד', icon: '📅' },
  { id: 'geo', label: 'GEO Probe', icon: '🤖' },
  { id: 'referrals', label: 'קליקים מ-LLMs', icon: '👤' },
  { id: 'bots', label: 'פעילות bots', icon: '📡' },
];

function TabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="sticky top-0 z-20 -mx-6 mb-6 border-b border-slate-200 bg-white/90 px-6 backdrop-blur md:-mx-10 md:px-10">
      <div className="flex flex-wrap gap-1">
        {TAB_ORDER.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
              aria-pressed={isActive}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// TAB: OVERVIEW
// =============================================================================

function OverviewTab({ data }: { data: BotAnalyticsData }) {
  const stageStyles: Record<'slate' | 'amber' | 'blue' | 'green', { bg: string; border: string; text: string; pill: string }> = {
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', pill: 'bg-slate-200 text-slate-800' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', pill: 'bg-amber-200 text-amber-900' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', pill: 'bg-blue-200 text-blue-900' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', pill: 'bg-emerald-200 text-emerald-900' },
  };
  const ss = stageStyles[data.geo.stage.color];

  const dots = [0, 1, 2, 3].map((n) => (
    <span
      key={n}
      className={`h-2 w-10 rounded-full ${
        n <= data.geo.stage.stage ? 'bg-current opacity-90' : 'bg-current opacity-15'
      }`}
    />
  ));

  return (
    <div className="space-y-6">
      {/* GEO stage compact card */}
      <section className={`rounded-xl border-2 p-5 ${ss.bg} ${ss.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ss.pill}`}>
                שלב {data.geo.stage.stage} / 3
              </span>
              <h2 className={`text-xl font-bold ${ss.text}`}>{data.geo.stage.label}</h2>
            </div>
            <p className={`mt-1.5 max-w-2xl text-sm ${ss.text} opacity-90`}>
              {data.geo.stage.description}
            </p>
          </div>
          <div className={`flex flex-col items-end gap-1 ${ss.text}`} aria-hidden>
            <div className="flex items-center gap-1">{dots}</div>
            <div className="text-[11px] opacity-75">התקדמות GEO</div>
          </div>
        </div>

        {/* Compact bot-category counts */}
        <div className={`mt-5 grid grid-cols-3 gap-3 ${ss.text}`}>
          <div className="rounded-lg bg-white/60 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">🟡 Training</div>
            <div className="mt-1 text-2xl font-bold">{data.geo.counts.training}</div>
            <div className="text-[10px] opacity-70">GPTBot · ClaudeBot · CCBot</div>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">🔵 Search Index</div>
            <div className="mt-1 text-2xl font-bold">{data.geo.counts.search}</div>
            <div className="text-[10px] opacity-70">PerplexityBot · OAI-SearchBot</div>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider opacity-70">🟢 Live Retrieval ⭐</div>
            <div className="mt-1 text-2xl font-bold">{data.geo.counts.liveRetrieval}</div>
            <div className="text-[10px] opacity-70">ChatGPT-User · Claude-Web</div>
          </div>
        </div>

        {/* Inline next-step */}
        <div className={`mt-4 rounded-lg border bg-white/70 p-3 ${ss.border}`}>
          <NextStepInline geo={data.geo} compact />
        </div>

        {/* Optional details */}
        <div className="mt-4">
          <Disclosure summary="מה ההבדל בין הקטגוריות?">
            <CategoryExplainer />
          </Disclosure>
        </div>
      </section>

      {/* 30-day trend chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-slate-900">פעילות bots — 30 יום</h2>
          <span className="text-xs text-slate-500">סך כל ה-bots המבקרים, מקובץ ליום</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {data.botsSeen.slice(0, 6).map((b) => (
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

      {/* Top paths quick-look */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">5 הדפים החמים ביותר (30 יום)</h2>
        {data.topPaths30d.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">אין נתונים עדיין.</div>
        ) : (
          <ul className="space-y-2">
            {data.topPaths30d.slice(0, 5).map((row, i) => {
              const p = pathLabel(row.path);
              const max = data.topPaths30d[0]?.count ?? 1;
              const pct = Math.round((row.count / max) * 100);
              return (
                <li key={row.path} className="flex items-center gap-3">
                  <span className="w-5 text-sm text-slate-400">{i + 1}</span>
                  <span className="text-base" aria-hidden>{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-slate-800">{p.label}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-end text-sm font-semibold text-slate-700">
                    {row.count.toLocaleString('he-IL')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function NextStepInline({ geo, compact = false }: { geo: BotAnalyticsData['geo']; compact?: boolean }) {
  let title: string;
  let body: React.ReactNode;
  if (geo.stage.stage === 0) {
    title = '🚀 הצעד הבא — לוודא ש-Bing index עובד';
    body = compact
      ? <span>וודא ש-IndexNow פעיל וש-sitemap הוגש ב-Bing Webmaster. תוך 24-72 שעות אמורים להופיע training crawlers.</span>
      : (
        <ul className="list-disc space-y-1 pr-5">
          <li>בדוק ש-IndexNow פעיל</li>
          <li>וודא ש-sitemap הוגש ב-Bing Webmaster Tools</li>
          <li>תוך 24-72 שעות אמורים להופיע training crawlers ראשונים</li>
        </ul>
      );
  } else if (geo.stage.stage === 1) {
    title = '⏳ הצעד הבא — להמתין ל-search index';
    body = <span>OpenAI/Anthropic סורקים אותך לאימון. תוך שבוע-שבועיים אמורים להופיע PerplexityBot ו-OAI-SearchBot. בינתיים פרסם תוכן חדש כדי לזרז.</span>;
  } else if (geo.stage.stage === 2) {
    title = '🎯 הצעד הבא — ציטוטים אמיתיים בדרך';
    body = <span>PerplexityBot/OAI-SearchBot מאנדקסים — ה-LLM מכיר אותך. ציטוט live retrieval ראשון אמור תוך 1-3 שבועות. תקבל מייל אוטומטי ברגע שזה קורה.</span>;
  } else {
    title = '✅ GEO פעיל — מצוטטים בפועל';
    body = <span>משתמשים מקבלים את התוכן שלך כתשובה ב-LLMs. כדי להגביר: Press Releases, Wikipedia, podcasts — כל אחד מהם מגדיל ציטוטים.</span>;
  }
  return (
    <div className="text-sm">
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-slate-700">{body}</div>
    </div>
  );
}

function CategoryExplainer() {
  return (
    <div className="space-y-3 text-xs">
      <div>
        <div className="font-semibold text-amber-900">🟡 Training Crawlers — לאימון מודלים עתידיים</div>
        <p className="mt-0.5 text-slate-600">
          GPTBot, ClaudeBot, Google-Extended וכו'. סורקים ברקע פעם ב-3-14 ימים לאיסוף תוכן ל-knowledge cutoff הבא של ה-LLM. לא ציטוט בפועל אבל "זרע" לציטוטים עתידיים.
        </p>
      </div>
      <div>
        <div className="font-semibold text-blue-900">🔵 Search Index — בונים את גרף הציטוט</div>
        <p className="mt-0.5 text-slate-600">
          PerplexityBot, OAI-SearchBot, DuckAssistBot. בוטים של מנועי AI שבונים אינדקס לציטוט בזמן שאלה. ChatGPT Search ו-Perplexity מסתמכים עליהם.
        </p>
      </div>
      <div>
        <div className="font-semibold text-emerald-900">🟢 Live Retrieval — ציטוטים אמיתיים ⭐</div>
        <p className="mt-0.5 text-slate-600">
          ChatGPT-User, Perplexity-User, Claude-Web. הסיגנל הכי חזק. בוט שנשלח ב<strong>זמן אמת</strong> כשמשתמש שאל שאלה וה-LLM החליט לגלוש לאתר שלך כדי לצטט בתשובה. כל ביקור = שיחה שאתה מצוטט בה.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// TAB: GEO PROBE
// =============================================================================

function GeoProbeTab({ probes }: { probes: BotAnalyticsData['probes'] }) {
  if (!probes.installed) {
    return (
      <div className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/40 p-8 text-center">
        <div className="text-3xl">🤖</div>
        <h2 className="mt-2 text-lg font-bold text-violet-900">GEO Probe לא מותקן עדיין</h2>
        <p className="mt-2 text-sm text-violet-800">
          טבלת <code className="rounded bg-violet-100 px-1.5 py-0.5">geo_probes</code> עדיין לא קיימת ב-DB.
          <br />
          הרץ <code className="rounded bg-violet-100 px-1.5 py-0.5">npm run db:push</code> כדי להתקין, ואז הוסף API keys ב-Vercel.
        </p>
      </div>
    );
  }

  const totalRecent = probes.recent.length;
  const citedRecent = probes.recent.filter((r) => r.cited).length;
  const mentionedRecent = probes.recent.filter((r) => r.mentioned && !r.cited).length;
  const failedRecent = probes.recent.filter((r) => r.error).length;

  return (
    <div className="space-y-6">
      {/* What & why */}
      <section className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-violet-900">בדיקה אקטיבית של LLMs</h2>
            <p className="mt-1 max-w-2xl text-sm text-violet-900/90">
              דוד שואל את ChatGPT, Perplexity ו-Claude שאלות אסטרטגיות ובודק אם מצטטים אותנו.
              זה מודד מה שלא רואים ב-Bot Analytics — האם הציטוט אכן מופיע בתשובות למשתמשים.
            </p>
          </div>
          <div className="text-end">
            <div className="text-4xl font-bold text-violet-900">{probes.total}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-700">בדיקות בסה"כ</div>
          </div>
        </div>
      </section>

      {/* Citation rate per provider */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">אחוז ציטוט — 30 יום אחרון</h3>
        {probes.citationRate30d.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {probes.citationRate30d.map((r) => (
              <div key={r.provider} className="rounded-lg border border-slate-200 p-3">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {r.provider}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-slate-900">{r.rate}%</div>
                  <div className="text-[11px] text-slate-500">
                    {r.cited}/{r.total} מצוטטים
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full ${r.rate >= 50 ? 'bg-emerald-500' : r.rate >= 20 ? 'bg-amber-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.max(r.rate, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
            עוד לא רץ probe. הוסף API keys ב-Vercel כדי שדוד יתחיל לבדוק.
          </div>
        )}
      </section>

      {/* Recent probes */}
      {totalRecent > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-slate-900">30 בדיקות אחרונות</h3>
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-emerald-700">{citedRecent}</span> מצוטטים ·{' '}
              <span className="font-semibold text-amber-700">{mentionedRecent}</span> אזכור ·{' '}
              <span className="font-semibold text-red-600">{failedRecent}</span> שגיאות
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">זמן</th>
                  <th className="px-3 py-2 font-medium">Provider</th>
                  <th className="px-3 py-2 font-medium">תוצאה</th>
                  <th className="px-3 py-2 font-medium">שאלה</th>
                </tr>
              </thead>
              <tbody>
                {probes.recent.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(r.timestamp).toLocaleString('he-IL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-700">{r.provider}</td>
                    <td className="px-3 py-2">
                      {r.error ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          ⚠️ שגיאה
                        </span>
                      ) : r.cited ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          ✅ מצוטט
                        </span>
                      ) : r.mentioned ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          📝 אזכור
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          ❌ לא הופיע
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-800" title={r.query}>
                      {r.query.length > 70 ? `${r.query.slice(0, 70)}…` : r.query}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

// =============================================================================
// TAB: REFERRALS
// =============================================================================

function ReferralsTab({
  referrals,
  liveRetrievalCrawls,
}: {
  referrals: BotAnalyticsData['referrals'];
  liveRetrievalCrawls: number;
}) {
  const total = referrals.total;
  const conversionPct = liveRetrievalCrawls > 0 ? Math.round((total / liveRetrievalCrawls) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-blue-900">משתמשים שלחצו על קישור בתשובת LLM</h2>
            <p className="mt-1 max-w-2xl text-sm text-blue-900/90">
              <strong>זו ההמרה האמיתית.</strong> ה-LLM נתן תשובה שמכילה קישור ל-WeCcelerate, והמשתמש <strong>לחץ עליו</strong>.
              הוכחה שהציטוט לא רק קיים — אלא משכנע מספיק לקליק.
            </p>
          </div>
          <div className="text-end">
            <div className="text-4xl font-bold text-blue-900">{total}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">קליקים סה"כ</div>
          </div>
        </div>
      </section>

      {/* Per-source */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">פילוח לפי מקור</h3>
        {referrals.perSource.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {referrals.perSource.slice(0, 8).map((r) => (
              <div key={r.bot} className="rounded-lg border border-slate-200 p-3">
                <div className="text-[11px] font-medium text-slate-500">{r.bot}</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{r.count}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
            עוד אף משתמש לא לחץ על קישור מ-LLM. כשזה יקרה — תקבל מייל אוטומטי.
          </div>
        )}
      </section>

      {/* Conversion */}
      {liveRetrievalCrawls > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">יחס המרה — Citation → Click</h3>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-4xl font-bold text-slate-900">{conversionPct}%</div>
            <div className="text-xs text-slate-500">
              {total} קליקים מתוך {liveRetrievalCrawls} ציטוטים
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full ${conversionPct >= 30 ? 'bg-emerald-500' : conversionPct >= 10 ? 'bg-amber-500' : 'bg-slate-400'}`}
              style={{ width: `${Math.min(Math.max(conversionPct, 3), 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-600">
            {conversionPct >= 30
              ? '✅ מצוין — הקישור משכנע. שמור על המומנטום.'
              : conversionPct >= 10
              ? '⚖️ סביר. נסה לחזק את ה-meta description כדי להגדיל קליקים.'
              : '⚠️ נמוך — נסה לחזק כותרות ו-meta description כדי לפתות יותר קליקים.'}
          </p>
        </section>
      )}

      {/* First/last */}
      {referrals.first && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">קליק ראשון אי פעם</div>
            <div className="mt-1 text-base font-semibold text-slate-900">{relativeTime(referrals.first.timestamp)}</div>
            <div className="mt-1 text-xs text-slate-600">
              {referrals.first.bot} → <code className="text-[11px]">{referrals.first.path}</code>
              {referrals.first.city && ` · ${referrals.first.city}`}
              {referrals.first.country && ` ${countryLabel(referrals.first.country).flag}`}
            </div>
          </div>
          {referrals.last && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">קליק אחרון</div>
              <div className="mt-1 text-base font-semibold text-slate-900">{relativeTime(referrals.last.timestamp)}</div>
              <div className="mt-1 text-xs text-slate-600">
                {referrals.last.bot} → <code className="text-[11px]">{referrals.last.path}</code>
                {referrals.last.city && ` · ${referrals.last.city}`}
                {referrals.last.country && ` ${countryLabel(referrals.last.country).flag}`}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// =============================================================================
// TAB: PLAN — David's weekly schedule + writing conditions
// =============================================================================

const WEEKDAY_HE: Record<BotAnalyticsData['plan']['today']['day'], string> = {
  sunday: 'ראשון',
  monday: 'שני',
  tuesday: 'שלישי',
  wednesday: 'רביעי',
  thursday: 'חמישי',
  friday: 'שישי',
  saturday: 'שבת',
};

const PROBE_FOCUS_HE: Record<string, string> = {
  'brand-en': 'ברנד EN',
  'brand-he': 'ברנד HE',
  'generic-en': 'גנרי EN',
  'generic-he': 'גנרי HE',
  service: 'שירותים',
  medtech: 'MedTech',
};

function PlanTab({ plan }: { plan: BotAnalyticsData['plan'] }) {
  const willWriteToday =
    plan.today.shouldWrite &&
    plan.conditions.every((c) => c.ok || c.label === 'נושאים שטרם כוסו זמינים');

  return (
    <div className="space-y-6">
      {/* TODAY card */}
      <section className={`rounded-xl border-2 p-5 ${
        willWriteToday
          ? 'border-emerald-300 bg-emerald-50/40'
          : 'border-slate-300 bg-slate-50'
      }`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                היום · {WEEKDAY_HE[plan.today.day]}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{plan.today.label}</h2>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-700">{plan.today.description}</p>
          </div>
          <div className="text-end">
            <div className={`text-2xl font-bold ${willWriteToday ? 'text-emerald-700' : 'text-slate-500'}`}>
              {willWriteToday ? '✍️ כותב' : '⏸ לא כותב'}
            </div>
            <div className="text-[11px] text-slate-500">היום</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white/70 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Probe focus</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {plan.today.probeFocus.length === 0 ? (
                <span className="text-xs text-slate-400">קדנציה רגילה</span>
              ) : (
                plan.today.probeFocus.map((c) => (
                  <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                    {PROBE_FOCUS_HE[c] ?? c}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="rounded-lg bg-white/70 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">כתיבה</div>
            <div className={`mt-1 text-lg font-bold ${plan.today.shouldWrite ? 'text-emerald-700' : 'text-slate-400'}`}>
              {plan.today.shouldWrite ? '✓ כן' : '— לא'}
            </div>
          </div>
          <div className="rounded-lg bg-white/70 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Self-improve</div>
            <div className={`mt-1 text-lg font-bold ${plan.today.shouldImprove ? 'text-emerald-700' : 'text-slate-400'}`}>
              {plan.today.shouldImprove ? '✓ כן' : '— לא'}
            </div>
          </div>
          <div className="rounded-lg bg-white/70 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pool שאילתות</div>
            <div className="mt-1 text-lg font-bold text-slate-900">{plan.probePoolSize}</div>
            <div className="text-[10px] text-slate-500">בסך הכל ב-rotation</div>
          </div>
        </div>
      </section>

      {/* BIWEEKLY STRATEGIC PLAN — Claude-generated every 14 days */}
      {plan.latestReplan && <BiweeklyPlanCard replan={plan.latestReplan} />}

      {/* JOURNAL — wins + failures David remembers */}
      {plan.journal && <JournalCard journal={plan.journal} />}

      {/* WRITING CONDITIONS — the gate-by-gate checklist */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-1 text-base font-semibold text-slate-900">תנאי לכתיבה של מאמר חדש</h3>
        <p className="mb-4 text-xs text-slate-500">
          דוד עובר את הרצף הזה לפני שמאמר עולה לאוויר. אם תנאי אחד לא מתקיים — הסטייג'
          מדלג ולא מתבזבזות פעולות API.
        </p>

        <ol className="space-y-2">
          {plan.conditions.map((c, i) => (
            <li
              key={c.label}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                c.ok
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                c.ok ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                {c.ok ? '✓' : i + 1}
              </span>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${c.ok ? 'text-emerald-900' : 'text-slate-700'}`}>
                  {c.label}
                </div>
                <div className={`mt-0.5 text-xs ${c.ok ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {c.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Quality gates — these always apply, displayed for transparency */}
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            שערי איכות (אחרי הכתיבה — אם נכשל, המאמר לא מתפרסם)
          </div>
          <ul className="space-y-2">
            {plan.qualityGates.map((g) => (
              <li key={g.label} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900">
                  ⚖
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-900">{g.label}</div>
                  <div className="mt-0.5 text-xs text-amber-800">{g.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* QUEUE — what's next in line */}
      {plan.openGapsTop5.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-base font-semibold text-slate-900">תור הכתיבה — top 5</h3>
            <span className="text-xs text-slate-500">{plan.openGapsCount} פערים פתוחים בסה"כ</span>
          </div>
          <ol className="space-y-2">
            {plan.openGapsTop5.map((g, i) => (
              <li key={g.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{g.query}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${
                      g.severity >= 90
                        ? 'bg-red-100 text-red-700'
                        : g.severity >= 60
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      severity {g.severity}
                    </span>
                    {g.category && <span>קטגוריה: {g.category}</span>}
                    <span>זוהה לפני {g.ageDays} ימים</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* RECENTLY WRITTEN — David's memory */}
      {plan.recentGuides.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-1 text-base font-semibold text-slate-900">הזיכרון של דוד — מה כתב לאחרונה</h3>
          <p className="mb-3 text-xs text-slate-500">
            דוד לא יכתוב על נושאים שכבר כיסה ב-30 ימים אחרונים. {plan.recentGuidesCount} מאמרים בזיכרון.
          </p>
          <ul className="space-y-1.5">
            {plan.recentGuides.map((g) => (
              <li key={g.slug} className="flex items-center gap-3 text-sm">
                <span className="text-slate-400" aria-hidden>📘</span>
                <a
                  href={`https://weccelerate.co.il/guides/${g.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-slate-700 hover:text-slate-900 hover:underline"
                >
                  {g.titleHe}
                </a>
                <span className="text-[11px] text-slate-400">
                  {g.publishedAt ? new Date(g.publishedAt).toLocaleDateString('he-IL') : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* WEEKLY SCHEDULE */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-base font-semibold text-slate-900">תוכנית שבועית של דוד</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">יום</th>
                <th className="px-3 py-2 font-medium">מיקוד</th>
                <th className="px-3 py-2 font-medium">Probe</th>
                <th className="px-3 py-2 font-medium text-center">✍️</th>
                <th className="px-3 py-2 font-medium text-center">🔧</th>
              </tr>
            </thead>
            <tbody>
              {plan.weekly.map((d) => {
                const isToday = d.day === plan.today.day;
                return (
                  <tr
                    key={d.day}
                    className={`border-t border-slate-100 ${isToday ? 'bg-emerald-50/40 font-semibold' : ''}`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="text-sm text-slate-900">{WEEKDAY_HE[d.day]}</div>
                      {isToday && <div className="text-[10px] text-emerald-700">היום</div>}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-sm text-slate-800">{d.label.replace(/^.+ — /, '')}</div>
                      <div className="text-[11px] font-normal text-slate-500">{d.description}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {d.probeFocus.length === 0 ? (
                          <span className="text-[11px] text-slate-400">—</span>
                        ) : (
                          d.probeFocus.map((c) => (
                            <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                              {PROBE_FOCUS_HE[c] ?? c}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {d.shouldWrite ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {d.shouldImprove ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* TOMORROW preview */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">🔮 מחר</div>
        <div className="mt-1 text-sm font-bold text-amber-900">
          {WEEKDAY_HE[plan.tomorrow.day]} · {plan.tomorrow.label}
        </div>
        <p className="mt-1 text-xs text-amber-800">{plan.tomorrow.description}</p>
      </section>

      {/* 14-DAY FORECAST */}
      <ForecastSection forecast={plan.forecast} />
    </div>
  );
}

function BiweeklyPlanCard({ replan }: { replan: NonNullable<BotAnalyticsData['plan']['latestReplan']> }) {
  const ageDays = Math.floor((Date.now() - new Date(replan.date).getTime()) / 86_400_000);
  const isFresh = ageDays < 14;

  return (
    <section className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-200 px-2.5 py-0.5 text-xs font-bold text-violet-900">
              📋 התוכנית של דוד לשבועיים הקרובים
            </span>
          </div>
          <h2 className="mt-2 text-lg font-bold text-violet-900">{replan.plan.theme}</h2>
        </div>
        <div className="text-end">
          <div className="text-[11px] font-medium text-violet-700">
            הוכנה לפני {ageDays === 0 ? 'היום' : `${ageDays} ימים`}
          </div>
          <div className="text-[10px] text-violet-600">
            {isFresh ? 'תקפה — דוד מתבסס עליה' : 'תוכנית הבאה תיווצר ב-cron הקרוב'}
          </div>
        </div>
      </div>

      {replan.plan.rawMemo && (
        <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm leading-relaxed text-violet-900">
          {replan.plan.rawMemo}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {replan.plan.invest.length > 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              ⬆️ להעמיק כאן (עבד)
            </div>
            <ul className="mt-2 space-y-1 text-sm text-emerald-900">
              {replan.plan.invest.map((item, i) => (
                <li key={i}>· {item}</li>
              ))}
            </ul>
          </div>
        )}
        {replan.plan.deprioritize.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              ⬇️ להאט כאן (לא הוכיח את עצמו)
            </div>
            <ul className="mt-2 space-y-1 text-sm text-amber-900">
              {replan.plan.deprioritize.map((item, i) => (
                <li key={i}>· {item}</li>
              ))}
            </ul>
          </div>
        )}
        {replan.plan.newQueries.length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              💭 שאילתות חדשות מומלצות
            </div>
            <ul className="mt-2 space-y-1 text-sm text-blue-900">
              {replan.plan.newQueries.map((item, i) => (
                <li key={i}>· {item}</li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-blue-700">
              דוד ממליץ — דורש הוספה ידנית ל-PROBE_QUERIES
            </p>
          </div>
        )}
        {replan.plan.warnings.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-red-700">
              ⚠️ אזהרות
            </div>
            <ul className="mt-2 space-y-1 text-sm text-red-900">
              {replan.plan.warnings.map((item, i) => (
                <li key={i}>· {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function JournalCard({ journal }: { journal: NonNullable<BotAnalyticsData['plan']['journal']> }) {
  const hasContent = journal.wins.length > 0 || journal.failures.length > 0 || journal.insights.length > 0;
  if (!hasContent) {
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-base font-semibold text-slate-900">📓 הזיכרון של דוד</h3>
        <p className="mt-1 text-xs text-slate-500">
          עוד אין אירועים ב-{journal.windowDays} הימים האחרונים. הזיכרון יתמלא אחרי שדוד יתחיל לפרסם ולקבל ציטוטים.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">📓 הזיכרון של דוד — {journal.windowDays} ימים אחרונים</h3>
        <p className="text-xs text-slate-500">
          דוד מצרף את זה לכל prompt — מחקה את מה שהצליח, נמנע ממה שנכשל.
        </p>
      </div>

      {journal.insights.length > 0 && (
        <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">💡 תובנות אוטומטיות</div>
          <ul className="mt-2 space-y-1 text-sm text-indigo-900">
            {journal.insights.map((i, idx) => (
              <li key={idx}>· {i}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            ✅ מה הצליח ({journal.wins.length})
          </div>
          {journal.wins.length === 0 ? (
            <p className="text-xs text-slate-400">עוד אין wins ברשומה.</p>
          ) : (
            <ul className="space-y-2">
              {journal.wins.slice(0, 6).map((w, i) => (
                <li key={i} className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                  <div className="text-sm font-semibold text-emerald-900">{w.title}</div>
                  <div className="mt-0.5 text-xs text-emerald-700">{w.detail}</div>
                  <div className="mt-1 text-[10px] text-emerald-600">
                    {new Date(w.date).toLocaleDateString('he-IL')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-700">
            ❌ מה נכשל ({journal.failures.length})
          </div>
          {journal.failures.length === 0 ? (
            <p className="text-xs text-slate-400">אין כישלונות ברשומה — מצוין.</p>
          ) : (
            <ul className="space-y-2">
              {journal.failures.slice(0, 6).map((f, i) => (
                <li
                  key={i}
                  className={`rounded-lg border p-3 ${
                    f.repeatCount >= 2
                      ? 'border-red-300 bg-red-50/60'
                      : 'border-amber-200 bg-amber-50/40'
                  }`}
                >
                  <div className={`text-sm font-semibold ${f.repeatCount >= 2 ? 'text-red-900' : 'text-amber-900'}`}>
                    {f.title}
                    {f.repeatCount > 1 && (
                      <span className="ms-2 rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-bold text-red-800">
                        חזר {f.repeatCount}x
                      </span>
                    )}
                  </div>
                  <div className={`mt-0.5 text-xs ${f.repeatCount >= 2 ? 'text-red-700' : 'text-amber-700'}`}>
                    {f.detail.length > 200 ? `${f.detail.slice(0, 200)}…` : f.detail}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    {new Date(f.date).toLocaleDateString('he-IL')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ForecastSection({ forecast }: { forecast: BotAnalyticsData['plan']['forecast'] }) {
  const [expandedDay, setExpandedDay] = useState<string | null>(forecast.days[0]?.date ?? null);

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-base font-semibold text-slate-900">תחזית 14 ימים — מה דוד יעשה</h3>
          <span className="text-xs text-slate-500">לחץ על יום לפירוט מלא</span>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          התחזית דטרמיניסטית — מבוססת על תוכנית השבוע + cadence של כל שאילתה + תור פערים פתוח.
          לחיצה על יום מציגה איזה probes ירוצו ומה ייכתב.
        </p>

        <div className="space-y-2">
          {forecast.days.map((day, i) => {
            const isExpanded = expandedDay === day.date;
            const isToday = i === 0;
            const dateLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('he-IL', {
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={day.date}
                className={`rounded-lg border ${
                  isToday
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : isExpanded
                      ? 'border-slate-300 bg-slate-50/60'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                  className="flex w-full items-center gap-3 p-3 text-start"
                >
                  <div className="flex w-16 flex-col items-center">
                    <div className="text-[10px] font-medium uppercase text-slate-500">
                      {WEEKDAY_HE[day.weekday]}
                    </div>
                    <div className={`text-sm font-bold ${isToday ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {dateLabel}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{day.label}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>📡 {day.scheduledProbes.length} probes</span>
                      {day.shouldWrite && day.plannedWrite && (
                        <span className="text-emerald-700">✍️ {day.plannedWrite.query.slice(0, 50)}{day.plannedWrite.query.length > 50 ? '…' : ''}</span>
                      )}
                      {day.shouldWrite && !day.plannedWrite && <span className="text-slate-400">✍️ אין נושא</span>}
                      {day.shouldImprove && <span className="text-blue-700">🔧 self-improve</span>}
                      {!day.shouldWrite && !day.shouldImprove && <span className="text-slate-400">⏸ שקט</span>}
                    </div>
                  </div>

                  <span className={`text-slate-400 transition ${isExpanded ? 'rotate-180' : ''}`} aria-hidden>
                    ⌄
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-200 p-3">
                    <p className="text-xs text-slate-600">{day.description}</p>

                    {day.notes.length > 0 && (
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-500">
                        {day.notes.map((n, j) => (
                          <li key={j}>· {n}</li>
                        ))}
                      </ul>
                    )}

                    {/* Probes for the day */}
                    {day.scheduledProbes.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          📡 שאילתות שיישאלו ({day.scheduledProbes.length})
                        </div>
                        <ul className="mt-1.5 space-y-1">
                          {day.scheduledProbes.map((p, j) => (
                            <li key={`${p.query}-${j}`} className="flex items-start gap-2 text-[11px]">
                              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                {PROBE_FOCUS_HE[p.category] ?? p.category}
                              </span>
                              <span className="flex-1 text-slate-700">{p.query}</span>
                              <span className="text-[10px] text-slate-400">
                                {p.lastAskedDays === 'fresh' ? 'חדשה' : `אחרון: ${p.lastAskedDays}d`}
                                {' · קדנציה '}
                                {p.cadenceDays}d
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Planned write */}
                    {day.plannedWrite && (
                      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          ✍️ מאמר מתוכנן
                        </div>
                        <div className="mt-1 text-sm font-medium text-emerald-900">{day.plannedWrite.query}</div>
                        <div className="mt-0.5 text-[11px] text-emerald-700">
                          severity {day.plannedWrite.severity}
                          {day.plannedWrite.category && ` · קטגוריה ${day.plannedWrite.category}`}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-query schedule — every query, when it's next due */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-base font-semibold text-slate-900">לוח זמנים לכל שאילתה</h3>
          <span className="text-xs text-slate-500">28 שאילתות בpool, ממוין לפי הקרוב ביותר</span>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          זו הוכחה שדוד לא חוזר על אותה שאלה. כל שאילתה נשאלת רק כשעברה הקדנציה שלה (7/14/21/28 יום).
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">שאילתה</th>
                <th className="px-3 py-2 font-medium">קטגוריה</th>
                <th className="px-3 py-2 font-medium">קדנציה</th>
                <th className="px-3 py-2 font-medium">נשאלה לאחרונה</th>
                <th className="px-3 py-2 font-medium">תיבדק שוב</th>
              </tr>
            </thead>
            <tbody>
              {forecast.perQuerySchedule.map((s) => {
                const isDueSoon = s.daysUntilNextAsk <= 1;
                const lastAskedLabel = s.lastAskedAt
                  ? new Date(s.lastAskedAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })
                  : '— מעולם לא';
                return (
                  <tr key={s.query} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-800">{s.query}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                        {PROBE_FOCUS_HE[s.category] ?? s.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-500">
                      כל {s.cadenceDays} ימים
                    </td>
                    <td className="px-3 py-2 text-slate-500">{lastAskedLabel}</td>
                    <td className="px-3 py-2">
                      {isDueSoon ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                          {s.daysUntilNextAsk === 0 ? 'היום' : 'מחר'}
                        </span>
                      ) : (
                        <span className="text-slate-600">בעוד {s.daysUntilNextAsk} ימים</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// =============================================================================
// TAB: BOT ACTIVITY (crawls + recent table)
// =============================================================================

type Window = 'last7d' | 'last30d' | 'allTime';
const WINDOW_LABELS: Record<Window, string> = {
  last7d: '7 ימים',
  last30d: '30 ימים',
  allTime: 'מאז ומתמיד',
};

function BotsTab({ data }: { data: BotAnalyticsData }) {
  const [activeWindow, setActiveWindow] = useState<Window>('last30d');
  const [botFilter, setBotFilter] = useState<string | 'ALL'>('ALL');
  const [kindFilter, setKindFilter] = useState<'all' | 'crawl' | 'referral'>('all');

  const perBot = data.perBot[activeWindow];

  const timeline = useMemo(() => {
    if (botFilter === 'ALL') return data.timeline;
    return data.timeline.map((row) => {
      const next: Record<string, number | string> = { day: row.day };
      next[botFilter] = (row[botFilter] as number | undefined) ?? 0;
      return next;
    });
  }, [botFilter, data.timeline]);

  const filteredRecent = useMemo(() => {
    let result = data.recent;
    if (kindFilter !== 'all') result = result.filter((r) => r.kind === kindFilter);
    if (botFilter !== 'ALL') result = result.filter((r) => r.bot === botFilter);
    return result;
  }, [botFilter, kindFilter, data.recent]);

  const botsToPlot = botFilter === 'ALL' ? data.botsSeen.slice(0, 6) : [botFilter];

  return (
    <div className="space-y-6">
      {/* Window selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">חלון זמן:</span>
        {(Object.keys(WINDOW_LABELS) as Window[]).map((w) => (
          <button
            key={w}
            onClick={() => setActiveWindow(w)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              activeWindow === w
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {WINDOW_LABELS[w]} ({(data.totals[w] ?? 0).toLocaleString('he-IL')})
          </button>
        ))}
      </div>

      {/* Per-bot bar chart */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          ביקורים לפי bot — {WINDOW_LABELS[activeWindow]}
        </h3>
        {perBot.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">אין נתונים בחלון הזה.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={perBot} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="bot" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
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

      {/* Top paths (full list) */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-slate-900">10 הדפים המבוקרים ביותר (30 יום)</h3>
        <p className="mb-3 text-[11px] text-slate-500">
          <strong>נתיב</strong> = הכתובת באתר שהבוט נכנס אליה.
        </p>
        {data.topPaths30d.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">אין נתונים.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="py-2 font-medium">#</th>
                  <th className="py-2 font-medium">דף</th>
                  <th className="py-2 font-medium">נתיב</th>
                  <th className="py-2 font-medium text-end">ביקורים</th>
                </tr>
              </thead>
              <tbody>
                {data.topPaths30d.map((row, i) => {
                  const p = pathLabel(row.path);
                  return (
                    <tr key={row.path} className="border-b border-slate-100">
                      <td className="py-2 text-slate-400">{i + 1}</td>
                      <td className="py-2 text-slate-800">
                        <span className="me-1" aria-hidden>{p.icon}</span>
                        {p.label}
                      </td>
                      <td className="py-2 font-mono text-[11px] text-slate-500">{row.path}</td>
                      <td className="py-2 text-end font-semibold">{row.count.toLocaleString('he-IL')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          ציר זמן — ביקורים יומיים (30 יום)
          {botFilter !== 'ALL' ? ` · סינון: ${botFilter}` : ''}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
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

      {/* Recent visits with filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">50 ביקורים אחרונים</h3>
          <div className="flex gap-1.5">
            {(['all', 'crawl', 'referral'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                  kindFilter === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k === 'all' ? 'הכל' : k === 'crawl' ? '🤖 Crawl' : '👤 Referral'}
              </button>
            ))}
          </div>
        </div>

        {/* Bot filter */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500">סינון לפי bot:</span>
          <button
            onClick={() => setBotFilter('ALL')}
            className={`rounded-full px-2.5 py-0.5 text-xs transition ${
              botFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            הכל
          </button>
          {data.botsSeen.map((b) => (
            <button
              key={b}
              onClick={() => setBotFilter(b)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition ${
                botFilter === b ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={botFilter === b ? { backgroundColor: data.botColors[b] ?? '#475569' } : {}}
            >
              {b}
            </button>
          ))}
        </div>

        <Disclosure summary="ℹ️ למה Crawl לא מראה את המיקום של המשתמש?">
          <p className="text-xs leading-relaxed">
            ב-<strong>🤖 Crawl</strong> ה-IP הוא של ה-data center של ה-LLM (OpenAI/Anthropic POPs בשווייץ/ספרד/ארה"ב), לא של המשתמש שאל את השאלה. <strong>משתמש בישראל ששואל ChatGPT — הסריקה תגיע מ-OpenAI, לא מישראל.</strong>
            <br />
            ב-<strong>👤 Referral</strong> ה-IP <strong>הוא של המשתמש האמיתי</strong> — הוא לחץ על הקישור והגיע ישר לאתר. כאן רואים מאיזו עיר הוא בא.
          </p>
        </Disclosure>

        {filteredRecent.length === 0 ? (
          <div className="mt-4 py-8 text-center text-sm text-slate-500">אין ביקורים לסינון הזה.</div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">זמן</th>
                  <th className="px-3 py-2 font-medium">סוג</th>
                  <th className="px-3 py-2 font-medium">מקור</th>
                  <th className="px-3 py-2 font-medium">דף</th>
                  <th className="px-3 py-2 font-medium">מיקום</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((r) => {
                  const p = pathLabel(r.path);
                  const isReferral = r.kind === 'referral';
                  const loc = locationDisplay(r.kind, r.city, r.country);
                  return (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-500" title={new Date(r.timestamp).toLocaleString('he-IL')}>
                        {new Date(r.timestamp).toLocaleString('he-IL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-3 py-2">
                        {isReferral ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                            👤 Referral
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            🤖 Crawl
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: data.botColors[r.bot] ?? '#64748b' }}
                        >
                          {r.bot}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-800" title={r.path}>
                        <span className="me-1" aria-hidden>{p.icon}</span>
                        {p.label}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={loc.muted ? 'text-slate-400' : 'font-semibold text-slate-700'}
                          title={loc.tooltip}
                        >
                          {loc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// MAIN ENTRY
// =============================================================================

export function BotAnalyticsDashboard({ data }: { data: BotAnalyticsData }) {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div>
      {/* Hero KPI strip */}
      <div className="mb-6">
        <HeroKpi data={data} />
      </div>

      {/* Sticky tab bar */}
      <TabBar active={tab} onSelect={setTab} />

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab data={data} />}
      {tab === 'plan' && <PlanTab plan={data.plan} />}
      {tab === 'geo' && <GeoProbeTab probes={data.probes} />}
      {tab === 'referrals' && (
        <ReferralsTab referrals={data.referrals} liveRetrievalCrawls={data.geo.counts.liveRetrieval} />
      )}
      {tab === 'bots' && <BotsTab data={data} />}
    </div>
  );
}
