/**
 * Email to the advisor when their entrepreneur asks for human feedback on a
 * journey answer (INVESTOR_PREP plan). Contains the question, the answer,
 * the AI review (if any) and a signed reply link that works without a
 * portal login (see lib/journey/advisor-token.ts).
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'info@weccelerate.co.il';
const PORTAL_URL = 'https://weccelerate.co.il';

export interface AdvisorReviewEmailInput {
  to: string;
  /** The advisor's display name — greeting only; the entrepreneur never sees it. */
  advisorName?: string;
  entrepreneurName: string;
  chapterName: string;
  questionPrompt: string;
  answerContent: string;
  aiFeedback: string | null;
  entrepreneurNote: string | null;
  reviewUrl: string;
}

export async function sendAdvisorReviewEmail(
  input: AdvisorReviewEmailInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const esc = escapeHtml;
  const subject = `${input.entrepreneurName} מבקש/ת את המשוב שלך — ${truncate(input.questionPrompt, 60)}`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#eef0f7;font-family:'Heebo','Segoe UI','Arial Hebrew',Arial,sans-serif;direction:rtl;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f7;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(7,11,30,0.08);">
  <tr><td style="background:#070b1e;padding:22px 28px;">
    <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#c8a951;font-weight:700;">מסע מרעיון למיזם · בקשת משוב</div>
    <div style="font-size:19px;font-weight:700;color:#ffffff;margin-top:6px;">${input.advisorName ? `${esc(input.advisorName)}, ` : ''}${esc(input.entrepreneurName)} מחכה למשוב שלך</div>
  </td></tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#c8a951,#e8d48b,#c8a951);font-size:0;">&nbsp;</td></tr>

  <tr><td style="padding:24px 28px 8px;">
    <div style="font-size:11px;letter-spacing:0.16em;color:#94a3b8;font-weight:700;margin-bottom:4px;">${esc(input.chapterName)}</div>
    <div style="font-size:16px;font-weight:700;color:#0f172a;line-height:1.5;">${esc(input.questionPrompt)}</div>
  </td></tr>

  <tr><td style="padding:14px 28px 6px;">
    <div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:6px;">התשובה של ${esc(input.entrepreneurName)}:</div>
    <div style="background:#f8fafc;border-right:3px solid #c8a951;border-radius:8px;padding:14px 16px;font-size:14px;color:#334155;line-height:1.7;white-space:pre-line;">${esc(truncate(input.answerContent, 1200))}</div>
  </td></tr>

  ${input.entrepreneurNote ? `<tr><td style="padding:8px 28px 0;">
    <div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:6px;">הודעה אישית מהיזם:</div>
    <div style="background:#fff8e1;border-radius:8px;padding:12px 16px;font-size:13.5px;color:#5b4a18;line-height:1.6;">${esc(truncate(input.entrepreneurNote, 400))}</div>
  </td></tr>` : ''}

  ${input.aiFeedback ? `<tr><td style="padding:14px 28px 0;">
    <div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:6px;">חוות הדעת האוטומטית — לעיונך:</div>
    <div style="background:#faf7ee;border:1px solid #ead9a8;border-radius:8px;padding:12px 16px;font-size:13px;color:#5b4a18;line-height:1.6;white-space:pre-line;">${esc(truncate(input.aiFeedback, 800))}</div>
  </td></tr>` : ''}

  <tr><td align="center" style="padding:24px 28px;">
    <a href="${input.reviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#c8a951,#e8d48b);color:#070b1e !important;font-weight:700;padding:13px 34px;border-radius:10px;text-decoration:none;font-size:15px;">צפייה ומענה ליזם ←</a>
    <div style="font-size:11px;color:#94a3b8;margin-top:10px;">הקישור אישי ותקף ל-30 יום — אין צורך בהתחברות</div>
    <div style="font-size:11.5px;color:#64748b;margin-top:14px;line-height:1.6;">
      כל הפניות שלך מרוכזות באזור המלווה —
      <a href="${PORTAL_URL}/advisor" style="color:#c8a951;text-decoration:none;font-weight:600;">${PORTAL_URL}/advisor</a><br />
      שווה להיכנס לשם בכל בוקר: רואים שם מה עוד מחכה לתשובה.
    </div>
  </td></tr>

  <tr><td style="background:#070b1e;padding:16px 28px;text-align:center;">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">WeCcelerate · פורטל היזמים · <a href="${PORTAL_URL}" style="color:#c8a951;text-decoration:none;">weccelerate.co.il</a></div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = `${input.entrepreneurName} מבקש/ת את המשוב שלך

${input.chapterName}
שאלה: ${input.questionPrompt}

התשובה:
${truncate(input.answerContent, 1200)}
${input.entrepreneurNote ? `\nהודעה מהיזם: ${truncate(input.entrepreneurNote, 400)}\n` : ''}
צפייה ומענה: ${input.reviewUrl}
(קישור אישי, תקף ל-30 יום)

כל הפניות שלך במקום אחד — אזור המלווה: ${PORTAL_URL}/advisor

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
