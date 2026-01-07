'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Rocket,
  TrendingUp,
  Users,
  Award,
  Play,
  ChevronDown,
  Sparkles,
  Building2,
  Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface HeroProps {
  variant?: 'default' | 'video' | 'animated';
  showStats?: boolean;
  showTrustBadges?: boolean;
}

interface StatItem {
  value: string;
  label: string;
  suffix?: string;
  icon: typeof TrendingUp;
}

// =============================================================================
// STATS DATA
// =============================================================================

const heroStats: StatItem[] = [
  {
    value: '150',
    suffix: '+',
    label: 'סטארטאפים הואצו',
    icon: Rocket,
  },
  {
    value: '$50',
    suffix: 'M+',
    label: 'הון גויס',
    icon: TrendingUp,
  },
  {
    value: '85',
    suffix: '%',
    label: 'הצלחה בגיוס',
    icon: Award,
  },
  {
    value: '200',
    suffix: '+',
    label: 'מנטורים ומומחים',
    icon: Users,
  },
];

const trustLogos = [
  { name: 'Microsoft', logo: '/images/logos/microsoft.svg' },
  { name: 'Google', logo: '/images/logos/google.svg' },
  { name: 'Sequoia', logo: '/images/logos/sequoia.svg' },
  { name: 'Innovation Authority', logo: '/images/logos/innovation-authority.svg' },
];

// =============================================================================
// ANIMATED COUNTER COMPONENT
// =============================================================================

function AnimatedCounter({ 
  target, 
  suffix = '',
  duration = 2000 
}: { 
  target: string; 
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const numericTarget = parseInt(target.replace(/\D/g, ''), 10);

  useEffect(() => {
    const startTime = Date.now();
    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * numericTarget));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    requestAnimationFrame(updateCount);
  }, [numericTarget, duration]);

  // Handle special formats like "$50"
  const prefix = target.includes('$') ? '$' : '';
  
  return (
    <span>
      {prefix}{count}{suffix}
    </span>
  );
}

// =============================================================================
// FLOATING ELEMENTS (for animated variant)
// =============================================================================

function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float-medium" />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-royal-500/10 rounded-full blur-3xl animate-float-fast" />
      
      {/* Decorative icons */}
      <Rocket className="absolute top-20 left-[10%] w-8 h-8 text-royal-300/30 animate-float-slow" />
      <Building2 className="absolute top-40 right-[15%] w-6 h-6 text-gold-300/30 animate-float-medium" />
      <Globe2 className="absolute bottom-32 left-[20%] w-10 h-10 text-teal-300/30 animate-float-fast" />
      <Sparkles className="absolute bottom-20 right-[25%] w-5 h-5 text-gold-400/40 animate-pulse" />
    </div>
  );
}

// =============================================================================
// HERO SECTION COMPONENT
// =============================================================================

export function HeroSection({
  variant = 'default',
  showStats = true,
  showTrustBadges = true,
}: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-royal-900 to-slate-900" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Animated floating elements */}
      {variant === 'animated' && <FloatingElements />}

      {/* Gradient accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-royal-400 to-transparent opacity-30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={cn(
              'inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-2 mb-8 transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 text-sm font-medium">
              #1 מאיץ עסקי בישראל
            </span>
          </div>

          {/* Main headline */}
          <h1
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            מאיצים את
            <br />
            <span className="relative">
              <span className="bg-gradient-to-l from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent">
                העסק שלכם
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C50 2 100 2 150 6C200 10 250 10 298 2"
                  stroke="url(#gold-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gold-gradient" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            להצלחה
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              'text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            WeCcelerate מלווה יזמים ועסקים בדרך להצלחה עם שירותי האצה, 
            ייעוץ אסטרטגי, גישה למשקיעים ורשת קשרים עסקית ייחודית
          </p>

          {/* CTA Buttons */}
          <div
            className={cn(
              'flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <a
              href="/apply"
              className={cn(
                'group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300',
                'bg-gradient-to-l from-gold-500 to-gold-400 text-slate-900',
                'hover:shadow-xl hover:shadow-gold-500/30 hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-slate-900'
              )}
            >
              <span>הגישו מועמדות</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </a>
            
            <a
              href="/about"
              className={cn(
                'group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300',
                'border-2 border-white/20 text-white',
                'hover:bg-white/10 hover:border-white/30',
                'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900'
              )}
            >
              <Play className="w-5 h-5" />
              <span>צפו בסרטון</span>
            </a>
          </div>

          {/* Stats */}
          {showStats && (
            <div
              className={cn(
                'grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 transition-all duration-700 delay-400',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              {heroStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-white/5 rounded-xl blur-xl group-hover:bg-white/10 transition-all" />
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-6 hover:border-gold-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-gold-400 mb-3" />
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                        {isVisible ? (
                          <AnimatedCounter 
                            target={stat.value} 
                            suffix={stat.suffix}
                            duration={2000 + index * 200}
                          />
                        ) : (
                          `${stat.value}${stat.suffix || ''}`
                        )}
                      </div>
                      <div className="text-sm text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Trust badges */}
        {showTrustBadges && (
          <div
            className={cn(
              'mt-20 pt-10 border-t border-white/10 transition-all duration-700 delay-500',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <p className="text-center text-slate-500 text-sm mb-6">
              נתמכים על ידי משקיעים וחברות מובילים
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {trustLogos.map((logo, index) => (
                <div
                  key={index}
                  className="opacity-40 hover:opacity-70 transition-opacity grayscale hover:grayscale-0"
                >
                  {/* Placeholder for logos - in production use actual images */}
                  <div className="h-8 md:h-10 px-4 bg-white/10 rounded flex items-center justify-center">
                    <span className="text-white/70 text-sm font-medium">
                      {logo.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/40" />
      </div>
    </section>
  );
}

// =============================================================================
// MINIMAL HERO VARIANT
// =============================================================================

export function HeroMinimal({
  title,
  subtitle,
  ctaText = 'התחילו עכשיו',
  ctaLink = '/contact',
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}) {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-br from-royal-900 to-royal-800 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold-500/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-royal-200 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
        )}
        <a
          href={ctaLink}
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-slate-900 font-bold px-6 py-3 rounded-lg transition-all hover:scale-105"
        >
          {ctaText}
          <ArrowLeft className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

export default HeroSection;