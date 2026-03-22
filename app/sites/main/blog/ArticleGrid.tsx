'use client';

import { useState } from 'react';
import { ExternalLink, Pin, Newspaper, Handshake, Megaphone, MessageSquareQuote, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES & HELPERS
// =============================================================================

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

function useCategoryFilters() {
  const { t } = useLanguage();
  return {
    all: { label: t('blog.filter.all'), icon: Newspaper },
    press: { label: t('blog.filter.press'), icon: Newspaper },
    announcement: { label: t('blog.filter.announcement'), icon: Megaphone },
    partnership: { label: t('blog.filter.partnership'), icon: Handshake },
    opinion: { label: t('blog.filter.opinion'), icon: MessageSquareQuote },
    profile: { label: t('blog.filter.profile'), icon: Building2 },
  } as Record<string, { label: string; icon: typeof Newspaper }>;
}

const categoryAccent: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  press: { bg: 'bg-[#c8a951]/15', text: 'text-[#c8a951]', border: 'border-[#c8a951]/25', bar: 'bg-[#c8a951]' },
  announcement: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/25', bar: 'bg-blue-500' },
  partnership: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', bar: 'bg-emerald-500' },
  opinion: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/25', bar: 'bg-purple-500' },
  profile: { bg: 'bg-white/[0.05]', text: 'text-white/50', border: 'border-white/[0.08]', bar: 'bg-white/20' },
};

function useFormatDate() {
  const { lang } = useLanguage();
  return (date: Date): string => {
    return new Date(date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
}

// =============================================================================
// ARTICLE GRID
// =============================================================================

export function ArticleGrid({ articles }: { articles: ArticleItem[] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const { t } = useLanguage();
  const categoryFilters = useCategoryFilters();

  // Sort newest first, then filter by category
  const sorted = [...articles].sort((a, b) =>
    new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
  );

  const filtered =
    activeFilter === 'all'
      ? sorted
      : sorted.filter((a) => a.category === activeFilter);

  // Count articles per category for filter badges
  const counts: Record<string, number> = {};
  articles.forEach((a) => {
    const cat = a.category || 'press';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return (
    <>
      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-12">
        {Object.entries(categoryFilters).map(([key, { label, icon: Icon }]) => {
          const count = key === 'all' ? articles.length : (counts[key] || 0);
          if (key !== 'all' && count === 0) return null;

          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === key
                  ? 'bg-[#c8a951] text-[#070b1e]'
                  : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-xs ${activeFilter === key ? 'text-[#070b1e]/60' : 'text-white/30'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-white/40 py-20">{t('blog.empty')}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}

// =============================================================================
// ARTICLE CARD
// =============================================================================

function ArticleCard({ article }: { article: ArticleItem }) {
  const { t } = useLanguage();
  const categoryFilters = useCategoryFilters();
  const formatDate = useFormatDate();
  const cat = article.category || 'press';
  const accent = categoryAccent[cat] ?? categoryAccent.press;
  const catInfo = categoryFilters[cat] ?? categoryFilters.press;
  const CatIcon = catInfo.icon;

  const Wrapper = article.link ? 'a' : 'div';
  const wrapperProps = article.link
    ? { href: article.link, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group block bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 ${
        article.link ? 'cursor-pointer' : ''
      }`}
    >
      {/* Article Image */}
      {article.imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0f1e]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-50" />

          {/* Source badge on image */}
          {article.source && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full">
                {article.source}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Top Accent Bar (no image) */
        <div className={`h-1 ${accent.bar}`} />
      )}

      <div className="p-6">
        {/* Header: category badge + pinned */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 ${accent.bg} ${accent.text} ${accent.border} border text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
          >
            <CatIcon className="w-3 h-3" />
            {catInfo.label}
          </span>

          {/* Source badge (when no image) */}
          {!article.imageUrl && article.source && (
            <span className="inline-flex items-center gap-1 text-white/30 text-[10px] font-bold">
              {article.source}
            </span>
          )}

          {article.isPinned && (
            <span className="inline-flex items-center gap-1 text-[#c8a951] text-[10px] font-bold">
              <Pin className="w-3 h-3" />
              {t('blog.pinned')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-base mb-3 line-clamp-3 group-hover:text-[#c8a951] transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-white/40 text-sm line-clamp-3 mb-4 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
          <time className="text-white/25 text-xs" dateTime={new Date(article.publishAt).toISOString()}>
            {formatDate(article.publishAt)}
          </time>
          {article.link && (
            <span className="flex items-center gap-1.5 text-[#c8a951] text-xs font-medium group-hover:gap-2 transition-all">
              {t('blog.readMore')}
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
