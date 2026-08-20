/**
 * FOUNDER TRACKERS — reading a real .xlsx, with no dependency.
 *
 * An .xlsx is a ZIP of XML. Browsers ship DecompressionStream('deflate-raw')
 * and DOMParser, which is everything needed to open one, so "just upload the
 * Excel file" does not have to cost a library.
 *
 * Scope, deliberately: read-only, first worksheet, values only. No styles, no
 * formulas beyond their cached result, no charts. That is all an import needs.
 *
 * Not supported, and reported as a clear message rather than a silent failure:
 * password-protected workbooks, ZIP64 (>65535 entries), and the legacy .xls
 * binary format, which is not a ZIP at all.
 */

// =============================================================================
// ZIP
// =============================================================================

interface ZipEntry {
  name: string;
  compression: number;
  compressedSize: number;
  localHeaderOffset: number;
}

const EOCD_SIG = 0x06054b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;

function findEocd(view: DataView): number {
  // The end-of-central-directory record sits at the tail, after a comment of
  // up to 64KB. Scan backwards for its signature.
  const min = Math.max(0, view.byteLength - 65_557);
  for (let i = view.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) return i;
  }
  return -1;
}

function readCentralDirectory(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEocd(view);
  if (eocd < 0) throw new Error('not-a-zip');

  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  if (offset === 0xffffffff) throw new Error('zip64');

  const entries: ZipEntry[] = [];
  const decoder = new TextDecoder('utf-8');

  for (let i = 0; i < count; i++) {
    if (view.getUint32(offset, true) !== CENTRAL_SIG) break;
    const compression = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLen));

    entries.push({ name, compression, compressedSize, localHeaderOffset });
    offset += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

async function inflate(raw: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([raw as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

async function readEntry(bytes: Uint8Array, entry: ZipEntry): Promise<string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const off = entry.localHeaderOffset;
  if (view.getUint32(off, true) !== LOCAL_SIG) throw new Error('bad-entry');

  const nameLen = view.getUint16(off + 26, true);
  const extraLen = view.getUint16(off + 28, true);
  const start = off + 30 + nameLen + extraLen;
  const raw = bytes.subarray(start, start + entry.compressedSize);

  const out =
    entry.compression === 0
      ? raw
      : entry.compression === 8
        ? await inflate(raw)
        : (() => {
            throw new Error('unsupported-compression');
          })();

  return new TextDecoder('utf-8').decode(out);
}

// =============================================================================
// SHEET XML
// =============================================================================

/** "BC7" -> 54 (zero-based column index). */
function columnIndex(ref: string): number {
  const letters = ref.replace(/[0-9]/g, '');
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64);
  }
  return n - 1;
}

function textOf(el: Element | null): string {
  if (!el) return '';
  // <t> may be split across <r> runs when a cell has mixed formatting.
  const parts = el.getElementsByTagName('t');
  if (parts.length) {
    let s = '';
    for (let i = 0; i < parts.length; i++) s += parts[i].textContent ?? '';
    return s;
  }
  return el.textContent ?? '';
}

function parseSharedStrings(xml: string): string[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const items = doc.getElementsByTagName('si');
  const out: string[] = [];
  for (let i = 0; i < items.length; i++) out.push(textOf(items[i]));
  return out;
}

function parseSheet(xml: string, shared: string[]): string[][] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const rows = doc.getElementsByTagName('row');
  const grid: string[][] = [];

  for (let r = 0; r < rows.length; r++) {
    const cells = rows[r].getElementsByTagName('c');
    const line: string[] = [];

    for (let c = 0; c < cells.length; c++) {
      const cell = cells[c];
      const ref = cell.getAttribute('r') ?? '';
      const type = cell.getAttribute('t');
      const at = ref ? columnIndex(ref) : line.length;

      let value = '';
      if (type === 's') {
        const idx = Number(cell.getElementsByTagName('v')[0]?.textContent ?? '-1');
        value = shared[idx] ?? '';
      } else if (type === 'inlineStr') {
        value = textOf(cell.getElementsByTagName('is')[0] ?? null);
      } else {
        // Numbers, dates (as serials) and cached formula results all land here.
        value = cell.getElementsByTagName('v')[0]?.textContent ?? '';
      }

      // Excel omits empty cells entirely, so pad to the real column position.
      while (line.length < at) line.push('');
      line[at] = value;
    }

    grid.push(line);
  }

  // Drop fully-empty rows, matching the CSV/TSV parser's behaviour.
  return grid.filter((row) => row.some((cell) => cell.trim() !== ''));
}

// =============================================================================
// PUBLIC
// =============================================================================

export type XlsxError =
  | 'not-a-zip'
  | 'zip64'
  | 'unsupported-compression'
  | 'no-sheet'
  | 'bad-entry';

export interface XlsxResult {
  grid: string[][];
  /** Name of the sheet that was read, when the workbook names it. */
  sheetName: string | null;
  /** How many sheets the workbook has — used to warn that only the first is read. */
  sheetCount: number;
}

export function xlsxErrorMessage(code: string): string {
  switch (code) {
    case 'not-a-zip':
      return 'הקובץ אינו קובץ אקסל תקין. אם זה קובץ .xls ישן — פתחו אותו באקסל ושמרו כ-.xlsx.';
    case 'zip64':
      return 'הקובץ גדול מדי לקריאה בדפדפן. שמרו את הגיליון כ-CSV ונסו שוב.';
    case 'unsupported-compression':
      return 'הקובץ מוגן בסיסמה או דחוס בשיטה לא נתמכת.';
    case 'no-sheet':
      return 'לא נמצא גיליון בקובץ.';
    default:
      return 'לא הצלחנו לקרוא את הקובץ. נסו להעתיק את הטבלה ולהדביק כאן.';
  }
}

/** Reads the first worksheet of an .xlsx into a grid of strings. */
export async function readXlsx(buffer: ArrayBuffer): Promise<XlsxResult> {
  const bytes = new Uint8Array(buffer);
  const entries = readCentralDirectory(bytes);

  const sheets = entries
    .filter((e) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

  if (!sheets.length) throw new Error('no-sheet');

  const sharedEntry = entries.find((e) => e.name === 'xl/sharedStrings.xml');
  const shared = sharedEntry ? parseSharedStrings(await readEntry(bytes, sharedEntry)) : [];

  const grid = parseSheet(await readEntry(bytes, sheets[0]), shared);

  // The workbook lists sheet names in document order, which matches sheet1.xml
  // closely enough to label the preview.
  let sheetName: string | null = null;
  const workbook = entries.find((e) => e.name === 'xl/workbook.xml');
  if (workbook) {
    try {
      const doc = new DOMParser().parseFromString(await readEntry(bytes, workbook), 'application/xml');
      sheetName = doc.getElementsByTagName('sheet')[0]?.getAttribute('name') ?? null;
    } catch {
      /* the grid is what matters; a missing label is not an error */
    }
  }

  return { grid, sheetName, sheetCount: sheets.length };
}

export function isXlsxFile(file: File): boolean {
  return /\.xlsx$/i.test(file.name);
}

export function isLegacyXls(file: File): boolean {
  return /\.xls$/i.test(file.name);
}
