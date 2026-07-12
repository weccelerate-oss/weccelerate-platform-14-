/**
 * Decision logger — every autonomous action records WHY it happened.
 * Powers /admin/daily-report and the morning email digest.
 */

import { prisma } from '@/lib/db';

export interface DecisionInput {
  agent: 'gap-analyzer' | 'content-writer' | 'self-improver' | 'competitor-watch' | 'social-poster' | 'system';
  action: string;
  reasoning: string;
  payload?: Record<string, unknown>;
  success?: boolean;
  durationMs?: number;
}

export async function logDecision(input: DecisionInput): Promise<void> {
  try {
    await prisma.agentDecision.create({
      data: {
        agent: input.agent,
        action: input.action,
        reasoning: input.reasoning,
        payload: (input.payload ?? {}) as object,
        success: input.success ?? true,
        durationMs: input.durationMs ?? null,
      },
    });
  } catch (e) {
    // Telemetry must never break the agent itself.
    console.error('logDecision failed:', e);
  }
}
