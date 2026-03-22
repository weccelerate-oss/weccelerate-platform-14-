/**
 * YouTube → DB Sync Orchestration
 *
 * Fetches videos from the WeCcelerate YouTube channel and upserts them
 * into the videos table.  Designed to be called by:
 *   - Vercel Cron  (every 4 h)
 *   - Admin "Sync" button
 */

import { prisma } from './db';
import {
  getUploadsPlaylistId,
  getPlaylistVideos,
  getVideoDetails,
  generateVideoSlug,
} from './youtube';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncResult {
  success: boolean;
  newVideos: number;
  updatedVideos: number;
  totalChannelVideos: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract a YouTube video ID from any common URL format */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /\/embed\/([^?/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Auto-categorize a video based on title and description keywords */
function guessVideoCategory(title: string, description: string, durationSeconds?: number): string {
  const text = `${title} ${description}`.toLowerCase();

  // Podcast detection
  if (/פודקאסט|podcast|#\d{1,3}:|הפודקאסט של|סלון של|פרק\s+\d/.test(text)) {
    return 'PODCAST';
  }

  // Testimonial detection
  if (/עדות|testimonial|סיפור הצלחה|ממליץ|ממליצה|הליווי של|על הליווי|מרעיון ל|חלק \d/.test(text)) {
    return 'TESTIMONIAL';
  }

  // TV interview detection
  if (/ערוץ הכלכלה|ערוץ 12|ערוץ 13|ערוץ 14|חדשות|news|כאן 11|i24|ynet|חדשות הבוקר|tv|טלוויזיה/.test(text)) {
    return 'TV_INTERVIEW';
  }

  // Reels / short clips detection (under 3 minutes or keyword match)
  if (
    /reel|reels|#shorts|short|קליפ|טיפ|טיפים|היילייט|highlight/.test(text) ||
    (durationSeconds && durationSeconds < 180)
  ) {
    return 'REELS';
  }

  // Default
  return 'INTERVIEW';
}

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------

export async function syncYouTubeVideos(options?: {
  updateViewCounts?: boolean;
}): Promise<SyncResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      newVideos: 0,
      updatedVideos: 0,
      totalChannelVideos: 0,
      errors: ['YOUTUBE_API_KEY environment variable is not set'],
    };
  }

  const channelHandle = process.env.YOUTUBE_CHANNEL_HANDLE || '@WeCcelerate.Ltd1';
  const errors: string[] = [];
  let newCount = 0;
  let updatedCount = 0;

  try {
    // 1. Resolve uploads playlist ID
    const playlistId = await getUploadsPlaylistId(apiKey, channelHandle);

    // 2. Fetch all video IDs from the channel
    const playlistItems = await getPlaylistVideos(apiKey, playlistId);
    const totalChannelVideos = playlistItems.length;

    if (totalChannelVideos === 0) {
      return { success: true, newVideos: 0, updatedVideos: 0, totalChannelVideos: 0, errors: [] };
    }

    const allVideoIds = playlistItems.map((v) => v.videoId);

    // 3. Find which videos already exist in DB (by youtubeVideoId)
    const existing = await prisma.video.findMany({
      where: { youtubeVideoId: { in: allVideoIds } },
      select: { youtubeVideoId: true, id: true },
    });
    const existingIdSet = new Set(existing.map((v: { youtubeVideoId: string | null }) => v.youtubeVideoId));

    // 4. Also check youtubeUrl for backfill dedup (existing manual entries)
    const existingByUrl = await prisma.video.findMany({
      where: {
        youtubeUrl: { not: null },
        youtubeVideoId: null,
      },
      select: { id: true, youtubeUrl: true },
    });

    // Backfill youtubeVideoId for existing entries that have youtubeUrl
    for (const row of existingByUrl) {
      const ytId = extractYouTubeId(row.youtubeUrl ?? '');
      if (ytId && allVideoIds.includes(ytId)) {
        try {
          await prisma.video.update({
            where: { id: row.id },
            data: { youtubeVideoId: ytId },
          });
          existingIdSet.add(ytId);
        } catch (e) {
          errors.push(`Backfill failed for ${row.id}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    // 5. Determine new videos
    const newVideoIds = allVideoIds.filter((id) => !existingIdSet.has(id));

    // 6. Fetch full details for new videos
    if (newVideoIds.length > 0) {
      const details = await getVideoDetails(apiKey, newVideoIds);

      for (const video of details) {
        try {
          const autoCategory = guessVideoCategory(video.title, video.description, video.duration);
          await prisma.video.create({
            data: {
              title: video.title,
              slug: generateVideoSlug(video.title, video.videoId),
              description: video.description.slice(0, 5000),
              youtubeUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
              youtubeVideoId: video.videoId,
              embedUrl: `https://www.youtube.com/embed/${video.videoId}`,
              thumbnail: video.thumbnail,
              duration: video.duration,
              category: autoCategory,
              tags: video.tags.slice(0, 20),
              views: video.viewCount,
              isActive: true,
              isFeatured: autoCategory === 'PODCAST',
              publishAt: new Date(video.publishedAt),
            },
          });
          newCount++;
        } catch (e) {
          errors.push(`Failed to insert ${video.videoId}: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    // 7. Optionally update view counts for existing videos
    if (options?.updateViewCounts && existing.length > 0) {
      const existingIds = existing.map((v: { youtubeVideoId: string | null }) => v.youtubeVideoId).filter(Boolean) as string[];
      try {
        const details = await getVideoDetails(apiKey, existingIds);
        for (const video of details) {
          const dbRecord = existing.find((e: { youtubeVideoId: string | null }) => e.youtubeVideoId === video.videoId);
          if (dbRecord) {
            await prisma.video.update({
              where: { id: dbRecord.id },
              data: { views: video.viewCount },
            });
            updatedCount++;
          }
        }
      } catch (e) {
        errors.push(`View count update failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return {
      success: true,
      newVideos: newCount,
      updatedVideos: updatedCount,
      totalChannelVideos,
      errors,
    };
  } catch (e) {
    return {
      success: false,
      newVideos: newCount,
      updatedVideos: updatedCount,
      totalChannelVideos: 0,
      errors: [...errors, e instanceof Error ? e.message : String(e)],
    };
  }
}
