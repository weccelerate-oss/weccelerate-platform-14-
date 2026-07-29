'use client';

/**
 * Cinematic route transition — the portal's "B moments".
 *
 * On every route change inside the portal: a gold light sweep crosses the
 * screen, "building" the next page. Purely decorative (pointer-events: none), ~850ms, skipped entirely
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
      <div className="wc-cine-sweep" onAnimationEnd={() => setPlayKey(0)} />
    </div>
  );
}
