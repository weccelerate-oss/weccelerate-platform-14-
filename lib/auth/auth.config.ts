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

          return { id: user.id, email: user.email, name: user.name, role: user.role };
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
  jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = (user as any).role;
    }
    return token;
  },
  session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
    }
    return session;
  },
  redirect({ url, baseUrl }) {
    // Always redirect to portal/admin after login
    if (url.includes('/api/auth')) {
      return `${baseUrl}/admin`;
    }
    if (url.startsWith(baseUrl)) {
      return url;
    }
    return `${baseUrl}/admin`;
  },
},  trustHost: true,
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
    },
  },
},

});

export const authOptions = {};
export const authConfig = {};