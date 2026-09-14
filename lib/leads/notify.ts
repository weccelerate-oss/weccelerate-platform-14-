/**
 * Speed-to-lead: two emails the moment a lead is delivered.
 *
 *  1. To the sales inbox: who, phone (as a WhatsApp link), what they asked
 *     for, where they came from. The point is a callback in minutes.
 *  2. To the lead (when they left an email): "we got it" — no promises, no
 *     timelines, just confirmation and the phone number.
 *
 * Both fail open; the lead is already stored and delivered before this runs.
 */

import { Resend } from 'resend';
import { FORM_TYPE_LABELS, STAGE_LABELS, SERVICE_LABELS, getChannelLabel, type LeadAttribution } from './zapier';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
// Owner instruction (2026-09-14): internal lead mail goes to the company
// inbox only — not to advisors, not to the CEO — unless LEAD_NOTIFY_EMAIL says otherwise.
const SALES_TO = (process.env.LEAD_NOTIFY_EMAIL || 'weccelerate@gmail.com')
  .split(',').map((s) => s.trim()).filter(Boolean);
/** Confirmation to the lead is opt-in (LEAD_CONFIRMATION_EMAIL=1). */
const CONFIRM_LEADS = process.env.LEAD_CONFIRMATION_EMAIL === '1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weccelerate.co.il';

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function waLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('972') ? digits : digits.startsWith('0') ? `972${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}

export interface NewLeadInfo {
  leadId: string | null;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  stage?: string | null;
  service?: string | null;
  formType: string;
  sourceUrl?: string | null;
  attribution?: LeadAttribution | null;
}

export async function notifySalesNewLead(lead: NewLeadInfo): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || SALES_TO.length === 0) return;
  try {
    const wa = waLink(lead.phone);
    const a = lead.attribution ?? {};
    let page = '';
    try { page = lead.sourceUrl ? new URL(lead.sourceUrl).pathname : ''; } catch { page = lead.sourceUrl || ''; }
    const rows: Array<[string, string]> = [
      ['טלפון', lead.phone || '—'],
      ['אימייל', lead.email || '—'],
      ['חברה', lead.company || '—'],
      ['שלב המיזם', lead.stage ? STAGE_LABELS[lead.stage] || lead.stage : '—'],
      ['שירות מבוקש', lead.service ? SERVICE_LABELS[lead.service] || lead.service : '—'],
      ['טופס', FORM_TYPE_LABELS[lead.formType] || lead.formType],
      ['עמוד', page || '—'],
      ['ערוץ', getChannelLabel(a.channel) + (a.campaign ? ` · ${a.campaign}` : '')],
    ];
    const html = `<div dir="rtl" style="font-family:Heebo,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <h2 style="margin:0 0 6px">ליד חדש מהאתר: ${esc(lead.name)}</h2>
      <p style="margin:0 0 14px;color:#555">חזרה מהירה שווה יותר מכל דבר אחר. ${wa ? `<a href="${wa}" style="display:inline-block;background:#25D366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700">פתח וואטסאפ עם ${esc(lead.name)}</a>` : ''}</p>
      <table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 10px;color:#666;white-space:nowrap">${esc(k)}</td><td style="padding:4px 10px" dir="auto">${esc(v)}</td></tr>`).join('')}</table>
      ${lead.message ? `<p style="margin:14px 0 0;padding:12px;background:#f5f5f5;border-radius:8px;white-space:pre-wrap">${esc(lead.message)}</p>` : ''}
      <p style="margin-top:16px;font-size:13px"><a href="${SITE_URL}/admin/leads${lead.leadId ? `/${lead.leadId}` : ''}">פרטי הליד באדמין</a> · הליד נשלח גם ל-Pipedrive.</p>
    </div>`;
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM,
      to: SALES_TO,
      subject: `ליד חדש מהאתר: ${lead.name}${lead.phone ? ` · ${lead.phone}` : ''}`,
      html,
    });
  } catch (err) {
    console.error('[LeadNotify] sales email failed:', err);
  }
}

export async function confirmToLead(lead: NewLeadInfo): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!CONFIRM_LEADS || !apiKey || !lead.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) return;
  try {
    const first = lead.name.trim().split(/\s+/)[0] || '';
    const html = `<div dir="rtl" style="font-family:Heebo,Arial,sans-serif;font-size:15px;line-height:1.7;color:#111;max-width:560px">
      <p>היי ${esc(first)},</p>
      <p>קיבלנו את הפרטים שלך. יועץ מהצוות של WeCcelerate יעבור עליהם ויחזור אליך לשיחת היכרות.</p>
      <p>אם זה דחוף, אפשר להתקשר אלינו: <a href="tel:+972555647538" dir="ltr">055-564-7538</a>.</p>
      <p>בינתיים, המדריכים שלנו ליזמים: <a href="${SITE_URL}/guides">weccelerate.co.il/guides</a></p>
      <p style="color:#666">WeCcelerate (וויסלרייט)<br>הרכבת 58, תל אביב</p>
    </div>`;
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: FROM,
      to: lead.email,
      subject: 'קיבלנו את הפרטים שלך | WeCcelerate',
      html,
    });
  } catch (err) {
    console.error('[LeadNotify] confirmation to lead failed:', err);
  }
}
