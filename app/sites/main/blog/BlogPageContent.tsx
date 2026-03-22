'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { ArticleGrid } from './ArticleGrid';

interface ArticleItem {
  id: string;
  title: string;
  excerpt: string | null;
  link: string | null;
  urgencyLevel: string;
  isPinned: boolean;
  publishAt: Date;
  imageUrl?: string | null;
  source?: string | null;
  category?: string | null;
}

export function BlogPageContent({ articles }: { articles: ArticleItem[] }) {
  const { t } = useLanguage();

  return (
    <div className="bg-[#070b1e] min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] to-[#070b1e]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" />

        <div className="container-corporate relative z-10">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-white/40">
              <li>
                <Link href="/" className="hover:text-white/60 transition-colors">
                  {t('blog.breadcrumb.home')}
                </Link>
              </li>
              <li><span className="mx-1">/</span></li>
              <li className="text-gold-400">{t('blog.breadcrumb.current')}</li>
            </ol>
          </nav>

          <p className="text-[#c8a951] text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            {t('blog.tag')}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {t('blog.title')}
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Articles Grid with Filters */}
      <section className="pb-24 sm:pb-32">
        <div className="container-corporate">
          <ArticleGrid articles={articles} />
        </div>
      </section>
    </div>
  );
}
