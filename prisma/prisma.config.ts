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

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

// Validate DATABASE_URL exists
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('');
  console.error('Please create a .env file with:');
  console.error('DATABASE_URL="postgresql://postgres.lyjikgtnvndnzlslqoyt:Maorarg050%21@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"');
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
  migrate: {
    // Seed command
    seed: 'npx tsx prisma/seed.ts',
  },
});