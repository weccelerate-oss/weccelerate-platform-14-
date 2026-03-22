import { NextRequest, NextResponse } from 'next/server';

const VALID_ACTIONS = [
  'click.phone',
  'click.whatsapp',
  'click.email',
  'click.maps',
  'click.waze',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    const { action, metadata } = data;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new NextResponse(null, { status: 400 });
    }

    // Extract tracking info from headers
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    // Write to ActivityLog via Prisma
    const { prisma } = await import('@/lib/db');

    await prisma.activityLog.create({
      data: {
        action,
        description: `${action} from ${metadata?.page || '/'}`,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        ipAddress: ip,
        userAgent,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Analytics Track]', error);
    // Still return 204 — tracking errors should be silent
    return new NextResponse(null, { status: 204 });
  }
}
