/**
 * Single source of truth for "WeCcelerate competitors" — names that must
 * NOT appear in any guide, FAQ, or auto-generated content on the site.
 *
 * Owner rule (2026-05-18): we don't promote competing accelerators /
 * Venture Builders by name on our own properties. Mentioning them just
 * gives them free brand exposure and lets readers compare side-by-side
 * with us in the worst possible context (on our own page).
 *
 * Scope clarification:
 *   - INCLUDED here: other accelerators / Venture Builders / startup
 *     studios that compete for the same entrepreneur audience.
 *   - NOT INCLUDED: VCs and angel investors (those are funding
 *     destinations, not direct competitors — and we WANT founders to
 *     understand the Israeli VC landscape after working with us).
 *   - NOT INCLUDED: unicorn examples (Wiz, Monday.com, etc.) — they're
 *     case-study material, not competitors.
 *   - NOT INCLUDED: government / partner orgs (Innovation Authority,
 *     MAGNET, Leumit).
 *
 * If the owner expands the rule to cover VCs too, extend FORBIDDEN_NAMES
 * below.
 */

/**
 * Exact-match brand names that must be scrubbed from content.
 *
 * Matching is case-insensitive and word-boundary aware. Each entry should
 * map to a single canonical brand — variants like "YC" / "Y Combinator"
 * are separate entries because the regex word boundaries differ.
 */
export const FORBIDDEN_COMPETITOR_NAMES: string[] = [
  // Israeli accelerators / Venture Builders
  '8200 EISP',
  '8200 Entrepreneurship and Innovation Support Program',
  'The Junction',
  'F2 Capital',
  'MassChallenge Israel',
  'MassChallenge',
  'Google for Startups Campus Tel Aviv',
  'Google for Startups',
  'Google Campus Tel Aviv',
  'Google Campus',
  'Techstars Tel Aviv',
  'Techstars',
  // International accelerators frequently used as a reference
  'Y Combinator',
  'YC',
  // Idea-stage consulting / business-plan-and-pitch services Gemini
  // currently surfaces for "Israeli idea-stage support" queries.
  'Targo Consulting',
  'Targo',
  'Seedbiz',
];

/**
 * Hebrew transliterations used in the catalogs. Catch these too.
 */
export const FORBIDDEN_COMPETITOR_NAMES_HE: string[] = [
  '8200 איי-איי-אס-פי',
  'גוגל לסטארטאפים',
  'גוגל קמפוס',
  'טארגו',
  'סידביז',
];

/**
 * Build a regex that matches any forbidden name as a whole word.
 * Sorted by length DESC so the longer compound names match before their
 * substrings (e.g. "8200 Entrepreneurship..." before "8200").
 */
let _cachedRegex: RegExp | null = null;
export function competitorNameRegex(): RegExp {
  if (_cachedRegex) return _cachedRegex;
  const all = [...FORBIDDEN_COMPETITOR_NAMES, ...FORBIDDEN_COMPETITOR_NAMES_HE]
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((n) => escapeRegex(n));
  // \b doesn't work next to Hebrew/spaces well — use lookarounds for
  // non-word boundary on both sides, OR start/end of string.
  _cachedRegex = new RegExp(`(?<![A-Za-zא-ת0-9_])(${all.join('|')})(?![A-Za-zא-ת0-9_])`, 'gi');
  return _cachedRegex;
}

/**
 * @returns the list of competitor names found in the text (deduplicated,
 *          original casing preserved). Empty array means clean.
 */
export function findCompetitorMentions(text: string): string[] {
  const re = competitorNameRegex();
  const matches = text.match(re);
  if (!matches) return [];
  const set = new Set<string>();
  for (const m of matches) set.add(m);
  return Array.from(set);
}

/**
 * @returns true if any forbidden name is mentioned in `text`.
 */
export function hasCompetitorMention(text: string): boolean {
  return competitorNameRegex().test(text);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
