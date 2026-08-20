'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ExternalLink, Newspaper, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import CaseVideo from '@/components/services/CaseVideo';
import { getCaseStudies, getPressItems, type CaseStudy } from '@/lib/case-studies-data';
import { getProductJourney } from '@/lib/product-journeys-data';

interface ServiceCaseStudiesProps {
  serviceId: string;
}

// =============================================================================
// CASE CARD
// =============================================================================

function CaseCard({ caseStudy, index }: { caseStudy: CaseStudy; index: number }) {
  const { lang, dir } = useLanguage();
  const isHe = lang === 'he';
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const title = isHe ? caseStudy.title : caseStudy.titleEn;
  const description = isHe ? caseStudy.description : caseStudy.descriptionEn;
  const process = isHe ? caseStudy.process : caseStudy.processEn;
  const highlight = isHe ? caseStudy.highlight : caseStudy.highlightEn;
  const hasMedia = Boolean(caseStudy.videoId || caseStudy.images?.length);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: Math.min(index, 2) * 0.08 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
    >
      <div className={`grid gap-0 ${hasMedia ? 'lg:grid-cols-2' : ''}`}>
        {/* Media column */}
        {hasMedia && (
          <div className="flex flex-col gap-3 bg-[#050810] p-5 sm:p-6">
            {caseStudy.videoId && <CaseVideo videoId={caseStudy.videoId} title={caseStudy.name} />}

            {caseStudy.images && caseStudy.images.length > 0 && (
              // Ventures carry different numbers of images depending on what
              // actually exists. A lone tile in a 2-column grid reads as a
              // missing image, and 3 tiles leave a hole, so the first image
              // goes full width whenever the count is odd.
              <div className="grid grid-cols-2 gap-3">
                {caseStudy.images.map((src, i) => (
                  <div
                    key={src}
                    className={cn(
                      'relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1321]',
                      caseStudy.images!.length % 2 === 1 && i === 0
                        ? 'col-span-2 aspect-video'
                        : 'aspect-[4/3]',
                    )}
                  >
                    {src.startsWith('/') ? (
                      <Image
                        src={src}
                        alt={`${caseStudy.name} ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 90vw, 45vw"
                        className="object-cover"
                      />
                    ) : (
                      // Press photography stays on the newsroom's own CDN
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={`${caseStudy.name} ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text column */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-[#c8a951]" />
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {caseStudy.name}
            </h3>
          </div>

          <h4 className="text-lg font-semibold bg-gradient-to-r from-[#c8a951] to-[#e8d48b] bg-clip-text text-transparent mb-4">
            {title}
          </h4>

          <p className="text-white/55 leading-relaxed mb-5">{description}</p>

          {/* What we did */}
          <div className="rounded-xl border border-[#c8a951]/20 bg-[#c8a951]/[0.04] p-4 sm:p-5 mb-5">
            <span className="block text-[#c8a951] text-xs font-bold uppercase tracking-[0.2em] mb-2">
              {isHe ? 'הדרך להצלחה' : 'The road to success'}
            </span>
            <p className="text-white/60 text-sm leading-relaxed">{process}</p>
          </div>

          {/* Metrics */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {caseStudy.metrics.map((metric) => (
                <div
                  key={metric.value + metric.label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center"
                >
                  <div className="text-xl font-bold text-white" dir="ltr">
                    {metric.value}
                  </div>
                  <div className="text-[11px] text-white/40 leading-snug mt-1">
                    {isHe ? metric.label : metric.labelEn}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Headline result */}
          {highlight && (
            <div className="flex items-start gap-3 rounded-xl border border-[#c8a951]/25 bg-[#c8a951]/[0.07] px-5 py-4 mb-5">
              <Trophy className="w-5 h-5 text-[#c8a951] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c8a951]/70 mb-1">
                  {isHe ? 'התוצאה' : 'The result'}
                </span>
                <span className="text-white/85 font-semibold leading-snug">{highlight}</span>
              </div>
            </div>
          )}

          {/* Links */}
          {caseStudy.links && caseStudy.links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {caseStudy.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-[#c8a951]/40 hover:text-white"
                >
                  {link.kind === 'press' ? (
                    <Newspaper className="w-3.5 h-3.5" />
                  ) : (
                    <ExternalLink className="w-3.5 h-3.5" />
                  )}
                  {isHe ? link.label : link.labelEn}
                  <DirArrow className="w-3.5 h-3.5 opacity-50" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// =============================================================================
// SERVICE CASE STUDIES — real ventures, shown inside the service page
// =============================================================================

export default function ServiceCaseStudies({ serviceId }: ServiceCaseStudiesProps) {
  const { lang } = useLanguage();
  const isHe = lang === 'he';

  // The ProductJourney above already walks one venture through this service in
  // full. Showing it again as a card would just repeat the same story.
  const journey = getProductJourney(serviceId);
  const cases = getCaseStudies(serviceId).filter((c) => c.id !== journey?.caseId);

  // Likewise, an article already used inside the journey shouldn't reappear below.
  const journeyUrls = new Set(
    (journey?.stages ?? []).flatMap((stage) => (stage.image ? [stage.image] : []))
  );
  const press = getPressItems(serviceId).filter((item) => !journeyUrls.has(item.image));

  if (cases.length === 0 && press.length === 0) return null;

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] to-[#0d1321]" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#c8a951]/[0.035] rounded-full blur-[160px] pointer-events-none" />

      <div className="container-corporate relative z-10">
        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block font-mono text-[#c8a951]/60 text-xs tracking-[0.25em] uppercase mb-4">
            PROOF_OF_WORK
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {isHe ? 'דוגמאות מהשטח' : 'Proof From the Field'}
          </h2>
          <p className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed">
            {isHe
              ? 'מיזמים אמיתיים שליווינו בשירות הזה — מה עשינו, ולאן זה הגיע.'
              : 'Real ventures we accompanied through this service — what we did, and where it landed.'}
          </p>
        </div>

        {/* Case studies */}
        {cases.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            {cases.map((caseStudy, index) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} index={index} />
            ))}
          </div>
        )}

        {/* Press */}
        {press.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <div className="flex items-center gap-3 mb-6">
              <Newspaper className="w-5 h-5 text-[#c8a951]" />
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {isHe ? 'יזמים בכותרות' : 'Founders in the Headlines'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {press.map((item, index) => (
                <motion.a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.06 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-[#c8a951]/30"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* Press thumbnails live on newsroom CDNs — plain img keeps them config-free */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={isHe ? item.title : item.titleEn}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b1e]/80 via-transparent to-transparent" />
                    <span
                      className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg"
                      style={{ backgroundColor: item.sourceColor }}
                    >
                      {item.source}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h4 className="text-base font-bold leading-snug text-white/85 transition-colors group-hover:text-white mb-3">
                      {isHe ? item.title : item.titleEn}
                    </h4>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#c8a951]">
                      {isHe ? 'קראו את הכתבה' : 'Read the article'}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
