/**
 * NextAuth.js v4 Configuration
 * 
 * Authentication configuration for WeCcelerate platform.
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type UserRole = 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR' | 'PARTNER';

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

export const authOptions: NextAuthOptions = {
  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Pages configuration
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },

  // Providers
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email;
        const password = credentials.password;

        if (!email.includes('@') || password.length < 6) {
          return null;
        }

        try {
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();

          try {
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

            if (!user || !user.isActive || !user.password) {
              return null;
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
              return null;
            }

            // Update last login (non-blocking)
            prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            }).catch(() => {});

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as UserRole,
              image: user.image || user.avatar,
              company: user.company,
              isActive: user.isActive,
            };
          } finally {
            await prisma.$disconnect();
          }
        } catch (error) {
          console.error('[Auth] Error:', error);
          return null;
        }
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.company = token.company;
      }
      return session;
    },

    async signIn({ user }) {
      if (user && 'isActive' in user && !user.isActive) {
        return false;
      }
      return true;
    },
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Alias for compatibility
export const authConfig = authOptions;