/**
 * Google Drive Service
 *
 * Fetches PDF files from entrepreneur's folder tree in Google Drive.
 * Recursively scans all subfolders. Uses Service Account authentication.
 */

import { google } from 'googleapis';

// =============================================================================
// TYPES
// =============================================================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
  webContentLink: string | null;
  downloadLink: string;      // Direct download via export/alt=media
  iconLink: string;
  modifiedTime: string;
  thumbnailLink: string | null;
}

// =============================================================================
// AUTH
// =============================================================================

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    console.warn('[GoogleDrive] Missing credentials');
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

// =============================================================================
// BUILD DOWNLOAD LINK
// =============================================================================

function buildDownloadLink(fileId: string, mimeType: string): string {
  // Google Docs/Sheets/Slides need export, regular files use alt=media
  if (mimeType.includes('google-apps.document')) {
    return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
  }
  if (mimeType.includes('google-apps.spreadsheet')) {
    return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
  }
  if (mimeType.includes('google-apps.presentation')) {
    return `https://docs.google.com/presentation/d/${fileId}/export?format=pdf`;
  }
  // Regular files (uploaded PDFs, images, etc.)
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

function buildViewLink(fileId: string, webViewLink: string): string {
  // Use the webViewLink if available, otherwise build one
  if (webViewLink) return webViewLink;
  return `https://drive.google.com/file/d/${fileId}/view`;
}

// =============================================================================
// LIST ALL PDFs RECURSIVELY
// =============================================================================

// File types to show in the portal
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  // Excel
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.google-apps.spreadsheet',
  // PowerPoint
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.google-apps.presentation',
  // Word
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.google-apps.document',
]);

/**
 * Recursively list all relevant files (PDF, Excel, PowerPoint, Word)
 * in a folder and all its subfolders.
 */
export async function listAllPdfs(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  const allFiles: DriveFile[] = [];

  async function scanFolder(parentId: string) {
    try {
      // Get all items in this folder
      const response = await drive!.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, iconLink, modifiedTime, thumbnailLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 100,
      });

      const items = response.data.files || [];

      for (const item of items) {
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          // Recurse into subfolder
          await scanFolder(item.id!);
        } else if (ALLOWED_MIME_TYPES.has(item.mimeType || '')) {
          // PDF, Excel, PowerPoint, Word files
          allFiles.push({
            id: item.id || '',
            name: item.name || '',
            mimeType: item.mimeType || '',
            size: item.size || '0',
            webViewLink: buildViewLink(item.id || '', item.webViewLink || ''),
            webContentLink: item.webContentLink || null,
            downloadLink: buildDownloadLink(item.id || '', item.mimeType || ''),
            iconLink: item.iconLink || '',
            modifiedTime: item.modifiedTime || '',
            thumbnailLink: item.thumbnailLink || null,
          });
        }
      }
    } catch (error) {
      console.error(`[GoogleDrive] Error scanning folder ${parentId}:`, error);
    }
  }

  await scanFolder(folderId);
  return allFiles;
}

// =============================================================================
// ORIGINAL FUNCTIONS (kept for compatibility)
// =============================================================================

export async function listDriveFiles(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, iconLink, modifiedTime, thumbnailLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    });

    return (response.data.files || []).map((f) => ({
      id: f.id || '',
      name: f.name || '',
      mimeType: f.mimeType || '',
      size: f.size || '0',
      webViewLink: buildViewLink(f.id || '', f.webViewLink || ''),
      webContentLink: f.webContentLink || null,
      downloadLink: buildDownloadLink(f.id || '', f.mimeType || ''),
      iconLink: f.iconLink || '',
      modifiedTime: f.modifiedTime || '',
      thumbnailLink: f.thumbnailLink || null,
    }));
  } catch (error) {
    console.error('[GoogleDrive] Error listing files:', error);
    return [];
  }
}

export async function listDriveSubfolders(parentFolderId: string): Promise<{ id: string; name: string }[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  try {
    const response = await drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      orderBy: 'name',
      pageSize: 100,
    });

    return (response.data.files || []).map((f) => ({
      id: f.id || '',
      name: f.name || '',
    }));
  } catch (error) {
    console.error('[GoogleDrive] Error listing subfolders:', error);
    return [];
  }
}

export async function findDriveFolder(parentFolderId: string, searchName: string): Promise<string | null> {
  const drive = getDriveClient();
  if (!drive) return null;

  try {
    const response = await drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name contains '${searchName}' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 5,
    });

    return response.data.files?.[0]?.id || null;
  } catch (error) {
    console.error('[GoogleDrive] Error finding folder:', error);
    return null;
  }
}
