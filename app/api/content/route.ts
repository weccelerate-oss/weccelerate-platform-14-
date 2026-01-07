/**
 * Combined Content API Endpoint
 * 
 * GET /api/content
 * 
 * Returns all dynamic content in a single request for initial page load.
 * This reduces multiple round trips for the homepage.
 * 
 * Query params:
 * - include: comma-separated list (news,events,videos,stories) - default: all
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

interface CombinedContentResponse {
  success: boolean;
  data?: {
    news?: unknown[];
    events?: unknown[];
    videos?: unknown[];
    stories?: unknown[];
  };
  error?: string;
  meta?: {
    cached: boolean;
    timestamp: string;
    included: string[];
  };
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_MAX_AGE = 60; // 1 minute (balance between fresh data and performance)
const CACHE_STALE_WHILE_REVALIDATE = 300; // 5 minutes

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<CombinedContentResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Determine what to include
    const includeParam = searchParams.get('include') || 'news,events,videos,stories';
    const include = includeParam.split(',').map((s) => s.trim().toLowerCase());
    
    const now = new Date();
    const data: Record<string, unknown[]> = {};

    // Parallel fetch all requested content types
    const fetchPromises: Promise<void>[] = [];

    // News Updates
    if (include.includes('news')) {
      fetchPromises.push(
        prisma.newsUpdate.findMany({
          where: {
            isActive: true,
            publishAt: { lte: now },
            OR: [
              { expireAt: null },
              { expireAt: { gt: now } },
            ],
          },
          orderBy: [
            { isPinned: 'desc' },
            { urgencyLevel: 'desc' },
            { publishAt: 'desc' },
          ],
          take: 10,
          select: {
            id: true,
            title: true,
            link: true,
            urgencyLevel: true,
            isPinned: true,
            publishAt: true,
          },
        }).then((news: Array<{
          id: string;
          title: string;
          link: string | null;
          urgencyLevel: string;
          isPinned: boolean;
          publishAt: Date;
        }>) => {
          data.news = news.map((n) => ({
            id: n.id,
            title: n.title,
            link: n.link,
            urgencyLevel: n.urgencyLevel.toLowerCase(),
            isPinned: n.isPinned,
            createdAt: n.publishAt.toISOString(),
          }));
        })
      );
    }

    // Events
    if (include.includes('events')) {
      fetchPromises.push(
        prisma.event.findMany({
          where: {
            isActive: true,
            status: { in: ['UPCOMING', 'ONGOING'] },
            date: { gte: now },
          },
          orderBy: { date: 'asc' },
          take: 6,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            date: true,
            time: true,
            endTime: true,
            locationType: true,
            address: true,
            city: true,
            virtualLink: true,
            registrationLink: true,
            imageUrl: true,
            status: true,
            capacity: true,
            registeredCount: true,
            category: true,
            host: true,
            isFree: true,
            isFeatured: true,
          },
        }).then((events: Array<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          date: Date;
          time: string;
          endTime: string | null;
          locationType: string;
          address: string | null;
          city: string | null;
          virtualLink: string | null;
          registrationLink: string | null;
          imageUrl: string | null;
          status: string;
          capacity: number | null;
          registeredCount: number;
          category: string | null;
          host: string | null;
          isFree: boolean;
          isFeatured: boolean;
        }>) => {
          data.events = events.map((e) => ({
            id: e.id,
            name: e.name,
            slug: e.slug,
            description: e.description,
            date: e.date.toISOString(),
            time: e.time,
            endTime: e.endTime,
            location: {
              type: e.locationType.toLowerCase(),
              address: e.address,
              city: e.city,
              virtualLink: e.virtualLink,
            },
            registrationLink: e.registrationLink,
            imageUrl: e.imageUrl,
            status: e.status.toLowerCase(),
            capacity: e.capacity,
            registeredCount: e.registeredCount,
            category: e.category,
            host: e.host,
            isFree: e.isFree,
            isFeatured: e.isFeatured,
          }));
        })
      );
    }

    // Videos
    if (include.includes('videos')) {
      fetchPromises.push(
        prisma.video.findMany({
          where: {
            isActive: true,
            publishAt: { lte: now },
          },
          orderBy: [
            { isFeatured: 'desc' },
            { publishAt: 'desc' },
          ],
          take: 8,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            category: true,
            embedUrl: true,
            youtubeUrl: true,
            thumbnail: true,
            duration: true,
            speaker: true,
            views: true,
            isFeatured: true,
            publishAt: true,
            tags: true,
          },
        }).then((videos: Array<{
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string;
          embedUrl: string | null;
          youtubeUrl: string | null;
          thumbnail: string | null;
          duration: number | null;
          speaker: string | null;
          views: number;
          isFeatured: boolean;
          publishAt: Date;
          tags: string[];
        }>) => {
          data.videos = videos.map((v) => ({
            id: v.id,
            title: v.title,
            slug: v.slug,
            description: v.description,
            category: v.category.toLowerCase(),
            videoUrl: v.embedUrl || v.youtubeUrl,
            thumbnail: v.thumbnail,
            duration: v.duration,
            speaker: v.speaker,
            views: v.views,
            isFeatured: v.isFeatured,
            publishedAt: v.publishAt.toISOString(),
            tags: v.tags,
          }));
        })
      );
    }

    // Success Stories
    if (include.includes('stories')) {
      fetchPromises.push(
        prisma.successStory.findMany({
          where: { isActive: true },
          orderBy: [
            { displayOrder: 'asc' },
            { isFeatured: 'desc' },
          ],
          take: 6,
          select: {
            id: true,
            companyName: true,
            slug: true,
            logoUrl: true,
            industry: true,
            quote: true,
            personName: true,
            personRole: true,
            personImage: true,
            metrics: true,
            projectLink: true,
            isFeatured: true,
            collaborationDate: true,
          },
        }).then((stories: Array<{
          id: string;
          companyName: string;
          slug: string;
          logoUrl: string | null;
          industry: string | null;
          quote: string;
          personName: string | null;
          personRole: string | null;
          personImage: string | null;
          metrics: unknown;
          projectLink: string | null;
          isFeatured: boolean;
          collaborationDate: string | null;
        }>) => {
          data.stories = stories.map((s) => {
            const metricsJson = s.metrics as { items?: { label: string; value: string }[] } | null;
            return {
              id: s.id,
              companyName: s.companyName,
              slug: s.slug,
              logoUrl: s.logoUrl,
              industry: s.industry,
              quote: s.quote,
              personName: s.personName,
              personRole: s.personRole,
              personImage: s.personImage,
              metrics: metricsJson?.items || [],
              projectLink: s.projectLink,
              isFeatured: s.isFeatured,
              collaborationDate: s.collaborationDate,
            };
          });
        })
      );
    }

    // Wait for all fetches to complete
    await Promise.all(fetchPromises);

    // Build response with cache headers
    const response = NextResponse.json<CombinedContentResponse>({
      success: true,
      data,
      meta: {
        cached: false,
        timestamp: new Date().toISOString(),
        included: Object.keys(data),
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
    console.error('[API] Error fetching combined content:', error);
    
    return NextResponse.json<CombinedContentResponse>(
      {
        success: false,
        error: 'Failed to fetch content',
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
