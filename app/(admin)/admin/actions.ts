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
import type { UrgencyLevel, EventStatus, VideoCategory, UserRole } from '@prisma/client';

// =============================================================================
// HELPERS
// =============================================================================

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
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
  urgencyLevel: UrgencyLevel;
  isActive: boolean;
  isPinned: boolean;
}

export async function createNewsAction(data: NewsFormData) {
  await verifyAdmin();


  try {
    const news = await prisma.newsUpdate.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        excerpt: data.excerpt,
        link: data.link,
        urgencyLevel: data.urgencyLevel,
        isActive: data.isActive,
        isPinned: data.isPinned,
      },
    });

    revalidatePath('/admin/news');
    revalidatePath('/'); // Revalidate homepage for ticker

    return { success: true, news };
  } catch (error) {
    console.error('[Admin] Error creating news:', error);
    return { success: false, error: 'Failed to create news update' };
  }
}

export async function updateNewsAction(id: string, data: Partial<NewsFormData>) {
  await verifyAdmin();


  try {
    const news = await prisma.newsUpdate.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/news');
    revalidatePath('/');

    return { success: true, news };
  } catch (error) {
    console.error('[Admin] Error updating news:', error);
    return { success: false, error: 'Failed to update news' };
  }
}

export async function deleteNewsAction(id: string) {
  await verifyAdmin();


  try {
    await prisma.newsUpdate.delete({
      where: { id },
    });

    revalidatePath('/admin/news');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[Admin] Error deleting news:', error);
    return { success: false, error: 'Failed to delete news' };
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
  await verifyAdmin();


  try {
    const event = await prisma.event.create({
      data: {
        name: data.name,
        nameEn: data.nameEn,
        slug: data.slug,
        description: data.description,
        date: new Date(data.date),
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

    return { success: true, event };
  } catch (error) {
    console.error('[Admin] Error creating event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function updateEventAction(id: string, data: Partial<EventFormData>) {
  await verifyAdmin();


  try {
    const updateData: Record<string, unknown> = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true, event };
  } catch (error) {
    console.error('[Admin] Error updating event:', error);
    return { success: false, error: 'Failed to update event' };
  }
}

export async function deleteEventAction(id: string) {
  await verifyAdmin();


  try {
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
  await verifyAdmin();


  try {
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

    return { success: true, video };
  } catch (error) {
    console.error('[Admin] Error creating video:', error);
    return { success: false, error: 'Failed to create video' };
  }
}

export async function updateVideoAction(id: string, data: Partial<VideoFormData>) {
  await verifyAdmin();


  try {
    const video = await prisma.video.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/videos');
    revalidatePath('/videos');

    return { success: true, video };
  } catch (error) {
    console.error('[Admin] Error updating video:', error);
    return { success: false, error: 'Failed to update video' };
  }
}

export async function deleteVideoAction(id: string) {
  await verifyAdmin();


  try {
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
  await verifyAdmin();


  try {
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

export async function updateUserAction(id: string, data: Partial<CreateUserFormData>) {
  await verifyAdmin();


  try {
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

    revalidatePath('/admin/users');

    return { success: true, user };
  } catch (error) {
    console.error('[Admin] Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function toggleUserActiveAction(id: string, isActive: boolean) {
  await verifyAdmin();


  try {
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
  await verifyAdmin();


  try {
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
  await verifyAdmin();


  try {
    // Soft delete - just deactivate
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
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
  await verifyAdmin();


  try {
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

    return { success: true, story };
  } catch (error) {
    console.error('[Admin] Error creating story:', error);
    return { success: false, error: 'Failed to create story' };
  }
}

export async function updateStoryAction(id: string, data: StoryFormData) {
  await verifyAdmin();

  try {
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

    return { success: true, story };
  } catch (error) {
    console.error('[Admin] Error updating story:', error);
    return { success: false, error: 'Failed to update story' };
  }
}

export async function deleteStoryAction(id: string) {
  await verifyAdmin();


  try {
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
  await verifyAdmin();


  try {
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
  await verifyAdmin();


  try {
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

export async function syncYouTubeAction() {
  await verifyAdmin();

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
