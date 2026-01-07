'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Quote,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
} from 'lucide-react';
import { SuccessStory, SuccessStoriesProps } from '@/types/content';
import { cn } from '@/lib/utils';

// =============================================================================
// STORY CARD COMPONENT
// =============================================================================

interface StoryCardProps {
  story: SuccessStory;
  variant?: 'default' | 'featured' | 'compact';
}

function StoryCard({ story, variant = 'default' }: StoryCardProps) {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <article
      className={cn(
        'relative bg-white rounded-2xl overflow-hidden transition-all duration-300',
        isFeatured
          ? 'border-2 border-gold-200 shadow-xl'
          : 'border border-slate-200 hover:shadow-lg hover:border-royal-200',
        isCompact ? 'p-4' : 'p-6 md:p-8'
      )}
    >
      {/* Featured badge */}
      {story.isFeatured && !isCompact && (
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-gold-100 text-gold-700 text-xs font-semibold px-2 py-1 rounded-full">
          <Star className="w-3 h-3" fill="currentColor" />
          מומלץ
        </div>
      )}

      {/* Quote icon */}
      <Quote
        className={cn(
          'text-royal-100 mb-4',
          isCompact ? 'w-6 h-6' : 'w-10 h-10'
        )}
        fill="currentColor"
      />

      {/* Quote text */}
      <blockquote
        className={cn(
          'text-slate-700 leading-relaxed mb-6',
          isFeatured ? 'text-lg md:text-xl' : 'text-base',
          isCompact && 'text-sm line-clamp-3'
        )}
      >
        "{story.quote}"
      </blockquote>

      {/* Metrics */}
      {story.metrics && story.metrics.length > 0 && !isCompact && (
        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-slate-100">
          {story.metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-royal-600">
                {metric.value}
              </div>
              <div className="text-xs text-slate-500">{metric.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Author info */}
      <div className="flex items-center gap-4">
        {/* Logo or person image */}
        <div className="flex-shrink-0">
          {story.personImage ? (
            <img
              src={story.personImage}
              alt={story.personName || story.companyName}
              className={cn(
                'rounded-full object-cover bg-slate-100',
                isCompact ? 'w-10 h-10' : 'w-14 h-14'
              )}
            />
          ) : (
            <div
              className={cn(
                'bg-slate-100 rounded-full flex items-center justify-center',
                isCompact ? 'w-10 h-10' : 'w-14 h-14'
              )}
            >
              <img
                src={story.logoUrl || '/images/logo-placeholder.svg'}
                alt={story.companyName}
                className="w-3/4 h-3/4 object-contain"
              />
            </div>
          )}
        </div>

        {/* Name and role */}
        <div className="flex-1 min-w-0">
          {story.personName && (
            <div className={cn(
              'font-semibold text-slate-900',
              isCompact ? 'text-sm' : 'text-base'
            )}>
              {story.personName}
            </div>
          )}
          <div className={cn(
            'text-slate-500',
            isCompact ? 'text-xs' : 'text-sm'
          )}>
            {story.personRole && `${story.personRole}, `}
            <span className="text-royal-600 font-medium">{story.companyName}</span>
          </div>
          {story.industry && !isCompact && (
            <div className="text-xs text-slate-400 mt-0.5">{story.industry}</div>
          )}
        </div>

        {/* Link */}
        {story.projectLink && !isCompact && (
          <a
            href={story.projectLink}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-royal-600 transition-colors"
            aria-label="צפה בסיפור המלא"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>
    </article>
  );
}

// =============================================================================
// SUCCESS STORIES CAROUSEL
// =============================================================================

export function SuccessStories({
  stories,
  variant = 'carousel',
  autoPlay = true,
  interval = 5000,
}: SuccessStoriesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
  }, [stories.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
  }, [stories.length]);

  // Auto-advance carousel
  useEffect(() => {
    if (!autoPlay || isPaused || stories.length <= 1 || variant !== 'carousel') return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, stories.length, variant, goToNext]);

  if (!stories.length) {
    return null;
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-royal-600 font-semibold text-sm uppercase tracking-wide">
              סיפורי הצלחה
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              הלקוחות שלנו מספרים
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl mx-auto">
              גלו איך עזרנו לעסקים להתרחב, לגייס הון ולהצליח
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    const featuredStory = stories.find((s) => s.isFeatured) || stories[0];
    const otherStories = stories.filter((s) => s.id !== featuredStory.id).slice(0, 2);

    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-royal-600 font-semibold text-sm uppercase tracking-wide">
              סיפורי הצלחה
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
              הם כבר עשו את זה
            </h2>
          </div>

          {/* Featured + sidebar */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StoryCard story={featuredStory} variant="featured" />
            </div>
            <div className="space-y-6">
              {otherStories.map((story) => (
                <StoryCard key={story.id} story={story} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Carousel variant (default)
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-royal-600 font-semibold text-sm uppercase tracking-wide">
            סיפורי הצלחה
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            הלקוחות שלנו מספרים
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Story cards */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${currentIndex * 100}%)` }}
            >
              {stories.map((story) => (
                <div key={story.id} className="w-full flex-shrink-0 px-4">
                  <StoryCard story={story} variant="featured" />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {stories.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12',
                  'w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200',
                  'flex items-center justify-center text-slate-600 hover:text-royal-600',
                  'transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-royal-500'
                )}
                aria-label="הקודם"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12',
                  'w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200',
                  'flex items-center justify-center text-slate-600 hover:text-royal-600',
                  'transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-royal-500'
                )}
                aria-label="הבא"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {stories.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-royal-600 w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                  )}
                  aria-label={`עבור לסיפור ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <a
            href="/success-stories"
            className="inline-flex items-center gap-2 text-royal-600 font-semibold hover:text-royal-700 transition-colors"
          >
            לכל סיפורי ההצלחה
            <ChevronLeft className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default SuccessStories;
