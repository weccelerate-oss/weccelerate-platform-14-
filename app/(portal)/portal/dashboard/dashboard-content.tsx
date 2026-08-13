/**
 * Dashboard Content Component
 *
 * Pure dashboard content — no sidebar/header (handled by portal layout).
 * Shows stats, timeline, files, quick actions, and Pipedrive data.
 */

'use client';

import { motion } from 'framer-motion';
import { GraduationCap, ChevronLeft, Compass, FolderOpen } from 'lucide-react';
import { WhatsAppButton } from './components/whatsapp-button';
import { WelcomeOnboarding } from './components/welcome-onboarding';
import { StatsCards } from './components/stats-cards';
import { RecentActivity } from './components/recent-activity';
import { QuickActions } from './components/quick-actions';
import { ServiceTimeline } from './components/service-timeline';
import type { DealProductDisplay } from './components/purchased-services';
import type { DealActivityDisplay } from './components/deal-activities';
import type { MatchedService } from '@/lib/service-matcher';
import type { Project, File, ProjectNote, ActivityLog } from '@prisma/client';

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
  activities: ActivityLog[];
  dbError?: boolean;
  dealProducts?: DealProductDisplay[];
  dealActivities?: DealActivityDisplay[];
  dealStatus?: string;
  matchedServices?: MatchedService[];
  driveFiles?: { id: string; name: string; mimeType: string; size: string; webViewLink: string; webContentLink: string | null; downloadLink: string; modifiedTime: string }[];
  /** Founder Journey summary — null hides the widget (e.g. DB unavailable). */
  journey?: { total: number; answered: number; ready: number } | null;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DashboardContent({
  user,
  project,
  activities,
  dbError,
  dealProducts = [],
  dealActivities = [],
  dealStatus,
  matchedServices = [],
  driveFiles = [],
  journey = null,
}: DashboardContentProps) {
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

  // No project — show onboarding. Updates are not duplicated here: the navbar
  // bell is the single place they live, on every portal page.
  if (!project) {
    return <WelcomeOnboarding user={user} />;
  }

  const firstName = user.name?.split(' ')[0] || 'יזם';

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : hour < 21 ? 'ערב טוב' : 'לילה טוב';

  return (
    <>
      {/* Greeting */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-2 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/portal/dashboard-hero.png" alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b1e]/45 to-[#070b1e]" />
        </div>
        <h1 className="relative z-10 text-lg sm:text-xl font-bold text-white" suppressHydrationWarning>{greeting}, {firstName}</h1>
        <p className="relative z-10 text-xs text-white/50">הנה סיכום ההתקדמות של הפרויקט שלך</p>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Stats Row */}
        <StatsCards project={project} />

        {/* Services Timeline from Pipedrive */}
        {matchedServices.length > 0 && (
          <ServiceTimeline
            services={matchedServices}
            projectId={project.id}
            files={project.files.map(f => ({ id: f.id, name: f.name, displayName: f.displayName, url: f.url, size: f.size, mimeType: f.mimeType }))}
            driveFiles={driveFiles}
          />
        )}

        {/* Widgets */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <QuickActions project={project} />
            </motion.div>

            <DashboardCard title="פעילות אחרונה">
              <RecentActivity activities={activities} />
            </DashboardCard>

            {/* Founder Journey Widget */}
            {journey && journey.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="wc-glass wc-shine wc-glass-lift block relative overflow-hidden rounded-2xl border border-[#c8a951]/25 bg-gradient-to-br from-[#c8a951]/[0.10] to-white/[0.02] p-5 text-white group hover:border-[#c8a951]/45 transition-all"
              >
                <div className="relative flex flex-wrap items-center gap-5">
                  {/* mini readiness ring */}
                  <div className="relative w-[74px] h-[74px] shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-white/[0.08]" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        strokeWidth="9"
                        strokeLinecap="round"
                        stroke="#c8a951"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={
                          2 * Math.PI * 42 * (1 - (journey.total ? journey.answered / journey.total : 0))
                        }
                        style={{ filter: 'drop-shadow(0 0 5px rgba(200,169,81,.5))' }}
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-sm font-black text-[#e8d48b] tabular-nums">
                      {journey.total ? Math.round((journey.answered / journey.total) * 100) : 0}%
                    </div>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Compass className="w-4 h-4 text-[#c8a951]" />
                      <span className="text-xs font-medium text-[#c8a951]">מסע מרעיון למיזם</span>
                    </div>
                    <h3 className="text-base font-semibold mb-1">
                      {journey.answered === 0
                        ? 'צא למסע — הכנה לפגישת משקיעים'
                        : `ענית על ${journey.answered} מתוך ${journey.total} שאלות משקיעים`}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-0">
                      {journey.ready > 0
                        ? `${journey.ready} תשובות כבר בתיק המוכנות שלך`
                        : 'ענה על השאלות שמשקיעים באמת שואלים, וקבל חוות דעת במבט של משקיע'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <a
                      href="/portal/journey"
                      className="flex items-center gap-2 text-sm font-medium text-[#c8a951] hover:gap-3 transition-all"
                    >
                      <span>{journey.answered === 0 ? 'התחל את המסע' : 'המשך במסע'}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </a>
                    {journey.ready > 0 && (
                      <a
                        href="/portal/journey/kit"
                        className="flex items-center gap-1.5 text-xs text-white/45 hover:text-[#e8d48b] transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        לתיק המוכנות ({journey.ready})
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Learning Center Widget */}
            <motion.a
              href="/portal/learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="wc-glass wc-shine wc-glass-lift block relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 text-white group hover:border-[#c8a951]/20 transition-all"
            >
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <img src="/images/portal/learning-hero.png" alt="" className="w-full h-full object-cover opacity-25" />
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
