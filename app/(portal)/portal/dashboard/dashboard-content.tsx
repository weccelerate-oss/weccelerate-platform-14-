/**
 * Dashboard Content Component
 *
 * Pure dashboard content — no sidebar/header (handled by portal layout).
 * Shows stats, timeline, files, quick actions, and Pipedrive data.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Target,
  GraduationCap,
  FolderOpen,
  ChevronLeft,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectTimeline } from './components/project-timeline';
import { FileVault } from './components/file-vault';
import { WhatsAppButton } from './components/whatsapp-button';
import { WelcomeOnboarding } from './components/welcome-onboarding';
import { StatsCards } from './components/stats-cards';
import { RecentActivity } from './components/recent-activity';
import { QuickActions } from './components/quick-actions';
import { PurchasedServices } from './components/purchased-services';
import { DealActivities } from './components/deal-activities';
import { ServiceTimeline } from './components/service-timeline';
import type { DealProductDisplay } from './components/purchased-services';
import type { DealActivityDisplay } from './components/deal-activities';
import type { MatchedService } from '@/lib/service-matcher';
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
  dealActivities?: DealActivityDisplay[];
  dealStatus?: string;
  matchedServices?: MatchedService[];
}

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
  dealActivities = [],
  dealStatus,
  matchedServices = [],
}: DashboardContentProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadMessage({ type: 'error', text: `הקובץ גדול מדי (${(file.size / (1024 * 1024)).toFixed(1)}MB). הגודל המקסימלי הוא 4MB.` });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (project) formData.append('projectId', project.id);

      const response = await fetch('/api/portal/upload', { method: 'POST', body: formData });
      if (response.status === 413) throw new Error('הקובץ גדול מדי. הגודל המקסימלי הוא 4MB.');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'העלאה נכשלה');

      setUploadMessage({ type: 'success', text: `הקובץ "${file.name}" הועלה בהצלחה!` });
      setTimeout(() => { setShowUploadDialog(false); setUploadMessage(null); window.location.reload(); }, 1500);
    } catch (err) {
      setUploadMessage({ type: 'error', text: err instanceof Error ? err.message : 'העלאה נכשלה' });
    } finally {
      setIsUploading(false);
    }
  };

  // Error state
  if (dbError && !project) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">שגיאה בטעינת הנתונים</h2>
          <p className="text-white/50 mb-6">לא הצלחנו לטעון את נתוני הפרויקט שלך. נסה לרענן את הדף.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] text-[#070b1e] rounded-sm font-bold">
            רענן דף
          </button>
        </div>
      </div>
    );
  }

  // No project — show onboarding
  if (!project) {
    return <WelcomeOnboarding user={user} />;
  }

  const firstName = user.name?.split(' ')[0] || 'יזם';

  // Get greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : hour < 21 ? 'ערב טוב' : 'לילה טוב';

  return (
    <>
      {/* Greeting */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <h1 className="text-lg sm:text-xl font-bold text-white">{greeting}, {firstName}</h1>
        <p className="text-xs text-white/50">הנה סיכום ההתקדמות של הפרויקט שלך</p>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Stats Row */}
        <StatsCards project={project} />

        {/* Services Timeline from Pipedrive */}
        {matchedServices.length > 0 && (
          <DashboardCard
            title="השירותים שלך ב-WeCcelerate"
            subtitle={project.name}
            badge={`${matchedServices.filter(s => s.allDone).length}/${matchedServices.length}`}
          >
            <ServiceTimeline services={matchedServices} projectId={project.id} />
          </DashboardCard>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Main content - 2 cols */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* File Vault */}
            <DashboardCard
              title="כספת המסמכים"
              subtitle={`${project.files.length} מסמכים`}
              action={
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#c8a951] hover:bg-[#c8a951]/10 rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>העלאת קובץ</span>
                </button>
              }
            >
              <FileVault files={project.files} />
            </DashboardCard>
          </div>

          {/* Right sidebar widgets */}
          <div className="space-y-4 sm:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <QuickActions project={project} />
            </motion.div>

            <DashboardCard title="פעילות אחרונה">
              <RecentActivity activities={activities} />
            </DashboardCard>

            {/* Learning Center Widget */}
            <motion.a
              href="/portal/learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="block relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 text-white group hover:border-[#c8a951]/20 transition-all"
            >
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <img src="/images/portal/learning-hero.png" alt="" className="w-full h-full object-cover opacity-10" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-[#c8a951]" />
                  <span className="text-xs font-medium text-[#c8a951]">מרכז הלמידה</span>
                </div>
                <h3 className="text-base font-semibold mb-1.5">קורסים להעשרה ליזם</h3>
                <p className="text-sm text-white/50 mb-4 leading-relaxed">
                  דוחות כספיים, הערכת שווי, תוכניות עסקיות, השקעות ופיתוח.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#c8a951] group-hover:gap-3 transition-all">
                  <span>התחל ללמוד</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </motion.a>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <AnimatePresence>
        {showUploadDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isUploading && setShowUploadDialog(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <div className="bg-[#0d1321] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white">העלאת קובץ</h3>
                  <button onClick={() => !isUploading && setShowUploadDialog(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {uploadMessage && (
                  <div className={cn(
                    'p-3 rounded-xl text-sm mb-4',
                    uploadMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  )}>
                    {uploadMessage.text}
                  </div>
                )}

                <label className={cn(
                  'flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                  isUploading ? 'border-white/[0.06] bg-white/[0.02]' : 'border-white/[0.1] hover:border-[#c8a951]/30 hover:bg-[#c8a951]/[0.03]'
                )}>
                  {isUploading ? (
                    <>
                      <div className="w-10 h-10 border-3 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-white/50">מעלה...</span>
                    </>
                  ) : (
                    <>
                      <FolderOpen className="w-10 h-10 text-white/30" />
                      <span className="text-sm font-medium text-white/70">לחץ לבחירת קובץ</span>
                      <span className="text-xs text-white/30">PDF, Word, Excel, PowerPoint, תמונה (עד 4MB)</span>
                    </>
                  )}
                  <input type="file" className="hidden" disabled={isUploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.csv"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp */}
      <WhatsAppButton phone={process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '972555647538'} projectName={project.name} />
    </>
  );
}

// =============================================================================
// DASHBOARD CARD WRAPPER
// =============================================================================

function DashboardCard({ title, subtitle, badge, action, children }: {
  title: string; subtitle?: string; badge?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/[0.06] flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-[15px] font-semibold text-white/90">{title}</h2>
          {subtitle && <p className="text-[11px] text-white/40 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className="px-2 sm:px-2.5 py-1 bg-[#c8a951]/10 text-[#c8a951] text-[11px] sm:text-xs font-semibold rounded-lg border border-[#c8a951]/20">
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

export default DashboardContent;
