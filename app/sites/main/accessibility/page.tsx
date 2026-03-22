/**
 * WeCcelerate - Accessibility Statement (הצהרת נגישות)
 *
 * Legally required page under Israeli accessibility law
 * (חוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח-1998).
 */

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { AccessibilityContent } from './AccessibilityContent';

export const metadata: Metadata = constructMetadata({
  title: 'הצהרת נגישות | Accessibility Statement',
  description:
    'הצהרת הנגישות של WeCcelerate (וויסלרייט). מידע על הנגשת האתר בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות ותקן WCAG 2.1 AA.',
  path: '/accessibility',
  keywords: [
    'הצהרת נגישות',
    'Accessibility Statement',
    'WCAG 2.1 AA',
    'נגישות אתר',
    'חוק נגישות',
    'WeCcelerate accessibility',
  ],
});

export default function AccessibilityPage() {
  return <AccessibilityContent />;
}
