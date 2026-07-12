/**
 * Conversion-event helpers for paid-campaign tracking.
 *
 * Safe to call anywhere on the client: every helper no-ops when the
 * underlying tag (Meta Pixel / GA4) is not installed, so forms keep working
 * with or without NEXT_PUBLIC_META_PIXEL_ID configured.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a Lead conversion — call once per successful contact-form submission.
 * Reported to Meta (standard `Lead` event, used by Meta lead-campaign
 * optimization) and to GA4 (`generate_lead`).
 */
export function trackLead(source?: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.fbq?.('track', 'Lead', source ? { content_name: source } : undefined);
    window.gtag?.('event', 'generate_lead', source ? { lead_source: source } : undefined);
  } catch {
    /* analytics must never break the form */
  }
}
