/**
 * Skip to Content — WCAG 2.1 AA Compliance
 *
 * Visually hidden link that becomes visible on focus (keyboard Tab).
 * Allows keyboard/screen-reader users to skip directly to main content.
 * Styled with gold accent to match the dark luxury design system.
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
    >
      דלג לתוכן הראשי
    </a>
  );
}
