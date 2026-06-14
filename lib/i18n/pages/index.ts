/**
 * Per-page translation modules.
 *
 * Long-lived UI dictionaries live in he.ts / en.ts. Page-specific strings that
 * were previously hardcoded in components are split into one module per page
 * here, each exporting `<page>He` and `<page>En` maps. They are merged into the
 * main `he` / `en` dictionaries (see he.ts / en.ts), so `t('key')` resolves them
 * exactly like any core key.
 *
 * Keeping them in separate files keeps the giant core dictionaries readable and
 * lets each page's strings be edited in isolation.
 */

import { comparisonsHe, comparisonsEn } from './comparisons';
import { faqHe, faqEn } from './faq';
import { pressHe, pressEn } from './press';
import { infratechHe, infratechEn } from './infratech';
import { eventsHe, eventsEn } from './events';
import { videosHe, videosEn } from './videos';
import { teamHe, teamEn } from './team';
import { miscHe, miscEn } from './misc';

export const pagesHe: Record<string, string> = {
  ...comparisonsHe,
  ...faqHe,
  ...pressHe,
  ...infratechHe,
  ...eventsHe,
  ...videosHe,
  ...teamHe,
  ...miscHe,
};

export const pagesEn: Record<string, string> = {
  ...comparisonsEn,
  ...faqEn,
  ...pressEn,
  ...infratechEn,
  ...eventsEn,
  ...videosEn,
  ...teamEn,
  ...miscEn,
};
