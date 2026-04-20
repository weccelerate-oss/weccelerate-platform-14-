/**
 * Pipedrive Webhook Handler
 *
 * Receives deal updates from Pipedrive and syncs project statuses.
 * Requires PIPEDRIVE_WEBHOOK_SECRET env var for verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  verifyWebhookToken,
  updateProjectFromPipedrive,
  handleDealStatusChange,
  PIPEDRIVE_EVENTS,
  type PipedriveWebhookPayload,
} from '@/lib/integrations/pipedrive';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const webhookSecret = process.env.PIPEDRIVE_WEBHOOK_SECRET;

    // If no secret configured, reject gracefully
    if (!webhookSecret) {
      console.warn('[Pipedrive Webhook] PIPEDRIVE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook not configured' },
        { status: 503 }
      );
    }

    // Verify webhook token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token');

    if (!verifyWebhookToken(token, webhookSecret)) {
      console.warn('[Pipedrive Webhook] Invalid token');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: PipedriveWebhookPayload = await request.json();
    const { meta, current, previous } = payload;

    console.log(`[Pipedrive Webhook] Received: ${meta.action}.${meta.object} (ID: ${meta.id})`);

    // Only handle deal events
    if (meta.object !== 'deal') {
      return NextResponse.json({ success: true, message: 'Ignored non-deal event' });
    }

    const event = `${meta.action}.${meta.object}`;

    // Handle deal updates (stage changes)
    if (event === PIPEDRIVE_EVENTS.DEAL_UPDATED && current) {
      const pipedriveId = String(current.id);
      const previousStageId = previous?.stage_id;
      const currentStageId = current.stage_id;

      // Check for status change (won/lost)
      if (current.status === 'won' || current.status === 'lost') {
        const result = await handleDealStatusChange(pipedriveId, current.status, current);
        revalidatePath('/portal/dashboard');
        revalidatePath('/admin/projects');
        return NextResponse.json(result);
      }

      // Check for stage change
      if (previousStageId !== currentStageId) {
        const result = await updateProjectFromPipedrive(pipedriveId, currentStageId, current);
        revalidatePath('/portal/dashboard');
        revalidatePath('/admin/projects');
        return NextResponse.json(result);
      }

      return NextResponse.json({ success: true, message: 'No stage change detected' });
    }

    // Handle new deal creation
    if (event === PIPEDRIVE_EVENTS.DEAL_ADDED && current) {
      console.log(`[Pipedrive Webhook] New deal added: ${current.title} (ID: ${current.id})`);
      // New deals are linked manually by admin via project creation
      return NextResponse.json({ success: true, message: 'Deal noted, link via admin panel' });
    }

    return NextResponse.json({ success: true, message: `Event ${event} processed` });
  } catch (error) {
    console.error('[Pipedrive Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'active',
    message: 'Pipedrive webhook endpoint is ready',
    events: ['updated.deal', 'added.deal'],
  });
}
