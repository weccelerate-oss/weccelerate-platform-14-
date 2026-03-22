/**
 * WeCcelerate - Terms of Use (תנאי שימוש)
 *
 * Bilingual legal page (Hebrew + English) with tabbed language switching.
 * Dark luxury theme matching the homepage design system.
 */

import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { TermsContent } from './TermsContent';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'תנאי שימוש | Terms of Use',
    description: 'תנאי השימוש באתר WeCcelerate (וויסלרייט). מידע משפטי על שימוש באתר, קניין רוחני, הגבלת אחריות וסמכות שיפוט.',
    path: '/terms',
    keywords: [
      'תנאי שימוש',
      'Terms of Use',
      'מדיניות אתר',
      'WeCcelerate legal',
      'וויסלרייט תנאים',
    ],
  }),
  robots: { index: false, follow: true },
};

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default function TermsPage() {
  return <TermsContent />;
}
