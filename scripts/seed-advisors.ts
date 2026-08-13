/**
 * Creates (or repairs) the advisor accounts listed in lib/advisors.ts.
 *
 *   npx tsx --env-file=.env.local scripts/seed-advisors.ts            # dry run
 *   npx tsx --env-file=.env.local scripts/seed-advisors.ts --apply    # write
 *
 * Idempotent. For each roster entry:
 *   - no account       → creates one, role MENTOR, temp password, must change it
 *   - account exists   → promotes to MENTOR / reactivates / fixes the name,
 *                        and NEVER touches an existing password
 *
 * It does not email anybody. Temp passwords are printed once, here — copy them
 * before closing the terminal, or reset from /admin/users later.
 *
 * This is the one-time bootstrap. Day-to-day the admin adds and edits advisors
 * at /admin/advisors, which does email them their credentials.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';
import { ADVISOR_ROSTER } from '../lib/advisors';
import { generateTempPassword } from '../lib/security/generate-password';

const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(APPLY ? '=== SEEDING ADVISORS (writing) ===' : '=== DRY RUN — pass --apply to write ===');

  const created: Array<{ name: string; email: string; password: string }> = [];

  for (const entry of ADVISOR_ROSTER) {
    const email = entry.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, role: true, isActive: true },
    });

    if (!existing) {
      const tempPassword = generateTempPassword();
      console.log(`+ CREATE  ${entry.name} <${email}> — MENTOR, temp password`);
      if (APPLY) {
        await prisma.user.create({
          data: {
            email,
            name: entry.name,
            password: await bcrypt.hash(tempPassword, 12),
            role: 'MENTOR',
            isActive: true,
            mustChangePassword: true,
            provisionedAt: new Date(),
            provisionedSource: 'advisor_seed',
          },
        });
        created.push({ name: entry.name, email, password: tempPassword });
      } else {
        created.push({ name: entry.name, email, password: '(dry run)' });
      }
      continue;
    }

    const fixes: Record<string, unknown> = {};
    if (existing.role !== 'MENTOR') fixes.role = 'MENTOR';
    if (!existing.isActive) fixes.isActive = true;
    if (existing.name !== entry.name) fixes.name = entry.name;

    if (Object.keys(fixes).length === 0) {
      console.log(`= OK      ${entry.name} <${email}> — already a MENTOR`);
      continue;
    }
    console.log(`~ UPDATE  ${entry.name} <${email}> — ${JSON.stringify(fixes)} (password untouched)`);
    if (APPLY) {
      await prisma.user.update({ where: { id: existing.id }, data: fixes });
    }
  }

  if (created.length) {
    console.log('\n=== TEMP PASSWORDS — shown once, copy them now ===');
    console.table(created);
    console.log('Each advisor must change it on first login (mustChangePassword).');
  }

  const roster = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    select: { name: true, email: true, isActive: true, _count: { select: { advisees: true } } },
    orderBy: { name: 'asc' },
  });
  console.log('\n=== MENTOR accounts now in the DB ===');
  console.table(
    roster.map((r: { name: string; email: string; isActive: boolean; _count: { advisees: number } }) => ({
      name: r.name,
      email: r.email,
      active: r.isActive,
      advisees: r._count.advisees,
    })),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
