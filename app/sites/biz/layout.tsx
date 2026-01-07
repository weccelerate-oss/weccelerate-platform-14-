import { ReactNode } from 'react';
import { Metadata } from 'next';
import { constructPrivateMetadata } from '@/lib/seo/metadata';

// Dashboard pages should not be indexed
export const metadata: Metadata = constructPrivateMetadata({
  title: 'Business Dashboard',
  description: 'WeCcelerate Business Dashboard - Operations and management portal.',
  siteKey: 'biz',
});

interface BizLayoutProps {
  children: ReactNode;
}

export default function BizLayout({ children }: BizLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Biz-specific header (dashboard style) */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white">
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-semibold text-lg">
              WeCcelerate <span className="text-emerald-400">Business</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">Operations Portal</span>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center text-xs">
          WeCcelerate Business Portal v1.0
        </div>
      </footer>
    </div>
  );
}
