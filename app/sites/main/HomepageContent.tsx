'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  MapPin,

  Quote,
  ExternalLink,
} from 'lucide-react';

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { LiveTicker } from '@/components/ui';
import { ServiceEcosystem } from '@/components/sections/ServiceEcosystem';
import { VideoShowcase } from './VideoShowcase';
import { EventsShowcase } from './EventsShowcase';
import { AutoScrollCarousel } from './AutoScrollCarousel';
import { HeroBackground } from './HeroVideo';
import { NavigationButtons, LocationMap } from '@/components/ui/NavigationButtons';
import { TrackedLink } from '@/components/ui/TrackedLink';
import { useLanguage } from '@/lib/i18n';

// =============================================================================
// TYPES
// =============================================================================

interface NewsItem {
  id: string;
  title: string;
  link?: string;
  urgencyLevel: string;
  createdAt: string;
  excerpt?: string;
  isPinned?: boolean;
  imageUrl?: string;
  source?: string;
}

interface EventItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  date: Date;
  time: string | null;
  city: string | null;
  category: string | null;
  imageUrl?: string | null;
}

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  speaker?: string;
  views?: number;
}

interface StoryItem {
  id: string;
  companyName: string;
  quote: string;
  personName: string;
  personRole?: string;
  personImage?: string;
  industry?: string;
  metrics?: Array<{ label: string; value: string }> | { items: Array<{ label: string; value: string }> };
}

interface HomepageContentProps {
  news: NewsItem[];
  events: EventItem[];
  videos: VideoItem[];
  stories: StoryItem[];
}

// =============================================================================
// PARTNERS DATA
// =============================================================================

const partnersLogos = [
  { name: 'Leumit WeCcelerate', logo: '/images/logos/leumit-weccelerate-logo.png' },
  { name: 'Leumit Health Services', logo: '/images/logos/leumit-logo.png' },
  { name: 'Herzog Fox Neeman', logo: '/images/logos/herzog-logo.png' },
  { name: 'Jerusalem Development Authority', logo: '/images/logos/harashut-logo.png' },
  { name: 'Har Hotzvim', logo: '/images/logos/har-hozvim-logo.png' },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HomepageContent({ news, events, videos, stories }: HomepageContentProps) {
  return (
    <div className="bg-[#070b1e] min-h-screen">
      <LiveTicker updates={news} speed={4} pauseOnHover={true} />

      <main id="main-content">
        <HeroSection />
        <ServiceEcosystem />
        <PartnersSection />
        <VideosSection videos={videos} />
        <TestimonialsSection stories={stories} />
        <PressSection articles={news} />
        <NewsSection events={events} />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

// =============================================================================
// HERO SECTION
// =============================================================================

function HeroSection() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <HeroBackground />

      {/* Light overlay only at top for navbar readability */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0a0e27]/80 to-transparent pointer-events-none z-[2]" aria-hidden="true" />
      {/* Bottom gradient where text sits */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#050810] via-[#050810]/90 to-transparent pointer-events-none z-[2]" aria-hidden="true" />
      {/* Extra mobile overlay behind text area for readability */}
      <div className="absolute inset-0 bg-[#050810]/40 md:bg-transparent pointer-events-none z-[2]" aria-hidden="true" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent z-[3]" aria-hidden="true" />

      {/* Spacer — none on mobile (text starts near top), flex on desktop for video */}
      <div className="hidden md:block md:flex-1" />

      {/* Text content — top on mobile, bottom on desktop */}
      <div className="relative z-10 container-corporate w-full pt-16 pb-8 md:pt-8 md:pb-24">
        {/* Mobile: centered. Desktop: right in RTL, left in LTR — away from video center */}
        <div className="max-w-3xl mx-auto text-center md:mx-0 md:me-auto md:text-start md:max-w-lg lg:max-w-xl">
          <div className="hero-fade-in inline-flex items-center gap-3 bg-white/[0.06] backdrop-blur-md border border-white/[0.10] rounded-full px-5 py-2.5 mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8a951] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c8a951]" />
            </span>
            <span className="text-white/70 text-sm font-medium tracking-wide">
              {t('hero.badge')}
            </span>
          </div>

          <h1
            data-speakable
            className="hero-fade-in-delay-1 text-3xl sm:text-4xl md:text-[2.5rem] lg:text-5xl font-bold tracking-tight mb-4 leading-[1.15]"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7)' }}
          >
            <span className="bg-gradient-to-r from-[#e8d48b] to-[#c8a951] bg-clip-text text-transparent" dir="ltr">{t('hero.title1')}</span>
            <br />
            <span className="text-white">{t('hero.title2')}</span>
            <br />
            <span className="text-white/95">{t('hero.title3')}</span>
            <br />
            <span className="text-white/95">{t('hero.title4')}</span>
          </h1>

          <p
            data-speakable
            className="hero-fade-in-delay-2 text-base sm:text-lg md:text-base lg:text-lg text-white/70 mb-8 max-w-xl leading-relaxed"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}
          >
            {t('hero.subtitle.prefix')}{' '}
            <span className="text-white/85">{t('hero.subtitle.tech')}</span>,{' '}
            <span className="text-white/85">{t('hero.subtitle.capital')}</span>{' '}
            {dir === 'rtl' ? 'ו' : '& '}
            <span className="text-white/85">{t('hero.subtitle.partnerships')}</span>.
          </p>

          <div className="hero-fade-in-delay-3 flex flex-col sm:flex-row gap-4 items-center md:items-start justify-center md:justify-start">
            <Link
              href="/services"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 md:px-9 md:py-4 text-base font-bold gold-glow hover:scale-[1.03] transition-all duration-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:ring-offset-2 focus:ring-offset-[#050810]"
            >
              {t('hero.cta1')}
              <DirArrow className={`w-5 h-5 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 hero-fade-in-delay-4 z-10" aria-hidden="true">
        <span className="text-white/25 text-[11px] tracking-[0.25em] uppercase">{t('hero.scroll')}</span>
        <div className="w-px h-8 bg-white/[0.08] relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-b from-[#c8a951] to-transparent animate-scroll-line" />
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PARTNERS
// =============================================================================

function PartnersSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Dark background matching the logo images */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Subtle top/bottom gold accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c8a951]/20 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c8a951]/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="blur">
          {/* Section heading */}
          <p className="text-center text-[#c8a951]/70 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] mb-14">
            {t('sections.partners')}
          </p>

          {/* Logo grid — responsive: 2 cols mobile, 3 cols tablet, 4-5 cols desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 max-w-6xl mx-auto">
            {partnersLogos.map((partner, i) => (
              <div
                key={partner.name}
                className="group relative flex items-center justify-center rounded-xl overflow-hidden cursor-default transition-all duration-300 ease-in-out hover:scale-[1.05]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(200,169,81,0.08), 0 0 40px rgba(200,169,81,0.06)',
                  }}
                />

                {/* Logo image — dark bg blends seamlessly */}
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={280}
                  height={160}
                  className="relative w-full h-auto object-contain rounded-xl brightness-90 group-hover:brightness-110 transition-all duration-300 ease-in-out"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// =============================================================================
// VIDEOS SECTION
// =============================================================================

function VideosSection({ videos }: { videos: VideoItem[] }) {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0d1321] to-[#070b1e]" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#c8a951]/[0.03] rounded-full blur-[150px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="right">
          <div className="mb-14 sm:mb-16">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              {t('sections.videos.tag')}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {t('sections.videos.title')}
            </h2>
          </div>
        </ScrollReveal>
        <ScrollReveal variant="scale">
          <VideoShowcase videos={videos} />
        </ScrollReveal>
      </div>
    </section>
  );
}

// =============================================================================
// TESTIMONIALS
// =============================================================================

function TestimonialsSection({ stories }: { stories: StoryItem[] }) {
  const { t } = useLanguage();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0a1025] to-[#070b1e]" />
      <div className="container-corporate relative z-10">
        <ScrollReveal variant="left">
          <div className="text-center mb-16">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              {t('sections.testimonials.tag')}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {t('sections.testimonials.title')}
            </h2>
          </div>
        </ScrollReveal>

        <AutoScrollCarousel speed={30}>
          {stories.map((story) => {
            const metrics = Array.isArray(story.metrics)
              ? story.metrics
              : story.metrics && 'items' in story.metrics
                ? story.metrics.items
                : [];
            return (
              <div key={story.id} className="glass-card p-8 w-[300px] sm:w-[400px] flex-shrink-0 snap-center">
                <Quote className="w-8 h-8 text-gold-500/30 mb-4" />
                <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-4">
                  &ldquo;{story.quote}&rdquo;
                </p>
                {metrics.length > 0 && (
                  <div className="flex gap-4 mb-6 pb-6 border-b border-white/5">
                    {metrics.slice(0, 3).map((m) => (
                      <div key={m.label}>
                        <p className="text-lg font-bold text-gold-400" dir="ltr">{m.value}</p>
                        <p className="text-xs text-white/60">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8a951]/25 to-[#e8d48b]/10 border border-[#c8a951]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#c8a951] font-bold text-xs">
                      {story.personName.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{story.personName}</p>
                    <p className="text-white/60 text-xs">
                      {story.personRole} · {story.companyName}
                    </p>
                  </div>
                </div>
                {story.industry && (
                  <div className="mt-4">
                    <span className="inline-block bg-white/5 text-white/60 text-xs px-3 py-1 rounded-full">
                      {story.industry}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </AutoScrollCarousel>
      </div>
    </section>
  );
}

// =============================================================================
// PRESS COVERAGE
// =============================================================================

function PressSection({ articles }: { articles: NewsItem[] }) {
  const { t, lang, dir } = useLanguage();
  const pressArticles = articles.filter(a => a.imageUrl && a.link);
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 3;

  if (pressArticles.length === 0) return null;

  const visibleArticles = showAll ? pressArticles : pressArticles.slice(0, INITIAL_COUNT);
  const hasMore = pressArticles.length > INITIAL_COUNT;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0d1321] to-[#070b1e]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="right">
          <div className="mb-12 sm:mb-16">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              {t('sections.press.tag')}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {t('sections.press.title')}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visibleArticles.map((article, idx) => (
            <ScrollReveal key={article.id} delay={idx * 80} variant="scale">
              <a href={article.link} target="_blank" rel="noopener noreferrer" className="group block h-full">
                <div className="relative h-full rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0f1e]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-60" />
                    {article.source && (
                      <div className="absolute top-3 end-3">
                        <span className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
                          {article.source}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="text-white/40 text-xs font-medium mb-2">{formatDate(article.createdAt)}</p>
                    <h3 className="text-white font-bold text-base sm:text-lg leading-snug mb-3 line-clamp-2 group-hover:text-gold-300 transition-colors duration-300">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-gold-400 text-sm font-semibold group-hover:text-gold-300 transition-colors">
                      {t('sections.press.readMore')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </a>
            </ScrollReveal>
          ))}
        </div>

        {hasMore && !showAll && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-8 py-3 font-medium hover:bg-white/5 hover:border-white/30 transition-all rounded-sm"
            >
              {t('sections.press.showMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// =============================================================================
// NEWS / EVENTS
// =============================================================================

function NewsSection({ events }: { events: EventItem[] }) {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] to-[#0d1321]" />
      <div className="container-corporate relative z-10">
        <ScrollReveal variant="right">
          <div className="flex items-end justify-between mb-12 sm:mb-16">
            <div>
              <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                {t('sections.events.tag')}
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                {t('sections.events.title')}
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden md:inline-flex items-center gap-2 text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors group"
            >
              {t('sections.events.all')}
              <DirArrow className={`w-4 h-4 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scale">
          <EventsShowcase events={events} />
        </ScrollReveal>

        <div className="md:hidden text-center mt-8">
          <Link href="/events" className="inline-flex items-center gap-2 text-gold-400 font-semibold text-sm">
            {t('sections.events.allMobile')}
            <DirArrow className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// CTA SECTION
// =============================================================================

function CTASection() {
  const { t, dir } = useLanguage();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="container-corporate relative z-10 text-center">
        <ScrollReveal variant="blur">
          <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-6">
            {t('sections.cta.tag')}
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {t('sections.cta.title1')}
            <br />
            <span className="text-gold-gradient">{t('sections.cta.title2')}</span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('sections.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/contact?source=apply"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 text-lg font-bold gold-glow hover:scale-[1.03] transition-all duration-300 rounded-sm"
            >
              {t('sections.cta.apply')}
              <DirArrow className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/30 transition-all rounded-sm"
            >
              {t('sections.cta.contact')}
            </Link>
          </div>

          <div className="mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gold-400/70 hover:text-gold-400 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('sections.cta.portalLogin')}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
            <TrackedLink
              trackAction="click.phone"
              trackMeta={{ location: 'homepage-cta' }}
              href="tel:+972555647538"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
              aria-label={`${t('sections.cta.call')}: 055-564-7538`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span dir="ltr">055-564-7538</span>
            </TrackedLink>
            <TrackedLink
              trackAction="click.email"
              trackMeta={{ location: 'homepage-cta' }}
              href="mailto:info@weccelerate.co.il"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
              aria-label={`${t('sections.cta.email')}: info@weccelerate.co.il`}
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span dir="ltr">info@weccelerate.co.il</span>
            </TrackedLink>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>{t('footer.address')}</span>
            </span>
            <NavigationButtons variant="dark" size="sm" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER
// =============================================================================

function Footer() {
  const { t, dir } = useLanguage();

  const footerLinks = {
    company: [
      { name: t('footer.about'), href: '/about' },
      { name: t('footer.team'), href: '/team' },
      { name: t('footer.contact'), href: '/contact' },
      { name: t('footer.portalLogin'), href: '/login' },
    ],
    services: [
      { name: t('footer.consulting'), href: '/services/business-consulting' },
      { name: t('footer.physical'), href: '/services/physical-product' },
      { name: t('footer.digital'), href: '/services/digital-product' },
      { name: t('footer.marketing'), href: '/services/marketing' },
      { name: t('footer.medtech'), href: '/services/medtech-leumit' },
      { name: t('footer.investors'), href: '/services/investors' },
      { name: t('footer.investorPrep'), href: '/services/investor-preparation' },
    ],
    resources: [
      { name: t('footer.events'), href: '/events' },
      { name: t('footer.blog'), href: '/blog' },
      { name: t('footer.videos'), href: '/videos' },
      { name: t('footer.mvpCalc'), href: '/tools/mvp-calculator' },
    ],
  };

  return (
    <footer className="relative bg-[#050810] border-t border-white/5" role="contentinfo">
      <div className="container-corporate py-16 sm:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Image
                src="/images/logos/weccelerate-logo-wide.jpeg"
                alt="WeCcelerate"
                width={240}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-white/60 max-w-sm mb-8 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-2.5 mb-6">
              <a href="https://www.linkedin.com/company/weccelerate" target="_blank" rel="noopener noreferrer" aria-label={t('footer.linkedin')} className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] text-white/60 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://www.facebook.com/weccelerate" target="_blank" rel="noopener noreferrer" aria-label={t('footer.facebook')} className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#1877F2]/20 hover:text-[#1877F2] text-white/60 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="https://www.instagram.com/weccelerate" target="_blank" rel="noopener noreferrer" aria-label={t('footer.instagram')} className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#E4405F]/20 hover:text-[#E4405F] text-white/60 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" /></svg>
              </a>
              <a href="https://www.tiktok.com/@weccelerate" target="_blank" rel="noopener noreferrer" aria-label={t('footer.tiktok')} className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-white/15 hover:text-white text-white/60 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
              </a>
              <a href="https://www.youtube.com/@WeCcelerate.Ltd1" target="_blank" rel="noopener noreferrer" aria-label={t('footer.youtube')} className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#FF0000]/20 hover:text-[#FF0000] text-white/60 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
            <div className="space-y-3">
              <p className="text-white/60 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                {t('footer.address')}
              </p>
              <NavigationButtons variant="dark" size="sm" />
              <LocationMap variant="dark" height="180px" className="mt-4" />
            </div>
          </div>

          <nav aria-label={t('footer.companyLinks')}>
            <h4 className="font-semibold text-white text-sm mb-5">{t('footer.company')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-400 transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.servicesLinks')}>
            <h4 className="font-semibold text-white text-sm mb-5">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-400 transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.contentLinks')}>
            <h4 className="font-semibold text-white text-sm mb-5">{t('footer.content')}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-400 transition-colors text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} WeCcelerate Ltd. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">{t('footer.terms')}</Link>
            <Link href="/accessibility" className="hover:text-white/70 transition-colors">{t('footer.accessibility')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
