/**
 * Parser/cleaner for the Smoove "תוכן העשרה ליזמים" export.
 *
 * Used once by /api/admin/invite-veterans to turn the raw CSV into a clean,
 * de-duplicated list of (email, name) pairs ready to provision.
 *
 * The source list has known quality issues we defend against here:
 *   - swapped name/email columns in paired rows → we don't trust names for the
 *     email greeting (caller sends a neutral, name-less email), but we still
 *     keep a best-effort name for the DB record.
 *   - duplicate emails → de-duped on lowercased address (first wins).
 *   - malformed emails (e.g. "x@gmail.comil.com") → rejected.
 *   - rows with no email at all → rejected.
 */

export interface VeteranRow {
  email: string;
  /** Best-effort display name for the DB record. Falls back to 'יזם'.
   *  NOT used in the email greeting (that's intentionally neutral). */
  name: string;
}

export interface ParsedVeterans {
  valid: VeteranRow[];
  /** Rows we dropped, with a human-readable reason. */
  skipped: { line: number; raw: string; reason: string }[];
}

// Conservative email check: one @, a dotted domain, and a 2–24 char TLD that
// is not itself dotted (catches "gmail.comil.com" where the TLD is "comil.com").
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,24}$/i;

function isValidEmail(email: string): boolean {
  if (!EMAIL_RE.test(email)) return false;
  // Reject a domain whose final label looks like a run-on TLD typo.
  const domain = email.split('@')[1] ?? '';
  const lastLabel = domain.split('.').pop() ?? '';
  if (lastLabel.length > 12) return false; // no real TLD here is this long
  return true;
}

/** Split a single CSV line into fields. The source has no quoted commas, so a
 *  plain split is safe; we still trim each cell. */
function splitLine(line: string): string[] {
  return line.split(',').map((c) => c.trim());
}

export function parseVeteransCsv(csv: string): ParsedVeterans {
  const valid: VeteranRow[] = [];
  const skipped: ParsedVeterans['skipped'] = [];
  const seen = new Set<string>();

  // Strip a UTF-8 BOM if present, normalise newlines.
  const lines = csv.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    if (!raw || !raw.trim()) continue;

    const cells = splitLine(raw);

    // Header row — detect by the Hebrew column titles and skip.
    if (i === 0 && (raw.includes('מייל') || raw.includes('שם פרטי'))) continue;

    // Expected columns: [lastName, firstName, joinDate, phone, email]
    const lastName = cells[0] ?? '';
    const firstName = cells[1] ?? '';
    const email = (cells[4] ?? '').toLowerCase();

    if (!email) {
      skipped.push({ line: lineNo, raw, reason: 'no email' });
      continue;
    }
    if (!isValidEmail(email)) {
      skipped.push({ line: lineNo, raw, reason: `invalid email: ${email}` });
      continue;
    }
    if (seen.has(email)) {
      skipped.push({ line: lineNo, raw, reason: `duplicate email: ${email}` });
      continue;
    }
    seen.add(email);

    const combined = `${firstName} ${lastName}`.trim();
    const name = combined.length >= 2 ? combined : 'יזם';

    valid.push({ email, name });
  }

  return { valid, skipped };
}
