/**
 * Sends the advisor onboarding email — credentials plus what the role asks —
 * to every active MENTOR account.
 *
 *   npx tsx --env-file=.env.local scripts/send-advisor-onboarding.ts            # dry run
 *   npx tsx --env-file=.env.local scripts/send-advisor-onboarding.ts --apply    # send
 *   ... --apply --only asaf@weccelerate.co.il,shana@weccelerate.co.il           # subset
 *
 * Every send reissues the password: we cannot read the existing one, and an
 * advisor promoted from an old account may never have known theirs. The new
 * temp password goes out in the email and must be changed on first login.
 *
 * Same effect as the "שלח מייל הצטרפות" button on /admin/advisors — this is
 * the bulk version for the initial rollout.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';
import { generateTempPassword } from '../lib/security/generate-password';
import { sendAdvisorInviteEmail } from '../lib/advisor-invite-email';

const APPLY = process.argv.includes('--apply');
const onlyArg = process.argv.indexOf('--only');
const ONLY =
  onlyArg > -1 && process.argv[onlyArg + 1]
    ? process.argv[onlyArg + 1].split(',').map((e) => e.trim().toLowerCase())
    : null;

async function main() {
  console.log(APPLY ? '=== SENDING ADVISOR ONBOARDING ===' : '=== DRY RUN — pass --apply to send ===');

  const advisors: Array<{ id: string; name: string; email: string; lastLoginAt: Date | null }> =
    await prisma.user.findMany({
      where: {
        role: 'MENTOR',
        isActive: true,
        ...(ONLY ? { email: { in: ONLY } } : {}),
      },
      select: { id: true, name: true, email: true, lastLoginAt: true },
      orderBy: { name: 'asc' },
    });

  if (advisors.length === 0) {
    console.log('No active MENTOR accounts matched.');
    return;
  }

  const results: Array<{ name: string; email: string; status: string }> = [];

  for (const advisor of advisors) {
    if (!APPLY) {
      console.log(`→ would send to ${advisor.name} <${advisor.email}> (password would be reissued)`);
      results.push({ name: advisor.name, email: advisor.email, status: 'dry run' });
      continue;
    }

    const tempPassword = generateTempPassword();
    await prisma.user.update({
      where: { id: advisor.id },
      data: { password: await bcrypt.hash(tempPassword, 12), mustChangePassword: true },
    });

    const res = await sendAdvisorInviteEmail({
      to: advisor.email,
      name: advisor.name,
      tempPassword,
    });

    // The password is only recoverable here. If the mail bounced, print it so
    // the admin can hand it over rather than resetting again.
    const status = res.ok ? 'sent ✓' : `FAILED: ${res.error} — password: ${tempPassword}`;
    console.log(`${res.ok ? '✓' : '✗'} ${advisor.name} <${advisor.email}> — ${status}`);
    results.push({ name: advisor.name, email: advisor.email, status });

    await prisma.activityLog
      .create({
        data: {
          action: res.ok ? 'admin.advisor.onboarding_sent' : 'admin.advisor.onboarding_failed',
          description: `Advisor onboarding ${res.ok ? 'sent' : 'FAILED'} to ${advisor.name} <${advisor.email}> (script)`,
          userId: advisor.id,
          metadata: { source: 'script', error: res.ok ? null : res.error },
        },
      })
      .catch(() => {});
  }

  console.log('');
  console.table(results);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
