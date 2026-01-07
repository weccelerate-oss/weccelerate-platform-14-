/**
 * Portal Navigation
 * 
 * Top navigation bar for the entrepreneur portal.
 * Shows user info, notifications, and quick actions.
 * 
 * @module components/portal/navigation
 */

'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@prisma/client';

interface PortalNavigationProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
    company?: string | null;
  };
}

export function PortalNavigation({ user }: PortalNavigationProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Role badge colors
  const roleBadgeColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-500/20 text-red-400',
    ENTREPRENEUR: 'bg-cyan-500/20 text-cyan-400',
    MENTOR: 'bg-purple-500/20 text-purple-400',
    INVESTOR: 'bg-amber-500/20 text-amber-400',
    PARTNER: 'bg-emerald-500/20 text-emerald-400',
  };

  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'מנהל',
    ENTREPRENEUR: 'יזם',
    MENTOR: 'מנטור',
    INVESTOR: 'משקיע',
    PARTNER: 'שותף',
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <a href="/portal" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">W</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-semibold">WeCcelerate</div>
                <div className="text-xs text-slate-400">פורטל יזמים</div>
              </div>
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />
            </button>

            {/* Settings */}
            <a 
              href="/portal/settings" 
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </a>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.company || user.email}</div>
                </div>
                
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 transition-transform',
                  isUserMenuOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700 shadow-xl overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                          {user.image ? (
                            <img 
                              src={user.image} 
                              alt={user.name}
                              className="w-full h-full object-cover rounded-full" 
                            />
                          ) : (
                            <span className="text-lg font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={cn(
                          'inline-flex px-2 py-1 rounded-lg text-xs font-medium',
                          roleBadgeColors[user.role]
                        )}>
                          {roleLabels[user.role]}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <a
                        href="/portal/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>הפרופיל שלי</span>
                      </a>
                      <a
                        href="/portal/settings"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>הגדרות</span>
                      </a>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>התנתק</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-800 text-slate-400"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-900"
          >
            <div className="p-4 space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <span className={cn(
                    'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                    roleBadgeColors[user.role]
                  )}>
                    {roleLabels[user.role]}
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <a href="/portal/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300">
                <User className="w-5 h-5" />
                <span>הפרופיל שלי</span>
              </a>
              <a href="/portal/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 text-slate-300">
                <Settings className="w-5 h-5" />
                <span>הגדרות</span>
              </a>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <span>התנתק</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
