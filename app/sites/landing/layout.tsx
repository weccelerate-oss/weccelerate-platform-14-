import { ReactNode } from 'react';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';

// Landing pages should be indexed with high priority
export const metadata: Metadata = constructMetadata({
  title: 'Special Offer',
  description: 'Exclusive business acceleration offers and campaigns from WeCcelerate. Transform your business with our expert guidance.',
  siteKey: 'landing',
  path: '/',
  keywords: ['business offer', 'startup program', 'acceleration program', 'הצעה עסקית'],
});

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header for landing pages */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4 h-16 flex items-center">
          <div className="font-bold text-xl text-white drop-shadow-sm">
            WeCcelerate
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Minimal footer for landing pages */}
      <footer className="bg-slate-900 text-slate-400 py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          © {new Date().getFullYear()} WeCcelerate | 
          <a href="#" className="hover:text-white ml-2">Privacy</a> | 
          <a href="#" className="hover:text-white ml-2">Terms</a>
        </div>
      </footer>
    </div>
  );
}
