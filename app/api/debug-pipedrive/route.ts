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

  return NextResponse.json(results);
}
