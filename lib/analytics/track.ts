/**
 * Client-side analytics tracking utility.
 * Uses navigator.sendBeacon for fire-and-forget tracking
 * that works even when the user navigates away.
 */

export type TrackAction =
  | 'click.phone'
  | 'click.whatsapp'
  | 'click.email'
  | 'click.maps'
  | 'click.waze';

export function trackClick(
  action: TrackAction,
  metadata?: Record<string, string>
) {
  try {
    const payload = JSON.stringify({
      action,
      metadata: {
        ...metadata,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      },
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', payload);
    }
  } catch {
    // Silently fail — tracking should never break user experience
  }
}
