/**
 * Dynamic Content Types
 * TypeScript interfaces for CMS integration
 */

// =============================================================================
// NEWS & UPDATES
// =============================================================================

export type UrgencyLevel = 'normal' | 'important' | 'urgent' | 'breaking';

export type NewsCategory = 'press' | 'announcement' | 'partnership' | 'opinion' | 'profile';

export interface NewsUpdate {
  /** Unique identifier */
  id: string;
  /** Headline/title of the news update */
  title: string;
  /** Optional link to full article or page */
  link?: string;
  /** Urgency level affects visual styling */
  urgencyLevel: UrgencyLevel;
  /** ISO date string when the update was created */
  createdAt: string;
  /** Optional brief description */
  excerpt?: string;
  /** Whether this should be pinned/featured */
  isPinned?: boolean;
  /** Optional article thumbnail / OG image */
  imageUrl?: string;
  /** Publication / source name */
  source?: string;
  /** Content category for filtering */
  category?: NewsCategory;
}

// =============================================================================
// EVENTS
// =============================================================================

export type EventLocationType = 'physical' | 'zoom' | 'hybrid';
export type EventStatus = 'upcoming' | 'ongoing' | 'past' | 'cancelled';

export interface EventLocation {
  type: EventLocationType;
  /** Physical address or venue name */
  address?: string;
  /** City name */
  city?: string;
  /** Zoom/virtual meeting link */
  virtualLink?: string;
  /** Additional location details */
  details?: string;
}

export interface Event {
  /** Unique identifier */
  id: string;
  /** Event name/title */
  name: string;
  /** Event description */
  description?: string;
  /** ISO date string for the event date */
  date: string;
  /** Time string (e.g., "14:00", "2:00 PM") */
  time: string;
  /** End time if applicable */
  endTime?: string;
  /** Location details */
  location: EventLocation;
  /** Registration/RSVP link */
  registrationLink?: string;
  /** Event cover/banner image URL */
  imageUrl?: string;
  /** Current status of the event */
  status: EventStatus;
  /** Maximum number of attendees */
  capacity?: number;
  /** Current number of registered attendees */
  registeredCount?: number;
  /** Event category/type */
  category?: string;
  /** Host/organizer name */
  host?: string;
  /** Whether registration is required */
  requiresRegistration?: boolean;
  /** Price (0 for free events) */
  price?: number;
  /** Currency code */
  currency?: string;
  /** Tags for filtering */
  tags?: string[];
}

// =============================================================================
// VIDEO CONTENT
// =============================================================================

export type VideoCategory =
  | 'interview'
  | 'summary'
  | 'webinar'
  | 'tutorial'
  | 'testimonial'
  | 'highlight'
  | 'podcast'
  | 'reels'
  | 'tv_interview';

export type VideoProvider = 'youtube' | 'vimeo' | 'wistia' | 'custom' | 'other';

export interface VideoItem {
  /** Unique identifier */
  id: string;
  /** Video title */
  title: string;
  /** Video description */
  description?: string;
  /** Video category for filtering */
  category: VideoCategory;
  /** Full video URL or embed URL */
  videoUrl: string;
  /** Video provider/platform */
  provider?: VideoProvider;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Duration in seconds */
  duration?: number;
  /** ISO date string when published */
  publishedAt?: string;
  /** View count */
  views?: number;
  /** Speaker/presenter name */
  speaker?: string;
  /** Featured/highlighted video */
  isFeatured?: boolean;
  /** Tags for filtering */
  tags?: string[];
}

// =============================================================================
// SUCCESS STORIES
// =============================================================================

export interface SuccessStory {
  /** Unique identifier */
  id: string;
  /** Company/client name */
  companyName: string;
  /** Company logo URL */
  logoUrl?: string;
  /** Testimonial quote */
  quote: string;
  /** Link to full case study/project page */
  projectLink?: string;
  /** Person who gave the testimonial */
  personName?: string;
  /** Person's role/title */
  personRole?: string;
  /** Person's photo URL */
  personImage?: string;
  /** Industry/sector */
  industry?: string;
  /** Key metrics/results achieved */
  metrics?: {
    label: string;
    value: string;
  }[];
  /** Featured story */
  isFeatured?: boolean;
  /** Date of collaboration */
  collaborationDate?: string;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface LiveTickerProps {
  updates: NewsUpdate[];
  /** Animation speed in seconds */
  speed?: number;
  /** Whether to pause on hover */
  pauseOnHover?: boolean;
  /** Display mode */
  mode?: 'scroll' | 'fade';
}

export interface EventsCenterProps {
  events: Event[];
  /** Number of events to display */
  limit?: number;
  /** Filter by status */
  statusFilter?: EventStatus[];
  /** Show past events */
  showPast?: boolean;
  /** Layout variant */
  variant?: 'grid' | 'list' | 'carousel';
}

export interface VideoGalleryProps {
  videos: VideoItem[];
  /** Initially selected video */
  initialVideoId?: string;
  /** Show playlist sidebar */
  showPlaylist?: boolean;
  /** Category filter */
  categoryFilter?: VideoCategory[];
  /** Layout variant */
  variant?: 'default' | 'compact' | 'fullwidth';
}

export interface SuccessStoriesProps {
  stories: SuccessStory[];
  /** Display variant */
  variant?: 'carousel' | 'grid' | 'featured';
  /** Auto-rotate carousel */
  autoPlay?: boolean;
  /** Auto-rotate interval in ms */
  interval?: number;
}

// =============================================================================
// CMS/API RESPONSE TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ContentFilter {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}
