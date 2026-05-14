/**
 * Welcome email sent to newly-provisioned entrepreneurs.
 *
 * Sender: Resend (RESEND_API_KEY).
 * Recipient: the entrepreneur's email captured from the intake form.
 * Body: name + email + one-time password + login link.
 *
 * If RESEND_API_KEY is missing or the call fails, we log and continue —
 * the user account is still created, the admin can resend manually.
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const PORTAL_URL = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://weccelerate.co.il';

export interface WelcomeEmailInput {
  to: string;
  name: string;
  tempPassword: string;
}

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const loginUrl = `${PORTAL_URL}/login`;
  const html = buildHtml(input, loginUrl);
  const text = buildText(input, loginUrl);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: 'ברוך הבא ל-WeCcelerate — פרטי הכניסה לפורטל',
      html,
      text,
    });
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

function buildHtml({ name, to, tempPassword }: WelcomeEmailInput, loginUrl: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f5f9;font-family:-apple-system,'Heebo','Segoe UI',Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:linear-gradient(135deg,#070b1e,#0e1530);padding:32px 28px;color:#ffffff;">
          <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#c8a951;font-weight:700;">פורטל היזמים · WeCcelerate</div>
          <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">ברוך הבא, ${escapeHtml(name)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px;color:#1e293b;line-height:1.7;font-size:15px;">
          <p style="margin:0 0 16px;">קיבלנו את הטופס שלך — שמחים שהצטרפת.</p>
          <p style="margin:0 0 20px;">פתחנו עבורך חשבון בפורטל היזמים של WeCcelerate. בפורטל תוכל לעקוב אחרי המיזם שלך, מסמכים, תוכן לימודי וכל מה שדיברנו עליו.</p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:8px 0 24px;">
            <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:10px;">פרטי כניסה</div>
            <div style="font-size:14px;color:#334155;margin-bottom:6px;">
              <strong>דוא"ל:</strong> <span style="font-family:'SF Mono',Menlo,monospace;color:#1e293b;direction:ltr;display:inline-block;">${escapeHtml(to)}</span>
            </div>
            <div style="font-size:14px;color:#334155;">
              <strong>סיסמה זמנית:</strong>
              <span style="font-family:'SF Mono',Menlo,monospace;font-weight:700;color:#0f172a;background:#fff7d6;padding:3px 8px;border-radius:4px;direction:ltr;display:inline-block;margin-right:6px;">${escapeHtml(tempPassword)}</span>
            </div>
          </div>

          <div style="text-align:center;margin:24px 0;">
            <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#c8a951,#e8d48b);color:#070b1e;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;font-size:15px;">כניסה לפורטל →</a>
          </div>

          <p style="margin:24px 0 8px;font-size:13px;color:#475569;">
            <strong>חשוב:</strong> בכניסה הראשונה תתבקש להחליף את הסיסמה הזמנית. הסיסמה החדשה חייבת לכלול לפחות 8 תווים, אות גדולה, מספר ותו מיוחד.
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#475569;">אם לא ביקשת לפתוח חשבון — אפשר פשוט להתעלם מהמייל הזה.</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f8fafc;padding:20px 28px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
          WeCcelerate Ltd. · תל אביב, ישראל · <a href="${PORTAL_URL}" style="color:#94a3b8;">weccelerate.co.il</a>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildText({ name, to, tempPassword }: WelcomeEmailInput, loginUrl: string): string {
  return `שלום ${name},

קיבלנו את הטופס שלך ופתחנו לך חשבון בפורטל היזמים של WeCcelerate.

פרטי כניסה:
דוא"ל: ${to}
סיסמה זמנית: ${tempPassword}

כניסה: ${loginUrl}

חשוב: בכניסה הראשונה תתבקש להחליף סיסמה.

— צוות WeCcelerate`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
