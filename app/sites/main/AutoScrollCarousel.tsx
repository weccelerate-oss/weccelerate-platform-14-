'use client';

import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface AutoScrollCarouselProps {
  children: ReactNode;
  /** Pixels per second scroll speed */
  speed?: number;
}

export function AutoScrollCarousel({ children, speed = 30 }: AutoScrollCarouselProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paused = isPaused || isTouching || isDragging;

  // Auto-scroll with requestAnimationFrame (RTL: scroll towards the left)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || paused) return;

    let lastTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      el.scrollLeft -= speed * delta;

      // Loop: when scrolled past the first set of cards, jump back
      const halfScroll = el.scrollWidth / 2;
      if (el.scrollLeft <= -halfScroll) {
        el.scrollLeft += halfScroll;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paused, speed]);

  // Touch handlers — pause during swipe + 3s grace after release
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      setIsTouching(true);
    };

    const onTouchEnd = () => {
      resumeTimer.current = setTimeout(() => setIsTouching(false), 3000);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  // Arrow navigation (RTL: next = scroll left, prev = scroll right)
  const scrollByCard = useCallback((direction: 'next' | 'prev') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 424; // card width + gap
    const amount = direction === 'next' ? -cardWidth : cardWidth;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  // Mouse drag support (desktop)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start drag if clicking a button
    if ((e.target as HTMLElement).closest('button')) return;
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStart.current = { x: e.pageX, scrollLeft: el.scrollLeft };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const dx = e.pageX - dragStart.current.x;
    el.scrollLeft = dragStart.current.scrollLeft - dx;
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); setIsDragging(false); }}
    >
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory sm:snap-none select-none"
        style={{ WebkitOverflowScrolling: 'touch', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        dir="rtl"
      >
        {children}
        <div aria-hidden="true" className="contents">
          {children}
        </div>
      </div>

      {/* Arrow buttons — always visible on desktop */}
      <div className="hidden sm:flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => scrollByCard('prev')}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#c8a951]/50 hover:bg-white/5 transition-all duration-200"
          aria-label={t('misc.carousel.prev')}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => scrollByCard('next')}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#c8a951]/50 hover:bg-white/5 transition-all duration-200"
          aria-label={t('misc.carousel.next')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
