/**
 * Welcome email sent to newly-provisioned entrepreneurs.
 *
 * Sender: Resend (RESEND_API_KEY).
 * Recipient: the entrepreneur's email captured from the intake form.
 * Body: name + email + one-time password + login link.
 *
 * The logo is attached as an INLINE CID attachment rather than linked
 * via <img src="https://..."> so it renders regardless of Gmail's
 * "block remote images from untrusted senders" default. Costs ~100 KB
 * per email but is the only reliable way to guarantee branding until
 * the sender domain is verified in Resend.
 *
 * If RESEND_API_KEY is missing or the call fails, we log and continue —
 * the user account is still created, the admin can resend manually.
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
// The visible sender (david@weccelerate.co.il) is a send-only identity with no
// real mailbox, so replies must be routed to a monitored inbox or they bounce.
const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'info@weccelerate.co.il';
// Hardcoded canonical URL — same reason as the logo: NEXTAUTH_URL /
// AUTH_URL can resolve to localhost or a Vercel preview hostname in some
// environments, and the welcome email must always point at production.
const PORTAL_URL = 'https://weccelerate.co.il';
const LOGO_PUBLIC_URL = 'https://weccelerate.co.il/images/weccelerate-gold.png';
const LOGO_CID = 'weccelerate-logo';

export interface WelcomeEmailInput {
  to: string;
  name: string;
  tempPassword: string;
  /** 'standard' = brand-new entrepreneur. 'veteran' = existing alumnus whose
   *  Smoove course content moved to the portal. Veteran copy is short, neutral
   *  (no name greeting — the source list has swapped names), and human. */
  variant?: 'standard' | 'veteran';
}

/**
 * Fetched lazily once per server instance, then reused for up to 24h.
 *
 * AO-10: a pinned-forever cache means a logo swap (rare, but possible —
 * we host through Vercel + bust on deploy) would never reach already-warm
 * lambdas. 24h is a safe ceiling because Resend retries failed sends
 * within 24h anyway, so the worst case is one batch with the old logo
 * across the rollover.
 */
const LOGO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
let cachedLogo: { buffer: Buffer; fetchedAt: number } | null = null;
async function getLogoBuffer(): Promise<Buffer | null> {
  if (cachedLogo && Date.now() - cachedLogo.fetchedAt < LOGO_CACHE_TTL_MS) {
    return cachedLogo.buffer;
  }
  try {
    const res = await fetch(LOGO_PUBLIC_URL, { cache: 'no-store' });
    if (!res.ok) return cachedLogo?.buffer ?? null; // keep stale on transient failure
    const arr = await res.arrayBuffer();
    cachedLogo = { buffer: Buffer.from(arr), fetchedAt: Date.now() };
    return cachedLogo.buffer;
  } catch {
    // Network glitch — return stale cache if we have one, else null.
    return cachedLogo?.buffer ?? null;
  }
}

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }

  const loginUrl = `${PORTAL_URL}/login`;
  const logoBuffer = await getLogoBuffer();
  // Use cid: when we have the bytes (most reliable), fall back to https
  // if for some reason the fetch failed.
  const logoSrc = logoBuffer ? `cid:${LOGO_CID}` : LOGO_PUBLIC_URL;
  const html = buildHtml(input, loginUrl, logoSrc);
  const text = buildText(input, loginUrl);
  const subject = input.variant === 'veteran'
    ? 'הקורסים שלך עברו לפורטל היזמים החדש'
    : 'ברוך הבא ל-WeCcelerate — פרטי הכניסה לפורטל';

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // The Resend SDK does NOT throw on API errors (4xx/5xx) — it resolves with
    // an { error } object. We MUST inspect it; otherwise a rejected send (e.g.
    // 403 "testing domain restriction" when the from-domain isn't verified)
    // would be reported as a success and silently lose the email.
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
      ...(logoBuffer
        ? {
            attachments: [
              {
                filename: 'weccelerate-logo.png',
                content: logoBuffer,
                // contentId + inline disposition = renders inline via cid:
                contentId: LOGO_CID,
                contentDisposition: 'inline',
              },
            ],
          }
        : {}),
    });
    if (error) {
      const name = (error as { name?: string }).name ?? 'ResendError';
      const message = (error as { message?: string }).message ?? String(error);
      return { ok: false, error: `${name}: ${message}` };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

function buildHtml({ name, to, tempPassword, variant }: WelcomeEmailInput, loginUrl: string, logoSrc: string): string {
  const escName = escapeHtml(name);
  const escTo = escapeHtml(to);
  const escPwd = escapeHtml(tempPassword);
  const isVeteran = variant === 'veteran';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <title>ברוך הבא ל-WeCcelerate</title>
</head>
<body style="margin:0;padding:0;background:#eef0f7;font-family:'Heebo','Segoe UI','Arial Hebrew',Arial,Helvetica,sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;">

<!-- preheader: shown in inbox preview, hidden in body -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  הסיסמה הזמנית שלך לפורטל היזמים של WeCcelerate.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f7;padding:32px 12px;">
  <tr><td align="center">

    <!-- Outer card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(7,11,30,0.08);">

      <!-- ============================================================ -->
      <!-- HERO — gold logo on dark navy, gold accent line bottom         -->
      <!-- ============================================================ -->
      <tr>
        <td align="center" style="background:#070b1e;background-image:linear-gradient(135deg,#070b1e 0%,#0e1736 55%,#0a1024 100%);padding:40px 32px 32px;">
          <img src="${logoSrc}" alt="WeCcelerate" width="200" height="56"
               style="display:block;height:auto;max-width:200px;width:200px;margin:0 auto 18px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
               border="0" />
          <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c8a951;font-weight:700;">
            פורטל היזמים
          </div>
        </td>
      </tr>
      <tr>
        <td style="height:3px;background:linear-gradient(90deg,#c8a951 0%,#e8d48b 50%,#c8a951 100%);line-height:0;font-size:0;">&nbsp;</td>
      </tr>

      <!-- ============================================================ -->
      <!-- GREETING                                                       -->
      <!-- ============================================================ -->
      <tr>
        <td style="padding:36px 36px 8px;text-align:center;">
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#0f172a;line-height:1.3;">
            ${isVeteran ? 'שלום' : `ברוך הבא, <span style="color:#070b1e;">${escName}</span>`}
          </h1>
          <p style="margin:12px 0 0;font-size:15px;color:#475569;line-height:1.6;">
            ${isVeteran
              ? 'השקנו פורטל יזמים חדש, וכל הקורסים שקיבלת אצלנו עברו לשם.<br />כדי להיכנס ולצפות בהם, אלה פרטי הכניסה שלך:'
              : 'פתחנו עבורך חשבון בפורטל היזמים של WeCcelerate —<br />ו<strong style="color:#7a5c00;">המסע שלך מרעיון למיזם</strong> כבר מחכה שם. הנה פרטי הכניסה האישיים שלך.'}
          </p>
        </td>
      </tr>

      <!-- ============================================================ -->
      <!-- CREDENTIALS CARD — dark, premium "key card" feel               -->
      <!-- ============================================================ -->
      <tr>
        <td style="padding:24px 36px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#070b1e;background-image:linear-gradient(135deg,#070b1e 0%,#0e1736 100%);border-radius:14px;overflow:hidden;">

            <!-- top label strip -->
            <tr>
              <td style="padding:14px 22px 0;text-align:right;">
                <div style="font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#c8a951;font-weight:700;">
                  פרטי כניסה אישיים
                </div>
              </td>
            </tr>

            <!-- email row -->
            <tr>
              <td style="padding:14px 22px 6px;">
                <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:4px;">דוא״ל</div>
                <div dir="ltr" style="font-family:'SF Mono','Menlo','Consolas',monospace;font-size:15px;color:#ffffff;text-align:left;direction:ltr;word-break:break-all;">
                  ${escTo}
                </div>
              </td>
            </tr>

            <!-- divider -->
            <tr><td style="padding:4px 22px;"><div style="height:1px;background:rgba(200,169,81,0.18);font-size:0;line-height:0;">&nbsp;</div></td></tr>

            <!-- password row -->
            <tr>
              <td style="padding:6px 22px 18px;">
                <div style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:6px;">סיסמה זמנית</div>
                <div dir="ltr" style="display:inline-block;font-family:'SF Mono','Menlo','Consolas',monospace;font-size:18px;font-weight:700;color:#070b1e;background:linear-gradient(135deg,#c8a951 0%,#e8d48b 100%);padding:8px 16px;border-radius:8px;letter-spacing:0.04em;direction:ltr;">
                  ${escPwd}
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>

      <!-- ============================================================ -->
      <!-- BIG CTA BUTTON                                                 -->
      <!-- ============================================================ -->
      <tr>
        <td align="center" style="padding:20px 36px 8px;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${loginUrl}" style="height:52px;v-text-anchor:middle;width:240px;" arcsize="20%" stroke="f" fillcolor="#c8a951">
            <w:anchorlock/>
            <center style="color:#070b1e;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">כניסה לפורטל</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${loginUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#c8a951 0%,#e8d48b 50%,#c8a951 100%);color:#070b1e !important;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;font-size:16px;box-shadow:0 6px 18px rgba(200,169,81,0.35);letter-spacing:0.02em;">
            כניסה לפורטל ←
          </a>
          <!--<![endif]-->
        </td>
      </tr>

      <!-- ============================================================ -->
      <!-- IMPORTANT NOTE                                                 -->
      <!-- ============================================================ -->
      <tr>
        <td style="padding:20px 36px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                 style="background:#fff8e1;border-right:3px solid #c8a951;border-radius:6px;">
            <tr>
              <td style="padding:14px 18px;font-size:13px;color:#5b4a18;line-height:1.6;">
                <strong style="color:#7a5c00;">בכניסה הראשונה</strong> תתבקש לבחור סיסמה קבועה. דרישות:
                לפחות 8 תווים, אות גדולה, מספר ותו מיוחד.
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ============================================================ -->
      <!-- WHAT YOU GET — standard only; veterans get a shorter email     -->
      <!-- ============================================================ -->
      ${isVeteran ? '' : `<tr>
        <td style="padding:24px 36px 8px;">
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:10px;">
            מה מחכה לך בפורטל
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${benefitRow('🧭', 'מסע מרעיון למיזם', '100 השאלות שמשקיעים באמת שואלים, ב-7 תחנות — ענה בקצב שלך וקבל משוב אישי מכוכבי, המנטור החכם של הפורטל, על כל תשובה.')}
            ${benefitRow('📁', 'תיק מוכנות למשקיעים', 'כל תשובה שתסמן כמוכנה נאספת אוטומטית לתיק מסודר — מוכן להדפסה לפני כל פגישה.')}
            ${benefitRow('🎓', 'מרכז למידה', 'עשרות שיעורי וידאו בעברית — פיננסים, עסקים, גיוס הון וניהול.')}
            ${benefitRow('💬', 'תקשורת עם הצוות', 'הודעות, עדכונים ופגישות — מסונכרן אחד-לאחד.')}
          </table>
        </td>
      </tr>`}

      <!-- ============================================================ -->
      <!-- DISCLAIMER                                                     -->
      <!-- ============================================================ -->
      <tr>
        <td style="padding:24px 36px 32px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;text-align:center;">
            ${isVeteran
              ? 'אם המייל הגיע אליך בטעות, אפשר להתעלם.'
              : 'אם לא מילאת טופס הצטרפות — אפשר להתעלם מהמייל. החשבון יישאר רדום עד שתתחבר.'}
          </p>
        </td>
      </tr>

      <!-- ============================================================ -->
      <!-- FOOTER                                                         -->
      <!-- ============================================================ -->
      <tr>
        <td style="background:#070b1e;padding:24px 36px;text-align:center;">
          <img src="${logoSrc}" alt="WeCcelerate" width="120" height="34"
               style="display:block;height:auto;max-width:120px;width:120px;margin:0 auto 10px;opacity:0.9;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
               border="0" />
          <div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.7;">
            WeCcelerate Ltd. — Venture Builder ישראלי
            <br />
            תל אביב · ירושלים
            <br />
            <a href="${PORTAL_URL}" style="color:#c8a951;text-decoration:none;">weccelerate.co.il</a>
          </div>
        </td>
      </tr>

    </table>

    <!-- spacer -->
    <div style="height:24px;line-height:0;font-size:0;">&nbsp;</div>

  </td></tr>
</table>

</body>
</html>`;
}

/** Single bullet row inside the "what you get" section. */
function benefitRow(icon: string, title: string, body: string): string {
  return `<tr>
    <td style="padding:8px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="36" style="vertical-align:top;font-size:20px;text-align:center;padding-top:2px;">
            ${icon}
          </td>
          <td style="vertical-align:top;padding-right:8px;">
            <div style="font-size:14px;font-weight:700;color:#0f172a;line-height:1.4;">${escapeHtml(title)}</div>
            <div style="font-size:13px;color:#64748b;line-height:1.5;margin-top:2px;">${escapeHtml(body)}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function buildText({ name, to, tempPassword, variant }: WelcomeEmailInput, loginUrl: string): string {
  if (variant === 'veteran') {
    return `שלום,

השקנו פורטל יזמים חדש, וכל הקורסים שקיבלת אצלנו עברו לשם.
כדי להיכנס ולצפות בהם, אלה פרטי הכניסה שלך:

דוא״ל:        ${to}
סיסמה זמנית:  ${tempPassword}

כניסה לפורטל: ${loginUrl}

בכניסה הראשונה תתבקש לבחור סיסמה חדשה.

צוות WeCcelerate
${PORTAL_URL}`;
  }

  return `WeCcelerate · פורטל היזמים
========================================

ברוך הבא, ${name}.

פתחנו עבורך חשבון בפורטל היזמים של WeCcelerate.

— פרטי כניסה אישיים —

דוא״ל:        ${to}
סיסמה זמנית:  ${tempPassword}

כניסה לפורטל: ${loginUrl}

חשוב — בכניסה הראשונה תתבקש לבחור סיסמה קבועה
(לפחות 8 תווים, אות גדולה, מספר ותו מיוחד).

מה מחכה לך בפורטל:
  · מסע מרעיון למיזם — 100 שאלות משקיעים ב-7 תחנות, עם משוב אישי מכוכבי
  · תיק מוכנות למשקיעים — התשובות הסופיות שלך, מסודרות ומוכנות להדפסה
  · מרכז למידה — עשרות שיעורי וידאו בעברית
  · תקשורת עם הצוות

אם לא מילאת טופס הצטרפות — אפשר להתעלם מהמייל.

— צוות WeCcelerate
${PORTAL_URL}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
