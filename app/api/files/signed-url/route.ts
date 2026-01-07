/**
 * Signed URL API Route
 * 
 * Generates fresh signed URLs for private files
 * 
 * POST /api/files/signed-url
 * - fileId or filePath required
 * - Returns new signed URL with expiry
 * 
 * @module app/api/files/signed-url/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth';
import { generateSignedUrl, URL_EXPIRY, parseGCSPath, GCSError } from '@/lib/gcs';

// =============================================================================
// POST - Generate Signed URL
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'נדרשת הזדהות', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileId, filePath, expiresIn } = body;

    if (!fileId && !filePath) {
      return NextResponse.json(
        { error: 'נדרש מזהה קובץ או נתיב', code: 'MISSING_IDENTIFIER' },
        { status: 400 }
      );
    }

    let gcsPath: string;

    // If fileId provided, look up in database
    if (fileId) {
      try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        try {
          const file = await prisma.file.findUnique({
            where: { id: fileId },
            select: {
              id: true,
              gcsPath: true,
              isPrivate: true,
              uploadedById: true,
              project: {
                select: { userId: true },
              },
            },
          });

          if (!file) {
            return NextResponse.json(
              { error: 'הקובץ לא נמצא', code: 'FILE_NOT_FOUND' },
              { status: 404 }
            );
          }

          // Check access permissions
          const isOwner = file.uploadedById === session.user.id;
          const isProjectOwner = file.project?.userId === session.user.id;
          const isAdmin = session.user.role === 'ADMIN';

          if (!isOwner && !isProjectOwner && !isAdmin) {
            return NextResponse.json(
              { error: 'אין הרשאה לגשת לקובץ זה', code: 'ACCESS_DENIED' },
              { status: 403 }
            );
          }

          if (!file.gcsPath) {
            return NextResponse.json(
              { error: 'הקובץ אינו מאוחסן ב-GCS', code: 'NOT_GCS_FILE' },
              { status: 400 }
            );
          }

          // Parse GCS path to get object path
          const parsed = parseGCSPath(file.gcsPath);
          if (!parsed) {
            return NextResponse.json(
              { error: 'נתיב GCS לא תקין', code: 'INVALID_GCS_PATH' },
              { status: 400 }
            );
          }

          gcsPath = parsed.object;

          // Update signed URL in database
          const expiry = expiresIn || URL_EXPIRY.LONG;
          const { url, expiresAt } = await generateSignedUrl(gcsPath, {
            expiresIn: expiry,
            action: 'read',
          });

          // Update database with new signed URL
          await prisma.file.update({
            where: { id: fileId },
            data: {
              signedUrl: url,
              signedUrlExpiry: expiresAt,
            },
          });

          return NextResponse.json({
            success: true,
            signedUrl: url,
            expiresAt,
            fileId,
          });
        } finally {
          await prisma.$disconnect();
        }
      } catch (dbError) {
        console.error('[SignedURL] Database error:', dbError);
        // Continue with just the path if database fails
        if (!filePath) {
          return NextResponse.json(
            { error: 'שגיאה בגישה למסד הנתונים', code: 'DB_ERROR' },
            { status: 500 }
          );
        }
      }
    }

    // Use provided path directly (for admin use or fallback)
    if (filePath) {
      gcsPath = filePath;
    }

    // Generate signed URL
    const expiry = expiresIn || URL_EXPIRY.MEDIUM;
    const { url, expiresAt } = await generateSignedUrl(gcsPath!, {
      expiresIn: expiry,
      action: 'read',
    });

    return NextResponse.json({
      success: true,
      signedUrl: url,
      expiresAt,
    });

  } catch (error) {
    console.error('[SignedURL] Error:', error);

    if (error instanceof GCSError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'שגיאה ביצירת קישור גישה', code: 'SIGNED_URL_ERROR' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Batch Refresh Signed URLs
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'נדרשת הזדהות', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const expiringSoon = searchParams.get('expiringSoon') === 'true';

    // Get files that need URL refresh
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const whereClause: Record<string, unknown> = {
        isPrivate: true,
        gcsPath: { not: null },
      };

      // Filter by project if specified
      if (projectId) {
        whereClause.projectId = projectId;
        // Verify access to project
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            userId: session.user.id,
          },
        });
        if (!project && session.user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'אין הרשאה לפרויקט זה', code: 'ACCESS_DENIED' },
            { status: 403 }
          );
        }
      } else {
        // Only get user's own files
        whereClause.uploadedById = session.user.id;
      }

      // Filter expiring URLs if requested
      if (expiringSoon) {
        const threshold = new Date();
        threshold.setHours(threshold.getHours() + 1); // Expiring in next hour
        whereClause.signedUrlExpiry = { lt: threshold };
      }

      const files = await prisma.file.findMany({
        where: whereClause as Parameters<typeof prisma.file.findMany>[0]['where'],
        select: {
          id: true,
          name: true,
          gcsPath: true,
          signedUrlExpiry: true,
        },
        take: 50, // Limit batch size
      });

      // Refresh URLs
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const parsed = parseGCSPath(file.gcsPath!);
            if (!parsed) return { fileId: file.id, error: 'Invalid path' };

            const { url, expiresAt } = await generateSignedUrl(parsed.object, {
              expiresIn: URL_EXPIRY.LONG,
            });

            // Update in database
            await prisma.file.update({
              where: { id: file.id },
              data: {
                signedUrl: url,
                signedUrlExpiry: expiresAt,
              },
            });

            return {
              fileId: file.id,
              name: file.name,
              signedUrl: url,
              expiresAt,
            };
          } catch (err) {
            return {
              fileId: file.id,
              error: 'Failed to refresh',
            };
          }
        })
      );

      const successful = results.filter((r) => !('error' in r));
      const failed = results.filter((r) => 'error' in r);

      return NextResponse.json({
        success: true,
        refreshed: successful.length,
        failed: failed.length,
        files: successful,
        errors: failed,
      });
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('[SignedURL Batch] Error:', error);
    return NextResponse.json(
      { error: 'שגיאה ברענון קישורים', code: 'BATCH_ERROR' },
      { status: 500 }
    );
  }
}
