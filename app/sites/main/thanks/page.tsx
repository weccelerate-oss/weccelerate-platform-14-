import { Suspense } from 'react';
import type { Metadata } from 'next';
import ThanksContent from './ThanksContent';

/**
 * Conversion page. noindex so it never ranks, but it must stay a real URL:
 * GA4 / Google Ads / Meta count a page_view of /thanks as the lead goal.
 */
export const metadata: Metadata = {
  title: 'תודה, קיבלנו את הפרטים | WeCcelerate',
  description: 'יועץ מהצוות יחזור אליך תוך יום עסקים.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function ThanksPage() {
  return (
    <Suspense fallback={null}>
      <ThanksContent />
    </Suspense>
  );
}
