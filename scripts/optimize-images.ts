/**
 * Compress and resize all images in /public in-place, and emit .webp siblings
 * next to each. Run manually before a deploy:
 *
 *   npx tsx scripts/optimize-images.ts
 *
 * - JPEGs: resize to <=2000px wide, re-encode at quality 80 (mozjpeg).
 * - PNGs:  resize to <=2000px wide, re-encode with palette+compression.
 * - Always writes a .webp sibling at quality 82 for browsers that support it.
 * - Skips files already smaller than MIN_SIZE_BYTES (cheap to serve as-is).
 * - SVGs, GIFs, and existing webp/avif files are left untouched.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MAX_WIDTH = 2000;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const WEBP_QUALITY = 82;
const MIN_SIZE_BYTES = 150 * 1024; // skip anything under 150KB

type Stats = { processed: number; skipped: number; savedBytes: number };

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function optimizeOne(file: string, stats: Stats) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const original = await fs.stat(file);
  if (original.size < MIN_SIZE_BYTES) {
    stats.skipped++;
    return;
  }

  const buf = await fs.readFile(file);
  let img = sharp(buf, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  if (meta.width && meta.width > MAX_WIDTH) {
    img = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const pipeline = ext === '.png'
    ? img.clone().png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true })
    : img.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });

  const [optimizedBuf, webpBuf] = await Promise.all([
    pipeline.toBuffer(),
    img.clone().webp({ quality: WEBP_QUALITY }).toBuffer(),
  ]);

  // Only overwrite the original if we actually saved space.
  if (optimizedBuf.length < original.size) {
    await fs.writeFile(file, optimizedBuf);
    stats.savedBytes += original.size - optimizedBuf.length;
  }
  const webpPath = file.replace(/\.(jpe?g|png)$/i, '.webp');
  await fs.writeFile(webpPath, webpBuf);
  stats.processed++;

  const mb = (original.size / 1024 / 1024).toFixed(2);
  const newMb = (optimizedBuf.length / 1024 / 1024).toFixed(2);
  const webpMb = (webpBuf.length / 1024 / 1024).toFixed(2);
  console.log(`  ${path.relative(PUBLIC_DIR, file)}: ${mb}MB -> ${newMb}MB (webp: ${webpMb}MB)`);
}

async function main() {
  console.log('Scanning', PUBLIC_DIR);
  const all = await walk(PUBLIC_DIR);
  const stats: Stats = { processed: 0, skipped: 0, savedBytes: 0 };

  // Process in small batches so we don't OOM with dozens of 3MB PNGs in flight.
  const BATCH = 4;
  for (let i = 0; i < all.length; i += BATCH) {
    await Promise.all(all.slice(i, i + BATCH).map((f) => optimizeOne(f, stats).catch((e) => {
      console.warn(`  FAIL ${f}:`, (e as Error).message);
    })));
  }

  const savedMB = (stats.savedBytes / 1024 / 1024).toFixed(1);
  console.log(`\nDone. Processed ${stats.processed}, skipped ${stats.skipped}, saved ${savedMB}MB.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
