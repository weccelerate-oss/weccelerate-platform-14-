/**
 * Skip to Content — WCAG 2.1 AA Compliance
 *
 * Visually hidden link that becomes visible on focus (keyboard Tab).
 * Allows keyboard/screen-reader users to skip directly to main content.
 * Styled with gold accent to match the dark luxury design system.
 */

'use client';

import { useLanguage } from '@/lib/i18n';

export function SkipToContent() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="skip-to-content"
    >
      {t('chrome.skipToContent')}
    </a>
  );
}
