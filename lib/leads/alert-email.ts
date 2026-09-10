/**
 * Admin alert for a lead that did NOT reach Zapier (and therefore not
 * Pipedrive). Sent through Resend, same sender the portal uses.
 *
 * Fail-open: any error here is logged and swallowed — the lead is already
 * persisted locally and the admin list shows a red "לא נשלח" badge with a
 * resend button, so the email is a convenience, not the system of record.
 */

import { Resend } from 'resend';
import type { DeliveryResult } from './zapier';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const TO = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.LEAD_ALERT_EMAIL ?? 'info@weccelerate.co.il';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://weccelerate.co.il';

function esc(s: string | null | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function notifyLeadDeliveryFailed(opts: {
  activityLogId: string | null;
  name: string;
  email: string;
  phone?: string | null;
  formType?: string | null;
  sourceUrl?: string | null;
  delivery: DeliveryResult;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[LeadAlert] RESEND_API_KEY missing — cannot email admin about undelivered lead');
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const adminLink = `${SITE_URL}/admin/leads`;
    const subject = `⚠️ ליד לא הגיע ל-Pipedrive: ${opts.name}`;
    const html = `
      <div dir="rtl" style="font-family:Heebo,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px">ליד מהאתר לא נשלח לזאפ</h2>
        <p>הליד נשמר באתר אבל השליחה ל-Zapier (החיבור ל-Pipedrive) נכשלה.
           הוא <strong>לא</strong> יופיע ב-Pipedrive עד שתלחצו "שלח שוב" ברשימת הלידים.</p>
        <table style="border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:4px 8px;color:#666">שם</td><td style="padding:4px 8px"><strong>${esc(opts.name)}</strong></td></tr>
          <tr><td style="padding:4px 8px;color:#666">טלפון</td><td style="padding:4px 8px" dir="ltr">${esc(opts.phone)}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">אימייל</td><td style="padding:4px 8px" dir="ltr">${esc(opts.email)}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">טופס</td><td style="padding:4px 8px">${esc(opts.formType)}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">עמוד</td><td style="padding:4px 8px" dir="ltr">${esc(opts.sourceUrl)}</td></tr>
          <tr><td style="padding:4px 8px;color:#666">סיבה</td><td style="padding:4px 8px" dir="ltr">${esc(opts.delivery.error || opts.delivery.status)} (${opts.delivery.attempts} ניסיונות)</td></tr>
        </table>
        <p><a href="${adminLink}" style="display:inline-block;background:#c8a951;color:#070b1e;padding:10px 18px;text-decoration:none;font-weight:700">פתח את רשימת הלידים</a></p>
        <p style="color:#666;font-size:13px">אם זה קורה שוב ושוב: בדקו שהזאפ פעיל ושמכסת המשימות ב-Zapier לא נגמרה.</p>
      </div>`;
    await resend.emails.send({ from: FROM, to: TO, subject, html });
    return true;
  } catch (err) {
    console.error('[LeadAlert] send failed:', err);
    return false;
  }
}
