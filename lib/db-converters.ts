/**
 * Type Converters - Prisma Models to Frontend Types
 * 
 * These functions convert Prisma model objects to the frontend types
 * used by our UI components, ensuring compatibility between
 * database models and mock data structures.
 * 
 * Note: Types are defined inline to avoid dependency on generated Prisma client.
 * After running `prisma generate`, you can import types from '@prisma/client'.
 */

import type {
  NewsUpdate,
  Event,
  VideoItem,
  SuccessStory,
  EventLocation,
} from '@/types/content';

// =============================================================================
// PRISMA TYPE DEFINITIONS (mirrors schema.prisma)
// These types match the Prisma schema and can be replaced with imports
// from '@prisma/client' after running `prisma generate`
// =============================================================================

type UrgencyLevel = 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'BREAKING';
type EventLocationType = 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'PAST' | 'CANCELLED';
type VideoCategory = 'INTERVIEW' | 'SUMMARY' | 'WEBINAR' | 'TUTORIAL' | 'TESTIMONIAL' | 'HIGHLIGHT';

interface PrismaNewsUpdate {
  id: string;
  title: string;
  titleEn: string | null;
  excerpt: string | null;
  link: string | null;
  urgencyLevel: UrgencyLevel;
  isActive: boolean;
  isPinned: boolean;
  publishAt: Date;
  expireAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaEvent {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  date: Date;
  time: string;
  endTime: string | null;
  timezone: string;
  locationType: EventLocationType;
  address: string | null;
  city: string | null;
  virtualLink: string | null;
  locationDetails: string | null;
  registrationLink: string | null;
  registrationRequired: boolean;
  capacity: number | null;
  registeredCount: number;
  price: number | null; // Decimal converted to number
  currency: string;
  isFree: boolean;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  tags: string[];
  host: string | null;
  hostBio: string | null;
  status: EventStatus;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaVideo {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  description: string | null;
  descriptionEn: string | null;
  youtubeUrl: string | null;
  vimeoUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  thumbnail: string | null;
  duration: number | null;
  category: VideoCategory;
  tags: string[];
  speaker: string | null;
  speakerTitle: string | null;
  speakerImage: string | null;
  views: number;
  isActive: boolean;
  isFeatured: boolean;
  publishAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaSuccessStory {
  id: string;
  companyName: string;
  logoUrl: string | null;
  industry: string | null;
  website: string | null;
  quote: string;
  quoteEn: string | null;
  personName: string | null;
  personRole: string | null;
  personImage: string | null;
  metrics: unknown; // JSON type
  slug: string;
  fullStory: string | null;
  fullStoryEn: string | null;
  projectLink: string | null;
  collaborationDate: string | null;
  programName: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// URGENCY LEVEL MAPPING
// =============================================================================

const urgencyLevelMap: Record<UrgencyLevel, 'normal' | 'important' | 'urgent' | 'breaking'> = {
  NORMAL: 'normal',
  IMPORTANT: 'important',
  URGENT: 'urgent',
  BREAKING: 'breaking',
};

// =============================================================================
// EVENT STATUS MAPPING
// =============================================================================

const eventStatusMap: Record<EventStatus, 'upcoming' | 'ongoing' | 'past' | 'cancelled'> = {
  DRAFT: 'upcoming', // Treat draft as upcoming for display
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  PAST: 'past',
  CANCELLED: 'cancelled',
};

// =============================================================================
// EVENT LOCATION TYPE MAPPING
// =============================================================================

const locationTypeMap: Record<EventLocationType, 'physical' | 'zoom' | 'hybrid'> = {
  PHYSICAL: 'physical',
  VIRTUAL: 'zoom',
  HYBRID: 'hybrid',
};

// =============================================================================
// VIDEO CATEGORY MAPPING
// =============================================================================

const videoCategoryMap: Record<VideoCategory, 'interview' | 'summary' | 'webinar' | 'tutorial' | 'testimonial' | 'highlight'> = {
  INTERVIEW: 'interview',
  SUMMARY: 'summary',
  WEBINAR: 'webinar',
  TUTORIAL: 'tutorial',
  TESTIMONIAL: 'testimonial',
  HIGHLIGHT: 'highlight',
};

// =============================================================================
// NEWS UPDATE CONVERTER
// =============================================================================

export function convertNewsUpdate(prismaNews: PrismaNewsUpdate): NewsUpdate {
  return {
    id: prismaNews.id,
    title: prismaNews.title,
    link: prismaNews.link || undefined,
    urgencyLevel: urgencyLevelMap[prismaNews.urgencyLevel],
    createdAt: prismaNews.createdAt.toISOString(),
    isPinned: prismaNews.isPinned,
  };
}

export function convertNewsUpdates(prismaNews: PrismaNewsUpdate[]): NewsUpdate[] {
  return prismaNews.map(convertNewsUpdate);
}

// =============================================================================
// EVENT CONVERTER
// =============================================================================

export function convertEvent(prismaEvent: PrismaEvent): Event {
  const location: EventLocation = {
    type: locationTypeMap[prismaEvent.locationType],
    ...(prismaEvent.address && { address: prismaEvent.address }),
    ...(prismaEvent.city && { city: prismaEvent.city }),
    ...(prismaEvent.virtualLink && { virtualLink: prismaEvent.virtualLink }),
  };

  return {
    id: prismaEvent.id,
    name: prismaEvent.name,
    description: prismaEvent.description || undefined,
    date: prismaEvent.date.toISOString(),
    time: prismaEvent.time,
    endTime: prismaEvent.endTime || undefined,
    location,
    registrationLink: prismaEvent.registrationLink || undefined,
    imageUrl: prismaEvent.imageUrl || undefined,
    status: eventStatusMap[prismaEvent.status],
    capacity: prismaEvent.capacity || undefined,
    registeredCount: prismaEvent.registeredCount,
    category: prismaEvent.category || undefined,
    host: prismaEvent.host || undefined,
    requiresRegistration: prismaEvent.registrationRequired,
    price: prismaEvent.price ? Number(prismaEvent.price) : undefined,
    currency: prismaEvent.currency,
    tags: prismaEvent.tags,
  };
}

export function convertEvents(prismaEvents: PrismaEvent[]): Event[] {
  return prismaEvents.map(convertEvent);
}

// =============================================================================
// VIDEO CONVERTER
// =============================================================================

export function convertVideo(prismaVideo: PrismaVideo): VideoItem {
  return {
    id: prismaVideo.id,
    title: prismaVideo.title,
    description: prismaVideo.description || undefined,
    category: videoCategoryMap[prismaVideo.category],
    videoUrl: prismaVideo.embedUrl || prismaVideo.youtubeUrl || prismaVideo.videoUrl || '',
    provider: prismaVideo.youtubeUrl ? 'youtube' : prismaVideo.vimeoUrl ? 'vimeo' : 'other',
    thumbnail: prismaVideo.thumbnail || undefined,
    duration: prismaVideo.duration || undefined,
    publishedAt: prismaVideo.publishAt.toISOString(),
    views: prismaVideo.views,
    speaker: prismaVideo.speaker || undefined,
    isFeatured: prismaVideo.isFeatured,
    tags: prismaVideo.tags,
  };
}

export function convertVideos(prismaVideos: PrismaVideo[]): VideoItem[] {
  return prismaVideos.map(convertVideo);
}

// =============================================================================
// SUCCESS STORY CONVERTER
// =============================================================================

interface PrismaMetrics {
  items: Array<{ label: string; value: string }>;
}

export function convertSuccessStory(prismaStory: PrismaSuccessStory): SuccessStory {
  // Parse metrics from JSON
  const metrics = prismaStory.metrics as PrismaMetrics | null;
  
  return {
    id: prismaStory.id,
    companyName: prismaStory.companyName,
    logoUrl: prismaStory.logoUrl || undefined,
    quote: prismaStory.quote,
    projectLink: prismaStory.projectLink || undefined,
    personName: prismaStory.personName || undefined,
    personRole: prismaStory.personRole || undefined,
    personImage: prismaStory.personImage || undefined,
    industry: prismaStory.industry || undefined,
    metrics: metrics?.items || [],
    isFeatured: prismaStory.isFeatured,
    collaborationDate: prismaStory.collaborationDate || undefined,
  };
}

export function convertSuccessStories(prismaStories: PrismaSuccessStory[]): SuccessStory[] {
  return prismaStories.map(convertSuccessStory);
}
