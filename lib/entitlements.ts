/**
 * Portal entitlements — which features each plan unlocks.
 *
 * Single source of truth for feature gating. The admin can open/close
 * specific parts per entrepreneur via User.featureOverrides
 * (e.g. { "mentorAi": false }) — an override always beats the plan default.
 *
 * Plans:
 *   WECCELERATE   — house clients (form automation / team-opened). Full
 *                   journey + learning + AI mentor.
 *   INVESTOR_PREP — purchased the investor-prep service. Everything above
 *                   PLUS the human-mentor thread with their advisor.
 *   FREE          — future open self-signup. Learning + journey basics,
 *                   no AI mentor (costs money) until they upgrade.
 */

export type PortalFeature =
  | 'journey'      // the מסע מרעיון למיזם program
  | 'learning'     // the learning center
  | 'mentorAi'     // AI answer review ("חוות דעת")
  | 'kit'          // תיק המוכנות (readiness kit)
  | 'humanMentor'; // send answers to the human advisor + thread

export type PlanName = 'WECCELERATE' | 'INVESTOR_PREP' | 'FREE';

const PLAN_FEATURES: Record<PlanName, Record<PortalFeature, boolean>> = {
  WECCELERATE: {
    journey: true,
    learning: true,
    mentorAi: true,
    kit: true,
    humanMentor: false,
  },
  INVESTOR_PREP: {
    journey: true,
    learning: true,
    mentorAi: true,
    kit: true,
    humanMentor: true,
  },
  FREE: {
    journey: true,
    learning: true,
    mentorAi: false,
    kit: true,
    humanMentor: false,
  },
};

export interface EntitledUser {
  plan?: string | null;
  featureOverrides?: unknown;
}

export function hasFeature(user: EntitledUser | null | undefined, feature: PortalFeature): boolean {
  const plan = (user?.plan as PlanName) || 'WECCELERATE';
  const overrides = (user?.featureOverrides ?? null) as Record<string, unknown> | null;
  if (overrides && typeof overrides === 'object' && typeof overrides[feature] === 'boolean') {
    return overrides[feature] as boolean;
  }
  return PLAN_FEATURES[plan]?.[feature] ?? PLAN_FEATURES.WECCELERATE[feature];
}

export function featuresFor(user: EntitledUser | null | undefined): Record<PortalFeature, boolean> {
  return {
    journey: hasFeature(user, 'journey'),
    learning: hasFeature(user, 'learning'),
    mentorAi: hasFeature(user, 'mentorAi'),
    kit: hasFeature(user, 'kit'),
    humanMentor: hasFeature(user, 'humanMentor'),
  };
}

export const PLAN_LABELS: Record<PlanName, string> = {
  WECCELERATE: 'יזם וויסלרייט',
  INVESTOR_PREP: 'הכנה למשקיעים',
  FREE: 'הרשמה חופשית',
};
