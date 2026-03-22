'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { HeartPulse, Database, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// DATA (images + icons only — text comes from i18n)
// =============================================================================

const stepMeta = [
  { icon: HeartPulse, image: '/images/Abstract_digital_health_2k_202602191814.jpeg' },
  { icon: Database, image: '/images/A_futuristic_medical_2k_202602191815.jpeg' },
  { icon: ShieldCheck, image: '/images/A_holographic_glowing_2k_202602191814.jpeg' },
];

// =============================================================================
// TIMELINE CARD
// =============================================================================

interface StepData {
  number: number;
  title: string;
  text: string;
  icon: React.ElementType;
  highlights: string[];
  image: string;
}

function TimelineCard({
  step,
  index,
  totalSteps,
  stepLabel,
}: {
  step: StepData;
  index: number;
  totalSteps: number;
  stepLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = index % 2 === 0;
  const StepIcon = step.icon;

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
          hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all duration-500 group`}
        >
          {/* Connector arrow (desktop only) */}
          <div
            className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white/[0.03] border border-white/[0.08] rotate-45 z-20
              group-hover:border-cyan-500/20 transition-colors duration-500
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#040B16] via-[#040B16]/70 to-transparent" />
            <div className="absolute inset-0 bg-cyan-500/[0.03] group-hover:bg-cyan-500/[0.08] transition-colors duration-500" />
          </div>

          {/* Card content */}
          <div className="p-8 pt-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                <StepIcon className="w-5 h-5 text-[#040B16]" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#D4AF37]">
                  {stepLabel} {step.number} / {totalSteps}
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                  {step.title}
                </h3>
              </div>
            </div>

            <p className="text-white/50 leading-relaxed mb-5 text-[15px]">
              {step.text}
            </p>

            <div className="flex flex-wrap gap-2">
              {step.highlights.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/15 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom glow on hover */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        </div>
      </motion.div>

      {/* Center node (desktop) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-cyan-500 border-4 border-[#040B16] z-10 shadow-lg shadow-cyan-500/30"
      />

      {/* Mobile node */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="lg:hidden w-4 h-4 rounded-full bg-cyan-500 border-[3px] border-[#040B16] shadow-lg shadow-cyan-500/30 absolute right-0 top-0 translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT — SCROLL-REVEAL TIMELINE
// =============================================================================

export default function BioScanPanel() {
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
      title: t('service.medtech.step1.title'),
      text: t('service.medtech.step1.text'),
      icon: stepMeta[0].icon,
      highlights: [t('service.medtech.step1.h1'), t('service.medtech.step1.h2'), t('service.medtech.step1.h3')],
      image: stepMeta[0].image,
    },
    {
      number: 2,
      title: t('service.medtech.step2.title'),
      text: t('service.medtech.step2.text'),
      icon: stepMeta[1].icon,
      highlights: [t('service.medtech.step2.h1'), t('service.medtech.step2.h2'), t('service.medtech.step2.h3')],
      image: stepMeta[1].image,
    },
    {
      number: 3,
      title: t('service.medtech.step3.title'),
      text: t('service.medtech.step3.text'),
      icon: stepMeta[2].icon,
      highlights: [t('service.medtech.step3.h1'), t('service.medtech.step3.h2'), t('service.medtech.step3.h3')],
      image: stepMeta[2].image,
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative py-20 sm:py-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#040B16] via-[#060E1A] to-[#040B16]" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[300px] bg-[#D4AF37]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* Section heading */}
      <div className="container-corporate relative z-10 mb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block text-cyan-400 text-sm font-bold uppercase tracking-[0.2em] mb-4"
        >
          {t('service.medtech.timeline.tag')}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
        >
          {t('service.medtech.timeline.heading')}
        </motion.h2>
      </div>

      <div className="container-corporate relative z-10">
        {/* Desktop: Central timeline line */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px">
          <div className="absolute inset-0 bg-white/[0.06]" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-cyan-500 to-[#D4AF37] shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          />
        </div>

        {/* Mobile: Right timeline line */}
        <div className="lg:hidden absolute right-6 top-0 bottom-0 w-px">
          <div className="absolute inset-0 bg-white/[0.06]" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-cyan-500 to-[#D4AF37] shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          />
        </div>

        {/* Timeline cards */}
        <div className="relative space-y-16 lg:space-y-20 lg:pr-0 pr-10">
          {steps.map((step, index) => (
            <TimelineCard
              key={step.number}
              step={step}
              index={index}
              totalSteps={steps.length}
              stepLabel={t('service.medtech.timeline.stepLabel')}
            />
          ))}
        </div>

        {/* End node */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex mx-auto mt-16 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-[#D4AF37] items-center justify-center shadow-lg shadow-cyan-500/30"
        >
          <svg className="w-6 h-6 text-[#040B16]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      </div>

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </section>
  );
}
