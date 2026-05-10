/**
 * Bot categorization for GEO/AEO health indicators.
 *
 * Each AI crawler tells us a different thing about the GEO progression:
 *   - Training crawlers seed the next model version's knowledge cutoff.
 *   - Search-index bots build the citation graph for live answers.
 *   - Live-retrieval bots fire when an actual user asked an LLM and the
 *     LLM grabbed our page mid-answer — the strongest signal we exist
 *     in the eyes of paying users.
 *
 * Used by /admin/bot-analytics to render the GEO Status card and by
 * /api/bot/log to decide when to send an "you've been cited!" alert.
 */

export const TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'GoogleOther',
  'Applebot-Extended',
  'CCBot',
  'Meta-ExternalAgent',
  'FacebookBot',
  'Bytespider',
  'cohere-ai',
  'Amazonbot',
] as const;

export const SEARCH_INDEX_BOTS = [
  'OAI-SearchBot',
  'PerplexityBot',
  'DuckAssistBot',
] as const;

export const LIVE_RETRIEVAL_BOTS = [
  'ChatGPT-User',
  'Perplexity-User',
  'Claude-Web',
] as const;

export type BotCategory = 'training' | 'search' | 'live_retrieval' | 'unknown';

export function categorizeBot(bot: string): BotCategory {
  if ((TRAINING_CRAWLERS as readonly string[]).includes(bot)) return 'training';
  if ((SEARCH_INDEX_BOTS as readonly string[]).includes(bot)) return 'search';
  if ((LIVE_RETRIEVAL_BOTS as readonly string[]).includes(bot)) return 'live_retrieval';
  return 'unknown';
}

export interface GeoStage {
  stage: 0 | 1 | 2 | 3;
  label: string;
  description: string;
  color: 'slate' | 'amber' | 'blue' | 'green';
}

export function geoStage(counts: {
  training: number;
  search: number;
  liveRetrieval: number;
}): GeoStage {
  if (counts.liveRetrieval > 0) {
    return {
      stage: 3,
      label: 'ציטוטים פעילים',
      description:
        'משתמשים אמיתיים שואלים LLMs ומקבלים אותך כתשובה. ה-GEO עובד בפועל.',
      color: 'green',
    };
  }
  if (counts.search > 0) {
    return {
      stage: 2,
      label: 'סריקה לציטוטים',
      description:
        'מנועי AI מאנדקסים אותך לציטוט עתידי. ציטוטים פעילים אמורים להתחיל תוך ימים-שבועות.',
      color: 'blue',
    };
  }
  if (counts.training > 0) {
    return {
      stage: 1,
      label: 'אימון מודלים',
      description:
        'OpenAI/Anthropic/Google סורקים את האתר לאימון המודל הבא. הזרעה ל-Knowledge Cutoff עתידי.',
      color: 'amber',
    };
  }
  return {
    stage: 0,
    label: 'טרם התחיל',
    description: 'אף בוט AI עוד לא ביקר. בדוק שה-IndexNow רץ ושה-sitemap מוגש ל-Bing.',
    color: 'slate',
  };
}
