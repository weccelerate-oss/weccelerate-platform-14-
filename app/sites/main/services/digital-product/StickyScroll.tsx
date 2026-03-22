'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TIMELINE DATA (images only — text comes from i18n)
// =============================================================================

const stepImages = [
  '/images/A_dark_modern_2k_202602191814.jpeg',
  '/images/Abstract_software_architecture_2k_20260219181.jpeg',
  '/images/Closeup_of_a_2k_202602191813.jpeg',
  '/images/A_glowing_smartphone_2k_202602191814.jpeg',
];

// =============================================================================
// TIMELINE CARD
// =============================================================================

interface StepData {
  number: number;
  title: string;
  text: string;
  highlights: string[];
  image: string;
}

function TimelineCard({
  step,
  index,
}: {
  step: StepData;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;

  return (
    <div
      className={`relative flex items-center w-full ${
        isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
      } flex-col lg:gap-0 gap-6`}
    >
      {/* Card */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40, x: isLeft ? 30 : -30 }}
        animate={
          isInView
            ? { opacity: 1, y: 0, x: 0 }
            : { opacity: 0, y: 40, x: isLeft ? 30 : -30 }
        }
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`w-full lg:w-[calc(50%-40px)] ${
          isLeft ? 'lg:ml-0 lg:mr-auto' : 'lg:mr-0 lg:ml-auto'
        }`}
      >
        <div
          className={`relative bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm rounded-xl overflow-hidden
          hover:bg-white/[0.05] hover:border-[#c8a951]/20 transition-all duration-500 group`}
        >
          {/* Connector arrow (desktop only) */}
          <div
            className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white/[0.03] border border-white/[0.08] rotate-45 z-20
              group-hover:border-[#c8a951]/20 transition-colors duration-500
              ${isLeft ? '-left-2 border-r-0 border-t-0' : '-right-2 border-l-0 border-b-0'}`}
            style={{
              [isLeft ? 'borderRight' : 'borderLeft']: 'none',
              [isLeft ? 'borderTop' : 'borderBottom']: 'none',
            }}
          />

          {/* Card image */}
          <div className="relative h-40 sm:h-48 w-full overflow-hidden">
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/70 to-transparent" />
            <div className="absolute inset-0 bg-[#c8a951]/[0.03] group-hover:bg-[#c8a951]/[0.08] transition-colors duration-500" />
          </div>

          {/* Card content */}
          <div className="p-8 pt-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c8a951] to-[#e8d48b] flex items-center justify-center shrink-0 shadow-lg shadow-[#c8a951]/20">
                <span className="text-[#070b1e] font-bold text-lg">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#e8d48b] transition-colors duration-300">
                {step.title}
              </h3>
            </div>

            <p className="text-white/50 leading-relaxed mb-5 text-[15px]">
              {step.text}
            </p>

            <div className="flex flex-wrap gap-2">
              {step.highlights.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-[#c8a951]/10 text-[#c8a951] rounded-full border border-[#c8a951]/15 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom glow on hover */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        </div>
      </motion.div>

      {/* Center node (desktop) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#c8a951] border-4 border-[#070b1e] z-10 shadow-lg shadow-[#c8a951]/30"
      />

      {/* Mobile node */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="lg:hidden w-4 h-4 rounded-full bg-[#c8a951] border-[3px] border-[#070b1e] shadow-lg shadow-[#c8a951]/30 absolute right-0 top-0 translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT — SCROLL-REVEAL TIMELINE
// =============================================================================

export default function StickyScroll() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const steps: StepData[] = [
    {
      number: 1,
      title: t('service.digital.step1.title'),
      text: t('service.digital.step1.text'),
      highlights: [t('service.digital.step1.h1'), t('service.digital.step1.h2'), t('service.digital.step1.h3'), t('service.digital.step1.h4')],
      image: stepImages[0],
    },
    {
      number: 2,
      title: t('service.digital.step2.title'),
      text: t('service.digital.step2.text'),
      highlights: [t('service.digital.step2.h1'), t('service.digital.step2.h2'), t('service.digital.step2.h3'), t('service.digital.step2.h4')],
      image: stepImages[1],
    },
    {
      number: 3,
      title: t('service.digital.step3.title'),
      text: t('service.digital.step3.text'),
      highlights: [t('service.digital.step3.h1'), t('service.digital.step3.h2'), t('service.digital.step3.h3'), t('service.digital.step3.h4')],
      image: stepImages[2],
    },
    {
      number: 4,
      title: t('service.digital.step4.title'),
      text: t('service.digital.step4.text'),
      highlights: [t('service.digital.step4.h1'), t('service.digital.step4.h2'), t('service.digital.step4.h3'), t('service.digital.step4.h4')],
      image: stepImages[3],
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-20 sm:py-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />

      {/* Section heading */}
      <div className="container-corporate relative z-10 mb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block text-[#c8a951] text-sm font-bold uppercase tracking-[0.2em] mb-4"
        >
          {t('service.digital.timeline.tag')}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
        >
          {t('service.digital.timeline.heading')}
        </motion.h2>
      </div>

      <div className="container-corporate relative z-10">
        {/* Desktop: Central timeline line */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px">
          <div className="absolute inset-0 bg-white/[0.06]" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#c8a951] to-[#e8d48b] shadow-[0_0_15px_rgba(200,169,81,0.4)]"
          />
        </div>

        {/* Mobile: Right timeline line */}
        <div className="lg:hidden absolute right-6 top-0 bottom-0 w-px">
          <div className="absolute inset-0 bg-white/[0.06]" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#c8a951] to-[#e8d48b] shadow-[0_0_10px_rgba(200,169,81,0.3)]"
          />
        </div>

        {/* Timeline cards */}
        <div className="relative space-y-16 lg:space-y-20 lg:pr-0 pr-10">
          {steps.map((step, index) => (
            <TimelineCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* End node */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex mx-auto mt-16 w-12 h-12 rounded-full bg-gradient-to-br from-[#c8a951] to-[#e8d48b] items-center justify-center shadow-lg shadow-[#c8a951]/30"
        >
          <svg className="w-6 h-6 text-[#070b1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/20 to-transparent" />
    </section>
  );
}
