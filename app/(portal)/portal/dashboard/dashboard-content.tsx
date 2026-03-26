/**
 * Dashboard Content Component
 *
 * Premium entrepreneur portal dashboard with modern UX.
 * Features collapsible sidebar, mobile bottom nav, contextual greeting, and organized widgets.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  FolderOpen,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { ProjectTimeline } from './components/project-timeline';
import { FileVault } from './components/file-vault';
import { WhatsAppButton } from './components/whatsapp-button';
import { WelcomeOnboarding } from './components/welcome-onboarding';
import { StatsCards } from './components/stats-cards';
import { RecentActivity } from './components/recent-activity';
import { QuickActions } from './components/quick-actions';
import { PurchasedServices } from './components/purchased-services';
import type { DealProductDisplay } from './components/purchased-services';
import type { Project, File, ProjectNote, Notification, ActivityLog } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string | null;
  image?: string | null;
}

interface ProjectWithRelations extends Project {
  files: File[];
  notes: ProjectNote[];
  user: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
}

interface DashboardContentProps {
  user: DashboardUser;
  project: ProjectWithRelations | null;
  notifications: Notification[];
  activities: ActivityLog[];
  dbError?: boolean;
  dealProducts?: DealProductDisplay[];
}

// =============================================================================
// SIDEBAR NAV ITEMS
// =============================================================================

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  id: string;
  badge?: number;
  comingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'לוח בקרה', href: '/portal/dashboard', id: 'dashboard' },
  { icon: Target, label: 'הפרויקט שלי', href: '/portal/dashboard', id: 'project' },
  { icon: FolderOpen, label: 'מסמכים', href: '/portal/dashboard', id: 'documents' },
  { icon: GraduationCap, label: 'מרכז למידה', href: '/portal/learning', id: 'learning' },
  { icon: TrendingUp, label: 'התקדמות', href: '/portal/dashboard', id: 'progress' },
  { icon: Calendar, label: 'לוח שנה', href: '/portal/dashboard', id: 'calendar', comingSoon: true },
  { icon: MessageSquare, label: 'הודעות', href: '/portal/dashboard', id: 'messages', comingSoon: true },
];

const BOTTOM_NAV_ITEMS = [
  { icon: Settings, label: 'הגדרות', href: '/portal/dashboard', id: 'settings', comingSoon: true },
  { icon: HelpCircle, label: 'עזרה', href: '/portal/dashboard', id: 'help', comingSoon: true },
];

// Mobile bottom nav - key items for thumb access
const MOBILE_BOTTOM_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: 'בית', href: '/portal/dashboard', id: 'dashboard' },
  { icon: Target, label: 'פרויקט', href: '/portal/dashboard', id: 'project' },
  { icon: GraduationCap, label: 'למידה', href: '/portal/learning', id: 'learning' },
  { icon: FolderOpen, label: 'מסמכים', href: '/portal/dashboard', id: 'documents' },
  { icon: Menu, label: 'עוד', href: '#more', id: 'more' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardContent({
  user,
  project,
  notifications,
  activities,
  dbError,
  dealProducts = [],
}: DashboardContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileSidebarOpen]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (project) formData.append('projectId', project.id);

      const response = await fetch('/api/portal/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'העלאה נכשלה');
      }

      setUploadMessage({ type: 'success', text: `הקובץ "${file.name}" הועלה בהצלחה!` });
      setTimeout(() => {
        setShowUploadDialog(false);
        setUploadMessage(null);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setUploadMessage({ type: 'error', text: err instanceof Error ? err.message : 'העלאה נכשלה' });
    } finally {
      setIsUploading(false);
    }
  };

  // If DB error, show error state
  if (dbError && !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">שגיאה בטעינת הנתונים</h2>
          <p className="text-slate-500 mb-6">לא הצלחנו לטעון את נתוני הפרויקט שלך. נסה לרענן את הדף.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            רענן דף
          </button>
        </div>
      </div>
    );
  }

  // If no project, show onboarding
  if (!project) {
    return <WelcomeOnboarding user={user} />;
  }

  const firstName = user.name?.split(' ')[0] || 'יזם';
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const completionPercent = Math.min(100, Math.round((project.stage / 10) * 100));

  return (
    <div className="flex min-h-screen bg-slate-50/50" dir="rtl">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ====== DESKTOP SIDEBAR ====== */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 272 : 76 }}
        className={cn(
          'fixed right-0 top-0 h-screen z-50 flex flex-col',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
          'border-l border-slate-800/50',
          'hidden lg:flex'
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/60">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <div>
                  <span className="text-base font-bold text-white">WeCcelerate</span>
                  <span className="block text-[10px] text-slate-400 -mt-0.5">פורטל יזמים</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center"
              >
                <span className="text-white font-bold text-sm">W</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Project Progress Mini */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">התקדמות הפרויקט</span>
              <span className="text-xs font-semibold text-cyan-400">{completionPercent}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-l from-cyan-400 to-royal-500 rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 truncate">{project.name}</p>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.id}
              icon={<item.icon className="w-[18px] h-[18px]" />}
              label={item.label}
              href={item.href}
              isOpen={isSidebarOpen}
              active={activeNav === item.id}
              badge={item.badge}
              onClick={() => setActiveNav(item.id)}
            />
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 pb-2 space-y-1 border-t border-slate-800/60 pt-2">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.id}
              icon={<item.icon className="w-[18px] h-[18px]" />}
              label={item.label}
              href={item.href}
              isOpen={isSidebarOpen}
              active={activeNav === item.id}
              onClick={() => setActiveNav(item.id)}
            />
          ))}
        </div>

        {/* User Section */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-800/60">
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer group',
            !isSidebarOpen && 'justify-center'
          )}>
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-slate-800">
                {firstName.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-sm text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.company || user.email}</p>
              </motion.div>
            )}
            {isSidebarOpen && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-700 transition-all text-slate-400 hover:text-white"
                title="התנתק"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ====== MOBILE SIDEBAR (Full drawer) ====== */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-[280px] z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 lg:hidden"
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-base font-bold text-white">WeCcelerate</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project progress in mobile sidebar */}
            <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">התקדמות הפרויקט</span>
                <span className="text-xs font-semibold text-cyan-400">{completionPercent}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-cyan-400 to-royal-500 rounded-full transition-all duration-700"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 truncate">{project.name}</p>
            </div>

            <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <SidebarLink
                  key={item.id}
                  icon={<item.icon className="w-[18px] h-[18px]" />}
                  label={item.label}
                  href={item.href}
                  isOpen={true}
                  active={activeNav === item.id}
                  badge={item.badge}
                  onClick={() => { setActiveNav(item.id); setIsMobileSidebarOpen(false); }}
                />
              ))}

              <div className="h-px bg-slate-800/60 my-3" />

              {BOTTOM_NAV_ITEMS.map((item) => (
                <SidebarLink
                  key={item.id}
                  icon={<item.icon className="w-[18px] h-[18px]" />}
                  label={item.label}
                  href={item.href}
                  isOpen={true}
                  active={activeNav === item.id}
                  onClick={() => { setActiveNav(item.id); setIsMobileSidebarOpen(false); }}
                />
              ))}
            </nav>

            {/* User section */}
            <div className="px-4 pb-6 pt-3 border-t border-slate-800/60">
              <div className="flex items-center gap-3 p-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                    {firstName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                  title="התנתק"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ====== MAIN CONTENT ====== */}
      <main className={cn(
        'flex-1 transition-all duration-300 min-h-screen',
        'pb-20 lg:pb-0', // Bottom padding for mobile nav
        'lg:mr-[272px]',
        !isSidebarOpen && 'lg:mr-[76px]'
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
            {/* Greeting */}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
                הנה סיכום ההתקדמות של הפרויקט שלך
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <Search className="w-[18px] h-[18px] text-slate-500" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Bell className="w-[18px] h-[18px] text-slate-500" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute left-0 sm:left-auto sm:right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                      style={{ maxWidth: '320px' }}
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm">התראות</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-xs text-royal-600 hover:underline">סגור</button>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">אין התראות חדשות</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <a
                              key={notif.id}
                              href={notif.link || '#'}
                              className={cn(
                                'block px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-50 last:border-0',
                                !notif.isRead && 'bg-royal-50/30'
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                                  !notif.isRead ? 'bg-royal-500' : 'bg-transparent'
                                )} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{notif.message}</p>
                                </div>
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-slate-100 text-center">
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-xs text-royal-600 font-medium hover:underline"
                        >
                          סגור
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* New Action Button — opens upload dialog */}
              <button
                onClick={() => setShowUploadDialog(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">העלאת קובץ</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - expandable */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="px-4 py-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="חיפוש מסמכים, פעולות, הגדרות..."
                      className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-400"
                      autoFocus
                    />
                    <button
                      onClick={() => setShowSearch(false)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Close notification dropdown when clicking outside */}
        {showNotifications && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowNotifications(false)}
          />
        )}

        {/* Dashboard Content */}
        <div className="p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6">
          {/* Mobile: Project summary card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold truncate">{project.name}</p>
                  <p className="text-[11px] text-slate-400">{project.industry || 'Technology'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-lg">
                {completionPercent}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-l from-cyan-400 to-royal-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Stats Row */}
          <StatsCards project={project} />

          {/* Purchased Services from Pipedrive */}
          {dealProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              <PurchasedServices products={dealProducts} />
            </motion.div>
          )}

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left: Main content - 2 cols */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Project Timeline */}
              <DashboardCard
                title="ציר הזמן של הפרויקט"
                subtitle={project.name}
                badge={`שלב ${project.stage}/10`}
                delay={0}
              >
                <ProjectTimeline
                  status={project.status}
                  stage={project.stage}
                  timeline={project.timeline as Record<string, unknown> | null}
                />
              </DashboardCard>

              {/* File Vault */}
              <DashboardCard
                title="כספת המסמכים"
                subtitle={`${project.files.length} מסמכים`}
                action={
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-royal-600 hover:bg-royal-50 active:bg-royal-100 rounded-lg transition-colors font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>העלאת קובץ</span>
                  </button>
                }
                delay={0.1}
              >
                <FileVault files={project.files} />
              </DashboardCard>
            </div>

            {/* Right sidebar widgets */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <QuickActions project={project} />
              </motion.div>

              {/* Recent Activity */}
              <DashboardCard
                title="פעילות אחרונה"
                delay={0.2}
              >
                <RecentActivity activities={activities} />
              </DashboardCard>

              {/* Learning Center Widget */}
              <motion.a
                href="/portal/learning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="block relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white group hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-xs font-medium text-cyan-400/90">מרכז הלמידה</span>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">קורסים להעשרה ליזם</h3>
                  <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                    דוחות כספיים, הערכת שווי, תוכניות עסקיות, השקעות ופיתוח - כל מה שיזם צריך לדעת.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-400 group-hover:gap-3 transition-all">
                    <span>התחל ללמוד</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </motion.a>
            </div>
          </div>
        </div>
      </main>

      {/* ====== MOBILE BOTTOM NAVIGATION ====== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 safe-area-pb">
        <div className="flex items-center justify-around px-2 h-16">
          {MOBILE_BOTTOM_NAV.map((item) => {
            const isActive = activeNav === item.id;
            const isMore = item.id === 'more';

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isMore) {
                    setIsMobileSidebarOpen(true);
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[56px]',
                  isActive
                    ? 'text-royal-600'
                    : 'text-slate-400 active:text-slate-600'
                )}
              >
                <div className="relative">
                  <item.icon className={cn('w-5 h-5', isActive && 'text-royal-600')} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive ? 'text-royal-600' : 'text-slate-400'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute bottom-1 w-5 h-0.5 bg-royal-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Upload Dialog */}
      <AnimatePresence>
        {showUploadDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setShowUploadDialog(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900">העלאת קובץ</h3>
                  <button
                    onClick={() => !isUploading && setShowUploadDialog(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {uploadMessage && (
                  <div className={cn(
                    'p-3 rounded-xl text-sm mb-4',
                    uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  )}>
                    {uploadMessage.text}
                  </div>
                )}

                <label className={cn(
                  'flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                  isUploading ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-royal-400 hover:bg-royal-50/30'
                )}>
                  {isUploading ? (
                    <>
                      <div className="w-10 h-10 border-3 border-royal-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-500">מעלה...</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-10 h-10 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">לחץ לבחירת קובץ</span>
                      <span className="text-xs text-slate-400">PDF, Word, Excel, PowerPoint, תמונה (עד 25MB)</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    disabled={isUploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.csv"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Button — sends to WeCcelerate team, not the user */}
      <WhatsAppButton
        phone={process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '972555647538'}
        projectName={project.name}
      />
    </div>
  );
}

// =============================================================================
// DASHBOARD CARD WRAPPER
// =============================================================================

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}

function DashboardCard({ title, subtitle, badge, action, delay = 0, children }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden"
    >
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-[15px] font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className="px-2 sm:px-2.5 py-1 bg-royal-50 text-royal-700 text-[11px] sm:text-xs font-semibold rounded-lg whitespace-nowrap">
              {badge}
            </span>
          )}
          {action}
        </div>
      </div>
      <div className="p-3 sm:p-5">{children}</div>
    </motion.div>
  );
}

// =============================================================================
// SIDEBAR LINK COMPONENT
// =============================================================================

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isOpen: boolean;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

function SidebarLink({ icon, label, href, isOpen, active, badge, onClick }: SidebarLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group',
        active
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-l-full"
        />
      )}

      <span className={cn('flex-shrink-0', active && 'text-cyan-400')}>
        {icon}
      </span>

      {isOpen && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm truncate flex-1"
        >
          {label}
        </motion.span>
      )}

      {isOpen && badge && badge > 0 && (
        <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}

      {!isOpen && (
        <div className="absolute right-full mr-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {label}
          <div className="absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-slate-800" />
        </div>
      )}
    </a>
  );
}

export default DashboardContent;
