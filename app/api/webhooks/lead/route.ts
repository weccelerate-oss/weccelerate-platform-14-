/**
 * Inbound lead webhook for lp.weccelerate.co.il (Base44 landing page run by
 * the group's campaign company). Each lead goes through the same pipeline as
 * site forms: phone required, spam filter, ActivityLog (admin), Pipedrive,
 * sales email. Tagged site=lp, formType=lp_webhook.
 *
 * Auth: LEAD_WEBHOOK_SECRET as `Authorization: Bearer <secret>`, or
 * `?token=<secret>` for builders that cannot set headers.
 * Body: JSON or form-encoded. Common field names (English and Hebrew) are
 * mapped, so the sender does not have to rename its form fields.
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitWebhookLead, type WebhookLeadInput } from '@/app/actions/leads';

const FIELD_ALIASES: Record<keyof WebhookLeadInput, string[]> = {
  name: ['name', 'full_name', 'fullName', 'fullname', 'שם', 'שם מלא'],
  phone: ['phone', 'mobile', 'phone_number', 'phoneNumber', 'tel', 'טלפון', 'נייד', 'מספר נייד'],
  email: ['email', 'mail', 'אימייל', 'מייל'],
  company: ['company', 'חברה'],
  message: ['message', 'notes', 'idea', 'הודעה', 'מה תחום הרעיון?'],
  sourceUrl: ['sourceUrl', 'source_url', 'page_url', 'url'],
  utmSource: ['utm_source', 'utmSource'],
  utmMedium: ['utm_medium', 'utmMedium'],
  utmCampaign: ['utm_campaign', 'utmCampaign'],
  utmContent: ['utm_content', 'utmContent'],
  utmTerm: ['utm_term', 'utmTerm'],
  gclid: ['gclid'],
};

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    const json = await request.json();
    // Some builders wrap the submission: { data: {...} } or { fields: {...} }.
    return (json?.data ?? json?.fields ?? json ?? {}) as Record<string, unknown>;
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

function pick(body: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = body[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number') return String(v);
  }
  return undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.LEAD_WEBHOOK_SECRET) {
    console.warn('[Lead Webhook] LEAD_WEBHOOK_SECRET not configured');
    return NextResponse.json({ success: false, error: 'Webhook not configured' }, { status: 503 });
  }

  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.nextUrl.searchParams.get('token');

  let body: Record<string, unknown>;
  try {
    body = await readBody(request);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 });
  }

  const input = Object.fromEntries(
    Object.entries(FIELD_ALIASES).map(([field, keys]) => [field, pick(body, keys)]),
  ) as WebhookLeadInput;

  const result = await submitWebhookLead(token, input);

  if (result.message === 'Unauthorized') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.message, errors: result.errors }, { status: 422 });
  }
  return NextResponse.json({ success: true, leadId: result.leadId ?? null });
}
