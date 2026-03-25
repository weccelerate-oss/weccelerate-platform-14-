/**
 * Videos API Endpoint
 * 
 * GET /api/content/videos
 * 
 * Returns video gallery items with filtering by category.
 * Optimized with caching headers for CDN edge caching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

interface VideoResponse {
  id: string;
  title: string;
  titleEn?: string;
  slug: string;
  description?: string;
  category: string;
  videoUrl: string;
  embedUrl?: string;
  thumbnail?: string;
  duration?: number;
  durationFormatted?: string;
  speaker?: string;
  speakerTitle?: string;
  views: number;
  isFeatured: boolean;
  publishedAt: string;
  tags: string[];
}

interface ApiResponse {
  success: boolean;
  data?: VideoResponse[];
  error?: string;
  meta?: {
    count: number;
    hasMore: boolean;
    categories: string[];
    cached: boolean;
    timestamp: string;
  };
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_MAX_AGE = 300; // 5 minutes (videos don't change often)
const CACHE_STALE_WHILE_REVALIDATE = 3600; // 1 hour

// =============================================================================
// HELPER: Format duration
// =============================================================================

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// =============================================================================
// HELPER: Map category
// =============================================================================

function mapCategory(category: string): string {
  return category.toLowerCase();
}

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12') || 12, 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0') || 0, 0);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const speaker = searchParams.get('speaker');

    const now = new Date();

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
      publishAt: { lte: now },
    };

    if (category) {
      const validCategories = ['INTERVIEW', 'SUMMARY', 'WEBINAR', 'TUTORIAL', 'TESTIMONIAL', 'HIGHLIGHT'];
      if (validCategories.includes(category.toUpperCase())) {
        where.category = category.toUpperCase();
      }
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (speaker) {
      where.speaker = { contains: speaker, mode: 'insensitive' };
    }

    // Fetch videos with count
    const [videos, totalCount, categories] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { publishAt: 'desc' },
        ],
        take: limit + 1,
        skip: offset,
        select: {
          id: true,
          title: true,
          titleEn: true,
          slug: true,
          description: true,
          category: true,
          youtubeUrl: true,
          vimeoUrl: true,
          videoUrl: true,
          embedUrl: true,
          thumbnail: true,
          duration: true,
          speaker: true,
          speakerTitle: true,
          views: true,
          isFeatured: true,
          publishAt: true,
          tags: true,
        },
      }),
      prisma.video.count({ where }),
      // Get distinct categories for filter UI
      prisma.video.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    // Check if there are more results
    const hasMore = videos.length > limit;
    const videosToReturn = hasMore ? videos.slice(0, limit) : videos;

    // Transform response
    const data: VideoResponse[] = videosToReturn.map((video: {
      id: string;
      title: string;
      titleEn: string | null;
      slug: string;
      description: string | null;
      category: string;
      youtubeUrl: string | null;
      vimeoUrl: string | null;
      videoUrl: string | null;
      embedUrl: string | null;
      thumbnail: string | null;
      duration: number | null;
      speaker: string | null;
      speakerTitle: string | null;
      views: number;
      isFeatured: boolean;
      publishAt: Date;
      tags: string[];
    }) => ({
      id: video.id,
      title: video.title,
      titleEn: video.titleEn || undefined,
      slug: video.slug,
      description: video.description || undefined,
      category: mapCategory(video.category),
      videoUrl: video.embedUrl || video.youtubeUrl || video.vimeoUrl || video.videoUrl || '',
      embedUrl: video.embedUrl || undefined,
      thumbnail: video.thumbnail || undefined,
      duration: video.duration || undefined,
      durationFormatted: video.duration ? formatDuration(video.duration) : undefined,
      speaker: video.speaker || undefined,
      speakerTitle: video.speakerTitle || undefined,
      views: video.views,
      isFeatured: video.isFeatured,
      publishedAt: video.publishAt.toISOString(),
      tags: video.tags,
    }));

    // Build response with cache headers
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data,
      meta: {
        count: totalCount,
        hasMore,
        categories: categories.map((c: { category: string }) => mapCategory(c.category)),
        cached: false,
        timestamp: new Date().toISOString(),
      },
    });

    // Set cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`
    );
    response.headers.set('Vary', 'Accept-Encoding');

    return response;
  } catch (error) {
    console.error('[API] Error fetching videos:', error);
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch videos',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// OPTIONS HANDLER (CORS)
// =============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
