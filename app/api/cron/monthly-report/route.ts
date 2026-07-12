import { NextRequest, NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/require-cron';

const ACTION_LABELS: Record<string, string> = {
  'click.phone': 'שיחות טלפון',
  'click.whatsapp': 'הודעות WhatsApp',
  'click.email': 'אימיילים',
  'click.maps': 'ניווט Google Maps',
  'click.waze': 'ניווט Waze',
  'form.contact_submit': 'שליחת טופס',
  'lead.contact_fallback': 'טופס (גיבוי)',
};

const TRACKED_ACTIONS = Object.keys(ACTION_LABELS);

export async function GET(request: NextRequest) {
  const unauth = requireCron(request);
  if (unauth) return unauth;

  try {
    const { prisma } = await import('@/lib/db');

    // Calculate previous month range
    const now = new Date();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const monthName = prevMonthStart.toLocaleDateString('he-IL', {
      month: 'long',
      year: 'numeric',
    });

    // Get all logs from previous month
    const logs = await prisma.activityLog.findMany({
      where: {
        action: { in: TRACKED_ACTIONS },
        createdAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
      },
      select: { action: true, metadata: true },
    });

    // Aggregate by action
    const byAction: Record<string, number> = {};
    for (const a of TRACKED_ACTIONS) {
      byAction[a] = 0;
    }
    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    }

    const totalContacts = logs.length;

    // Aggregate by traffic channel (lib/analytics/attribution.ts adds a
    // 'channel' key to every tracked click). Older events have no channel —
    // they're grouped as 'לא ידוע' so the totals still add up.
    const CHANNEL_LABELS: Record<string, string> = {
      'llm-chatgpt': 'ChatGPT',
      'llm-claude': 'Claude',
      'llm-gemini': 'Gemini',
      'llm-perplexity': 'Perplexity',
      'llm-copilot': 'Copilot',
      'google-organic': 'גוגל — אורגני',
      'google-ads': 'גוגל — ממומן',
      'bing-organic': 'Bing',
      facebook: 'פייסבוק',
      'facebook-ads': 'פייסבוק — ממומן',
      instagram: 'אינסטגרם',
      tiktok: 'טיקטוק',
      linkedin: 'לינקדאין',
      youtube: 'יוטיוב',
      'twitter-x': 'טוויטר/X',
      whatsapp: 'וואטסאפ (שיתוף)',
      campaign: 'קמפיין אחר',
      referral: 'אתר מפנה',
      direct: 'ישיר',
    };
    const byChannel: Record<string, number> = {};
    for (const log of logs) {
      const channel =
        (log.metadata as { channel?: string } | null)?.channel ?? 'לא ידוע';
      const label = CHANNEL_LABELS[channel] ?? channel;
      byChannel[label] = (byChannel[label] || 0) + 1;
    }
    const channelRows = Object.entries(byChannel)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([label, count]) => `<tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; text-align: right;">${label}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${count}</td>
        </tr>`,
      )
      .join('');

    // Build HTML email
    const rows = TRACKED_ACTIONS
      .map((action) => {
        const count = byAction[action] || 0;
        return `<tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; text-align: right;">${ACTION_LABELS[action]}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${count}</td>
        </tr>`;
      })
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #0a0e27, #1e293b); padding: 30px; text-align: center;">
            <h1 style="color: #c8a951; margin: 0; font-size: 24px;">WeCcelerate</h1>
            <p style="color: #94a3b8; margin: 8px 0 0;">סיכום חודשי — פניות מהאתר</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px;">סיכום ${monthName}</h2>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #166534; font-size: 36px; font-weight: bold; margin: 0;">${totalContacts}</p>
              <p style="color: #15803d; margin: 4px 0 0;">סה״כ פניות</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 10px 16px; text-align: right; font-size: 14px; color: #64748b;">ערוץ</th>
                  <th style="padding: 10px 16px; text-align: center; font-size: 14px; color: #64748b;">כמות</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            ${channelRows ? `
            <h3 style="color: #1e293b; margin: 28px 0 12px;">מאיפה הגיעו הפונים</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 10px 16px; text-align: right; font-size: 14px; color: #64748b;">מקור הגעה</th>
                  <th style="padding: 10px 16px; text-align: center; font-size: 14px; color: #64748b;">פניות</th>
                </tr>
              </thead>
              <tbody>
                ${channelRows}
              </tbody>
            </table>` : ''}
            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
              דוח זה נוצר אוטומטית ממערכת WeCcelerate
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: 'weccelerate@gmail.com',
        subject: `סיכום חודשי — פניות מהאתר — ${monthName}`,
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: `Monthly report sent for ${monthName}`,
        totalContacts,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'RESEND_API_KEY not configured',
    });
  } catch (error) {
    console.error('[Monthly Report]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
