'use client';

import { useRef, useEffect, useState } from 'react';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((err) => {
      console.warn('[HeroVideo] Autoplay blocked:', err.message);
    });
  }, []);

  return (
    <video
      ref={videoRef}
      src="/hero-bg.mp4"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
        isPlaying ? 'opacity-100' : 'opacity-0'
      }`}
      onPlaying={() => setIsPlaying(true)}
      onError={(e) => {
        const video = e.target as HTMLVideoElement;
        console.error('[HeroVideo] Video error:', video.error?.message, video.error?.code);
      }}
    />
  );
}
