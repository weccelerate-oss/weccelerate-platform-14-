/**
 * NextAuth.js API Route Handler
 * 
 * Handles all authentication requests:
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - GET  /api/auth/session
 * - GET  /api/auth/csrf
 * - GET  /api/auth/providers
 * - GET  /api/auth/callback/:provider
 * 
 * @module app/api/auth/[...nextauth]/route
 */

import { GET, POST } from '@/lib/auth';

export { GET, POST };
