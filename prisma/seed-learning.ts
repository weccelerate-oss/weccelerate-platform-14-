/**
 * Standalone seed for the Learning Center catalog.
 *
 *   npx tsx prisma/seed-learning.ts
 *
 * Migrates the static COURSES_DATA into the DB course tables (idempotent).
 * Run once after `prisma db push` applies the new columns/tables. The same
 * logic is also exposed in the admin UI ("ייבא שיעורים מהקטלוג").
 */

import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const { seedLearningCatalog } = await import('../lib/learning/seed');
  const result = await seedLearningCatalog();
  console.log('✅ Learning catalog seeded:', result);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
