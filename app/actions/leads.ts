/**
 * Lead Generation Server Actions
 *
 * Every public form on the marketing site (contact page, inline lead forms,
 * the WhatsApp gate, landing-page forms, event registration, newsletter)
 * lands here. The flow is:
 *
 *   validate → blocklist / rate limit → spam score → persist ActivityLog row
 *   → deliver to Zapier (= Pipedrive) → record delivery result on the row
 *   → alert admin if delivery failed.
 *
 * The FormState returned to the client carries `delivered`, which is what
 * the UI uses to decide whether to fire the conversion event and redirect to
 * /thanks. Spam-dropped, held-for-review and rate-limited submissions return
 * `delivered: false` so analytics only count real leads.
 */

'use server';

import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { z } from 'zod';
import { runSpamFilter, type SpamFilterResult } from '@/lib/leads/spam-filter';
import { checkRateLimit, hashIp } from '@/lib/leads/rate-limit';
import {
  deliverLead,
  getSourceLabel,
  type DeliveryResult,
  type LeadAttribution,
} from '@/lib/leads/zapier';
import { notifyLeadDeliveryFailed } from '@/lib/leads/alert-email';

/** Pull the source IP from request headers. Trusts x-forwarded-for from
 * Vercel's edge, which is set automatically. */
async function getSourceIp(): Promise<string | null> {
  try {
    const h = await headers();
    const xff = h.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return h.get('x-real-ip');
  } catch {
    return null;
  }
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const PHONE_RE = /^[+]?\d[\d\s\-()]{6,19}$/;
const isPhone = (val: string) => PHONE_RE.test(val) && val.replace(/\D/g, '').length >= 7;

const STAGES = ['idea', 'mvp', 'early', 'growth', 'scale'] as const;
export type LeadStage = (typeof STAGES)[number];

const ContactFormSchema = z.object({
  name: z.string()
    .min(2, 'השם חייב להכיל לפחות 2 תווים')
    .max(100, 'השם ארוך מדי'),
  email: z.string()
    .email('כתובת אימייל לא תקינה'),
  phone: z.string()
    .min(1, 'טלפון הוא שדה חובה')
    .refine(isPhone, { message: 'מספר טלפון לא תקין' }),
  company: z.string()
    .max(100, 'שם החברה ארוך מדי')
    .optional(),
  message: z.string()
    .max(2000, 'ההודעה ארוכה מדי')
    .optional(),
});

/** The WhatsApp gate asks for name + phone only; email is welcome but optional. */
const WhatsAppGateSchema = ContactFormSchema.extend({
  email: z.union([z.literal(''), z.string().email('כתובת אימייל לא תקינה')]).optional(),
});

const ApplicationFormSchema = ContactFormSchema.extend({
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  stage: z.enum(STAGES).optional(),
  fundingNeeded: z.number().min(0).max(100000000).optional(),
});

const NewsletterSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  name: z.string().optional(),
});

// =============================================================================
// TYPES
// =============================================================================

export interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  /** ActivityLog id of the persisted lead (only when it passed the filter). */
  leadId?: string;
  /** True only when the lead was accepted AND reached Zapier. Drives
   * conversion tracking + the /thanks redirect on the client. */
  delivered?: boolean;
}

// =============================================================================
// FORM-DATA READERS
// =============================================================================

function str(formData: FormData, key: string, max = 500): string | null {
  const v = formData.get(key);
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/** Attribution the client collected (UTM, referrer, classified channel). */
function readAttribution(formData: FormData): LeadAttribution {
  return {
    utmSource: str(formData, 'utm_source', 200),
    utmMedium: str(formData, 'utm_medium', 200),
    utmCampaign: str(formData, 'utm_campaign', 200),
    utmContent: str(formData, 'utm_content', 200),
    utmTerm: str(formData, 'utm_term', 200),
    gclid: str(formData, 'gclid', 200),
    fbclid: str(formData, 'fbclid', 200),
    referrerUrl: str(formData, 'referrerUrl', 2048),
    landingPage: str(formData, 'landingPage', 500),
    channel: str(formData, 'channel', 60),
    channelDetail: str(formData, 'channelDetail', 200),
    campaign: str(formData, 'campaign', 200),
    firstChannel: str(formData, 'firstChannel', 60),
  };
}

function readStage(formData: FormData): LeadStage | null {
  const v = str(formData, 'stage', 20);
  return v && (STAGES as readonly string[]).includes(v) ? (v as LeadStage) : null;
}

function readService(formData: FormData): string | null {
  const v = str(formData, 'service', 60);
  return v && /^[a-z0-9-]{1,60}$/.test(v) ? v : null;
}

/** Pull honeypot + timestamp envelope from FormData. */
function readEnvelope(formData: FormData): { honeypot: string | null; renderedAtMs: number | null } {
  const hp = formData.get('website');
  const ts = formData.get('_ts');
  const tsNum = typeof ts === 'string' ? Number(ts) : NaN;
  return {
    honeypot: typeof hp === 'string' ? hp : null,
    renderedAtMs: Number.isFinite(tsNum) && tsNum > 0 ? tsNum : null,
  };
}

// =============================================================================
// CENTRAL ROUTER — validate → filter → persist → deliver
// =============================================================================

const RATE_LIMITED_MESSAGE =
  'כבר קיבלנו ממך פנייה לאחרונה ואנחנו בדרך אליך. לפנייה דחופה אפשר להתקשר ל-055-564-7538.';

/**
 * Centralized routing helper. After validation, EVERY lead funnels through
 * here so the spam decision, the audit trail and the Zapier delivery are
 * consistent across all server actions.
 *
 * Claims success on `drop` so a bot doesn't learn the filter exists, but
 * returns `delivered: false` so the UI never counts it as a conversion.
 */
async function routeLeadThroughFilter(opts: {
  leadData: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    message?: string | null;
    stage?: string | null;
    service?: string | null;
  };
  envelope: { honeypot?: string | null; renderedAtMs?: number | null };
  meta: {
    site: string | null;
    sourceUrl: string | null;
    formType: string;
    attribution?: LeadAttribution | null;
    extra?: Record<string, unknown>;
    userSuccessMessage: string;
  };
}): Promise<FormState> {
  const { leadData, envelope, meta } = opts;
  const attribution = meta.attribution ?? {};

  // PHASE 2: capture source IP + check blocklist + rate-limit before scoring.
  const ip = await getSourceIp();
  const ipHash = ip ? hashIp(ip) : null;

  const rate = await checkRateLimit({ email: leadData.email, ip });
  if (!rate.allowed) {
    try {
      await prisma.activityLog.create({
        data: {
          action: rate.reason.startsWith('blocklist') ? 'lead.blocklist_hit' : 'lead.rate_limited',
          description: `${rate.reason}: ${leadData.email || leadData.phone}`,
          metadata: {
            email: leadData.email,
            name: leadData.name,
            phone: leadData.phone || null,
            ipHash,
            reason: rate.reason,
            detail: rate.detail,
            site: meta.site || 'main',
            formType: meta.formType,
            sourceUrl: meta.sourceUrl,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      /* swallow */
    }
    // A blocklisted sender gets the generic "thanks" (don't tip them off).
    // A legit person who simply submitted twice gets an honest message.
    const honest = rate.reason === 'rate_limit_email' || rate.reason === 'rate_limit_ip';
    return {
      success: true,
      delivered: false,
      message: honest ? RATE_LIMITED_MESSAGE : meta.userSuccessMessage,
    };
  }

  const filter: SpamFilterResult = runSpamFilter({
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company: leadData.company,
    message: leadData.message,
    site: meta.site,
    honeypot: envelope.honeypot,
    renderedAtMs: envelope.renderedAtMs,
  });

  const sharedMeta = {
    ...leadData,
    ...(meta.extra ?? {}),
    ...attribution,
    site: meta.site || 'main',
    sourceUrl: meta.sourceUrl,
    formType: meta.formType,
    sourceLabel: getSourceLabel(meta.site),
    ipHash,
    spamScore: filter.score,
    spamCodes: filter.codes,
    spamReasons: filter.reasons,
    timestamp: new Date().toISOString(),
  };

  // Decision: drop. Log to audit only, return success silently.
  if (filter.decision === 'drop') {
    try {
      await prisma.activityLog.create({
        data: {
          action: 'lead.spam_blocked',
          description: `Spam blocked (score ${filter.score}): ${leadData.email || leadData.phone}`,
          metadata: { ...sharedMeta, status: 'spam' },
        },
      });
    } catch (err) {
      console.error('[Spam] audit log failed:', err);
    }
    return { success: true, delivered: false, message: meta.userSuccessMessage };
  }

  // Decision: review. Log with status='pending_review', skip Zapier until an admin approves.
  if (filter.decision === 'review') {
    try {
      await prisma.activityLog.create({
        data: {
          action: 'lead.spam_review',
          description: `Soft hold (score ${filter.score}): ${leadData.email || leadData.phone}`,
          metadata: { ...sharedMeta, status: 'pending_review' },
        },
      });
    } catch (err) {
      console.error('[Spam] review log failed:', err);
    }
    return { success: true, delivered: false, message: meta.userSuccessMessage };
  }

  // Decision: pass. Persist first (so the Zap can reference the row), then deliver.
  let leadId: string | null = null;
  try {
    const row = await prisma.activityLog.create({
      data: {
        action: meta.formType === 'contact' ? 'form.contact_submit' : `form.${meta.formType}`,
        description: `${getSourceLabel(meta.site)} · ${leadData.name} · ${leadData.email || leadData.phone}`,
        metadata: {
          ...sharedMeta,
          status: 'approved',
          delivery: { status: 'pending', attempts: 0, at: new Date().toISOString() },
        },
      },
      select: { id: true },
    });
    leadId = row.id;
  } catch (err) {
    console.error(`[${meta.formType}] DB log failed:`, err);
  }

  const delivery: DeliveryResult = await deliverLead({
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    company: leadData.company,
    message: leadData.message,
    formType: meta.formType,
    site: meta.site,
    sourceUrl: meta.sourceUrl,
    stage: leadData.stage,
    service: leadData.service,
    attribution,
    leadId,
    spamScore: filter.score,
  });

  if (leadId) {
    try {
      await prisma.activityLog.update({
        where: { id: leadId },
        data: { metadata: { ...sharedMeta, status: 'approved', delivery } },
      });
    } catch (err) {
      console.error('[Lead] delivery status update failed:', err);
    }
  }

  if (delivery.status !== 'sent') {
    await notifyLeadDeliveryFailed({
      activityLogId: leadId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      formType: meta.formType,
      sourceUrl: meta.sourceUrl,
      delivery,
    });
  }

  return {
    success: true,
    delivered: delivery.status === 'sent',
    leadId: leadId ?? undefined,
    message: meta.userSuccessMessage,
  };
}

// =============================================================================
// CONTACT FORM ACTION — used by every lead form on the site
// =============================================================================

const CONTACT_SUCCESS = 'תודה! קיבלנו את הפרטים ונחזור אליך תוך יום עסקים.';

export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email') ?? '',
    phone: formData.get('phone'),
    company: formData.get('company'),
    message: formData.get('message'),
  };

  const sourceUrl = str(formData, 'sourceUrl', 2048);
  const site = str(formData, 'site', 50);
  const formType = str(formData, 'formType', 40) || 'contact';
  const isWhatsAppGate = formType === 'whatsapp_gate';

  const validationResult = (isWhatsAppGate ? WhatsAppGateSchema : ContactFormSchema).safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'נא לתקן את השגיאות בטופס',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  return routeLeadThroughFilter({
    leadData: {
      name: validData.name,
      email: validData.email || '',
      phone: validData.phone,
      company: validData.company || null,
      message: validData.message || null,
      stage: readStage(formData),
      service: readService(formData),
    },
    envelope: readEnvelope(formData),
    meta: {
      site,
      sourceUrl,
      formType,
      attribution: readAttribution(formData),
      userSuccessMessage: CONTACT_SUCCESS,
    },
  });
}

// =============================================================================
// APPLICATION FORM ACTION
// =============================================================================

export async function submitApplicationForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    message: formData.get('message'),
    industry: formData.get('industry'),
    companySize: formData.get('companySize'),
    stage: formData.get('stage'),
    fundingNeeded: formData.get('fundingNeeded')
      ? parseInt(formData.get('fundingNeeded') as string)
      : undefined,
  };

  const sourceUrl = str(formData, 'sourceUrl', 2048);
  const site = str(formData, 'site', 50);

  const validationResult = ApplicationFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'נא לתקן את השגיאות בטופס',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  return routeLeadThroughFilter({
    leadData: {
      name: validData.name,
      email: validData.email,
      phone: validData.phone,
      company: validData.company || null,
      message: validData.message || null,
      stage: validData.stage || null,
      service: readService(formData),
    },
    envelope: readEnvelope(formData),
    meta: {
      site,
      sourceUrl,
      formType: 'application',
      attribution: readAttribution(formData),
      extra: {
        industry: validData.industry || null,
        companySize: validData.companySize || null,
        fundingNeeded: validData.fundingNeeded || null,
      },
      userSuccessMessage: 'תודה על הגשת המועמדות! נבדוק את הפרטים ונחזור אליך בהקדם.',
    },
  });
}

// =============================================================================
// NEWSLETTER SIGNUP ACTION
// =============================================================================

export async function submitNewsletterSignup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    email: formData.get('email'),
    name: formData.get('name') || undefined,
  };

  const site = str(formData, 'site', 50);

  const validationResult = NewsletterSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'כתובת אימייל לא תקינה',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;
  const inferredName = validData.name || validData.email.split('@')[0];

  return routeLeadThroughFilter({
    leadData: {
      name: inferredName,
      email: validData.email,
      phone: null,
      company: null,
      message: null,
    },
    envelope: readEnvelope(formData),
    meta: {
      site,
      sourceUrl: str(formData, 'sourceUrl', 2048),
      formType: 'newsletter',
      attribution: readAttribution(formData),
      userSuccessMessage: 'תודה! נרשמת בהצלחה לניוזלטר.',
    },
  });
}

// =============================================================================
// EVENT REGISTRATION ACTION
// =============================================================================

export async function submitEventRegistration(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
  };

  const eventId = str(formData, 'eventId', 100);
  const eventName = str(formData, 'eventName', 200);
  const site = str(formData, 'site', 50);

  const validationResult = ContactFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'נא לתקן את השגיאות בטופס',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  // Capacity check first — if full, no point running the spam filter.
  if (eventId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { capacity: true, registeredCount: true },
      });
      if (event?.capacity && event.registeredCount >= event.capacity) {
        return { success: false, message: 'האירוע מלא - אין מקומות פנויים.' };
      }
    } catch (error) {
      console.error('[Events] Capacity check failed:', error);
    }
  }

  const result = await routeLeadThroughFilter({
    leadData: {
      name: validData.name,
      email: validData.email,
      phone: validData.phone,
      company: validData.company || null,
      message: eventName ? `הרשמה לאירוע: ${eventName}` : 'הרשמה לאירוע',
    },
    envelope: readEnvelope(formData),
    meta: {
      site,
      sourceUrl: str(formData, 'sourceUrl', 2048),
      formType: 'event',
      attribution: readAttribution(formData),
      extra: { eventId, eventName },
      userSuccessMessage: 'נרשמת בהצלחה לאירוע! נשלח אליך אישור במייל.',
    },
  });

  // Increment registration count only if the lead actually went through
  // (we don't want to inflate counts on spam attempts).
  if (eventId && result.success && result.leadId) {
    try {
      await prisma.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      });
    } catch (error) {
      console.error('[Events] Failed to update registration count:', error);
    }
  }

  return result;
}

// =============================================================================
// QUICK LEAD ACTION (programmatic)
// =============================================================================

const VALID_FORM_TYPES = [
  'contact', 'application', 'newsletter', 'event', 'api',
  'leumit_landing', 'biz_landing', 'landing_multiselect',
  'whatsapp_gate', 'home_cta', 'service', 'guide_inline', 'lead_magnet',
] as const;

const LeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  sourceUrl: z.string().max(2048).optional(),
  referrerUrl: z.string().max(2048).optional(),
  leadSource: z.string().max(100).optional(),
  formType: z.enum(VALID_FORM_TYPES).optional(),
  site: z.string().max(50).optional(),
  stage: z.enum(STAGES).optional(),
  service: z.string().max(60).optional(),
});

export async function createLeadAction(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  sourceUrl?: string;
  referrerUrl?: string;
  leadSource?: string;
  formType?: string;
  site?: string;
  stage?: LeadStage;
  service?: string;
}): Promise<FormState> {
  const parsed = LeadSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: 'שם ואימייל הם שדות חובה',
    };
  }

  const validData = parsed.data;
  const formType = validData.formType || 'api';

  return routeLeadThroughFilter({
    leadData: {
      name: validData.name,
      email: validData.email,
      phone: validData.phone || null,
      company: validData.company || null,
      message: validData.message || null,
      stage: validData.stage || null,
      service: validData.service || null,
    },
    envelope: { honeypot: null, renderedAtMs: null }, // programmatic — no envelope
    meta: {
      site: validData.site || null,
      sourceUrl: validData.sourceUrl || null,
      formType,
      attribution: {
        referrerUrl: validData.referrerUrl || null,
        channelDetail: validData.leadSource || null,
      },
      userSuccessMessage: 'הפנייה נשלחה בהצלחה',
    },
  });
}
