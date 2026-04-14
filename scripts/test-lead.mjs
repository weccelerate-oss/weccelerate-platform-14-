// Smoke test: write 4 synthetic leads (one per site) via Prisma, then
// simulate the admin dashboard query to verify source mapping works.

import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.join(__dirname, '..', '.env.local') });
dotenvConfig({ path: path.join(__dirname, '..', '.env') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set — cannot run smoke test');
  process.exit(1);
}

const { PrismaClient } = await import('@prisma/client');
const { PrismaPg } = await import('@prisma/adapter-pg');
const { default: pg } = await import('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SITE_SOURCE_LABELS = {
  main: 'אתר ראשי',
  leumit: 'דף נחיתה · Leumit MedTech',
  biz: 'דף נחיתה · Business',
  landing: 'דף נחיתה · קמפיין',
};

const SAMPLES = [
  { site: 'leumit', name: 'Leumit Tester', email: 'leumit.test@example.local', formType: 'leumit_landing' },
  { site: 'biz', name: 'Biz Tester', email: 'biz.test@example.local', formType: 'biz_landing' },
  { site: 'landing', name: 'Landing Tester', email: 'landing.test@example.local', formType: 'landing_multiselect' },
  { site: 'main', name: 'Main Tester', email: 'main.test@example.local', formType: 'contact' },
];

const before = await prisma.activityLog.count({ where: { action: 'form.contact_submit' } });
console.log(`BEFORE: ${before} form.contact_submit logs`);

for (const s of SAMPLES) {
  const sourceLabel = SITE_SOURCE_LABELS[s.site];
  await prisma.activityLog.create({
    data: {
      action: 'form.contact_submit',
      description: `${sourceLabel} · ${s.name} · ${s.email}`,
      metadata: {
        name: s.name,
        email: s.email,
        phone: '0501234567',
        company: `${s.site} Test Co.`,
        message: `smoke test for ${s.site}`,
        site: s.site,
        sourceLabel,
        formType: s.formType,
        sourceUrl: `https://${s.site === 'main' ? '' : s.site + '.'}weccelerate.co.il/`,
        timestamp: new Date().toISOString(),
      },
    },
  });
}

const after = await prisma.activityLog.count({ where: { action: 'form.contact_submit' } });
console.log(`AFTER:  ${after} logs (delta: +${after - before})`);

const recentLeadLogs = await prisma.activityLog.findMany({
  where: { action: { in: ['form.contact_submit', 'lead.contact_fallback', 'form.contact'] } },
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: { id: true, createdAt: true, metadata: true },
});

const SITE_LABELS = {
  main: 'אתר ראשי',
  leumit: 'Leumit MedTech',
  biz: 'Business',
  landing: 'קמפיין',
};

console.log('\n=== Admin dashboard would display: ===');
for (const log of recentLeadLogs.slice(0, 6)) {
  const meta = log.metadata || {};
  const site = meta.site || 'main';
  const shortLabel = SITE_LABELS[site] || site;
  const fullLabel = meta.sourceLabel || shortLabel;
  console.log(`  ${shortLabel.padEnd(15)} | ${(meta.name || '').padEnd(16)} | ${meta.email || ''}`);
  console.log(`  ${' '.repeat(15)}   (source badge title: "${fullLabel}")`);
}

await prisma.$disconnect();
await pool.end();
console.log('\n✓ Smoke test complete.');
