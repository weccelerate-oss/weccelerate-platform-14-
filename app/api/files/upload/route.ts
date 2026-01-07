/**
 * File Upload API Route
 * 
 * Handles file uploads to Google Cloud Storage
 * 
 * POST /api/files/upload
 * - Multipart form data with file
 * - Returns file metadata and URLs
 * 
 * @module app/api/files/upload/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import {
  uploadFile,
  GCS_FOLDERS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
  GCSError,
} from '@/lib/gcs';

// =============================================================================
// TYPES
// =============================================================================

interface UploadRequestBody {
  folder?: string;
  isPrivate?: boolean;
  projectId?: string;
  description?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Determine the destination folder based on file type and request
 */
function getDestinationFolder(
  mimeType: string,
  requestedFolder?: string
): string {
  // If specific folder requested and valid, use it
  if (requestedFolder) {
    const validFolders = Object.values(GCS_FOLDERS);
    if (validFolders.includes(requestedFolder as typeof validFolders[number])) {
      return requestedFolder;
    }
  }
  
  // Auto-detect based on MIME type
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as never)) {
    return GCS_FOLDERS.MEDIA_IMAGES;
  }
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType as never)) {
    return GCS_FOLDERS.MEDIA_VIDEOS;
  }
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as never)) {
    return GCS_FOLDERS.VAULT_DOCUMENTS;
  }
  
  return GCS_FOLDERS.TEMP;
}

/**
 * Map MIME type to FileType enum
 */
function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.includes('pdf')) return 'DOCUMENT';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'SPREADSHEET';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PRESENTATION';
  return 'OTHER';
}

// =============================================================================
// POST - Upload File
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

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'לא נבחר קובץ', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Get additional options from form data
    const folder = formData.get('folder') as string | null;
    const isPrivate = formData.get('isPrivate') !== 'false'; // Default to private
    const projectId = formData.get('projectId') as string | null;
    const description = formData.get('description') as string | null;

    // Validate file size
    const maxSize = file.type.startsWith('video/') 
      ? MAX_FILE_SIZES.video 
      : file.type.startsWith('image/')
        ? MAX_FILE_SIZES.image
        : MAX_FILE_SIZES.document;

    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `גודל הקובץ חורג מהמותר (מקסימום ${maxMB}MB)`, code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine destination folder
    const destination = getDestinationFolder(file.type, folder || undefined);

    // Add user-specific subfolder for vault files
    const finalDestination = destination.startsWith(GCS_FOLDERS.VAULT)
      ? `${destination}/${session.user.id}`
      : destination;

    // Upload to GCS
    const result = await uploadFile(buffer, file.name, {
      destination: finalDestination,
      isPrivate,
      contentType: file.type,
      metadata: {
        uploadedBy: session.user.id,
        projectId: projectId || '',
        description: description || '',
      },
    });

    // Save to database
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      try {
        const dbFile = await prisma.file.create({
          data: {
            name: result.originalName,
            displayName: result.originalName,
            description: description || undefined,
            url: result.url,
            gcsPath: result.gcsPath,
            bucket: result.bucket,
            type: getFileType(result.mimeType) as 'DOCUMENT' | 'SPREADSHEET' | 'PRESENTATION' | 'IMAGE' | 'VIDEO' | 'OTHER',
            mimeType: result.mimeType,
            size: result.size,
            checksum: result.checksum,
            isPrivate: result.isPrivate,
            signedUrl: result.signedUrl,
            signedUrlExpiry: result.signedUrlExpiry,
            projectId: projectId || undefined,
            uploadedById: session.user.id,
          },
        });

        return NextResponse.json({
          success: true,
          file: {
            id: dbFile.id,
            name: dbFile.name,
            displayName: dbFile.displayName,
            url: result.isPrivate ? result.signedUrl : result.url,
            gcsPath: result.gcsPath,
            mimeType: result.mimeType,
            size: result.size,
            isPrivate: result.isPrivate,
            signedUrlExpiry: result.signedUrlExpiry,
          },
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (dbError) {
      console.error('[Upload] Database error:', dbError);
      // Still return success since file is uploaded, just not tracked
      return NextResponse.json({
        success: true,
        warning: 'הקובץ הועלה אך לא נשמר במסד הנתונים',
        file: {
          name: result.originalName,
          url: result.isPrivate ? result.signedUrl : result.url,
          gcsPath: result.gcsPath,
          mimeType: result.mimeType,
          size: result.size,
          isPrivate: result.isPrivate,
        },
      });
    }

  } catch (error) {
    console.error('[Upload] Error:', error);

    if (error instanceof GCSError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'שגיאה בהעלאת הקובץ', code: 'UPLOAD_ERROR' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET - Get Upload URL (for direct client uploads)
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
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType');
    const folder = searchParams.get('folder');

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'חסרים פרמטרים', code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // Import dynamically to avoid build issues
    const { generateUploadUrl, URL_EXPIRY } = await import('@/lib/gcs');
    
    // Determine destination
    const destination = getDestinationFolder(contentType, folder || undefined);
    const finalDestination = destination.startsWith(GCS_FOLDERS.VAULT)
      ? `${destination}/${session.user.id}`
      : destination;

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = filename.split('.').pop();
    const uniqueName = `${filename.replace(`.${ext}`, '')}-${timestamp}-${random}.${ext}`;
    const filePath = `${finalDestination}/${uniqueName}`;

    // Generate signed upload URL
    const { uploadUrl, expiresAt } = await generateUploadUrl(
      filePath,
      contentType,
      URL_EXPIRY.SHORT
    );

    return NextResponse.json({
      uploadUrl,
      filePath,
      expiresAt,
      publicUrl: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME || 'weccelerate-assets'}/${filePath}`,
    });

  } catch (error) {
    console.error('[Upload URL] Error:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת קישור העלאה', code: 'URL_ERROR' },
      { status: 500 }
    );
  }
}
