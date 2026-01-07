/**
 * Corporate Navbar Component - EY Style
 * 
 * Enterprise-grade navigation with:
 * - Clean, minimal design
 * - RTL Hebrew support
 * - Mega menu for services
 * - Mobile responsive
 * - Sticky with backdrop blur
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Rocket,
  Building2,
  Target,
  Users,
  HeartHandshake,
  Calendar,
  Video,
  FileText,
} from 'lucide-react';

// =============================================================================
// NAVIGATION DATA
// =============================================================================

const navigation = {
  main: [
    { name: 'ראשי', href: '/' },
    {
      name: 'שירותים',
      href: '/services',
      children: [
        {
          name: 'האצת עסקים',
          href: '/services/acceleration',
          description: 'תוכניות האצה מותאמות אישית',
          icon: Rocket,
        },
        {
          name: 'מציאת מפעלים',
          href: '/services/sourcing',
          description: 'חיבור לשותפי ייצור מובילים',
          icon: Building2,
        },
        {
          name: 'ייעוץ אסטרטגי',
          href: '/services/consulting',
          description: 'בניית אסטרטגיה ומודל עסקי',
          icon: Target,
        },
        {
          name: 'גישה למשקיעים',
          href: '/services/investors',
          description: 'רשת של מעל 500 משקיעים',
          icon: Users,
        },
        {
          name: 'מנטורינג אישי',
          href: '/services/mentoring',
          description: 'ליווי ממומחים ויזמים מנוסים',
          icon: HeartHandshake,
        },
      ],
    },
    { name: 'אודות', href: '/about' },
    {
      name: 'תוכן',
      href: '#',
      children: [
        {
          name: 'אירועים',
          href: '/events',
          description: 'מפגשים, וובינרים ודמו דייס',
          icon: Calendar,
        },
        {
          name: 'סרטונים',
          href: '/videos',
          description: 'תוכן וידאו והדרכות',
          icon: Video,
        },
        {
          name: 'בלוג',
          href: '/blog',
          description: 'מאמרים ותובנות',
          icon: FileText,
        },
      ],
    },
    { name: 'צור קשר', href: '/contact' },
  ],
  cta: {
    name: 'הגישו מועמדות',
    href: '/apply',
  },
  topBar: {
    phone: '03-555-1234',
    email: 'info@weccelerate.co.il',
    languages: [
      { code: 'he', name: 'עברית', href: '/' },
      { code: 'en', name: 'English', href: '/en' },
    ],
  },
};

// =============================================================================
// NAVBAR COMPONENT
// =============================================================================

export function CorporateNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

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

  return (
    <>
      {/* Top Bar - Contact Info */}
      <div className="bg-slate-900 text-white text-sm hidden lg:block">
        <div className="container-corporate">
          <div className="flex items-center justify-between h-10">
            {/* Contact */}
            <div className="flex items-center gap-6">
              <a
                href={`tel:${navigation.topBar.phone}`}
                className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{navigation.topBar.phone}</span>
              </a>
              <a
                href={`mailto:${navigation.topBar.email}`}
                className="flex items-center gap-2 hover:text-yellow-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{navigation.topBar.email}</span>
              </a>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-4">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {navigation.topBar.languages.map((lang, idx) => (
                <span key={lang.code} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-slate-600">|</span>}
                  <Link
                    href={lang.href}
                    className={`hover:text-yellow-400 transition-colors ${
                      pathname === lang.href || (lang.code === 'he' && !pathname.startsWith('/en'))
                        ? 'text-yellow-400 font-medium'
                        : ''
                    }`}
                  >
                    {lang.name}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' 
            : 'bg-white border-b border-slate-100'}
        `}
      >
        <nav className="container-corporate">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
                <span className="text-yellow-400 font-bold text-xl">W</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  WeCcelerate
                </span>
                <span className="text-xs text-slate-500 -mt-0.5">
                  וויסלרייט
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.main.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.children ? (
                    <>
                      <button
                        className={`
                          flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors
                          ${activeDropdown === item.name 
                            ? 'text-slate-900' 
                            : 'text-slate-600 hover:text-slate-900'}
                        `}
                      >
                        {item.name}
                        <ChevronDown className={`
                          w-4 h-4 transition-transform
                          ${activeDropdown === item.name ? 'rotate-180' : ''}
                        `} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeDropdown === item.name && (
                        <div className="absolute top-full right-0 w-80 bg-white border border-slate-200 shadow-xl mt-0 py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
                            >
                              <div className="p-2 bg-slate-100">
                                <child.icon className="w-5 h-5 text-slate-700" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{child.name}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{child.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        px-4 py-2 text-sm font-medium transition-colors
                        ${pathname === item.href 
                          ? 'text-slate-900' 
                          : 'text-slate-600 hover:text-slate-900'}
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
                className="hidden lg:inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                {navigation.cta.name}
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* Portal Link */}
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                כניסה לפורטל
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900"
                aria-label={isMobileMenuOpen ? 'סגור תפריט' : 'פתח תפריט'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100">
            <div className="container-corporate py-4">
              {navigation.main.map((item) => (
                <div key={item.name} className="border-b border-slate-100 last:border-b-0">
                  {item.children ? (
                    <div className="py-3">
                      <button
                        onClick={() => setActiveDropdown(
                          activeDropdown === item.name ? null : item.name
                        )}
                        className="flex items-center justify-between w-full text-right"
                      >
                        <span className="font-medium text-slate-900">{item.name}</span>
                        <ChevronDown className={`
                          w-5 h-5 text-slate-400 transition-transform
                          ${activeDropdown === item.name ? 'rotate-180' : ''}
                        `} />
                      </button>
                      
                      {activeDropdown === item.name && (
                        <div className="mt-3 mr-4 space-y-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-center gap-3 py-2 text-slate-600 hover:text-slate-900"
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block py-3 font-medium text-slate-900"
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
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 font-semibold"
                >
                  {navigation.cta.name}
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 text-slate-700 py-3 font-medium"
                >
                  כניסה לפורטל
                </Link>
              </div>

              {/* Mobile Contact */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-sm text-slate-500">
                <a href={`tel:${navigation.topBar.phone}`} className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{navigation.topBar.phone}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default CorporateNavbar;
