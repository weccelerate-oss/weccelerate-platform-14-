/**
 * Admin Sidebar Component
 * 
 * Navigation sidebar for admin dashboard.
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Video,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  Bell,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const NAV_ITEMS = [
  {
    label: 'סקירה כללית',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'ניהול תוכן',
    items: [
      { label: 'עדכונים (טיקר)', href: '/admin/news', icon: Newspaper },
      { label: 'אירועים', href: '/admin/events', icon: Calendar },
      { label: 'סרטונים', href: '/admin/videos', icon: Video },
      { label: 'סיפורי הצלחה', href: '/admin/stories', icon: BookOpen },
    ],
  },
  {
    label: 'ניהול משתמשים',
    items: [
      { label: 'יזמים', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'מערכת',
    items: [
      { label: 'הגדרות', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">WeCcelerate</h1>
            <p className="text-xs text-slate-400">לוח בקרה למנהלים</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_ITEMS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            {section.href ? (
              // Single item
              <Link
                href={section.href}
                className={cn(
                  'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                  pathname === section.href
                    ? 'bg-royal-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.label}</span>
              </Link>
            ) : (
              // Section with items
              <>
                <p className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.label}
                </p>
                {section.items?.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-6 py-2.5 text-sm transition-colors',
                      pathname === item.href
                        ? 'bg-royal-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
            {user.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>התנתקות</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

export default AdminSidebar;
