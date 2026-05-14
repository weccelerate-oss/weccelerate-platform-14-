/**
 * Lead rate limiting + blocklist enforcement (Phase 2).
 *
 * Runs BEFORE the spam scorer so we can short-circuit obvious abuse
 * without paying for the full heuristic pass.
 *
 * Two layers:
 *   1. Blocklist — emails/IPs the admin manually marked as spam from
 *      /admin/leads/spam-review. Permanent unless `expiresAt` is set.
 *   2. Rate limit — max 3 submissions from the same IP in 1 hour, max
 *      1 from the same email in 24 hours. Tunable below.
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db';

const IP_HOURLY_LIMIT = 3;
const EMAIL_DAILY_LIMIT = 1;

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; reason: 'blocklist_email'; detail: string }
  | { allowed: false; reason: 'blocklist_ip'; detail: string }
  | { allowed: false; reason: 'rate_limit_ip'; detail: string }
  | { allowed: false; reason: 'rate_limit_email'; detail: string };

export function hashIp(ip: string): string {
  // Salt with a deployment-time secret if available, else fall back to a
  // build-time constant. Hashing protects privacy and keeps row size predictable.
  const salt = process.env.SPAM_IP_HASH_SALT ?? 'weccelerate-static-salt-v1';
  return crypto.createHash('sha256').update(salt + ip).digest('hex');
}

export async function checkRateLimit(opts: {
  email: string;
  ip: string | null;
}): Promise<RateLimitDecision> {
  const email = opts.email.trim().toLowerCase();
  const ipHash = opts.ip ? hashIp(opts.ip) : null;
  const now = Date.now();

  // ---------- Blocklist ----------
  const blockClauses: Array<{ email?: string; ipHash?: string }> = [{ email }];
  if (ipHash) blockClauses.push({ ipHash });
  try {
    const blocked = await prisma.spamBlocklist.findFirst({
      where: { OR: blockClauses },
    });
    if (blocked) {
      // Honor expiresAt for soft auto-blocks.
      if (!blocked.expiresAt || blocked.expiresAt.getTime() > now) {
        if (blocked.email && blocked.email === email) {
          return {
            allowed: false,
            reason: 'blocklist_email',
            detail: blocked.reason ?? 'email בblocklist',
          };
        }
        if (blocked.ipHash && blocked.ipHash === ipHash) {
          return {
            allowed: false,
            reason: 'blocklist_ip',
            detail: blocked.reason ?? 'IP בblocklist',
          };
        }
      }
    }
  } catch {
    // Schema not migrated yet — fall through to rate limit only.
  }

  // ---------- Rate limit by IP (3 in last hour) ----------
  if (ipHash) {
    try {
      const oneHourAgo = new Date(now - 3600_000);
      const ipRecent = await prisma.activityLog.count({
        where: {
          action: {
            in: ['form.contact_submit', 'form.application', 'form.newsletter', 'form.event', 'form.api', 'lead.spam_review', 'lead.spam_blocked'],
          },
          createdAt: { gte: oneHourAgo },
          metadata: { path: ['ipHash'], equals: ipHash },
        },
      });
      if (ipRecent >= IP_HOURLY_LIMIT) {
        return {
          allowed: false,
          reason: 'rate_limit_ip',
          detail: `${ipRecent} פניות מאותו IP בשעה האחרונה (מקסימום ${IP_HOURLY_LIMIT})`,
        };
      }
    } catch {
      /* swallow */
    }
  }

  // ---------- Rate limit by email (1 in last 24h) ----------
  try {
    const oneDayAgo = new Date(now - 86_400_000);
    const emailRecent = await prisma.activityLog.count({
      where: {
        action: {
          in: ['form.contact_submit', 'form.application', 'form.newsletter', 'form.event', 'form.api'],
        },
        createdAt: { gte: oneDayAgo },
        metadata: { path: ['email'], equals: email },
      },
    });
    if (emailRecent >= EMAIL_DAILY_LIMIT) {
      return {
        allowed: false,
        reason: 'rate_limit_email',
        detail: `${emailRecent} פניות מאותו email ב-24 השעות האחרונות`,
      };
    }
  } catch {
    /* swallow */
  }

  return { allowed: true };
}
