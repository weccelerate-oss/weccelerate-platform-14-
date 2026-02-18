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
  Rocket,
  Globe,
  HeartHandshake,
  Phone,
  Mail,
  MapPin,
  Play,
  Shield,
  Quote,
  Lightbulb,
  ExternalLink,
  Navigation,
  Map,
} from 'lucide-react';

// Components
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { LiveTicker } from '@/components/ui';
import { VideoShowcase } from './VideoShowcase';
import { EventsShowcase } from './EventsShowcase';
import { HeroVideo } from './HeroVideo';

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

const features = [
  {
    icon: Rocket,
    title: 'בניית מיזמים',
    description: 'בניית מיזמים מקצה לקצה — מאסטרטגיה עסקית ותיקוף שוק, דרך גיוס הון ועד הרחבה. SaaS, Consumer, Low-Tech ועוד.',
    href: '/services/acceleration',
  },
  {
    icon: Lightbulb,
    title: 'טכנולוגיה ו-AI',
    description: 'פיתוח אפליקציות ברמה עולמית, שילוב AI וארכיטקטורה טכנית. מ-MVP ועד מוצר מוכן לשוק עם צוות הפיתוח שלנו.',
    href: '/tech-development',
  },
  {
    icon: HeartHandshake,
    title: 'מסלול MedTech',
    description: 'מסלול ייחודי למיזמי בריאות: גישה לנתונים רפואיים, אישורי ועדת הלסינקי וסביבות פיילוט קליניות.',
    href: '/medtech',
    ribbon: 'שותפות אסטרטגית',
  },
  {
    icon: Shield,
    title: 'אסטרטגיית IP',
    description: 'הגנה מקיפה על קניין רוחני — רישום פטנטים, פיתוח אבות טיפוס ומיצוב אסטרטגי של IP למקסום ערך המיזם.',
    href: '/ip-patents',
  },
];

const partners = [
  { name: 'לאומית שירותי בריאות' },
  { name: 'אפריקה ישראל' },
  { name: 'הרצוג פוקס נאמן' },
];

const stats = [
  { value: '150+', label: 'מיזמים הואצו' },
  { value: '$50M+', label: 'הון גויס' },
  { value: '85%', label: 'הצלחה בגיוס' },
  { value: '10+', label: 'שנות ניסיון' },
];


// =============================================================================
// HERO SECTION — Full Viewport Premium with Video Background
// =============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Layers: 1) Video+poster bg  2) Light overlay  3) Content (z-10) */}

      {/* 1a) Mobile — poster image, fits screen */}
      <div className="absolute inset-0 md:hidden" aria-hidden="true">
        <img
          src="/corporate-hero.jpeg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* 1b) Desktop — video background */}
      <div className="absolute inset-0 hidden md:block" aria-hidden="true">
        <HeroVideo />
      </div>

      {/* 2) Light overlay — just enough to keep text readable */}
      <div className="absolute inset-0 bg-[#050810]/40 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/50 via-transparent to-[#050810]/60 pointer-events-none" aria-hidden="true" />

      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c8a951]/30 to-transparent" aria-hidden="true" />

      {/* 5) Content — z-10 ensures it's above all background layers */}
      <div className="relative z-10 container-corporate w-full py-24 md:py-32">
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

        {/* Stats Row — Glassmorphism Cards */}
        <div className="hero-fade-in-delay-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-24 pt-10 border-t border-white/[0.06]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-lg p-5 md:p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold-gradient tracking-tight" dir="ltr">
                {stat.value}
              </p>
              <p className="text-sm text-white/60 mt-2 font-medium group-hover:text-white/80 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
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
// FEATURE CARDS — 4 Glassmorphism Cards (Hebrew)
// =============================================================================

function FeatureCardsSection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e] via-[#0d1321] to-[#070b1e]" />

      <div className="container-corporate relative z-10">
        {/* Section Header */}
        <ScrollReveal variant="blur">
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              מה אנחנו עושים
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              ארבעת עמודי הצמיחה
            </h2>
          </div>
        </ScrollReveal>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <ScrollReveal key={feature.title} delay={idx * 120} variant="scale">
              <Link
                href={feature.href}
                className="glass-card p-8 relative group block h-full"
              >
                {/* Ribbon for MedTech */}
                {feature.ribbon && (
                  <div className="partnership-ribbon">
                    {feature.ribbon}
                  </div>
                )}

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex items-center justify-center mb-6 group-hover:bg-gold-500/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-gold-400" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Link */}
                <span className="inline-flex items-center gap-2 text-gold-400 text-sm font-semibold group-hover:text-gold-300 transition-colors">
                  למידע נוסף
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
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
            <span className="flex items-center gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
                aria-label="נווטו אלינו בגוגל מפות"
              >
                <Map className="w-4 h-4" aria-hidden="true" />
                <span>Google Maps</span>
              </a>
              <a
                href="https://waze.com/ul?q=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
                aria-label="נווטו אלינו בוויז"
              >
                <Navigation className="w-4 h-4" aria-hidden="true" />
                <span>Waze</span>
              </a>
            </span>
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
      { name: 'בניית מיזמים', href: '/services/acceleration' },
      { name: 'טכנולוגיה ו-MVP', href: '/tech-development' },
      { name: 'מסלול MedTech', href: '/medtech' },
      { name: 'אסטרטגיית IP', href: '/ip-patents' },
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
            <div className="flex items-center gap-3 mb-6">
              <a
                href="https://www.linkedin.com/company/weccelerate"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WeCcelerate בלינקדאין"
                className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-gold-500/20 hover:text-gold-400 text-white/60 transition-all"
              >
                <Globe className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
            {/* Address & Navigation */}
            <div className="space-y-2">
              <p className="text-white/60 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                רחוב הרכבת 58, תל אביב
              </p>
              <div className="flex items-center gap-4 text-xs">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/50 hover:text-gold-400 transition-colors"
                  aria-label="נווטו אלינו בגוגל מפות"
                >
                  <Map className="w-3.5 h-3.5" aria-hidden="true" />
                  Google Maps
                </a>
                <a
                  href="https://waze.com/ul?q=%D7%A8%D7%97%D7%95%D7%91+%D7%94%D7%A8%D7%9B%D7%91%D7%AA+58+%D7%AA%D7%9C+%D7%90%D7%91%D7%99%D7%91"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/50 hover:text-gold-400 transition-colors"
                  aria-label="נווטו אלינו בוויז"
                >
                  <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                  Waze
                </a>
              </div>
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

        {/* Feature Cards — 4 Glassmorphism Boxes */}
        <FeatureCardsSection />

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
