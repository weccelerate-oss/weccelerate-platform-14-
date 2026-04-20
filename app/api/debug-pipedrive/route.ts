import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';

export async function GET() {
  // Admin-only endpoint
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // Check env vars
  results.hasApiToken = !!process.env.PIPEDRIVE_API_TOKEN;
  results.tokenLength = process.env.PIPEDRIVE_API_TOKEN?.length || 0;
  results.hasDomain = !!process.env.PIPEDRIVE_COMPANY_DOMAIN;

  // Try to import and check client
  try {
    const { pipedriveClient } = await import('@/lib/pipedrive');
    results.clientReady = pipedriveClient.isReady();

    // Try fetching deal 17200
    const deal = await pipedriveClient.getDeal('17200');
    results.dealFound = !!deal;
    results.dealTitle = deal?.title || null;
    results.dealStatus = deal?.status || null;
    results.dealStageId = deal?.stage_id || null;

    // Try fetching activities
    const activities = await pipedriveClient.getDealActivities('17200');
    results.activitiesCount = activities.length;
    if (activities.length > 0) {
      results.firstActivity = { id: activities[0].id, type: activities[0].type, subject: activities[0].subject, done: activities[0].done };
    }
  } catch (err) {
    results.error = err instanceof Error ? err.message : String(err);
  }

  // Check Google Drive
  try {
    results.driveEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    results.driveKey = !!(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    results.driveFolderId = process.env.GOOGLE_DRIVE_PORTAL_FOLDER_ID || null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_DRIVE_PORTAL_FOLDER_ID) {
      const { listDriveFiles, findDriveFolder, listDriveSubfolders } = await import('@/lib/google-drive');
      const rootId = process.env.GOOGLE_DRIVE_PORTAL_FOLDER_ID;

      // List subfolders in root
      const subfolders = await listDriveSubfolders(rootId);
      results.driveSubfolders = subfolders.length;
      results.driveSampleFolders = subfolders.slice(0, 3).map(f => f.name);

      // Find deal 17200 folder
      const dealFolder = await findDriveFolder(rootId, '17200');
      results.driveDealFolder = dealFolder;

      if (dealFolder) {
        // Find Portal subfolder
        const portalFolder = await findDriveFolder(dealFolder, 'Portal');
        results.drivePortalFolder = portalFolder;

        const targetFolder = portalFolder || dealFolder;
        const files = await listDriveFiles(targetFolder);
        results.driveFilesCount = files.length;
        if (files.length > 0) {
          results.driveFileNames = files.map(f => f.name);
        }
      }
    }
  } catch (err) {
    results.driveError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
