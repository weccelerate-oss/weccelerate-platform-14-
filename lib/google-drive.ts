/**
 * Google Drive Service
 *
 * Fetches files from entrepreneur's Portal folder in Google Drive.
 * Uses Service Account authentication.
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
  webViewLink: string;   // Open in Google Docs/Sheets/etc
  webContentLink: string | null; // Direct download
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
    console.warn('[GoogleDrive] Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY');
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
// FETCH FILES FROM FOLDER
// =============================================================================

/**
 * List files in a Google Drive folder.
 * The folder must be shared with the service account email.
 */
export async function listDriveFiles(folderId: string): Promise<DriveFile[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, iconLink, modifiedTime, thumbnailLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    });

    return (response.data.files || []).map((f) => ({
      id: f.id || '',
      name: f.name || '',
      mimeType: f.mimeType || '',
      size: f.size || '0',
      webViewLink: f.webViewLink || '',
      webContentLink: f.webContentLink || null,
      iconLink: f.iconLink || '',
      modifiedTime: f.modifiedTime || '',
      thumbnailLink: f.thumbnailLink || null,
    }));
  } catch (error) {
    console.error('[GoogleDrive] Error listing files:', error);
    return [];
  }
}

/**
 * List subfolders in a Google Drive folder.
 * Used to find per-entrepreneur Portal folders.
 */
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

/**
 * Find a subfolder by name (partial match).
 * Used to find entrepreneur's folder by deal ID or name.
 */
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
