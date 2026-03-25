import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const VALID_ACTIONS = [
  'click.phone',
  'click.whatsapp',
  'click.email',
  'click.maps',
  'click.waze',
];

const METADATA_MAX_KEYS = 10;
const METADATA_MAX_VALUE_LENGTH = 500;

function sanitizeMetadata(metadata: unknown): Record<string, string> | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined;
  const sanitized: Record<string, string> = {};
  let keyCount = 0;
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (keyCount >= METADATA_MAX_KEYS) break;
    if (typeof key !== 'string' || key.length > 100) continue;
    const strValue = typeof value === 'string' ? value : String(value ?? '');
    sanitized[key] = strValue.slice(0, METADATA_MAX_VALUE_LENGTH);
    keyCount++;
  }
  return sanitized;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 30 tracking events per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`analytics:${ip}`, { limit: 30, windowSeconds: 60 });
    if (!rl.allowed) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await request.text();
    if (body.length > 10000) {
      return new NextResponse(null, { status: 400 });
    }
    const data = JSON.parse(body);

    const { action, metadata } = data;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return new NextResponse(null, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || '';
    const safeMetadata = sanitizeMetadata(metadata);

    // Write to ActivityLog via Prisma
    const { prisma } = await import('@/lib/db');

    await prisma.activityLog.create({
      data: {
        action,
        description: `${action} from ${safeMetadata?.page || '/'}`,
        metadata: {
          ...safeMetadata,
          timestamp: new Date().toISOString(),
        },
        ipAddress: ip,
        userAgent: userAgent.slice(0, 500),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Analytics Track]', error);
    // Still return 204 — tracking errors should be silent
    return new NextResponse(null, { status: 204 });
  }
}
