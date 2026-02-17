'use client';

import { useRef, useEffect, useState } from 'react';
import { Flame, AlertTriangle, Bell } from 'lucide-react';
import { NewsUpdate, UrgencyLevel, LiveTickerProps } from '@/types/content';
import { cn } from '@/lib/utils';

// =============================================================================
// URGENCY STYLING
// =============================================================================

const urgencyConfig: Record<UrgencyLevel, {
  icon: typeof Bell;
  dotClass: string;
  textClass: string;
}> = {
  breaking: {
    icon: Flame,
    dotClass: 'bg-red-500 animate-pulse',
    textClass: 'text-gold-300 font-semibold',
  },
  urgent: {
    icon: AlertTriangle,
    dotClass: 'bg-amber-500 animate-pulse',
    textClass: 'text-gold-300',
  },
  important: {
    icon: Bell,
    dotClass: 'bg-gold-500',
    textClass: 'text-white/90',
  },
  normal: {
    icon: Bell,
    dotClass: 'bg-white/40',
    textClass: 'text-white/70',
  },
};

// =============================================================================
// LIVE TICKER — Continuous Marquee Scroller
// =============================================================================

export function LiveTicker({
  updates,
  speed = 6,
  pauseOnHover = true,
}: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const contentWidthRef = useRef(0);

  // Calculate pixels per frame based on speed (lower speed = faster)
  const pixelsPerFrame = (1 / speed) * 1.5;

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const innerEl = innerRef.current;
    if (!scrollEl || !innerEl) return;

    // Measure the width of one set of items
    const children = innerEl.children;
    if (children.length === 0) return;

    // Half the children are duplicates, measure first half
    const halfCount = Math.floor(children.length / 2);
    let totalWidth = 0;
    for (let i = 0; i < halfCount; i++) {
      totalWidth += (children[i] as HTMLElement).offsetWidth;
    }
    contentWidthRef.current = totalWidth;
    positionRef.current = 0;

    const animate = () => {
      if (!isPaused) {
        // RTL: scroll moves content to the right (positive translateX)
        positionRef.current += pixelsPerFrame;

        // Reset when we've scrolled past one full set
        if (positionRef.current >= contentWidthRef.current) {
          positionRef.current = 0;
        }

        innerEl.style.transform = `translateX(${positionRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, pixelsPerFrame, updates]);

  if (!updates.length) return null;

  // Duplicate items for seamless loop
  const items = [...updates, ...updates];

  return (
    <div
      className="relative bg-gradient-to-r from-[#0a0e27] via-[#0f1629] to-[#0a0e27] border-b border-white/[0.06] overflow-hidden"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      role="region"
      aria-label="עדכונים חמים"
    >
      {/* Left fixed badge */}
      <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pe-4 ps-8 bg-gradient-to-l from-transparent via-[#0a0e27] to-[#0a0e27]">
        <div className="flex items-center gap-2 bg-gold-500/15 border border-gold-500/20 rounded-full px-3.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
          </span>
          <span className="text-gold-400 text-xs font-bold tracking-wide whitespace-nowrap">
            חדשות בזק
          </span>
        </div>
      </div>

      {/* Left fade gradient */}
      <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-[#0a0e27] to-transparent pointer-events-none" />

      {/* Scrolling content */}
      <div ref={scrollRef} className="overflow-hidden h-11">
        <div
          ref={innerRef}
          className="flex items-center h-full whitespace-nowrap will-change-transform"
          style={{ direction: 'rtl' }}
        >
          {items.map((update, index) => {
            const config = urgencyConfig[update.urgencyLevel || 'normal'];
            return (
              <div
                key={`${update.id}-${index}`}
                className="inline-flex items-center gap-3 px-6 flex-shrink-0"
              >
                {/* Urgency dot */}
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dotClass)} />

                {/* Separator diamond */}
                {index > 0 && (
                  <span className="w-1 h-1 rotate-45 bg-gold-500/30 flex-shrink-0 -me-1" aria-hidden="true" />
                )}

                {/* Title */}
                {update.link ? (
                  <a
                    href={update.link}
                    className={cn(
                      'text-sm hover:text-gold-400 transition-colors duration-200 hover:underline underline-offset-2',
                      config.textClass
                    )}
                  >
                    {update.title}
                  </a>
                ) : (
                  <span className={cn('text-sm', config.textClass)}>
                    {update.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle top/bottom border accents */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/10 to-transparent" />
    </div>
  );
}

// =============================================================================
// SCROLLING TICKER VARIANT (kept for backwards compatibility)
// =============================================================================

export function ScrollingTicker({ updates }: { updates: NewsUpdate[] }) {
  if (!updates.length) return null;

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
                        cfg.dotClass
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
