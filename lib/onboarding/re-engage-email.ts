/**
 * Re-engagement email — one-click magic-link entry to the learning portal.
 *
 * NO password anywhere: the owner's directive is that existing entrepreneurs
 * keep their current credentials untouched. The button carries a signed
 * /enter?t=... link (lib/auth/magic-link.ts) that signs them straight in.
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

export interface ReEngageEmailInput {
  to: string;
  name: string;
  enterUrl: string;
}

export async function sendReEngageEmail(input: ReEngageEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const firstName = input.name.trim().split(/\s+/)[0] || input.name;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<body style="font-family:-apple-system,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:24px 12px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#070b1e,#1a2246);padding:32px 28px;text-align:center;">
      <img src="https://weccelerate.co.il/images/weccelerate-gold.png" alt="WeCcelerate" height="42" style="height:42px;">
      <div style="color:#c8a951;font-size:12px;letter-spacing:3px;margin-top:14px;">פורטל היזמים</div>
    </div>
    <div style="padding:32px 28px;color:#1e293b;">
      <h1 style="font-size:22px;margin:0 0 14px;">היי ${escapeHtml(firstName)}, יש לך גישה שלא ניצלת 🎓</h1>
      <p style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 10px;">
        כחלק מהליווי שלך ב-WeCcelerate, פתחנו לך גישה לפורטל היזמים —
        <strong>54 שיעורים מעשיים</strong> על גיוס הון, רגולציה רפואית, בניית מוצר ועוד,
        מהניסיון שנצבר עם יזמים כמוך.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#475569;margin:0 0 24px;">
        בלי סיסמאות ובלי הרשמה — לחיצה אחת ואתה בפנים:
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${input.enterUrl}"
           style="display:inline-block;background:linear-gradient(90deg,#c8a951,#e8d48b);color:#070b1e;font-weight:bold;font-size:16px;padding:14px 40px;border-radius:12px;text-decoration:none;">
          כניסה לפורטל ←
        </a>
      </div>
      <p style="font-size:13px;line-height:1.6;color:#94a3b8;margin:24px 0 0;">
        הקישור אישי ותקף ל-14 יום. אפשר תמיד להיכנס גם עם הפרטים הקיימים שלך בעמוד ההתחברות.
        נתקלת בבעיה או שיש נושא שהיית רוצה שנוסיף? פשוט ענה למייל הזה.
      </p>
    </div>
    <div style="background:#f1f5f9;padding:16px 28px;text-align:center;font-size:12px;color:#94a3b8;">
      WeCcelerate · בונים סטארטאפים ביחד עם יזמים · weccelerate.co.il
    </div>
  </div>
</body>
</html>`;

  const text =
    `היי ${firstName},\n\n` +
    `כחלק מהליווי שלך ב-WeCcelerate פתחנו לך גישה לפורטל היזמים - 54 שיעורים מעשיים על גיוס הון, רגולציה, בניית מוצר ועוד.\n\n` +
    `כניסה בלחיצה אחת (בלי סיסמה):\n${input.enterUrl}\n\n` +
    `הקישור תקף ל-14 יום. שאלות? פשוט ענה למייל הזה.\n\nWeCcelerate`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: `${firstName}, 54 שיעורים מחכים לך בפורטל היזמים — כניסה בקליק`,
      html,
      text,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
