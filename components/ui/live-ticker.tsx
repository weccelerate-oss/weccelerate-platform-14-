'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsUpdate, UrgencyLevel, LiveTickerProps } from '@/types/content';
import { cn } from '@/lib/utils';

// =============================================================================
// URGENCY STYLING
// =============================================================================

const urgencyConfig: Record<UrgencyLevel, {
  icon: typeof Bell;
  bgClass: string;
  textClass: string;
  badgeClass: string;
  label: string;
}> = {
  breaking: {
    icon: Flame,
    bgClass: 'bg-gradient-to-r from-red-600 to-red-500',
    textClass: 'text-white',
    badgeClass: 'bg-white/20 text-white animate-pulse',
    label: 'חדשות בזק',
  },
  urgent: {
    icon: AlertTriangle,
    bgClass: 'bg-gradient-to-r from-orange-500 to-amber-500',
    textClass: 'text-white',
    badgeClass: 'bg-white/20 text-white',
    label: 'דחוף',
  },
  important: {
    icon: Bell,
    bgClass: 'bg-gradient-to-r from-royal-600 to-royal-500',
    textClass: 'text-white',
    badgeClass: 'bg-white/20 text-white',
    label: 'חשוב',
  },
  normal: {
    icon: Bell,
    bgClass: 'bg-slate-800',
    textClass: 'text-slate-100',
    badgeClass: 'bg-slate-700 text-slate-300',
    label: 'עדכון',
  },
};

// =============================================================================
// LIVE TICKER COMPONENT
// =============================================================================

export function LiveTicker({
  updates,
  speed = 5,
  pauseOnHover = true,
  mode = 'fade',
}: LiveTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const currentUpdate = updates[currentIndex];
  const config = urgencyConfig[currentUpdate?.urgencyLevel || 'normal'];
  const Icon = config.icon;

  // Auto-advance updates
  useEffect(() => {
    if (isPaused || updates.length <= 1) return;

    const interval = setInterval(() => {
      if (mode === 'fade') {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % updates.length);
          setIsVisible(true);
        }, 300);
      } else {
        setCurrentIndex((prev) => (prev + 1) % updates.length);
      }
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [isPaused, updates.length, speed, mode]);

  const goToNext = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % updates.length);
      setIsVisible(true);
    }, 150);
  }, [updates.length]);

  const goToPrev = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length);
      setIsVisible(true);
    }, 150);
  }, [updates.length]);

  if (!updates.length || !currentUpdate) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        config.bgClass
      )}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      role="region"
      aria-label="עדכונים חמים"
      aria-live="polite"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 md:h-10">
          {/* Navigation - Left */}
          <button
            onClick={goToPrev}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="עדכון קודם"
          >
            <ChevronRight className="w-4 h-4 text-white/70" />
          </button>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center gap-3 overflow-hidden">
            {/* Badge */}
            <span
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
                config.badgeClass
              )}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>

            {/* Mobile icon */}
            <Icon className={cn('sm:hidden w-4 h-4 flex-shrink-0', config.textClass)} />

            {/* Headline */}
            <div
              className={cn(
                'flex-1 min-w-0 transition-all duration-300',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
            >
              {currentUpdate.link ? (
                <a
                  href={currentUpdate.link}
                  className={cn(
                    'block truncate text-sm font-medium hover:underline underline-offset-2',
                    config.textClass
                  )}
                >
                  {currentUpdate.title}
                </a>
              ) : (
                <span className={cn('block truncate text-sm font-medium', config.textClass)}>
                  {currentUpdate.title}
                </span>
              )}
            </div>

            {/* Counter */}
            {updates.length > 1 && (
              <span className="hidden md:inline-flex text-xs text-white/60 whitespace-nowrap">
                {currentIndex + 1} / {updates.length}
              </span>
            )}
          </div>

          {/* Navigation - Right */}
          <button
            onClick={goToNext}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="עדכון הבא"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!isPaused && updates.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className="h-full bg-white/40 animate-progress-bar"
            style={{
              animationDuration: `${speed}s`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SCROLLING TICKER VARIANT
// =============================================================================

export function ScrollingTicker({ updates }: { updates: NewsUpdate[] }) {
  if (!updates.length) return null;

  // Duplicate for seamless loop
  const duplicatedUpdates = [...updates, ...updates];

  return (
    <div className="bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="flex-shrink-0 bg-gold-500 text-slate-900 text-xs font-bold px-2 py-1 rounded">
            LIVE
          </span>
          <div className="overflow-hidden flex-1">
            <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
              {duplicatedUpdates.map((update, index) => {
                const cfg = urgencyConfig[update.urgencyLevel];
                return (
                  <span
                    key={`${update.id}-${index}`}
                    className="inline-flex items-center gap-2 mx-8"
                  >
                    <span
                      className={cn(
                        'inline-block w-2 h-2 rounded-full',
                        update.urgencyLevel === 'breaking'
                          ? 'bg-red-500 animate-pulse'
                          : update.urgencyLevel === 'urgent'
                          ? 'bg-orange-500'
                          : 'bg-teal-500'
                      )}
                    />
                    {update.link ? (
                      <a
                        href={update.link}
                        className="text-slate-200 text-sm hover:text-white hover:underline"
                      >
                        {update.title}
                      </a>
                    ) : (
                      <span className="text-slate-200 text-sm">{update.title}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTicker;