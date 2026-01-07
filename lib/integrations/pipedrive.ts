/**
 * Pipedrive Integration Utilities
 * 
 * Helper functions for integrating with Pipedrive CRM.
 * Handles stage mapping, webhook verification, and API calls.
 */

import { prisma } from '@/lib/db';

// =============================================================================
// TYPES
// =============================================================================

export interface PipedriveWebhookPayload {
  v: number; // Webhook version
  matches_filters: {
    current: unknown[];
    previous: unknown[];
  };
  meta: {
    action: 'added' | 'updated' | 'deleted' | 'merged';
    change_source: string;
    company_id: number;
    host: string;
    id: number;
    is_bulk_update: boolean;
    matches_filters: Record<string, unknown>;
    object: string;
    permitted_user_ids: number[];
    pipedrive_service_name: string;
    timestamp: number;
    timestamp_micro: number;
    trans_pending: boolean;
    user_id: number;
    webhook_id: string;
  };
  current: PipedriveDeal | null;
  previous: PipedriveDeal | null;
  event: string;
}

export interface PipedriveDeal {
  id: number;
  title: string;
  value: number;
  currency: string;
  status: 'open' | 'won' | 'lost' | 'deleted';
  stage_id: number;
  pipeline_id: number;
  person_id: number | null;
  org_id: number | null;
  owner_id: number;
  expected_close_date: string | null;
  add_time: string;
  update_time: string;
  stage_change_time: string | null;
  won_time: string | null;
  lost_time: string | null;
  close_time: string | null;
  probability: number | null;
  lost_reason: string | null;
  visible_to: string;
  label: number[] | null;
  // Custom fields (example - adjust based on your Pipedrive setup)
  [key: string]: unknown;
}

// =============================================================================
// STAGE MAPPING
// =============================================================================

/**
 * Maps Pipedrive stage IDs to internal project statuses.
 * Update these IDs to match your Pipedrive pipeline configuration.
 */
export const PIPEDRIVE_STAGE_MAP: Record<number, string> = {
  // These IDs should match your actual Pipedrive stage IDs
  1: 'CHARACTERIZATION',    // אפיון
  2: 'MARKET_RESEARCH',     // מחקר שוק
  3: 'BUSINESS_MODEL',      // מודל עסקי
  4: 'DEVELOPMENT',         // פיתוח
  5: 'FUNDING_PREP',        // הכנה לגיוס
  6: 'ACTIVE_FUNDING',      // גיוס פעיל
  7: 'POST_FUNDING',        // לאחר גיוס
  8: 'SCALING',             // צמיחה
  9: 'GRADUATED',           // בוגר
};

/**
 * Hebrew stage names for display/logging
 */
export const STAGE_NAMES_HE: Record<string, string> = {
  DRAFT: 'טיוטה',
  CHARACTERIZATION: 'אפיון',
  MARKET_RESEARCH: 'מחקר שוק',
  BUSINESS_MODEL: 'מודל עסקי',
  DEVELOPMENT: 'פיתוח',
  FUNDING_PREP: 'הכנה לגיוס',
  ACTIVE_FUNDING: 'גיוס פעיל',
  POST_FUNDING: 'לאחר גיוס',
  SCALING: 'צמיחה',
  GRADUATED: 'בוגר',
  ON_HOLD: 'מושהה',
  CANCELLED: 'בוטל',
};

// =============================================================================
// WEBHOOK VERIFICATION
// =============================================================================

/**
 * Verifies the Pipedrive webhook secret token.
 * The token should be passed in the Authorization header or query string.
 */
export function verifyWebhookToken(
  providedToken: string | null,
  expectedToken: string
): boolean {
  if (!providedToken || !expectedToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (providedToken.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < providedToken.length; i++) {
    result |= providedToken.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}

// =============================================================================
// PROJECT UPDATE FUNCTIONS
// =============================================================================

interface TimelineStage {
  name: string;
  startDate: string;
  endDate: string | null;
  status: 'completed' | 'in_progress' | 'pending';
}

interface Timeline {
  stages: TimelineStage[];
}

/**
 * Updates a project's status based on Pipedrive stage change.
 */
export async function updateProjectFromPipedrive(
  pipedriveId: string,
  newStageId: number,
  dealData: PipedriveDeal
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    // Find the project
    const project = await prisma.project.findUnique({
      where: { pipedriveId },
      include: { user: true },
    });

    if (!project) {
      return { 
        success: false, 
        error: `Project with Pipedrive ID ${pipedriveId} not found` 
      };
    }

    // Map the new stage
    const newStatus = PIPEDRIVE_STAGE_MAP[newStageId];
    if (!newStatus) {
      console.warn(`[Pipedrive] Unknown stage ID: ${newStageId}`);
      return { 
        success: false, 
        error: `Unknown Pipedrive stage ID: ${newStageId}` 
      };
    }

    const oldStatus = project.status;
    const now = new Date().toISOString();

    // Update timeline
    const existingTimeline = (project.timeline as Timeline) || { stages: [] };
    const stageIndex = existingTimeline.stages.findIndex(
      (s) => s.name === STAGE_NAMES_HE[oldStatus]
    );

    // Mark previous stage as completed
    if (stageIndex !== -1) {
      existingTimeline.stages[stageIndex].endDate = now;
      existingTimeline.stages[stageIndex].status = 'completed';
    }

    // Add new stage if it doesn't exist
    const newStageExists = existingTimeline.stages.some(
      (s) => s.name === STAGE_NAMES_HE[newStatus]
    );
    
    if (!newStageExists) {
      existingTimeline.stages.push({
        name: STAGE_NAMES_HE[newStatus],
        startDate: now,
        endDate: null,
        status: 'in_progress',
      });
    } else {
      // Update existing stage to in_progress
      const idx = existingTimeline.stages.findIndex(
        (s) => s.name === STAGE_NAMES_HE[newStatus]
      );
      if (idx !== -1) {
        existingTimeline.stages[idx].status = 'in_progress';
      }
    }

    // Update the project
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: newStatus as 'DRAFT' | 'CHARACTERIZATION' | 'MARKET_RESEARCH' | 'BUSINESS_MODEL' | 'DEVELOPMENT' | 'FUNDING_PREP' | 'ACTIVE_FUNDING' | 'POST_FUNDING' | 'SCALING' | 'GRADUATED' | 'ON_HOLD' | 'CANCELLED',
        timeline: existingTimeline,
        // Update funding info if available
        ...(dealData.value && { targetFunding: dealData.value }),
        updatedAt: new Date(),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'project.status_changed',
        description: `סטטוס הפרויקט עודכן מ-${STAGE_NAMES_HE[oldStatus]} ל-${STAGE_NAMES_HE[newStatus]}`,
        userId: project.userId,
        projectId: project.id,
        metadata: {
          previousStatus: oldStatus,
          newStatus: newStatus,
          pipedriveStageId: newStageId,
          pipedriveDealId: dealData.id,
          source: 'pipedrive_webhook',
        },
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        title: 'עדכון סטטוס פרויקט',
        message: `הפרויקט "${project.name}" עבר לשלב: ${STAGE_NAMES_HE[newStatus]}`,
        type: 'info',
        userId: project.userId,
        link: `/portal/projects/${project.id}`,
      },
    });

    console.log(
      `[Pipedrive] Updated project ${project.id}: ${oldStatus} → ${newStatus}`
    );

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('[Pipedrive] Error updating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// =============================================================================
// DEAL STATUS HANDLING
// =============================================================================

/**
 * Handles deal won/lost status changes
 */
export async function handleDealStatusChange(
  pipedriveId: string,
  status: 'won' | 'lost',
  dealData: PipedriveDeal
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const project = await prisma.project.findUnique({
      where: { pipedriveId },
    });

    if (!project) {
      return { 
        success: false, 
        error: `Project with Pipedrive ID ${pipedriveId} not found` 
      };
    }

    let newStatus: string;
    let notificationMessage: string;

    if (status === 'won') {
      newStatus = 'GRADUATED';
      notificationMessage = `🎉 מזל טוב! הפרויקט "${project.name}" הושלם בהצלחה!`;
    } else {
      newStatus = 'CANCELLED';
      notificationMessage = `הפרויקט "${project.name}" בוטל. סיבה: ${dealData.lost_reason || 'לא צוינה'}`;
    }

    // Update project
    await prisma.project.update({
      where: { id: project.id },
      data: {
        status: newStatus as 'GRADUATED' | 'CANCELLED',
        // If won, record the final funding amount
        ...(status === 'won' && dealData.value && { 
          fundingRaised: dealData.value 
        }),
        updatedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: status === 'won' ? 'project.graduated' : 'project.cancelled',
        description: notificationMessage,
        userId: project.userId,
        projectId: project.id,
        metadata: {
          pipedriveStatus: status,
          pipedriveDealId: dealData.id,
          ...(status === 'lost' && { lostReason: dealData.lost_reason }),
          source: 'pipedrive_webhook',
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        title: status === 'won' ? 'פרויקט הושלם!' : 'פרויקט בוטל',
        message: notificationMessage,
        type: status === 'won' ? 'success' : 'warning',
        userId: project.userId,
        link: `/portal/projects/${project.id}`,
      },
    });

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('[Pipedrive] Error handling deal status change:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// =============================================================================
// WEBHOOK EVENT TYPES
// =============================================================================

export const PIPEDRIVE_EVENTS = {
  DEAL_UPDATED: 'updated.deal',
  DEAL_ADDED: 'added.deal',
  DEAL_DELETED: 'deleted.deal',
  DEAL_MERGED: 'merged.deal',
} as const;

export type PipedriveEventType = typeof PIPEDRIVE_EVENTS[keyof typeof PIPEDRIVE_EVENTS];
