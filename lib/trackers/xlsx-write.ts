/**
 * FOUNDER TRACKERS — writing a styled .xlsx, with no dependency.
 *
 * CSV loses everything: leading zeros in phone numbers, column widths, the
 * right-to-left sheet direction, and any notion of a summary. This writes a
 * real workbook instead — gold header, frozen and filtered header row, sized
 * columns, dates as real dates, phones as text, and a summary block built from
 * live formulas so the counts keep working after the founder edits the file.
 *
 * A .xlsx is a ZIP of XML. Entries are written STORED (uncompressed), which is
 * perfectly legal and removes the need for CompressionStream — the files are a
 * few hundred KB at worst.
 */

import { TRACKERS, type TrackerSlug } from '@/lib/trackers/schema';

// =============================================================================
// ZIP WRITER
// =============================================================================

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

interface PendingEntry {
  name: string;
  bytes: Uint8Array;
  crc: number;
  offset: number;
}

function writeUint32(arr: number[], value: number) {
  arr.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}
function writeUint16(arr: number[], value: number) {
  arr.push(value & 0xff, (value >>> 8) & 0xff);
}

function buildZip(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const entries: PendingEntry[] = [];
  let offset = 0;

  for (const file of files) {
    const bytes = encoder.encode(file.content);
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(bytes);

    const header: number[] = [];
    writeUint32(header, 0x04034b50);
    writeUint16(header, 20); // version needed
    writeUint16(header, 0x0800); // UTF-8 filename flag
    writeUint16(header, 0); // stored
    writeUint16(header, 0); // mod time
    writeUint16(header, 0); // mod date
    writeUint32(header, crc);
    writeUint32(header, bytes.length);
    writeUint32(header, bytes.length);
    writeUint16(header, nameBytes.length);
    writeUint16(header, 0);

    const headerBytes = new Uint8Array(header);
    chunks.push(headerBytes, nameBytes, bytes);
    entries.push({ name: file.name, bytes, crc, offset });
    offset += headerBytes.length + nameBytes.length + bytes.length;
  }

  const centralStart = offset;
  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const central: number[] = [];
    writeUint32(central, 0x02014b50);
    writeUint16(central, 20); // version made by
    writeUint16(central, 20); // version needed
    writeUint16(central, 0x0800);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint16(central, 0);
    writeUint32(central, entry.crc);
    writeUint32(central, entry.bytes.length);
    writeUint32(central, entry.bytes.length);
    writeUint16(central, nameBytes.length);
    writeUint16(central, 0); // extra
    writeUint16(central, 0); // comment
    writeUint16(central, 0); // disk
    writeUint16(central, 0); // internal attrs
    writeUint32(central, 0); // external attrs
    writeUint32(central, entry.offset);

    const centralBytes = new Uint8Array(central);
    chunks.push(centralBytes, nameBytes);
    offset += centralBytes.length + nameBytes.length;
  }

  const eocd: number[] = [];
  writeUint32(eocd, 0x06054b50);
  writeUint16(eocd, 0);
  writeUint16(eocd, 0);
  writeUint16(eocd, entries.length);
  writeUint16(eocd, entries.length);
  writeUint32(eocd, offset - centralStart);
  writeUint32(eocd, centralStart);
  writeUint16(eocd, 0);
  chunks.push(new Uint8Array(eocd));

  return new Blob(chunks as unknown as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// =============================================================================
// XML HELPERS
// =============================================================================

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Control characters are illegal in XML 1.0 and will make Excel refuse the file.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function colLetter(index: number): string {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** 'YYYY-MM-DD' -> Excel serial. 25569 is 1970-01-01 in Excel's epoch. */
function toSerial(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const ms = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return Math.round(ms / 86_400_000) + 25569;
}

// =============================================================================
// STYLES
// =============================================================================
//
// s= indices used below:
//   0 default
//   1 gold header (bold, dark on #C8A951, centred, bordered)
//   2 body text
//   3 body text, forced text format (phones — keeps the leading zero)
//   4 date, dd/mm/yyyy
//   5 title (large, gold text)
//   6 summary label (bold)
//   7 summary value (bold, gold background)

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="@"/></numFmts>
<fonts count="5">
<font><sz val="11"/><name val="Arial"/></font>
<font><b/><sz val="11"/><color rgb="FF1D1704"/><name val="Arial"/></font>
<font><sz val="11"/><color rgb="FF1F2937"/><name val="Arial"/></font>
<font><b/><sz val="16"/><color rgb="FF8A6D1F"/><name val="Arial"/></font>
<font><b/><sz val="11"/><color rgb="FF1F2937"/><name val="Arial"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFC8A951"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF7EFD8"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFD9C68A"/></left><right style="thin"><color rgb="FFD9C68A"/></right><top style="thin"><color rgb="FFD9C68A"/></top><bottom style="thin"><color rgb="FFD9C68A"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="8">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1" readingOrder="2"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1" readingOrder="2"/></xf>
<xf numFmtId="165" fontId="2" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" readingOrder="1"/></xf>
<xf numFmtId="164" fontId="2" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment readingOrder="2"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment readingOrder="2"/></xf>
<xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" readingOrder="2"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

// =============================================================================
// SHEET
// =============================================================================

interface Cell {
  ref: string;
  style: number;
  value?: string | number;
  type?: 'inlineStr' | 'n';
  formula?: string;
}

function cellXml(cell: Cell): string {
  const t = cell.type === 'inlineStr' ? ' t="inlineStr"' : '';
  if (cell.formula) {
    return `<c r="${cell.ref}" s="${cell.style}"><f>${esc(cell.formula)}</f></c>`;
  }
  if (cell.value === undefined || cell.value === '') {
    return `<c r="${cell.ref}" s="${cell.style}"/>`;
  }
  if (cell.type === 'inlineStr') {
    return `<c r="${cell.ref}" s="${cell.style}"${t}><is><t xml:space="preserve">${esc(cell.value)}</t></is></c>`;
  }
  return `<c r="${cell.ref}" s="${cell.style}"><v>${cell.value}</v></c>`;
}

const HEADER_ROW = 4;

function buildSheet(
  rows: Array<Record<string, unknown>>,
  slug: TrackerSlug,
  generatedOn: string,
): string {
  const def = TRACKERS[slug];
  const columns = def.columns;
  const hasNumberCol = def.showRowNumber;

  const lines: string[] = [];

  // Row 1: title. Row 2: generated-on. Row 3: blank. Row 4: header.
  const lastCol = colLetter((hasNumberCol ? 1 : 0) + columns.length - 1);
  lines.push(
    `<row r="1" ht="26" customHeight="1">${cellXml({ ref: 'A1', style: 5, value: def.title, type: 'inlineStr' })}</row>`,
  );
  lines.push(
    `<row r="2">${cellXml({ ref: 'A2', style: 0, value: `הופק מהפורטל של WeCcelerate · ${generatedOn}`, type: 'inlineStr' })}</row>`,
  );

  const headerCells: string[] = [];
  let c = 0;
  if (hasNumberCol) {
    headerCells.push(
      cellXml({ ref: `${colLetter(c++)}${HEADER_ROW}`, style: 1, value: "מס'", type: 'inlineStr' }),
    );
  }
  for (const col of columns) {
    headerCells.push(
      cellXml({ ref: `${colLetter(c++)}${HEADER_ROW}`, style: 1, value: col.label, type: 'inlineStr' }),
    );
  }
  lines.push(`<row r="${HEADER_ROW}" ht="30" customHeight="1">${headerCells.join('')}</row>`);

  rows.forEach((row, i) => {
    const r = HEADER_ROW + 1 + i;
    const cells: string[] = [];
    let ci = 0;

    if (hasNumberCol) {
      cells.push(cellXml({ ref: `${colLetter(ci++)}${r}`, style: 2, value: i + 1, type: 'n' }));
    }

    for (const col of columns) {
      const ref = `${colLetter(ci++)}${r}`;
      const raw = row[col.key];

      if (col.kind === 'date') {
        const serial = toSerial(String(raw ?? ''));
        cells.push(
          serial === null
            ? cellXml({ ref, style: 4 })
            : cellXml({ ref, style: 4, value: serial, type: 'n' }),
        );
        continue;
      }

      // Phones keep their leading zero only if the cell is text-formatted.
      const style = col.key === 'phone' ? 3 : 2;
      cells.push(cellXml({ ref, style, value: String(raw ?? ''), type: 'inlineStr' }));
    }

    lines.push(`<row r="${r}">${cells.join('')}</row>`);
  });

  // ---- column widths -------------------------------------------------------
  const widths: string[] = [];
  let wi = 1;
  if (hasNumberCol) widths.push(`<col min="${wi}" max="${wi++}" width="6" customWidth="1"/>`);
  for (const col of columns) {
    const width =
      col.kind === 'longtext' ? 46 : col.kind === 'url' ? 30 : col.kind === 'date' ? 16 : 22;
    widths.push(`<col min="${wi}" max="${wi++}" width="${width}" customWidth="1"/>`);
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr>
<sheetViews><sheetView rightToLeft="1" tabSelected="1" workbookViewId="0"><pane ySplit="${HEADER_ROW}" topLeftCell="A${HEADER_ROW + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>
<cols>${widths.join('')}</cols>
<sheetData>${lines.join('')}</sheetData>
<autoFilter ref="A${HEADER_ROW}:${lastCol}${Math.max(HEADER_ROW + 1, HEADER_ROW + rows.length)}"/>
</worksheet>`;
}

/**
 * The summary lives on its own sheet, not under the data.
 *
 * Not cosmetic: a summary block below the table is read back as data rows when
 * the founder re-imports their own export. On a separate sheet the data sheet
 * stays a clean rectangle, and the formulas still point at it so the counts
 * stay live in Excel.
 */
function buildSummarySheet(rowCount: number, slug: TrackerSlug): string {
  const def = TRACKERS[slug];
  const columns = def.columns;
  const offset = def.showRowNumber ? 1 : 0;
  const sheetRef = `'${def.title.replace(/'/g, "''").slice(0, 31)}'`;

  const firstRow = HEADER_ROW + 1;
  const lastRow = Math.max(firstRow, HEADER_ROW + rowCount);

  const nameCol = colLetter(offset);
  const chipKey = slug === 'calls' ? 'relevance' : 'status';
  const chipCol = colLetter(offset + columns.findIndex((c) => c.key === chipKey));
  const chipValues = columns.find((c) => c.key === chipKey)?.suggestions ?? [];
  const dateKey = slug === 'calls' ? 'lastContactAt' : 'lastOutreachAt';
  const dateCol = colLetter(offset + columns.findIndex((c) => c.key === dateKey));

  const range = (col: string) => `${sheetRef}!${col}${firstRow}:${col}${lastRow}`;

  const entries: Array<{ label: string; formula: string; isDate?: boolean }> = [
    { label: `סה״כ ${def.countNoun}`, formula: `COUNTA(${range(nameCol)})` },
    ...chipValues.map((value) => ({
      label: value,
      formula: `COUNTIF(${range(chipCol)},"${value}")`,
    })),
    { label: 'ללא תאריך', formula: `COUNTBLANK(${range(dateCol)})` },
    {
      label: 'התאריך האחרון',
      formula: `IF(COUNT(${range(dateCol)})=0,"",MAX(${range(dateCol)}))`,
      isDate: true,
    },
  ];

  const lines = [
    `<row r="1" ht="26" customHeight="1">${cellXml({ ref: 'A1', style: 5, value: `סיכום · ${def.title}`, type: 'inlineStr' })}</row>`,
  ];

  entries.forEach((entry, i) => {
    const r = 3 + i;
    lines.push(
      `<row r="${r}">${cellXml({ ref: `A${r}`, style: 6, value: entry.label, type: 'inlineStr' })}${cellXml(
        { ref: `B${r}`, style: entry.isDate ? 4 : 7, formula: entry.formula },
      )}</row>`,
    );
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>
<cols><col min="1" max="1" width="26" customWidth="1"/><col min="2" max="2" width="14" customWidth="1"/></cols>
<sheetData>${lines.join('')}</sheetData>
</worksheet>`;
}

// =============================================================================
// PUBLIC
// =============================================================================

export function buildTrackerWorkbook(
  rows: Array<Record<string, unknown>>,
  slug: TrackerSlug,
  generatedOn: string,
): Blob {
  const def = TRACKERS[slug];
  const sheet = buildSheet(rows, slug, generatedOn);
  const summary = buildSummarySheet(rows.length, slug);

  return buildZip([
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${esc(def.title).slice(0, 31)}" sheetId="1" r:id="rId1"/><sheet name="סיכום" sheetId="2" r:id="rId3"/></sheets>
<calcPr calcId="0" fullCalcOnLoad="1"/>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`,
    },
    { name: 'xl/styles.xml', content: STYLES_XML },
    { name: 'xl/worksheets/sheet1.xml', content: sheet },
    { name: 'xl/worksheets/sheet2.xml', content: summary },
  ]);
}

export function xlsxFilename(slug: TrackerSlug, today: string): string {
  return `${TRACKERS[slug].exportName}-${today}.xlsx`;
}
