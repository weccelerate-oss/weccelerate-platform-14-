/**
 * Database Repository Functions
 * 
 * Clean data access layer for fetching content from the database.
 * These functions can be used in Server Components and API routes.
 * 
 * Note: This file uses inline type definitions to avoid dependency on
 * generated Prisma client. After running `prisma generate`, you can
 * import types from '@prisma/client'.
 */

import { prisma } from './db';

// =============================================================================
// TYPE DEFINITIONS (mirrors schema.prisma enums)
// =============================================================================

type UrgencyLevel = 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'BREAKING';
type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'PAST' | 'CANCELLED';
type VideoCategory = 'INTERVIEW' | 'SUMMARY' | 'WEBINAR' | 'TUTORIAL' | 'TESTIMONIAL' | 'HIGHLIGHT';
type ProjectStatus = 
  | 'DRAFT'
  | 'CHARACTERIZATION'
  | 'MARKET_RESEARCH'
  | 'BUSINESS_MODEL'
  | 'DEVELOPMENT'
  | 'FUNDING_PREP'
  | 'ACTIVE_FUNDING'
  | 'POST_FUNDING'
  | 'SCALING'
  | 'GRADUATED'
  | 'ON_HOLD'
  | 'CANCELLED';

// =============================================================================
// NEWS UPDATES
// =============================================================================

export interface GetNewsUpdatesOptions {
  limit?: number;
  urgencyLevel?: UrgencyLevel;
  activeOnly?: boolean;
  includePinned?: boolean;
}

export async function getNewsUpdates(options: GetNewsUpdatesOptions = {}) {
  const { 
    limit = 10, 
    urgencyLevel, 
    activeOnly = true,
  } = options;

  const now = new Date();

  const where = {
    ...(activeOnly && { isActive: true }),
    ...(urgencyLevel && { urgencyLevel }),
    publishAt: { lte: now },
    OR: [
      { expireAt: null },
      { expireAt: { gt: now } },
    ],
  };

  const newsUpdates = await prisma.newsUpdate.findMany({
    where,
    orderBy: [
      { isPinned: 'desc' },
      { urgencyLevel: 'desc' },
      { publishAt: 'desc' },
    ],
    take: limit,
  });

  return newsUpdates;
}

export async function getBreakingNews() {
  return getNewsUpdates({
    urgencyLevel: 'BREAKING',
    limit: 5,
  });
}

export async function getUrgentNews() {
  return prisma.newsUpdate.findMany({
    where: {
      isActive: true,
      urgencyLevel: {
        in: ['BREAKING', 'URGENT'],
      },
      publishAt: { lte: new Date() },
    },
    orderBy: { publishAt: 'desc' },
    take: 10,
  });
}

// =============================================================================
// EVENTS
// =============================================================================

export interface GetEventsOptions {
  limit?: number;
  status?: EventStatus;
  upcoming?: boolean;
  past?: boolean;
  featured?: boolean;
  category?: string;
}

export async function getEvents(options: GetEventsOptions = {}) {
  const { 
    limit = 10, 
    status, 
    upcoming, 
    past,
    featured,
    category,
  } = options;

  const now = new Date();

  // Auto-update: move past UPCOMING/ONGOING events to PAST status
  try {
    await prisma.event.updateMany({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] as const },
        date: { lt: now },
      },
      data: { status: 'PAST' as const },
    });
  } catch {
    // Column may not exist yet — skip auto-update
  }

  const where = {
    isActive: true,
    ...(status && { status }),
    ...(upcoming && {
      status: 'UPCOMING' as const,
      date: { gte: now },
    }),
    ...(past && {
      status: 'PAST' as const,
    }),
    ...(featured && { isFeatured: true }),
    ...(category && { category }),
  };

  // Try with displayOrder, fallback to date-only if column doesn't exist
  try {
    return await prisma.event.findMany({
      where,
      orderBy: upcoming
        ? [{ displayOrder: 'asc' }, { date: 'asc' }]
        : [{ date: 'desc' }],
      take: limit,
    });
  } catch {
    return await prisma.event.findMany({
      where,
      orderBy: upcoming ? { date: 'asc' } : { date: 'desc' },
      take: limit,
    });
  }
}

export async function getUpcomingEvents(limit = 5) {
  return getEvents({ upcoming: true, limit });
}

export async function getFeaturedEvents(limit = 3) {
  return getEvents({ featured: true, upcoming: true, limit });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
  });
}

// =============================================================================
// VIDEOS
// =============================================================================

export interface GetVideosOptions {
  limit?: number;
  category?: VideoCategory;
  featured?: boolean;
}

export async function getVideos(options: GetVideosOptions = {}) {
  const { limit = 10, category, featured } = options;

  const where = {
    isActive: true,
    publishAt: { lte: new Date() },
    ...(category && { category }),
    ...(featured && { isFeatured: true }),
  };

  const videos = await prisma.video.findMany({
    where,
    orderBy: [
      { isFeatured: 'desc' },
      { publishAt: 'desc' },
    ],
    take: limit,
  });

  return videos;
}

export async function getFeaturedVideos(limit = 4) {
  return getVideos({ featured: true, limit });
}

export async function getVideoBySlug(slug: string) {
  return prisma.video.findUnique({
    where: { slug },
  });
}

export async function incrementVideoViews(id: string) {
  return prisma.video.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

// =============================================================================
// SUCCESS STORIES
// =============================================================================

export interface GetSuccessStoriesOptions {
  limit?: number;
  featured?: boolean;
  industry?: string;
}

export async function getSuccessStories(options: GetSuccessStoriesOptions = {}) {
  const { limit = 10, featured, industry } = options;

  const where = {
    isActive: true,
    ...(featured && { isFeatured: true }),
    ...(industry && { industry }),
  };

  const stories = await prisma.successStory.findMany({
    where,
    orderBy: [
      { displayOrder: 'asc' },
      { isFeatured: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return stories;
}

export async function getFeaturedStories(limit = 4) {
  return getSuccessStories({ featured: true, limit });
}

export async function getStoryBySlug(slug: string) {
  return prisma.successStory.findUnique({
    where: { slug },
  });
}

// =============================================================================
// PROJECTS (Entrepreneur Portal)
// =============================================================================

export interface GetProjectsOptions {
  userId?: string;
  status?: ProjectStatus;
  includeArchived?: boolean;
}

export async function getProjects(options: GetProjectsOptions = {}) {
  const { userId, status, includeArchived = false } = options;

  const where = {
    ...(userId && { userId }),
    ...(status && { status }),
    ...(!includeArchived && { isArchived: false }),
  };

  const projects = await prisma.project.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      files: {
        orderBy: { uploadedAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { files: true, notes: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects;
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          phone: true,
          company: true,
        },
      },
      files: {
        orderBy: { uploadedAt: 'desc' },
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getProjectByPipedriveId(pipedriveId: string) {
  return prisma.project.findUnique({
    where: { pipedriveId },
    include: {
      user: true,
      files: true,
    },
  });
}

export async function getUserProjects(userId: string) {
  return getProjects({ userId });
}

// =============================================================================
// SITE SETTINGS
// =============================================================================

export async function getSiteSetting<T = unknown>(key: string): Promise<T | null> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key },
  });
  
  return setting?.value as T | null;
}

export async function getAllSiteSettings() {
  const settings = await prisma.siteSetting.findMany();
  
  return settings.reduce((acc: Record<string, unknown>, setting: { key: string; value: unknown }) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, unknown>);
}

export async function updateSiteSetting(key: string, value: unknown) {
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  });
}

// =============================================================================
// ACTIVITY LOGGING
// =============================================================================

export async function logActivity(data: {
  action: string;
  description?: string;
  userId?: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.activityLog.create({
    data: {
      action: data.action,
      description: data.description,
      userId: data.userId,
      projectId: data.projectId,
      metadata: data.metadata as object,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

// =============================================================================
// STATISTICS
// =============================================================================

export async function getDashboardStats() {
  const [
    totalProjects,
    activeProjects,
    totalEvents,
    upcomingEvents,
    totalVideos,
    totalStories,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({
      where: {
        status: {
          in: [
            'CHARACTERIZATION',
            'MARKET_RESEARCH',
            'BUSINESS_MODEL',
            'DEVELOPMENT',
            'FUNDING_PREP',
            'ACTIVE_FUNDING',
          ],
        },
        isArchived: false,
      },
    }),
    prisma.event.count({ where: { isActive: true } }),
    prisma.event.count({
      where: {
        isActive: true,
        status: 'UPCOMING',
        date: { gte: new Date() },
      },
    }),
    prisma.video.count({ where: { isActive: true } }),
    prisma.successStory.count({ where: { isActive: true } }),
  ]);

  return {
    totalProjects,
    activeProjects,
    totalEvents,
    upcomingEvents,
    totalVideos,
    totalStories,
  };
}
