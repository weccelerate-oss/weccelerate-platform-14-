import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { PrismaClient } = await import('@prisma/client');
        const { PrismaPg } = await import('@prisma/adapter-pg');
        const pg = await import('pg');
        
        const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user?.password || !user.isActive) return null;

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          };
        } finally {
          await prisma.$disconnect();
          await pool.end();
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
callbacks: {
  jwt({ token, user, trigger, session }) {
    if (user) {
      token.id = user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token.role = (user as any).role;
      // Carry the must-change-password flag from authorize() into the JWT
      // so the portal layout can read it without an extra DB hit.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token.mustChangePassword = (user as any).mustChangePassword ?? false;
    }
    // Allow a client-side `update({ mustChangePassword: false })` to clear
    // the flag mid-session after the user picks a new password.
    if (trigger === 'update' && session?.mustChangePassword === false) {
      token.mustChangePassword = false;
    }
    return token;
  },
  session({ session, token }) {
    if (session.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).id = token.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).role = token.role;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).mustChangePassword = token.mustChangePassword ?? false;
    }
    return session;
  },
  redirect({ url, baseUrl }) {
    // If a callbackUrl was provided (e.g. signOut({ callbackUrl: '/login' })), respect it
    if (url.startsWith(baseUrl)) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    // Default: redirect to portal
    return `${baseUrl}/portal`;
  },
},  trustHost: true,
});

export const authOptions = {};
export const authConfig = {};