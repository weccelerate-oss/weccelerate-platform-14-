/**
 * Client-side analytics tracking utility.
 * Uses navigator.sendBeacon for fire-and-forget tracking
 * that works even when the user navigates away.
 */

import { attributionMetadata } from './attribution';

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
        ...attributionMetadata(),
        ...metadata,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      },
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', payload);
    }

    // Mirror into Clarity + GA4 so recordings/funnels can be filtered by the
    // same conversion moments the monthly report counts.
    if (typeof window !== 'undefined') {
      window.clarity?.('event', action);
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
        'event', action.replace('.', '_'),
      );
    }
  } catch {
    // Silently fail — tracking should never break user experience
  }
}
