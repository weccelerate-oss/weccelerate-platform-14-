'use client';

import { useRef, useEffect, useState } from 'react';

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    // Check screen size
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Don't load video on mobile
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => {
      setVideoReady(true);
      video.play().catch((e) => setVideoError('play blocked: ' + e.message));
    };
    const onPlaying = () => {
      setVideoReady(true);
      setVideoError(null);
    };
    const onError = () => {
      const e = video.error;
      setVideoError(`error ${e?.code}: ${e?.message}`);
    };

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError);

    // If already ready
    if (video.readyState >= 3) {
      onCanPlay();
    }

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError);
    };
  }, [isMobile]);

  // Mobile: show image
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

  // Desktop: show video (with poster fallback)
  return (
    <div className="absolute inset-0 bg-[#050810]">
      {/* Poster image as fallback — visible until video plays */}
      <img
        src="/hero-bg-poster.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Video on top */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-bg-poster.jpeg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Debug banner — TEMPORARY, remove after video confirmed working */}
      {!videoReady && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            background: 'red',
            color: 'white',
            padding: '10px 16px',
            borderRadius: 6,
            fontSize: 14,
            zIndex: 99999,
            direction: 'ltr',
            fontFamily: 'monospace',
          }}
        >
          {videoError
            ? `VIDEO ERROR: ${videoError}`
            : 'Video loading...'}
          {' | '}
          <a
            href="/hero-bg.mp4"
            target="_blank"
            rel="noopener"
            style={{ color: 'yellow', textDecoration: 'underline' }}
          >
            Click to test video URL
          </a>
        </div>
      )}
    </div>
  );
}

// Keep old export name for backwards compat
export const HeroVideo = HeroBackground;
