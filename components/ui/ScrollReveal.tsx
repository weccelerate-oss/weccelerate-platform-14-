'use client';

import { useEffect, useRef, ReactNode } from 'react';

type RevealVariant = 'up' | 'right' | 'left' | 'scale' | 'blur';

const variantClasses: Record<RevealVariant, string> = {
  up: 'scroll-reveal',
  right: 'scroll-reveal-right',
  left: 'scroll-reveal-left',
  scale: 'scroll-reveal-scale',
  blur: 'scroll-reveal-blur',
};

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'up',
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => entry.target.classList.add('revealed'), delay);
            } else {
              entry.target.classList.add('revealed');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
