/**
 * Email to the entrepreneur when their mentor (or the WeCcelerate team)
 * answers them.
 *
 * The mentor gets an email the moment a request arrives; the entrepreneur got
 * nothing but an in-portal notification they had to log in to find. This is
 * the other half of that loop — the reply itself is in the mail, so they know
 * what was said without opening anything.
 *
 * The mentor is named, never their email address (see lib/advisors.ts).
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'info@weccelerate.co.il';
const PORTAL_URL = 'https://weccelerate.co.il';

export interface AdvisorReplyEmailInput {
  to: string;
  entrepreneurName: string;
  /** Display name of whoever replied — the mentor, or "צוות WeCcelerate". */
  authorName: string;
  /** True when the house replied rather than the assigned mentor. */
  fromTeam?: boolean;
  questionPrompt: string;
  chapterName?: string | null;
  replyBody: string;
}

export async function sendAdvisorReplyEmail(
  input: AdvisorReplyEmailInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const esc = escapeHtml;
  const journeyUrl = `${PORTAL_URL}/portal/journey`;
  const role = input.fromTeam ? 'צוות WeCcelerate' : 'המלווה שלך';
  const subject = `${input.authorName} הגיב/ה לתשובה שלך — ${truncate(input.questionPrompt, 50)}`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#eef0f7;font-family:'Heebo','Segoe UI','Arial Hebrew',Arial,sans-serif;direction:rtl;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(truncate(input.replyBody, 120))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f7;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(7,11,30,0.08);">

  <tr><td style="background:#070b1e;padding:24px 30px;">
    <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#c8a951;font-weight:700;">מסע מרעיון למיזם · משוב אישי</div>
    <div style="font-size:20px;font-weight:700;color:#ffffff;margin-top:7px;">${esc(input.authorName)} הגיב/ה לתשובה שלך</div>
  </td></tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#c8a951,#e8d48b,#c8a951);font-size:0;">&nbsp;</td></tr>

  <tr><td style="padding:24px 30px 6px;">
    ${input.chapterName ? `<div style="font-size:11px;letter-spacing:0.14em;color:#94a3b8;font-weight:700;margin-bottom:4px;">${esc(input.chapterName)}</div>` : ''}
    <div style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.5;">${esc(input.questionPrompt)}</div>
  </td></tr>

  <tr><td style="padding:16px 30px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7ee;border:1px solid #ead9a8;border-radius:12px;">
      <tr><td style="padding:16px 20px;">
        <div style="font-size:11px;color:#8a7434;font-weight:700;margin-bottom:8px;">${esc(input.authorName)} · ${esc(role)}</div>
        <div style="font-size:14.5px;color:#4a3f1c;line-height:1.8;white-space:pre-line;">${esc(truncate(input.replyBody, 1500))}</div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:22px 30px 10px;">
    <a href="${journeyUrl}" style="display:inline-block;background:linear-gradient(135deg,#c8a951,#e8d48b);color:#070b1e !important;font-weight:700;padding:13px 34px;border-radius:10px;text-decoration:none;font-size:15px;">לצפייה ולתגובה בפורטל ←</a>
    <div style="font-size:11.5px;color:#94a3b8;margin-top:10px;">אפשר להשיב ל${esc(input.authorName)} ישירות במסך השאלה</div>
  </td></tr>

  <tr><td style="background:#070b1e;padding:16px 30px;text-align:center;">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">WeCcelerate · פורטל היזמים · <a href="${PORTAL_URL}" style="color:#c8a951;text-decoration:none;">weccelerate.co.il</a></div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = `${input.authorName} הגיב/ה לתשובה שלך

${input.chapterName ? input.chapterName + '\n' : ''}שאלה: ${input.questionPrompt}

${input.authorName} (${role}):
${truncate(input.replyBody, 1500)}

לצפייה ולתגובה: ${journeyUrl}

— WeCcelerate`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
    });
    if (error) {
      const name = (error as { name?: string }).name ?? 'ResendError';
      const message = (error as { message?: string }).message ?? String(error);
      return { ok: false, error: `${name}: ${message}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
