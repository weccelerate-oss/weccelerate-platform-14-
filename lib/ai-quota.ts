/**
 * Per-user monthly AI-generation quotas.
 *
 * Every AI feature the portal exposes to entrepreneurs (mentor feedback
 * today; investor-room simulation tomorrow) consumes from a monthly pool
 * counted in the `ai_usage` table — one row per (user, feature, month),
 * incremented atomically so concurrent requests can never overshoot.
 *
 * Limits are read from SiteSetting key `ai.<feature>_monthly_limit` so the
 * team can tune them from the admin without a deploy; DEFAULT_LIMITS is the
 * fallback. A limit of 0 disables the feature.
 */

import { prisma } from '@/lib/db';

const DEFAULT_LIMITS: Record<string, number> = {
  mentor_feedback: 30,
};

export type AiFeature = keyof typeof DEFAULT_LIMITS | (string & {});

export interface QuotaState {
  limit: number;
  used: number;
  remaining: number;
  /** 'YYYY-MM' the state refers to. */
  period: string;
}

/** Calendar month in Israel time — quotas renew on the 1st, local time. */
export function currentPeriod(): string {
  const now = new Date();
  const il = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
  }).format(now); // "2026-07"
  return il;
}

export async function getMonthlyLimit(feature: AiFeature): Promise<number> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: `ai.${feature}_monthly_limit` },
      select: { value: true },
    });
    const v = Number(setting?.value);
    if (Number.isFinite(v) && v >= 0) return Math.floor(v);
  } catch {
    /* fall through to default */
  }
  return DEFAULT_LIMITS[feature] ?? 30;
}

export async function getQuota(userId: string, feature: AiFeature): Promise<QuotaState> {
  const period = currentPeriod();
  const limit = await getMonthlyLimit(feature);
  let used = 0;
  try {
    const row = await prisma.aiUsage.findUnique({
      where: { userId_feature_period: { userId, feature, period } },
      select: { used: true },
    });
    used = row?.used ?? 0;
  } catch {
    /* table missing / db hiccup — report full quota, consumption still guards */
  }
  return { limit, used, remaining: Math.max(0, limit - used), period };
}

/**
 * Atomically consume one generation. Returns allowed=false (nothing consumed)
 * when the pool is exhausted. Guarded updateMany means two parallel requests
 * on the last slot can't both pass.
 */
export async function tryConsume(
  userId: string,
  feature: AiFeature,
): Promise<{ allowed: boolean } & QuotaState> {
  const period = currentPeriod();
  const limit = await getMonthlyLimit(feature);
  if (limit <= 0) return { allowed: false, limit, used: 0, remaining: 0, period };

  await prisma.aiUsage.upsert({
    where: { userId_feature_period: { userId, feature, period } },
    update: {},
    create: { userId, feature, period, used: 0 },
  });

  const res = await prisma.aiUsage.updateMany({
    where: { userId, feature, period, used: { lt: limit } },
    data: { used: { increment: 1 } },
  });

  const row = await prisma.aiUsage.findUnique({
    where: { userId_feature_period: { userId, feature, period } },
    select: { used: true },
  });
  const used = row?.used ?? limit;

  if (res.count === 0) {
    return { allowed: false, limit, used, remaining: 0, period };
  }
  return { allowed: true, limit, used, remaining: Math.max(0, limit - used), period };
}

/**
 * Best-effort refund — used when we consumed a slot but the model call
 * failed, so the entrepreneur isn't charged for our error.
 */
export async function refund(userId: string, feature: AiFeature): Promise<void> {
  const period = currentPeriod();
  try {
    await prisma.aiUsage.updateMany({
      where: { userId, feature, period, used: { gt: 0 } },
      data: { used: { decrement: 1 } },
    });
  } catch {
    /* best effort */
  }
}
