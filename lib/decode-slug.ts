/**
 * Dynamic route params for Hebrew slugs can arrive still percent-encoded
 * (Next 16 on Vercel), which matches no DB row and 404s the page. Every
 * /videos/* and Hebrew /events/* page was a 404 until 2026-10-11.
 */
export function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
