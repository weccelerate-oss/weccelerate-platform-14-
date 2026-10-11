/**
 * Short link used in YouTube descriptions: /v/{youtubeVideoId} → /videos/{slug}.
 * Video slugs are long Hebrew strings that YouTube shows percent-encoded;
 * this keeps the description readable and the attribution intact (query
 * string is carried over). Unknown ids fall back to the videos hub.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  let target = '/videos';
  if (/^[\w-]{11}$/.test(id)) {
    const video = await prisma.video
      .findFirst({ where: { youtubeVideoId: id, isActive: true }, select: { slug: true } })
      .catch(() => null);
    if (video?.slug) target = `/videos/${encodeURIComponent(video.slug)}`;
  }
  const dest = new URL(target + url.search, req.nextUrl.origin);
  return NextResponse.redirect(dest, 301);
}
