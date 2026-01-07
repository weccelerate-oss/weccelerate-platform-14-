/**
 * WeCcelerate Main Homepage - Corporate EY Style
 * 
 * Design Principles:
 * - Sharp borders, minimal rounded corners
 * - Deep charcoal/black for authority
 * - Yellow/gold accent for innovation
 * - Crisp white backgrounds
 * - Full-width hero images
 * - RTL Hebrew first
 */

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Rocket,
  Building2,
  Globe,
  Users,
  HeartHandshake,
  Target,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Play,
  ChevronDown,
  Award,
  TrendingUp,
  Briefcase,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';

// Components
import {
  LiveTicker,
  EventsCenter,
  VideoGallery,
  SuccessStories,
} from '@/components/ui';

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
// PAGE METADATA
// =============================================================================

export const metadata: Metadata = constructMetadata({
  title: 'WeCcelerate | וויסלרייט - הפלטפורמה המובילה להאצת סטארטאפים בישראל',
  description: 'WeCcelerate (וויסלרייט) בשיתוף לאומית שירותי בריאות - הפלטפורמה המובילה בישראל להקמת סטארטאפים רפואיים וטכנולוגיים. ליווי יזמים משלב הרעיון, פיתוח MVP, גישה לדאטה רפואי וחיבור למשקיעים.',
  siteKey: 'main',
  path: '/',
  keywords: [
    'וויסלרייט',
    'WeCcelerate',
    'האצת סטארטאפים',
    'הקמת סטארטאפ רפואי',
    'פיתוח MVP',
    'ליווי יזמים',
    'לאומית חדשנות',
  ],
});

// =============================================================================
// HERO SECTION - Full Width Corporate Style
// =============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/corporate-hero.jpg"
          alt="WeCcelerate - המאיץ העסקי המוביל"
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/95 to-slate-900/80" />
      </div>

      {/* Yellow Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500" />

      {/* Content */}
      <div className="relative z-10 container-corporate w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-yellow-500 animate-pulse" />
            <span className="text-yellow-400 text-sm font-medium">
              בשיתוף לאומית שירותי בריאות
            </span>
          </div>

          {/* Headline */}
          <h1 className="heading-display text-white mb-6">
            <span className="text-yellow-400">WeCcelerate</span>
            <span className="text-slate-400 mx-3">|</span>
            <span>וויסלרייט</span>
          </h1>

          <p className="text-2xl md:text-3xl text-white font-light mb-4 leading-relaxed">
            הפלטפורמה המובילה בישראל
            <br />
            <strong className="font-semibold">להאצת סטארטאפים רפואיים וטכנולוגיים</strong>
          </p>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed">
            ליווי מלא משלב הרעיון, דרך פיתוח MVP, גישה לדאטה רפואי ייחודי,
            ועד חיבור למשקיעים וגיוס הון.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-slate-900 px-8 py-4 font-semibold hover:bg-yellow-400 transition-colors"
            >
              הגישו מועמדות
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 transition-colors"
            >
              למדו עוד על התוכנית
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/10">
            {[
              { value: '150+', label: 'סטארטאפים הואצו' },
              { value: '$50M+', label: 'הון גויס' },
              { value: '85%', label: 'הצלחה בגיוס' },
              { value: '10+', label: 'שנות ניסיון' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-yellow-400">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs">גלילה למטה</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>
    </section>
  );
}

// =============================================================================
// SERVICES SECTION - Corporate Grid
// =============================================================================

const services = [
  {
    icon: Rocket,
    title: 'האצת סטארטאפים',
    description: 'תוכניות האצה מותאמות אישית בתחום הבריאות הדיגיטלית',
    href: '/services/acceleration',
  },
  {
    icon: Lightbulb,
    title: 'פיתוח MVP',
    description: 'ליווי טכני ופיתוח מוצר ראשוני תוך גישה לדאטה רפואי',
    href: '/services/mvp',
  },
  {
    icon: Target,
    title: 'ייעוץ רגולטורי',
    description: 'ליווי בתהליכי רגולציה - FDA, CE, משרד הבריאות',
    href: '/services/regulatory',
  },
  {
    icon: Users,
    title: 'חיבור למשקיעים',
    description: 'גישה לרשת משקיעים מתמחים בתחום הבריאות',
    href: '/services/investors',
  },
  {
    icon: Building2,
    title: 'גישה לדאטה רפואי',
    description: 'גישה מאובטחת לדאטה רפואי אנונימי לצורכי מחקר ופיתוח',
    href: '/services/data',
  },
  {
    icon: HeartHandshake,
    title: 'מנטורינג מקצועי',
    description: 'ליווי אישי ממומחים בתעשיית הבריאות',
    href: '/services/mentoring',
  },
];

function ServicesSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corporate">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
            השירותים שלנו
          </span>
          <h2 className="heading-1 text-slate-900 mt-3 mb-4">
            כל מה שיזם צריך
            <br />
            <span className="text-slate-400">במקום אחד</span>
          </h2>
          <p className="body-large text-slate-600">
            אנחנו מספקים את כל הכלים, המשאבים והקשרים הנדרשים
            להפוך רעיון למוצר מוצלח בשוק הבריאות הדיגיטלית.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group corporate-card p-8 hover:border-yellow-500 transition-all"
            >
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-yellow-500 flex items-center justify-center mb-6 transition-colors">
                <service.icon className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors" />
              </div>
              <h3 className="heading-3 text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 mb-4">{service.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:text-yellow-600 transition-colors">
                למידע נוסף
                <ArrowLeft className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// PARTNERSHIP SECTION - Leumit Authority
// =============================================================================

function PartnershipSection() {
  return (
    <section className="section-padding bg-slate-900 relative overflow-hidden">
      {/* Yellow Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-500/5" />
      
      <div className="container-corporate relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">
              שותפות אסטרטגית
            </span>
            <h2 className="heading-1 text-white mt-3 mb-6">
              בשיתוף
              <br />
              <span className="text-yellow-400">לאומית שירותי בריאות</span>
            </h2>
            <p className="body-large text-slate-300 mb-8">
              השותפות עם לאומית מעניקה לסטארטאפים שלנו יתרון משמעותי:
              גישה לדאטה רפואי של מיליוני מטופלים, סביבת פיילוט קלינית,
              ומומחיות רפואית ורגולטורית ייחודית.
            </p>

            {/* Benefits */}
            <ul className="space-y-4 mb-10">
              {[
                'גישה לדאטה רפואי אנונימי לצורכי מחקר ופיתוח',
                'סביבת פיילוט קלינית לבדיקת המוצר',
                'ליווי רגולטורי ומשפטי מקצועי',
                'חיבור לקהילה הרפואית בישראל',
              ].map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-white">{benefit}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/partnership"
              className="inline-flex items-center gap-2 bg-yellow-500 text-slate-900 px-6 py-3 font-semibold hover:bg-yellow-400 transition-colors"
            >
              למידע על השותפות
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-yellow-500/20 to-transparent p-1">
              <div className="w-full h-full bg-slate-800/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-white mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">L</span>
                  </div>
                  <p className="text-xl font-semibold text-white">לאומית שירותי בריאות</p>
                  <p className="text-slate-400 mt-2">שותף תכנוני רשמי</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// EVENTS SECTION - Corporate Style
// =============================================================================

function EventsSection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="container-corporate">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
              אירועים
            </span>
            <h2 className="heading-1 text-slate-900 mt-3">
              הצטרפו למפגשים הקרובים
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-flex items-center gap-2 text-slate-900 font-medium hover:text-yellow-600 transition-colors"
          >
            כל האירועים
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Events Grid - Corporate Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.slice(0, 3).map((event) => (
            <article key={event.id} className="corporate-card overflow-hidden group">
              {/* Image */}
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={event.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Play className="w-12 h-12 text-yellow-500" />
                  </div>
                )}
                {/* Date Badge */}
                <div className="absolute top-4 right-4 bg-yellow-500 text-slate-900 px-3 py-1.5 text-sm font-semibold">
                  {new Date(event.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {event.category}
                </span>
                <h3 className="heading-3 text-slate-900 mt-2 mb-3 line-clamp-2">
                  {event.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.city || 'אונליין'}
                  </span>
                  <span>{event.time}</span>
                </div>

                {/* CTA */}
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-slate-900 hover:text-yellow-600 transition-colors"
                >
                  לפרטים והרשמה
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="md:hidden text-center mt-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-slate-900 font-medium"
          >
            כל האירועים
            <ArrowLeft className="w-4 h-4" />
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
  return (
    <section className="section-padding bg-slate-900 relative">
      {/* Yellow Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />

      <div className="container-corporate text-center">
        <span className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 mb-8">
          <span className="text-yellow-400 text-sm font-medium">
            מוכנים להתחיל?
          </span>
        </span>

        <h2 className="heading-1 text-white mb-6">
          הצטרפו ל<span className="text-yellow-400">משפחת WeCcelerate</span>
        </h2>
        <p className="body-large text-slate-400 max-w-2xl mx-auto mb-10">
          תוכנית ההאצה הבאה שלנו מתחילה בקרוב.
          הגישו מועמדות עכשיו והצטרפו ליזמים שכבר משנים את עולם הבריאות.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-yellow-500 text-slate-900 px-8 py-4 font-semibold hover:bg-yellow-400 transition-colors"
          >
            הגישו מועמדות
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-medium hover:bg-white/10 transition-colors"
          >
            דברו איתנו
          </Link>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400">
          <a
            href="tel:+97235551234"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">03-555-1234</span>
          </a>
          <a
            href="mailto:info@weccelerate.co.il"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>info@weccelerate.co.il</span>
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>תל אביב, ישראל</span>
          </span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER - Corporate
// =============================================================================

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="container-corporate py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500 flex items-center justify-center">
                <span className="text-slate-900 font-bold text-xl">W</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">WeCcelerate</span>
                <span className="text-slate-500 text-sm block">וויסלרייט</span>
              </div>
            </div>
            <p className="text-slate-400 max-w-sm mb-6">
              הפלטפורמה המובילה בישראל להאצת סטארטאפים רפואיים וטכנולוגיים,
              בשיתוף לאומית שירותי בריאות.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-yellow-500 hover:text-slate-900 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">קישורים</h4>
            <ul className="space-y-3">
              {['אודות', 'שירותים', 'אירועים', 'בלוג', 'צור קשר'].map((link) => (
                <li key={link}>
                  <Link href="#" className="hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">צור קשר</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span dir="ltr">03-555-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@weccelerate.co.il</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>תל אביב, ישראל</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} WeCcelerate Ltd. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              מדיניות פרטיות
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              תנאי שימוש
            </Link>
            <Link href="/accessibility" className="hover:text-white transition-colors">
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

export default function MainHomePage() {
  return (
    <>
      {/* Live Ticker - Corporate Style */}
      <LiveTicker
        updates={mockNewsUpdates}
        speed={6}
        pauseOnHover={true}
        mode="fade"
      />

      <main id="main-content">
        {/* Hero - Full Width Corporate */}
        <HeroSection />

        {/* Services Grid */}
        <ServicesSection />

        {/* Partnership with Leumit */}
        <PartnershipSection />

        {/* Events */}
        <EventsSection />

        {/* Video Gallery */}
        <section className="section-padding bg-white">
          <div className="container-corporate">
            <div className="mb-12">
              <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
                תוכן וידאו
              </span>
              <h2 className="heading-1 text-slate-900 mt-3">
                למדו מהמומחים
              </h2>
            </div>
            <VideoGallery videos={mockVideos} showPlaylist={true} />
          </div>
        </section>

        {/* Success Stories */}
        <section className="section-padding bg-slate-50">
          <div className="container-corporate">
            <div className="mb-12">
              <span className="text-sm font-semibold text-yellow-600 uppercase tracking-wider">
                סיפורי הצלחה
              </span>
              <h2 className="heading-1 text-slate-900 mt-3">
                הסטארטאפים שלנו
              </h2>
            </div>
            <SuccessStories
              stories={mockSuccessStories}
              variant="carousel"
              autoPlay={true}
              interval={6000}
            />
          </div>
        </section>

        {/* CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
