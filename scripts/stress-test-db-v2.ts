import 'dotenv/config';
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function stressTest() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('\n=== DATABASE STRESS TESTS ===\n');

  // Check which tables exist
  const tables: any = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
  `;
  console.log('Tables in database:');
  tables.forEach((t: any) => console.log(`  - ${t.tablename}`));
  console.log('');

  // Warm up
  await prisma.user.findFirst();

  console.log('=== PERFORMANCE TESTS ===\n');

  // Test 1: Sequential user lookups
  console.log('Test 1: 50 sequential user lookups');
  const start1 = Date.now();
  for (let i = 0; i < 50; i++) {
    await prisma.user.findUnique({ where: { email: 'info@weccelerate.co.il' } });
  }
  const elapsed1 = Date.now() - start1;
  console.log(`  Total: ${elapsed1}ms | Avg: ${(elapsed1 / 50).toFixed(2)}ms per query\n`);

  // Test 2: Parallel user lookups
  console.log('Test 2: 50 parallel user lookups');
  const start2 = Date.now();
  const promises2 = Array(50).fill(0).map(() =>
    prisma.user.findUnique({ where: { email: 'info@weccelerate.co.il' } })
  );
  await Promise.all(promises2);
  const elapsed2 = Date.now() - start2;
  console.log(`  Total: ${elapsed2}ms | Throughput: ${(50000 / elapsed2).toFixed(1)} queries/sec\n`);

  // Test 3: Count records across core tables only
  console.log('Test 3: Parallel counts (core tables)');
  const start3 = Date.now();
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.newsUpdate.count().catch(() => -1),
    prisma.event.count().catch(() => -1),
    prisma.video.count().catch(() => -1),
    prisma.successStory.count().catch(() => -1),
    prisma.file.count().catch(() => -1),
    prisma.notification.count().catch(() => -1),
    prisma.activityLog.count().catch(() => -1),
  ]);
  const elapsed3 = Date.now() - start3;
  console.log(`  Users: ${counts[0]}, Projects: ${counts[1]}, News: ${counts[2]}`);
  console.log(`  Events: ${counts[3]}, Videos: ${counts[4]}, Stories: ${counts[5]}`);
  console.log(`  Files: ${counts[6]}, Notifications: ${counts[7]}, Logs: ${counts[8]}`);
  console.log(`  Total: ${elapsed3}ms\n`);

  // Test 4: Complex query with relations
  console.log('Test 4: 20 parallel complex queries');
  const start4 = Date.now();
  const promises4 = Array(20).fill(0).map(() =>
    prisma.project.findMany({
      take: 10,
      include: { user: true, files: true },
      orderBy: { createdAt: 'desc' },
    })
  );
  await Promise.all(promises4);
  const elapsed4 = Date.now() - start4;
  console.log(`  Total: ${elapsed4}ms | Avg: ${(elapsed4 / 20).toFixed(2)}ms per query\n`);

  // Test 5: Write performance
  console.log('Test 5: 20 parallel ActivityLog writes');
  const start5 = Date.now();
  const promises5 = Array(20).fill(0).map((_, i) =>
    prisma.activityLog.create({
      data: {
        action: 'stress.test',
        description: `Stress test entry ${i}`,
        metadata: { test: true, iteration: i },
      },
    })
  );
  await Promise.all(promises5);
  const elapsed5 = Date.now() - start5;
  console.log(`  Total: ${elapsed5}ms | Avg: ${(elapsed5 / 20).toFixed(2)}ms per insert\n`);
  await prisma.activityLog.deleteMany({ where: { action: 'stress.test' } });

  // Test 6: 100 parallel queries
  console.log('Test 6: 100 parallel queries');
  const start6 = Date.now();
  const promises6 = Array(100).fill(0).map(() =>
    prisma.newsUpdate.findMany({ take: 5, where: { isActive: true } }).catch(() => [])
  );
  await Promise.all(promises6);
  const elapsed6 = Date.now() - start6;
  console.log(`  Total: ${elapsed6}ms | Throughput: ${(100000 / elapsed6).toFixed(1)} queries/sec\n`);

  console.log('=== SUMMARY ===');
  console.log(`Sequential lookup: ${(elapsed1 / 50).toFixed(2)}ms avg`);
  console.log(`Parallel lookup (50): ${(elapsed2).toFixed(0)}ms total | ${(50000 / elapsed2).toFixed(0)} qps`);
  console.log(`Complex queries (20): ${(elapsed4 / 20).toFixed(2)}ms avg`);
  console.log(`Inserts (20): ${(elapsed5 / 20).toFixed(2)}ms avg`);
  console.log(`Heavy load (100): ${(100000 / elapsed6).toFixed(0)} qps\n`);

  await prisma.$disconnect();
  await pool.end();
}

stressTest().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
