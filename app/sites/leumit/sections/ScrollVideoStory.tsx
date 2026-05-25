'use client';

/**
 * Ambient brand-film section for the Leumit subdomain.
 *
 * LEUMIT.mp4 plays in the background on a loop (no autoplay-blocked
 * scenario thanks to muted + playsInline), and six Hebrew scene-text
 * overlays cycle automatically on a timer — no scroll-jacking, no
 * currentTime seeking. The earlier scroll-driven implementation was
 * unreliable because (a) sparse keyframes in the source video made
 * seeking choppy, (b) iOS Safari refuses to honor currentTime writes
 * until a user gesture, and (c) it forced a 600vh-tall section just to
 * play one short clip.
 *
 * Now: 100vh section, video loops naturally, captions advance every
 * 5 seconds and wrap. Dots are clickable to jump between scenes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface Scene {
  meta: string;
  headline: string;
  sub?: string;
}

const SCENES: Scene[] = [
  {
    meta: 'SCENE 01 — הרגע',
    headline: 'רעיון אחד.',
    sub: 'זה מתחיל בלילה אחד, על שולחן אחד, עם פרוטוטיפ שעוד אף אחד לא ראה.',
  },
  {
    meta: 'SCENE 02 — האקוסיסטם',
    headline: 'לא לבד.',
    sub: 'סביבה שלמה של יזמים, מנטורים ורופאים. כל הניסיון של לאומית — מאחורי כל אחד מהם.',
  },
  {
    meta: 'SCENE 03 — התאוצה',
    headline: 'ניסיון שמאיץ.',
    sub: 'רופאים, מומחים קליניים, אנשי רגולציה — בגישה ישירה. הדרך מהרעיון לאישור מתקצרת.',
  },
  {
    meta: 'SCENE 04 — הפלט',
    headline: 'מהמעבדה לקליניקה.',
    sub: 'תשתיות לפיילוטים ברשת המרפאות של לאומית — לתחילת תהליך מתודולוגי, בכפוף לאישורים רגולטוריים.',
  },
  {
    meta: 'SCENE 05 — המומנטום',
    headline: 'מסטארטאפ — לתעשייה.',
    sub: 'רשת של משקיעים, שותפים ויועצים אסטרטגיים שמלווים את היזם הלאה.',
  },
  {
    meta: 'SCENE 06 — הסיום',
    headline: 'בריאות אחרת.\nמתחילה כאן.',
  },
];

const TOTAL_SCENES = SCENES.length;
// 5s per scene × 6 scenes = 30s full cycle. Matches a typical short-form
// brand film and gives readers enough time to absorb each headline.
const SCENE_INTERVAL_MS = 5000;

export default function ScrollVideoStory() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const cycleHandleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restartable cycle — used by both the initial mount and by dot-click
  // (so manually jumping doesn't immediately flip away the chosen scene).
  const startCycle = useCallback(() => {
    if (cycleHandleRef.current) clearInterval(cycleHandleRef.current);
    cycleHandleRef.current = setInterval(() => {
      setActiveScene((s) => (s + 1) % TOTAL_SCENES);
    }, SCENE_INTERVAL_MS);
  }, []);

  useEffect(() => {
    startCycle();
    return () => {
      if (cycleHandleRef.current) clearInterval(cycleHandleRef.current);
    };
  }, [startCycle]);

  // Try to start the video. Muted + playsInline + autoplay attributes
  // satisfy every modern browser's autoplay policy, but we also call .play()
  // explicitly so that flaky iOS variants and reduced-motion exceptions
  // still get the best shot at running. Failure is silent.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.then === 'function') {
      p.catch(() => { /* policy-blocked; that's fine, will retry on interact */ });
    }

    // One-shot fallback: if autoplay was blocked, the first user interaction
    // anywhere on the page kicks it off.
    const unlock = () => {
      v.play().catch(() => { /* still blocked, give up gracefully */ });
    };
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  }, []);

  // Manual scene jump from a side dot.
  const jumpToScene = useCallback((i: number) => {
    setActiveScene(i);
    startCycle(); // reset the 5s timer so the chosen scene gets its full beat
  }, [startCycle]);

  // Counter bar fill = how far through the cycle we are.
  const counterProgress = (activeScene + 1) / TOTAL_SCENES;

  return (
    <section
      className="relative w-full bg-[#040B16] overflow-hidden"
      style={{ minHeight: '100vh' }}
      aria-label="סיפור השותפות"
    >
      {/* Ambient looping background video */}
      <video
        ref={videoRef}
        src="/LEUMIT.mp4"
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        // @ts-expect-error iOS-only attribute for old WebKit
        webkit-playsinline="true"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[7]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(4,11,22,0.75) 100%)',
        }}
        aria-hidden
      />

      {/* Bottom scrim — keeps the headline legible against any frame */}
      <div
        className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none z-[7]"
        style={{
          background:
            'linear-gradient(to top, rgba(4,11,22,0.92) 0%, rgba(4,11,22,0.6) 25%, rgba(4,11,22,0.25) 55%, transparent 100%)',
        }}
        aria-hidden
      />

      {/* Subtle cyan wash for brand consistency */}
      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Counter (top-left) */}
      <div
        className="absolute top-7 left-[5vw] z-20 inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.25em]"
        dir="ltr"
        aria-hidden
      >
        <span className="font-bold text-[13px] text-white tracking-wider min-w-[24px] text-center">
          {String(activeScene + 1).padStart(2, '0')}
        </span>
        <span className="relative block w-20 h-px bg-white/[0.08]">
          <span
            className="absolute top-0 left-0 h-full bg-cyan-400"
            style={{
              width: `${(counterProgress * 100).toFixed(2)}%`,
              boxShadow: '0 0 8px rgba(6,182,212,0.6)',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </span>
        <span className="text-[13px] text-white/40 tracking-wider">06</span>
      </div>

      {/* Side dots — desktop only, clickable */}
      <nav
        className="hidden sm:flex absolute right-[5vw] top-1/2 -translate-y-1/2 z-20 flex-col gap-3.5"
        aria-label="ניווט בין סצנות"
      >
        {SCENES.map((_, i) => {
          const isActive = i === activeScene;
          const isPassed = i < activeScene;
          return (
            <button
              key={i}
              type="button"
              onClick={() => jumpToScene(i)}
              aria-label={`סצנה ${i + 1}`}
              className={[
                'w-[2px] rounded-sm transition-all duration-500',
                isActive
                  ? 'h-14 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : isPassed
                    ? 'h-6 bg-white/40'
                    : 'h-6 bg-white/15 hover:bg-white/55',
              ].join(' ')}
            />
          );
        })}
      </nav>

      {/* 6 scene-text overlays — bottom-right (RTL natural) */}
      <div className="absolute inset-0 pointer-events-none z-[8]">
        {SCENES.map((scene, i) => {
          const isActive = i === activeScene;
          return (
            <div
              key={i}
              className={[
                'absolute bottom-[14vh] right-[5vw] left-[5vw] sm:left-auto max-w-full sm:max-w-[70vw] text-right',
                'transition-all duration-700',
                isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
              ].join(' ')}
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="inline-flex items-center gap-3.5 mb-5 text-cyan-400 font-mono text-[10px] uppercase tracking-[0.3em] font-medium">
                <span>{scene.meta}</span>
                <span className="inline-block w-12 sm:w-20 h-px bg-cyan-400/50" />
              </div>
              <h2
                className="font-black text-white leading-[1.0] tracking-tight whitespace-pre-line"
                style={{
                  fontSize: 'clamp(40px, 7vw, 120px)',
                  textShadow: '0 2px 24px rgba(4,11,22,0.85), 0 1px 4px rgba(0,0,0,0.7)',
                }}
              >
                {scene.headline}
              </h2>
              {scene.sub && (
                <p
                  className="mt-5 max-w-md text-white/80 leading-relaxed"
                  style={{
                    fontSize: 'clamp(14px, 1.4vw, 18px)',
                    textShadow: '0 1px 8px rgba(4,11,22,0.9)',
                  }}
                >
                  {scene.sub}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
