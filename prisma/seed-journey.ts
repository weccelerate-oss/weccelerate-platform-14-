/**
 * Standalone seed for the Founder Journey ("מסע מרעיון למיזם").
 *
 *   npx tsx prisma/seed-journey.ts
 *
 * Imports the cleaned workbook content (7 chapters, 100 questions) into the
 * journey tables. Idempotent — chapters upsert by slug, questions match by
 * prompt, existing user answers are never touched. The same logic is exposed
 * in the admin UI ("טען את תוכן הקובץ").
 */

import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.join(process.cwd(), '.env') });
config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const { seedJourney } = await import('../lib/journey/seed');
  const result = await seedJourney();
  console.log('✅ Founder Journey seeded:', result);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
