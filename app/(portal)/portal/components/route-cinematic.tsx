'use client';

/**
 * Cinematic route transition — the portal's "B moments".
 *
 * On every route change inside the portal: a gold light sweep crosses the
 * screen and כוכבי flies across leaving a sparkle trail, "building" the next
 * page. Purely decorative (pointer-events: none), ~850ms, skipped entirely
 * under prefers-reduced-motion (CSS hides the layers).
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteCinematic() {
  const pathname = usePathname();
  const [playKey, setPlayKey] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      // Also play once on first load — the entrance is part of the show.
      first.current = false;
    }
    setPlayKey((k) => k + 1);
    // Safety net: even if animationend never fires (heavy page hydration),
    // the overlay is removed shortly after the flight duration.
    const t = setTimeout(() => setPlayKey(0), 1100);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!playKey) return null;

  return (
    <div key={playKey} aria-hidden="true">
      <div className="wc-cine-sweep" />
      <svg
        className="wc-cine-star"
        width="64"
        height="64"
        viewBox="0 0 200 200"
        onAnimationEnd={() => setPlayKey(0)}
      >
        <defs>
          <linearGradient id="wcCineGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f5e9c0" />
            <stop offset="1" stopColor="#c8a951" />
          </linearGradient>
        </defs>
        <path
          d="M100 18 L122 72 L180 76 L136 114 L150 172 L100 140 L50 172 L64 114 L20 76 L78 72 Z"
          fill="url(#wcCineGold)"
          stroke="#8a7434"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="84" cy="88" r="9" fill="#fff" />
        <circle cx="116" cy="88" r="9" fill="#fff" />
        <circle cx="88" cy="90" r="4" fill="#1d1704" />
        <circle cx="112" cy="90" r="4" fill="#1d1704" />
        <path d="M86 108 q 14 12 28 0" fill="none" stroke="#1d1704" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
