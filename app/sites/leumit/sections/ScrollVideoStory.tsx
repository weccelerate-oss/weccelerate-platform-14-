'use client';

/**
 * ScrollVideoStory
 *
 * Cinematic scroll-driven video moment for the Leumit subdomain.
 * The container is 600vh tall; inside it a 100vh sticky stage holds a
 * single video whose `currentTime` is mapped from window scroll position
 * (Apple product-page style). Six Hebrew text overlays activate at
 * scroll thresholds, and the partnership lockup fades in over the final
 * 8% as a reveal moment.
 *
 * Video file: /LEUMIT.mp4 (lives in public/). If missing, the stage
 * stays black and the overlays still cycle — they're independent of
 * the video being loaded.
 *
 * iOS Safari quirk: `video.currentTime = N` is ignored until the video
 * has played once via a real user gesture. We attach a one-time
 * touch/click listener that calls play→pause to unlock seeking.
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
const REVEAL_AT = 0.92;

export default function ScrollVideoStory() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Caches between rAF frames — avoid bouncing through React state on every scroll tick.
  const sectionTopRef = useRef(0);
  const sectionScrollLenRef = useRef(1);
  const tickingRef = useRef(false);
  const videoReadyRef = useRef(false);
  const videoDurationRef = useRef(0);
  const lastSeekRef = useRef(0);
  const iosUnlockedRef = useRef(false);

  const [activeScene, setActiveScene] = useState(0);
  const [progress, setProgress] = useState(0);

  // Touch devices need a more generous seek threshold or the iOS decoder
  // queues writes and the result is visible stuttering during fast scroll.
  const seekThresholdRef = useRef(0.01);

  // Touch / iOS: scroll-driven currentTime seeking is unreliable on mobile
  // even after the unlock trick (some users don't tap, some devices ignore
  // it entirely). On touch we fall back to autoplay+loop and let the scene
  // text still cycle by scroll. Desktop keeps the cinematic scroll-jacked
  // behavior. Detected after mount so SSR markup matches first paint.
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // -------------------- Layout cache --------------------
  const measureLayout = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    sectionTopRef.current = rect.top + window.scrollY;
    const len = section.offsetHeight - window.innerHeight;
    sectionScrollLenRef.current = len > 0 ? len : 1;
  }, []);

  // -------------------- Per-frame render --------------------
  const render = useCallback(() => {
    tickingRef.current = false;
    const scrolled = window.scrollY - sectionTopRef.current;
    let p = scrolled / sectionScrollLenRef.current;
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    // Only seek by scroll on non-touch devices. Touch falls back to
    // autoplay+loop so the video actually plays without a user gesture.
    if (!isTouchDevice && videoReadyRef.current && videoDurationRef.current > 0) {
      const t = p * videoDurationRef.current;
      if (Math.abs(t - lastSeekRef.current) > seekThresholdRef.current) {
        const v = videoRef.current;
        if (v) {
          try {
            v.currentTime = t;
            lastSeekRef.current = t;
          } catch {
            /* iOS pre-unlock or transient decoder state */
          }
        }
      }
    }

    const scene = Math.min(TOTAL_SCENES - 1, Math.floor(p * TOTAL_SCENES));
    setActiveScene((prev) => (prev === scene ? prev : scene));
    setProgress(p);
  }, []);

  const onScrollOrResize = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    window.requestAnimationFrame(render);
  }, [render]);

  // -------------------- Effects --------------------
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    seekThresholdRef.current = isTouch ? 0.05 : 0.01;
    setIsTouchDevice(isTouch);

    measureLayout();
    render();

    window.addEventListener('scroll', onScrollOrResize, { passive: true });

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measureLayout();
        onScrollOrResize();
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.clearTimeout(resizeTimer);
    };
  }, [measureLayout, onScrollOrResize, render]);

  // Video metadata + iOS unlock
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoadedMetadata = () => {
      videoDurationRef.current = v.duration || 0;
      videoReadyRef.current = videoDurationRef.current > 0;
      measureLayout();
      render();
    };
    v.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });

    const onError = () => {
      // Static fallback — overlays still cycle, stage just stays dark.
      console.warn('[ScrollVideoStory] video load failed; overlays still active');
    };
    v.addEventListener('error', onError);

    // iOS Safari: lock-bypass on first user gesture.
    const unlock = () => {
      if (iosUnlockedRef.current) return;
      iosUnlockedRef.current = true;
      const p = v.play();
      if (p && typeof p.then === 'function') {
        p.then(() => v.pause()).catch(() => { /* blocked; fine */ });
      } else {
        try { v.pause(); } catch { /* */ }
      }
    };
    const opts = { once: true, passive: true } as AddEventListenerOptions;
    window.addEventListener('touchstart', unlock, opts);
    window.addEventListener('click', unlock, opts);
    window.addEventListener('pointerdown', unlock, opts);

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('error', onError);
    };
  }, [measureLayout, render]);

  // -------------------- Click-to-jump on dots --------------------
  const jumpToScene = useCallback((sceneIndex: number) => {
    const top = sectionTopRef.current + (sceneIndex / TOTAL_SCENES) * sectionScrollLenRef.current;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  // -------------------- Render --------------------
  const reveal = progress > REVEAL_AT;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#040B16]"
      style={{ height: '600vh' }}
      aria-label="סיפור השותפות"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Video — scroll-driven on desktop, autoplay+loop on touch.
            `key` forces remount when touch detection changes after mount so
            autoplay attribute actually takes effect on iOS. */}
        <video
          key={isTouchDevice ? 'touch' : 'desktop'}
          ref={videoRef}
          src="/LEUMIT.mp4"
          muted
          playsInline
          preload="auto"
          autoPlay={isTouchDevice}
          loop={isTouchDevice}
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

        {/* Bottom-text scrim — guarantees the scene-text headline is legible
            even when the underlying frame is bright. Stronger at the bottom,
            fades out by 60% upward. Combined with the radial vignette this
            keeps text legible across every frame of the video. */}
        <div
          className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none z-[7]"
          style={{
            background:
              'linear-gradient(to top, rgba(4,11,22,0.92) 0%, rgba(4,11,22,0.6) 25%, rgba(4,11,22,0.25) 55%, transparent 100%)',
          }}
          aria-hidden
        />

        {/* Subtle cyan wash */}
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
                width: `${(progress * 100).toFixed(2)}%`,
                boxShadow: '0 0 8px rgba(6,182,212,0.6)',
                transition: 'width 0.2s linear',
              }}
            />
          </span>
          <span className="text-[13px] text-white/40 tracking-wider">06</span>
        </div>

        {/* Side dots (right edge in RTL — natural for thumb reach) */}
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
                    // Belt-and-suspenders legibility — the bottom-scrim
                    // handles most of it but a soft shadow keeps the
                    // headline crisp against bright video frames too.
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

        {/* Final logo reveal */}
        <div
          className={[
            'absolute inset-0 z-[25] flex flex-col items-center justify-center text-center px-[5vw] transition-opacity duration-1000 pointer-events-none',
            reveal ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          aria-hidden={!reveal}
        >
          <div className="relative">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[800px] h-[240px] pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(6,182,212,0.18) 0%, rgba(212,175,55,0.10) 50%, transparent 80%)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/leumit-weccelerate-transparent.png"
              alt="לאומית × WeCcelerate"
              width={800}
              height={200}
              className="relative w-[80vw] max-w-[720px] h-auto drop-shadow-[0_0_60px_rgba(6,182,212,0.55)]"
            />
          </div>
          <p className="mt-7 font-mono text-xs tracking-[0.35em] uppercase text-[#D4AF37]/70 max-w-md">
            מסלול ההאצה לחדשנות רפואית בישראל.
          </p>
        </div>
      </div>
    </section>
  );
}
