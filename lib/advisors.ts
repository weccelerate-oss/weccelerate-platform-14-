/**
 * The advisor roster — the real humans who mentor INVESTOR_PREP entrepreneurs.
 *
 * Pure constants and formatting only, so client components can import it.
 * The DB-backed lookups live in lib/advisors.server.ts.
 *
 * Before this existed, `User.advisorEmail` was filled by the intake webhook
 * from the Google Form's "שם משתמש" field, i.e. whoever *submitted the form*
 * (nir@, coheni@, lioz@, ...). Those are sales/intake people, not advisors —
 * an entrepreneur asking for feedback was mailing the wrong person entirely.
 *
 * Now:
 *   - the roster below is the only set of people who can advise,
 *   - they exist as MENTOR-role User rows (seeded by scripts/seed-advisors.ts,
 *     then managed by the admin at /admin/advisors),
 *   - an admin assigns one per entrepreneur (User.advisorId),
 *   - the form's submitter is kept as attribution only (User.openedByEmail).
 *
 * The entrepreneur never sees an advisor's email address — advisors appear by
 * name with the WeCcelerate mark as their avatar (ADVISOR_AVATAR).
 */

/**
 * The advisor's (and the team's) profile picture: the W roundel on its own,
 * cropped from the master logo. The full wordmark was unreadable once squeezed
 * into a 28px circle.
 */
export const ADVISOR_AVATAR = '/images/weccelerate-mark.png';

/** What the entrepreneur reads next to an advisor's name. */
export const ADVISOR_TITLE = 'המלווה שלך · WeCcelerate';

/**
 * A thread message can come from three places. `authorType` is a plain string
 * column, so ADMIN needed no migration — but every renderer must handle it, or
 * an admin's message shows up labelled "אתה" in the entrepreneur's thread.
 */
export type CommentAuthorType = 'ENTREPRENEUR' | 'ADVISOR' | 'ADMIN';

/** What an admin's message is signed as. Admins speak for the house, not for themselves. */
export const ADMIN_TITLE = 'צוות WeCcelerate';

/**
 * How long a request may sit unanswered before the admin screen calls it late.
 * Matches the response window promised in the advisor onboarding email
 * (lib/advisor-invite-email.ts) — two business days, approximated as 48h.
 */
export const OVERDUE_AFTER_MS = 48 * 60 * 60 * 1000;

export interface RosterEntry {
  name: string;
  email: string;
}

/**
 * The four advisors the owner named, used to seed the roster once.
 *
 * This list is a starting point, NOT the live roster — the live one is every
 * active MENTOR user, which the admin grows and edits at /admin/advisors.
 * Nothing reads this at runtime except scripts/seed-advisors.ts.
 */
export const ADVISOR_ROSTER: readonly RosterEntry[] = [
  { name: 'קטרין ורשבסקי', email: 'katrin@weccelerate.co.il' },
  { name: 'נועם אוחיון', email: 'noam@weccelerate.co.il' },
  { name: 'אסף כהן', email: 'asaf@weccelerate.co.il' },
  { name: "שנה ג'ורנו", email: 'shana@weccelerate.co.il' },
] as const;

/**
 * How an advisor is presented to an entrepreneur. Name only — never the email,
 * which is why this is the single place that builds the label.
 */
export function advisorDisplayName(advisor: { name?: string | null } | null | undefined): string {
  const n = (advisor?.name ?? '').trim();
  return n || 'המלווה שלך';
}
