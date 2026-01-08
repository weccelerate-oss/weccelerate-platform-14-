export { auth, signIn, signOut, handlers } from './auth.config';
export { authOptions, authConfig } from './auth.config';

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