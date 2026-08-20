/**
 * FOUNDER TRACKERS — the column contract.
 *
 * This file defines what the two trackers ARE. The grid renderer, the mobile
 * card list, the CSV serializer, the import column-mapper and the server-side
 * validator all read their columns from here, which is what makes the second
 * tracker cost ~1.1x the first instead of 2x.
 *
 * Constraints this file lives under:
 *   - No imports. No React. No 'use client'. It is shared by client components,
 *     server pages and an API route handler, so it must be import-safe in all
 *     three.
 *   - lib/db.ts hands back an untyped Prisma client, so there is no generated
 *     row type to lean on. These interfaces are the only type contract the
 *     feature has — keep them honest.
 */

// =============================================================================
// COLUMN MODEL
// =============================================================================

export type TrackerSlug = 'calls' | 'leads';

export type ColumnKind =
  /** Single-line text. */
  | 'text'
  /** Long text — one truncated line in the grid, popover to edit. */
  | 'longtext'
  /** Date-only, carried over the wire as 'YYYY-MM-DD'. */
  | 'date'
  /** URL. Rendered as a link only when it is safe and absolute. */
  | 'url'
  /** Short text with suggested values, but free typing is always allowed. */
  | 'chip';

export interface TrackerColumn {
  /** Field name on the row object and in the DB. */
  key: string;
  /** Hebrew header — also the CSV header and the primary import-match target. */
  label: string;
  kind: ColumnKind;
  /** Hard cap applied server-side after trimming. */
  maxLength: number;
  /** Grid track width. */
  width: string;
  /**
   * 1 = shown on the mobile card face. Everything else is edit-sheet only.
   * A 11-column grid has no business rendering on a phone.
   */
  mobilePriority: 1 | 2;
  /** Suggested values for 'chip' columns. Never enforced. */
  suggestions?: string[];
  /** Extra header spellings accepted when matching an imported sheet. */
  aliases?: string[];
  placeholder?: string;
}

export interface TrackerDefinition {
  slug: TrackerSlug;
  /** Page + nav title. */
  title: string;
  subtitle: string;
  /** Filename stem for CSV export. ASCII on purpose. */
  exportName: string;
  /** Columns in RTL reading order — first entry is the rightmost, sticky one. */
  columns: TrackerColumn[];
  /** Tracker B shows a derived row number; tracker A does not. */
  showRowNumber: boolean;
  emptyHint: string;
}

// =============================================================================
// TRACKER A — תיעוד שיחות עם לקוחות
// =============================================================================

const CALL_COLUMNS: TrackerColumn[] = [
  {
    key: 'contactName',
    label: 'שם',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(150px, 1fr)',
    mobilePriority: 1,
    aliases: ['שם מלא', 'איש קשר', 'שם הלקוח', 'name'],
    placeholder: 'שם איש הקשר',
  },
  {
    key: 'relevance',
    label: 'רלוונטיות',
    kind: 'chip',
    maxLength: 60,
    width: 'minmax(110px, 0.7fr)',
    mobilePriority: 1,
    suggestions: ['רלוונטי מאוד', 'רלוונטי', 'אולי', 'לא רלוונטי', 'לבדיקה'],
    aliases: ['רלוונטי', 'relevance'],
  },
  {
    key: 'company',
    label: 'חברה',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(150px, 1fr)',
    mobilePriority: 1,
    aliases: ['שם החברה', 'ארגון', 'company'],
  },
  {
    key: 'phone',
    label: 'טלפון',
    kind: 'text',
    maxLength: 60,
    width: 'minmax(130px, 0.8fr)',
    mobilePriority: 2,
    aliases: ['נייד', 'מספר טלפון', 'phone', 'mobile'],
  },
  {
    key: 'email',
    label: 'מייל',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(180px, 1fr)',
    mobilePriority: 2,
    aliases: ['אימייל', 'דואל', 'דואר אלקטרוני', 'email', 'mail'],
  },
  {
    key: 'lastContactAt',
    label: 'תאריך התקשרות אחרון',
    kind: 'date',
    maxLength: 10,
    width: 'minmax(150px, 0.9fr)',
    mobilePriority: 1,
    aliases: ['תאריך התקשרות', 'תאריך שיחה', 'תאריך', 'date'],
  },
  {
    key: 'summary',
    label: 'סיכום שיחה',
    kind: 'longtext',
    maxLength: 5000,
    width: 'minmax(220px, 1.6fr)',
    mobilePriority: 2,
    aliases: ['סיכום', 'הערות', 'תקציר', 'summary', 'notes'],
    placeholder: 'מה נאמר בשיחה',
  },
  {
    key: 'recordingUrl',
    label: 'קישור להקלטה',
    kind: 'url',
    maxLength: 2000,
    width: 'minmax(150px, 0.9fr)',
    mobilePriority: 2,
    aliases: ['הקלטה', 'לינק להקלטה', 'recording', 'link'],
    placeholder: 'https://…',
  },
];

// =============================================================================
// TRACKER B — מעקב פניות
// =============================================================================

const LEAD_COLUMNS: TrackerColumn[] = [
  {
    key: 'companyName',
    label: 'שם החברה',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(160px, 1.1fr)',
    mobilePriority: 1,
    aliases: ['חברה', 'שם חברה', 'ארגון', 'company'],
  },
  {
    key: 'occupation',
    label: 'עיסוק',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(140px, 1fr)',
    mobilePriority: 2,
    aliases: ['תחום', 'תחום עיסוק', 'occupation'],
  },
  {
    key: 'category',
    label: 'קטגוריה',
    kind: 'chip',
    maxLength: 120,
    width: 'minmax(120px, 0.8fr)',
    mobilePriority: 1,
    suggestions: ['לקוח פוטנציאלי', 'שותף', 'ספק', 'משקיע', 'מפיץ'],
    aliases: ['סוג', 'category'],
  },
  {
    key: 'contactName',
    label: 'איש קשר',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(140px, 1fr)',
    mobilePriority: 1,
    aliases: ['שם', 'שם איש קשר', 'contact'],
  },
  {
    key: 'phone',
    label: 'טלפון',
    kind: 'text',
    maxLength: 60,
    width: 'minmax(130px, 0.8fr)',
    mobilePriority: 2,
    aliases: ['נייד', 'מספר טלפון', 'phone', 'mobile'],
  },
  {
    key: 'email',
    label: 'אימייל',
    kind: 'text',
    maxLength: 200,
    width: 'minmax(180px, 1fr)',
    mobilePriority: 2,
    aliases: ['מייל', 'דואל', 'email', 'mail'],
  },
  {
    key: 'link',
    label: 'אתר / לינקדאין',
    kind: 'url',
    maxLength: 2000,
    width: 'minmax(160px, 1fr)',
    mobilePriority: 2,
    aliases: ['אתר', 'לינקדאין', 'website', 'linkedin', 'url'],
    placeholder: 'https://…',
  },
  {
    key: 'status',
    label: 'סטטוס פנייה',
    kind: 'chip',
    maxLength: 60,
    width: 'minmax(130px, 0.8fr)',
    mobilePriority: 1,
    suggestions: ['טרם פניתי', 'נשלחה פנייה', 'בהמתנה', 'נקבעה פגישה', 'לא ענה', 'לא רלוונטי', 'סגור'],
    aliases: ['סטטוס', 'מצב', 'status'],
  },
  {
    key: 'lastOutreachAt',
    label: 'תאריך פנייה אחרון',
    kind: 'date',
    maxLength: 10,
    width: 'minmax(150px, 0.9fr)',
    mobilePriority: 1,
    aliases: ['תאריך פנייה', 'תאריך', 'date'],
  },
  {
    key: 'notes',
    label: 'הערות',
    kind: 'longtext',
    maxLength: 5000,
    width: 'minmax(200px, 1.4fr)',
    mobilePriority: 2,
    aliases: ['הערה', 'סיכום', 'notes', 'comments'],
  },
];

export const TRACKERS: Record<TrackerSlug, TrackerDefinition> = {
  calls: {
    slug: 'calls',
    title: 'תיעוד שיחות עם לקוחות',
    subtitle: 'כל שיחה שקיימת עם לקוח פוטנציאלי — מי, מתי, ומה יצא מזה',
    exportName: 'weccelerate-calls',
    columns: CALL_COLUMNS,
    showRowNumber: false,
    emptyHint: 'עדיין לא תיעדת אף שיחה',
  },
  leads: {
    slug: 'leads',
    title: 'מעקב פניות',
    subtitle: 'למי פנית, מתי, ומה הסטטוס',
    exportName: 'weccelerate-leads',
    columns: LEAD_COLUMNS,
    showRowNumber: true,
    emptyHint: 'עדיין לא רשמת אף פנייה',
  },
};

export const TRACKER_SLUGS: TrackerSlug[] = ['calls', 'leads'];

export function isTrackerSlug(value: unknown): value is TrackerSlug {
  return value === 'calls' || value === 'leads';
}

export function getTracker(slug: TrackerSlug): TrackerDefinition {
  return TRACKERS[slug];
}

// =============================================================================
// ROW SHAPE
// =============================================================================

/** A row as it travels between server and client. Dates are 'YYYY-MM-DD'. */
export interface TrackerRow {
  id: string;
  position: number;
  updatedAt: string;
  [field: string]: string | number | null;
}

/** A row the client has created but the server has not yet given an id. */
export interface DraftRow extends TrackerRow {
  /** Stable client-side key, echoed back by the save response. */
  clientId: string;
}

export function emptyRow(slug: TrackerSlug, position: number, clientId: string): DraftRow {
  const row: DraftRow = { id: '', clientId, position, updatedAt: '' };
  for (const col of TRACKERS[slug].columns) {
    row[col.key] = col.kind === 'date' ? null : '';
  }
  return row;
}

export function isRowEmpty(slug: TrackerSlug, row: Record<string, unknown>): boolean {
  return TRACKERS[slug].columns.every((col) => {
    const v = row[col.key];
    return v === null || v === undefined || String(v).trim() === '';
  });
}

// =============================================================================
// SANITIZE — server-side, and reused by the import preview
// =============================================================================
//
// Policy: WARN, never reject. Founders' real sheets contain
// "050-123-4567 / 03-9999999", "דני (המזכירה)" and "אין מייל". A validator that
// 400s on those makes the import unusable and the product feel hostile. The
// data always lands; suspicious cells get an amber ring and a count in the
// toolbar. The one exception is a dangerous URL scheme, which is defanged.

const CONTROL_CHARS = /[ --]/g;
/** Bidi marks and NBSP — Hebrew Excel exports are full of these. */
const INVISIBLES = /[‎‏‪-‮⁦-⁩﻿ ]/g;
const LOOSE_EMAIL = /^\S+@\S+\.\S+$/;
const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file):/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface SanitizedRow {
  value: Record<string, string | null>;
  /** Human-readable, per-field. Keyed by column key. */
  warnings: Record<string, string>;
}

function cleanText(raw: unknown, maxLength: number, keepNewlines: boolean): string {
  let s = String(raw ?? '');
  s = s.replace(CONTROL_CHARS, keepNewlines ? '' : ' ');
  s = s.replace(INVISIBLES, '');
  if (!keepNewlines) s = s.replace(/[\r\n]+/g, ' ');
  else s = s.replace(/\r\n?/g, '\n');
  return s.trim().slice(0, maxLength);
}

/**
 * Normalizes one incoming row against a tracker's columns.
 * Unknown keys are dropped — the client cannot invent columns.
 */
export function sanitizeRow(slug: TrackerSlug, raw: Record<string, unknown>): SanitizedRow {
  const value: Record<string, string | null> = {};
  const warnings: Record<string, string> = {};

  for (const col of TRACKERS[slug].columns) {
    const input = raw[col.key];

    if (col.kind === 'date') {
      const s = cleanText(input, 10, false);
      if (!s) {
        value[col.key] = null;
      } else if (ISO_DATE.test(s) && !Number.isNaN(Date.parse(s))) {
        value[col.key] = s;
      } else {
        // The server stays dumb on purpose: all locale parsing happens in the
        // importer, client-side, where a human can see the result first.
        value[col.key] = null;
        warnings[col.key] = 'תאריך לא זוהה';
      }
      continue;
    }

    const isLong = col.kind === 'longtext';
    let s = cleanText(input, col.maxLength, isLong);

    if (col.kind === 'url' && s) {
      if (DANGEROUS_SCHEME.test(s.replace(/\s/g, ''))) {
        s = s.replace(DANGEROUS_SCHEME, '');
        warnings[col.key] = 'קישור לא בטוח — נשמר כטקסט';
      } else if (!/^https?:\/\//i.test(s)) {
        warnings[col.key] = 'חסר https:// — לא ייפתח כקישור';
      }
    }

    if (col.key === 'email' && s && !LOOSE_EMAIL.test(s)) {
      warnings[col.key] = 'כתובת מייל חשודה';
    }

    value[col.key] = s;
  }

  return { value, warnings };
}

export function clampPosition(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(9999, Math.trunc(v)));
}

// =============================================================================
// DEDUPE
// =============================================================================

function normalizeForKey(s: unknown): string {
  return String(s ?? '')
    .replace(INVISIBLES, '')
    .replace(/["'׳״]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Identity for duplicate detection on import: email, else the last 9 digits of
 * the phone, else company+contact. Returns '' when a row has nothing to match
 * on — those are always treated as new.
 */
export function rowDedupeKey(slug: TrackerSlug, row: Record<string, unknown>): string {
  const email = normalizeForKey(row.email);
  if (email) return `e:${email}`;

  const digits = String(row.phone ?? '').replace(/\D/g, '');
  if (digits.length >= 7) return `p:${digits.slice(-9)}`;

  const company = normalizeForKey(slug === 'calls' ? row.company : row.companyName);
  const contact = normalizeForKey(row.contactName);
  if (company || contact) return `c:${company}|${contact}`;

  return '';
}

// =============================================================================
// LIMITS — shared by client chunking and server guards
// =============================================================================

export const TRACKER_LIMITS = {
  /** Per user, per tracker. Beyond this the grid needs virtualization. */
  maxRows: 2000,
  /** Rows per save request. The importer chunks to this. */
  maxRowsPerRequest: 300,
  /** Import chunk size — comfortably under maxRowsPerRequest. */
  importChunkSize: 200,
  /** Request body cap, enforced from content-length before parsing. */
  maxBodyBytes: 1_000_000,
  /**
   * sendBeacon silently fails above ~64KB and returns false. Stay under it and
   * check the return value — this is the likeliest source of a rare
   * "my last edit vanished" report.
   */
  maxBeaconBytes: 60_000,
} as const;
