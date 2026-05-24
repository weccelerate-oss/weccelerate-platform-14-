/**
 * Crypto-secure temporary password generator.
 *
 * Used by:
 *   - app/(admin)/admin/actions.ts (createUserAction, resetUserPasswordAction)
 *   - lib/onboarding/provision.ts  (auto-provisioned entrepreneurs)
 *
 * SECURITY: uses `crypto.randomInt` (CSPRNG) rather than `Math.random`,
 * because the output is a real authentication credential that gets emailed
 * to the user. `Math.random` is predictable enough to be brute-forceable
 * if an attacker can observe even one generated password from the same
 * Node.js process.
 *
 * Format: 8 alphanumeric chars (ambiguous chars removed: I, O, 0, 1, l)
 * + 1 symbol from `!@#$%`. Easy to type, hard to confuse on a screen.
 */

import crypto from 'crypto';

const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
const SPECIAL = '!@#$%';

export function generateTempPassword(): string {
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += ALPHANUMERIC.charAt(crypto.randomInt(0, ALPHANUMERIC.length));
  }
  password += SPECIAL.charAt(crypto.randomInt(0, SPECIAL.length));
  return password;
}
