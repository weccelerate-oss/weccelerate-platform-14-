/**
 * News Updates API Endpoint
 * 
 * GET /api/content/news
 * 
 * Returns active news updates for the live ticker.
 * Optimized with caching headers for CDN edge caching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

interface NewsUpdateResponse {
  id: string;
  title: string;
  titleEn?: string;
  link?: string;
  urgencyLevel: string;
  isPinned: boolean;
  publishAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: NewsUpdateResponse[];
  error?: string;
  meta?: {
    count: number;
    cached: boolean;
    timestamp: string;
  };
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

// Cache for 60 seconds, stale-while-revalidate for 5 minutes
const CACHE_MAX_AGE = 60;
const CACHE_STALE_WHILE_REVALIDATE = 300;

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const urgency = searchParams.get('urgency'); // Filter by urgency level
    const activeOnly = searchParams.get('active') !== 'false';

    const now = new Date();

    // Build where clause
    const where: Record<string, unknown> = {
      publishAt: { lte: now },
      OR: [
        { expireAt: null },
        { expireAt: { gt: now } },
      ],
    };

    if (activeOnly) {
      where.isActive = true;
    }

    if (urgency) {
      const validUrgencies = ['NORMAL', 'IMPORTANT', 'URGENT', 'BREAKING'];
      if (validUrgencies.includes(urgency.toUpperCase())) {
        where.urgencyLevel = urgency.toUpperCase();
      }
    }

    // Fetch news updates
    const newsUpdates = await prisma.newsUpdate.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { urgencyLevel: 'desc' },
        { publishAt: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        titleEn: true,
        link: true,
        urgencyLevel: true,
        isPinned: true,
        publishAt: true,
      },
    });

    // Transform response
    const data: NewsUpdateResponse[] = newsUpdates.map((news: {
      id: string;
      title: string;
      titleEn: string | null;
      link: string | null;
      urgencyLevel: string;
      isPinned: boolean;
      publishAt: Date;
    }) => ({
      id: news.id,
      title: news.title,
      titleEn: news.titleEn || undefined,
      link: news.link || undefined,
      urgencyLevel: news.urgencyLevel.toLowerCase(),
      isPinned: news.isPinned,
      publishAt: news.publishAt.toISOString(),
    }));

    // Build response with cache headers
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data,
      meta: {
        count: data.length,
        cached: false,
        timestamp: new Date().toISOString(),
      },
    });

    // Set cache headers for CDN and browser caching
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`
    );
    response.headers.set('Vary', 'Accept-Encoding');

    return response;
  } catch (error) {
    console.error('[API] Error fetching news updates:', error);
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch news updates',
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
