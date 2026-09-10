'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { LeadDashboard } from '@/lib/leads/admin-queries';

const INK = '#0f172a';
const GRID = '#e2e8f0';
const LEAD = '#1e3a8a';
const FAIL = '#dc2626';
const BAR = '#c8a951';

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function HBars({ items, max }: { items: Array<{ label: string; count: number }>; max: number }) {
  if (!items.length) return <p className="text-sm text-slate-400">אין נתונים בתקופה.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
          <div className="min-w-0">
            <div className="flex justify-between gap-2">
              <span className="truncate text-slate-700">{it.label}</span>
              <span className="tabular-nums font-semibold text-slate-900">{it.count}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full" style={{ width: `${Math.max(4, (it.count / max) * 100)}%`, background: BAR }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LeadsCharts({ data }: { data: LeadDashboard }) {
  const maxForm = Math.max(1, ...data.byForm.map((x) => x.count));
  const maxChannel = Math.max(1, ...data.byChannel.map((x) => x.count));
  const maxStage = Math.max(1, ...data.byStage.map((x) => x.count));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-3">
        <Card title="לידים ביום, 30 הימים האחרונים" sub="כחול: לידים שהתקבלו. אדום: מתוכם לא הגיעו לזאפ.">
          <div className="h-56 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap={3}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: GRID }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: 8, border: `1px solid ${GRID}`, fontSize: 12, direction: 'rtl' }}
                  formatter={(value, name) => [String(value), String(name) === 'leads' ? 'לידים' : 'לא הגיעו לזאפ']}
                  labelFormatter={(l) => `תאריך ${String(l)}`}
                />
                <Bar dataKey="leads" fill={LEAD} radius={[3, 3, 0, 0]} maxBarSize={22} />
                <Bar dataKey="failed" fill={FAIL} radius={[3, 3, 0, 0]} maxBarSize={22}>
                  {data.daily.map((d) => <Cell key={d.day} fill={d.failed ? FAIL : 'transparent'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="לפי טופס" sub="מאיזה טופס באתר הגיע הליד">
        <HBars items={data.byForm} max={maxForm} />
      </Card>
      <Card title="לפי ערוץ הגעה" sub="מאיפה הגולש הגיע לאתר (גוגל, ChatGPT, לינקדאין...)">
        <HBars items={data.byChannel} max={maxChannel} />
      </Card>
      <Card title="לפי שלב המיזם" sub="מה היזם סימן בטופס">
        <HBars items={data.byStage} max={maxStage} />
      </Card>

      <div className="lg:col-span-3">
        <Card title="עמודים שהמירו הכי הרבה" sub="העמוד שבו מולא הטופס. זה מה שמכוון את ההשקעה בתוכן.">
          {data.byPage.length === 0 ? (
            <p className="text-sm text-slate-400">אין נתונים בתקופה.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500">
                    <th className="py-2 text-start font-medium">עמוד</th>
                    <th className="py-2 text-end font-medium">לידים</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.byPage.map((p) => (
                    <tr key={p.page}>
                      <td className="py-2 text-start" dir="ltr">
                        <a href={p.page} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-blue-700">{p.page}</a>
                      </td>
                      <td className="py-2 text-end tabular-nums font-semibold" style={{ color: INK }}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
