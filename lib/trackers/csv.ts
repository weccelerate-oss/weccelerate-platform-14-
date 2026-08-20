/**
 * FOUNDER TRACKERS — the Excel bridge.
 *
 * Pure functions, no React, no imports beyond the column schema. Everything
 * here is deliberately testable in isolation, because every bug in this file
 * shows up as "the import is broken" rather than as an exception.
 *
 * The three things this file exists to get right:
 *   1. Hebrew Excel writes CSV as windows-1255, not UTF-8. Decoding is a ladder,
 *      not an assumption.
 *   2. Excel QUOTES fields containing tabs or newlines, so the clipboard TSV of
 *      a multi-line "סיכום שיחה" is destroyed by split('\n').split('\t'). One
 *      real state-machine parser serves both TSV and CSV.
 *   3. A cell starting with = + - @ is executed as a formula when Excel opens
 *      the file we produced. That is a real vulnerability, not a nicety.
 */

import { TRACKERS, type TrackerColumn, type TrackerSlug } from '@/lib/trackers/schema';

// =============================================================================
// PARSE — one RFC-4180 state machine, parameterized by delimiter
// =============================================================================

/**
 * Splits delimited text into a grid, honouring quoted fields that contain the
 * delimiter, double-quotes ("" escape) and embedded newlines.
 */
export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  // Strip a UTF-8 BOM if the decoder left one behind.
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"' && field === '') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === delimiter) {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r') {
      // \r\n and a lone \r both end the record.
      if (text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Trailing field/record (a file not ending in a newline).
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop rows that are entirely empty — Excel exports love trailing blanks.
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Tab if the first substantial line has more tabs than commas, else comma. */
export function detectDelimiter(text: string): string {
  const line = text.split(/\r?\n/).find((l) => l.trim() !== '') ?? '';
  const tabs = (line.match(/\t/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  const semis = (line.match(/;/g) ?? []).length;
  if (tabs >= commas && tabs >= semis && tabs > 0) return '\t';
  if (semis > commas) return ';';
  return ',';
}

// =============================================================================
// DECODE — the ladder that makes file upload work for Hebrew Excel
// =============================================================================

export type DecodedEncoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1255';

export interface DecodeResult {
  text: string;
  encoding: DecodedEncoding;
  /** True when we fell back rather than detected — surface it in the UI. */
  guessed: boolean;
}

const HEBREW = /[֐-׿]/;

/**
 * Decodes an uploaded file without a dependency.
 *
 * "Save As → CSV UTF-8" gives a BOM. "Save As → CSV (Comma delimited)" on a
 * Hebrew Windows Excel gives windows-1255 with no BOM at all, and decoding that
 * as UTF-8 yields garbage — which is exactly the failure a founder reports as
 * "the import doesn't work".
 */
export function decodeFileBytes(buffer: ArrayBuffer, forced?: DecodedEncoding): DecodeResult {
  const bytes = new Uint8Array(buffer);

  if (forced) {
    return { text: new TextDecoder(forced).decode(bytes), encoding: forced, guessed: false };
  }

  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return {
      text: new TextDecoder('utf-8').decode(bytes.subarray(3)),
      encoding: 'utf-8',
      guessed: false,
    };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return {
      text: new TextDecoder('utf-16le').decode(bytes.subarray(2)),
      encoding: 'utf-16le',
      guessed: false,
    };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return {
      text: new TextDecoder('utf-16be').decode(bytes.subarray(2)),
      encoding: 'utf-16be',
      guessed: false,
    };
  }

  // Strict UTF-8 first: if the bytes aren't valid UTF-8 this throws, which is
  // the cleanest possible signal that we're looking at a legacy encoding.
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return { text, encoding: 'utf-8', guessed: false };
  } catch {
    /* fall through */
  }

  // Valid-but-wrong is the nastier case: windows-1255 bytes can decode as UTF-8
  // without throwing, producing replacement characters and no Hebrew.
  const lenient = new TextDecoder('utf-8').decode(bytes);
  if (!HEBREW.test(lenient) && lenient.includes('�')) {
    return {
      text: new TextDecoder('windows-1255').decode(bytes),
      encoding: 'windows-1255',
      guessed: true,
    };
  }

  return {
    text: new TextDecoder('windows-1255').decode(bytes),
    encoding: 'windows-1255',
    guessed: true,
  };
}

// =============================================================================
// DATES
// =============================================================================

const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const DMY = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Accepts what Israeli Excel produces. dd/mm/yyyy is genuinely ambiguous with
 * mm/dd/yyyy and no code can resolve it — we commit to the Israeli reading and
 * show the parsed result in the import preview so a human can catch it.
 * Returns 'YYYY-MM-DD' or null. Never throws.
 */
export function parseHebrewDate(input: unknown): string | null {
  const s = String(input ?? '').trim();
  if (!s) return null;

  const iso = s.match(ISO);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${pad(Number(m))}-${pad(Number(d))}`;
  }

  const dmy = s.match(DMY);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  // Excel serial dates leak through when a cell was copied as a number.
  if (/^\d{5}$/.test(s)) {
    const serial = Number(s);
    const ms = (serial - 25569) * 86400 * 1000;
    const d = new Date(ms);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }

  return null;
}

/** 'YYYY-MM-DD' -> 'dd/mm/yyyy', what the founder's Excel expects back. */
export function formatHebrewDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = String(iso).match(ISO);
  if (!m) return '';
  return `${pad(Number(m[3]))}/${pad(Number(m[2]))}/${m[1]}`;
}

// =============================================================================
// HEADER MATCHING
// =============================================================================

/** Hebrew Excel exports carry RLM/LRM marks and NBSP that break naive equality. */
export function normalizeHeader(s: unknown): string {
  return String(s ?? '')
    .replace(/[‎‏‪-‮⁦-⁩﻿ ]/g, '')
    .replace(/["'׳״]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Header spellings that mean "row number" and must be discarded on import. */
const ROW_NUMBER_HEADERS = ['מס', 'מספר', '#', 'no', 'num', 'index'];

export function isRowNumberHeader(header: string): boolean {
  return ROW_NUMBER_HEADERS.includes(normalizeHeader(header));
}

export interface HeaderMatch {
  /** For each tracker column, the source column index, or -1 for unmapped. */
  mapping: Record<string, number>;
  /** How many tracker columns were matched — drives the "is row 0 a header" call. */
  matched: number;
  /** True when a "מס'" column was found and is being ignored. */
  sawRowNumber: boolean;
}

export function matchHeaders(headerRow: string[], slug: TrackerSlug): HeaderMatch {
  const columns = TRACKERS[slug].columns;
  const normalized = headerRow.map(normalizeHeader);
  const mapping: Record<string, number> = {};
  const taken = new Set<number>();
  let matched = 0;

  for (const col of columns) {
    const candidates = [col.label, ...(col.aliases ?? [])].map(normalizeHeader);
    let found = -1;

    // Exact first, so "מייל" doesn't steal the slot "אימייל" wanted.
    for (let i = 0; i < normalized.length; i++) {
      if (taken.has(i)) continue;
      if (candidates.includes(normalized[i])) {
        found = i;
        break;
      }
    }
    if (found === -1) {
      for (let i = 0; i < normalized.length; i++) {
        if (taken.has(i)) continue;
        if (candidates.some((c) => c && (normalized[i].includes(c) || c.includes(normalized[i])))) {
          found = i;
          break;
        }
      }
    }

    mapping[col.key] = found;
    if (found >= 0) {
      taken.add(found);
      matched++;
    }
  }

  return {
    mapping,
    matched,
    sawRowNumber: normalized.some((h) => isRowNumberHeader(h)),
  };
}

/** Two or more matched columns is a header row; anything less is data. */
export function looksLikeHeader(match: HeaderMatch): boolean {
  return match.matched >= 2;
}

// =============================================================================
// EXPORT
// =============================================================================

/** A cell starting with one of these is executed as a formula by Excel. */
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function escapeCell(raw: string, delimiter: string): string {
  let s = String(raw ?? '');

  // CSV formula injection. Founders paste arbitrary text into הערות, and this
  // file is opened by Excel on their machine.
  if (FORMULA_TRIGGER.test(s)) s = `'${s}`;

  const mustQuote =
    s.includes(delimiter) ||
    s.includes('"') ||
    s.includes('\n') ||
    s.includes('\r') ||
    s !== s.trim();

  if (!mustQuote) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

function cellValue(row: Record<string, unknown>, col: TrackerColumn): string {
  if (col.kind === 'date') return formatHebrewDate(row[col.key] as string | null);
  return String(row[col.key] ?? '');
}

function serialize(
  rows: Array<Record<string, unknown>>,
  slug: TrackerSlug,
  delimiter: string,
  eol: string,
): string {
  const def = TRACKERS[slug];
  const columns = def.columns;

  const header: string[] = [];
  if (def.showRowNumber) header.push(escapeCell("מס'", delimiter));
  header.push(...columns.map((c) => escapeCell(c.label, delimiter)));

  const lines = [header.join(delimiter)];

  rows.forEach((row, index) => {
    const cells: string[] = [];
    if (def.showRowNumber) cells.push(String(index + 1));
    cells.push(...columns.map((c) => escapeCell(cellValue(row, c), delimiter)));
    lines.push(cells.join(delimiter));
  });

  return lines.join(eol);
}

/**
 * CSV for download. The BOM is not optional: without it Hebrew Windows Excel
 * decodes UTF-8 as CP1255 and the founder sees mojibake.
 */
export function toCsv(rows: Array<Record<string, unknown>>, slug: TrackerSlug): string {
  return '﻿' + serialize(rows, slug, ',', '\r\n');
}

/**
 * TSV for the clipboard. Better round-trip than CSV — the clipboard is UTF-16,
 * so there is no encoding question, and pasting into a pre-formatted text
 * column preserves leading zeros in phone numbers.
 */
export function toTsv(rows: Array<Record<string, unknown>>, slug: TrackerSlug): string {
  return serialize(rows, slug, '\t', '\n');
}

export function csvFilename(slug: TrackerSlug, today: string): string {
  // ASCII on purpose — sidesteps Content-Disposition / download-attribute
  // encoding edge cases entirely.
  return `${TRACKERS[slug].exportName}-${today}.csv`;
}
