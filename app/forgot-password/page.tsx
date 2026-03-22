import { Suspense } from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ForgotPasswordContent } from './ForgotPasswordContent';

export const metadata: Metadata = constructMetadata({
  title: 'שכחת סיסמה | WeCcelerate',
  description: 'איפוס סיסמה לפורטל היזמים של WeCcelerate.',
  path: '/forgot-password',
  locale: 'he',
});

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordContent />
    </Suspense>
  );
}
