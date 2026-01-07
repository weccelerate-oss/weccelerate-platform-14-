/**
 * NextAuth.js v5 Configuration
 * 
 * Authentication configuration for WeCcelerate platform.
 * 
 * Security Features:
 * - Credentials provider with bcrypt password hashing
 * - JWT session strategy with encrypted tokens
 * - Role-based access control (ADMIN, ENTREPRENEUR, etc.)
 * - Session includes user ID and role for authorization
 * - Protection against common attack vectors
 * 
 * @see https://authjs.dev/getting-started/installation
 */

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Define UserRole type locally to avoid importing from @prisma/client in edge
type UserRole = 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR' | 'PARTNER';

// =============================================================================
// TYPE EXTENSIONS
// =============================================================================

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string | null;
      company?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string | null;
    company?: string | null;
    isActive?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    company?: string | null;
  }
}

// =============================================================================
// AUTH CONFIGURATION
// =============================================================================

const authConfig: NextAuthConfig = {
  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - update session every 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Pages configuration
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login', // Error page
    verifyRequest: '/verify-email',
    newUser: '/onboarding',
  },

  // Providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your@email.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          console.error('[Auth] Missing credentials');
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Basic validation
        if (!email.includes('@') || password.length < 6) {
          console.error('[Auth] Invalid email or password format');
          return null;
        }

        try {
          // Dynamic import Prisma only in Node.js runtime (not edge)
          // This authorize function runs in Node.js, not edge
          const { prisma } = await import('@/lib/db');

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              image: true,
              avatar: true,
              company: true,
              isActive: true,
            },
          });

          // User not found
          if (!user) {
            console.error('[Auth] User not found:', email);
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            console.error('[Auth] User is deactivated:', email);
            return null;
          }

          // Check if user has password (might be OAuth-only user)
          if (!user.password) {
            console.error('[Auth] User has no password (OAuth only):', email);
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            console.error('[Auth] Invalid password for:', email);
            return null;
          }

          // Update last login time (non-blocking)
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }).catch((err: Error) => console.error('[Auth] Failed to update last login:', err));

          // Log successful login (non-blocking)
          prisma.activityLog.create({
            data: {
              action: 'user.login',
              description: 'User logged in successfully',
              userId: user.id,
              metadata: {
                provider: 'credentials',
                timestamp: new Date().toISOString(),
              },
            },
          }).catch((err: Error) => console.error('[Auth] Failed to log activity:', err));

          console.log('[Auth] Login successful:', email);

          // Return user object (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            image: user.image || user.avatar,
            company: user.company,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error('[Auth] Error during authentication:', error);
          return null;
        }
      },
    }),
  ],

  // Callbacks
  callbacks: {
    /**
     * JWT Callback
     * Called whenever a JWT is created or updated
     * This is where we add custom claims to the token
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
      }

      // Handle session update (e.g., user updates their profile)
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.company) token.company = session.company;
      }

      return token;
    },

    /**
     * Session Callback
     * Called whenever a session is checked
     * This is where we expose token data to the client
     */
    async session({ session, token }) {
      // Add custom fields to session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.company = token.company;
      }

      return session;
    },

    /**
     * Authorized Callback
     * Called to check if user is authorized to access a route
     * Used by middleware for route protection
     * 
     * NOTE: This runs in edge runtime - no Prisma access here!
     */
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Define protected routes
      const protectedRoutes = ['/portal', '/dashboard', '/admin'];
      const adminRoutes = ['/admin'];

      // Check if current path is protected
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );
      const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Redirect unauthenticated users from protected routes
      if (isProtectedRoute && !isLoggedIn) {
        return false; // Will redirect to signIn page
      }

      // Check admin access
      if (isAdminRoute && auth?.user?.role !== 'ADMIN') {
        return false;
      }

      // Redirect authenticated users away from auth pages
      const authRoutes = ['/login', '/register', '/forgot-password'];
      const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

      if (isAuthRoute && isLoggedIn) {
        // Redirect based on role
        const redirectUrl = auth?.user?.role === 'ADMIN' ? '/admin' : '/portal/dashboard';
        return Response.redirect(new URL(redirectUrl, request.nextUrl));
      }

      return true;
    },

    /**
     * SignIn Callback
     * Called after a successful sign in
     * Can be used to add additional checks
     */
    async signIn({ user }) {
      // Check if user is active
      if (user && 'isActive' in user && !user.isActive) {
        return false;
      }

      return true;
    },
  },

  // Events
  events: {
    async signIn({ user, account }) {
      console.log(`[Auth Event] User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ token }) {
      console.log(`[Auth Event] User signed out: ${token?.email}`);
    },
  },

  // Security options
  trustHost: true, // Required for production behind proxy
  debug: process.env.NODE_ENV === 'development',
};

// =============================================================================
// EXPORTS
// =============================================================================

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { authConfig };

// Export authOptions for getServerSession compatibility
export const authOptions = authConfig;