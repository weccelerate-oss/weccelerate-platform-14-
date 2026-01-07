/**
 * Lead Generation Server Actions
 * 
 * Server actions for handling form submissions and creating leads in Pipedrive.
 * These actions are called from client components and handle all server-side logic.
 * 
 * @module actions/leads
 */

'use server';

import { createLead, LEAD_SOURCES, type LeadData } from '@/lib/pipedrive';
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
    .optional()
    .refine((val) => !val || /^[\d\s\-+()]{7,20}$/.test(val), {
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
  leadId?: number;
}

// =============================================================================
// CONTACT FORM ACTION
// =============================================================================

/**
 * Handle contact form submission
 * 
 * Creates a lead in Pipedrive with source tracking.
 */
export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    message: formData.get('message'),
  };

  // Extract tracking data
  const sourceUrl = formData.get('sourceUrl') as string | null;
  const referrerUrl = formData.get('referrerUrl') as string | null;
  const utmSource = formData.get('utm_source') as string | null;
  const utmMedium = formData.get('utm_medium') as string | null;
  const utmCampaign = formData.get('utm_campaign') as string | null;
  const site = formData.get('site') as string | null;

  // Validate
  const validationResult = ContactFormSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return {
      success: false,
      message: 'נא לתקן את השגיאות בטופס',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  // Create lead in Pipedrive
  const leadData: LeadData = {
    name: validData.name,
    email: validData.email,
    phone: validData.phone,
    company: validData.company,
    message: validData.message,
    sourceUrl: sourceUrl || undefined,
    referrerUrl: referrerUrl || undefined,
    utmSource: utmSource || undefined,
    utmMedium: utmMedium || undefined,
    utmCampaign: utmCampaign || undefined,
    leadSource: LEAD_SOURCES.WEBSITE,
    formType: 'contact',
    site: site || 'main',
  };

  const result = await createLead(leadData);

  // Log submission to database
  await logFormSubmission({
    formType: 'contact',
    email: validData.email,
    success: result.success,
    pipedriveId: result.dealId,
    errorCode: result.errorCode,
    site: site || 'main',
    sourceUrl: sourceUrl || undefined,
  });

  if (result.success) {
    return {
      success: true,
      message: 'תודה על פנייתך! ניצור איתך קשר בהקדם.',
      leadId: result.dealId,
    };
  }

  // Friendly error message for user
  return {
    success: false,
    message: 'אירעה שגיאה בשליחת הטופס. נא לנסות שוב.',
  };
}

// =============================================================================
// APPLICATION FORM ACTION
// =============================================================================

/**
 * Handle program application form submission
 * 
 * Creates a lead in Pipedrive with additional business information.
 */
export async function submitApplicationForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract form data
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

  // Extract tracking data
  const sourceUrl = formData.get('sourceUrl') as string | null;
  const referrerUrl = formData.get('referrerUrl') as string | null;
  const utmSource = formData.get('utm_source') as string | null;
  const utmMedium = formData.get('utm_medium') as string | null;
  const utmCampaign = formData.get('utm_campaign') as string | null;
  const site = formData.get('site') as string | null;

  // Validate
  const validationResult = ApplicationFormSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return {
      success: false,
      message: 'נא לתקן את השגיאות בטופס',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  // Build message with additional info
  const additionalInfo = [];
  if (validData.industry) additionalInfo.push(`תעשייה: ${validData.industry}`);
  if (validData.companySize) additionalInfo.push(`גודל חברה: ${validData.companySize}`);
  if (validData.stage) additionalInfo.push(`שלב: ${validData.stage}`);
  if (validData.fundingNeeded) additionalInfo.push(`גיוס נדרש: $${validData.fundingNeeded.toLocaleString()}`);
  
  const fullMessage = [
    validData.message || '',
    additionalInfo.length > 0 ? '\n\n--- פרטים נוספים ---\n' + additionalInfo.join('\n') : '',
  ].filter(Boolean).join('');

  // Create lead in Pipedrive
  const leadData: LeadData = {
    name: validData.name,
    email: validData.email,
    phone: validData.phone,
    company: validData.company,
    message: fullMessage,
    sourceUrl: sourceUrl || undefined,
    referrerUrl: referrerUrl || undefined,
    utmSource: utmSource || undefined,
    utmMedium: utmMedium || undefined,
    utmCampaign: utmCampaign || undefined,
    leadSource: LEAD_SOURCES.WEBSITE,
    formType: 'application',
    site: site || 'main',
    industry: validData.industry,
    companySize: validData.companySize,
    budget: validData.fundingNeeded,
  };

  const result = await createLead(leadData);

  // Log submission
  await logFormSubmission({
    formType: 'application',
    email: validData.email,
    success: result.success,
    pipedriveId: result.dealId,
    errorCode: result.errorCode,
    site: site || 'main',
    sourceUrl: sourceUrl || undefined,
  });

  if (result.success) {
    return {
      success: true,
      message: 'תודה על הגשת המועמדות! נבדוק את הפרטים ונחזור אליך בהקדם.',
      leadId: result.dealId,
    };
  }

  return {
    success: false,
    message: 'אירעה שגיאה בשליחת הטופס. נא לנסות שוב.',
  };
}

// =============================================================================
// NEWSLETTER SIGNUP ACTION
// =============================================================================

/**
 * Handle newsletter signup
 */
export async function submitNewsletterSignup(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = {
    email: formData.get('email'),
    name: formData.get('name') || undefined,
  };

  const sourceUrl = formData.get('sourceUrl') as string | null;
  const site = formData.get('site') as string | null;

  // Validate
  const validationResult = NewsletterSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return {
      success: false,
      message: 'כתובת אימייל לא תקינה',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  // Create minimal lead in Pipedrive
  const leadData: LeadData = {
    name: validData.name || validData.email.split('@')[0],
    email: validData.email,
    sourceUrl: sourceUrl || undefined,
    leadSource: LEAD_SOURCES.BLOG,
    formType: 'newsletter',
    site: site || 'main',
  };

  const result = await createLead(leadData);

  // Log submission
  await logFormSubmission({
    formType: 'newsletter',
    email: validData.email,
    success: result.success,
    pipedriveId: result.dealId,
    errorCode: result.errorCode,
    site: site || 'main',
  });

  if (result.success) {
    return {
      success: true,
      message: 'תודה! נרשמת בהצלחה לניוזלטר.',
    };
  }

  return {
    success: false,
    message: 'אירעה שגיאה בהרשמה. נא לנסות שוב.',
  };
}

// =============================================================================
// EVENT REGISTRATION ACTION
// =============================================================================

/**
 * Handle event registration
 */
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
  const sourceUrl = formData.get('sourceUrl') as string | null;
  const site = formData.get('site') as string | null;

  // Validate
  const validationResult = ContactFormSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return {
      success: false,
      message: 'נא לתקן את השגיאות בטופס',
      errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const validData = validationResult.data;

  // Create lead with event context
  const leadData: LeadData = {
    name: validData.name,
    email: validData.email,
    phone: validData.phone,
    company: validData.company,
    message: eventName ? `הרשמה לאירוע: ${eventName}` : 'הרשמה לאירוע',
    sourceUrl: sourceUrl || undefined,
    leadSource: LEAD_SOURCES.EVENT_REGISTRATION,
    formType: 'event',
    site: site || 'main',
  };

  const result = await createLead(leadData);

  // Update event registration count if we have the event ID
  if (result.success && eventId) {
    try {
      await prisma.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      });
    } catch (error) {
      console.error('[Events] Failed to update registration count:', error);
    }
  }

  // Log submission
  await logFormSubmission({
    formType: 'event',
    email: validData.email,
    success: result.success,
    pipedriveId: result.dealId,
    errorCode: result.errorCode,
    site: site || 'main',
    metadata: { eventId, eventName },
  });

  if (result.success) {
    return {
      success: true,
      message: 'נרשמת בהצלחה לאירוע! נשלח אליך אישור במייל.',
      leadId: result.dealId,
    };
  }

  return {
    success: false,
    message: 'אירעה שגיאה בהרשמה. נא לנסות שוב.',
  };
}

// =============================================================================
// QUICK LEAD ACTION (API-style for client components)
// =============================================================================

/**
 * Create a lead from client-side data
 * This is a more flexible action for programmatic lead creation.
 */
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
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}): Promise<FormState> {
  // Basic validation
  if (!data.name?.trim() || !data.email?.trim()) {
    return {
      success: false,
      message: 'שם ואימייל הם שדות חובה',
    };
  }

  const leadData: LeadData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    message: data.message,
    sourceUrl: data.sourceUrl,
    referrerUrl: data.referrerUrl,
    utmSource: data.utmParams?.source,
    utmMedium: data.utmParams?.medium,
    utmCampaign: data.utmParams?.campaign,
    leadSource: (data.leadSource as typeof LEAD_SOURCES[keyof typeof LEAD_SOURCES]) || LEAD_SOURCES.WEBSITE,
    formType: data.formType || 'api',
    site: data.site || 'main',
  };

  const result = await createLead(leadData);

  // Log submission
  await logFormSubmission({
    formType: data.formType || 'api',
    email: data.email,
    success: result.success,
    pipedriveId: result.dealId,
    errorCode: result.errorCode,
    site: data.site || 'main',
    sourceUrl: data.sourceUrl,
  });

  if (result.success) {
    return {
      success: true,
      message: 'הפנייה נשלחה בהצלחה',
      leadId: result.dealId,
    };
  }

  return {
    success: false,
    message: 'אירעה שגיאה. נא לנסות שוב.',
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Log form submission to database for analytics
 */
async function logFormSubmission(data: {
  formType: string;
  email: string;
  success: boolean;
  pipedriveId?: number;
  errorCode?: string;
  site: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action: `form.${data.formType}`,
        description: `Form submission: ${data.formType} (${data.success ? 'success' : 'failed'})`,
        metadata: {
          email: data.email,
          success: data.success,
          pipedriveId: data.pipedriveId,
          errorCode: data.errorCode,
          site: data.site,
          sourceUrl: data.sourceUrl,
          timestamp: new Date().toISOString(),
          ...data.metadata,
        },
      },
    });
  } catch (error) {
    console.error('[Forms] Failed to log submission:', error);
  }
}
