/**
 * Prisma Configuration for Prisma 7
 * 
 * This file configures the database connection for Prisma CLI operations
 * (migrate, db push, studio, etc.)
 * 
 * Usage:
 *   npx prisma db push --config prisma/prisma.config.ts
 *   npx prisma migrate dev --config prisma/prisma.config.ts
 *   npx prisma studio --config prisma/prisma.config.ts
 * 
 * @see https://pris.ly/d/config-datasource
 */

import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load environment variables from .env files
config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

// Pick the right URL for CLI operations (db push, migrate, studio).
//
// Supabase's new architecture exposes two ports on the same pooler host:
//   - 6543 (transaction mode): app runtime — fast but no DDL/session state
//   - 5432 (session mode):     full Postgres — required for `prisma db push`
//
// DATABASE_URL in .env points at 6543 because that's what the app needs.
// For CLI operations we derive the session-mode URL by swapping the port
// (and dropping the pgbouncer flag — irrelevant in session mode).
//
// Old `db.<ref>.supabase.co:5432` direct host is deprecated and no longer
// resolves, so we don't try DIRECT_URL anymore.
function toSessionPoolerUrl(url: string): string {
  return url
    .replace(/:6543\b/, ':5432')
    .replace(/[?&]pgbouncer=true/g, '')
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

const baseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
const databaseUrl = baseUrl ? toSessionPoolerUrl(baseUrl) : undefined;

// Validate DATABASE_URL exists
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('');
  console.error('Please create a .env file with:');
  console.error('DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"');
  console.error('');
  throw new Error('DATABASE_URL is required');
}

// Log connection info (hide password)
console.log('✅ Database URL loaded:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

export default defineConfig({
  // Schema file location
  schema: path.join(__dirname, 'schema.prisma'),
  
  // Database connection for CLI operations
  datasource: {
    url: databaseUrl,
  },
  
  // Migration settings
  migrations: {
    // Seed command
    seed: 'npx tsx prisma/seed.ts',
  },
});