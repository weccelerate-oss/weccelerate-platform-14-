/**
 * WeCcelerate - Privacy Policy (מדיניות פרטיות)
 *
 * Bilingual legal page (Hebrew + English) with tabbed language switching.
 * Dark luxury theme matching the homepage design system.
 */

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { PrivacyContent } from './PrivacyContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'מדיניות פרטיות | Privacy Policy',
    description:
      'מדיניות הפרטיות של WeCcelerate (וויסלרייט). מידע על איסוף נתונים, שימוש במידע, עוגיות ואבטחת מידע באתר.',
    path: '/privacy',
    keywords: [
      'מדיניות פרטיות',
      'Privacy Policy',
      'הגנת פרטיות',
      'WeCcelerate privacy',
      'וויסלרייט פרטיות',
      'GDPR Israel',
    ],
  }),
  robots: { index: false, follow: true },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function PrivacyPage() {
  return <PrivacyContent />;
}
