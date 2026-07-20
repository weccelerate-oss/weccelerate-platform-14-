'use client';

/**
 * כוכבי (Kochavi) — the portal's mascot.
 *
 * A small gold star that came down from the journey's constellation map.
 * Pure SVG + CSS (no libraries), respects prefers-reduced-motion via the
 * `motion-reduce:` utilities on the wrapper.
 *
 * Animations (prop `anim`):
 *   idle  — gentle bob + occasional blink (default)
 *   wave  — waves his right arm once (auto-returns to idle look)
 *   party — jumps with joy (chapter celebrations)
 *   nod   — slow agreeing nod (learning lessons)
 *   sleep — closed eyes + zzz bob (empty states)
 *
 * Accessories (prop `hat`):
 *   none | grad — student graduation cap (learning center)
 */

import { cn } from '@/lib/utils';

export type KochaviAnim = 'idle' | 'wave' | 'party' | 'nod' | 'sleep';

interface KochaviProps {
  size?: number;
  anim?: KochaviAnim;
  hat?: 'none' | 'grad';
  className?: string;
}

export function Kochavi({ size = 120, anim = 'idle', hat = 'none', className }: KochaviProps) {
  const sleeping = anim === 'sleep';
  return (
    <div
      className={cn('wc-kochavi select-none pointer-events-none', `wc-k-${anim}`, className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 210" width={size} height={size * 1.05} className="wc-k-body motion-reduce:animate-none">
        <defs>
          <linearGradient id="wcKochaviGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f5e9c0" />
            <stop offset="1" stopColor="#c8a951" />
          </linearGradient>
        </defs>

        {/* star body */}
        <path
          d="M100 28 L122 82 L180 86 L136 124 L150 182 L100 150 L50 182 L64 124 L20 86 L78 82 Z"
          fill="url(#wcKochaviGold)"
          stroke="#8a7434"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* graduation cap */}
        {hat === 'grad' && (
          <g>
            <rect x="82" y="24" width="36" height="12" rx="3" fill="#0b1130" stroke="#8a7434" strokeWidth="2" />
            <path d="M60 26 L100 8 L140 26 L100 40 Z" fill="#0b1130" stroke="#8a7434" strokeWidth="2" strokeLinejoin="round" />
            <path d="M138 28 q 4 14 -2 22" fill="none" stroke="#c8a951" strokeWidth="3" strokeLinecap="round" />
            <circle cx="136" cy="52" r="4" fill="#e8d48b" />
          </g>
        )}

        {/* arms */}
        <g className="wc-k-armR">
          <path d="M132 118 q 22 -6 30 -22" fill="none" stroke="#8a7434" strokeWidth="6" strokeLinecap="round" />
        </g>
        <path d="M68 118 q -22 6 -28 24" fill="none" stroke="#8a7434" strokeWidth="6" strokeLinecap="round" />

        {/* face */}
        <g className="wc-k-head">
          {sleeping ? (
            <g>
              <path d="M76 98 q 8 6 16 0" fill="none" stroke="#1d1704" strokeWidth="4" strokeLinecap="round" />
              <path d="M108 98 q 8 6 16 0" fill="none" stroke="#1d1704" strokeWidth="4" strokeLinecap="round" />
              <path d="M92 120 q 8 6 16 0" fill="none" stroke="#1d1704" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <circle cx="84" cy="98" r="10" fill="#fff" />
              <circle cx="116" cy="98" r="10" fill="#fff" />
              <circle cx="86" cy="100" r="4.5" fill="#1d1704" />
              <circle cx="114" cy="100" r="4.5" fill="#1d1704" />
              <rect className="wc-k-lid" x="72" y="88" width="24" height="20" rx="10" fill="url(#wcKochaviGold)" />
              <rect className="wc-k-lid" x="104" y="88" width="24" height="20" rx="10" fill="url(#wcKochaviGold)" />
              <path d="M86 118 q 14 12 28 0" fill="none" stroke="#1d1704" strokeWidth="4" strokeLinecap="round" />
              <circle cx="72" cy="113" r="4" fill="rgba(200,80,60,.35)" />
              <circle cx="128" cy="113" r="4" fill="rgba(200,80,60,.35)" />
            </g>
          )}
        </g>

        {/* zzz for sleep */}
        {sleeping && (
          <g className="wc-k-zzz" fill="#e8d48b" fontSize="18" fontWeight="bold" fontFamily="inherit">
            <text x="148" y="66">z</text>
            <text x="160" y="48" fontSize="14">z</text>
            <text x="170" y="34" fontSize="11">z</text>
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Fire a gold-sparkle burst inside `container` (e.g. around Kochavi when he
 * celebrates). Skips entirely under prefers-reduced-motion.
 */
export function kochaviBurst(container: HTMLElement) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#f5e9c0', '#e8d48b', '#c8a951'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('span');
    p.style.cssText =
      'position:absolute;width:6px;height:6px;border-radius:50%;top:45%;right:50%;pointer-events:none;z-index:40;background:' +
      colors[i % 3];
    container.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = 55 + Math.random() * 110;
    p.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        {
          transform: `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist + 30}px) scale(.3)`,
          opacity: 0,
        },
      ],
      { duration: 800 + Math.random() * 500, easing: 'cubic-bezier(.1,.8,.4,1)' },
    ).onfinish = () => p.remove();
  }
}
