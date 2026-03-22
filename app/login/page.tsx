import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginContent } from './LoginContent';

export const metadata: Metadata = {
  title: 'התחברות | WeCcelerate',
  description: 'התחברו לפורטל היזמים של WeCcelerate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
