'use client';

import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { servicesHe, servicesEn } from '@/lib/services-data';
import { useEffect, useRef, useState } from 'react';

interface ServiceFullSectionsProps {
  serviceId: string;
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function ServiceFullSections({ serviceId }: ServiceFullSectionsProps) {
  const { lang, dir } = useLanguage();
  const services = lang === 'he' ? servicesHe : servicesEn;
  const service = services.find((s) => s.id === serviceId);

  if (!service) return null;

  const { intro, sections } = service.fullContent;
  const hasImages = sections.some((s) => s.image);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />

      <div className="relative z-10">
        {/* Section heading */}
        <div className="text-center py-16 sm:py-20 px-4">
          <span className="inline-block text-[#c8a951] text-sm font-bold uppercase tracking-[0.3em] mb-4">
            {lang === 'he' ? 'מה כולל השירות?' : 'What Does the Service Include?'}
          </span>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            {intro}
          </p>
        </div>

        {/* Sections — alternating full-width rows on desktop, stacked on mobile */}
        {hasImages ? (
          <div className="flex flex-col">
            {sections.map((section, idx) => (
              <SectionRow
                key={idx}
                section={section}
                idx={idx}
                reverse={idx % 2 === 1}
                dir={dir}
              />
            ))}
          </div>
        ) : (
          /* Fallback grid for sections without images */
          <div className="container-corporate px-4 pb-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, idx) => (
                <article
                  key={idx}
                  className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] p-8 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#c8a951]/15 text-[#c8a951] flex items-center justify-center text-sm font-bold mb-5">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-[#e8d48b] mb-3 tracking-tight">
                    {section.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {section.text}
                  </p>
                  <div className="absolute bottom-0 left-4 right-4 h-[1px] rounded-full bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SectionRow({
  section,
  idx,
  reverse,
  dir,
}: {
  section: { title: string; text: string; image?: string };
  idx: number;
  reverse: boolean;
  dir: string;
}) {
  const { ref, isVisible } = useInView(0.15);

  // For RTL, flip the reverse logic
  const isReversed = dir === 'rtl' ? !reverse : reverse;

  return (
    <div
      ref={ref}
      className={`
        relative grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]
        transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
    >
      {/* Image side */}
      <div
        className={`
          relative h-[300px] sm:h-[350px] lg:h-auto overflow-hidden
          ${isReversed ? 'lg:order-2' : 'lg:order-1'}
        `}
      >
        {section.image && (
          <>
            <Image
              src={section.image}
              alt={section.title}
              fill
              className={`
                object-cover transition-transform duration-[1.5s] ease-out
                ${isVisible ? 'scale-100' : 'scale-110'}
              `}
            />
            {/* Gradient overlay fading into content side */}
            <div
              className={`
                absolute inset-0
                bg-gradient-to-b lg:bg-gradient-to-r from-transparent to-[#0a0f1f]/90
                ${isReversed ? 'lg:bg-gradient-to-l' : 'lg:bg-gradient-to-r'}
              `}
            />
            {/* Bottom gradient on mobile */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0f1f] to-transparent lg:hidden" />
          </>
        )}
      </div>

      {/* Content side */}
      <div
        className={`
          relative flex items-center
          ${isReversed ? 'lg:order-1' : 'lg:order-2'}
          bg-[#0a0f1f]
        `}
      >
        {/* Subtle border between sections */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

        <div
          className={`
            w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-16
            transition-all duration-1000 delay-200 ease-out
            ${isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isReversed ? '-translate-x-8' : 'translate-x-8'}`}
          `}
        >
          {/* Step number */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#c8a951]/10 border border-[#c8a951]/20 text-[#c8a951] flex items-center justify-center text-lg font-bold">
              {idx + 1}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[#c8a951]/30 to-transparent" />
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-5 tracking-tight leading-tight">
            {section.title}
          </h3>

          {/* Text */}
          <p className="text-white/55 text-base sm:text-lg leading-relaxed max-w-lg">
            {section.text}
          </p>

          {/* Decorative accent */}
          <div className="mt-8 w-16 h-1 rounded-full bg-gradient-to-r from-[#c8a951] to-[#c8a951]/20" />
        </div>
      </div>
    </div>
  );
}
