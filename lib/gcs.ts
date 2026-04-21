/**
 * Google Cloud Storage (GCS) Utility
 * 
 * Handles file uploads, downloads, and signed URL generation for:
 * - Entrepreneur File Vault (private documents)
 * - Media uploads (images, videos)
 * - Public assets
 * 
 * Authentication: Service Account JSON key
 * Bucket: weccelerate-assets
 * 
 * @module lib/gcs
 */

import { Storage, Bucket, File as GCSFile, GetSignedUrlConfig } from '@google-cloud/storage';
import { Readable } from 'stream';
import path from 'path';
import crypto from 'crypto';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * GCS Configuration
 * Environment variables required:
 * - GCS_PROJECT_ID: Google Cloud project ID
 * - GCS_KEY_FILE: Path to service account JSON key file
 * - GCS_BUCKET_NAME: Default bucket name (weccelerate-assets)
 */
const GCS_CONFIG = {
  projectId: process.env.GCS_PROJECT_ID || 'weccelerate-platform',
  keyFilename: process.env.GCS_KEY_FILE || './gcs-service-account.json',
  bucketName: process.env.GCS_BUCKET_NAME || 'weccelerate-assets',
} as const;

/**
 * Bucket folder structure
 */
export const GCS_FOLDERS = {
  // Private - Entrepreneur vault documents
  VAULT: 'vault',
  VAULT_DOCUMENTS: 'vault/documents',
  VAULT_PRESENTATIONS: 'vault/presentations',
  VAULT_FINANCIALS: 'vault/financials',
  
  // Public - Media and assets
  MEDIA: 'media',
  MEDIA_IMAGES: 'media/images',
  MEDIA_VIDEOS: 'media/videos',
  MEDIA_THUMBNAILS: 'media/thumbnails',
  
  // Events
  EVENTS: 'events',
  EVENTS_IMAGES: 'events/images',
  
  // Avatars
  AVATARS: 'avatars',
  
  // Temporary uploads
  TEMP: 'temp',
} as const;

/**
 * Signed URL expiration times (in seconds)
 */
export const URL_EXPIRY = {
  SHORT: 15 * 60,        // 15 minutes
  MEDIUM: 60 * 60,       // 1 hour
  LONG: 24 * 60 * 60,    // 24 hours
  WEEK: 7 * 24 * 60 * 60, // 7 days
} as const;

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
} as const;

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  document: 50 * 1024 * 1024,  // 50MB
  image: 10 * 1024 * 1024,     // 10MB
  video: 500 * 1024 * 1024,    // 500MB
  avatar: 5 * 1024 * 1024,     // 5MB
  other: 25 * 1024 * 1024,     // 25MB
} as const;

// =============================================================================
// STORAGE CLIENT
// =============================================================================

let storageClient: Storage | null = null;
let defaultBucket: Bucket | null = null;

/**
 * Initialize the GCS client with service account credentials
 */
function getStorageClient(): Storage {
  if (!storageClient) {
    // Check if running in GCP environment (has implicit credentials)
    const isGCPEnvironment = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                             process.env.K_SERVICE; // Cloud Run
    
    if (isGCPEnvironment) {
      // Use implicit credentials in GCP
      storageClient = new Storage({
        projectId: GCS_CONFIG.projectId,
      });
    } else {
      // Use service account key file for local development
      storageClient = new Storage({
        projectId: GCS_CONFIG.projectId,
        keyFilename: GCS_CONFIG.keyFilename,
      });
    }
  }
  
  return storageClient;
}

/**
 * Get the default bucket instance
 */
function getBucket(): Bucket {
  if (!defaultBucket) {
    defaultBucket = getStorageClient().bucket(GCS_CONFIG.bucketName);
  }
  return defaultBucket;
}

// =============================================================================
// TYPES
// =============================================================================

export interface UploadOptions {
  /** Destination folder path */
  destination: string;
  /** Whether the file should be private (requires signed URL) */
  isPrivate?: boolean;
  /** Custom content type */
  contentType?: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** Cache control header */
  cacheControl?: string;
  /** Custom filename (default: generates unique name) */
  customFilename?: string;
}

export interface UploadResult {
  /** Public URL (for public files) or GCS path (for private) */
  url: string;
  /** Full GCS path (gs://bucket/path) */
  gcsPath: string;
  /** Bucket name */
  bucket: string;
  /** File path within bucket */
  path: string;
  /** Original filename */
  originalName: string;
  /** Stored filename */
  storedName: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** MD5 checksum */
  checksum: string;
  /** Whether file is private */
  isPrivate: boolean;
  /** Signed URL (for private files) */
  signedUrl?: string;
  /** Signed URL expiry */
  signedUrlExpiry?: Date;
}

export interface SignedUrlOptions {
  /** Expiration time in seconds */
  expiresIn?: number;
  /** HTTP method */
  action?: 'read' | 'write' | 'delete';
  /** Content type for write operations */
  contentType?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique filename with timestamp and random string
 */
function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .substring(0, 50);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  
  return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Get MIME type category
 */
function getMimeCategory(mimeType: string): 'document' | 'image' | 'video' | 'other' {
  if (ALLOWED_MIME_TYPES.documents.includes(mimeType as never)) return 'document';
  if (ALLOWED_MIME_TYPES.images.includes(mimeType as never)) return 'image';
  if (ALLOWED_MIME_TYPES.videos.includes(mimeType as never)) return 'video';
  return 'other';
}

/**
 * Validate file before upload
 */
function validateFile(
  file: Buffer | Readable,
  mimeType: string,
  size: number,
  allowedTypes: string[] = [...ALLOWED_MIME_TYPES.documents, ...ALLOWED_MIME_TYPES.images],
): void {
  // Validate MIME type
  if (!allowedTypes.includes(mimeType)) {
    throw new GCSError(
      `סוג קובץ לא מורשה: ${mimeType}`,
      'INVALID_MIME_TYPE'
    );
  }
  
  // Validate size based on category
  const category = getMimeCategory(mimeType);
  const maxSize = MAX_FILE_SIZES[category] || MAX_FILE_SIZES.document;
  
  if (size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    throw new GCSError(
      `גודל הקובץ חורג מהמותר (מקסימום ${maxMB}MB)`,
      'FILE_TOO_LARGE'
    );
  }
}

/**
 * Calculate MD5 checksum of buffer
 */
function calculateChecksum(buffer: Buffer): string {
  return crypto.createHash('md5').update(buffer).digest('base64');
}

// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================

export class GCSError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'GCSError';
  }
}

// =============================================================================
// MAIN UPLOAD FUNCTION
// =============================================================================

/**
 * Upload a file to Google Cloud Storage
 * 
 * @param file - File buffer or readable stream
 * @param originalName - Original filename
 * @param options - Upload options
 * @returns Upload result with URLs and metadata
 * 
 * @example
 * ```typescript
 * // Upload a document to the vault
 * const result = await uploadFile(
 *   fileBuffer,
 *   'pitch-deck.pdf',
 *   { 
 *     destination: GCS_FOLDERS.VAULT_DOCUMENTS,
 *     isPrivate: true 
 *   }
 * );
 * ```
 */
export async function uploadFile(
  file: Buffer | Readable,
  originalName: string,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    destination,
    isPrivate = true,
    contentType,
    metadata = {},
    cacheControl,
    customFilename,
  } = options;

  try {
    // Convert stream to buffer if needed for validation
    let buffer: Buffer;
    if (Buffer.isBuffer(file)) {
      buffer = file;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of file) {
        chunks.push(Buffer.from(chunk));
      }
      buffer = Buffer.concat(chunks);
    }

    // Detect MIME type
    const mimeType = contentType || detectMimeType(originalName);
    
    // Validate file
    validateFile(buffer, mimeType, buffer.length);
    
    // Generate unique filename
    const storedName = customFilename || generateUniqueFilename(originalName);
    const filePath = `${destination}/${storedName}`;
    
    // Calculate checksum
    const checksum = calculateChecksum(buffer);
    
    // Get bucket and file reference
    const bucket = getBucket();
    const gcsFile = bucket.file(filePath);
    
    // Upload options
    const uploadOptions: {
      metadata: {
        contentType: string;
        cacheControl?: string;
        metadata: Record<string, string>;
      };
      resumable: boolean;
      validation: string;
    } = {
      metadata: {
        contentType: mimeType,
        cacheControl: cacheControl || (isPrivate ? 'private, max-age=0' : 'public, max-age=31536000'),
        metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      },
      resumable: buffer.length > 5 * 1024 * 1024, // Use resumable for files > 5MB
      validation: 'md5',
    };
    
    // Upload file
    await gcsFile.save(buffer, uploadOptions);
    
    // Set public access if not private
    if (!isPrivate) {
      await gcsFile.makePublic();
    }
    
    // Generate URLs
    const gcsPath = `gs://${GCS_CONFIG.bucketName}/${filePath}`;
    let url: string;
    let signedUrl: string | undefined;
    let signedUrlExpiry: Date | undefined;
    
    if (isPrivate) {
      // Generate signed URL for private files
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + URL_EXPIRY.LONG);
      
      const [signed] = await gcsFile.getSignedUrl({
        action: 'read',
        expires: expiresAt,
      });
      
      signedUrl = signed;
      signedUrlExpiry = expiresAt;
      url = gcsPath; // Store GCS path as primary URL
    } else {
      // Public URL
      url = `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${filePath}`;
    }
    
    return {
      url,
      gcsPath,
      bucket: GCS_CONFIG.bucketName,
      path: filePath,
      originalName,
      storedName,
      mimeType,
      size: buffer.length,
      checksum,
      isPrivate,
      signedUrl,
      signedUrlExpiry,
    };
    
  } catch (error) {
    if (error instanceof GCSError) throw error;
    
    console.error('[GCS] Upload error:', error);
    throw new GCSError(
      'שגיאה בהעלאת הקובץ',
      'UPLOAD_ERROR',
      error
    );
  }
}

// =============================================================================
// SIGNED URL GENERATION
// =============================================================================

/**
 * Generate a signed URL for accessing a private file
 * 
 * @param filePath - Path to the file in the bucket
 * @param options - Signed URL options
 * @returns Signed URL and expiry date
 */
export async function generateSignedUrl(
  filePath: string,
  options: SignedUrlOptions = {}
): Promise<{ url: string; expiresAt: Date }> {
  const {
    expiresIn = URL_EXPIRY.MEDIUM,
    action = 'read',
    contentType,
  } = options;

  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new GCSError(
        'הקובץ לא נמצא',
        'FILE_NOT_FOUND'
      );
    }
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    
    const signedUrlConfig: GetSignedUrlConfig = {
      action,
      expires: expiresAt,
    };
    
    if (contentType && action === 'write') {
      signedUrlConfig.contentType = contentType;
    }
    
    const [url] = await file.getSignedUrl(signedUrlConfig);
    
    return { url, expiresAt };
    
  } catch (error) {
    if (error instanceof GCSError) throw error;
    
    console.error('[GCS] Signed URL error:', error);
    throw new GCSError(
      'שגיאה ביצירת קישור גישה',
      'SIGNED_URL_ERROR',
      error
    );
  }
}

/**
 * Generate a signed upload URL for direct client uploads
 * 
 * @param filePath - Destination path in the bucket
 * @param contentType - Expected content type
 * @param expiresIn - Expiration time in seconds
 * @returns Signed upload URL
 */
export async function generateUploadUrl(
  filePath: string,
  contentType: string,
  expiresIn: number = URL_EXPIRY.SHORT
): Promise<{ uploadUrl: string; expiresAt: Date }> {
  const { url, expiresAt } = await generateSignedUrl(filePath, {
    action: 'write',
    contentType,
    expiresIn,
  });
  
  return { uploadUrl: url, expiresAt };
}

// =============================================================================
// FILE OPERATIONS
// =============================================================================

/**
 * Delete a file from GCS
 * 
 * @param filePath - Path to the file in the bucket
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    
    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`[GCS] File not found for deletion: ${filePath}`);
      return;
    }
    
    await file.delete();
    
  } catch (error) {
    console.error('[GCS] Delete error:', error);
    throw new GCSError(
      'שגיאה במחיקת הקובץ',
      'DELETE_ERROR',
      error
    );
  }
}

/**
 * Copy a file within GCS
 * 
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  try {
    const bucket = getBucket();
    const sourceFile = bucket.file(sourcePath);
    const destFile = bucket.file(destinationPath);
    
    await sourceFile.copy(destFile);
    
  } catch (error) {
    console.error('[GCS] Copy error:', error);
    throw new GCSError(
      'שגיאה בהעתקת הקובץ',
      'COPY_ERROR',
      error
    );
  }
}

/**
 * Move a file within GCS (copy + delete)
 * 
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 */
export async function moveFile(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  await copyFile(sourcePath, destinationPath);
  await deleteFile(sourcePath);
}

/**
 * Get file metadata
 * 
 * @param filePath - Path to the file
 */
export async function getFileMetadata(filePath: string): Promise<{
  name: string;
  size: number;
  contentType: string;
  created: Date;
  updated: Date;
  metadata: Record<string, string>;
}> {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    
    const [metadata] = await file.getMetadata();
    
    return {
      name: metadata.name || filePath,
      size: parseInt(metadata.size?.toString() || '0', 10),
      contentType: metadata.contentType || 'application/octet-stream',
      created: new Date(metadata.timeCreated || Date.now()),
      updated: new Date(metadata.updated || Date.now()),
      metadata: (metadata.metadata as Record<string, string>) || {},
    };
    
  } catch (error) {
    console.error('[GCS] Metadata error:', error);
    throw new GCSError(
      'שגיאה בקריאת מידע הקובץ',
      'METADATA_ERROR',
      error
    );
  }
}

/**
 * Download a file from GCS
 * 
 * @param filePath - Path to the file
 * @returns File buffer
 */
export async function downloadFile(filePath: string): Promise<Buffer> {
  try {
    const bucket = getBucket();
    const file = bucket.file(filePath);
    
    const [buffer] = await file.download();
    return buffer;
    
  } catch (error) {
    console.error('[GCS] Download error:', error);
    throw new GCSError(
      'שגיאה בהורדת הקובץ',
      'DOWNLOAD_ERROR',
      error
    );
  }
}

/**
 * List files in a folder
 * 
 * @param prefix - Folder path prefix
 * @param options - List options
 */
export async function listFiles(
  prefix: string,
  options: { maxResults?: number; pageToken?: string } = {}
): Promise<{
  files: Array<{ name: string; size: number; updated: Date }>;
  nextPageToken?: string;
}> {
  try {
    const bucket = getBucket();
    
    const [files, , apiResponse] = await bucket.getFiles({
      prefix,
      maxResults: options.maxResults || 100,
      pageToken: options.pageToken,
    });
    
    return {
      files: files.map((file) => ({
        name: file.name,
        size: parseInt(file.metadata.size?.toString() || '0', 10),
        updated: new Date(file.metadata.updated || Date.now()),
      })),
      nextPageToken: (apiResponse as { nextPageToken?: string } | undefined)?.nextPageToken,
    };
    
  } catch (error) {
    console.error('[GCS] List error:', error);
    throw new GCSError(
      'שגיאה ברשימת הקבצים',
      'LIST_ERROR',
      error
    );
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Detect MIME type from filename
 */
function detectMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    
    // Videos
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Check if a URL is a GCS path
 */
export function isGCSPath(url: string): boolean {
  return url.startsWith('gs://');
}

/**
 * Parse a GCS path into bucket and object name
 */
export function parseGCSPath(gcsPath: string): { bucket: string; object: string } | null {
  const match = gcsPath.match(/^gs:\/\/([^/]+)\/(.+)$/);
  if (!match) return null;
  
  return {
    bucket: match[1],
    object: match[2],
  };
}

/**
 * Convert GCS path to public URL
 */
export function gcsPathToPublicUrl(gcsPath: string): string | null {
  const parsed = parseGCSPath(gcsPath);
  if (!parsed) return null;
  
  return `https://storage.googleapis.com/${parsed.bucket}/${parsed.object}`;
}

// =============================================================================
// BUCKET MANAGEMENT (Admin functions)
// =============================================================================

/**
 * Set CORS configuration on the bucket
 * Call this once during setup
 */
export async function configureBucketCORS(): Promise<void> {
  const bucket = getBucket();
  
  await bucket.setCorsConfiguration([
    {
      maxAgeSeconds: 3600,
      method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      origin: [
        'https://weccelerate.co.il',
        'https://*.weccelerate.co.il',
        'http://localhost:3000', // Development
      ],
      responseHeader: [
        'Content-Type',
        'Content-Length',
        'Content-Disposition',
        'Cache-Control',
      ],
    },
  ]);
  
  console.log('[GCS] CORS configuration updated');
}

/**
 * Set lifecycle rules on the bucket
 */
export async function configureBucketLifecycle(): Promise<void> {
  const bucket = getBucket();
  
  await bucket.setMetadata({
    lifecycle: {
      rule: [
        {
          action: { type: 'Delete' },
          condition: {
            age: 30, // Delete temp files after 30 days
            matchesPrefix: ['temp/'],
          },
        },
        {
          action: { type: 'SetStorageClass', storageClass: 'NEARLINE' },
          condition: {
            age: 90, // Move old vault files to nearline after 90 days
            matchesPrefix: ['vault/'],
          },
        },
      ],
    },
  });
  
  console.log('[GCS] Lifecycle rules configured');
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  uploadFile,
  generateSignedUrl,
  generateUploadUrl,
  deleteFile,
  copyFile,
  moveFile,
  getFileMetadata,
  downloadFile,
  listFiles,
  isGCSPath,
  parseGCSPath,
  gcsPathToPublicUrl,
  configureBucketCORS,
  configureBucketLifecycle,
  GCS_FOLDERS,
  URL_EXPIRY,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZES,
};
