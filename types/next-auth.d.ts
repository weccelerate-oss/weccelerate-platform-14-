import type { DefaultSession, DefaultUser } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

type UserRole = 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR' | 'PARTNER';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    role?: UserRole | string | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: UserRole | string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole | string | null;
  }
}
