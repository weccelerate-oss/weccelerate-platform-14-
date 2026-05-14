/**
 * Lead spam filter — Phase 1 (deterministic, no DB / no LLM).
 *
 * Pure scoring function. Given a parsed lead submission + optional
 * envelope metadata (honeypot, render timestamp), returns:
 *   { score: 0-100, reasons: string[], decision: 'pass'|'review'|'drop' }
 *
 * Higher score = more spam-like. Decision thresholds:
 *   0-30  pass    → forward to Zapier + log normally
 *   31-60 review  → log to DB with status='review', skip Zapier, ask admin
 *   61-100 drop   → log to SpamAttempt, skip Zapier, return success silently
 *                   (don't tip off the bot that the submission failed)
 *
 * Each layer is a stand-alone check that returns 0 (no signal) or a
 * positive weight + a Hebrew reason string. The total is capped at 100.
 *
 * Tunable: change the WEIGHTS map. Add new heuristics by appending to
 * `runHeuristics`.
 */

import {
  DISPOSABLE_EMAIL_DOMAINS,
  TEST_EMAIL_TLD_SUFFIXES,
  FREE_EMAIL_PROVIDERS,
} from './disposable-domains';

// =============================================================================
// PUBLIC API
// =============================================================================

export type SpamDecision = 'pass' | 'review' | 'drop';

export interface SpamFilterInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message?: string | null;
  /** Site key — Hebrew sites should boost language-mismatch checks. */
  site?: string | null;
  /** Honeypot field value — if non-empty, near-instant drop. */
  honeypot?: string | null;
  /** Client-side render timestamp (ms since epoch). */
  renderedAtMs?: number | null;
  /** Server-side submission timestamp. Defaults to Date.now(). */
  submittedAtMs?: number;
}

export interface SpamFilterResult {
  score: number;
  reasons: string[];
  decision: SpamDecision;
  /** Stable machine codes for each reason — used by audit dashboards. */
  codes: string[];
}

/** Tunable thresholds. */
export const SPAM_THRESHOLDS = {
  PASS_MAX: 30,
  REVIEW_MAX: 60,
  // 61+ = drop
};

const MIN_TIME_TO_SUBMIT_MS = 3000; // < 3s on the form is bot territory

export function runSpamFilter(input: SpamFilterInput): SpamFilterResult {
  const reasons: string[] = [];
  const codes: string[] = [];
  let score = 0;

  const add = (weight: number, code: string, reason: string) => {
    score += weight;
    reasons.push(reason);
    codes.push(code);
  };

  // ---------------- HARD KILLERS (single signal → drop) ----------------
  // Honeypot — only bots see this field.
  if (input.honeypot && input.honeypot.trim().length > 0) {
    add(100, 'honeypot_filled', 'Honeypot field מולא — אינדיקציה ודאית של bot');
    // Continue scoring so the audit log is rich, but this alone forces drop.
  }

  // Submission too fast — humans need >3s to fill a form.
  const submittedAt = input.submittedAtMs ?? Date.now();
  if (input.renderedAtMs && input.renderedAtMs > 0) {
    const dwellMs = submittedAt - input.renderedAtMs;
    if (dwellMs < MIN_TIME_TO_SUBMIT_MS && dwellMs >= 0) {
      add(
        70,
        'submitted_too_fast',
        `הטופס נשלח תוך ${(dwellMs / 1000).toFixed(1)} שניות — בלתי אפשרי לאדם`,
      );
    }
  }

  // ---------------- EMAIL HEURISTICS ----------------
  const email = input.email.trim().toLowerCase();
  const emailDomain = email.split('@')[1] ?? '';
  const emailLocal = email.split('@')[0] ?? '';

  if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
    add(60, 'disposable_email', `Email מ-domain חד-פעמי: ${emailDomain}`);
  }
  if (TEST_EMAIL_TLD_SUFFIXES.some((s) => emailDomain.endsWith(s))) {
    add(80, 'test_tld', `Email מ-TLD של בדיקה (${emailDomain}) — לא תקף בפרודקשן`);
  }
  // "name + 4+ digits @ free" pattern — classic scraper signal.
  // E.g. staceydavis1506@gmail.com, kenp2025x@yahoo.com.
  if (FREE_EMAIL_PROVIDERS.has(emailDomain) && /\d{4,}/.test(emailLocal)) {
    add(20, 'email_digit_pattern', `Email pattern של scraper: שם+מספר ארוך ב-${emailDomain}`);
  }
  // Email = name+"test" / "demo" / "fake" → likely test data.
  if (/\b(test|demo|fake|spam|asdf|qwerty)\b/i.test(emailLocal)) {
    add(40, 'email_test_word', `Email מכיל מילת בדיקה (${emailLocal})`);
  }

  // ---------------- NAME HEURISTICS ----------------
  const name = input.name.trim();
  const hasHebrew = /[֐-׿]/.test(name);
  const hasLatin = /[A-Za-z]/.test(name);
  const isHebrewSite = !input.site || input.site === 'main' || input.site === 'leumit' || input.site === 'landing';

  // English-only name on Hebrew site — strong scraper signal.
  if (isHebrewSite && !hasHebrew && hasLatin) {
    add(20, 'english_name_he_site', `שם באנגלית בלבד באתר עברי: "${name}"`);
  }

  // Common test names.
  if (/\b(test|demo|fake|spam|asdf|qwerty|admin|user)\b/i.test(name)) {
    add(40, 'name_test_word', `שם מכיל מילת בדיקה: "${name}"`);
  }

  // Repeating chars / gibberish (e.g. "aaaa", "xxxxx").
  if (/(.)\1{4,}/.test(name)) {
    add(35, 'name_repeating', `שם עם תווים חוזרים: "${name}"`);
  }

  // ---------------- PHONE HEURISTICS ----------------
  if (input.phone) {
    const phone = input.phone.trim();
    const digits = phone.replace(/\D/g, '');
    // Israeli prefix? +972 or 0XX with leading 0.
    const isIsraeli = /^(\+972|972|0)/.test(digits) || /^\+?972/.test(phone);
    if (!isIsraeli) {
      add(15, 'phone_non_israeli', `מספר טלפון לא בפורמט ישראלי: ${phone}`);
    }
    // All same digit / sequential.
    if (/^(.)\1+$/.test(digits)) {
      add(40, 'phone_same_digit', `טלפון כולו אותה ספרה: ${phone}`);
    }
    if (digits === '1234567' || digits === '0000000' || digits === '1111111') {
      add(50, 'phone_obvious_fake', `טלפון fake ידוע: ${phone}`);
    }
  } else {
    // No phone but Hebrew/Israeli site — slight signal (not strong on its own).
    add(5, 'phone_missing', 'טלפון חסר');
  }

  // ---------------- CONTENT HEURISTICS ----------------
  const message = input.message?.trim() ?? '';
  if (message) {
    const messageHasHebrew = /[֐-׿]/.test(message);
    const messageHasLatin = /[A-Za-z]/.test(message);
    if (isHebrewSite && messageHasLatin && !messageHasHebrew && message.length > 20) {
      add(15, 'message_english_he_site', 'הודעה באנגלית בלבד באתר עברי');
    }
    // URL count — spam loves to insert links.
    const urlCount = (message.match(/https?:\/\//g) ?? []).length;
    if (urlCount >= 2) {
      add(20, 'message_multiple_urls', `הודעה כוללת ${urlCount} קישורים — אופייני לספאם`);
    } else if (urlCount === 1 && message.length < 100) {
      add(10, 'message_short_with_url', 'הודעה קצרה עם קישור — סיגנל ספאם חלש');
    }
    // Common spam keywords.
    if (/\b(viagra|casino|bitcoin|crypto|loan|seo services|backlink)\b/i.test(message)) {
      add(40, 'message_spam_keyword', 'הודעה מכילה מילת מפתח של ספאם מסחרי');
    }
  }

  // ---------------- COMBINATION SIGNALS ----------------
  // Free email + no company + no message + non-Israeli phone — composite weak signal.
  const noCompany = !input.company || input.company.trim() === '';
  const noMessage = !message;
  const isFreeMail = FREE_EMAIL_PROVIDERS.has(emailDomain);
  if (isFreeMail && noCompany && noMessage) {
    add(10, 'minimal_payload', 'Free email + ללא חברה + ללא הודעה — payload מינימלי');
  }

  // Cap at 100 and decide.
  score = Math.min(100, score);
  let decision: SpamDecision = 'pass';
  if (score >= SPAM_THRESHOLDS.REVIEW_MAX + 1) decision = 'drop';
  else if (score >= SPAM_THRESHOLDS.PASS_MAX + 1) decision = 'review';

  return { score, reasons, codes, decision };
}
