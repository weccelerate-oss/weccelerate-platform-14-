/**
 * Events API Endpoint
 * 
 * GET /api/content/events
 * 
 * Returns events with filtering by status, category, and date range.
 * Optimized with caching headers for CDN edge caching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid';
  address?: string;
  city?: string;
  virtualLink?: string;
}

interface EventResponse {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  location: EventLocation;
  registrationLink?: string;
  imageUrl?: string;
  status: string;
  capacity?: number;
  registeredCount: number;
  spotsLeft?: number;
  isAlmostFull: boolean;
  category?: string;
  host?: string;
  isFree: boolean;
  price?: number;
  currency: string;
  isFeatured: boolean;
  tags: string[];
}

interface ApiResponse {
  success: boolean;
  data?: EventResponse[];
  error?: string;
  meta?: {
    count: number;
    hasMore: boolean;
    cached: boolean;
    timestamp: string;
  };
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================

const CACHE_MAX_AGE = 120; // 2 minutes
const CACHE_STALE_WHILE_REVALIDATE = 600; // 10 minutes

// =============================================================================
// HELPER: Map location type
// =============================================================================

function mapLocationType(type: string): 'physical' | 'virtual' | 'hybrid' {
  switch (type) {
    case 'PHYSICAL': return 'physical';
    case 'VIRTUAL': return 'virtual';
    case 'HYBRID': return 'hybrid';
    default: return 'physical';
  }
}

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // upcoming, past, ongoing
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const now = new Date();

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Status filter
    if (status) {
      switch (status.toLowerCase()) {
        case 'upcoming':
          where.status = 'UPCOMING';
          where.date = { gte: now };
          break;
        case 'past':
          where.status = 'PAST';
          break;
        case 'ongoing':
          where.status = 'ONGOING';
          break;
        default:
          where.status = status.toUpperCase();
      }
    }

    if (category) {
      where.category = category;
    }

    if (featured) {
      where.isFeatured = true;
    }

    // Date range filter
    if (fromDate || toDate) {
      where.date = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      };
    }

    // Fetch events with count for pagination
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: status === 'past' 
          ? { date: 'desc' }  // Most recent past events first
          : { date: 'asc' },  // Nearest upcoming events first
        take: limit + 1, // Fetch one extra to check if there's more
        skip: offset,
        select: {
          id: true,
          name: true,
          nameEn: true,
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
          price: true,
          currency: true,
          isFeatured: true,
          tags: true,
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Check if there are more results
    const hasMore = events.length > limit;
    const eventsToReturn = hasMore ? events.slice(0, limit) : events;

    // Transform response
    const data: EventResponse[] = eventsToReturn.map((event: {
      id: string;
      name: string;
      nameEn: string | null;
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
      price: unknown;
      currency: string;
      isFeatured: boolean;
      tags: string[];
    }) => {
      const spotsLeft = event.capacity 
        ? event.capacity - event.registeredCount 
        : undefined;
      const isAlmostFull = event.capacity 
        ? (event.registeredCount / event.capacity) >= 0.9 
        : false;

      return {
        id: event.id,
        name: event.name,
        nameEn: event.nameEn || undefined,
        slug: event.slug,
        description: event.description || undefined,
        date: event.date.toISOString(),
        time: event.time,
        endTime: event.endTime || undefined,
        location: {
          type: mapLocationType(event.locationType),
          address: event.address || undefined,
          city: event.city || undefined,
          virtualLink: event.virtualLink || undefined,
        },
        registrationLink: event.registrationLink || undefined,
        imageUrl: event.imageUrl || undefined,
        status: event.status.toLowerCase(),
        capacity: event.capacity || undefined,
        registeredCount: event.registeredCount,
        spotsLeft,
        isAlmostFull,
        category: event.category || undefined,
        host: event.host || undefined,
        isFree: event.isFree,
        price: event.price ? Number(event.price) : undefined,
        currency: event.currency,
        isFeatured: event.isFeatured,
        tags: event.tags,
      };
    });

    // Build response with cache headers
    const response = NextResponse.json<ApiResponse>({
      success: true,
      data,
      meta: {
        count: totalCount,
        hasMore,
        cached: false,
        timestamp: new Date().toISOString(),
      },
    });

    // Set cache headers - shorter for upcoming events (more dynamic)
    const cacheAge = status === 'upcoming' ? 60 : CACHE_MAX_AGE;
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheAge}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`
    );
    response.headers.set('Vary', 'Accept-Encoding');

    return response;
  } catch (error) {
    console.error('[API] Error fetching events:', error);
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch events',
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
