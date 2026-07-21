/**
 * Signed advisor links for the human-mentor thread.
 *
 * The advisor (who opened the entrepreneur via the form) gets an email with a
 * link to review an answer and reply — WITHOUT needing a portal account.
 * The link carries an HMAC-signed token (AUTH_SECRET) binding the answer id
 * and the advisor's email, with a 30-day expiry. Stateless, same trust model
 * as the existing magic-link login.
 */

import crypto from 'node:crypto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AdvisorTokenPayload {
  answerId: string;
  advisorEmail: string;
  exp: number; // epoch ms
}

function secret(): string {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET not configured');
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signAdvisorToken(answerId: string, advisorEmail: string): string {
  const payload: AdvisorTokenPayload = {
    answerId,
    advisorEmail: advisorEmail.toLowerCase().trim(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const mac = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
  return `${body}.${mac}`;
}

export function verifyAdvisorToken(token: string): AdvisorTokenPayload | null {
  try {
    const [body, mac] = token.split('.');
    if (!body || !mac) return null;
    const expected = b64url(crypto.createHmac('sha256', secret()).update(body).digest());
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as AdvisorTokenPayload;
    if (!payload.answerId || !payload.advisorEmail || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
