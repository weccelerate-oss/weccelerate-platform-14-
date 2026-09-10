/**
 * CSV export of the leads table with the current dashboard filters.
 * Admin-only. UTF-8 with BOM so Excel opens Hebrew correctly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { loadLeadsForExport, parseFilters, STATUS_LABELS } from '@/lib/leads/admin-queries';

export const dynamic = 'force-dynamic';

function cell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const sp: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => { sp[k] = v; });
  const filters = parseFilters(sp);
  const rows = await loadLeadsForExport(filters);

  const header = [
    'תאריך', 'שם', 'טלפון', 'אימייל', 'חברה', 'סטטוס', 'טופס', 'אתר', 'שלב המיזם', 'שירות מבוקש',
    'ערוץ', 'פירוט ערוץ', 'ערוץ ראשון', 'קמפיין', 'עמוד השליחה', 'עמוד נחיתה', 'מפנה',
    'UTM מקור', 'UTM מדיום', 'UTM קמפיין', 'gclid', 'fbclid',
    'ציון ספאם', 'מסירה לזאפ', 'שגיאת מסירה', 'הודעה', 'מזהה',
  ];
  const lines = rows.map((l) => [
    new Date(l.createdAt).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
    l.name, l.phone, l.email, l.company, STATUS_LABELS[l.status], l.formLabel, l.siteLabel, l.stageLabel, l.serviceLabel,
    l.channelLabel, l.channelDetail, l.firstChannel, l.campaign, l.sourceUrl, l.landingPage, l.referrerUrl,
    l.utm.source, l.utm.medium, l.utm.campaign, l.gclid, l.fbclid,
    l.spamScore, l.delivery.status, l.delivery.error, l.message, l.id,
  ].map(cell).join(','));

  const csv = '﻿' + [header.map(cell).join(','), ...lines].join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="weccelerate-leads-${filters.period}-${filters.status}-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
