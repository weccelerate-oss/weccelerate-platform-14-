/**
 * Success Stories API Endpoint
 * 
 * GET /api/content/stories
 * 
 * Returns success stories/testimonials with filtering options.
 * Optimized with caching headers for CDN edge caching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

interface Metric {
  label: string;
  value: string;
}

interface SuccessStoryResponse {
  id: string;
  companyName: string;
  slug: string;
  logoUrl?: string;
  industry?: string;
  website?: string;
  quote: string;
  quoteEn?: string;
  personName?: string;
  personRole?: string;
  personImage?: string;
  metrics: Metric[];
  projectLink?: string;
  collaborationDate?: string;
  programName?: string;
  isFeatured: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: SuccessStoryResponse[];
  error?: string;
  meta?: {
    count: number;
    industries: string[];
    cached: boolean;
    timestamp: string;
  };
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_MAX_AGE = 600; // 10 minutes (stories rarely change)
const CACHE_STALE_WHILE_REVALIDATE = 3600; // 1 hour

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10') || 10, 1), 50);
    const featured = searchParams.get('featured') === 'true';
    const industry = searchParams.get('industry');

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (featured) {
      where.isFeatured = true;
    }

    if (industry) {
      where.industry = industry;
    }

    // Fetch stories
    const [stories, industries] = await Promise.all([
      prisma.successStory.findMany({
        where,
        orderBy: [
          { displayOrder: 'asc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoUrl: true,
          industry: true,
          website: true,
          quote: true,
          quoteEn: true,
          personName: true,
          personRole: true,
          personImage: true,
          metrics: true,
          projectLink: true,
          collaborationDate: true,
          programName: true,
          isFeatured: true,
        },
      }),
      // Get distinct industries for filter UI
      prisma.successStory.findMany({
        where: { isActive: true, industry: { not: null } },
        select: { industry: true },
        distinct: ['industry'],
      }),
    ]);

    // Transform response
    const data: SuccessStoryResponse[] = stories.map((story: {
      id: string;
      companyName: string;
      slug: string;
      logoUrl: string | null;
      industry: string | null;
      website: string | null;
      quote: string;
      quoteEn: string | null;
      personName: string | null;
      personRole: string | null;
      personImage: string | null;
      metrics: unknown;
      projectLink: string | null;
      collaborationDate: string | null;
      programName: string | null;
      isFeatured: boolean;
    }) => {
      // Parse metrics from JSON
      const metricsJson = story.metrics as { items?: Metric[] } | null;
      const metrics: Metric[] = metricsJson?.items || [];

      return {
        id: story.id,
        companyName: story.companyName,
        slug: story.slug,
        logoUrl: story.logoUrl || undefined,
        industry: story.industry || undefined,
        website: story.website || undefined,
        quote: story.quote,
        quoteEn: story.quoteEn || undefined,
        personName: story.personName || undefined,
        personRole: story.personRole || undefined,
        personImage: story.personImage || undefined,
        metrics,
        projectLink: story.projectLink || undefined,
        collaborationDate: story.collaborationDate || undefined,
        programName: story.programName || undefined,
        isFeatured: story.isFeatured,
      };
    });

    // Build response with cache headers
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data,
      meta: {
        count: data.length,
        industries: industries.map((i: { industry: string | null }) => i.industry).filter(Boolean) as string[],
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
    console.error('[API] Error fetching success stories:', error);
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch success stories',
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
