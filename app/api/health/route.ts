/**
 * API Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Returns the health status of the API and its dependencies.
 * Useful for monitoring and load balancer health checks.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
    };
    memory: {
      percentage: number;
    };
  };
}

// =============================================================================
// GET HANDLER
// =============================================================================

const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);

  // Check database connection
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatency: number | undefined;
  let dbError: string | undefined;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'error';
    dbError = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Health] Database check failed:', error);
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryInfo = {
    used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
  };

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (dbStatus === 'error') {
    overallStatus = 'unhealthy';
  } else if (dbLatency && dbLatency > 1000) {
    overallStatus = 'degraded';
  } else if (memoryInfo.percentage > 90) {
    overallStatus = 'degraded';
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp,
    version: process.env.npm_package_version || '0.1.0',
    uptime,
    checks: {
      database: {
        status: dbStatus,
        latency: dbLatency,
      },
      memory: {
        percentage: memoryInfo.percentage,
      },
    },
  };

  // Return appropriate status code
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(response, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
