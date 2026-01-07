/**
 * Session Provider
 * 
 * Client-side wrapper for NextAuth session context.
 * Provides session data to all child components.
 * 
 * @module components/providers/session-provider
 */

'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
