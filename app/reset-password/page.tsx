import { Suspense } from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { ResetPasswordContent } from './ResetPasswordContent';

export const metadata: Metadata = constructMetadata({
  title: 'איפוס סיסמה | WeCcelerate',
  description: 'בחירת סיסמה חדשה לפורטל היזמים של WeCcelerate.',
  path: '/reset-password',
  locale: 'he',
});

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
