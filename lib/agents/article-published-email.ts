/**
 * Email sent to Katrin every time דוד publishes a new guide.
 *
 * Contains:
 *   - Article title + canonical URL (big CTA button)
 *   - LinkedIn post draft, copy-paste ready
 *   - "Share on LinkedIn" deep link that pre-fills the article URL in
 *     LinkedIn's share intent
 *
 * Recipient: process.env.ARTICLE_NOTIFICATION_EMAIL || katrin@weccelerate.co.il
 * Sender:    Resend, same identity as the welcome email
 *
 * Failures here are non-fatal — the guide is already published; the
 * email is a notification, not a publish gate.
 */

import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const RECIPIENT = process.env.ARTICLE_NOTIFICATION_EMAIL ?? 'katrin@weccelerate.co.il';
const LOGO_PUBLIC_URL = 'https://weccelerate.co.il/images/weccelerate-gold.png';
const LOGO_CID = 'weccelerate-logo';

export interface ArticlePublishedEmailInput {
  /** Hebrew title of the published article. */
  titleHe: string;
  /** Slug — used to build the canonical URL. */
  slug: string;
  /** LinkedIn post draft, ready for Katrin to paste. */
  linkedInPost: string;
  /** English image-gen prompt suitable for Nano Banana 2 / ChatGPT 5.5 / etc. */
  imagePrompt?: string | null;
  /** Whether the brand logo should be in the generated image. */
  shouldIncludeLogo?: boolean;
  /** Style hint (diagram / illustration / etc.) — helps Katrin pick the right generator. */
  imageStyle?: 'diagram' | 'illustration' | 'photograph' | 'abstract' | 'infographic' | null;
  /** Hebrew rationale for the image choice. */
  imageRationale?: string | null;
  /** Optional Hebrew context line, e.g. the original ContentGap query. */
  topicHint?: string | null;
  category?: string | null;
  wordCount?: number | null;
}

/** Module-level cache so we only fetch the logo once per server instance. */
let cachedLogoBuffer: Buffer | null = null;
async function getLogoBuffer(): Promise<Buffer | null> {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  try {
    const res = await fetch(LOGO_PUBLIC_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    cachedLogoBuffer = Buffer.from(await res.arrayBuffer());
    return cachedLogoBuffer;
  } catch {
    return null;
  }
}

export async function sendArticlePublishedEmail(input: ArticlePublishedEmailInput): Promise<{
  ok: boolean;
  recipient: string;
  error?: string;
}> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, recipient: RECIPIENT, error: 'RESEND_API_KEY not configured' };
  }

  const articleUrl = `https://weccelerate.co.il/guides/${encodeURIComponent(input.slug)}`;
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
  const logo = await getLogoBuffer();
  const logoSrc = logo ? `cid:${LOGO_CID}` : LOGO_PUBLIC_URL;

  const html = buildHtml({
    ...input,
    articleUrl,
    shareUrl,
    logoSrc,
    imagePrompt: input.imagePrompt ?? null,
    shouldIncludeLogo: input.shouldIncludeLogo ?? false,
    imageStyle: input.imageStyle ?? null,
    imageRationale: input.imageRationale ?? null,
  });
  const text = buildText({
    ...input,
    articleUrl,
    imagePrompt: input.imagePrompt ?? null,
  });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      subject: `📝 מאמר חדש מדוד · ${input.titleHe}`,
      html,
      text,
      ...(logo
        ? {
            attachments: [
              {
                filename: 'weccelerate-logo.png',
                content: logo,
                contentId: LOGO_CID,
                contentDisposition: 'inline',
              },
            ],
          }
        : {}),
    });
    return { ok: true, recipient: RECIPIENT };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, recipient: RECIPIENT, error: msg };
  }
}

// =============================================================================
// HTML
// =============================================================================

type HtmlOpts = {
  titleHe: string;
  topicHint?: string | null;
  category?: string | null;
  wordCount?: number | null;
  articleUrl: string;
  shareUrl: string;
  linkedInPost: string;
  imagePrompt?: string | null;
  shouldIncludeLogo?: boolean;
  imageStyle?: ArticlePublishedEmailInput['imageStyle'];
  imageRationale?: string | null;
  logoSrc: string;
};

function buildImagePromptSection(opts: HtmlOpts): string {
  const styleLabels: Record<string, string> = {
    diagram: 'תרשים / Diagram',
    illustration: 'איור / Illustration',
    photograph: 'תמונה פוטוריאליסטית / Photo',
    abstract: 'אבסטרקטי / Abstract',
    infographic: 'אינפוגרפיקה / Infographic',
  };
  const styleLine = opts.imageStyle ? styleLabels[opts.imageStyle] ?? opts.imageStyle : '';
  const logoLine = opts.shouldIncludeLogo
    ? '<span style="color:#15803d;font-weight:700;">✓ לוגו של WeCcelerate משולב בתוך התמונה</span>'
    : '<span style="color:#7c2d12;font-weight:700;">— ללא לוגו</span>  <span style="color:#94a3b8;">(אפשר להוסיף לוגו ידנית אחרי הייצור)</span>';

  return `<tr>
        <td style="padding:0 32px;">
          <div style="border-top:1px solid #e2e8f0;padding-top:24px;">
            <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:10px;">
              🎨 Prompt לתמונה של הפוסט
            </div>
            <p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.6;">
              הדביקי את ה-prompt למחולל תמונות מועדף (Nano Banana 2 / ChatGPT 5.5 / Midjourney / Gemini).
              ${opts.imageRationale ? `<br /><span style="color:#0f172a;"><strong>למה הסגנון הזה:</strong> ${escapeHtml(opts.imageRationale)}</span>` : ''}
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 12px;">
          <div style="background:#0f172a;background-image:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:12px;padding:20px 22px;color:#e2e8f0;font-size:14px;line-height:1.65;direction:ltr;text-align:left;font-family:'SF Mono','Menlo','Consolas',monospace;white-space:pre-wrap;word-break:break-word;">
${escapeHtml(opts.imagePrompt ?? '').replace(/\n/g, '<br />')}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafbff;border:1px solid #e2e8f0;border-radius:8px;">
            <tr>
              <td style="padding:12px 16px;font-size:12px;color:#475569;line-height:1.7;">
                <div><strong>סגנון מומלץ:</strong> ${escapeHtml(styleLine)}</div>
                <div style="margin-top:4px;"><strong>לוגו:</strong> ${logoLine}</div>
                <div style="margin-top:4px;"><strong>יחס מומלץ ל-LinkedIn:</strong> 1200x627 (link preview) או 1080x1080 (פוסט)</div>
                <div style="margin-top:4px;color:#94a3b8;">טיפ: למחוללים שלא יודעים עברית טוב, אם יש טקסט בתמונה — באנגלית.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
}

function buildHtml(opts: HtmlOpts): string {
  const title = escapeHtml(opts.titleHe);
  // Preserve line breaks inside the <pre>-style post block by switching \n to <br>
  // (white-space:pre-wrap inside the wrapper also keeps spacing).
  const postEscaped = escapeHtml(opts.linkedInPost).replace(/\n/g, '<br />');
  const metaLine =
    [
      opts.category && `קטגוריה: ${escapeHtml(opts.category)}`,
      opts.wordCount && `${opts.wordCount.toLocaleString('he-IL')} מילים`,
    ]
      .filter(Boolean)
      .join(' · ') || '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <title>מאמר חדש מדוד</title>
</head>
<body style="margin:0;padding:0;background:#eef0f7;font-family:'Heebo','Segoe UI','Arial Hebrew',Arial,Helvetica,sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
  ${title} — מוכן לפרסום ב-LinkedIn. הפוסט המוכן מצורף.
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f7;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(7,11,30,0.08);">

      <!-- HERO -->
      <tr>
        <td align="center" style="background:#070b1e;background-image:linear-gradient(135deg,#070b1e 0%,#0e1736 55%,#0a1024 100%);padding:36px 32px 28px;">
          <img src="${opts.logoSrc}" alt="WeCcelerate" width="180" height="50"
               style="display:block;height:auto;max-width:180px;width:180px;margin:0 auto 14px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
               border="0" />
          <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#c8a951;font-weight:700;">
            📝 דוד פרסם מאמר חדש
          </div>
        </td>
      </tr>
      <tr>
        <td style="height:3px;background:linear-gradient(90deg,#c8a951 0%,#e8d48b 50%,#c8a951 100%);line-height:0;font-size:0;">&nbsp;</td>
      </tr>

      <!-- ARTICLE -->
      <tr>
        <td style="padding:32px 32px 12px;">
          <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.35;">
            ${title}
          </h1>
          ${metaLine ? `<div style="font-size:12px;color:#64748b;margin-bottom:18px;">${metaLine}</div>` : '<div style="height:6px;line-height:0;font-size:0;">&nbsp;</div>'}
          ${opts.topicHint ? `<p style="margin:0 0 18px;font-size:13px;color:#475569;line-height:1.6;background:#f8fafc;border-right:3px solid #c8a951;padding:10px 14px;border-radius:6px;">
            <strong style="color:#334155;">הנושא:</strong> ${escapeHtml(opts.topicHint)}
          </p>` : ''}
        </td>
      </tr>

      <!-- BIG CTA: read the article -->
      <tr>
        <td align="center" style="padding:6px 32px 24px;">
          <a href="${opts.articleUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#c8a951 0%,#e8d48b 50%,#c8a951 100%);color:#070b1e !important;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;font-size:15px;box-shadow:0 6px 18px rgba(200,169,81,0.30);letter-spacing:0.02em;">
            קריאה באתר ←
          </a>
          <div style="margin-top:10px;font-size:11px;color:#94a3b8;font-family:'SF Mono',Menlo,monospace;direction:ltr;word-break:break-all;">
            ${escapeHtml(opts.articleUrl)}
          </div>
        </td>
      </tr>

      <!-- LINKEDIN POST -->
      <tr>
        <td style="padding:0 32px;">
          <div style="border-top:1px solid #e2e8f0;padding-top:24px;">
            <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:10px;">
              💼 פוסט מוכן ל-LinkedIn
            </div>
            <p style="margin:0 0 14px;font-size:13px;color:#475569;line-height:1.6;">
              העתיקי, ערכי במידת הצורך, והדביקי ב-LinkedIn. המטרה: backlink באיכות גבוהה שמחזק את ה-SEO/GEO/AEO של המאמר.
            </p>
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px 24px;">
          <div style="background:#0a66c2;background-image:linear-gradient(135deg,#0a66c2 0%,#084c93 100%);border-radius:12px;padding:20px 22px;color:#ffffff;font-size:15px;line-height:1.65;white-space:pre-wrap;direction:rtl;text-align:right;font-family:'Heebo','Segoe UI','Arial Hebrew',Arial,sans-serif;">
${postEscaped}
          </div>
        </td>
      </tr>

      <!-- LINKEDIN SHARE BUTTON -->
      <tr>
        <td align="center" style="padding:0 32px 20px;">
          <a href="${opts.shareUrl}"
             style="display:inline-block;background:#0a66c2;color:#ffffff !important;font-weight:700;padding:11px 26px;border-radius:8px;text-decoration:none;font-size:14px;letter-spacing:0.02em;">
            פתח LinkedIn עם הקישור מוכן ←
          </a>
          <div style="margin-top:8px;font-size:11px;color:#94a3b8;">
            (יפתח את חלון השיתוף של LinkedIn עם הקישור מודבק. תוסיפי את הטקסט מלמעלה.)
          </div>
        </td>
      </tr>

      ${opts.imagePrompt ? buildImagePromptSection(opts) : ''}

      <!-- FOOTER -->
      <tr>
        <td style="background:#070b1e;padding:24px 32px;text-align:center;">
          <img src="${opts.logoSrc}" alt="WeCcelerate" width="100" height="28"
               style="display:block;height:auto;max-width:100px;width:100px;margin:0 auto 10px;opacity:0.9;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"
               border="0" />
          <div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.7;">
            הודעה אוטומטית מדוד · WeCcelerate
            <br />
            <a href="https://weccelerate.co.il" style="color:#c8a951;text-decoration:none;">weccelerate.co.il</a>
          </div>
        </td>
      </tr>

    </table>

    <div style="height:24px;line-height:0;font-size:0;">&nbsp;</div>

  </td></tr>
</table>
</body>
</html>`;
}

function buildText(opts: {
  titleHe: string;
  topicHint?: string | null;
  articleUrl: string;
  linkedInPost: string;
  imagePrompt?: string | null;
}): string {
  return `📝 דוד פרסם מאמר חדש
========================================

${opts.titleHe}
${opts.topicHint ? `\nהנושא: ${opts.topicHint}\n` : ''}
קריאה באתר: ${opts.articleUrl}

----------------------------------------
פוסט מוכן ל-LinkedIn (להעתקה):
----------------------------------------

${opts.linkedInPost}
${opts.imagePrompt ? `
----------------------------------------
Prompt לתמונה (להדבקה במחולל תמונות):
----------------------------------------

${opts.imagePrompt}
` : ''}
----------------------------------------

— דוד, WeCcelerate
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
