/**
 * Weekly leads report — Sunday morning email.
 *
 * Answers the one question the 50-leads/month target depends on:
 * "did every lead the site accepted actually reach Pipedrive?"
 *
 *   1. Leads accepted by the site in the last 7 days (every `form.*` row),
 *      split by form type and by traffic channel, against the weekly pace
 *      needed for 50/month (~12).
 *   2. Delivery to Zapier: sent / failed / not configured, with the failed
 *      ones listed by name so someone clicks "שלח שוב" in /admin/leads.
 *   3. Reconciliation: deals created in Pipedrive in the same window,
 *      read through the existing Pipedrive API token. A gap between
 *      "sent to Zapier" and "deals created" means the Zap dropped
 *      something (paused Zap, task quota, mapping error).
 *   4. Leads still held for spam review.
 *
 * No LLM calls. One Pipedrive request. One Resend email.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/require-cron';
import { FORM_TYPE_LABELS, SITE_SOURCE_LABELS, getChannelLabel } from '@/lib/leads/zapier';

const WEEKLY_TARGET = 12; // 50 / month ≈ 11.6 / week
const REPORT_TO = (process.env.LEAD_REPORT_EMAIL || 'weccelerate@gmail.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weccelerate.co.il';

interface LeadRow {
  id: string;
  action: string;
  createdAt: Date;
  metadata: unknown;
}

interface PipedriveWeek {
  ok: boolean;
  /** Deals created in the window from every source (ads, landing pages, manual). */
  total: number;
  /** Deals whose "מודעה" field says they came from this website. */
  website: number;
  /** Site leads that were sent but have no deal with their name. */
  missing: string[];
  /** Site leads that reached Pipedrive but opened no NEW website deal, so they
   *  are not counted: the person already existed (scenario only touched an old
   *  deal) or the new deal carries another source (same person came via an ad). */
  notCounted: Array<{ name: string; why: 'existing' | 'other-source' }>;
  error?: string;
}

const PD = 'https://api.pipedrive.com/v1';
/** The custom deal field the Make/Zapier scenario fills with our 'מודעה' payload key. */
const AD_FIELD_NAME = process.env.PIPEDRIVE_FIELD_AD_NAME || 'מודעה';

function pdUrl(path: string, token: string): string {
  return `${PD}${path}${path.includes('?') ? '&' : '?'}api_token=${encodeURIComponent(token)}`;
}

/**
 * What Pipedrive received this week, split into "from this website" and
 * everything else. Most deals come from paid landing pages through the same
 * Make scenario, so a raw deal count says nothing about the site; the
 * 'מודעה' field does. Then each sent site lead is looked up by name so a
 * lead the scenario dropped (dedupe, mapping error) is listed, not averaged.
 */
interface SiteLeadRef { name: string; email: string; phone: string }

async function pipedriveWeek(since: Date, siteLeads: SiteLeadRef[]): Promise<PipedriveWeek> {
  const token = (process.env.PIPEDRIVE_API_TOKEN || '').trim();
  if (!token) return { ok: false, total: 0, website: 0, missing: [], notCounted: [], error: 'PIPEDRIVE_API_TOKEN not configured' };
  const websiteValues = new Set(Object.values(SITE_SOURCE_LABELS));
  try {
    // 1. Which custom field carries the ad/source label.
    const fieldsRes = await fetch(pdUrl('/dealFields', token), { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
    const fieldsJson = (await fieldsRes.json()) as { data?: Array<{ key: string; name: string }> };
    const adKey = (fieldsJson.data ?? []).find((f) => f.name === AD_FIELD_NAME)?.key ?? null;

    // 2. Deals in the window, newest first.
    let start = 0;
    let total = 0;
    let website = 0;
    for (let page = 0; page < 6; page += 1) {
      const res = await fetch(pdUrl(`/deals?status=all_not_deleted&sort=add_time%20DESC&limit=500&start=${start}`, token), { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
      if (!res.ok) return { ok: false, total, website, missing: [], notCounted: [], error: `HTTP ${res.status}` };
      const json = (await res.json()) as {
        data?: Array<Record<string, unknown>> | null;
        additional_data?: { pagination?: { more_items_in_collection?: boolean; next_start?: number } };
      };
      let reachedOlder = false;
      for (const d of json.data ?? []) {
        const t = typeof d.add_time === 'string' ? new Date(d.add_time.replace(' ', 'T') + 'Z') : null;
        if (!t || t < since) { reachedOlder = true; break; }
        total += 1;
        if (adKey && websiteValues.has(String(d[adKey] ?? ''))) website += 1;
      }
      if (reachedOlder || !json.additional_data?.pagination?.more_items_in_collection) break;
      start = json.additional_data?.pagination?.next_start ?? start + 500;
    }

    // 3. Every sent site lead should open a NEW deal tagged as website.
    //    Find the person by email/phone (several phone spellings: Pipedrive
    //    stores +972 and 05x forms), then look at their deals:
    //      - new website deal in the window      → counted
    //      - new deal with another source        → other-source (came via an ad too)
    //      - only older deals                    → existing (scenario opened nothing;
    //        found 2026-10-11: a quarter of site leads were lost this way)
    //    No person at all → title search, else missing.
    const windowStart = new Date(since.getTime() - 86_400_000);
    const isNew = (t: unknown) => {
      const d = typeof t === 'string' ? new Date(t.replace(' ', 'T') + 'Z') : null;
      return !!d && d >= windowStart;
    };
    const phoneTerms = (raw: string) => {
      const digits = raw.replace(/\D/g, '');
      const local = digits.startsWith('972') ? '0' + digits.slice(3) : digits;
      return [...new Set([local, local.replace(/^0/, ''), digits])].filter((t) => t.length >= 7);
    };
    const missing: string[] = [];
    const notCounted: PipedriveWeek['notCounted'] = [];
    for (const lead of siteLeads.slice(0, 40)) {
      const label = lead.name || lead.email || lead.phone;
      const lookups: Array<[string, string]> = [];
      if (lead.email) lookups.push(['email', lead.email]);
      if (lead.phone) for (const t of phoneTerms(lead.phone)) lookups.push(['phone', t]);

      let personFound = false;
      let deals: Array<Record<string, unknown>> = [];
      for (const [field, term] of lookups) {
        if (personFound || term.length < 5) continue;
        const res = await fetch(pdUrl(`/persons/search?term=${encodeURIComponent(term)}&fields=${field}&limit=3`, token), { cache: 'no-store', signal: AbortSignal.timeout(8_000) });
        if (!res.ok) continue;
        const json = (await res.json()) as { data?: { items?: Array<{ item: { id: number } }> } };
        for (const it of json.data?.items ?? []) {
          personFound = true;
          const dr = await fetch(pdUrl(`/persons/${it.item.id}/deals?status=all_not_deleted&limit=50`, token), { cache: 'no-store', signal: AbortSignal.timeout(8_000) });
          if (dr.ok) deals = deals.concat(((await dr.json()) as { data?: Array<Record<string, unknown>> | null }).data ?? []);
        }
      }

      if (!personFound && lead.name && lead.name.length >= 2) {
        const res = await fetch(pdUrl(`/deals/search?term=${encodeURIComponent(lead.name)}&fields=title&exact_match=true&limit=5`, token), { cache: 'no-store', signal: AbortSignal.timeout(8_000) });
        if (res.ok) {
          const json = (await res.json()) as { data?: { items?: Array<{ item: { id: number } }> } };
          for (const it of json.data?.items ?? []) {
            const dr = await fetch(pdUrl(`/deals/${it.item.id}`, token), { cache: 'no-store', signal: AbortSignal.timeout(8_000) });
            if (dr.ok) { personFound = true; deals.push(((await dr.json()) as { data: Record<string, unknown> }).data); }
          }
        }
      }

      if (!personFound) { missing.push(label); continue; }
      const fresh = deals.filter((d) => isNew(d.add_time));
      if (fresh.some((d) => adKey && websiteValues.has(String(d[adKey] ?? '')))) continue;
      notCounted.push({ name: label, why: fresh.length ? 'other-source' : 'existing' });
    }
    return { ok: true, total, website, missing, notCounted };
  } catch (err) {
    return { ok: false, total: 0, website: 0, missing: [], notCounted: [], error: err instanceof Error ? err.message : String(err) };
  }
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function table(rows: Array<[string, string | number]>, h1: string, h2: string): string {
  if (!rows.length) return '';
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 20px">
    <thead><tr style="background:#f1f5f9">
      <th style="padding:8px 12px;text-align:right;font-size:13px;color:#64748b">${h1}</th>
      <th style="padding:8px 12px;text-align:center;font-size:13px;color:#64748b">${h2}</th>
    </tr></thead>
    <tbody>${rows
      .map(
        ([a, b]) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${esc(a)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:bold">${esc(b)}</td>
      </tr>`,
      )
      .join('')}</tbody></table>`;
}

export async function GET(request: NextRequest) {
  const unauth = requireCron(request);
  if (unauth) return unauth;

  try {
    const { prisma } = await import('@/lib/db');
    const now = new Date();
    const since = new Date(now.getTime() - 7 * 86_400_000);
    const fmt = (d: Date) => d.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });

    const [accepted, held, rateLimited, blocked] = await Promise.all([
      prisma.activityLog.findMany({
        where: { action: { startsWith: 'form.' }, createdAt: { gte: since } },
        select: { id: true, action: true, createdAt: true, metadata: true },
        orderBy: { createdAt: 'desc' },
      }) as Promise<LeadRow[]>,
      prisma.activityLog.count({ where: { action: 'lead.spam_review', createdAt: { gte: since } } }),
      prisma.activityLog.count({ where: { action: 'lead.rate_limited', createdAt: { gte: since } } }),
      prisma.activityLog.count({ where: { action: 'lead.spam_blocked', createdAt: { gte: since } } }),
    ]);

    // Newsletter signups are not sales leads; keep them out of the target line.
    const leads = accepted.filter((r) => r.action !== 'form.newsletter');

    const byForm: Record<string, number> = {};
    const byChannel: Record<string, number> = {};
    const byPage: Record<string, number> = {};
    let sent = 0;
    let failed = 0;
    let unknown = 0;
    const failedRows: Array<{ id: string; name: string; phone: string; error: string }> = [];
    const sentLeads: SiteLeadRef[] = [];

    for (const r of leads) {
      const m = (r.metadata as Record<string, unknown>) || {};
      const formType = (m.formType as string) || r.action.replace(/^form\./, '');
      byForm[formType] = (byForm[formType] || 0) + 1;
      const ch = getChannelLabel((m.channel as string) || null);
      byChannel[ch] = (byChannel[ch] || 0) + 1;
      let page = '';
      try { page = m.sourceUrl ? new URL(m.sourceUrl as string).pathname : ''; } catch { page = ''; }
      if (page) byPage[page] = (byPage[page] || 0) + 1;

      const d = m.delivery as { status?: string; error?: string } | undefined;
      if (!d) unknown += 1;
      else if (d.status === 'sent') { sent += 1; sentLeads.push({ name: (m.name as string) || '', email: (m.email as string) || '', phone: (m.phone as string) || '' }); }
      else {
        failed += 1;
        failedRows.push({
          id: r.id,
          name: (m.name as string) || '—',
          phone: (m.phone as string) || '',
          error: d.error || d.status || '',
        });
      }
    }

    const pipedrive = await pipedriveWeek(since, sentLeads);
    const gap = pipedrive.ok ? pipedrive.missing.length : null;

    const total = leads.length;
    const pace = total >= WEEKLY_TARGET ? '#166534' : total >= WEEKLY_TARGET * 0.6 ? '#b45309' : '#b91c1c';

    const sortDesc = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1]);

    const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"></head>
    <body style="font-family:Heebo,Arial,sans-serif;background:#f8fafc;padding:20px;color:#0f172a">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:linear-gradient(135deg,#0a0e27,#1e293b);padding:26px;text-align:center">
        <h1 style="color:#c8a951;margin:0;font-size:22px">WeCcelerate</h1>
        <p style="color:#94a3b8;margin:6px 0 0">דוח לידים שבועי · ${fmt(since)} עד ${fmt(now)}</p>
      </div>
      <div style="padding:26px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px">
          <div style="flex:1;min-width:140px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center">
            <p style="font-size:34px;font-weight:bold;margin:0;color:${pace}">${total}</p>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px">לידים השבוע (יעד ${WEEKLY_TARGET})</p>
          </div>
          <div style="flex:1;min-width:140px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center">
            <p style="font-size:34px;font-weight:bold;margin:0;color:#166534">${sent}</p>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px">הגיעו לזאפ</p>
          </div>
          <div style="flex:1;min-width:140px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center">
            <p style="font-size:34px;font-weight:bold;margin:0;color:${pipedrive.ok ? '#0f172a' : '#94a3b8'}">${pipedrive.ok ? pipedrive.website : '—'}</p>
            <p style="margin:4px 0 0;color:#64748b;font-size:13px">עסקאות מהאתר ב-Pipedrive${pipedrive.ok ? ` (מתוך ${pipedrive.total} מכל המקורות)` : ''}</p>
          </div>
        </div>

        ${
          gap !== null && gap > 0
            ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;margin-bottom:20px;color:#991b1b">
                <strong>${gap} לידים נשלחו מהאתר ולא נמצאה להם עסקה ב-Pipedrive (לפי אימייל, טלפון או שם):</strong> ${esc(pipedrive.missing.join(', '))}.
                כדאי לחפש אותם ידנית ב-Pipedrive, ואם באמת אין עסקה, לפתוח אחת.
              </div>`
            : !pipedrive.ok
              ? `<p style="color:#b45309;font-size:13px;margin-bottom:20px">לא הצלחתי לקרוא מ-Pipedrive: ${esc(pipedrive.error)}</p>`
              : `<p style="color:#166534;font-size:13px;margin-bottom:20px">לכל ליד שנשלח מהאתר יש עסקה ב-Pipedrive.</p>`
        }

        ${
          pipedrive.ok && pipedrive.notCounted.length
            ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:20px;color:#92400e">
                <strong>${pipedrive.notCounted.length} לידים מהאתר הגיעו ל-Pipedrive אבל לא נפתחה להם עסקה חדשה של "אתר ראשי":</strong>
                <ul style="margin:8px 0 0;padding-inline-start:18px">${pipedrive.notCounted
                  .map((n) => `<li>${esc(n.name)}: ${n.why === 'existing' ? 'איש קשר קיים, התרחיש לא פתח עסקה חדשה' : 'נפתחה עסקה עם מקור אחר (הגיע גם ממודעה)'}</li>`)
                  .join('')}</ul>
                <p style="margin:8px 0 0;font-size:13px">איש קשר קיים: צריך לתקן את התרחיש ב-Make כך שיפתח עסקה חדשה גם לאיש קשר קיים. עד אז, לפתוח ידנית.</p>
              </div>`
            : ''
        }

        ${
          failedRows.length
            ? `<h3 style="margin:0 0 6px;color:#991b1b">לידים שלא הגיעו לזאפ (${failedRows.length})</h3>
               <p style="font-size:13px;color:#64748b;margin:0 0 8px">לחצו "שלח שוב" ב-<a href="${SITE_URL}/admin/leads">רשימת הלידים</a>.</p>
               ${table(failedRows.map((f) => [`${f.name} · ${f.phone}`, f.error]), 'ליד', 'סיבה')}`
            : ''
        }
        ${unknown ? `<p style="font-size:13px;color:#64748b">${unknown} לידים ללא מעקב מסירה (נרשמו לפני העדכון).</p>` : ''}

        <h3 style="margin:18px 0 6px">לפי טופס</h3>
        ${table(sortDesc(byForm).map(([k, v]) => [FORM_TYPE_LABELS[k] || k, v]), 'טופס', 'לידים')}

        <h3 style="margin:18px 0 6px">לפי ערוץ הגעה</h3>
        ${table(sortDesc(byChannel), 'ערוץ', 'לידים')}

        <h3 style="margin:18px 0 6px">עמודים שהמירו הכי הרבה</h3>
        ${table(sortDesc(byPage).slice(0, 10), 'עמוד', 'לידים') || '<p style="font-size:13px;color:#64748b">אין נתונים.</p>'}

        <h3 style="margin:18px 0 6px">סינון</h3>
        ${table(
          [
            ['ממתינים לבדיקת ספאם', held],
            ['נחסמו כספאם', blocked],
            ['נחסמו בהגבלת קצב', rateLimited],
          ],
          'מצב',
          'כמות',
        )}

        <p style="color:#94a3b8;font-size:12px;margin-top:20px;text-align:center">דוח אוטומטי · WeCcelerate · ללא שימוש ב-LLM</p>
      </div>
    </div></body></html>`;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, message: 'RESEND_API_KEY not configured', total, sent, failed, pipedrive });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: REPORT_TO,
      subject: `דוח לידים שבועי: ${total} לידים מהאתר, ${sent} נשלחו${pipedrive.ok && pipedrive.missing.length ? `, ${pipedrive.missing.length} חסרים ב-Pipedrive` : ''}${pipedrive.ok && pipedrive.notCounted.length ? `, ${pipedrive.notCounted.length} בלי עסקה חדשה` : ''}${failed ? `, ${failed} נכשלו` : ''}`,
      html,
    });

    return NextResponse.json({ success: true, total, sent, failed, unknown, held, pipedrive, gap });
  } catch (error) {
    console.error('[Weekly Leads Report]', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
  }
}
