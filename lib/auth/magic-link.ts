/**
 * Magic-link tokens — passwordless portal entry for re-engagement emails.
 *
 * Token = base64url(userId).base64url(expiresAtMs).HMAC-SHA256 signature,
 * signed with AUTH_SECRET. Stateless (no token table): possession of the
 * link ≈ access to the recipient's inbox, the same trust level as the temp
 * password emails we already send. Tokens expire (default 14 days) and are
 * NOT single-use — acceptable for a content portal; anything sensitive
 * (admin) never uses this flow (authorize() rejects non-ENTREPRENEUR roles).
 */

import crypto from 'crypto';

const DEFAULT_TTL_DAYS = 14;

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET missing — cannot sign magic links');
  return s;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createMagicToken(userId: string, ttlDays = DEFAULT_TTL_DAYS): string {
  const exp = String(Date.now() + ttlDays * 24 * 3600 * 1000);
  const payload = `${b64url(userId)}.${b64url(exp)}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the userId when the token is valid and unexpired, else null. */
export function verifyMagicToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const given = parts[2];
  if (
    expected.length !== given.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given))
  ) {
    return null;
  }
  const exp = Number(Buffer.from(parts[1], 'base64url').toString());
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  return Buffer.from(parts[0], 'base64url').toString();
}

export function magicLinkUrl(userId: string, ttlDays = DEFAULT_TTL_DAYS): string {
  const base = process.env.AUTH_URL || 'https://weccelerate.co.il';
  return `${base}/enter?t=${encodeURIComponent(createMagicToken(userId, ttlDays))}`;
}
