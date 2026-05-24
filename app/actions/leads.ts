/**
 * Lead Generation Server Actions
 *
 * Server actions for handling form submissions.
 * Sends data to Zapier webhook and logs to database.
 */

'use server';

import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { z } from 'zod';
import { runSpamFilter, type SpamFilterResult } from '@/lib/leads/spam-filter';
import { checkRateLimit, hashIp } from '@/lib/leads/rate-limit';

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

const ContactFormSchema = z.object({
  name: z.string()
    .min(2, 'השם חייב להכיל לפחות 2 תווים')
    .max(100, 'השם ארוך מדי'),
  email: z.string()
    .email('כתובת אימייל לא תקינה'),
  phone: z.string()
    .min(1, 'טלפון הוא שדה חובה')
    .refine((val) => /^[+]?\d[\d\s\-()]{6,19}$/.test(val) && val.replace(/\D/g, '').length >= 7, {
      message: 'מספר טלפון לא תקין',
    }),
  company: z.string()
    .max(100, 'שם החברה ארוך מדי')
    .optional(),
  message: z.string()
    .max(2000, 'ההודעה ארוכה מדי')
    .optional(),
});

const ApplicationFormSchema = ContactFormSchema.extend({
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  stage: z.enum(['idea', 'mvp', 'early', 'growth', 'scale']).optional(),
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
  leadId?: string;
}

// =============================================================================
// ZAPIER WEBHOOK
// =============================================================================

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL || '';

// =============================================================================
// LEAD SOURCE LABELS (Hebrew) — map site key to human-readable label
// =============================================================================

const SITE_SOURCE_LABELS: Record<string, string> = {
  main: 'אתר ראשי',
  leumit: 'דף נחיתה · Leumit MedTech',
  biz: 'דף נחיתה · Business',
  landing: 'דף נחיתה · קמפיין',
};

function getSourceLabel(site: string | null | undefined): string {
  if (!site) return SITE_SOURCE_LABELS.main;
  return SITE_SOURCE_LABELS[site] || `אתר · ${site}`;
}

// =============================================================================
// SPAM AUDIT — log every lead's filter decision so we can tune weights
// =============================================================================

/**
 * Centralized routing helper. After validation, EVERY lead funnels through
 * here so the spam decision and audit trail are consistent across the 4
 * server actions (contact / application / newsletter / event).
 *
 * Returns the user-facing FormState. Always claims success on `drop` so the
 * bot doesn't learn the filter exists.
 */
async function routeLeadThroughFilter(opts: {
  leadData: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    message?: string | null;
  };
  envelope: { honeypot?: string | null; renderedAtMs?: number | null };
  meta: {
    site: string | null;
    sourceUrl: string | null;
    formType: string;
    extra?: Record<string, unknown>;
    userSuccessMessage: string;
  };
}): Promise<FormState> {
  const { leadData, envelope, meta } = opts;

  // PHASE 2: capture source IP + check blocklist + rate-limit before scoring.
  const ip = await getSourceIp();
  const ipHash = ip ? hashIp(ip) : null;

  const rate = await checkRateLimit({ email: leadData.email, ip });
  if (!rate.allowed) {
    // Log so the admin can see why nothing came through; return success
    // silently so a misconfigured integration doesn't retry.
    try {
      await prisma.activityLog.create({
        data: {
          action: rate.reason.startsWith('blocklist') ? 'lead.blocklist_hit' : 'lead.rate_limited',
          description: `${rate.reason}: ${leadData.email}`,
          metadata: {
            email: leadData.email,
            name: leadData.name,
            ipHash,
            reason: rate.reason,
            detail: rate.detail,
            site: meta.site || 'main',
            formType: meta.formType,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      /* swallow */
    }
    return { success: true, message: meta.userSuccessMessage };
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

  // Decision: drop. Log to audit only, return success silently.
  if (filter.decision === 'drop') {
    try {
      await prisma.activityLog.create({
        data: {
          action: 'lead.spam_blocked',
          description: `Spam blocked (score ${filter.score}): ${leadData.email}`,
          metadata: {
            email: leadData.email,
            name: leadData.name,
            phone: leadData.phone || null,
            site: meta.site || 'main',
            formType: meta.formType,
            sourceUrl: meta.sourceUrl,
            ipHash,
            spamScore: filter.score,
            spamCodes: filter.codes,
            spamReasons: filter.reasons,
            status: 'spam',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error('[Spam] audit log failed:', err);
    }
    return { success: true, message: meta.userSuccessMessage };
  }

  // Decision: review. Log to DB with status='review', skip Zapier.
  if (filter.decision === 'review') {
    try {
      await prisma.activityLog.create({
        data: {
          action: 'lead.spam_review',
          description: `Soft hold (score ${filter.score}): ${leadData.email}`,
          metadata: {
            ...leadData,
            ...(meta.extra ?? {}),
            site: meta.site || 'main',
            sourceUrl: meta.sourceUrl,
            formType: meta.formType,
            sourceLabel: getSourceLabel(meta.site),
            ipHash,
            spamScore: filter.score,
            spamCodes: filter.codes,
            spamReasons: filter.reasons,
            status: 'pending_review',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error('[Spam] review log failed:', err);
    }
    return { success: true, message: meta.userSuccessMessage };
  }

  // Decision: pass. Normal flow — Zapier + the standard activity log.
  sendToZapier({
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone || undefined,
    company: leadData.company || undefined,
    message: leadData.message || undefined,
    formType: meta.formType,
    site: meta.site,
    sourceUrl: meta.sourceUrl,
  });

  try {
    await prisma.activityLog.create({
      data: {
        action: meta.formType === 'contact' ? 'form.contact_submit' : `form.${meta.formType}`,
        description: `${getSourceLabel(meta.site)} · ${leadData.name} · ${leadData.email}`,
        metadata: {
          ...leadData,
          ...(meta.extra ?? {}),
          site: meta.site || 'main',
          sourceLabel: getSourceLabel(meta.site),
          formType: meta.formType,
          sourceUrl: meta.sourceUrl,
          ipHash,
          spamScore: filter.score,
          spamCodes: filter.codes,
          status: 'approved',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error(`[${meta.formType}] DB log failed:`, err);
  }

  return { success: true, message: meta.userSuccessMessage };
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

async function sendToZapier(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  formType?: string;
  site?: string | null;
  sourceUrl?: string | null;
}): Promise<void> {
  try {
    const now = new Date();
    const sourceLabel = getSourceLabel(data.site);
    const payload = {
      'תאריך': now.toLocaleDateString('he-IL') + ' ' + now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      'שם מלא': data.name,
      'טלפון': data.phone || '',
      'אימייל': data.email,
      'מודעה': sourceLabel,
      'מקור': sourceLabel,
      'סאבדומיין': data.site || 'main',
      'סוג טופס': data.formType || 'contact',
      'כתובת מקור': data.sourceUrl || '',
      'הודעה': data.message || '',
      'חברה': data.company || '',
    };
    if (!ZAPIER_WEBHOOK_URL) {
      console.warn('[Zapier] ZAPIER_WEBHOOK_URL not configured');
      return;
    }
    await fetch(ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[Zapier] webhook failed:', err);
  }
}

// =============================================================================
// CONTACT FORM ACTION
// =============================================================================

export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    message: formData.get('message'),
  };

  const sourceUrl = formData.get('sourceUrl') as string | null;
  const site = formData.get('site') as string | null;
  const formType = (formData.get('formType') as string | null) || 'contact';

  const validationResult = ContactFormSchema.safeParse(rawData);

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
    },
    envelope: readEnvelope(formData),
    meta: {
      site,
      sourceUrl,
      formType: formType || 'contact',
      userSuccessMessage: 'תודה על פנייתך! ניצור איתך קשר בהקדם.',
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

  const sourceUrl = formData.get('sourceUrl') as string | null;
  const site = formData.get('site') as string | null;

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
    },
    envelope: readEnvelope(formData),
    meta: {
      site,
      sourceUrl,
      formType: 'application',
      extra: {
        industry: validData.industry || null,
        companySize: validData.companySize || null,
        stage: validData.stage || null,
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

  const site = formData.get('site') as string | null;

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
      sourceUrl: null,
      formType: 'newsletter',
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

  const eventId = formData.get('eventId') as string | null;
  const eventName = formData.get('eventName') as string | null;
  const site = formData.get('site') as string | null;

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
      sourceUrl: null,
      formType: 'event',
      extra: { eventId, eventName },
      userSuccessMessage: 'נרשמת בהצלחה לאירוע! נשלח אליך אישור במייל.',
    },
  });

  // Increment registration count only if the lead actually went through
  // (we don't want to inflate counts on spam attempts).
  if (eventId && result.success) {
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
// QUICK LEAD ACTION
// =============================================================================

const VALID_FORM_TYPES = ['contact', 'application', 'newsletter', 'event', 'api', 'leumit_landing'] as const;

const LeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  sourceUrl: z.string().max(2048).optional(),
  formType: z.enum(VALID_FORM_TYPES).optional(),
  site: z.string().max(50).optional(),
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
    },
    envelope: { honeypot: null, renderedAtMs: null }, // programmatic — no envelope
    meta: {
      site: validData.site || null,
      sourceUrl: validData.sourceUrl || null,
      formType,
      userSuccessMessage: 'הפנייה נשלחה בהצלחה',
    },
  });
}
