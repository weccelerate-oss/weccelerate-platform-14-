/**
 * Onboarding email for an advisor (MENTOR account).
 *
 * The entrepreneur welcome email talks about "פורטל היזמים" and "המסע שלך
 * מרעיון למיזם" — wrong on every line for an advisor. This one onboards them
 * into the role instead: credentials, what the job is, what it asks of them,
 * and what good feedback looks like.
 *
 * Sent when an admin adds an advisor at /admin/advisors, and re-sendable from
 * the same screen (which reissues the password).
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'info@weccelerate.co.il';
const PORTAL_URL = 'https://weccelerate.co.il';

/**
 * The response window the email asks advisors to keep. Business policy, not a
 * technical constraint — nothing enforces it; change the text here and it
 * changes in every advisor onboarding email.
 */
const RESPONSE_WINDOW = 'שני ימי עסקים';

export interface AdvisorInviteEmailInput {
  to: string;
  name: string;
  tempPassword: string;
}

export async function sendAdvisorInviteEmail(
  input: AdvisorInviteEmailInput,
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const esc = escapeHtml;
  const loginUrl = `${PORTAL_URL}/login`;
  const deskUrl = `${PORTAL_URL}/advisor`;
  const subject = `${input.name}, צורפת לצוות המלווים של WeCcelerate — פרטי הכניסה שלך`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#eef0f7;font-family:'Heebo','Segoe UI','Arial Hebrew',Arial,sans-serif;direction:rtl;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">פרטי הכניסה שלך לאזור המלווה, ומה התפקיד כולל.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f7;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(7,11,30,0.08);">

  <!-- hero -->
  <tr><td style="background:#070b1e;padding:28px 32px;">
    <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#c8a951;font-weight:700;">WeCcelerate · צוות המלווים</div>
    <div style="font-size:22px;font-weight:700;color:#ffffff;margin-top:8px;">${esc(input.name)}, ברוך/ה הבא/ה לצוות</div>
  </td></tr>
  <tr><td style="height:3px;background:linear-gradient(90deg,#c8a951,#e8d48b,#c8a951);font-size:0;">&nbsp;</td></tr>

  <!-- what this is -->
  <tr><td style="padding:26px 32px 4px;">
    <p style="margin:0;font-size:15px;color:#334155;line-height:1.8;">
      צירפנו אותך כ<strong>מלווה אישי</strong> של יזמים בתוכנית ההכנה למשקיעים שלנו.
      זה תפקיד אישי: לכל יזם שמשויך אליך אתה המענה האנושי — האדם שהוא פונה אליו
      כשהוא רוצה לדעת אם מה שכתב באמת מחזיק מים.
    </p>
  </td></tr>

  <!-- credentials -->
  <tr><td style="padding:20px 32px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b1e;border-radius:14px;">
      <tr><td style="padding:20px 24px;">
        <div style="font-size:10.5px;letter-spacing:0.2em;color:#94a3b8;font-weight:700;margin-bottom:4px;">כתובת המייל</div>
        <div style="font-size:15px;color:#ffffff;font-weight:600;direction:ltr;text-align:right;">${esc(input.to)}</div>
        <div style="height:14px;">&nbsp;</div>
        <div style="font-size:10.5px;letter-spacing:0.2em;color:#94a3b8;font-weight:700;margin-bottom:4px;">סיסמה זמנית</div>
        <div style="font-size:19px;color:#e8d48b;font-weight:700;font-family:'Courier New',monospace;direction:ltr;text-align:right;letter-spacing:0.06em;">${esc(input.tempPassword)}</div>
      </td></tr>
    </table>
    <div style="font-size:12px;color:#94a3b8;margin-top:10px;">בכניסה הראשונה תתבקש/י להחליף אותה בסיסמה קבועה.</div>
  </td></tr>

  <tr><td align="center" style="padding:20px 32px 6px;">
    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#c8a951,#e8d48b);color:#070b1e !important;font-weight:700;padding:13px 36px;border-radius:10px;text-decoration:none;font-size:15px;">כניסה לאזור המלווה ←</a>
  </td></tr>

  <!-- how it works -->
  <tr><td style="padding:22px 32px 0;">
    <div style="font-size:11px;letter-spacing:0.18em;color:#c8a951;font-weight:700;margin-bottom:12px;">איך זה עובד</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step(1, 'היזם כותב תשובה', 'היזמים עוברים אצלנו מסע מובנה "מרעיון למיזם" — שאלות המפתח שכל משקיע ישאל. הם כותבים תשובות ומקבלים עליהן חוות דעת אוטומטית.')}
      ${step(2, 'הוא שולח אותה אליך', 'כשיזם רוצה עין אנושית, הוא שולח את התשובה לעיונך. אתה מקבל מייל, והפנייה מחכה לך גם באזור המלווה.')}
      ${step(3, 'אתה מחזיר משוב', 'באזור המלווה תראה את השאלה, את התשובה של היזם ואת חוות הדעת האוטומטית — ותכתוב לו מה לחדד. הוא רואה את המשוב שלך בפורטל ומקבל התראה.')}
    </table>
  </td></tr>

  <!-- what the role asks -->
  <tr><td style="padding:22px 32px 0;">
    <div style="font-size:11px;letter-spacing:0.18em;color:#c8a951;font-weight:700;margin-bottom:10px;">מה התפקיד מבקש ממך</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;">
      <tr><td style="padding:16px 20px;">
        ${bullet(`<strong>כניסה יומית.</strong> להיכנס ל<a href="${deskUrl}" style="color:#7a5c00;text-decoration:none;font-weight:600;">אזור המלווה</a> בכל בוקר. המסך מסמן בדיוק מה ממתין לתשובתך — אם אין כלום, זה לוקח עשר שניות.`)}
        ${bullet(`<strong>מענה תוך ${RESPONSE_WINDOW}.</strong> יזם שממתין למשוב עוצר במקום. מענה מהיר שומר על המומנטום שלו.`)}
        ${bullet('<strong>משוב ענייני, לא ניסוח מחדש.</strong> התפקיד הוא להראות ליזם איפה הטיעון שלו חלש, איזו שאלה משקיע ישאל ומה חסר — לא לכתוב את התשובה במקומו. הוא צריך לדעת להגן על זה בחדר.')}
        ${bullet('<strong>ספציפיות על פני נימוס.</strong> "יפה מאוד, תחדד קצת" לא עוזר לאף אחד. "אין כאן מספר שוק — בלי TAM משקיע לא ידע על מה מדובר" זה משוב.')}
        ${bullet('<strong>סודיות.</strong> הרעיונות, המספרים והמסמכים של היזמים חסויים ואינם יוצאים החוצה.')}
      </td></tr>
    </table>
  </td></tr>

  <!-- identity note -->
  <tr><td style="padding:20px 32px 26px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7ee;border:1px solid #ead9a8;border-radius:12px;">
      <tr><td style="padding:14px 18px;font-size:13px;color:#5b4a18;line-height:1.7;">
        <strong>איך אתה מופיע ליזם:</strong> בשם שלך — ${esc(input.name)} — עם הלוגו של WeCcelerate כתמונת פרופיל.
        כתובת המייל שלך לא נחשפת ליזמים בשום שלב.
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:#070b1e;padding:16px 32px;text-align:center;">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);">
      שאלות? פשוט השב/י למייל הזה · <a href="${PORTAL_URL}" style="color:#c8a951;text-decoration:none;">weccelerate.co.il</a>
    </div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = `${input.name}, ברוך/ה הבא/ה לצוות המלווים של WeCcelerate.

צירפנו אותך כמלווה אישי של יזמים בתוכנית ההכנה למשקיעים. לכל יזם שמשויך אליך
אתה המענה האנושי — האדם שאליו הוא פונה כשהוא רוצה לדעת אם מה שכתב מחזיק מים.

פרטי הכניסה
כתובת המייל: ${input.to}
סיסמה זמנית: ${input.tempPassword}
(בכניסה הראשונה תתבקש/י להחליף אותה)
כניסה: ${loginUrl}

איך זה עובד
1. היזם כותב תשובות לשאלות המפתח של המסע "מרעיון למיזם" ומקבל עליהן חוות דעת אוטומטית.
2. כשהוא רוצה עין אנושית הוא שולח את התשובה לעיונך — מייל אליך, והפנייה מחכה גם באזור המלווה.
3. אתה קורא ומחזיר משוב. היזם רואה אותו בפורטל ומקבל התראה.

מה התפקיד מבקש ממך
- כניסה יומית לאזור המלווה: ${deskUrl} — המסך מסמן מה ממתין לתשובתך.
- מענה תוך ${RESPONSE_WINDOW}. יזם שממתין למשוב עוצר במקום.
- משוב ענייני, לא ניסוח מחדש: להראות איפה הטיעון חלש ומה משקיע ישאל — לא לכתוב במקומו.
- ספציפיות על פני נימוס. "יפה, תחדד" לא עוזר; "אין כאן מספר שוק" כן.
- סודיות: הרעיונות והמספרים של היזמים אינם יוצאים החוצה.

איך אתה מופיע ליזם: בשם שלך, עם הלוגו של WeCcelerate כתמונת פרופיל.
כתובת המייל שלך לא נחשפת ליזמים.

שאלות? פשוט השב/י למייל הזה.

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

/** One numbered step in the "how it works" list. Table rows, so Outlook behaves. */
function step(n: number, title: string, body: string): string {
  return `<tr>
    <td width="34" valign="top" style="padding:0 0 14px 0;">
      <div style="width:26px;height:26px;border-radius:50%;background:#070b1e;color:#e8d48b;font-size:13px;font-weight:700;text-align:center;line-height:26px;">${n}</div>
    </td>
    <td valign="top" style="padding:0 0 14px 0;">
      <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3px;">${title}</div>
      <div style="font-size:13.5px;color:#475569;line-height:1.7;">${body}</div>
    </td>
  </tr>`;
}

/** One expectation line. `content` is trusted markup written above, not user input. */
function bullet(content: string): string {
  return `<div style="font-size:13.5px;color:#475569;line-height:1.75;margin-bottom:10px;">
    <span style="color:#c8a951;font-weight:700;">•</span>&nbsp; ${content}
  </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
