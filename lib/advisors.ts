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

/** The minimum a thread-state calculation needs to know about a message. */
export interface ThreadMessage {
  authorType: string;
  createdAt: Date | string;
}

export interface ThreadState {
  /** The entrepreneur's side moved last — somebody owes them an answer. */
  awaitingReply: boolean;
  /** How long they have been waiting, 0 when nothing is owed. */
  waitingMs: number;
  /** Past the promised response window. */
  overdue: boolean;
  /** Time to the mentor's *first* reply, or null if they never answered. */
  firstAdvisorReplyMs: number | null;
  entrepreneurMessages: number;
  advisorMessages: number;
}

/**
 * Whether a mentor thread is waiting on a reply, and for how long.
 *
 * THE ONE definition. This existed as four hand-rolled copies — the roster
 * screen, the threads screen, the admin badge and the mentor's desk — and two
 * of them classified an ADMIN message as the *entrepreneur's* side. The result
 * was one screen reporting "2 ממתינות למענה" while another said 0, for the
 * same two threads, because the house had replied last in both.
 *
 * The rule: anyone from the house (ADVISOR or ADMIN) answering clears the wait.
 * Mentor responsiveness is a separate number — firstAdvisorReplyMs counts only
 * the mentor's own first reply, so an admin covering for them flatters nobody.
 */
export function threadState(
  requestedAt: Date | string,
  messages: readonly ThreadMessage[],
  now: number = Date.now(),
): ThreadState {
  const requestedMs = toMs(requestedAt);
  let lastFromHouse: number | null = null;
  let lastFromEntrepreneur = requestedMs;
  let firstAdvisorAt: number | null = null;
  let entrepreneurMessages = 0;
  let advisorMessages = 0;

  for (const m of messages) {
    const at = toMs(m.createdAt);
    if (m.authorType === 'ENTREPRENEUR') {
      entrepreneurMessages += 1;
      if (at > lastFromEntrepreneur) lastFromEntrepreneur = at;
      continue;
    }
    if (m.authorType === 'ADVISOR') {
      advisorMessages += 1;
      if (firstAdvisorAt === null || at < firstAdvisorAt) firstAdvisorAt = at;
    }
    if (lastFromHouse === null || at > lastFromHouse) lastFromHouse = at;
  }

  const awaitingReply = lastFromHouse === null || lastFromEntrepreneur > lastFromHouse;
  const waitingMs = awaitingReply ? Math.max(0, now - lastFromEntrepreneur) : 0;

  return {
    awaitingReply,
    waitingMs,
    overdue: awaitingReply && waitingMs > OVERDUE_AFTER_MS,
    firstAdvisorReplyMs: firstAdvisorAt === null ? null : firstAdvisorAt - requestedMs,
    entrepreneurMessages,
    advisorMessages,
  };
}

function toMs(v: Date | string): number {
  return v instanceof Date ? v.getTime() : Date.parse(v);
}
