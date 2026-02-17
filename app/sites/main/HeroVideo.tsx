'use client';

import { useRef, useEffect } from 'react';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force play on mount (some browsers need this)
    video.play().catch((err) => {
      console.warn('[HeroVideo] Autoplay blocked:', err.message);
    });
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      poster="/hero-bg-poster.jpeg"
      preload="auto"
      className="absolute inset-0 w-full h-full object-cover"
      onError={(e) => {
        const video = e.target as HTMLVideoElement;
        console.error('[HeroVideo] Video error:', video.error?.message, video.error?.code);
      }}
      onLoadedData={() => {
        console.log('[HeroVideo] Video loaded and playing');
      }}
    >
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
  );
}
