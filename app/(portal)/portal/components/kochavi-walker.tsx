'use client';

/**
 * כוכבי המטייל — Kochavi strolls along an edge (a card top, a title, a rope).
 *
 * A tiny behavior brain drives him with requestAnimationFrame:
 *   walk (waddling side to side) → pause & look around → hop → walk back...
 *   and once in a while he TRIPS — falls flat, lies dizzy for a beat, shakes
 *   himself and bounces back up to continue. Random timings everywhere, so
 *   the routine never repeats.
 *
 * `rope` draws a thin gold tightrope under his feet (used in the מאזן /
 * financials chapter — balancing on a rope while carrying the scale).
 * Fully decorative: pointer-events none, hidden under prefers-reduced-motion
 * (a static Kochavi is shown instead).
 */

import { useEffect, useRef, useState } from 'react';
import { Kochavi, type KochaviScene } from './kochavi';

interface KochaviWalkerProps {
  size?: number;
  scene?: KochaviScene;
  rope?: boolean;
  className?: string;
}

type Mode = 'walk' | 'pause' | 'fall' | 'lie' | 'getup';

export function KochaviWalker({ size = 60, scene = 'none', rope = false, className }: KochaviWalkerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const star = starRef.current;
    if (!track || !star) return;

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    let raf = 0;
    let last = performance.now();
    let t = 0;

    // behavior state
    let x = rnd(0.15, 0.5); // 0..1 along the track
    let dir = Math.random() < 0.5 ? 1 : -1;
    let mode: Mode = 'walk';
    let modeT = 0;
    let modeDur = rnd(2, 4.5);
    let speed = rnd(0.05, 0.085); // track fraction per second
    let fallAngle = 0;

    const setMode = (m: Mode, dur: number) => {
      mode = m;
      modeT = 0;
      modeDur = dur;
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      modeT += dt;

      const width = track.clientWidth - size;
      let bobY = 0;
      let rot = 0;

      switch (mode) {
        case 'walk': {
          x += dir * speed * dt;
          if (x > 1) { x = 1; dir = -1; }
          if (x < 0) { x = 0; dir = 1; }
          // waddle: rocking + tiny step-bounces
          rot = Math.sin(t * 9) * 6;
          bobY = Math.abs(Math.sin(t * 9)) * 3;
          if (modeT > modeDur) {
            const r = Math.random();
            if (r < 0.12) {
              // whoops!
              fallAngle = dir * rnd(70, 95);
              setMode('fall', 0.45);
            } else if (r < 0.45) {
              setMode('pause', rnd(0.8, 2));
            } else {
              // little hop, keep walking
              bobY = 0;
              setMode('walk', rnd(1.5, 4));
              dir = Math.random() < 0.25 ? -dir : dir;
              speed = rnd(0.05, 0.09);
            }
          }
          break;
        }
        case 'pause': {
          rot = Math.sin(t * 1.4) * 2; // gentle sway, looking around
          if (modeT > modeDur) setMode('walk', rnd(2, 4.5));
          break;
        }
        case 'fall': {
          const p = Math.min(1, modeT / modeDur);
          rot = fallAngle * p * p; // accelerating tip-over
          bobY = -Math.sin(p * Math.PI) * 4 + p * 6;
          if (p >= 1) setMode('lie', rnd(0.7, 1.3));
          break;
        }
        case 'lie': {
          rot = fallAngle + Math.sin(t * 20) * (modeT < 0.25 ? 2.5 : 0); // impact shiver
          bobY = 6;
          if (modeT > modeDur) setMode('getup', 0.55);
          break;
        }
        case 'getup': {
          const p = Math.min(1, modeT / modeDur);
          // springy overshoot back to upright
          const spring = 1 - Math.pow(1 - p, 2);
          rot = fallAngle * (1 - spring) - Math.sin(p * Math.PI) * 8 * Math.sign(fallAngle);
          bobY = 6 * (1 - spring) - Math.sin(p * Math.PI) * 5;
          if (p >= 1) {
            dir = -dir; // walks away from the scene of the crime
            setMode('walk', rnd(2.5, 5));
          }
          break;
        }
      }

      star.style.transform = `translateX(${(-x * width).toFixed(1)}px) translateY(${(-bobY).toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced, size]);

  return (
    <div
      ref={trackRef}
      className={className}
      style={{ position: 'relative', height: size * 1.12, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {rope && (
        <div
          style={{
            position: 'absolute',
            insetInline: 6,
            bottom: 3,
            height: 2,
            borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, #c8a951 12%, #e8d48b 50%, #c8a951 88%, transparent)',
            boxShadow: '0 0 8px rgba(200,169,81,.6)',
          }}
        />
      )}
      <div
        ref={starRef}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: size,
          transformOrigin: '50% 92%',
          willChange: 'transform',
        }}
      >
        <Kochavi size={size} scene={scene} anim="idle" />
      </div>
    </div>
  );
}
