/**
 * YouTube Sync Cron Endpoint
 *
 * Triggered by Vercel Cron every 4 hours (see vercel.json).
 * Fetches new videos from YouTube channel and inserts them into DB.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireCron } from '@/lib/auth/require-cron';

export async function GET(request: NextRequest) {
  const unauth = requireCron(request);
  if (unauth) return unauth;

  try {
    const { syncYouTubeVideos } = await import('@/lib/youtube-sync');
    const result = await syncYouTubeVideos();

    if (result.newVideos > 0) {
      revalidatePath('/videos');
      revalidatePath('/');
      revalidatePath('/admin/videos');
    }

    return NextResponse.json({
      ...result,
      message: `Synced ${result.newVideos} new videos, ${result.totalChannelVideos} total on channel`,
    });
  } catch (error) {
    console.error('[YouTube Sync Cron]', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 },
    );
  }
}
