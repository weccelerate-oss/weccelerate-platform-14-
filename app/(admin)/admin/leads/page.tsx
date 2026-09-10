import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Mail, Phone, Building2, ShieldAlert, ShieldCheck, Send, AlertTriangle, Clock,
  Target, TrendingUp, TrendingDown, Minus, Inbox, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { ResendButton } from './ResendButton';
import { LeadsFilters } from './LeadsFilters';
import { LeadsCharts } from './LeadsCharts';
import { loadLeadDashboard, parseFilters, STATUS_LABELS, PAGE_SIZE, type LeadRecord } from '@/lib/leads/admin-queries';

export const metadata: Metadata = {
  title: 'לוח לידים | מערכת ניהול WeCcelerate',
  description: 'כל הלידים מהאתר: יעד חודשי, מקורות, מסירה ל-Pipedrive, ספאם',
};

export const dynamic = 'force-dynamic';

function scoreBadge(score: number | null): { label: string; cls: string } | null {
  if (score === null || score === undefined) return null;
  if (score >= 61) return { label: `🛑 ${score}`, cls: 'bg-red-100 text-red-700 border-red-200' };
  if (score >= 31) return { label: `⚠️ ${score}`, cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: `✓ ${score}`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
}

const STATUS_STYLES: Record<LeadRecord['status'], string> = {
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  review: 'bg-amber-50 text-amber-700 border-amber-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  rate_limited: 'bg-slate-100 text-slate-600 border-slate-200',
  blocklist: 'bg-red-50 text-red-700 border-red-200',
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem',
  }).format(date);
}

function Delivery({ lead }: { lead: LeadRecord }) {
  if (lead.status !== 'accepted') return <span className="text-xs text-slate-400">—</span>;
  const d = lead.delivery;
  if (d.status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700" title={d.at}>
        <Send className="h-3 w-3" aria-hidden="true" />נשלח
      </span>
    );
  }
  if (d.status === 'unknown' || d.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Clock className="h-3 w-3" aria-hidden="true" />לא ידוע
        <ResendButton leadId={lead.id} label="שלח" />
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700" title={d.error}>
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        {d.status === 'skipped' ? 'לא מוגדר' : 'נכשל'}
      </span>
      <ResendButton leadId={lead.id} />
    </span>
  );
}

function Kpi({
  label, value, sub, tone = 'neutral', icon: Icon,
}: { label: string; value: string | number; sub?: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold'; icon: typeof Target }) {
  const tones = {
    neutral: 'text-slate-900',
    good: 'text-emerald-700',
    warn: 'text-amber-700',
    bad: 'text-red-700',
    gold: 'text-[#9c7c2a]',
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-slate-300" aria-hidden="true" />
      </div>
      <p className={`mt-1 text-3xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function pageHref(sp: Record<string, string | string[] | undefined>, page: number): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === 'page' || v === undefined) continue;
    qs.set(k, Array.isArray(v) ? v[0] : v);
  }
  if (page > 1) qs.set('page', String(page));
  const q = qs.toString();
  return q ? `/admin/leads?${q}` : '/admin/leads';
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  let data: Awaited<ReturnType<typeof loadLeadDashboard>> | null = null;
  let loadError = '';
  try {
    data = await loadLeadDashboard(filters);
  } catch (err) {
    console.error('[Admin Leads]', err);
    loadError = err instanceof Error ? err.message : String(err);
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-red-700">טעינת הלידים נכשלה: {loadError}</p>
      </div>
    );
  }

  const k = data.kpis;
  const pct = Math.min(100, Math.round((k.monthAccepted / k.monthTarget) * 100));
  const onPace = k.monthProjected >= k.monthTarget;
  const weekDelta = k.weekAccepted - k.prevWeekAccepted;
  const WeekIcon = weekDelta > 0 ? TrendingUp : weekDelta < 0 ? TrendingDown : Minus;
  const deliveredPct = k.monthAccepted ? Math.round((k.monthSent / k.monthAccepted) * 100) : 0;
  const from = (filters.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(data.total, filters.page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="px-4 pt-14 pb-4 sm:px-8 sm:py-6 lg:pt-6">
          <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />חזרה לדשבורד
          </Link>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">לוח לידים</h1>
              <p className="mt-1 text-sm text-slate-500">
                כל פנייה מכל טופס באתר, מאיפה הגיעה, ואם הגיעה ל-Pipedrive. היעד: {k.monthTarget} לידים בחודש.
              </p>
            </div>
            <Link
              href="/admin/leads/spam-review"
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                k.reviewPending > 0 ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k.reviewPending > 0 ? <ShieldAlert className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              תור סקירת ספאם
              {k.reviewPending > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">{k.reviewPending}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-8">
        {/* KPIs — always month-to-date, independent of the table filters */}
        <section aria-label="מדדים חודשיים" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">לידים החודש מול היעד</p>
              <Target className="h-4 w-4 text-slate-300" aria-hidden="true" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-3xl font-bold tabular-nums text-slate-900">{k.monthAccepted}</p>
              <p className="text-sm text-slate-500">/ {k.monthTarget}</p>
              <p className={`ms-auto text-sm font-semibold tabular-nums ${onPace ? 'text-emerald-700' : 'text-amber-700'}`}>
                תחזית {k.monthProjected}
              </p>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-2 rounded-full ${onPace ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              יום {k.dayOfMonth} מתוך {k.daysInMonth}. {onPace ? 'בקצב הנכון.' : `צריך עוד ${Math.max(0, k.monthTarget - k.monthAccepted)} עד סוף החודש.`}
            </p>
          </div>
          <Kpi
            label="7 ימים אחרונים"
            value={k.weekAccepted}
            icon={WeekIcon}
            tone={weekDelta > 0 ? 'good' : weekDelta < 0 ? 'warn' : 'neutral'}
            sub={<>שבוע קודם: {k.prevWeekAccepted} · יעד שבועי 12</>}
          />
          <Kpi
            label="הגיעו לזאפ החודש"
            value={`${deliveredPct}%`}
            icon={Send}
            tone={deliveredPct >= 95 ? 'good' : deliveredPct >= 80 ? 'warn' : 'bad'}
            sub={<>{k.monthSent} נשלחו{k.monthUnknown ? ` · ${k.monthUnknown} ללא מעקב` : ''}</>}
          />
          <Kpi
            label="לא הגיעו לזאפ"
            value={k.failedOpen}
            icon={AlertTriangle}
            tone={k.failedOpen ? 'bad' : 'good'}
            sub={k.failedOpen ? <Link href="/admin/leads?status=failed&period=90d" className="text-red-700 underline">הצג ושלח שוב</Link> : '90 הימים האחרונים'}
          />
        </section>

        <LeadsCharts data={data} />

        {/* Table */}
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <LeadsFilters filters={filters} formOptions={data.formOptions} channelOptions={data.channelOptions} />
          </div>

          {data.rows.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="mx-auto mb-4 h-12 w-12 text-slate-300" aria-hidden="true" />
              <p className="text-slate-500">אין רשומות שמתאימות לסינון.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {['תאריך', 'שם', 'פרטי קשר', 'טופס', 'מקור הגעה', 'עמוד', 'שלב / שירות', 'Score', 'Pipedrive', 'סטטוס'].map((h) => (
                      <th key={h} className="px-3 py-3 text-start text-xs font-medium uppercase text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.rows.map((lead) => {
                    const badge = scoreBadge(lead.spamScore);
                    return (
                      <tr key={lead.id} className="transition-colors hover:bg-slate-50">
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{formatDate(lead.createdAt)}</td>
                        <td className="px-3 py-3 text-sm">
                          <Link href={`/admin/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-blue-700">{lead.name}</Link>
                          {lead.company && (
                            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                              <Building2 className="h-3 w-3" aria-hidden="true" />{lead.company}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-blue-700" dir="ltr">
                              <Phone className="h-3 w-3" aria-hidden="true" />{lead.phone}
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="mt-0.5 flex items-center gap-1 hover:text-blue-700" dir="ltr">
                              <Mail className="h-3 w-3" aria-hidden="true" />{lead.email}
                            </a>
                          )}
                          {!lead.phone && !lead.email && '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                          <div>{lead.formLabel}</div>
                          <div className="text-slate-400">{lead.siteLabel}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                          <div>{lead.channelLabel}</div>
                          {lead.campaign && <div className="text-slate-400" dir="ltr">{lead.campaign}</div>}
                        </td>
                        <td className="max-w-[180px] truncate px-3 py-3 text-xs text-slate-500" dir="ltr" title={lead.sourceUrl ?? ''}>
                          {lead.page || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                          <div>{lead.stageLabel || '—'}</div>
                          {lead.serviceLabel && <div className="text-slate-400">{lead.serviceLabel}</div>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm">
                          {badge ? (
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
                          ) : <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3"><Delivery lead={lead} /></td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[lead.status]}`}>
                            {STATUS_LABELS[lead.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-3 text-sm text-slate-500">
            <span>
              {data.total === 0 ? '0 רשומות' : `${from}–${to} מתוך ${data.total}`}
            </span>
            <div className="inline-flex items-center gap-1">
              <Link
                href={pageHref(sp, Math.max(1, filters.page - 1))}
                aria-disabled={filters.page <= 1}
                className={`inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 ${filters.page <= 1 ? 'pointer-events-none opacity-40' : 'hover:bg-slate-50'}`}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />הקודם
              </Link>
              <span className="px-2 tabular-nums">עמוד {filters.page} / {data.pageCount}</span>
              <Link
                href={pageHref(sp, Math.min(data.pageCount, filters.page + 1))}
                aria-disabled={filters.page >= data.pageCount}
                className={`inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 ${filters.page >= data.pageCount ? 'pointer-events-none opacity-40' : 'hover:bg-slate-50'}`}
              >
                הבא<ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
