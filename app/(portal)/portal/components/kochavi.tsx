'use client';

/**
 * כוכבי (Kochavi) — the portal's mascot, v3.
 *
 * A small gold star that came down from the journey's constellation map.
 * Pure SVG + CSS (no libraries), respects prefers-reduced-motion.
 *
 * v3: pseudo-3D — faceted shading like a polished gold ornament, a slow
 * depth yaw around the Y axis, and a breathing ground shadow. His arms are
 * the star's own side points (separate rotatable groups).
 *
 * Animations (prop `anim`):
 *   idle  — bob + tiny tilt + periodic happy hop (default)
 *   wave  — waves his right point
 *   party — jumps with joy, both points up (celebrations)
 *   nod   — slow agreeing nod (learning lessons)
 *   sleep — closed eyes + zzz (empty states)
 *
 * Scenes (prop `scene`) — topic performances across the portal. Held items
 * live INSIDE the arm groups so they move with his arm naturally:
 *   megaphone — doing the marketing (sound waves)        · שיווק ולקוחות
 *   scale     — literally balancing a balance sheet      · פיננסים / מאזן
 *   telescope — scanning the market horizon              · הבעיה והשוק
 *   coins     — juggling revenue streams                 · מודל עסקי
 *   flask     — running the experiment                   · ולידציה
 *   mic       — telling the story                        · הסיפור והצוות
 *   briefcase — dressed for the investor room            · חדר המשקיעים
 *   clock     — time management juggling                 · ניהול זמן
 */

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Real-3D version (three.js) — loaded lazily, client-only.
const Kochavi3D = dynamic(() => import('./kochavi3d').then((m) => m.Kochavi3D), { ssr: false });

export type KochaviAnim = 'idle' | 'wave' | 'party' | 'nod' | 'sleep';
export type KochaviScene =
  | 'none'
  | 'megaphone'
  | 'scale'
  | 'telescope'
  | 'coins'
  | 'flask'
  | 'mic'
  | 'briefcase'
  | 'clock';

interface KochaviProps {
  size?: number;
  anim?: KochaviAnim;
  scene?: KochaviScene;
  hat?: 'none' | 'grad';
  className?: string;
}

export function Kochavi({
  size = 120,
  anim = 'idle',
  scene = 'none',
  hat = 'none',
  className,
}: KochaviProps) {
  const sleeping = anim === 'sleep';

  // Per-instance randomized timings: no two Kochavis move in sync, and each
  // one's own loop drifts (durations + phase offsets picked once per mount).
  const quirkStyle = useMemo(
    () =>
      ({
        '--kbob': `${(5.2 + Math.random() * 2.4).toFixed(2)}s`,
        '--kyaw': `${(6 + Math.random() * 3.5).toFixed(2)}s`,
        '--ksway': `${(2.9 + Math.random() * 1.6).toFixed(2)}s`,
        '--kdelay': `${(-Math.random() * 6).toFixed(2)}s`,
      }) as React.CSSProperties,
    [],
  );

  // The plain character (no scene props, no hat) is the true-3D WebGL star.
  // Scene performances + the graduation cap stay hand-drawn SVG.
  if (scene === 'none' && hat === 'none') {
    return (
      <div className={cn('select-none pointer-events-none', className)} aria-hidden="true">
        <Kochavi3D size={size} anim={anim} />
      </div>
    );
  }

  return (
    <div
      className={cn('wc-kochavi select-none pointer-events-none', `wc-k-${anim}`, className)}
      style={{ width: size, height: size * 1.12, perspective: 520, ...quirkStyle }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 224"
        width={size}
        height={size * 1.12}
        className="wc-k-yaw motion-reduce:animate-none"
        style={{ transformStyle: 'preserve-3d', overflow: 'visible' }}
      >
        <defs>
          {/* userSpaceOnUse: arms + body sample ONE continuous color field, so
              the joint has zero color step — he reads as a single solid star */}
          <linearGradient id="wcKGoldLight" gradientUnits="userSpaceOnUse" x1="30" y1="20" x2="175" y2="185">
            <stop offset="0" stopColor="#fdf6dc" />
            <stop offset="0.5" stopColor="#f0dfa0" />
            <stop offset="1" stopColor="#cfae57" />
          </linearGradient>
          <radialGradient id="wcKSheen" gradientUnits="userSpaceOnUse" cx="72" cy="62" r="120">
            <stop offset="0" stopColor="rgba(255,255,255,.5)" />
            <stop offset="0.4" stopColor="rgba(255,255,255,.1)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <g className="wc-k-body">
          {/* arms — the star's own side points (behind the body).
              Same gradient as the body, fill tucked a few px under it, and the
              outline drawn ONLY on the outer edges — so at rest he reads as
              one seamless star, not parts glued together. */}
          <g className="wc-k-armR">
            {/* closed shape with a curved base tucked deep inside the body:
                at rest the base is hidden; mid-wave the emerging limb is a
                fully-outlined rounded point — never a flat cut edge */}
            <path
              d="M121 76 L181 79 L134 116 Q118 100 121 76 Z"
              fill="url(#wcKGoldLight)"
              stroke="#8a7434"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* held items ride the arm */}
            {scene === 'megaphone' && (
              <g>
                <path d="M172 62 L196 48 L196 84 L172 72 Z" fill="#0b1130" stroke="#8a7434" strokeWidth="2.5" strokeLinejoin="round" />
                <rect x="163" y="62" width="11" height="12" rx="3" fill="#c8a951" stroke="#8a7434" strokeWidth="2" />
                <path className="wc-k-s1" d="M200 52 q 10 14 0 28" fill="none" stroke="#e8d48b" strokeWidth="3" strokeLinecap="round" />
                <path className="wc-k-s2" d="M207 46 q 15 20 0 40" fill="none" stroke="#e8d48b" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              </g>
            )}
            {scene === 'telescope' && (
              <g>
                <rect x="160" y="46" width="44" height="15" rx="7" transform="rotate(-24 182 53)" fill="#0b1130" stroke="#8a7434" strokeWidth="2.5" />
                <rect x="196" y="30" width="12" height="19" rx="5" transform="rotate(-24 202 39)" fill="#c8a951" stroke="#8a7434" strokeWidth="2" />
                <g className="wc-k-twinkle" fill="#f5e9c0">
                  <circle cx="214" cy="22" r="2.6" />
                  <circle cx="206" cy="12" r="1.8" />
                </g>
              </g>
            )}
            {scene === 'flask' && (
              <g>
                <path d="M176 52 L176 64 L166 84 a8 8 0 0 0 7 11 l14 0 a8 8 0 0 0 7 -11 L184 64 L184 52 Z" fill="rgba(150,220,255,.25)" stroke="#8a7434" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M168 78 L192 78 L194 84 a8 8 0 0 1 -7 11 l-14 0 a8 8 0 0 1 -7 -11 Z" fill="rgba(120,210,190,.55)" />
                <circle className="wc-k-b1" cx="176" cy="82" r="2.5" fill="#d9f7ef" />
                <circle className="wc-k-b2" cx="184" cy="86" r="2" fill="#d9f7ef" />
                <rect x="172" y="48" width="16" height="6" rx="3" fill="#c8a951" stroke="#8a7434" strokeWidth="2" />
              </g>
            )}
            {scene === 'mic' && (
              <g>
                <rect x="172" y="56" width="10" height="26" rx="5" transform="rotate(-14 177 69)" fill="#0b1130" stroke="#8a7434" strokeWidth="2.5" />
                <circle cx="182" cy="52" r="10" fill="#c8a951" stroke="#8a7434" strokeWidth="2.5" />
                <g className="wc-k-twinkle" fill="#f5e9c0" fontSize="16" fontWeight="bold">
                  <text x="196" y="40">♪</text>
                  <text x="206" y="58" fontSize="12">♪</text>
                </g>
              </g>
            )}
            {scene === 'briefcase' && (
              <g>
                <rect x="164" y="70" width="34" height="26" rx="5" fill="#0b1130" stroke="#8a7434" strokeWidth="2.5" />
                <path d="M174 70 v-5 a4 4 0 0 1 4 -4 h6 a4 4 0 0 1 4 4 v5" fill="none" stroke="#8a7434" strokeWidth="2.5" />
                <rect x="177" y="79" width="8" height="6" rx="2" fill="#c8a951" />
              </g>
            )}
            {scene === 'clock' && (
              <g>
                <circle cx="182" cy="66" r="15" fill="#0b1130" stroke="#c8a951" strokeWidth="3" />
                <path className="wc-k-tick" d="M182 66 L182 56" stroke="#e8d48b" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M182 66 L189 66" stroke="#e8d48b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="182" cy="66" r="2" fill="#e8d48b" />
              </g>
            )}
          </g>

          <g className="wc-k-armL">
            <path
              d="M79 76 L19 79 L66 116 Q82 100 79 76 Z"
              fill="url(#wcKGoldLight)"
              stroke="#8a7434"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>

          {/* star body — fill covers the arm joints; outline drawn only on the
              true outer edges (top point + legs), never across the arm bases */}
          <path
            d="M100 20 L121 76 L134 116 L150 174 L100 141 L50 174 L66 116 L79 76 Z"
            fill="url(#wcKGoldLight)"
          />
          <path d="M79 76 L100 20 L121 76" fill="none" stroke="#8a7434" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M134 116 L150 174 L100 141 L50 174 L66 116" fill="none" stroke="#8a7434" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {/* soft ridge hints only — no tonal split across the star */}
          <g stroke="#8a7434" strokeWidth="1" opacity="0.14">
            <path d="M100 24 L100 106" />
            <path d="M147 170 L104 112" />
            <path d="M53 170 L96 112" />
          </g>
          {/* specular sheen */}
          <path
            d="M100 20 L121 76 L134 116 L150 174 L100 141 L50 174 L66 116 L79 76 Z"
            fill="url(#wcKSheen)"
          />

          {/* juggling coins fly above between the arms */}
          {scene === 'coins' && (
            <g>
              <circle className="wc-k-c1" cx="140" cy="52" r="8" fill="#e8d48b" stroke="#8a7434" strokeWidth="2.5" />
              <circle className="wc-k-c2" cx="100" cy="34" r="8" fill="#f5e9c0" stroke="#8a7434" strokeWidth="2.5" />
              <circle className="wc-k-c3" cx="60" cy="52" r="8" fill="#c8a951" stroke="#8a7434" strokeWidth="2.5" />
            </g>
          )}

          {/* balance beam resting on his top point — he IS the מאזן */}
          {scene === 'scale' && (
            <g className="wc-k-beam">
              <path d="M40 26 L160 26" stroke="#8a7434" strokeWidth="4" strokeLinecap="round" />
              <path d="M100 26 L100 18" stroke="#8a7434" strokeWidth="4" strokeLinecap="round" />
              <path d="M40 26 L32 44 L48 44 Z M160 26 L152 44 L168 44 Z" fill="#c8a951" stroke="#8a7434" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="40" cy="40" r="3" fill="#f5e9c0" />
              <circle cx="160" cy="40" r="3" fill="#f5e9c0" />
            </g>
          )}

          {/* graduation cap */}
          {hat === 'grad' && (
            <g>
              <rect x="82" y="18" width="36" height="12" rx="3" fill="#0b1130" stroke="#8a7434" strokeWidth="2" />
              <path d="M60 20 L100 2 L140 20 L100 34 Z" fill="#0b1130" stroke="#8a7434" strokeWidth="2" strokeLinejoin="round" />
              <path d="M138 22 q 4 14 -2 22" fill="none" stroke="#c8a951" strokeWidth="3" strokeLinecap="round" />
              <circle cx="136" cy="46" r="4" fill="#e8d48b" />
            </g>
          )}

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
                <circle className="wc-k-pupil" cx="86" cy="100" r="4.5" fill="#1d1704" />
                <circle className="wc-k-pupil" cx="114" cy="100" r="4.5" fill="#1d1704" />
                <rect className="wc-k-lid" x="72" y="88" width="24" height="20" rx="10" fill="url(#wcKGoldLight)" />
                <rect className="wc-k-lid" x="104" y="88" width="24" height="20" rx="10" fill="url(#wcKGoldLight)" />
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
        </g>

        {/* breathing ground shadow (under the whole body) */}
        <ellipse className="wc-k-shadow" cx="100" cy="208" rx="46" ry="9" fill="rgba(0,0,0,.45)" />
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
