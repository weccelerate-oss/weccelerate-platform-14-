/**
 * Authentication Module - NextAuth v4
 */

import { getServerSession } from 'next-auth';
import { authOptions, authConfig } from './auth.config';

// Export auth as a wrapper around getServerSession
export async function auth() {
  return await getServerSession(authOptions);
}

// Re-export config
export { authOptions, authConfig };

// Re-export utilities
export {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  getSession,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  requireAuth,
  requireRole,
  requireAnyRole,
} from './auth.utils';

export type { UserRole } from './auth.utils';