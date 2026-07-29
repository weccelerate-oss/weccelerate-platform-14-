import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Passwordless entry from re-engagement emails. The token is HMAC-signed
    // (lib/auth/magic-link.ts) and maps to one user; ENTREPRENEUR only — an
    // admin account can never be entered through an emailed link. The user's
    // stored password is untouched and keeps working in the normal login.
    Credentials({
      id: 'magic-token',
      credentials: { token: {} },
      async authorize(credentials) {
        if (!credentials?.token) return null;
        const { verifyMagicToken } = await import('./magic-link');
        const userId = verifyMagicToken(credentials.token as string);
        if (!userId) return null;

        const { PrismaClient } = await import('@prisma/client');
        const { PrismaPg } = await import('@prisma/adapter-pg');
        const pg = await import('pg');
        const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (!user || !user.isActive || user.role !== 'ENTREPRENEUR') return null;
          // Track the login — this field powers the /admin/users funnel and
          // was previously never written anywhere (stats showed 0 forever).
          await prisma.user
            .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            .catch(() => {});
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            // Never force a password change on link entry — the whole point
            // is zero friction; their existing credentials stay valid.
            mustChangePassword: false,
          };
        } finally {
          await prisma.$disconnect();
          await pool.end();
        }
      },
    }),
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

          // Track the login — powers the /admin/users engagement funnel.
          // Never written before this fix, so the funnel showed 0 logins
          // even for users who were actively learning in the portal.
          await prisma.user
            .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
            .catch(() => {});

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
  // Stay-signed-in. Without an explicit maxAge the session silently rode on
  // library defaults, so entrepreneurs were being dropped back to /login after
  // closing the tab or coming back a while later. Now:
  //   maxAge    — the JWT *and* the cookie live 90 days, so the cookie is
  //               persistent (survives browser restarts) rather than a
  //               session cookie that dies with the window.
  //   updateAge — every 24h of actual use the expiry rolls forward, so an
  //               entrepreneur who keeps working is never signed out at all.
  // The only way out is the explicit "התנתק" button (signOut).
  session: {
    strategy: 'jwt',
    maxAge: 90 * 24 * 60 * 60, // 90 days
    updateAge: 24 * 60 * 60, // refresh the window once a day of activity
  },
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