import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Mail, Phone, MessageCircle, Send, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { ResendButton } from '../ResendButton';
import { loadLead, STATUS_LABELS } from '@/lib/leads/admin-queries';

export const metadata: Metadata = { title: 'ליד | מערכת ניהול WeCcelerate' };
export const dynamic = 'force-dynamic';

function fmt(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jerusalem',
  }).format(date);
}

function Row({ label, value, ltr = false }: { label: string; value: React.ReactNode; ltr?: boolean }) {
  const empty = value === null || value === undefined || value === '' || value === '—';
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-b border-slate-100 py-2 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`break-words ${empty ? 'text-slate-300' : 'text-slate-900'}`} dir={ltr && !empty ? 'ltr' : undefined} style={ltr ? { textAlign: 'start' } : undefined}>
        {empty ? '—' : value}
      </dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-2 text-sm font-semibold text-slate-900">{title}</h2>
      <dl>{children}</dl>
    </section>
  );
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await loadLead(id).catch(() => null);
  if (!lead) notFound();

  const d = lead.delivery;
  const pdDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;
  const pdSearch = pdDomain && (lead.email || lead.phone)
    ? `https://${pdDomain}.pipedrive.com/search?term=${encodeURIComponent(lead.email || lead.phone || '')}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="px-4 pt-14 pb-4 sm:px-8 sm:py-6 lg:pt-6">
          <Link href="/admin/leads" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />לוח לידים
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{lead.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {lead.formLabel} · {lead.siteLabel} · {fmt(lead.createdAt)} · <span className="font-medium">{STATUS_LABELS[lead.status]}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50">
                  <Phone className="h-4 w-4" aria-hidden="true" /><span dir="ltr">{lead.phone}</span>
                </a>
              )}
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, '').replace(/^0/, '972')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-800 hover:bg-emerald-100"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />וואטסאפ
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50">
                  <Mail className="h-4 w-4" aria-hidden="true" /><span dir="ltr">{lead.email}</span>
                </a>
              )}
              {pdSearch && (
                <a href={pdSearch} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />חפש ב-Pipedrive
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 gap-4 p-4 sm:p-8 lg:grid-cols-2">
        <Card title="מסירה ל-Pipedrive (דרך הזאפ)">
          <Row
            label="מצב"
            value={
              lead.status !== 'accepted' ? (
                <span className="text-slate-500">לא נשלח: הליד {STATUS_LABELS[lead.status]}</span>
              ) : d.status === 'sent' ? (
                <span className="inline-flex items-center gap-1 text-emerald-700"><Send className="h-4 w-4" aria-hidden="true" />נשלח לזאפ</span>
              ) : d.status === 'unknown' || d.status === 'pending' ? (
                <span className="inline-flex items-center gap-1 text-slate-500"><Clock className="h-4 w-4" aria-hidden="true" />ללא מעקב (נרשם לפני העדכון)</span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-red-700"><AlertTriangle className="h-4 w-4" aria-hidden="true" />{d.status === 'skipped' ? 'ZAPIER_WEBHOOK_URL לא מוגדר' : 'נכשל'}</span>
              )
            }
          />
          <Row label="ניסיונות" value={d.attempts ?? null} />
          <Row label="HTTP" value={d.httpStatus ?? null} ltr />
          <Row label="שגיאה" value={d.error ?? null} ltr />
          <Row label="זמן שליחה" value={d.at ? fmt(d.at) : null} />
          <Row label="נשלח שוב" value={lead.resentAt ? fmt(lead.resentAt) : null} />
          <Row label="אושר אחרי בדיקה" value={lead.reviewedAt ? fmt(lead.reviewedAt) : null} />
          {lead.status === 'accepted' && (
            <div className="pt-3"><ResendButton leadId={lead.id} label={d.status === 'sent' ? 'שלח שוב לזאפ' : 'שלח לזאפ'} /></div>
          )}
        </Card>

        <Card title="פרטי הליד">
          <Row label="שם" value={lead.name} />
          <Row label="טלפון" value={lead.phone} ltr />
          <Row label="אימייל" value={lead.email} ltr />
          <Row label="חברה" value={lead.company} />
          <Row label="שלב המיזם" value={lead.stageLabel} />
          <Row label="שירות מבוקש" value={lead.serviceLabel} />
          <Row label="הודעה" value={lead.message ? <span className="whitespace-pre-wrap">{lead.message}</span> : null} />
        </Card>

        <Card title="מאיפה הגיע">
          <Row label="ערוץ" value={lead.channelLabel} />
          <Row label="פירוט ערוץ" value={lead.channelDetail} ltr />
          <Row label="ערוץ ראשון" value={lead.firstChannel} ltr />
          <Row label="קמפיין" value={lead.campaign} ltr />
          <Row label="עמוד נחיתה ראשון" value={lead.landingPage} ltr />
          <Row label="עמוד השליחה" value={lead.sourceUrl ? <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{lead.sourceUrl}</a> : null} ltr />
          <Row label="מפנה" value={lead.referrerUrl} ltr />
          <Row label="UTM מקור" value={lead.utm.source} ltr />
          <Row label="UTM מדיום" value={lead.utm.medium} ltr />
          <Row label="UTM קמפיין" value={lead.utm.campaign} ltr />
          <Row label="UTM תוכן" value={lead.utm.content} ltr />
          <Row label="UTM מונח" value={lead.utm.term} ltr />
          <Row label="gclid" value={lead.gclid} ltr />
          <Row label="fbclid" value={lead.fbclid} ltr />
        </Card>

        <Card title="סינון ספאם">
          <Row label="ציון" value={lead.spamScore ?? null} />
          <Row label="החלטה" value={STATUS_LABELS[lead.status]} />
          <Row label="סיבת הגבלה" value={lead.rateLimitReason} />
          <Row
            label="סימנים"
            value={lead.spamReasons.length ? (
              <ul className="list-disc space-y-0.5 ps-4">
                {lead.spamReasons.map((r, i) => <li key={i}>{r} <span className="text-slate-400" dir="ltr">({lead.spamCodes[i] ?? ''})</span></li>)}
              </ul>
            ) : null}
          />
          {lead.status === 'review' && (
            <p className="pt-3 text-sm"><Link href="/admin/leads/spam-review" className="text-blue-700 hover:underline">לאשר או לדחות בתור סקירת הספאם</Link></p>
          )}
        </Card>

        <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">כל הנתונים הגולמיים (JSON)</summary>
            <pre className="mt-3 max-h-96 overflow-auto rounded bg-slate-900 p-4 text-xs text-slate-100" dir="ltr">
              {JSON.stringify({ id: lead.id, action: lead.action, createdAt: lead.createdAt, ...lead.raw }, null, 2)}
            </pre>
          </details>
        </section>
      </main>
    </div>
  );
}
