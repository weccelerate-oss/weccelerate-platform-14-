'use client';

import { useRef, useEffect, useState } from 'react';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => {
      setStatus('canplay');
      video.play().then(() => setStatus('playing')).catch((e) => setStatus('blocked: ' + e.message));
    };
    const onError = () => {
      const err = video.error;
      setStatus('error: ' + (err?.message || 'unknown') + ' code=' + err?.code);
    };
    const onPlaying = () => setStatus('playing');

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);
    video.addEventListener('playing', onPlaying);

    // Also try to play directly
    if (video.readyState >= 3) {
      video.play().then(() => setStatus('playing')).catch((e) => setStatus('blocked: ' + e.message));
    }

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Temporary debug overlay — remove after confirming video works */}
      {status !== 'playing' && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(255,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 9999,
          direction: 'ltr',
        }}>
          Video status: {status} |{' '}
          <a href="/hero-bg.mp4" target="_blank" rel="noopener" style={{ color: '#ff0', textDecoration: 'underline' }}>
            Test video link
          </a>
        </div>
      )}
    </>
  );
}
