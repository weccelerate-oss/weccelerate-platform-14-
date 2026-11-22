'use client';

/**
 * Homepage hero background.
 *
 * hero-bg7.mp4 is the source clip re-encoded for the web: audio stripped (it
 * plays muted), 8.1 -> 2.6 Mbps, and trimmed past the fade-in and before the
 * fade-out. The trim matters because this loops — untrimmed, the hero faded to
 * black every 26 seconds and first paint was a black rectangle.
 *
 * The still is what the server renders, on every screen size. It is the
 * page's largest paint, so it is a real <img> the browser can discover and
 * prioritise from the HTML. Desktop shows frame 0 of the video (so nothing
 * jumps when playback starts); mobile keeps its own portrait still — owner's
 * call, left as it was.
 *
 * The <video> is mounted only after hydration and only on desktop. Rendering
 * it on the server (as this did until 2026-11) put the tag in the HTML for
 * phones too, so they started downloading a 7.7 MB clip they never show, and
 * made the video — not an image — the largest-paint element.
 */

import { useEffect, useState } from 'react';

const cover = 'absolute inset-0 w-full h-full object-cover';

export function HeroBackground() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const update = () => setShowVideo(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050810]">
      <picture>
        <source media="(max-width: 767px)" type="image/webp" srcSet="/hero-bg-poster-mobile.webp" />
        <source media="(max-width: 767px)" srcSet="/hero-bg-poster.jpeg" />
        <source type="image/webp" srcSet="/hero-bg-poster7.webp" />
        <img
          src="/hero-bg-poster7.jpeg"
          alt="WeCcelerate — Venture Builder & Startup Accelerator Israel"
          fetchPriority="high"
          decoding="async"
          className={cover}
        />
      </picture>

      {showVideo && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/hero-bg7.mp4"
          poster="/hero-bg-poster7.webp"
          className={cover}
        />
      )}
    </div>
  );
}

export const HeroVideo = HeroBackground;
