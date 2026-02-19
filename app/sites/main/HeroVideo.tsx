'use client';

import { useRef, useEffect, useState } from 'react';

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [debugInfo, setDebugInfo] = useState('initializing...');
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

    // Step 1: Test if the video URL is accessible via fetch
    setDebugInfo('Fetching /hero-bg.mp4 ...');

    fetch('/hero-bg.mp4', { method: 'HEAD', credentials: 'include' })
      .then((res) => {
        setDebugInfo(`Fetch: ${res.status} ${res.statusText}, type=${res.headers.get('content-type')}`);

        if (!res.ok) {
          setDebugInfo(`BLOCKED: server returned ${res.status}. Deployment Protection?`);
          return;
        }

        // Step 2: Fetch the video as blob and create object URL
        setDebugInfo('Downloading video blob...');
        return fetch('/hero-bg.mp4', { credentials: 'include' })
          .then((r) => r.blob())
          .then((blob) => {
            setDebugInfo(`Blob ready: ${(blob.size / 1024 / 1024).toFixed(1)}MB, type=${blob.type}`);
            const url = URL.createObjectURL(blob);
            const video = videoRef.current;
            if (video) {
              video.src = url;
              video.play()
                .then(() => {
                  setVideoPlaying(true);
                  setDebugInfo('PLAYING!');
                })
                .catch((e) => setDebugInfo(`Play error: ${e.message}`));
            }
          });
      })
      .catch((e) => {
        setDebugInfo(`Fetch failed: ${e.message}`);
      });
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
    <div className="absolute inset-0 bg-[#050810]">
      {/* Poster fallback */}
      <img
        src="/hero-bg-poster.jpeg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Video — src set via blob URL in useEffect */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Debug banner — TEMPORARY */}
      {!videoPlaying && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            left: 10,
            background: 'red',
            color: 'white',
            padding: '12px 18px',
            borderRadius: 8,
            fontSize: 14,
            zIndex: 99999,
            direction: 'ltr',
            fontFamily: 'monospace',
            maxWidth: '80vw',
            wordBreak: 'break-all',
          }}
        >
          {debugInfo}
        </div>
      )}
    </div>
  );
}

export const HeroVideo = HeroBackground;
