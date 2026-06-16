/**
 * Corporate Navbar — Premium Dark Theme (WCAG 2.1 AA)
 *
 * Luxury-grade navigation with:
 * - Transparent → dark blur on scroll
 * - Gold accent hover states
 * - RTL Hebrew support
 * - Mega menu dropdowns
 * - Mobile responsive
 *
 * Accessibility:
 * - Keyboard-navigable dropdowns (Enter/Space/Escape/Tab)
 * - aria-expanded, aria-haspopup on dropdown triggers
 * - aria-label on nav landmark, icon-only links, mobile toggle
 * - Focus trap in mobile menu
 * - Proper contrast ratios (≥ 4.5:1 AA)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Rocket,
  Building2,
  Target,
  Megaphone,
  HeartHandshake,
  TrendingUp,
  Handshake,
  Calendar,
  Video,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { TrackedLink } from '@/components/ui/TrackedLink';
import { useLanguage, useLangSwitch } from '@/lib/i18n';

// =============================================================================
// NAVIGATION DATA — built dynamically using translation keys
// =============================================================================

const topBar = {
  phone: '055-564-7538',
  phoneFull: '+972555647538',
  email: 'info@weccelerate.co.il',
  whatsapp: 'https://wa.me/972555647538',
};

function useNavigation() {
  const { t } = useLanguage();

  return {
    main: [
      { name: t('nav.home'), href: '/' },
      {
        name: t('nav.services'),
        href: '/services',
        children: [
          {
            name: t('nav.services.consulting'),
            href: '/services/business-consulting',
            description: t('nav.services.consulting.desc'),
            icon: Target,
          },
          {
            name: t('nav.services.physical'),
            href: '/services/physical-product',
            description: t('nav.services.physical.desc'),
            icon: Building2,
          },
          {
            name: t('nav.services.digital'),
            href: '/services/digital-product',
            description: t('nav.services.digital.desc'),
            icon: Rocket,
          },
          {
            name: t('nav.services.marketing'),
            href: '/services/marketing',
            description: t('nav.services.marketing.desc'),
            icon: Megaphone,
          },
          {
            name: t('nav.services.medtech'),
            href: '/services/medtech-leumit',
            description: t('nav.services.medtech.desc'),
            icon: HeartHandshake,
          },
          {
            name: t('nav.services.investors'),
            href: '/services/investors',
            description: t('nav.services.investors.desc'),
            icon: TrendingUp,
          },
          {
            name: t('nav.services.investorPrep'),
            href: '/services/investor-preparation',
            description: t('nav.services.investorPrep.desc'),
            icon: Handshake,
          },
        ],
      },
      { name: t('nav.about'), href: '/about' },
      {
        name: t('nav.content'),
        href: '#',
        children: [
          {
            name: t('nav.content.events'),
            href: '/events',
            description: t('nav.content.events.desc'),
            icon: Calendar,
          },
          {
            name: t('nav.content.videos'),
            href: '/videos',
            description: t('nav.content.videos.desc'),
            icon: Video,
          },
          {
            name: t('nav.content.blog'),
            href: '/blog',
            description: t('nav.content.blog.desc'),
            icon: FileText,
          },
        ],
      },
      { name: t('nav.contact'), href: '/contact' },
    ],
    cta: {
      name: t('nav.portal'),
      href: '/contact',
    },
  };
}

// =============================================================================
// NAVBAR COMPONENT
// =============================================================================

export function CorporateNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const { lang, dir, t } = useLanguage();
  const { switchLang } = useLangSwitch();
  const navigation = useNavigation();
  const DirArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Mobile menu focus trap + Escape to close
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }

      if (e.key !== 'Tab' || !mobileMenuRef.current) return;

      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Close dropdown on Escape (desktop)
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent, itemName: string) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        // Return focus to the trigger button
        (e.currentTarget.querySelector('button') as HTMLElement)?.focus();
      }
      if (e.key === 'ArrowDown' && activeDropdown !== itemName) {
        e.preventDefault();
        setActiveDropdown(itemName);
      }
    },
    [activeDropdown]
  );

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-black text-white/70 text-sm hidden lg:block border-b border-white/5">
        <div className="container-corporate">
          <div className="flex items-center justify-between h-10">
            {/* Contact */}
            <div className="flex items-center gap-6">
              <TrackedLink
                trackAction="click.phone"
                trackMeta={{ location: 'navbar-desktop' }}
                href={`tel:${topBar.phoneFull}`}
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                aria-label={`${t('nav.callUs')}: ${topBar.phone}`}
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span dir="ltr">{topBar.phone}</span>
              </TrackedLink>
              <TrackedLink
                trackAction="click.whatsapp"
                trackMeta={{ location: 'navbar-desktop' }}
                href={topBar.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-green-400 transition-colors"
                aria-label={t('nav.sendWhatsApp')}
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>WhatsApp</span>
              </TrackedLink>
              <TrackedLink
                trackAction="click.email"
                trackMeta={{ location: 'navbar-desktop' }}
                href={`mailto:${topBar.email}`}
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
                aria-label={`${t('nav.sendEmail')}: ${topBar.email}`}
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{topBar.email}</span>
              </TrackedLink>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-4" role="group" aria-label={t('nav.langLabel')}>
              <Globe className="w-3.5 h-3.5 text-white/30" aria-hidden="true" />
              <button
                onClick={() => switchLang('he')}
                lang="he"
                aria-label={`${t('nav.switchLang')} עברית`}
                aria-current={lang === 'he' ? 'true' : undefined}
                className={`hover:text-gold-400 transition-colors ${
                  lang === 'he' ? 'text-gold-400 font-medium' : ''
                }`}
              >
                עברית
              </button>
              <span className="text-white/20" aria-hidden="true">|</span>
              <button
                onClick={() => switchLang('en')}
                lang="en"
                aria-label={`${t('nav.switchLang')} English`}
                aria-current={lang === 'en' ? 'true' : undefined}
                className={`hover:text-gold-400 transition-colors ${
                  lang === 'en' ? 'text-gold-400 font-medium' : ''
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`
          sticky top-0 z-50 transition-all duration-500
          ${isScrolled
            ? 'bg-black shadow-lg shadow-black/20 border-b border-white/5'
            : 'bg-black'}
        `}
      >
        <nav className="container-corporate" aria-label={t('nav.mainNav')}>
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className="relative flex-shrink-0 group" aria-label={t('nav.backToHome')}>
              <Image
                src="/images/logos/weccelerate-logo-wide.jpeg"
                alt="WeCcelerate"
                width={320}
                height={96}
                priority
                className="h-24 w-auto object-contain transition-all duration-300 group-hover:brightness-110"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1" role="list">
              {navigation.main.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  role="listitem"
                  onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                  onKeyDown={(e) => item.children && handleDropdownKeyDown(e, item.name)}
                  // Close dropdown when focus leaves the entire container
                  onBlurCapture={(e) => {
                    if (item.children && !e.currentTarget.contains(e.relatedTarget as Node)) {
                      setActiveDropdown(null);
                    }
                  }}
                  onFocusCapture={() => item.children && setActiveDropdown(item.name)}
                >
                  {item.children ? (
                    <>
                      <button
                        className={`
                          flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                          ${activeDropdown === item.name
                            ? 'text-gold-400'
                            : 'text-white/80 hover:text-gold-400'}
                        `}
                        aria-expanded={activeDropdown === item.name}
                        aria-haspopup="true"
                        onClick={() =>
                          setActiveDropdown(activeDropdown === item.name ? null : item.name)
                        }
                      >
                        {item.name}
                        <ChevronDown
                          className={`
                            w-4 h-4 transition-transform
                            ${activeDropdown === item.name ? 'rotate-180' : ''}
                          `}
                          aria-hidden="true"
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === item.name && (
                        <div
                          className="absolute top-full right-0 w-80 bg-[#111b3c]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 mt-0 py-2 rounded-lg"
                          role="menu"
                          aria-label={item.name}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              role="menuitem"
                              className="flex items-start gap-4 px-5 py-3 hover:bg-white/5 transition-colors"
                            >
                              <div className="p-2 bg-white/5 rounded-md">
                                <child.icon className="w-5 h-5 text-gold-400" aria-hidden="true" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{child.name}</p>
                                <p className="text-sm text-white/50 mt-0.5">{child.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      className={`
                        px-4 py-2 text-sm font-medium transition-colors
                        ${pathname === item.href
                          ? 'text-gold-400'
                          : 'text-white/80 hover:text-gold-400'}
                      `}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* CTA & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* Desktop CTA */}
              <Link
                href={navigation.cta.href}
                className="hidden lg:inline-flex items-center gap-2 border border-gold-500/50 text-gold-400 px-6 py-2.5 text-sm font-semibold hover:bg-gold-500/10 hover:border-gold-400 transition-all rounded-sm"
              >
                {navigation.cta.name}
                <DirArrow className="w-4 h-4" aria-hidden="true" />
              </Link>

              {/* Portal Link */}
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center gap-1 text-sm text-white/60 hover:text-white/80 transition-colors"
              >
                {t('nav.portalLogin')}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                ref={mobileToggleRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
                aria-label={isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="lg:hidden bg-black border-t border-white/5"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menuDialog')}
          >
            <nav className="container-corporate py-4" aria-label={t('nav.mobileNav')}>
              {navigation.main.map((item) => (
                <div key={item.name} className="border-b border-white/5 last:border-b-0">
                  {item.children ? (
                    <div className="py-3">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.name ? null : item.name
                          )
                        }
                        className="flex items-center justify-between w-full text-start"
                        aria-expanded={activeDropdown === item.name}
                        aria-haspopup="true"
                      >
                        <span className="font-medium text-white">{item.name}</span>
                        <ChevronDown
                          className={`
                            w-5 h-5 text-white/30 transition-transform
                            ${activeDropdown === item.name ? 'rotate-180' : ''}
                          `}
                          aria-hidden="true"
                        />
                      </button>

                      {activeDropdown === item.name && (
                        <div className="mt-3 ms-4 space-y-2" role="menu" aria-label={item.name}>
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              role="menuitem"
                              className="flex items-center gap-3 py-2 text-white/60 hover:text-gold-400 transition-colors"
                            >
                              <child.icon className="w-4 h-4" aria-hidden="true" />
                              <span>{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      className="block py-3 font-medium text-white"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile CTA */}
              <div className="pt-4 space-y-3">
                <Link
                  href={navigation.cta.href}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gold-500 to-gold-600 text-[#0a0e27] py-3 font-semibold rounded-sm"
                >
                  {navigation.cta.name}
                  <DirArrow className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full border border-white/20 text-white/70 py-3 font-medium rounded-sm"
                >
                  {t('nav.portalLogin')}
                </Link>
              </div>

              {/* Mobile Language Switcher */}
              <div
                className="pt-4 mt-4 border-t border-white/5 flex items-center justify-center gap-4"
                role="group"
                aria-label={t('nav.langLabel')}
              >
                <Globe className="w-4 h-4 text-white/30" aria-hidden="true" />
                <button
                  onClick={() => switchLang('he')}
                  lang="he"
                  aria-label={`${t('nav.switchLang')} עברית`}
                  aria-current={lang === 'he' ? 'true' : undefined}
                  className={`text-sm transition-colors ${
                    lang === 'he' ? 'text-gold-400 font-medium' : 'text-white/60 hover:text-gold-400'
                  }`}
                >
                  עברית
                </button>
                <span className="text-white/20" aria-hidden="true">|</span>
                <button
                  onClick={() => switchLang('en')}
                  lang="en"
                  aria-label={`${t('nav.switchLang')} English`}
                  aria-current={lang === 'en' ? 'true' : undefined}
                  className={`text-sm transition-colors ${
                    lang === 'en' ? 'text-gold-400 font-medium' : 'text-white/60 hover:text-gold-400'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Mobile Contact */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-center gap-6 text-sm text-white/60">
                <TrackedLink
                  trackAction="click.phone"
                  trackMeta={{ location: 'navbar-mobile' }}
                  href={`tel:${topBar.phoneFull}`}
                  className="flex items-center gap-2 hover:text-white/80 transition-colors"
                  aria-label={`${t('nav.callUs')}: ${topBar.phone}`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span dir="ltr">{topBar.phone}</span>
                </TrackedLink>
                <TrackedLink
                  trackAction="click.whatsapp"
                  trackMeta={{ location: 'navbar-mobile' }}
                  href={topBar.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-500/70 hover:text-green-400 transition-colors"
                  aria-label={t('nav.sendWhatsApp')}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp</span>
                </TrackedLink>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export default CorporateNavbar;
