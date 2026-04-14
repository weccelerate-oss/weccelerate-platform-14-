'use client';

import { motion } from 'framer-motion';

interface FloatingOrbsProps {
  /** Color tint for the orbs — defaults to gold */
  color?: string;
  /** How many orbs to render */
  count?: number;
  /** Container className */
  className?: string;
}

/**
 * FloatingOrbs — Cute decorative animated background orbs.
 * Pure CSS + Framer Motion — no images required.
 */
export function FloatingOrbs({
  color = 'rgba(200, 169, 81, 0.5)',
  count = 6,
  className = '',
}: FloatingOrbsProps) {
  const orbs = Array.from({ length: count }, (_, i) => {
    const seed = i * 1.7;
    return {
      id: i,
      size: 6 + ((seed * 13) % 10),
      left: ((seed * 23) % 90) + 5,
      top: ((seed * 37) % 90) + 5,
      delay: (seed * 0.3) % 3,
      duration: 4 + ((seed * 0.7) % 3),
    };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            background: color,
            boxShadow: `0 0 ${orb.size * 2}px ${color}`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

interface SparklesProps {
  color?: string;
  count?: number;
  className?: string;
}

/**
 * Sparkles — Tiny glittering points that shimmer in and out.
 */
export function Sparkles({
  color = '#C8A951',
  count = 12,
  className = '',
}: SparklesProps) {
  const sparkles = Array.from({ length: count }, (_, i) => {
    const seed = i * 2.3;
    return {
      id: i,
      left: ((seed * 17) % 100),
      top: ((seed * 29) % 100),
      delay: (seed * 0.4) % 4,
      size: 2 + ((seed * 0.5) % 3),
    };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.left}%`,
            top: `${s.top}%`,
            background: color,
            boxShadow: `0 0 ${s.size * 4}px ${color}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.3, 0],
          }}
          transition={{
            duration: 2.5,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

interface GradientBlobProps {
  color?: string;
  size?: number;
  position?: { top?: string; bottom?: string; left?: string; right?: string };
  className?: string;
}

/**
 * GradientBlob — Soft animated gradient blob that drifts slowly.
 */
export function GradientBlob({
  color = 'rgba(200, 169, 81, 0.15)',
  size = 400,
  position = { top: '50%', left: '50%' },
  className = '',
}: GradientBlobProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        ...position,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        scale: [1, 1.15, 1],
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    />
  );
}
