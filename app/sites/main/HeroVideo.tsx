'use client';

import { useRef, useEffect, useState } from 'react';

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    fetch('/hero-bg.mp4', { credentials: 'include' })
      .then((r) => r.blob())
      .then((blob) => {
        const video = videoRef.current;
        if (!video) return;
        const url = URL.createObjectURL(blob);
        video.src = url;
        video.load();
        video.play()
          .then(() => setVideoPlaying(true))
          .catch(() => {});
      })
      .catch(() => {});
  }, [isMobile]);

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

  return (
    <div className="absolute inset-0">
      {/* Poster fallback — hidden once video plays */}
      {!videoPlaying && (
        <img
          src="/hero-bg-poster.jpeg"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export const HeroVideo = HeroBackground;
