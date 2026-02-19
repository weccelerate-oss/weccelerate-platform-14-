'use client';

import { useEffect, useState } from 'react';

export function HeroBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return (
      <div className="absolute inset-0 bg-[#050810]">
        <img
          src="/corporate-hero.jpeg"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Desktop: plain video, no blob, no tricks
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="/hero-bg.mp4"
        poster="/hero-bg-poster.jpeg"
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}

export const HeroVideo = HeroBackground;
