/**
 * Lead Generation Server Actions
 *
 * Server actions for handling form submissions.
 * Sends data to Zapier webhook and logs to database.
 */

'use server';

import { prisma } from '@/lib/db';
import { z } from 'zod';

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
  const sourceLabel = getSourceLabel(site);

  // Send to Zapier (fire-and-forget) — includes subdomain source
  sendToZapier({ ...validData, formType, site, sourceUrl });

  // Log to database — unified action name so admin counters work for all forms
  try {
    await prisma.activityLog.create({
      data: {
        action: 'form.contact_submit',
        description: `${sourceLabel} · ${validData.name} · ${validData.email}`,
        metadata: {
          name: validData.name,
          email: validData.email,
          phone: validData.phone || null,
          company: validData.company || null,
          message: validData.message || null,
          site: site || 'main',
          sourceLabel,
          formType,
          sourceUrl: sourceUrl || null,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error('[Contact] DB log failed:', err);
  }

  return {
    success: true,
    message: 'תודה על פנייתך! ניצור איתך קשר בהקדם.',
  };
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

  // Send to Zapier
  sendToZapier({ ...validData, formType: 'application' });

  // Log to database
  try {
    await prisma.activityLog.create({
      data: {
        action: 'form.application',
        description: `Application form: ${validData.email}`,
        metadata: {
          name: validData.name,
          email: validData.email,
          phone: validData.phone || null,
          company: validData.company || null,
          message: validData.message || null,
          industry: validData.industry || null,
          companySize: validData.companySize || null,
          stage: validData.stage || null,
          fundingNeeded: validData.fundingNeeded || null,
          site: site || 'main',
          sourceUrl: sourceUrl || null,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error('[Application] DB log failed:', err);
  }

  return {
    success: true,
    message: 'תודה על הגשת המועמדות! נבדוק את הפרטים ונחזור אליך בהקדם.',
  };
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

  // Send to Zapier
  sendToZapier({ name: validData.name || validData.email.split('@')[0], email: validData.email, formType: 'newsletter' });

  // Log to database
  try {
    await prisma.activityLog.create({
      data: {
        action: 'form.newsletter',
        description: `Newsletter signup: ${validData.email}`,
        metadata: {
          email: validData.email,
          name: validData.name || null,
          site: site || 'main',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error('[Newsletter] DB log failed:', err);
  }

  return {
    success: true,
    message: 'תודה! נרשמת בהצלחה לניוזלטר.',
  };
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

  // Send to Zapier
  sendToZapier({
    ...validData,
    message: eventName ? `הרשמה לאירוע: ${eventName}` : 'הרשמה לאירוע',
    formType: 'event',
  });

  // Update event registration count with capacity check
  if (eventId) {
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { capacity: true, registeredCount: true },
      });

      if (event?.capacity && event.registeredCount >= event.capacity) {
        return {
          success: false,
          message: 'האירוע מלא - אין מקומות פנויים.',
        };
      }

      await prisma.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      });
    } catch (error) {
      console.error('[Events] Failed to update registration count:', error);
    }
  }

  // Log to database
  try {
    await prisma.activityLog.create({
      data: {
        action: 'form.event',
        description: `Event registration: ${validData.email}`,
        metadata: {
          name: validData.name,
          email: validData.email,
          phone: validData.phone || null,
          company: validData.company || null,
          eventId,
          eventName,
          site: site || 'main',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error('[Event] DB log failed:', err);
  }

  return {
    success: true,
    message: 'נרשמת בהצלחה לאירוע! נשלח אליך אישור במייל.',
  };
}

// =============================================================================
// QUICK LEAD ACTION
// =============================================================================

const VALID_FORM_TYPES = ['contact', 'application', 'newsletter', 'event', 'api'] as const;

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

  // Send to Zapier
  sendToZapier(validData);

  // Log to database
  try {
    await prisma.activityLog.create({
      data: {
        action: `form.${formType}`,
        description: `Lead: ${validData.email}`,
        metadata: {
          name: validData.name,
          email: validData.email,
          phone: validData.phone || null,
          company: validData.company || null,
          message: validData.message || null,
          sourceUrl: validData.sourceUrl || null,
          site: validData.site || 'main',
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    console.error('[Lead] DB log failed:', err);
  }

  return {
    success: true,
    message: 'הפנייה נשלחה בהצלחה',
  };
}
