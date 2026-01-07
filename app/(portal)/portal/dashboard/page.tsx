/**
 * Entrepreneur Dashboard Page
 * 
 * Personalized dashboard for entrepreneurs showing:
 * - Project overview and timeline
 * - File vault with downloadable documents
 * - Quick actions and communication tools
 * 
 * This is a Server Component that fetches user-specific data.
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { DashboardContent } from './dashboard-content';
import { DashboardSkeleton } from './dashboard-skeleton';

export const metadata: Metadata = {
  title: 'לוח הבקרה | WeCcelerate Portal',
  description: 'לוח הבקרה האישי שלך - עקוב אחרי התקדמות הפרויקט שלך',
};

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getProjectData(userId: string) {
  // Try to get data from database, fallback to mock data if DB not available
  try {
    const { prisma } = await import('@/lib/db');

    // Fetch user's active project with files
    const project = await prisma.project.findFirst({
      where: {
        userId,
        isArchived: false,
      },
      include: {
        files: {
          orderBy: { uploadedAt: 'desc' },
          take: 20,
        },
        notes: {
          where: { isPrivate: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    // Get user's notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get recent activity
    const activities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { userId },
          { projectId: project?.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      project,
      notifications,
      activities,
    };
  } catch (dbError) {
    console.warn('[Dashboard] Database error, using mock data:', dbError);
    return getMockData(userId);
  }
}

// Mock data for development/demo purposes
function getMockData(userId: string) {
  const now = new Date();
  
  return {
    project: {
      id: 'mock-project-1',
      name: 'Startup Demo Project',
      description: 'פרויקט לדוגמה להדגמת הפורטל',
      industry: 'Technology',
      website: 'https://example.com',
      pipedriveId: null,
      hubspotId: null,
      status: 'DEVELOPMENT' as const,
      stage: 5,
      timeline: {
        stages: [
          { name: 'אפיון', status: 'completed', endDate: '2024-01-15' },
          { name: 'מחקר שוק', status: 'completed', endDate: '2024-02-01' },
          { name: 'פיתוח MVP', status: 'in-progress', endDate: '2024-03-15' },
        ],
      },
      milestones: null,
      targetFunding: null,
      fundingRaised: null,
      fundingCurrency: 'USD',
      teamSize: 3,
      foundingDate: new Date('2024-01-01'),
      userId,
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: now,
      files: [
        {
          id: 'file-1',
          name: 'Business_Plan_v2.pdf',
          displayName: 'תוכנית עסקית',
          description: 'תוכנית עסקית מעודכנת',
          url: '/files/business-plan.pdf',
          key: null,
          bucket: null,
          type: 'DOCUMENT' as const,
          mimeType: 'application/pdf',
          size: 2500000,
          projectId: 'mock-project-1',
          uploadedById: userId,
          uploadedAt: new Date('2024-02-15'),
        },
        {
          id: 'file-2',
          name: 'Financial_Model.xlsx',
          displayName: 'מודל פיננסי',
          description: 'תחזיות פיננסיות',
          url: '/files/financial-model.xlsx',
          key: null,
          bucket: null,
          type: 'SPREADSHEET' as const,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1200000,
          projectId: 'mock-project-1',
          uploadedById: userId,
          uploadedAt: new Date('2024-02-10'),
        },
        {
          id: 'file-3',
          name: 'Pitch_Deck.pptx',
          displayName: 'מצגת משקיעים',
          description: 'מצגת למשקיעים',
          url: '/files/pitch-deck.pptx',
          key: null,
          bucket: null,
          type: 'PRESENTATION' as const,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          size: 5000000,
          projectId: 'mock-project-1',
          uploadedById: userId,
          uploadedAt: new Date('2024-02-20'),
        },
        {
          id: 'file-4',
          name: 'Market_Research.pdf',
          displayName: 'מחקר שוק',
          description: 'ניתוח שוק היעד',
          url: '/files/market-research.pdf',
          key: null,
          bucket: null,
          type: 'DOCUMENT' as const,
          mimeType: 'application/pdf',
          size: 3500000,
          projectId: 'mock-project-1',
          uploadedById: userId,
          uploadedAt: new Date('2024-01-25'),
        },
      ],
      notes: [
        {
          id: 'note-1',
          content: 'פגישה מוצלחת עם הצוות, הוחלט להתמקד בשוק הישראלי בשלב ראשון.',
          isPrivate: false,
          projectId: 'mock-project-1',
          authorName: 'מנטור',
          createdAt: new Date('2024-02-18'),
          updatedAt: new Date('2024-02-18'),
        },
      ],
      user: {
        name: 'יזם דמו',
        email: 'demo@example.com',
        phone: '+972-50-123-4567',
        company: 'Demo Startup',
      },
    },
    notifications: [
      {
        id: 'notif-1',
        title: 'פגישה מתקרבת',
        message: 'יש לך פגישה עם המנטור מחר בשעה 14:00',
        link: '/portal/calendar',
        type: 'info',
        userId,
        isRead: false,
        readAt: null,
        createdAt: now,
      },
      {
        id: 'notif-2',
        title: 'מסמך חדש זמין',
        message: 'המנטור שלך העלה מסמך חדש לצפייה',
        link: '/portal/documents',
        type: 'success',
        userId,
        isRead: false,
        readAt: null,
        createdAt: new Date(now.getTime() - 86400000),
      },
    ],
    activities: [
      {
        id: 'activity-1',
        action: 'file.uploaded',
        description: 'הועלה מסמך חדש: מצגת משקיעים',
        metadata: {},
        userId,
        projectId: 'mock-project-1',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(now.getTime() - 3600000),
      },
      {
        id: 'activity-2',
        action: 'project.status_changed',
        description: 'סטטוס הפרויקט שונה לפיתוח',
        metadata: {},
        userId,
        projectId: 'mock-project-1',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(now.getTime() - 86400000),
      },
      {
        id: 'activity-3',
        action: 'meeting.scheduled',
        description: 'נקבעה פגישה עם המנטור',
        metadata: {},
        userId,
        projectId: 'mock-project-1',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(now.getTime() - 172800000),
      },
      {
        id: 'activity-4',
        action: 'note.added',
        description: 'הוספה הערה חדשה על הפרויקט',
        metadata: {},
        userId,
        projectId: 'mock-project-1',
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(now.getTime() - 259200000),
      },
      {
        id: 'activity-5',
        action: 'user.login',
        description: 'התחברות למערכת',
        metadata: {},
        userId,
        projectId: null,
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(now.getTime() - 345600000),
      },
    ],
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function DashboardPage() {
  // Get authenticated user
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/portal/dashboard');
  }

  // Fetch project data
  const data = await getProjectData(session.user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          user={session.user}
          project={data.project}
          notifications={data.notifications}
          activities={data.activities}
        />
      </Suspense>
    </div>
  );
}
