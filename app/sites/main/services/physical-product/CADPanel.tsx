'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// DATA (images + layout only — text comes from i18n)
// =============================================================================

const stepMeta = [
  { id: '01', image: '/images/A_futuristic_hud_2k_202602191813.jpeg', span: 'md:col-span-2' },
  { id: '02', image: '/images/Highend_3d_cad_2k_202602191815.jpeg', span: '' },
  { id: '03', image: '/images/A_sleek_dark_2k_202602220953.jpeg', span: '' },
  { id: '04', image: '/images/A_stateoftheart_3d_2k_202602191815.jpeg', span: 'md:col-span-2' },
  { id: '05', image: '/images/A_clean_futuristic_2k_202602191813.jpeg', span: 'md:col-span-3' },
];

// =============================================================================
// BENTO CARD
// =============================================================================

interface StepData {
  id: string;
  title: string;
  text: string;
  image: string;
  span: string;
}

function BentoCard({
  step,
  index,
  isFullWidth,
}: {
  step: StepData;
  index: number;
  isFullWidth: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative group overflow-hidden rounded-2xl border border-white/[0.06] cursor-default ${
        isFullWidth ? 'h-[220px] sm:h-[260px]' : 'h-[280px] sm:h-[320px]'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* Background image */}
      <Image
        src={step.image}
        alt={step.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/70 group-hover:via-black/40 transition-all duration-500" />

      {/* Gold border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(200,169,81,0.3), 0 0 20px rgba(200,169,81,0.08)' }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8">
        {/* Step number badge */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
          <div className="w-10 h-10 rounded-xl bg-[#c8a951]/15 border border-[#c8a951]/25 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#c8a951]/25 transition-colors duration-500">
            <span className="text-[#c8a951] font-bold text-sm">{step.id}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#e8d48b] transition-colors duration-300">
          {step.title}
        </h3>

        {/* Description */}
        <p className={`text-white/60 text-sm sm:text-[15px] leading-relaxed group-hover:text-white/70 transition-colors duration-300 ${
          isFullWidth ? 'max-w-xl' : 'max-w-sm'
        }`}>
          {step.text}
        </p>

        {/* Bottom gold accent line */}
        <div className="absolute bottom-0 left-6 right-6 sm:left-8 sm:right-8 h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT — BENTO GRID
// =============================================================================

export default function CADPanel() {
  const { t } = useLanguage();

  const steps: StepData[] = stepMeta.map((meta, i) => ({
    id: meta.id,
    title: t(`service.physical.step${i + 1}.title`),
    text: t(`service.physical.step${i + 1}.text`),
    image: meta.image,
    span: meta.span,
  }));

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a101f] to-[#070b1e]" />

      {/* Section heading */}
      <div className="container-corporate relative z-10 mb-12 sm:mb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block text-[#c8a951] text-sm font-bold uppercase tracking-[0.2em] mb-4"
        >
          {t('service.physical.timeline.tag')}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
        >
          {t('service.physical.timeline.heading')}
        </motion.h2>
      </div>

      {/* Bento Grid */}
      <div className="container-corporate relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, index) => (
            <div key={step.id} className={step.span}>
              <BentoCard
                step={step}
                index={index}
                isFullWidth={step.span === 'md:col-span-3'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/20 to-transparent" />
    </section>
  );
}
