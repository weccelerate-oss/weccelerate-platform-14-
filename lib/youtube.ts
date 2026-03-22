/**
 * YouTube Data API v3 Client
 *
 * Quota-efficient approach:
 * - channels.list       → 1 unit  (resolve channel → uploads playlist)
 * - playlistItems.list  → 1 unit  (fetch video IDs, max 50 per page)
 * - videos.list         → 1 unit  (fetch details for up to 50 IDs)
 *
 * Typical sync cycle: 2-3 units total.
 */

const YT_API = 'https://www.googleapis.com/youtube/v3';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string; // ISO date
  duration: number; // seconds
  viewCount: number;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Resolve channel → uploads playlist ID (1 quota unit)
// ---------------------------------------------------------------------------

export async function getUploadsPlaylistId(
  apiKey: string,
  channelHandle: string,
): Promise<string> {
  const url = `${YT_API}/channels?part=contentDetails&forHandle=${encodeURIComponent(channelHandle)}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube channels.list failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const playlistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    throw new Error(`No uploads playlist found for ${channelHandle}`);
  }
  return playlistId;
}

// ---------------------------------------------------------------------------
// Fetch all video IDs from an uploads playlist (1 unit per 50 videos)
// ---------------------------------------------------------------------------

interface PlaylistItem {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
}

export async function getPlaylistVideos(
  apiKey: string,
  playlistId: string,
): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: '50',
      key: apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(`${YT_API}/playlistItems?${params}`);
    if (!res.ok) {
      throw new Error(`YouTube playlistItems.list failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = item.contentDetails?.videoId ?? snippet?.resourceId?.videoId;
      if (!videoId) continue;

      const thumbs = snippet?.thumbnails ?? {};
      const thumbnail =
        thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? '';

      items.push({
        videoId,
        title: snippet?.title ?? '',
        publishedAt: snippet?.publishedAt ?? '',
        thumbnail,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

// ---------------------------------------------------------------------------
// Fetch video details: duration, views, tags (1 unit per 50 IDs)
// ---------------------------------------------------------------------------

export async function getVideoDetails(
  apiKey: string,
  videoIds: string[],
): Promise<YouTubeVideoData[]> {
  const results: YouTubeVideoData[] = [];

  // Process in chunks of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: chunk.join(','),
      key: apiKey,
    });

    const res = await fetch(`${YT_API}/videos?${params}`);
    if (!res.ok) {
      throw new Error(`YouTube videos.list failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();

    for (const item of data.items ?? []) {
      const thumbs = item.snippet?.thumbnails ?? {};
      const thumbnail =
        thumbs.maxres?.url ?? thumbs.high?.url ?? thumbs.medium?.url ?? thumbs.default?.url ?? '';

      results.push({
        videoId: item.id,
        title: item.snippet?.title ?? '',
        description: item.snippet?.description ?? '',
        thumbnail,
        publishedAt: item.snippet?.publishedAt ?? '',
        duration: parseISO8601Duration(item.contentDetails?.duration ?? ''),
        viewCount: parseInt(item.statistics?.viewCount ?? '0', 10),
        tags: item.snippet?.tags ?? [],
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse ISO 8601 duration (PT1H2M3S) → seconds */
export function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/** Generate a URL-safe slug from title + videoId for uniqueness */
export function generateVideoSlug(title: string, videoId: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF-]/g, '') // keep letters, digits, hebrew, hyphens
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base}-${videoId}`;
}
