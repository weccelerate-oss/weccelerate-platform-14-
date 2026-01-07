/**
 * Dashboard Content Component
 * 
 * Client component that renders the personalized dashboard.
 * Handles interactive elements and animations.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectTimeline } from './components/project-timeline';
import { FileVault } from './components/file-vault';
import { WhatsAppButton } from './components/whatsapp-button';
import { WelcomeOnboarding } from './components/welcome-onboarding';
import { StatsCards } from './components/stats-cards';
import { RecentActivity } from './components/recent-activity';
import { QuickActions } from './components/quick-actions';
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
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardContent({
  user,
  project,
  notifications,
  activities,
}: DashboardContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  // If no project, show onboarding
  if (!project) {
    return <WelcomeOnboarding user={user} />;
  }

  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed right-0 top-0 h-screen bg-slate-900 text-white z-40 flex flex-col"
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold bg-gradient-to-l from-royal-400 to-cyan-400 bg-clip-text text-transparent"
              >
                WeCcelerate
              </motion.span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className={cn(
                'w-5 h-5 transition-transform',
                !isSidebarOpen && 'rotate-180'
              )} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <SidebarLink icon={<LayoutDashboard />} label="לוח בקרה" active href="/portal/dashboard" isOpen={isSidebarOpen} />
          <SidebarLink icon={<Target />} label="הפרויקט שלי" href="/portal/project" isOpen={isSidebarOpen} />
          <SidebarLink icon={<Calendar />} label="אירועים" href="/portal/events" isOpen={isSidebarOpen} />
          <SidebarLink icon={<TrendingUp />} label="התקדמות" href="/portal/progress" isOpen={isSidebarOpen} />
          <SidebarLink icon={<Users />} label="צוות" href="/portal/team" isOpen={isSidebarOpen} />
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
              {user.name?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.company}</p>
              </motion.div>
            )}
          </div>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-4"
            >
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <Settings className="w-4 h-4" />
                <span>הגדרות</span>
              </button>
              <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
        'flex-1 transition-all duration-300',
        isSidebarOpen ? 'mr-[280px]' : 'mr-[80px]'
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {getGreeting()}, {user.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-slate-500">
                הנה סיכום ההתקדמות של הפרויקט שלך
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Quick action */}
              <button className="flex items-center gap-2 px-4 py-2 bg-royal-600 hover:bg-royal-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>פעולה חדשה</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <StatsCards project={project} />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Timeline - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        ציר הזמן של הפרויקט
                      </h2>
                      <p className="text-sm text-slate-500">
                        {project.name}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-royal-100 text-royal-700 text-sm font-medium rounded-full">
                      שלב {project.stage}/10
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <ProjectTimeline
                    status={project.status}
                    stage={project.stage}
                    timeline={project.timeline as Record<string, unknown> | null}
                  />
                </div>
              </motion.div>

              {/* File Vault */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        כספת המסמכים
                      </h2>
                      <p className="text-sm text-slate-500">
                        {project.files.length} מסמכים
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-royal-600 hover:bg-royal-50 rounded-lg transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>העלאת קובץ</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <FileVault files={project.files} />
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <QuickActions project={project} />
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-900">
                    פעילות אחרונה
                  </h2>
                </div>
                <div className="p-6">
                  <RecentActivity activities={activities} />
                </div>
              </motion.div>

              {/* AI Assistant Teaser */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-royal-600 to-purple-700 p-6 text-white"
              >
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-4 right-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">בקרוב</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    עוזר AI אישי
                  </h3>
                  <p className="text-sm opacity-80 mb-4">
                    קבל תשובות מיידיות לשאלות על הפרויקט, טיפים לגיוס, ועוד.
                  </p>
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                    הצטרף לרשימת ההמתנה
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton
        phone={project.user.phone}
        projectName={project.name}
      />
    </div>
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
}

function SidebarLink({ icon, label, href, isOpen, active }: SidebarLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
        active
          ? 'bg-royal-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {isOpen && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="truncate"
        >
          {label}
        </motion.span>
      )}
    </a>
  );
}

export default DashboardContent;
