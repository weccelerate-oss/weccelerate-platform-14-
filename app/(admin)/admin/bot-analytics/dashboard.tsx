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
import { countryLabel } from '@/lib/seo/country-names';

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
}

// Friendly Hebrew label for what a URL path actually is on the site.
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

/**
 * For CRAWL events the IP comes from the LLM provider's edge data center
 * (OpenAI/Anthropic/Perplexity POPs), NOT from the user who asked the question.
 * A user in Tel Aviv asking ChatGPT can trigger a crawl from any OpenAI POP
 * worldwide. We label these "📡 דרך {city}" to make that clear.
 *
 * For REFERRAL events the IP IS the actual user — they clicked a link in the
 * LLM answer and landed on our site directly. We label those "👤 {city}".
 */
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
    tooltip:
      'מיקום אמיתי של המשתמש שלחץ על הקישור בתשובת ה-LLM (לא ה-LLM עצמו).',
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

// =============================================================================
// CATEGORY CONTENT — explains each bot category in detail. Always visible so
// the dashboard is self-explanatory; no hover/click needed.
// =============================================================================

interface CategoryDetail {
  emoji: string;
  label: string;
  bots: string[];
  whatIsIt: string;
  whenItFires: string;
  meaning: string;
  expectedFrequency: string;
}

const CATEGORY_DETAILS: Record<'training' | 'search' | 'liveRetrieval', CategoryDetail> = {
  training: {
    emoji: '🟡',
    label: 'Training Crawlers — אימון מודלים',
    bots: ['GPTBot (OpenAI)', 'ClaudeBot (Anthropic)', 'Google-Extended (Gemini)', 'CCBot (Common Crawl)', 'Meta-ExternalAgent', 'Bytespider (TikTok/Doubao)', 'Amazonbot', 'cohere-ai'],
    whatIsIt: 'בוטים שסורקים את האתר באופן אוטומטי כדי להזין למודל AI חדש בעתיד.',
    whenItFires: 'רץ ברקע פעם ב-3-14 ימים, לא קשור למשתמשים. מתחיל אחרי שה-URL נכנס ל-Bing/Google index.',
    meaning: 'התוכן שלך יהיה זמין ל-LLMs בעדכון הבא של ה-knowledge cutoff (חודשים-שנה). זה לא ציטוט בפועל, אבל "זרע" לציטוטים עתידיים.',
    expectedFrequency: 'יציב: 5-30 ביקורים בשבוע אחרי חודש',
  },
  search: {
    emoji: '🔵',
    label: 'Search Index — בונים את גרף הציטוט',
    bots: ['PerplexityBot', 'OAI-SearchBot (ChatGPT Search)', 'DuckAssistBot'],
    whatIsIt: 'בוטים של מנועי AI שבונים אינדקס לציטוט בזמן שאלה. ChatGPT Search ו-Perplexity מסתמכים עליהם.',
    whenItFires: 'נכנסים לאחר שמנוע ה-AI גילה שהאתר רלוונטי (דרך sitemap או דרך Bing). פועלים פעם ביום עד פעם בשבוע.',
    meaning: 'ה-LLM "יודע" על האתר שלך ומוכן לצטט אותו. ציטוטים live retrieval אמורים להתחיל תוך ימים-שבועות.',
    expectedFrequency: 'יציב: 10-50 ביקורים בשבוע אחרי שבועיים',
  },
  liveRetrieval: {
    emoji: '🟢',
    label: 'Live Retrieval — ציטוטים אמיתיים ⭐',
    bots: ['ChatGPT-User (משתמש ChatGPT עם web)', 'Perplexity-User', 'Claude-Web (משתמש Claude.ai)'],
    whatIsIt: 'הסיגנל הכי חזק. בוט שנשלח ב**זמן אמת** כשמשתמש שאל את ה-LLM שאלה, וה-LLM החליט לגלוש לאתר שלך כדי לצטט בתשובה.',
    whenItFires: 'רק כשמשתמש אנושי שואל שאלה רלוונטית. כל ביקור = שיחה אמיתית בה אתה מצוטט.',
    meaning: 'GEO/AEO עובד בפועל. אדם אמיתי קיבל תשובה שמכילה את התוכן שלך. זה היעד של כל המאמץ.',
    expectedFrequency: 'תלוי-באמת: יכול להיות 1 בשבוע (התחלה) עד 50+ בשבוע (אחרי שאתה brand מוכר)',
  },
};

function CategoryCard({
  category,
  count,
  details,
  highlighted,
}: {
  category: 'training' | 'search' | 'liveRetrieval';
  count: number;
  details: CategoryDetail;
  highlighted: boolean;
}) {
  const colorMap = {
    training: { border: 'border-amber-200', bg: 'bg-amber-50/40', text: 'text-amber-900', muted: 'text-amber-700' },
    search: { border: 'border-blue-200', bg: 'bg-blue-50/40', text: 'text-blue-900', muted: 'text-blue-700' },
    liveRetrieval: highlighted
      ? { border: 'border-emerald-300', bg: 'bg-emerald-50/60', text: 'text-emerald-900', muted: 'text-emerald-700' }
      : { border: 'border-slate-200', bg: 'bg-slate-50/40', text: 'text-slate-500', muted: 'text-slate-500' },
  };
  const c = colorMap[category];

  return (
    <div className={`flex h-full flex-col rounded-lg border p-5 ${c.border} ${c.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={`text-xs font-semibold uppercase tracking-wide ${c.muted}`}>
            {details.emoji} {details.label.split('—')[0].trim()}
          </div>
          <div className="text-[10px] opacity-75 ${c.muted}">{details.label.split('—')[1]?.trim()}</div>
        </div>
        <div className={`text-3xl font-bold ${c.text}`}>{count}</div>
      </div>

      <dl className="mt-4 space-y-3 text-xs">
        <div>
          <dt className={`font-semibold ${c.text}`}>מה זה?</dt>
          <dd className={`mt-0.5 ${c.muted}`}>{details.whatIsIt}</dd>
        </div>
        <div>
          <dt className={`font-semibold ${c.text}`}>מתי זה קורה?</dt>
          <dd className={`mt-0.5 ${c.muted}`}>{details.whenItFires}</dd>
        </div>
        <div>
          <dt className={`font-semibold ${c.text}`}>מה זה אומר?</dt>
          <dd className={`mt-0.5 ${c.muted}`}>{details.meaning}</dd>
        </div>
        <div>
          <dt className={`font-semibold ${c.text}`}>בוטים בקטגוריה</dt>
          <dd className={`mt-0.5 font-mono text-[11px] leading-relaxed ${c.muted}`}>
            {details.bots.join(' · ')}
          </dd>
        </div>
        <div className={`mt-3 rounded border-t pt-3 ${c.border}`}>
          <dt className={`text-[10px] uppercase tracking-wide ${c.muted}`}>תדירות צפויה</dt>
          <dd className={`mt-0.5 text-sm font-semibold ${c.text}`}>{details.expectedFrequency}</dd>
        </div>
      </dl>
    </div>
  );
}

function NextStepPanel({ geo }: { geo: BotAnalyticsData['geo'] }) {
  const { stage, counts, lastLiveRetrieval } = geo;

  let title: string;
  let body: React.ReactNode;
  let bgColor: string;

  if (stage.stage === 0) {
    title = '🚀 צעד הבא: לוודא שה-Bing index עובד';
    bgColor = 'bg-slate-50 border-slate-200';
    body = (
      <ul className="list-disc space-y-1 pr-5 text-sm text-slate-700">
        <li>בדוק ש-IndexNow פעיל: <code className="rounded bg-slate-200 px-1 text-xs">curl /api/indexnow/submit</code></li>
        <li>וודא ש-sitemap הוגש ב-Bing Webmaster Tools</li>
        <li>וודא שהאתר נטען ב-Bing search: <code>site:weccelerate.co.il</code></li>
        <li>אחרי 24-72 שעות אמורים להופיע training crawlers ראשונים</li>
      </ul>
    );
  } else if (stage.stage === 1) {
    title = '⏳ צעד הבא: להמתין ל-search index';
    bgColor = 'bg-amber-50 border-amber-200';
    body = (
      <ul className="list-disc space-y-1 pr-5 text-sm text-amber-900">
        <li>OpenAI/Anthropic סורקים אותך לאימון — סימן טוב</li>
        <li>תוך שבוע-שבועיים אמורים להופיע PerplexityBot ו-OAI-SearchBot</li>
        <li>בינתיים: פרסם תוכן חדש — כל פרסום מואץ ע"י IndexNow ומגביר את הסיכוי</li>
      </ul>
    );
  } else if (stage.stage === 2) {
    title = '🎯 צעד הבא: ציטוטים אמיתיים בדרך';
    bgColor = 'bg-blue-50 border-blue-200';
    body = (
      <ul className="list-disc space-y-1 pr-5 text-sm text-blue-900">
        <li>PerplexityBot/OAI-SearchBot מאנדקסים — ה-LLM מכיר אותך</li>
        <li>ה-ציטוט הראשון של live retrieval (ChatGPT-User/Perplexity-User) אמור להגיע תוך 1-3 שבועות</li>
        <li>תקבל מייל אוטומטי ב-`weccelerate@gmail.com` ברגע שזה קורה</li>
        <li>בינתיים: בדוק ידנית — שאל את Perplexity/ChatGPT שאלות רלוונטיות וראה אם אתה מצוטט</li>
      </ul>
    );
  } else {
    const isFresh = lastLiveRetrieval && Date.now() - new Date(lastLiveRetrieval.timestamp).getTime() < 86400000;
    title = isFresh ? '🎉 GEO פעיל! ציטוט בעוד 24 השעות' : '✅ GEO פעיל';
    bgColor = 'bg-emerald-50 border-emerald-300';
    body = (
      <ul className="list-disc space-y-1 pr-5 text-sm text-emerald-900">
        <li><strong>אתה מצוטט בפועל</strong> — משתמשים מקבלים את התוכן שלך כתשובה ב-LLMs</li>
        <li>בדוק את "10 הדפים המבוקרים" למטה — אלה הדפים שמייצרים את הציטוטים. הרחב אותם.</li>
        <li>תקבל מייל ב-`weccelerate@gmail.com` כשעוד סוג של live retrieval bot יופיע (כרגע רק {(['ChatGPT-User', 'Perplexity-User', 'Claude-Web'].filter(b => geo.firstLiveRetrieval?.bot === b).length > 0) ? 'אחד' : 'אף אחד'} מדווח)</li>
        <li>צעד הבא: להגדיל ציטוטים — Press Releases, Wikipedia, podcast appearances. כל אחד מהם מגביר את הסיכוי לעוד ציטוטים.</li>
        <li>בדיקה ידנית: שאל את ChatGPT/Perplexity "What is WeCcelerate?" ובדוק שאתה מופיע בתשובה</li>
      </ul>
    );
  }

  return (
    <div className={`mt-5 rounded-lg border p-4 ${bgColor}`}>
      <h3 className="mb-2 text-base font-bold">{title}</h3>
      {body}
    </div>
  );
}

function ReferralsCard({
  referrals,
  liveRetrievalCrawls,
}: {
  referrals: BotAnalyticsData['referrals'];
  liveRetrievalCrawls: number;
}) {
  const total = referrals.total;
  // "Conversion": for every live-retrieval crawl (LLM read our page mid-answer),
  // how many users actually clicked through? > 0 means the citation is
  // compelling enough to drive traffic, not just be silently included.
  const conversionPct =
    liveRetrievalCrawls > 0 ? Math.round((total / liveRetrievalCrawls) * 100) : 0;

  const daysSince = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(ms / 86400000);
    if (hours < 1) return 'לפני פחות משעה';
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days === 1) return 'אתמול';
    return `לפני ${days} ימים`;
  };

  return (
    <section className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-bold text-blue-900">
              👤 כניסות מ-LLMs
            </span>
            <h2 className="text-2xl font-bold text-blue-900">
              משתמשים שלחצו על הקישור בתשובת ה-LLM
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-blue-900">
            <strong>זה ההמרה האמיתית.</strong> ChatGPT/Perplexity/Claude נתנו תשובה שמכילה קישור ל-WeCcelerate, ומשתמש <strong>לחץ עליו</strong> והגיע לאתר. זה הוכחה שלא רק שהציטוט קיים — אלא שהוא משכנע מספיק לקליק.
          </p>
        </div>
        <div className="text-end">
          <div className="text-5xl font-bold text-blue-900">{total}</div>
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
            כניסות מ-LLMs
          </div>
        </div>
      </div>

      {/* Per-source breakdown */}
      {referrals.perSource.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {referrals.perSource.slice(0, 8).map((r) => (
            <div key={r.bot} className="rounded-lg border border-blue-200 bg-white p-3">
              <div className="text-xs font-medium text-blue-700">{r.bot}</div>
              <div className="text-2xl font-bold text-blue-900">{r.count}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-blue-300 bg-white/60 p-4 text-center text-sm text-blue-800">
          עדיין אף משתמש לא לחץ על קישור מ-LLM. כשזה יקרה — תקבל מייל אוטומטי.
        </div>
      )}

      {/* Conversion ratio */}
      {liveRetrievalCrawls > 0 && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-white/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
            יחס המרה (Citation → Click)
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <div className="text-3xl font-bold text-blue-900">{conversionPct}%</div>
            <div className="text-xs text-blue-700">
              ({total} כניסות / {liveRetrievalCrawls} ציטוטים)
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-700">
            על כל פעם שה-LLM שלף את הדף שלך כדי לצטט, ב-{conversionPct}% מהמקרים המשתמש גם לחץ והגיע לאתר.
            {conversionPct >= 30 ? ' מצוין — הקישור משכנע.' : conversionPct >= 10 ? ' סביר.' : ' נמוך — נסה לחזק את ה-meta description שיגרום ליותר קליקים.'}
          </p>
        </div>
      )}

      {/* First & last referrals */}
      {referrals.first && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-white/60 p-3">
            <div className="text-xs font-medium text-blue-700">כניסה ראשונה אי פעם</div>
            <div className="mt-1 text-sm font-semibold text-blue-900">
              {daysSince(referrals.first.timestamp)}
            </div>
            <div className="text-xs text-blue-700">
              {referrals.first.bot} → {referrals.first.path}
              {referrals.first.city && ` · ${referrals.first.city}`}
              {referrals.first.country && ` (${countryLabel(referrals.first.country).flag})`}
            </div>
          </div>
          {referrals.last && (
            <div className="rounded-lg border border-blue-200 bg-white/60 p-3">
              <div className="text-xs font-medium text-blue-700">כניסה אחרונה</div>
              <div className="mt-1 text-sm font-semibold text-blue-900">
                {daysSince(referrals.last.timestamp)}
              </div>
              <div className="text-xs text-blue-700">
                {referrals.last.bot} → {referrals.last.path}
                {referrals.last.city && ` · ${referrals.last.city}`}
                {referrals.last.country && ` (${countryLabel(referrals.last.country).flag})`}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

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
    const hours = Math.floor(ms / 3600000);
    if (hours < 1) return 'לפני פחות משעה';
    if (hours < 24) return `לפני ${hours} שעות`;
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

      {/* Category cards with full inline explanations */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategoryCard
          category="training"
          count={geo.counts.training}
          details={CATEGORY_DETAILS.training}
          highlighted={false}
        />
        <CategoryCard
          category="search"
          count={geo.counts.search}
          details={CATEGORY_DETAILS.search}
          highlighted={false}
        />
        <CategoryCard
          category="liveRetrieval"
          count={geo.counts.liveRetrieval}
          details={CATEGORY_DETAILS.liveRetrieval}
          highlighted={geo.counts.liveRetrieval > 0}
        />
      </div>

      {/* Dynamic next-step interpretation */}
      <NextStepPanel geo={geo} />

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

      {/* LLM Referrals — separate section that highlights real user click-throughs */}
      <ReferralsCard referrals={data.referrals} liveRetrievalCrawls={data.geo.counts.liveRetrieval} />

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
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          10 הדפים המבוקרים ביותר ע"י bots (30 ימים)
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          <strong>נתיב</strong> = הכתובת באתר שלך שהבוט נכנס אליה. <code className="rounded bg-slate-100 px-1">/</code> הוא דף הבית, <code className="rounded bg-slate-100 px-1">/en/...</code> הוא הגרסה האנגלית, <code className="rounded bg-slate-100 px-1">/guides/...</code> הוא מדריך, וכו׳.
        </p>
        {data.topPaths30d.length === 0 ? (
          <div className="py-10 text-center text-slate-500">אין נתונים.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 font-medium">#</th>
                  <th className="py-2 font-medium">דף באתר</th>
                  <th className="py-2 font-medium">URL מלא</th>
                  <th className="py-2 font-medium">ביקורים</th>
                </tr>
              </thead>
              <tbody>
                {data.topPaths30d.map((row, i) => {
                  const p = pathLabel(row.path);
                  return (
                    <tr key={row.path} className="border-b border-slate-100">
                      <td className="py-2 text-slate-500">{i + 1}</td>
                      <td className="py-2 text-slate-800">
                        <span className="me-1">{p.icon}</span>
                        {p.label}
                      </td>
                      <td className="py-2 font-mono text-xs text-slate-500">{row.path}</td>
                      <td className="py-2 font-semibold">{row.count.toLocaleString('he-IL')}</td>
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
        <h2 className="mb-1 text-lg font-semibold text-slate-900">
          50 ביקורים אחרונים{botFilter !== 'ALL' ? ` · סינון: ${botFilter}` : ''}
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          כל שורה היא <strong>אינטראקציה אחת</strong>. <span className="me-1">🤖 Crawl</span> = בוט AI הוריד את הדף (לרוב כדי לצטט בתשובה).
          <span className="ms-3 me-1">👤 Referral</span> = משתמש אמיתי <strong>לחץ</strong> על קישור בתשובת LLM והגיע לאתר.
        </p>
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <span className="text-base">⚠️</span>
          <div>
            <div className="font-semibold">חשוב — מיקום ב-Crawl ≠ מיקום של המשתמש</div>
            <p className="mt-1">
              ב-<strong>🤖 Crawl</strong> ה-IP הוא של ה-data center של ChatGPT/Perplexity/Claude (OpenAI POPs בשווייץ/ספרד/פולין/ארה"ב), לא של המשתמש שאל את השאלה. <strong>משתמש בישראל ששואל ChatGPT — הסריקה תגיע מ-OpenAI ולא מישראל.</strong>
              <br />
              ב-<strong>👤 Referral</strong> לעומת זאת ה-IP <strong>הוא של המשתמש האמיתי</strong> — הוא לחץ על הקישור והגיע ישר לאתר. כאן תוכל לראות מאיזו עיר בישראל הוא בא.
            </p>
          </div>
        </div>
        {filteredRecent.length === 0 ? (
          <div className="py-10 text-center text-slate-500">אין ביקורים לסינון הזה.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 font-medium">זמן</th>
                  <th className="py-2 font-medium">סוג</th>
                  <th className="py-2 font-medium">מקור</th>
                  <th className="py-2 font-medium">דף באתר</th>
                  <th className="py-2 font-medium">מיקום</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((r) => {
                  const p = pathLabel(r.path);
                  const isReferral = r.kind === 'referral';
                  return (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-2 text-xs text-slate-500" title={new Date(r.timestamp).toLocaleString('he-IL')}>
                        {new Date(r.timestamp).toLocaleString('he-IL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 text-xs">
                        {isReferral ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-800" title="משתמש אמיתי לחץ על קישור בתשובת LLM">
                            👤 Referral
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700" title="בוט AI הוריד את הדף">
                            🤖 Crawl
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: data.botColors[r.bot] ?? '#64748b' }}
                          title={isReferral ? 'מקור הקליק (LLM שהפנה את המשתמש)' : 'סוג הבוט'}
                        >
                          {r.bot}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-slate-800" title={r.path}>
                        <span className="me-1">{p.icon}</span>
                        {p.label}
                      </td>
                      <td className="py-2 text-xs">
                        {(() => {
                          const loc = locationDisplay(r.kind, r.city, r.country);
                          return (
                            <span
                              className={loc.muted ? 'text-slate-400' : 'font-semibold text-slate-700'}
                              title={loc.tooltip}
                            >
                              {loc.label}
                            </span>
                          );
                        })()}
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
