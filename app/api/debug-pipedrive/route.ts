import { NextResponse } from 'next/server';

export async function GET() {
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
      const { listDriveFiles } = await import('@/lib/google-drive');
      const files = await listDriveFiles(process.env.GOOGLE_DRIVE_PORTAL_FOLDER_ID);
      results.driveFilesCount = files.length;
      if (files.length > 0) {
        results.driveFirstFile = files[0].name;
      }
    }
  } catch (err) {
    results.driveError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
