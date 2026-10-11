/**
 * Adds the lead link + site links to every WeCcelerate YouTube description.
 *
 *   npx tsx --env-file=.env.youtube scripts/youtube/update-descriptions.ts            # dry run, writes a preview
 *   npx tsx --env-file=.env.youtube scripts/youtube/update-descriptions.ts --apply    # writes to YouTube
 *   ... --apply --limit 3                                                              # try on 3 videos first
 *   ... --rollback <backup.json>                                                       # restore the originals
 *
 * Source of truth for the links is docs/youtube-descriptions.csv (one row per
 * video: landing page + UTM campaign). The ORIGINAL description is kept: the
 * new one is   CTA block  +  original text  +  site/about block.
 * A video whose description already links to weccelerate.co.il/lp/ is skipped,
 * so the script is safe to run twice.
 *
 * Auth: YouTube API keys are read-only, so this needs an OAuth "Desktop app"
 * client (Google Cloud console → APIs & Services → Credentials) in the same
 * project that has YouTube Data API v3 enabled. Put its id/secret in
 * .env.youtube as YT_OAUTH_CLIENT_ID / YT_OAUTH_CLIENT_SECRET. The script opens
 * a browser; sign in with the account that owns the channel.
 *
 * Quota: videos.update costs 50 units, the daily quota is 10,000 — about 190
 * updates a day, enough for the whole channel in one run.
 *
 * Every --apply first writes the original snippets to a backup file outside
 * the repo (BACKUP_DIR), which --rollback reads.
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { exec } from 'node:child_process';
import { google, type youtube_v3 } from 'googleapis';

const CSV_PATH = path.join(process.cwd(), 'docs', 'youtube-descriptions.csv');
const BACKUP_DIR =
  process.env.YT_BACKUP_DIR || path.join(os.homedir(), 'Documents', 'weccelerate-private', 'youtube');
const PORT = 53682;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const MAX_DESC = 4900; // YouTube's limit is 5000 bytes-ish; leave headroom
const ALREADY_DONE = /weccelerate\.co\.il\/lp\//;

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const ROLLBACK = args.includes('--rollback') ? args[args.indexOf('--rollback') + 1] : null;
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;

// ---------------------------------------------------------------------------
// CSV (RFC 4180: quoted fields, "" escapes, newlines inside quotes)
// ---------------------------------------------------------------------------

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

interface Plan {
  videoId: string;
  cta: string;   // "יש לכם רעיון..." + lp link
  about: string; // brand line + guides link
}

function loadPlans(): Map<string, Plan> {
  const [header, ...rows] = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const col = (name: string) => header.indexOf(name);
  const plans = new Map<string, Plan>();
  for (const r of rows) {
    const videoId = (r[col('youtube')] || '').match(/[?&]v=([\w-]{11})/)?.[1];
    if (!videoId) continue;
    const lines = (r[col('new_description')] || '').split('\n');
    const ctaAt = lines.findIndex((l) => l.startsWith('יש לכם רעיון'));
    const aboutAt = lines.findIndex((l) => l.startsWith('WeCcelerate ('));
    if (ctaAt < 0 || aboutAt < 0) continue;
    plans.set(videoId, {
      videoId,
      cta: lines.slice(ctaAt, ctaAt + 2).join('\n'),
      about: lines.slice(aboutAt).join('\n').trim(),
    });
  }
  return plans;
}

function buildDescription(original: string, plan: Plan): string {
  // Short /v/{id} link — the Hebrew /videos slug shows up percent-encoded on YouTube.
  const site = `\n\nהסרטון ומדריכים נוספים בנושא באתר:\nhttps://weccelerate.co.il/v/${plan.videoId}?utm_source=youtube&utm_medium=video-page`;
  const tail = `${site}\n\n${plan.about}`;
  let body = original.trim();
  const room = MAX_DESC - plan.cta.length - tail.length - 4;
  if (body.length > room) body = body.slice(0, Math.max(0, room - 1)).trimEnd() + '…';
  // YouTube rejects angle brackets in descriptions.
  return `${plan.cta}\n\n${body}${tail}`.replace(/[<>]/g, '');
}

// ---------------------------------------------------------------------------
// OAuth (loopback redirect)
// ---------------------------------------------------------------------------

async function authorize() {
  const id = process.env.YT_OAUTH_CLIENT_ID;
  const secret = process.env.YT_OAUTH_CLIENT_SECRET;
  if (!id || !secret) {
    console.error('Missing YT_OAUTH_CLIENT_ID / YT_OAUTH_CLIENT_SECRET (see header of this file).');
    process.exit(1);
  }
  const client = new google.auth.OAuth2(id, secret, REDIRECT);
  const url = client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/youtube.force-ssl'], prompt: 'consent' });

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url || '/', REDIRECT);
      const c = u.searchParams.get('code');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(c ? '<p dir="rtl">אפשר לסגור את החלון ולחזור לטרמינל.</p>' : '<p>No code.</p>');
      server.close();
      if (c) resolve(c);
      else reject(new Error(u.searchParams.get('error') || 'no code'));
    });
    server.listen(PORT, '127.0.0.1', () => {
      console.log('\nOpening the browser for Google sign-in (use the account that owns the channel).');
      console.log('If it does not open, paste this URL:\n' + url + '\n');
      const opener = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
      exec(opener);
    });
  });

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  return google.youtube({ version: 'v3', auth: client });
}

// ---------------------------------------------------------------------------

async function fetchSnippets(yt: youtube_v3.Youtube, ids: string[]) {
  const out = new Map<string, youtube_v3.Schema$VideoSnippet>();
  for (let i = 0; i < ids.length; i += 50) {
    const r = await yt.videos.list({ part: ['snippet'], id: ids.slice(i, i + 50), maxResults: 50 });
    for (const v of r.data.items ?? []) if (v.id && v.snippet) out.set(v.id, v.snippet);
  }
  return out;
}

async function updateDescription(yt: youtube_v3.Youtube, id: string, snip: youtube_v3.Schema$VideoSnippet, description: string) {
  await yt.videos.update({
    part: ['snippet'],
    requestBody: {
      id,
      snippet: {
        title: snip.title,
        categoryId: snip.categoryId,
        description,
        tags: snip.tags,
        defaultLanguage: snip.defaultLanguage,
        defaultAudioLanguage: snip.defaultAudioLanguage,
      },
    },
  });
}

async function main() {
  if (ROLLBACK) {
    const backup: Array<{ id: string; description: string }> = JSON.parse(fs.readFileSync(ROLLBACK, 'utf8'));
    const yt = await authorize();
    const snips = await fetchSnippets(yt, backup.map((b) => b.id));
    let n = 0;
    for (const b of backup) {
      const s = snips.get(b.id);
      if (!s) continue;
      await updateDescription(yt, b.id, s, b.description);
      console.log(`restored ${b.id}`); n++;
    }
    console.log(`\nRestored ${n} descriptions.`);
    return;
  }

  const plans = loadPlans();
  console.log(`${plans.size} videos in ${path.relative(process.cwd(), CSV_PATH)}`);

  const yt = await authorize();
  const snips = await fetchSnippets(yt, [...plans.keys()]);
  console.log(`${snips.size} found on YouTube`);

  const todo: Array<{ id: string; title: string; before: string; after: string; snip: youtube_v3.Schema$VideoSnippet }> = [];
  let skipped = 0;
  for (const [id, plan] of plans) {
    const snip = snips.get(id);
    if (!snip) continue;
    const before = snip.description ?? '';
    if (ALREADY_DONE.test(before)) { skipped++; continue; }
    todo.push({ id, title: snip.title ?? '', before, after: buildDescription(before, plan), snip });
  }
  const batch = todo.slice(0, LIMIT);
  console.log(`${todo.length} to update, ${skipped} already have the link${batch.length < todo.length ? `, running ${batch.length}` : ''}`);

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (!APPLY) {
    const preview = path.join(BACKUP_DIR, `preview-${stamp}.txt`);
    fs.writeFileSync(
      preview,
      batch.map((t) => `=== ${t.title} (${t.id})\n--- BEFORE\n${t.before}\n--- AFTER\n${t.after}\n`).join('\n'),
      'utf8',
    );
    console.log(`\nDry run. Preview: ${preview}\nRun again with --apply to write to YouTube.`);
    return;
  }

  const backupPath = path.join(BACKUP_DIR, `backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(batch.map((t) => ({ id: t.id, title: t.title, description: t.before })), null, 2), 'utf8');
  console.log(`Backup of originals: ${backupPath}`);

  let ok = 0;
  for (const t of batch) {
    try {
      await updateDescription(yt, t.id, t.snip, t.after);
      ok++;
      console.log(`✓ ${t.id} ${t.title.slice(0, 60)}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`✗ ${t.id} ${msg}`);
      if (/quota/i.test(msg)) { console.error('Daily quota reached — run again tomorrow; done videos are skipped.'); break; }
    }
  }
  console.log(`\nUpdated ${ok}/${batch.length}. Undo with: --rollback "${backupPath}"`);
}

main().catch((e) => { console.error(e); process.exit(1); });
