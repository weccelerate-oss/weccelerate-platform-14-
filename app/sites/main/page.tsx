/**
 * WeCcelerate Main Homepage — Premium Dark Luxury Design (Hebrew-First)
 *
 * Design System:
 * - Deep midnight blue gradients
 * - Metallic Gold / Brass accents
 * - Dark glassmorphism cards
 * - Scroll-triggered reveal animations
 * - Hebrew-first (RTL) with English brand elements
 */

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Play,
  Quote,
  ExternalLink,
} from 'lucide-react';

// Components
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { LiveTicker } from '@/components/ui';
import { ServiceEcosystem } from '@/components/sections/ServiceEcosystem';
import { VideoShowcase } from './VideoShowcase';
import { EventsShowcase } from './EventsShowcase';
import { HeroBackground } from './HeroVideo';
import { NavigationButtons, LocationMap } from '@/components/ui/NavigationButtons';

// Mock data
import {
  mockNewsUpdates,
  mockEvents,
  mockVideos,
  mockSuccessStories,
} from '@/lib/mock-data';

// SEO
import { constructMetadata } from '@/lib/seo/metadata';

// =============================================================================
// DATABASE FETCHING
// =============================================================================

async function getEventsFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' },
      take: 6,
    });
    return events.length > 0 ? events : mockEvents;
  } catch {
    return mockEvents;
  }
}

async function getNewsFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const dbNews = await prisma.newsUpdate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (dbNews.length === 0) return mockNewsUpdates;

    return dbNews.map(news => ({
      id: news.id,
      title: news.title,
      link: news.link || undefined,
      urgencyLevel: news.urgencyLevel.toLowerCase() as 'normal' | 'important' | 'breaking',
      createdAt: news.createdAt.toISOString(),
      excerpt: news.excerpt || undefined,
      isPinned: news.isPinned,
    }));
  } catch {
    return mockNewsUpdates;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://i.ytimg.com/vi/${watchMatch[1]}/hqdefault.jpg`;
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return `https://i.ytimg.com/vi/${shortMatch[1]}/hqdefault.jpg`;
  const embedMatch = url.match(/\/embed\/([^?]+)/);
  if (embedMatch) return `https://i.ytimg.com/vi/${embedMatch[1]}/hqdefault.jpg`;
  return null;
}

async function getVideosFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const dbVideos = await prisma.video.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (dbVideos.length === 0) return mockVideos;

    return dbVideos.map(video => {
      const videoUrl = video.youtubeUrl || video.vimeoUrl || video.videoUrl || video.embedUrl || '';
      return {
        id: video.id,
        title: video.title,
        description: video.description || undefined,
        category: video.category.toLowerCase() as 'interview' | 'summary' | 'webinar' | 'tutorial' | 'testimonial' | 'highlight',
        videoUrl,
        thumbnail: video.thumbnail || getYouTubeThumbnail(videoUrl) || undefined,
        duration: video.duration || undefined,
        publishedAt: video.publishAt?.toISOString() || video.createdAt.toISOString(),
        views: video.views || undefined,
        speaker: video.speaker || undefined,
        isFeatured: video.isFeatured,
        tags: video.tags || [],
      };
    });
  } catch {
    return mockVideos;
  }
}

async function getSuccessStoriesFromDB() {
  try {
    const { prisma } = await import('@/lib/db');
    const dbStories = await prisma.successStory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      take: 10,
    });

    if (dbStories.length === 0) return mockSuccessStories;

    return dbStories.map(story => ({
      id: story.id,
      companyName: story.companyName,
      logoUrl: story.logoUrl || undefined,
      industry: story.industry || undefined,
      website: story.website || undefined,
      quote: story.quote,
      personName: story.personName,
      personRole: story.personRole || undefined,
      personImage: story.personImage || undefined,
      metrics: story.metrics as { items: Array<{ label: string; value: string }> } | undefined,
      projectLink: story.projectLink || undefined,
      isFeatured: story.isFeatured,
    }));
  } catch {
    return mockSuccessStories;
  }
}

// =============================================================================
// PAGE METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'WeCcelerate | וויסלרייט - Venture Builder & Startup Accelerator Israel',
  description: 'WeCcelerate (וויסלרייט) — Venture Builder ישראלי מוביל. בונים ומאיצים סטארטאפים בכל תחום טכנולוגי: Apps, SaaS, Consumer, MedTech ועוד. ליווי מלא משלב הרעיון ועד האקזיט.',
  siteKey: 'main',
  path: '/',
  keywords: [
    'Venture Builder Israel',
    'Startup Accelerator',
    'וויסלרייט',
    'WeCcelerate',
    'האצת סטארטאפים',
    'פיתוח MVP',
    'ליווי יזמים',
    'Medical Accelerator',
    'Innovation Hub Tel Aviv',
  ],
});

// =============================================================================
// DATA (Hebrew)
// =============================================================================


const partners = [
  { name: 'לאומית שירותי בריאות' },
  { name: 'אפריקה ישראל' },
  { name: 'הרצוג פוקס נאמן' },
];



// =============================================================================
// HERO SECTION — Full Viewport Premium with Video Background
// =============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Layers: 1) Video+poster bg  2) Light overlay  3) Content (z-10) */}

      {/* Background — client component handles mobile/desktop switch */}
      <HeroBackground />

      {/* Light overlay for text readability */}
      <div className="absolute inset-0 bg-[#050810]/30 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/40 via-transparent to-[#050810]/50 pointer-events-none" aria-hidden="true" />

      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" aria-hidden="true" />

      {/* 5) Content — z-10 ensures it's above all background layers */}
      <div className="relative z-10 container-corporate w-full py-24 md:py-36">
        <div className="max-w-5xl">
          {/* Animated Badge */}
          <div className="hero-fade-in inline-flex items-center gap-3 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-full px-5 py-2.5 mb-10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8a951] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c8a951]" />
            </span>
            <span className="text-white/60 text-sm font-medium tracking-wide">
              Venture Builder & Startup Accelerator
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-fade-in-delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold tracking-tight mb-8 leading-[0.92]">
            <span className="text-gold-gradient" dir="ltr">WeCcelerate:</span>
            <br />
            <span className="text-white">בונים את המיזמים</span>
            <br />
            <span className="text-white/90">של המחר.</span>
          </h1>

          {/* Subtitle with keyword highlights */}
          <p className="hero-fade-in-delay-2 text-xl sm:text-2xl md:text-3xl text-white/60 mb-14 max-w-2xl leading-relaxed font-light">
            מאיצים צמיחה דרך{' '}
            <span className="text-white/70">טכנולוגיה</span>,{' '}
            <span className="text-white/70">הון</span>{' '}
            ו<span className="text-white/70">שותפויות אסטרטגיות</span>.
          </p>

          {/* Dual CTA */}
          <div className="hero-fade-in-delay-3 flex flex-col sm:flex-row gap-4 items-start">
            <Link
              href="/apply"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-10 py-5 text-lg font-bold gold-glow hover:scale-[1.03] transition-all duration-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#c8a951] focus:ring-offset-2 focus:ring-offset-[#050810]"
            >
              גלו את התוכניות שלנו
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 border border-white/[0.12] text-white/70 px-10 py-5 text-lg font-medium hover:bg-white/[0.05] hover:text-white hover:border-white/[0.2] transition-all duration-300 rounded-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#050810]"
            >
              <Play className="w-5 h-5 text-[#c8a951]" aria-hidden="true" />
              צפו בסרטון
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050810] to-transparent pointer-events-none z-10" aria-hidden="true" />

      {/* Scroll Indicator — Animated Gold Line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 hero-fade-in-delay-4 z-10" aria-hidden="true">
        <span className="text-white/25 text-[11px] tracking-[0.25em] uppercase">גלול</span>
        <div className="w-px h-8 bg-white/[0.08] relative overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-b from-[#c8a951] to-transparent animate-scroll-line" />
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PARTNERS — Minimal Logo Bar (Hebrew)
// =============================================================================

function PartnersSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[#070b1e]" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="blur">
          <p className="text-center text-white/60 text-xs sm:text-sm font-medium uppercase tracking-[0.25em] mb-12">
            בשיתוף פעולה עם מובילי התעשייה
          </p>

          <div className="flex items-center justify-center gap-8 sm:gap-16 flex-wrap">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="text-white/50 hover:text-gold-500/80 transition-all duration-700 cursor-default"
              >
                <p className="text-xl sm:text-2xl font-bold tracking-tight">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// =============================================================================
// VIDEOS SECTION — Interactive Inline Showcase (Hebrew)
// =============================================================================

function VideosSection({ videos }: { videos: Array<{
  id: string;
  title: string;
  description?: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  speaker?: string;
  views?: number;
}> }) {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0d1321] to-[#070b1e]" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#c8a951]/[0.03] rounded-full blur-[150px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="right">
          <div className="mb-14 sm:mb-16">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              צפו בתוכן שלנו
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              סרטונים ותוכן
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
// TESTIMONIALS — Dark Glassmorphism Carousel (Hebrew headers)
// =============================================================================

function TestimonialsSection({ stories }: { stories: Array<{
  id: string;
  companyName: string;
  quote: string;
  personName: string;
  personRole?: string;
  personImage?: string;
  industry?: string;
  metrics?: Array<{ label: string; value: string }> | { items: Array<{ label: string; value: string }> };
}> }) {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0a1025] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="left">
          <div className="text-center mb-16">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              סיפורי הצלחה
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              מה היזמים אומרים
            </h2>
          </div>
        </ScrollReveal>

        {/* Horizontal scroll carousel */}
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar -mx-6 px-6">
          {stories.map((story, idx) => {
            const metrics = Array.isArray(story.metrics)
              ? story.metrics
              : story.metrics && 'items' in story.metrics
                ? story.metrics.items
                : [];
            return (
              <ScrollReveal key={story.id} delay={idx * 120} variant="scale" className="snap-center flex-shrink-0">
                <div className="glass-card p-8 w-[340px] sm:w-[400px]">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-gold-500/30 mb-4" />

                  {/* Quote text */}
                  <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-4">
                    &ldquo;{story.quote}&rdquo;
                  </p>

                  {/* Metrics */}
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

                  {/* Person */}
                  <div className="flex items-center gap-3">
                    {story.personImage && (
                      <Image
                        src={story.personImage}
                        alt={story.personName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{story.personName}</p>
                      <p className="text-white/60 text-xs">
                        {story.personRole} · {story.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Industry badge */}
                  {story.industry && (
                    <div className="mt-4">
                      <span className="inline-block bg-white/5 text-white/60 text-xs px-3 py-1 rounded-full">
                        {story.industry}
                      </span>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// NEWS / EVENTS — Three Column Dark Grid (Hebrew)
// =============================================================================

function NewsSection({ events }: { events: Array<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  date: Date;
  time: string | null;
  city: string | null;
  category: string | null;
  imageUrl?: string | null;
}> }) {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] to-[#0d1321]" />

      <div className="container-corporate relative z-10">
        <ScrollReveal variant="right">
          <div className="flex items-end justify-between mb-12 sm:mb-16">
            <div>
              <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                חדשות אחרונות
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                אירועים קרובים
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden md:inline-flex items-center gap-2 text-gold-400 text-sm font-semibold hover:text-gold-300 transition-colors group"
            >
              כל האירועים
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scale">
          <EventsShowcase events={events} />
        </ScrollReveal>

        {/* Mobile CTA */}
        <div className="md:hidden text-center mt-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-gold-400 font-semibold text-sm"
          >
            צפו בכל האירועים
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// CTA SECTION — Premium Call to Action (Hebrew)
// =============================================================================

function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background with gold accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1321] to-[#070b1e]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="container-corporate relative z-10 text-center">
        <ScrollReveal variant="blur">
          <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-6">
            מוכנים לבנות?
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            הצטרפו לדור הבא
            <br />
            <span className="text-gold-gradient">של המיזמים הישראליים</span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            המחזור הבא שלנו יוצא לדרך בקרוב. הגישו מועמדות עכשיו והצטרפו ליזמים
            שבונים את עתיד הטכנולוגיה, הבריאות והחדשנות.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/apply"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] px-8 py-4 text-lg font-bold gold-glow hover:scale-[1.03] transition-all duration-300 rounded-sm"
            >
              הגישו מועמדות
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-8 py-4 font-medium hover:bg-white/5 hover:border-white/30 transition-all rounded-sm"
            >
              צרו קשר
            </Link>
          </div>

          {/* Portal Login */}
          <div className="mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gold-400/70 hover:text-gold-400 text-sm font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              כניסה לפורטל יזמים
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
            <a
              href="tel:+972555647538"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
              aria-label="התקשרו: 055-564-7538"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span dir="ltr">055-564-7538</span>
            </a>
            <a
              href="mailto:Raz@weccelerate.co.il"
              className="flex items-center gap-2 hover:text-white/80 transition-colors"
              aria-label="שלחו אימייל: Raz@weccelerate.co.il"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span dir="ltr">Raz@weccelerate.co.il</span>
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>רחוב הרכבת 58, תל אביב</span>
            </span>
            <NavigationButtons variant="dark" size="sm" />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER — Premium Dark (Hebrew)
// =============================================================================

function Footer() {
  const footerLinks = {
    company: [
      { name: 'אודות', href: '/about' },
      { name: 'הצוות שלנו', href: '/team' },
      { name: 'צור קשר', href: '/contact' },
      { name: 'כניסה לפורטל', href: '/login' },
    ],
    services: [
      { name: 'ייעוץ עסקי ואסטרטגי', href: '/services/business-consulting' },
      { name: 'פיתוח מוצר פיזי', href: '/services/physical-product' },
      { name: 'פיתוח מוצר דיגיטלי', href: '/services/digital-product' },
      { name: 'מסלול MedTech (לאומית)', href: '/services/medtech-leumit' },
    ],
    resources: [
      { name: 'אירועים', href: '/events' },
      { name: 'בלוג', href: '/blog' },
      { name: 'סרטונים', href: '/videos' },
      { name: 'מחשבון MVP', href: '/tools/mvp-calculator' },
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
                src="/images/logos/weccelerate-logo.jpeg"
                alt="WeCcelerate"
                width={200}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-white/60 max-w-sm mb-8 text-sm leading-relaxed">
              ה-Venture Builder המוביל בישראל — בונים ומאיצים סטארטאפים
              בתחומי הטכנולוגיה, הבריאות והחדשנות.
            </p>
            <div className="flex items-center gap-2.5 mb-6">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/weccelerate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeCcelerate בלינקדאין"
                className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] text-white/60 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/weccelerate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeCcelerate בפייסבוק"
                className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#1877F2]/20 hover:text-[#1877F2] text-white/60 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/weccelerate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeCcelerate באינסטגרם"
                className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#E4405F]/20 hover:text-[#E4405F] text-white/60 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@weccelerate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeCcelerate בטיקטוק"
                className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-white/15 hover:text-white text-white/60 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@WeCcelerate.Ltd1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeCcelerate ביוטיוב"
                className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#FF0000]/20 hover:text-[#FF0000] text-white/60 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
            {/* Address & Navigation */}
            <div className="space-y-3">
              <p className="text-white/60 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                רחוב הרכבת 58, תל אביב
              </p>
              <NavigationButtons variant="dark" size="sm" />
              <LocationMap variant="dark" height="180px" className="mt-4" />
            </div>
          </div>

          {/* Company Links */}
          <nav aria-label="קישורי חברה">
            <h4 className="font-semibold text-white text-sm mb-5">חברה</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services Links */}
          <nav aria-label="קישורי שירותים">
            <h4 className="font-semibold text-white text-sm mb-5">שירותים</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources Links */}
          <nav aria-label="קישורי תוכן">
            <h4 className="font-semibold text-white text-sm mb-5">תוכן</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/60 hover:text-gold-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} WeCcelerate Ltd. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/50">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">
              מדיניות פרטיות
            </Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">
              תנאי שימוש
            </Link>
            <Link href="/accessibility" className="hover:text-white/70 transition-colors">
              נגישות
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default async function MainHomePage() {
  const [events, news, videos, stories] = await Promise.all([
    getEventsFromDB(),
    getNewsFromDB(),
    getVideosFromDB(),
    getSuccessStoriesFromDB(),
  ]);

  return (
    <div className="bg-[#070b1e] min-h-screen">
      {/* Live Ticker */}
      <LiveTicker
        updates={news}
        speed={4}
        pauseOnHover={true}
      />

      <main id="main-content">
        {/* Hero — Full Viewport Dark Luxury */}
        <HeroSection />

        {/* Service Ecosystem — Interactive Glassmorphism Cards */}
        <ServiceEcosystem />

        {/* Partners — Monochrome Logo Bar */}
        <PartnersSection />

        {/* Videos — Dark Video Gallery */}
        <VideosSection videos={videos} />

        {/* Testimonials — Dark Card Carousel */}
        <TestimonialsSection stories={stories} />

        {/* News / Events — Three Column Grid */}
        <NewsSection events={events} />

        {/* CTA — Premium Call to Action */}
        <CTASection />
      </main>

      {/* Footer — Dark Premium */}
      <Footer />
    </div>
  );
}
