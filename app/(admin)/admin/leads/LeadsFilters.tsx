'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Search, X, Download } from 'lucide-react';
import type { LeadFilters } from '@/lib/leads/admin-queries';

interface Props {
  filters: LeadFilters;
  formOptions: Array<{ key: string; label: string }>;
  channelOptions: Array<{ key: string; label: string }>;
}

const PERIODS: Array<[LeadFilters['period'], string]> = [
  ['month', 'החודש'],
  ['7d', '7 ימים'],
  ['30d', '30 יום'],
  ['90d', '90 יום'],
  ['all', 'הכול'],
];

const STATUSES: Array<[LeadFilters['status'], string]> = [
  ['accepted', 'לידים שהתקבלו'],
  ['failed', 'לא הגיעו לזאפ'],
  ['review', 'ממתינים לבדיקה'],
  ['blocked', 'נחסמו כספאם'],
  ['rate_limited', 'הגבלת קצב'],
  ['blocklist', 'רשימה שחורה'],
  ['all', 'כל הרשומות'],
];

const select =
  'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400';

export function LeadsFilters({ filters, formOptions, channelOptions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  const apply = (patch: Partial<LeadFilters>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    const qs = new URLSearchParams();
    if (next.period !== 'month') qs.set('period', next.period);
    if (next.status !== 'accepted') qs.set('status', next.status);
    if (next.formType) qs.set('formType', next.formType);
    if (next.channel) qs.set('channel', next.channel);
    if (next.q) qs.set('q', next.q);
    if (next.page > 1) qs.set('page', String(next.page));
    start(() => router.push(qs.toString() ? `${pathname}?${qs}` : pathname));
  };

  const exportQs = new URLSearchParams();
  exportQs.set('period', filters.period);
  exportQs.set('status', filters.status);
  if (filters.formType) exportQs.set('formType', filters.formType);
  if (filters.channel) exportQs.set('channel', filters.channel);
  if (filters.q) exportQs.set('q', filters.q);

  const active = filters.formType || filters.channel || filters.q;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${pending ? 'opacity-60' : ''}`}>
      <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5" role="group" aria-label="תקופה">
        {PERIODS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => apply({ period: k })}
            aria-pressed={filters.period === k}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filters.period === k ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="sr-only" htmlFor="f-status">סטטוס</label>
      <select id="f-status" className={select} value={filters.status} onChange={(e) => apply({ status: e.target.value as LeadFilters['status'] })}>
        {STATUSES.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
      </select>

      <label className="sr-only" htmlFor="f-form">טופס</label>
      <select id="f-form" className={select} value={filters.formType} onChange={(e) => apply({ formType: e.target.value })}>
        <option value="">כל הטפסים</option>
        {formOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>

      <label className="sr-only" htmlFor="f-channel">ערוץ</label>
      <select id="f-channel" className={select} value={filters.channel} onChange={(e) => apply({ channel: e.target.value })}>
        <option value="">כל הערוצים</option>
        {channelOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>

      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          const q = (new FormData(e.currentTarget).get('q') as string) || '';
          apply({ q: q.trim() });
        }}
      >
        <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="חיפוש שם / אימייל / טלפון"
          className={`${select} w-56 pe-9`}
          aria-label="חיפוש"
        />
      </form>

      {active && (
        <button
          type="button"
          onClick={() => apply({ formType: '', channel: '', q: '' })}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />נקה
        </button>
      )}

      <a
        href={`/admin/leads/export?${exportQs}`}
        className="ms-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        ייצוא CSV
      </a>
    </div>
  );
}
