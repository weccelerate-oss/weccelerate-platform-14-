/**
 * Portal Sidebar
 * 
 * Sidebar navigation for the entrepreneur portal.
 * Shows different menu items based on user role.
 * 
 * @module components/portal/sidebar
 */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Calendar,
  MessageSquare,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@prisma/client';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  badge?: string;
}

interface PortalSidebarProps {
  role: UserRole;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'דשבורד',
    href: '/portal',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'הפרויקטים שלי',
    href: '/portal/projects',
    icon: <FolderKanban className="w-5 h-5" />,
  },
  {
    label: 'מסמכים',
    href: '/portal/documents',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'לוח שנה',
    href: '/portal/calendar',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: 'הודעות',
    href: '/portal/messages',
    icon: <MessageSquare className="w-5 h-5" />,
    badge: '3',
  },
  {
    label: 'מרכז למידה',
    href: '/portal/learning',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    label: 'ניהול משתמשים',
    href: '/portal/users',
    icon: <Users className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
  {
    label: 'דוחות',
    href: '/portal/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['ADMIN', 'MENTOR'],
  },
  {
    label: 'הגדרות',
    href: '/portal/settings',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: 'עזרה',
    href: '/portal/help',
    icon: <HelpCircle className="w-5 h-5" />,
  },
];

export function PortalSidebar({ role }: PortalSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter items based on user role
  const visibleItems = SIDEBAR_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] bg-slate-900/50 border-l border-slate-800',
        'hidden lg:flex flex-col transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/portal' && pathname.startsWith(item.href));

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                'group relative',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute right-0 w-1 h-6 bg-cyan-500 rounded-l-full"
                />
              )}

              {/* Icon */}
              <span className={cn(
                'flex-shrink-0',
                isActive && 'text-cyan-400'
              )}>
                {item.icon}
              </span>

              {/* Label */}
              {!isCollapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute right-full mr-2 px-2 py-1 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  {item.badge && (
                    <span className="mr-2 px-1.5 py-0.5 text-xs bg-cyan-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <>
              <ChevronRight className="w-5 h-5" />
              <span>כווץ תפריט</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
