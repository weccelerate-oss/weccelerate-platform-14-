/**
 * YouTube helpers for the Learning Center.
 *
 * One canonical place to parse/normalise YouTube URLs. Previously this logic
 * was duplicated (the static catalog's `ytId`, the admin video dialog's
 * `extractYouTubeId`), each handling a different subset of URL shapes.
 */

/**
 * Extract the 11-char video id from any common YouTube URL shape:
 *   - https://youtu.be/ID
 *   - https://www.youtube.com/watch?v=ID
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - a bare ID
 * Returns '' when nothing matches.
 */
export function extractYouTubeId(input: string): string {
  if (!input) return '';
  const url = input.trim();

  // Already a bare id (no slashes / dots).
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;

  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return '';
}

/** Canonical short URL for storage / display. Empty string when unparseable. */
export function normalizeYouTubeUrl(input: string): string {
  const id = extractYouTubeId(input);
  return id ? `https://youtu.be/${id}` : '';
}

/** Thumbnail URL for a given id. */
export function youtubeThumbnail(
  id: string,
  quality: 'default' | 'hqdefault' | 'mqdefault' | 'maxresdefault' = 'hqdefault',
): string {
  return id ? `https://i.ytimg.com/vi/${id}/${quality}.jpg` : '';
}
