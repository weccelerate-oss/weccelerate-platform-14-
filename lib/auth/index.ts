/**
 * Authentication Module
 * 
 * Exports all authentication-related functionality.
 */

// Main auth exports
export { auth, signIn, signOut, GET, POST, authConfig, authOptions } from './auth.config';

// Utility functions
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

// Types
export type { UserRole } from './auth.utils';
