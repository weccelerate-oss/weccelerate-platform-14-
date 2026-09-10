/**
 * Zapier delivery for website leads.
 *
 * The Zapier webhook IS the Pipedrive connection: a Zap receives this
 * payload and creates the person + deal in Pipedrive. Every lead that
 * reaches Pipedrive must pass through here, so this module is deliberately
 * the ONLY place that builds the payload and talks to the webhook — the
 * contact form, the WhatsApp gate, the admin "approve" and "resend" buttons
 * all share it.
 *
 * Why it is careful:
 *  - The send is awaited and the HTTP status is checked. A Zapier outage,
 *    an exhausted task quota, or a paused Zap used to be invisible (the
 *    old code fired and forgot).
 *  - Up to 3 attempts with a short backoff, 8 s timeout each — well inside
 *    a Vercel function budget.
 *  - The result is returned to the caller, which records it on the lead's
 *    activity-log row (`metadata.delivery`) and alerts the admin on failure.
 *
 * Payload keys are Hebrew because that is what the Zap's field mapping was
 * built on. Existing keys are kept verbatim; new ones are additive so the
 * Zap keeps working until someone maps the new fields in Pipedrive.
 */

export interface LeadAttribution {
  /** Coarse channel from lib/analytics/attribution.ts (google-organic, llm-chatgpt, linkedin...). */
  channel?: string | null;
  channelDetail?: string | null;
  campaign?: string | null;
  firstChannel?: string | null;
  landingPage?: string | null;
  referrerUrl?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
}

export interface ZapierLead {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  formType?: string | null;
  site?: string | null;
  sourceUrl?: string | null;
  stage?: string | null;
  service?: string | null;
  attribution?: LeadAttribution | null;
  /** ActivityLog id — lets the Zap/Pipedrive note point back at the admin row. */
  leadId?: string | null;
  spamScore?: number | null;
  /** Free-text marker such as 'approved_after_review' or 'admin_resend'. */
  note?: string | null;
}

export interface DeliveryResult {
  status: 'sent' | 'failed' | 'skipped';
  attempts: number;
  httpStatus?: number;
  error?: string;
  at: string;
}

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL || '';
const MAX_ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MS = 8_000;
const BACKOFF_MS = [500, 1_500];

export const SITE_SOURCE_LABELS: Record<string, string> = {
  main: 'אתר ראשי',
  leumit: 'דף נחיתה · Leumit MedTech',
  biz: 'דף נחיתה · Business',
  landing: 'דף נחיתה · קמפיין',
};

export const FORM_TYPE_LABELS: Record<string, string> = {
  contact: 'טופס צור קשר',
  whatsapp_gate: 'טופס וואטסאפ',
  home_cta: 'טופס דף הבית',
  service: 'טופס עמוד שירות',
  guide_inline: 'טופס בתוך מדריך',
  lead_magnet: 'מגנט לידים',
  event: 'הרשמה לאירוע',
  newsletter: 'ניוזלטר',
  application: 'הגשת מועמדות',
  leumit_landing: 'דף נחיתה Leumit',
  biz_landing: 'דף נחיתה Business',
  landing_multiselect: 'דף נחיתה קמפיין',
  api: 'API',
};

export const STAGE_LABELS: Record<string, string> = {
  idea: 'רעיון / מחקר',
  mvp: 'בפיתוח MVP',
  early: 'שלב מוקדם (יש מוצר)',
  growth: 'צמיחה (יש לקוחות)',
  scale: 'Scale (מגייסים / מתרחבים)',
};

export const SERVICE_LABELS: Record<string, string> = {
  'business-consulting': 'ייעוץ עסקי ואסטרטגי',
  'digital-product': 'פיתוח מוצר דיגיטלי',
  'physical-product': 'פיתוח מוצר פיזי',
  marketing: 'שיווק, פרסום ויח"צ',
  'medtech-leumit': 'מסלול MedTech עם לאומית',
  investors: 'שירותי משקיעים',
  'investor-preparation': 'הכנה למשקיעים',
};

export function getSourceLabel(site: string | null | undefined): string {
  if (!site) return SITE_SOURCE_LABELS.main;
  return SITE_SOURCE_LABELS[site] || `אתר · ${site}`;
}

export function getFormTypeLabel(formType: string | null | undefined): string {
  if (!formType) return FORM_TYPE_LABELS.contact;
  return FORM_TYPE_LABELS[formType] || formType;
}

/** Human channel label for Pipedrive — Hebrew, short, stable. */
export function getChannelLabel(channel: string | null | undefined): string {
  if (!channel) return 'לא ידוע';
  const map: Record<string, string> = {
    direct: 'ישיר',
    'google-organic': 'גוגל אורגני',
    'google-ads': 'גוגל ממומן',
    'bing-organic': 'Bing',
    'search-other': 'חיפוש אחר',
    facebook: 'פייסבוק',
    'facebook-ads': 'פייסבוק ממומן',
    instagram: 'אינסטגרם',
    tiktok: 'טיקטוק',
    linkedin: 'לינקדאין',
    youtube: 'יוטיוב',
    'twitter-x': 'X',
    whatsapp: 'וואטסאפ',
    campaign: 'קמפיין',
    'campaign-ads': 'קמפיין ממומן',
    referral: 'הפניה מאתר',
    'llm-chatgpt': 'ChatGPT',
    'llm-claude': 'Claude',
    'llm-gemini': 'Gemini',
    'llm-perplexity': 'Perplexity',
    'llm-copilot': 'Copilot',
  };
  return map[channel] || channel;
}

function nowHe(): string {
  const now = new Date();
  return (
    now.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }) +
    ' ' +
    now.toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' })
  );
}

/** Build the exact JSON the Zap receives. Pure — safe to unit test. */
export function buildZapierPayload(lead: ZapierLead): Record<string, string> {
  const sourceLabel = getSourceLabel(lead.site);
  const formLabel = getFormTypeLabel(lead.formType);
  const a = lead.attribution ?? {};
  let page = '';
  try {
    page = lead.sourceUrl ? new URL(lead.sourceUrl).pathname : '';
  } catch {
    page = lead.sourceUrl || '';
  }

  return {
    // ---- keys the Zap already maps (do not rename) ----
    'תאריך': nowHe(),
    'שם מלא': lead.name,
    'טלפון': lead.phone || '',
    'אימייל': lead.email,
    'מודעה': sourceLabel,
    'מקור': sourceLabel,
    'סאבדומיין': lead.site || 'main',
    'סוג טופס': lead.formType || 'contact',
    'כתובת מקור': lead.sourceUrl || '',
    'הודעה': lead.message || '',
    'חברה': lead.company || '',
    // ---- additive keys — map these to Pipedrive custom fields ----
    'מקור מפורט': [sourceLabel, formLabel, page].filter(Boolean).join(' · '),
    'סוג טופס (עברית)': formLabel,
    'שלב המיזם': lead.stage ? STAGE_LABELS[lead.stage] || lead.stage : '',
    'שירות מבוקש': lead.service ? SERVICE_LABELS[lead.service] || lead.service : '',
    'ערוץ': getChannelLabel(a.channel),
    'ערוץ (קוד)': a.channel || '',
    'פירוט ערוץ': a.channelDetail || '',
    'ערוץ ראשון': getChannelLabel(a.firstChannel),
    'קמפיין': a.campaign || a.utmCampaign || '',
    'UTM מקור': a.utmSource || '',
    'UTM מדיום': a.utmMedium || '',
    'UTM קמפיין': a.utmCampaign || '',
    'UTM תוכן': a.utmContent || '',
    'UTM מונח': a.utmTerm || '',
    'gclid': a.gclid || '',
    'fbclid': a.fbclid || '',
    'עמוד מפנה': a.referrerUrl || '',
    'עמוד נחיתה': a.landingPage || '',
    'עמוד שליחה': page,
    'מזהה ליד': lead.leadId || '',
    'ציון ספאם': typeof lead.spamScore === 'number' ? String(lead.spamScore) : '',
    'מקור-משני': lead.note || '',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * POST the payload to the Zap. Never throws — returns a DeliveryResult the
 * caller must persist. `skipped` means the webhook URL is not configured,
 * which is a deployment error worth alerting on just like a failure.
 */
export async function sendToZapier(payload: Record<string, string>): Promise<DeliveryResult> {
  const at = new Date().toISOString();
  if (!ZAPIER_WEBHOOK_URL) {
    console.error('[Zapier] ZAPIER_WEBHOOK_URL not configured — lead NOT delivered');
    return { status: 'skipped', attempts: 0, error: 'ZAPIER_WEBHOOK_URL not configured', at };
  }

  let lastError = '';
  let lastStatus: number | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetch(ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        cache: 'no-store',
      });
      lastStatus = res.status;
      if (res.ok) {
        return { status: 'sent', attempts: attempt, httpStatus: res.status, at };
      }
      // 4xx other than 429 will not get better on retry.
      lastError = `HTTP ${res.status}`;
      if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF_MS[attempt - 1] ?? 1_000);
  }

  console.error(`[Zapier] delivery failed after retries: ${lastError}`);
  return { status: 'failed', attempts: MAX_ATTEMPTS, httpStatus: lastStatus, error: lastError, at };
}

/** Convenience: build + send in one call. */
export async function deliverLead(lead: ZapierLead): Promise<DeliveryResult> {
  return sendToZapier(buildZapierPayload(lead));
}
