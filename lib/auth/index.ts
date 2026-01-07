import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";

/**
 * הגדרת אפשרויות האימות
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // כאן תוכל להוסיף CredentialsProvider אם יש לך
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
};

/**
 * פונקציית ה-auth שחסרה לך!
 * זו הפונקציה שנקראת ב-Server Components וב-Actions
 */
export const auth = () => getServerSession(authOptions);

// ייצוא פונקציות עזר מהקבצים האחרים בתיקייה
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