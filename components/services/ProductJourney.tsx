'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import CaseVideo from '@/components/services/CaseVideo';
import { getProductJourney } from '@/lib/product-journeys-data';

interface ProcessStep {
  title: string;
  text: string;
}

interface ProductJourneyProps {
  serviceId: string;
  /** The service's own process copy, kept alongside the real-product journey */
  processSteps?: ProcessStep[];
  processHeading?: string;
}

export default function ProductJourney({
  serviceId,
  processSteps,
  processHeading,
}: ProductJourneyProps) {
  const { lang, dir } = useLanguage();
  const isHe = lang === 'he';
  const isRtl = dir === 'rtl';
  const [active, setActive] = useState(0);

  const journey = getProductJourney(serviceId);
  if (!journey) return null;

  const stages = journey.stages;
  const stage = stages[active];
  const isExternalImage = Boolean(stage.image && !stage.image.startsWith('/'));
  const isContain = stage.fit === 'contain';

  // In RTL the visual "forward" arrow points left
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const go = (delta: number) =>
    setActive((current) => Math.min(stages.length - 1, Math.max(0, current + delta)));

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a101f] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block font-mono text-[#c8a951]/60 text-xs tracking-[0.25em] uppercase mb-4">
            {isHe ? 'מקרה אמיתי' : 'A REAL CASE'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            {isHe ? `${journey.name} — שלב אחרי שלב` : `${journey.name} — step by step`}
          </h2>
          <p className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
            {isHe ? journey.tagline : journey.taglineEn}
          </p>
        </div>

        {/* Stepper */}
        <div className="relative mb-8 sm:mb-10">
          <div className="absolute top-5 inset-x-0 h-px bg-white/10" aria-hidden="true" />
          <ol className="relative grid grid-flow-col auto-cols-fr gap-1 sm:gap-2">
            {stages.map((s, index) => {
              const isActive = index === active;
              const isDone = index < active;
              return (
                <li key={s.label} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-current={isActive ? 'step' : undefined}
                    className="group flex flex-col items-center gap-2 w-full"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300 ${
                        isActive
                          ? 'border-[#c8a951] bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] scale-110 shadow-lg shadow-[#c8a951]/25'
                          : isDone
                            ? 'border-[#c8a951]/40 bg-[#c8a951]/10 text-[#c8a951]'
                            : 'border-white/15 bg-[#0d1321] text-white/40 group-hover:border-white/30 group-hover:text-white/70'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-center leading-tight transition-colors ${
                        isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    >
                      {isHe ? s.label : s.labelEn}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Active stage */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2"
            >
              {/* Media */}
              <div className="bg-[#050810] p-5 sm:p-6 flex items-center">
                {stage.videoId ? (
                  <div className="w-full">
                    <CaseVideo videoId={stage.videoId} title={journey.name} />
                  </div>
                ) : stage.image ? (
                  // Product cutouts sit on a light tile so they read as a catalogue
                  // shot; photographs fill the frame.
                  <div
                    className={`relative w-full aspect-video overflow-hidden rounded-xl border ${
                      isContain
                        ? 'border-white/15 bg-gradient-to-br from-white to-[#e9ecf3] p-5'
                        : 'border-white/10 bg-[#0d1321]'
                    }`}
                  >
                    {isExternalImage ? (
                      // Press images live on newsroom CDNs, outside next/image's allowed hosts
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stage.image}
                        alt={isHe ? stage.title : stage.titleEn}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={stage.image}
                        alt={isHe ? stage.title : stage.titleEn}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        loading="eager"
                        className={isContain ? 'object-contain p-4' : 'object-cover'}
                      />
                    )}
                  </div>
                ) : (
                  // No photograph exists for this stage — a designed card, not stock art
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-[#c8a951]/15 bg-[#070b1e] flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: '32px 32px',
                      }}
                    />
                    <span className="relative font-mono text-6xl sm:text-7xl font-bold text-[#c8a951]/25">
                      {String(active + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Copy */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
                <span className="text-[#c8a951] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                  {isHe ? `שלב ${active + 1} מתוך ${stages.length}` : `Stage ${active + 1} of ${stages.length}`}
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                  {isHe ? stage.title : stage.titleEn}
                </h3>

                <p className="text-white/55 leading-relaxed mb-6">
                  {isHe ? stage.text : stage.textEn}
                </p>

                {stage.metric && (
                  <div className="inline-flex items-baseline gap-3 self-start rounded-xl border border-[#c8a951]/25 bg-[#c8a951]/[0.06] px-5 py-3 mb-6">
                    <span className="text-2xl font-bold text-[#c8a951]" dir="ltr">
                      {stage.metric}
                    </span>
                    <span className="text-sm text-white/45">
                      {isHe ? stage.metricLabel : stage.metricLabelEn}
                    </span>
                  </div>
                )}

                {/* Prev / next */}
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    disabled={active === 0}
                    aria-label={isHe ? 'שלב קודם' : 'Previous stage'}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/60 transition-all hover:border-[#c8a951]/40 hover:text-white disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:text-white/60"
                  >
                    <PrevIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    disabled={active === stages.length - 1}
                    aria-label={isHe ? 'השלב הבא' : 'Next stage'}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#c8a951] to-[#e8d48b] px-5 h-10 font-bold text-[#070b1e] transition-transform hover:scale-[1.03] disabled:opacity-25 disabled:hover:scale-100"
                  >
                    {isHe ? 'השלב הבא' : 'Next stage'}
                    <NextIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The service's own process steps — kept, minus the stock imagery */}
        {processSteps && processSteps.length > 0 && (
          <div className="mt-14 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
              {processHeading || (isHe ? 'התהליך המלא' : 'The full process')}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8a951]/10 border border-[#c8a951]/20 text-[#c8a951] text-xs font-bold mb-3">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-white/45 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
