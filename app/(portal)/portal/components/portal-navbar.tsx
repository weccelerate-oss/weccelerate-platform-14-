/**
 * Portal Navbar
 *
 * Shared top navigation bar for all portal pages.
 * Includes logo, page title, and user info.
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Target,
  FolderOpen,
  GraduationCap,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface PortalNavbarProps {
  userName: string;
  userEmail: string;
}

const NAV_LINKS = [
  { href: '/portal/dashboard', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/portal/project', label: 'הפרויקט שלי', icon: Target },
  { href: '/portal/documents', label: 'מסמכים', icon: FolderOpen },
  { href: '/portal/learning', label: 'מרכז למידה', icon: GraduationCap },
  { href: '/portal/progress', label: 'התקדמות', icon: TrendingUp },
];

export function PortalNavbar({ userName, userEmail }: PortalNavbarProps) {
  const pathname = usePathname();
  const firstName = userName?.split(' ')[0] || 'יזם';

  return (
    <header className="sticky top-0 z-40 bg-[#0a0e27]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top row: Logo + User */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/portal/dashboard" className="flex items-center gap-2.5">
            <img
              src="/images/logos/weccelerate-logo.jpeg"
              alt="WeCcelerate"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white">WeCcelerate</span>
              <span className="block text-[10px] text-white/40 -mt-0.5">פורטל יזמים</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== '/portal/dashboard' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#c8a951]/10 text-[#c8a951] border border-[#c8a951]/20'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white/70">{userName}</p>
              <p className="text-[10px] text-white/30">{userEmail}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8a951] to-[#e8d48b] flex items-center justify-center text-[#070b1e] font-semibold text-sm">
              {firstName.charAt(0)}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/40 hover:text-white/70"
              title="התנתק"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/portal/dashboard' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-[#c8a951]/10 text-[#c8a951]'
                    : 'text-white/40 hover:text-white/60'
                )}
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
