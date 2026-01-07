/**
 * Pipedrive Webhook Handler
 * 
 * POST /api/webhooks/pipedrive
 * 
 * Receives deal updates from Pipedrive CRM and syncs project status.
 * 
 * Security:
 * - Verifies webhook secret token
 * - Validates payload structure
 * - Logs all incoming webhooks for debugging
 * 
 * Flow:
 * 1. Verify secret token (Authorization header or query param)
 * 2. Parse and validate the webhook payload
 * 3. Find the corresponding project by pipedriveId
 * 4. Update project status and timeline
 * 5. Create activity log and notifications
 * 6. Return appropriate response
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  PipedriveWebhookPayload,
  PipedriveDeal,
  verifyWebhookToken,
  updateProjectFromPipedrive,
  handleDealStatusChange,
  PIPEDRIVE_EVENTS,
  PIPEDRIVE_STAGE_MAP,
} from '@/lib/integrations/pipedrive';

// =============================================================================
// TYPES
// =============================================================================

interface WebhookResponse {
  success: boolean;
  message: string;
  projectId?: string;
  error?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const WEBHOOK_SECRET = process.env.PIPEDRIVE_WEBHOOK_SECRET || '';
const ENABLE_WEBHOOK_LOGGING = process.env.ENABLE_WEBHOOK_LOGGING === 'true';

// =============================================================================
// POST HANDLER
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse>> {
  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[Pipedrive Webhook ${requestId}] Received webhook`);

  try {
    // =========================================================================
    // 1. VERIFY SECRET TOKEN
    // =========================================================================
    
    // Check Authorization header first, then query param
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const queryToken = searchParams.get('token');
    
    const providedToken = authHeader?.replace('Bearer ', '') || queryToken;

    // In production, always verify the token
    if (process.env.NODE_ENV === 'production' && WEBHOOK_SECRET) {
      if (!verifyWebhookToken(providedToken, WEBHOOK_SECRET)) {
        console.warn(`[Pipedrive Webhook ${requestId}] Invalid or missing token`);
        
        // Log failed attempt
        await logWebhookAttempt(requestId, 'auth_failed', null);
        
        return NextResponse.json<WebhookResponse>(
          {
            success: false,
            message: 'Unauthorized',
            error: 'Invalid or missing webhook token',
          },
          { status: 401 }
        );
      }
    }

    // =========================================================================
    // 2. PARSE AND VALIDATE PAYLOAD
    // =========================================================================
    
    let payload: PipedriveWebhookPayload;
    
    try {
      payload = await request.json();
    } catch {
      console.error(`[Pipedrive Webhook ${requestId}] Invalid JSON payload`);
      return NextResponse.json<WebhookResponse>(
        {
          success: false,
          message: 'Invalid payload',
          error: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Log the webhook if enabled
    if (ENABLE_WEBHOOK_LOGGING) {
      await logWebhookAttempt(requestId, 'received', payload);
    }

    // Validate required fields
    if (!payload.meta || !payload.event) {
      console.error(`[Pipedrive Webhook ${requestId}] Missing required fields`);
      return NextResponse.json<WebhookResponse>(
        {
          success: false,
          message: 'Invalid payload structure',
          error: 'Missing meta or event fields',
        },
        { status: 400 }
      );
    }

    const { meta, current, previous, event } = payload;
    
    console.log(`[Pipedrive Webhook ${requestId}] Event: ${event}, Action: ${meta.action}, Object: ${meta.object}`);

    // =========================================================================
    // 3. HANDLE DIFFERENT EVENT TYPES
    // =========================================================================
    
    // Only process deal-related events
    if (meta.object !== 'deal') {
      console.log(`[Pipedrive Webhook ${requestId}] Ignoring non-deal event: ${meta.object}`);
      return NextResponse.json<WebhookResponse>({
        success: true,
        message: 'Event ignored - not a deal event',
      });
    }

    // Handle deal updates
    if (event === PIPEDRIVE_EVENTS.DEAL_UPDATED && current) {
      return await handleDealUpdate(requestId, current, previous);
    }

    // Handle new deals (optional - create project)
    if (event === PIPEDRIVE_EVENTS.DEAL_ADDED && current) {
      console.log(`[Pipedrive Webhook ${requestId}] New deal added: ${current.id} - ${current.title}`);
      // Could auto-create project here if needed
      return NextResponse.json<WebhookResponse>({
        success: true,
        message: 'Deal added - no action required',
      });
    }

    // Handle deleted deals
    if (event === PIPEDRIVE_EVENTS.DEAL_DELETED && previous) {
      console.log(`[Pipedrive Webhook ${requestId}] Deal deleted: ${previous.id}`);
      // Could archive project here if needed
      return NextResponse.json<WebhookResponse>({
        success: true,
        message: 'Deal deleted - no action required',
      });
    }

    // Unknown event type
    console.log(`[Pipedrive Webhook ${requestId}] Unhandled event type: ${event}`);
    return NextResponse.json<WebhookResponse>({
      success: true,
      message: `Event type ${event} not handled`,
    });

  } catch (error) {
    console.error(`[Pipedrive Webhook ${requestId}] Unexpected error:`, error);
    
    return NextResponse.json<WebhookResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// HANDLE DEAL UPDATE
// =============================================================================

async function handleDealUpdate(
  requestId: string,
  current: PipedriveDeal,
  previous: PipedriveDeal | null
): Promise<NextResponse<WebhookResponse>> {
  const pipedriveId = String(current.id);
  
  console.log(`[Pipedrive Webhook ${requestId}] Processing deal update for: ${pipedriveId}`);

  // Check for stage change
  const stageChanged = previous && current.stage_id !== previous.stage_id;
  
  // Check for status change (won/lost)
  const statusChanged = previous && current.status !== previous.status;

  // =========================================================================
  // Handle status change (won/lost)
  // =========================================================================
  
  if (statusChanged && (current.status === 'won' || current.status === 'lost')) {
    console.log(`[Pipedrive Webhook ${requestId}] Deal status changed to: ${current.status}`);
    
    const result = await handleDealStatusChange(pipedriveId, current.status, current);
    
    if (result.success) {
      return NextResponse.json<WebhookResponse>({
        success: true,
        message: `Project marked as ${current.status === 'won' ? 'graduated' : 'cancelled'}`,
        projectId: result.projectId,
      });
    } else {
      // If project not found, that's okay - might not be linked yet
      if (result.error?.includes('not found')) {
        return NextResponse.json<WebhookResponse>({
          success: true,
          message: 'Deal not linked to any project',
        });
      }
      
      return NextResponse.json<WebhookResponse>(
        {
          success: false,
          message: 'Failed to update project status',
          error: result.error,
        },
        { status: 500 }
      );
    }
  }

  // =========================================================================
  // Handle stage change
  // =========================================================================
  
  if (stageChanged) {
    console.log(
      `[Pipedrive Webhook ${requestId}] Stage changed: ${previous?.stage_id} → ${current.stage_id}`
    );
    
    // Check if we have a mapping for this stage
    if (!PIPEDRIVE_STAGE_MAP[current.stage_id]) {
      console.warn(
        `[Pipedrive Webhook ${requestId}] Unknown stage ID: ${current.stage_id}. ` +
        `Add mapping to PIPEDRIVE_STAGE_MAP.`
      );
      return NextResponse.json<WebhookResponse>({
        success: true,
        message: `Stage ${current.stage_id} not mapped - no action taken`,
      });
    }

    const result = await updateProjectFromPipedrive(
      pipedriveId,
      current.stage_id,
      current
    );

    if (result.success) {
      return NextResponse.json<WebhookResponse>({
        success: true,
        message: 'Project status updated successfully',
        projectId: result.projectId,
      });
    } else {
      // If project not found, that's okay
      if (result.error?.includes('not found')) {
        console.log(
          `[Pipedrive Webhook ${requestId}] No project linked to deal ${pipedriveId}`
        );
        return NextResponse.json<WebhookResponse>({
          success: true,
          message: 'Deal not linked to any project',
        });
      }

      return NextResponse.json<WebhookResponse>(
        {
          success: false,
          message: 'Failed to update project',
          error: result.error,
        },
        { status: 500 }
      );
    }
  }

  // No relevant changes detected
  console.log(`[Pipedrive Webhook ${requestId}] No stage or status change detected`);
  return NextResponse.json<WebhookResponse>({
    success: true,
    message: 'No relevant changes detected',
  });
}

// =============================================================================
// WEBHOOK LOGGING
// =============================================================================

async function logWebhookAttempt(
  requestId: string,
  status: string,
  payload: PipedriveWebhookPayload | null
): Promise<void> {
  try {
    const metadata: Record<string, unknown> = {
      requestId,
      status,
      timestamp: new Date().toISOString(),
    };

    // Only store minimal payload info for security
    if (payload) {
      metadata.event = payload.event;
      metadata.action = payload.meta?.action;
      metadata.dealId = payload.current?.id;
    }

    await prisma.activityLog.create({
      data: {
        action: 'webhook.pipedrive',
        description: `Pipedrive webhook: ${status}`,
        metadata,
      },
    });
  } catch (error) {
    console.error(`[Pipedrive Webhook ${requestId}] Failed to log webhook:`, error);
  }
}

// =============================================================================
// GET HANDLER (Health Check)
// =============================================================================

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Pipedrive Webhook Handler',
    timestamp: new Date().toISOString(),
    configured: !!WEBHOOK_SECRET,
  });
}

// =============================================================================
// OPTIONS HANDLER (CORS)
// =============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
