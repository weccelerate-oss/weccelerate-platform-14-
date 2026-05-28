/**
 * Authentication Utilities
 * 
 * Helper functions for authentication and authorization.
 */
import { auth } from './auth.config';
import bcrypt from 'bcryptjs';


// Define UserRole type locally to avoid Prisma import issues
export type UserRole = 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR' | 'PARTNER';

// =============================================================================
// PASSWORD UTILITIES
// =============================================================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  // Hyphen (-) is placed last in the class so it's a literal, not a range.
  // This is the ASCII hyphen U+002D, not the em-dash —.
  if (!/[!@#$%^&*(),.?":{}|<>-]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// SESSION UTILITIES
// =============================================================================

/**
 * Get the current session (server-side)
 */
export async function getSession() {
  return auth();
}

/**
 * Get the current user (server-side)
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if user has a specific role (server-side)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === role;
}

/**
 * Check if user has any of the specified roles (server-side)
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.role && roles.includes(session.user.role as UserRole);
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return session.user;
}

/**
 * Require specific role - throws if not authorized
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  
  if (user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }
  
  return user;
}

/**
 * Require any of the specified roles
 */
export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireAuth();
  
  if (!roles.includes(user.role as UserRole)) {
    throw new Error(`Forbidden: One of [${roles.join(', ')}] roles required`);
  }
  
  return user;
}