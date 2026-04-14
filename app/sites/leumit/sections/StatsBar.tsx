'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

const STATS: Stat[] = [
  {
    value: 720,
    suffix: 'K+',
    label: 'מטופלים',
    sublabel: 'ברשת לאומית',
  },
  {
    value: 8.7,
    suffix: 'M',
    label: 'ביקורים שנתיים',
    sublabel: 'בקליניקות ברחבי הארץ',
  },
  {
    value: 200,
    suffix: '+',
    label: 'משקיעים',
    sublabel: 'ברשת WeCcelerate',
  },
  {
    value: 6,
    suffix: '',
    label: 'מסלולי ליווי',
    sublabel: 'עסקיים ורפואיים',
  },
];

function CountUp({ end, suffix }: { end: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1800;
            const steps = 60;
            const increment = end / steps;
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(current);
              }
            }, duration / steps);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  const display = end < 10 ? count.toFixed(1) : Math.floor(count).toString();

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #040B16 0%, #0a1628 50%, #040B16 100%)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

      <div className="container-corporate relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="text-center md:border-l border-white/5 first:border-l-0 md:px-4"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-b from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent mb-2 tabular-nums">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-semibold text-white uppercase tracking-wide mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-white/40">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/30 mt-10 max-w-2xl mx-auto">
          * גישה לדאטה רפואית מותנית באישור ועדת הלסינקי ובהתאמה לרגולציית הגנת הפרטיות.
        </p>
      </div>
    </section>
  );
}
