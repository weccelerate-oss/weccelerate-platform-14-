/**
 * Read-only export of Google Search Console data for weccelerate.co.il.
 *
 *   npx tsx --env-file=.env.youtube.local scripts/seo/gsc-export.ts [days=90]
 *
 * Reuses the OAuth "Desktop app" client from scripts/youtube (same
 * .env.youtube.local), with the read-only `webmasters.readonly` scope and its
 * own cached token. The Cloud project needs "Google Search Console API"
 * enabled. Writes JSON (queries, pages, page×query) outside the repo to
 * ~/Documents/weccelerate-private/gsc/ for analysis.
 */

import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { exec } from 'node:child_process';
import { google } from 'googleapis';

const OUT_DIR = path.join(os.homedir(), 'Documents', 'weccelerate-private', 'gsc');
const TOKEN = path.join(OUT_DIR, 'oauth-token.json');
const PORT = 53683;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const DAYS = Number(process.argv[2]) || 90;

async function authorize() {
  const id = process.env.YT_OAUTH_CLIENT_ID;
  const secret = process.env.YT_OAUTH_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Missing YT_OAUTH_CLIENT_ID / YT_OAUTH_CLIENT_SECRET');
  const client = new google.auth.OAuth2(id, secret, REDIRECT);
  if (fs.existsSync(TOKEN)) {
    client.setCredentials(JSON.parse(fs.readFileSync(TOKEN, 'utf8')));
    return client;
  }
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/webmasters.readonly'],
    login_hint: process.env.GSC_LOGIN_HINT || 'weccelerate@gmail.com',
  });
  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url || '/', REDIRECT);
      const c = u.searchParams.get('code');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(c ? '<p dir="rtl">אפשר לסגור את החלון.</p>' : '<p>No code.</p>');
      server.close();
      if (c) resolve(c);
      else reject(new Error(u.searchParams.get('error') || 'no code'));
    });
    server.listen(PORT, '127.0.0.1', () => {
      console.log('Sign in:\n' + url + '\n');
      if (process.env.GSC_NO_OPEN !== '1') exec(process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`);
    });
  });
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(TOKEN, JSON.stringify(tokens), 'utf8');
  return client;
}

async function main() {
  const auth = await authorize();
  const sc = google.searchconsole({ version: 'v1', auth });

  const sites = (await sc.sites.list()).data.siteEntry ?? [];
  console.log('Properties:', sites.map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(', ') || 'none');
  const site =
    sites.find((s) => s.siteUrl === 'sc-domain:weccelerate.co.il')?.siteUrl ??
    sites.find((s) => s.siteUrl?.includes('weccelerate.co.il'))?.siteUrl;
  if (!site) throw new Error('No Search Console property for weccelerate.co.il on this account');

  const end = new Date(Date.now() - 2 * 86_400_000);
  const start = new Date(end.getTime() - DAYS * 86_400_000);
  const d = (x: Date) => x.toISOString().slice(0, 10);

  const query = async (dimensions: string[], rowLimit = 25_000) => {
    const rows: unknown[] = [];
    for (let startRow = 0; ; startRow += rowLimit) {
      const r = await sc.searchanalytics.query({
        siteUrl: site,
        requestBody: { startDate: d(start), endDate: d(end), dimensions, rowLimit, startRow, dataState: 'final' },
      });
      const got = r.data.rows ?? [];
      rows.push(...got);
      if (got.length < rowLimit) break;
    }
    return rows;
  };

  const [queries, pages, pageQuery, daily] = await Promise.all([
    query(['query']),
    query(['page']),
    query(['page', 'query']),
    query(['date']),
  ]);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `gsc-${d(new Date())}-${DAYS}d.json`);
  fs.writeFileSync(file, JSON.stringify({ site, startDate: d(start), endDate: d(end), queries, pages, pageQuery, daily }), 'utf8');
  console.log(`${site} ${d(start)}..${d(end)}: ${queries.length} queries, ${pages.length} pages, ${pageQuery.length} page×query rows`);
  console.log('Saved:', file);
}

main().catch((e) => {
  console.error(e?.response?.data?.error?.message || e?.message || e);
  process.exit(1);
});
