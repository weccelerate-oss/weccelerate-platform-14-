/**
 * Portal entitlements — which features each plan unlocks.
 *
 * Single source of truth for feature gating. The admin can open/close
 * specific parts per entrepreneur via User.featureOverrides
 * (e.g. { "mentorAi": false }) — an override always beats the plan default.
 *
 * Plans:
 *   WECCELERATE   — everyone. Full journey + learning + AI mentor.
 *   INVESTOR_PREP — legacy tier, kept so old rows still resolve. No longer
 *                   assigned: it used to be what unlocked the human mentor.
 *   FREE          — future open self-signup. Learning + journey basics,
 *                   no AI mentor (costs money) until they upgrade.
 *
 * `humanMentor` deliberately ignores all of the above — see hasFeature. The
 * admin unlocked it by setting a plan AND assigning an advisor, and forgetting
 * either half left an entrepreneur with a mentor they could not reach. Now the
 * assignment alone is the entitlement.
 */

export type PortalFeature =
  | 'journey'      // the מסע מרעיון למיזם program
  | 'learning'     // the learning center
  | 'mentorAi'     // AI answer review ("חוות דעת")
  | 'kit'          // תיק המוכנות (readiness kit)
  | 'trackers'     // תיעוד שיחות + מעקב פניות (the two founder spreadsheets)
  | 'humanMentor'; // send answers to the human advisor + thread

export type PlanName = 'WECCELERATE' | 'INVESTOR_PREP' | 'FREE';

const PLAN_FEATURES: Record<PlanName, Record<PortalFeature, boolean>> = {
  WECCELERATE: {
    journey: true,
    learning: true,
    mentorAi: true,
    kit: true,
    trackers: true,
    humanMentor: false, // unused — resolved from the advisor assignment
  },
  INVESTOR_PREP: {
    journey: true,
    learning: true,
    mentorAi: true,
    kit: true,
    trackers: true,
    humanMentor: true,
  },
  FREE: {
    journey: true,
    learning: true,
    mentorAi: false,
    kit: true,
    trackers: true,
    humanMentor: false,
  },
};

export interface EntitledUser {
  plan?: string | null;
  featureOverrides?: unknown;
  /** The assigned advisor, if any — this is what unlocks `humanMentor`. */
  advisorId?: string | null;
}

export function hasFeature(user: EntitledUser | null | undefined, feature: PortalFeature): boolean {
  const plan = (user?.plan as PlanName) || 'WECCELERATE';
  const overrides = (user?.featureOverrides ?? null) as Record<string, unknown> | null;
  if (overrides && typeof overrides === 'object' && typeof overrides[feature] === 'boolean') {
    return overrides[feature] as boolean;
  }
  // The human-mentor thread is not a plan tier — it is simply whether somebody
  // was assigned to this entrepreneur. Assigning a mentor in /admin/users is
  // the whole act; there is no second switch to remember to flip.
  if (feature === 'humanMentor') {
    return Boolean(user?.advisorId);
  }
  return PLAN_FEATURES[plan]?.[feature] ?? PLAN_FEATURES.WECCELERATE[feature];
}

export function featuresFor(user: EntitledUser | null | undefined): Record<PortalFeature, boolean> {
  return {
    journey: hasFeature(user, 'journey'),
    learning: hasFeature(user, 'learning'),
    mentorAi: hasFeature(user, 'mentorAi'),
    kit: hasFeature(user, 'kit'),
    trackers: hasFeature(user, 'trackers'),
    humanMentor: hasFeature(user, 'humanMentor'),
  };
}

export const PLAN_LABELS: Record<PlanName, string> = {
  WECCELERATE: 'יזם וויסלרייט',
  INVESTOR_PREP: 'הכנה למשקיעים',
  FREE: 'הרשמה חופשית',
};
