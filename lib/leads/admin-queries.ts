/**
 * Read-side helpers for the admin leads dashboard (/admin/leads).
 *
 * Every lead lives in `activity_logs` as one row whose `action` says what
 * happened to it and whose `metadata` JSON carries the full record
 * (contact fields, attribution, spam score, Zapier delivery result):
 *
 *   form.*                accepted lead (form.contact_submit, form.whatsapp_gate, form.service, ...)
 *   lead.contact_fallback accepted lead, legacy path
 *   lead.spam_review      held for a human decision
 *   lead.spam_blocked     dropped as spam
 *   lead.rate_limited     dropped by the rate limiter
 *   lead.blocklist_hit    dropped by the admin blocklist
 *
 * This module turns those rows into one flat `LeadRecord`, applies the
 * dashboard filters, and computes the KPIs. Server-only (Prisma).
 */

import { prisma } from '@/lib/db';
import { FORM_TYPE_LABELS, STAGE_LABELS, SERVICE_LABELS, SITE_SOURCE_LABELS, getChannelLabel } from '@/lib/leads/zapier';

export const MONTHLY_TARGET = 50;

export type LeadStatus = 'accepted' | 'review' | 'blocked' | 'rate_limited' | 'blocklist';
export type DeliveryStatus = 'sent' | 'failed' | 'skipped' | 'pending' | 'unknown';

export interface LeadRecord {
  id: string;
  createdAt: Date;
  action: string;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  site: string;
  siteLabel: string;
  formType: string;
  formLabel: string;
  stage: string | null;
  stageLabel: string | null;
  service: string | null;
  serviceLabel: string | null;
  sourceUrl: string | null;
  page: string;
  channel: string | null;
  channelLabel: string;
  channelDetail: string | null;
  campaign: string | null;
  firstChannel: string | null;
  landingPage: string | null;
  referrerUrl: string | null;
  utm: { source: string | null; medium: string | null; campaign: string | null; content: string | null; term: string | null };
  gclid: string | null;
  fbclid: string | null;
  spamScore: number | null;
  spamReasons: string[];
  spamCodes: string[];
  delivery: { status: DeliveryStatus; attempts?: number; httpStatus?: number; error?: string; at?: string };
  reviewedAt: string | null;
  resentAt: string | null;
  rateLimitReason: string | null;
  raw: Record<string, unknown>;
}

/** Shape of an activity_logs row as this module reads it. Prisma's generated
 *  types are effectively `any` in this repo (ignoreBuildErrors), so results
 *  are cast to this explicitly. */
export type RawLeadRow = { id: string; action: string; createdAt: Date; metadata: unknown };

export interface LeadFilters {
  /** Period: 'month' (Israel calendar month to date) | 'prev' (previous calendar month)
   *  | '7d' | '30d' | '90d' | 'all' | 'custom' (from/to, inclusive Israel dates) */
  period: 'month' | 'prev' | '7d' | '30d' | '90d' | 'all' | 'custom';
  /** YYYY-MM-DD, only for period=custom. */
  from: string;
  to: string;
  status: 'all' | LeadStatus | 'failed';
  formType: string;
  channel: string;
  q: string;
  page: number;
}

export const PAGE_SIZE = 50;

const ACCEPTED_OR: Array<Record<string, unknown>> = [
  { action: { startsWith: 'form.' } },
  { action: 'lead.contact_fallback' },
];
const STATUS_ACTION: Record<Exclude<LeadStatus, 'accepted'>, string> = {
  review: 'lead.spam_review',
  blocked: 'lead.spam_blocked',
  rate_limited: 'lead.rate_limited',
  blocklist: 'lead.blocklist_hit',
};

export function statusOf(action: string): LeadStatus {
  if (action.startsWith('form.') || action === 'lead.contact_fallback') return 'accepted';
  if (action === 'lead.spam_review') return 'review';
  if (action === 'lead.spam_blocked') return 'blocked';
  if (action === 'lead.rate_limited') return 'rate_limited';
  return 'blocklist';
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  accepted: 'התקבל',
  review: 'בבדיקה',
  blocked: 'ספאם',
  rate_limited: 'הגבלת קצב',
  blocklist: 'חסום',
};

function s(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

export function mapLeadRow(row: RawLeadRow): LeadRecord {
  const m = (row.metadata as Record<string, unknown>) || {};
  const site = s(m.site) || 'main';
  const formType = s(m.formType) || (row.action.startsWith('form.') ? row.action.slice(5) : 'contact');
  const sourceUrl = s(m.sourceUrl);
  let page = '';
  try { page = sourceUrl ? new URL(sourceUrl).pathname : ''; } catch { page = sourceUrl || ''; }
  const d = (m.delivery as LeadRecord['delivery'] | undefined) || null;
  const status = statusOf(row.action);
  const stage = s(m.stage);
  const service = s(m.service);
  const channel = s(m.channel);

  return {
    id: row.id,
    createdAt: row.createdAt,
    action: row.action,
    status,
    name: s(m.name) || '—',
    email: s(m.email) || '',
    phone: s(m.phone),
    company: s(m.company),
    message: s(m.message),
    site,
    siteLabel: s(m.sourceLabel) || SITE_SOURCE_LABELS[site] || site,
    formType,
    formLabel: FORM_TYPE_LABELS[formType] || formType,
    stage,
    stageLabel: stage ? STAGE_LABELS[stage] || stage : null,
    service,
    serviceLabel: service ? SERVICE_LABELS[service] || service : null,
    sourceUrl,
    page,
    channel,
    channelLabel: getChannelLabel(channel),
    channelDetail: s(m.channelDetail),
    campaign: s(m.campaign) || s(m.utmCampaign),
    firstChannel: s(m.firstChannel),
    landingPage: s(m.landingPage),
    referrerUrl: s(m.referrerUrl),
    utm: {
      source: s(m.utmSource),
      medium: s(m.utmMedium),
      campaign: s(m.utmCampaign),
      content: s(m.utmContent),
      term: s(m.utmTerm),
    },
    gclid: s(m.gclid),
    fbclid: s(m.fbclid),
    spamScore: typeof m.spamScore === 'number' ? m.spamScore : null,
    spamReasons: Array.isArray(m.spamReasons) ? (m.spamReasons as string[]) : [],
    spamCodes: Array.isArray(m.spamCodes) ? (m.spamCodes as string[]) : [],
    delivery:
      status !== 'accepted'
        ? { status: 'skipped' }
        : d && d.status
          ? { ...d, status: (['sent', 'failed', 'skipped', 'pending'].includes(d.status) ? d.status : 'unknown') as DeliveryStatus }
          : { status: 'unknown' },
    reviewedAt: s(m.reviewedAt),
    resentAt: s(m.resentAt),
    rateLimitReason: s(m.detail) || s(m.reason),
    raw: m,
  };
}

// -----------------------------------------------------------------------------
// Filters
// -----------------------------------------------------------------------------

export function parseFilters(sp: Record<string, string | string[] | undefined>): LeadFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) || '';
  const period = one('period');
  const status = one('status');
  const pageNum = parseInt(one('page') || '1', 10);
  const isDay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  const from = isDay(one('from')) ? one('from') : '';
  const to = isDay(one('to')) ? one('to') : '';
  const custom = period === 'custom' && (from || to);
  return {
    period: (custom ? 'custom' : ['month', 'prev', '7d', '30d', '90d', 'all'].includes(period) ? period : 'month') as LeadFilters['period'],
    from: custom ? from : '',
    to: custom ? to : '',
    status: (['all', 'accepted', 'review', 'blocked', 'rate_limited', 'blocklist', 'failed'].includes(status) ? status : 'accepted') as LeadFilters['status'],
    formType: one('formType').slice(0, 40),
    channel: one('channel').slice(0, 40),
    q: one('q').slice(0, 100),
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
  };
}

/** Minutes Israel is ahead of UTC at `at` (120 in winter, 180 in summer). */
function jerusalemOffsetMin(at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jerusalem', hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).formatToParts(at).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/** 00:00 Israel time on the given Israel calendar day (month is 0-based, may overflow). */
export function jerusalemMidnight(y: number, m0: number, d: number): Date {
  const guess = new Date(Date.UTC(y, m0, d));
  return new Date(guess.getTime() - jerusalemOffsetMin(guess) * 60_000);
}

/** Today's Israel calendar date. */
export function jerusalemToday(now = new Date()): { y: number; m0: number; d: number } {
  const t = new Date(now.getTime() + jerusalemOffsetMin(now) * 60_000);
  return { y: t.getUTCFullYear(), m0: t.getUTCMonth(), d: t.getUTCDate() };
}

/** [start, end) of the filter period; null = unbounded. Months follow Israel time,
 *  so a lead at 01:00 on the 1st counts for the new month. */
export function periodRange(f: Pick<LeadFilters, 'period' | 'from' | 'to'>, now = new Date()): { start: Date | null; end: Date | null } {
  const { y, m0 } = jerusalemToday(now);
  const day = (v: string, plus = 0) => {
    const [yy, mm, dd] = v.split('-').map(Number);
    return jerusalemMidnight(yy, mm - 1, dd + plus);
  };
  switch (f.period) {
    case 'month': return { start: jerusalemMidnight(y, m0, 1), end: null };
    case 'prev': return { start: jerusalemMidnight(y, m0 - 1, 1), end: jerusalemMidnight(y, m0, 1) };
    case '7d': return { start: new Date(now.getTime() - 7 * 86_400_000), end: null };
    case '30d': return { start: new Date(now.getTime() - 30 * 86_400_000), end: null };
    case '90d': return { start: new Date(now.getTime() - 90 * 86_400_000), end: null };
    case 'custom': return { start: f.from ? day(f.from) : null, end: f.to ? day(f.to, 1) : null };
    default: return { start: null, end: null };
  }
}

export function buildWhere(f: LeadFilters): Record<string, unknown> {
  const and: Array<Record<string, unknown>> = [];
  const { start, end } = periodRange(f);
  if (start) and.push({ createdAt: { gte: start } });
  if (end) and.push({ createdAt: { lt: end } });

  if (f.status === 'all') {
    and.push({ OR: [...ACCEPTED_OR, ...Object.values(STATUS_ACTION).map((a) => ({ action: a }))] });
  } else if (f.status === 'accepted') {
    and.push({ OR: ACCEPTED_OR });
  } else if (f.status === 'failed') {
    and.push({ OR: ACCEPTED_OR });
    and.push({
      OR: [
        { metadata: { path: ['delivery', 'status'], equals: 'failed' } },
        { metadata: { path: ['delivery', 'status'], equals: 'skipped' } },
      ],
    });
  } else {
    and.push({ action: STATUS_ACTION[f.status] });
  }

  if (f.formType) and.push({ metadata: { path: ['formType'], equals: f.formType } });
  if (f.channel) and.push({ metadata: { path: ['channel'], equals: f.channel } });
  if (f.q) and.push({ description: { contains: f.q, mode: 'insensitive' } });

  return and.length ? { AND: and } : {};
}

// -----------------------------------------------------------------------------
// Dashboard data
// -----------------------------------------------------------------------------

export interface LeadDashboard {
  filters: LeadFilters;
  rows: LeadRecord[];
  total: number;
  pageCount: number;
  kpis: {
    monthAccepted: number;
    monthTarget: number;
    monthProjected: number;
    dayOfMonth: number;
    daysInMonth: number;
    weekAccepted: number;
    prevWeekAccepted: number;
    monthSent: number;
    monthFailed: number;
    monthUnknown: number;
    reviewPending: number;
    failedOpen: number;
  };
  daily: Array<{ day: string; label: string; leads: number; failed: number }>;
  byForm: Array<{ key: string; label: string; count: number }>;
  byChannel: Array<{ key: string; label: string; count: number }>;
  byPage: Array<{ page: string; count: number }>;
  byStage: Array<{ key: string; label: string; count: number }>;
  formOptions: Array<{ key: string; label: string }>;
  channelOptions: Array<{ key: string; label: string }>;
}

function countBy<T>(items: T[], key: (t: T) => string | null): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) {
    const k = key(it);
    if (!k) continue;
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

export async function loadLeadDashboard(filters: LeadFilters): Promise<LeadDashboard> {
  const now = new Date();
  const today = jerusalemToday(now);
  const monthStart = jerusalemMidnight(today.y, today.m0, 1);
  const daysInMonth = new Date(Date.UTC(today.y, today.m0 + 1, 0)).getUTCDate();
  const dayOfMonth = today.d;
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);
  const thirtyAgo = new Date(now.getTime() - 30 * 86_400_000);
  const ninetyAgo = new Date(now.getTime() - 90 * 86_400_000);
  const where = buildWhere(filters);
  const select = { id: true, action: true, createdAt: true, metadata: true } as const;

  const [total, pageRows, monthRows, weekCount, prevWeekCount, reviewPending, recentAccepted, dailyRaw] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      select,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.findMany({
      where: { AND: [{ createdAt: { gte: monthStart } }, { OR: ACCEPTED_OR }] },
      select,
      take: 2000,
    }),
    prisma.activityLog.count({ where: { AND: [{ createdAt: { gte: weekAgo } }, { OR: ACCEPTED_OR }] } }),
    prisma.activityLog.count({ where: { AND: [{ createdAt: { gte: twoWeeksAgo, lt: weekAgo } }, { OR: ACCEPTED_OR }] } }),
    prisma.activityLog.count({ where: { action: 'lead.spam_review' } }),
    prisma.activityLog.findMany({
      where: { AND: [{ createdAt: { gte: ninetyAgo } }, { OR: ACCEPTED_OR }] },
      select: { id: true, action: true, createdAt: true, metadata: true },
      take: 3000,
    }),
    prisma.$queryRaw<Array<{ day: Date; count: bigint; failed: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day,
             COUNT(*)::bigint AS count,
             COUNT(*) FILTER (WHERE "metadata"->'delivery'->>'status' IN ('failed','skipped'))::bigint AS failed
      FROM "activity_logs"
      WHERE ("action" LIKE 'form.%' OR "action" = 'lead.contact_fallback')
        AND "createdAt" >= ${thirtyAgo}
      GROUP BY day
      ORDER BY day
    `,
  ]);

  const rows = (pageRows as RawLeadRow[]).map(mapLeadRow);
  const month = (monthRows as RawLeadRow[]).map(mapLeadRow).filter((r) => r.formType !== 'newsletter');
  const monthAccepted = month.length;
  const monthProjected = dayOfMonth > 0 ? Math.round((monthAccepted / dayOfMonth) * daysInMonth) : 0;
  const monthSent = month.filter((r) => r.delivery.status === 'sent').length;
  const monthFailed = month.filter((r) => r.delivery.status === 'failed' || r.delivery.status === 'skipped').length;
  const monthUnknown = month.filter((r) => r.delivery.status === 'unknown' || r.delivery.status === 'pending').length;

  const recent = (recentAccepted as RawLeadRow[]).map(mapLeadRow);
  const failedOpen = recent.filter((r) => r.delivery.status === 'failed' || r.delivery.status === 'skipped').length;

  // Breakdowns follow the current filter's period (not its status/search),
  // so the charts always describe accepted leads in the chosen window.
  const { start, end } = periodRange(filters);
  const inPeriod = recent.filter((r) => (!start || r.createdAt >= start) && (!end || r.createdAt < end) && r.formType !== 'newsletter');
  const source = inPeriod;

  const toList = (o: Record<string, number>, label: (k: string) => string) =>
    Object.entries(o).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, label: label(key), count }));

  const byForm = toList(countBy(source, (r) => r.formType), (k) => FORM_TYPE_LABELS[k] || k);
  const byChannel = toList(countBy(source, (r) => r.channel || 'unknown'), (k) => (k === 'unknown' ? 'לא ידוע' : getChannelLabel(k)));
  const byStage = toList(countBy(source, (r) => r.stage || 'none'), (k) => (k === 'none' ? 'לא צוין' : STAGE_LABELS[k] || k));
  const byPage = Object.entries(countBy(source, (r) => r.page || null))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([page, count]) => ({ page, count }));

  // Daily series: fill every day of the last 30 so the chart has no holes.
  const dailyMap = new Map<string, { leads: number; failed: number }>();
  for (const d of dailyRaw as Array<{ day: Date; count: bigint; failed: bigint }>) {
    const key = new Date(d.day).toISOString().slice(0, 10);
    dailyMap.set(key, { leads: Number(d.count), failed: Number(d.failed) });
  }
  const daily: LeadDashboard['daily'] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    const v = dailyMap.get(key) || { leads: 0, failed: 0 };
    daily.push({ day: key, label: `${d.getDate()}/${d.getMonth() + 1}`, ...v });
  }

  const formOptions = Object.entries(FORM_TYPE_LABELS).map(([key, label]) => ({ key, label }));
  const channelKeys = Array.from(new Set(recent.map((r) => r.channel).filter((c): c is string => !!c)));
  const channelOptions = channelKeys.map((key) => ({ key, label: getChannelLabel(key) })).sort((a, b) => a.label.localeCompare(b.label, 'he'));

  return {
    filters,
    rows,
    total,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    kpis: {
      monthAccepted,
      monthTarget: MONTHLY_TARGET,
      monthProjected,
      dayOfMonth,
      daysInMonth,
      weekAccepted: weekCount,
      prevWeekAccepted: prevWeekCount,
      monthSent,
      monthFailed,
      monthUnknown,
      reviewPending,
      failedOpen,
    },
    daily,
    byForm,
    byChannel,
    byPage,
    byStage,
    formOptions,
    channelOptions,
  };
}

/** One lead by id, for the detail page. */
export async function loadLead(id: string): Promise<LeadRecord | null> {
  const row: RawLeadRow | null = await prisma.activityLog.findUnique({
    where: { id },
    select: { id: true, action: true, createdAt: true, metadata: true },
  });
  if (!row) return null;
  // Only lead-ish rows are shown here; other activity-log rows 404.
  if (!(row.action.startsWith('form.') || row.action.startsWith('lead.'))) return null;
  return mapLeadRow(row);
}

/** Every row matching the filters (no paging) — for CSV export. Capped. */
export async function loadLeadsForExport(filters: LeadFilters, cap = 5000): Promise<LeadRecord[]> {
  const rows: RawLeadRow[] = await prisma.activityLog.findMany({
    where: buildWhere(filters),
    select: { id: true, action: true, createdAt: true, metadata: true },
    orderBy: { createdAt: 'desc' },
    take: cap,
  });
  return rows.map(mapLeadRow);
}
