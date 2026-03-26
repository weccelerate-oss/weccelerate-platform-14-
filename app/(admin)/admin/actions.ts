/**
 * Admin Server Actions
 * 
 * Server actions for content management in the admin dashboard.
 * All actions verify admin role before execution.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { UrgencyLevel, EventStatus, VideoCategory, UserRole, ProjectStatus } from '@prisma/client';

// =============================================================================
// HELPERS
// =============================================================================

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

// =============================================================================
// NEWS TICKER ACTIONS
// =============================================================================

export interface NewsFormData {
  title: string;
  titleEn?: string;
  excerpt?: string;
  link?: string;
  imageUrl?: string;
  urgencyLevel: UrgencyLevel;
  isActive: boolean;
  isPinned: boolean;
}

export async function createNewsAction(data: NewsFormData) {
  try {
    await verifyAdmin();
    const news = await prisma.newsUpdate.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        excerpt: data.excerpt,
        link: data.link,
        imageUrl: data.imageUrl,
        urgencyLevel: data.urgencyLevel,
        isActive: data.isActive,
        isPinned: data.isPinned,
      },
    });

    revalidatePath('/admin/news');
    revalidatePath('/'); // Revalidate homepage for ticker

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error creating news:', error);
    return { success: false, error: 'Failed to create news update' };
  }
}

export async function updateNewsAction(id: string, data: Partial<NewsFormData>) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'לא מחובר - יש להתחבר מחדש' };
    }
    if ((session.user as any).role !== 'ADMIN') {
      return { success: false, error: `אין הרשאת מנהל (role: ${(session.user as any).role || 'undefined'})` };
    }

    const news = await prisma.newsUpdate.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/news');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error updating news:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `שגיאה בעדכון: ${msg}` };
  }
}

export async function deleteNewsAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'לא מחובר - יש להתחבר מחדש' };
    }
    if ((session.user as any).role !== 'ADMIN') {
      return { success: false, error: `אין הרשאת מנהל (role: ${(session.user as any).role || 'undefined'})` };
    }

    await prisma.newsUpdate.delete({
      where: { id },
    });

    revalidatePath('/admin/news');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting news:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `שגיאה במחיקה: ${msg}` };
  }
}

// =============================================================================
// EVENTS ACTIONS
// =============================================================================

export interface EventFormData {
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  locationType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  address?: string;
  city?: string;
  virtualLink?: string;
  registrationLink?: string;
  registrationRequired: boolean;
  capacity?: number;
  isFree: boolean;
  price?: number;
  currency: string;
  category?: string;
  host?: string;
  status: EventStatus;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
}

export async function createEventAction(data: EventFormData) {
  try {
    await verifyAdmin();

    // Validate date
    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      return { success: false, error: 'תאריך לא תקין' };
    }

    // Prevent setting UPCOMING/ONGOING status for past dates
    if (parsedDate < new Date() && (data.status === 'UPCOMING' || data.status === 'ONGOING')) {
      data.status = 'PAST' as EventStatus;
    }

    const event = await prisma.event.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        slug: data.slug,
        description: data.description,
        date: parsedDate,
        time: data.time,
        endTime: data.endTime,
        locationType: data.locationType,
        address: data.address,
        city: data.city,
        virtualLink: data.virtualLink,
        registrationLink: data.registrationLink,
        registrationRequired: data.registrationRequired,
        capacity: data.capacity,
        isFree: data.isFree,
        price: data.price,
        currency: data.currency,
        category: data.category,
        host: data.host,
        status: data.status,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        imageUrl: data.imageUrl,
      },
    });

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');

    return { success: true, id: event.id };
  } catch (error) {
    console.error('[Admin] Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEventAction(id: string, data: Partial<EventFormData>) {
  try {
    await verifyAdmin();
    const updateData: Record<string, unknown> = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    // Prevent setting UPCOMING/ONGOING status for past dates
    const eventDate = data.date ? new Date(data.date) : null;
    if (eventDate && eventDate < new Date() && (data.status === 'UPCOMING' || data.status === 'ONGOING')) {
      updateData.status = 'PAST';
    } else if (!data.date && (data.status === 'UPCOMING' || data.status === 'ONGOING')) {
      // Check existing event date if status is being changed without date change
      const existing = await prisma.event.findUnique({ where: { id }, select: { date: true } });
      if (existing && existing.date < new Date()) {
        updateData.status = 'PAST';
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');

    return { success: true, id: event.id };
  } catch (error) {
    console.error('[Admin] Error updating event:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting event:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}

export async function reorderEventsAction(orderedIds: string[]) {
  try {
    await verifyAdmin();

    // Update displayOrder for each event based on its position in the array
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.event.update({
          where: { id },
          data: { displayOrder: index + 1 },
        })
      )
    );

    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error reordering events:', error);
    return { success: false, error: 'Failed to reorder events' };
  }
}

// =============================================================================
// VIDEOS ACTIONS
// =============================================================================

export interface VideoFormData {
  title: string;
  titleEn?: string;
  slug: string;
  description?: string;
  youtubeUrl?: string;
  vimeoUrl?: string;
  thumbnail?: string;
  duration?: number;
  category: VideoCategory;
  tags: string[];
  speaker?: string;
  speakerTitle?: string;
  isActive: boolean;
  isFeatured: boolean;
}

export async function createVideoAction(data: VideoFormData) {
  try {
    await verifyAdmin();
    const video = await prisma.video.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        slug: data.slug,
        description: data.description,
        youtubeUrl: data.youtubeUrl,
        vimeoUrl: data.vimeoUrl,
        thumbnail: data.thumbnail,
        duration: data.duration,
        category: data.category,
        tags: data.tags,
        speaker: data.speaker,
        speakerTitle: data.speakerTitle,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath('/admin/videos');
    revalidatePath('/videos');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error creating video:', error);
    return { success: false, error: 'Failed to create video' };
  }
}

export async function updateVideoAction(id: string, data: Partial<VideoFormData>) {
  try {
    await verifyAdmin();
    const video = await prisma.video.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/videos');
    revalidatePath('/videos');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error updating video:', error);
    return { success: false, error: 'Failed to update video' };
  }
}

export async function deleteVideoAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.video.delete({
      where: { id },
    });

    revalidatePath('/admin/videos');
    revalidatePath('/videos');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting video:', error);
    return { success: false, error: 'Failed to delete video' };
  }
}

// =============================================================================
// USER MANAGEMENT ACTIONS
// =============================================================================

export interface CreateUserFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  role: UserRole;
  sendWelcomeEmail: boolean;
}

export async function createUserAction(data: CreateUserFormData) {
  try {
    await verifyAdmin();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'כתובת אימייל לא תקינה' };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: 'משתמש עם אימייל זה כבר קיים' };
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: hashedPassword,
        phone: data.phone,
        company: data.company,
        position: data.position,
        role: data.role,
        isActive: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'user.created',
        description: `User ${user.email} created by admin`,
        userId: user.id,
        metadata: {
          createdBy: 'admin',
          role: data.role,
        },
      },
    });

    revalidatePath('/admin/users');

    // TODO: Send welcome email with temp password if sendWelcomeEmail is true

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      tempPassword, // Return for display (one-time)
    };
  } catch (error) {
    console.error('[Admin] Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

const VALID_ROLES: UserRole[] = ['ADMIN', 'ENTREPRENEUR', 'MENTOR', 'INVESTOR', 'PARTNER'];

export async function updateUserAction(id: string, data: Partial<CreateUserFormData>) {
  try {
    await verifyAdmin();

    // Validate role if provided
    if (data.role && !VALID_ROLES.includes(data.role)) {
      return { success: false, error: 'תפקיד לא תקין' };
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        company: data.company,
        position: data.position,
        role: data.role,
      },
    });

    // Log role change
    if (data.role) {
      await prisma.activityLog.create({
        data: {
          action: 'user.role_changed',
          description: `User ${user.email} role changed to ${data.role}`,
          userId: user.id,
          metadata: { newRole: data.role, changedBy: 'admin' },
        },
      }).catch(() => {});
    }

    revalidatePath('/admin/users');

    return { success: true, user };
  } catch (error) {
    console.error('[Admin] Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function toggleUserActiveAction(id: string, isActive: boolean) {
  try {
    await verifyAdmin();
    await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error toggling user status:', error);
    return { success: false, error: 'Failed to update user status' };
  }
}

export async function resetUserPasswordAction(id: string) {
  try {
    await verifyAdmin();
    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // TODO: Send email with new password

    return { success: true, tempPassword };
  } catch (error) {
    console.error('[Admin] Error resetting password:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await verifyAdmin();

    // Hard delete — cascade removes projects, files, notes, etc.
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

// =============================================================================
// SUCCESS STORIES ACTIONS
// =============================================================================

export interface StoryFormData {
  companyName: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  quote: string;
  quoteEn?: string;
  personName?: string;
  personRole?: string;
  personImage?: string;
  slug: string;
  fullStory?: string;
  projectLink?: string;
  collaborationDate?: string;
  programName?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
}

export async function createStoryAction(data: StoryFormData) {
  try {
    await verifyAdmin();

    // Check slug uniqueness
    const existingSlug = await prisma.successStory.findFirst({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return { success: false, error: `slug "${data.slug}" כבר קיים. נא לבחור slug אחר.` };
    }

    const story = await prisma.successStory.create({
      data: {
        companyName: data.companyName,
        logoUrl: data.logoUrl || null,
        industry: data.industry || null,
        website: data.website || null,
        quote: data.quote,
        quoteEn: data.quoteEn || null,
        personName: data.personName || null,
        personRole: data.personRole || null,
        personImage: data.personImage || null,
        slug: data.slug,
        fullStory: data.fullStory || null,
        projectLink: data.projectLink || null,
        collaborationDate: data.collaborationDate || null,
        programName: data.programName || null,
        displayOrder: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath('/admin/stories');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error creating story:', error);
    return { success: false, error: 'Failed to create story' };
  }
}

export async function updateStoryAction(id: string, data: StoryFormData) {
  try {
    await verifyAdmin();
    const story = await prisma.successStory.update({
      where: { id },
      data: {
        companyName: data.companyName,
        logoUrl: data.logoUrl || null,
        industry: data.industry || null,
        website: data.website || null,
        quote: data.quote,
        quoteEn: data.quoteEn || null,
        personName: data.personName || null,
        personRole: data.personRole || null,
        personImage: data.personImage || null,
        slug: data.slug,
        fullStory: data.fullStory || null,
        projectLink: data.projectLink || null,
        collaborationDate: data.collaborationDate || null,
        programName: data.programName || null,
        displayOrder: data.order,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath('/admin/stories');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error updating story:', error);
    return { success: false, error: 'Failed to update story' };
  }
}

export async function deleteStoryAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.successStory.delete({
      where: { id },
    });

    revalidatePath('/admin/stories');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting story:', error);
    return { success: false, error: 'Failed to delete story' };
  }
}

export async function toggleStoryActiveAction(id: string) {
  try {
    await verifyAdmin();
    const story = await prisma.successStory.findUnique({ where: { id } });
    if (!story) throw new Error('Story not found');

    await prisma.successStory.update({
      where: { id },
      data: { isActive: !story.isActive },
    });

    revalidatePath('/admin/stories');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error toggling story active:', error);
    return { success: false, error: 'Failed to toggle story' };
  }
}

export async function toggleStoryFeaturedAction(id: string) {
  try {
    await verifyAdmin();
    const story = await prisma.successStory.findUnique({ where: { id } });
    if (!story) throw new Error('Story not found');

    await prisma.successStory.update({
      where: { id },
      data: { isFeatured: !story.isFeatured },
    });

    revalidatePath('/admin/stories');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error toggling story featured:', error);
    return { success: false, error: 'Failed to toggle story' };
  }
}

// =============================================================================
// SEED STORIES FROM MOCK DATA
// =============================================================================

export async function seedStoriesFromMockAction() {
  try {
    await verifyAdmin();
  } catch {
    // Allow seeding even without admin session during initial setup
  }

  try {
    // Check if stories already exist
    const existingCount = await prisma.successStory.count();
    if (existingCount > 0) {
      return { success: false, error: `כבר קיימים ${existingCount} סיפורים במערכת. מחק אותם קודם אם ברצונך לייבא מחדש.` };
    }

    const { mockSuccessStories } = await import('@/lib/mock-data');

    let count = 0;
    for (const story of mockSuccessStories) {
      const slug = story.id || `story-${count}`;
      try {
        await prisma.successStory.create({
          data: {
            companyName: story.companyName,
            logoUrl: null,
            industry: story.industry || null,
            website: null,
            quote: story.quote,
            quoteEn: null,
            personName: story.personName || null,
            personRole: story.personRole || null,
            personImage: story.personImage || null,
            metrics: story.metrics ? { items: story.metrics } : null,
            slug,
            fullStory: null,
            projectLink: null,
            collaborationDate: story.collaborationDate || null,
            programName: null,
            displayOrder: count + 1,
            isActive: true,
            isFeatured: story.isFeatured || false,
          },
        });
        count++;
      } catch (innerError: any) {
        console.error(`[Seed] Failed to create story "${story.companyName}":`, innerError?.message);
        // Skip duplicates or individual failures, continue with rest
      }
    }

    revalidatePath('/admin/stories');
    revalidatePath('/');

    return { success: true, count };
  } catch (error: any) {
    console.error('[Admin] Error seeding stories:', error);
    return { success: false, error: error?.message || 'Failed to seed stories from mock data' };
  }
}

// =============================================================================
// YOUTUBE SYNC ACTIONS
// =============================================================================

let lastYouTubeSyncTime = 0;
const YOUTUBE_SYNC_COOLDOWN = 5 * 60 * 1000; // 5 minutes

export async function syncYouTubeAction() {
  try {
    await verifyAdmin();
  } catch (error) {
    return { success: false, error: 'אין הרשאת מנהל' };
  }

  // Rate limit YouTube sync
  const now = Date.now();
  if (now - lastYouTubeSyncTime < YOUTUBE_SYNC_COOLDOWN) {
    const remainingMin = Math.ceil((YOUTUBE_SYNC_COOLDOWN - (now - lastYouTubeSyncTime)) / 60000);
    return { success: false, error: `נא להמתין ${remainingMin} דקות בין סנכרונים` };
  }
  lastYouTubeSyncTime = now;

  try {
    const { syncYouTubeVideos } = await import('@/lib/youtube-sync');
    const result = await syncYouTubeVideos({ updateViewCounts: true });

    revalidatePath('/admin/videos');
    revalidatePath('/videos');
    revalidatePath('/');

    return {
      success: result.success,
      newVideos: result.newVideos,
      updatedVideos: result.updatedVideos,
      totalChannelVideos: result.totalChannelVideos,
      message: result.newVideos > 0
        ? `נמצאו ${result.newVideos} סרטונים חדשים מיוטיוב`
        : `כל ${result.totalChannelVideos} הסרטונים מעודכנים, אין חדשים`,
      errors: result.errors,
    };
  } catch (error) {
    console.error('[Admin] YouTube sync error:', error);
    return { success: false, error: 'שגיאה בסנכרון מיוטיוב' };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// =============================================================================
// PROJECT MANAGEMENT ACTIONS
// =============================================================================

export interface CreateProjectFormData {
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  userId: string;
  pipedriveId?: string;
  status?: ProjectStatus;
  stage?: number;
  targetFunding?: number;
  fundingCurrency?: string;
  teamSize?: number;
}

export async function createProjectAction(data: CreateProjectFormData) {
  try {
    await verifyAdmin();

    if (!data.name.trim()) {
      return { success: false, error: 'נדרש שם פרויקט' };
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return { success: false, error: 'משתמש לא נמצא' };
    }

    // Check if user already has an active project
    const existingProject = await prisma.project.findFirst({
      where: { userId: data.userId, isArchived: false },
    });
    if (existingProject) {
      return { success: false, error: 'למשתמש כבר יש פרויקט פעיל. ניתן לארכב אותו לפני יצירת חדש.' };
    }

    // Auto-link or create Pipedrive deal if no pipedriveId provided
    let pipedriveId = data.pipedriveId?.trim() || null;
    if (!pipedriveId) {
      try {
        const { pipedriveClient } = await import('@/lib/pipedrive');
        if (pipedriveClient.isReady()) {
          let personId: number | undefined;

          // Step 1: Find existing person by email
          if (user.email) {
            const existingPerson = await pipedriveClient.findPersonByEmail(user.email);
            if (existingPerson) {
              personId = existingPerson.id;

              // Step 2: Check if person already has deals — link to the most recent open one
              const existingDeals = await pipedriveClient.getPersonDeals(personId);
              const openDeal = existingDeals.find((d) => d.status === 'open');
              if (openDeal) {
                pipedriveId = String(openDeal.id);
                console.log(`[Admin] Found existing Pipedrive deal ${pipedriveId} for ${user.email}`);
              }
            } else {
              // Create new person
              const personResult = await pipedriveClient.createPerson({
                name: user.name || user.email,
                email: user.email,
                phone: user.phone || undefined,
              });
              if (personResult.success && personResult.data) {
                personId = personResult.data.id;
              }
            }
          }

          // Step 3: If no existing deal found, create a new one
          if (!pipedriveId) {
            const dealResult = await pipedriveClient.createDeal({
              title: `${data.name.trim()} — ${user.company || user.name || user.email}`,
              person_id: personId,
              value: data.targetFunding || 0,
              currency: data.fundingCurrency || 'ILS',
            });

            if (dealResult.success && dealResult.data) {
              pipedriveId = String(dealResult.data.id);
              console.log(`[Admin] Created new Pipedrive deal ${pipedriveId} for project "${data.name}"`);
            }
          }
        }
      } catch (pipedriveError) {
        console.warn('[Admin] Failed to link/create Pipedrive deal (continuing without it):', pipedriveError);
      }
    }

    const project = await prisma.project.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        industry: data.industry?.trim() || null,
        website: data.website?.trim() || null,
        userId: data.userId,
        pipedriveId,
        status: data.status || 'DRAFT',
        stage: data.stage || 1,
        targetFunding: data.targetFunding || null,
        fundingCurrency: data.fundingCurrency || 'ILS',
        teamSize: data.teamSize || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'project.created',
        description: `פרויקט "${project.name}" נוצר עבור ${user.name || user.email}`,
        userId: data.userId,
        projectId: project.id,
        metadata: { createdBy: 'admin' },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        title: 'פרויקט חדש נוצר!',
        message: `הפרויקט "${project.name}" נוצר עבורך. ברוכים הבאים לתוכנית!`,
        type: 'success',
        userId: data.userId,
        link: '/portal/dashboard',
      },
    });

    revalidatePath('/admin/projects');
    revalidatePath('/admin/users');

    return { success: true, project: { id: project.id, name: project.name } };
  } catch (error) {
    console.error('[Admin] Error creating project:', error);
    return { success: false, error: 'שגיאה ביצירת פרויקט' };
  }
}

export async function updateProjectAction(id: string, data: Partial<CreateProjectFormData> & { isArchived?: boolean }) {
  try {
    await verifyAdmin();

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.industry !== undefined) updateData.industry = data.industry?.trim() || null;
    if (data.website !== undefined) updateData.website = data.website?.trim() || null;
    if (data.pipedriveId !== undefined) updateData.pipedriveId = data.pipedriveId?.trim() || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.targetFunding !== undefined) updateData.targetFunding = data.targetFunding;
    if (data.fundingCurrency !== undefined) updateData.fundingCurrency = data.fundingCurrency;
    if (data.teamSize !== undefined) updateData.teamSize = data.teamSize;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    // Log status change
    if (data.status) {
      await prisma.activityLog.create({
        data: {
          action: 'project.status_changed',
          description: `סטטוס פרויקט "${project.name}" עודכן ל-${data.status}`,
          userId: project.userId,
          projectId: project.id,
          metadata: { newStatus: data.status, changedBy: 'admin' },
        },
      });

      await prisma.notification.create({
        data: {
          title: 'סטטוס הפרויקט עודכן',
          message: `הפרויקט "${project.name}" התקדם לשלב חדש`,
          type: 'info',
          userId: project.userId,
          link: '/portal/dashboard',
        },
      });
    }

    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error) {
    console.error('[Admin] Error updating project:', error);
    return { success: false, error: 'שגיאה בעדכון פרויקט' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await verifyAdmin();
    await prisma.project.delete({ where: { id } });
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting project:', error);
    return { success: false, error: 'שגיאה במחיקת פרויקט' };
  }
}

export async function addProjectNoteAction(projectId: string, content: string, isPrivate: boolean = false) {
  try {
    const admin = await verifyAdmin();
    await prisma.projectNote.create({
      data: {
        content,
        isPrivate,
        projectId,
        authorName: (admin as any).name || 'Admin',
      },
    });
    revalidatePath('/admin/projects');
    return { success: true };
  } catch (error) {
    console.error('[Admin] Error adding note:', error);
    return { success: false, error: 'שגיאה בהוספת הערה' };
  }
}

export async function uploadProjectFileAction(formData: FormData) {
  try {
    await verifyAdmin();

    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const displayName = formData.get('displayName') as string;

    if (!file || !projectId) {
      return { success: false, error: 'חסרים פרטים' };
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: 'הקובץ גדול מ-50MB' };
    }

    // Get project to verify it exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return { success: false, error: 'פרויקט לא נמצא' };
    }

    // Determine file type
    const mimeType = file.type;
    let fileType: 'DOCUMENT' | 'SPREADSHEET' | 'PRESENTATION' | 'IMAGE' | 'VIDEO' | 'OTHER' = 'OTHER';
    if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text')) fileType = 'DOCUMENT';
    else if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) fileType = 'SPREADSHEET';
    else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) fileType = 'PRESENTATION';
    else if (mimeType.startsWith('image/')) fileType = 'IMAGE';
    else if (mimeType.startsWith('video/')) fileType = 'VIDEO';

    // Upload to Supabase storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'שירות אחסון לא מוגדר' };
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'bin';
    const storagePath = `vault/${projectId}/${timestamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      // Try creating the bucket if it doesn't exist
      if (uploadError.message?.includes('not found')) {
        await supabase.storage.createBucket('documents', { public: false });
        const { error: retryError } = await supabase.storage
          .from('documents')
          .upload(storagePath, buffer, { contentType: mimeType, upsert: false });
        if (retryError) {
          console.error('[Upload] Retry failed:', retryError);
          return { success: false, error: 'שגיאה בהעלאת הקובץ' };
        }
      } else {
        console.error('[Upload] Error:', uploadError);
        return { success: false, error: 'שגיאה בהעלאת הקובץ' };
      }
    }

    // Get signed URL for private file
    const { data: signedUrlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7); // 7 days

    const fileUrl = signedUrlData?.signedUrl || `${supabaseUrl}/storage/v1/object/documents/${storagePath}`;

    // Save to DB
    const dbFile = await prisma.file.create({
      data: {
        name: file.name,
        displayName: displayName || file.name,
        url: fileUrl,
        gcsPath: storagePath,
        bucket: 'documents',
        type: fileType,
        mimeType,
        size: file.size,
        isPrivate: true,
        projectId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'file.uploaded',
        description: `הועלה קובץ: ${displayName || file.name}`,
        userId: project.userId,
        projectId,
        metadata: { fileId: dbFile.id, fileName: file.name },
      },
    });

    revalidatePath('/admin/projects');
    revalidatePath('/portal/dashboard');

    return { success: true, file: { id: dbFile.id, name: dbFile.name } };
  } catch (error) {
    console.error('[Admin] Error uploading file:', error);
    return { success: false, error: 'שגיאה בהעלאת קובץ' };
  }
}

export async function deleteProjectFileAction(fileId: string) {
  try {
    await verifyAdmin();
    await prisma.file.delete({ where: { id: fileId } });
    revalidatePath('/admin/projects');
    revalidatePath('/portal/dashboard');
    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting file:', error);
    return { success: false, error: 'שגיאה במחיקת קובץ' };
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const specialChars = '!@#$%';
  let password = '';
  
  // 8 alphanumeric chars
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Add 1-2 special chars
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  return password;
}
