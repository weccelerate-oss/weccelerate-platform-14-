/**
 * Re-engagement list: open or lost Pipedrive deals from the last N months
 * that never became customers, with a usable Israeli phone number.
 *
 * Writes a CSV OUTSIDE the repo (personal data) and prints counts only.
 * Nothing is sent to anyone — the owner reviews the list and approves the
 * message before any outreach.
 *
 * Usage:
 *   npx tsx scripts/pipedrive/export-reengage.ts --env=<env file> --out=<csv path> [--months=12]
 */

import fs from 'fs';
import { config } from 'dotenv';

const arg = (name: string, fallback = ''): string => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

config({ path: arg('env', '.env.local') });
const OUT = arg('out', '');
const MONTHS = Number(arg('months', '12')) || 12;
if (!OUT) { console.error('missing --out=<csv path>'); process.exit(1); }

const token = encodeURIComponent((process.env.PIPEDRIVE_API_TOKEN || '').trim());
if (!token) { console.error('PIPEDRIVE_API_TOKEN missing in env file'); process.exit(1); }

interface Deal {
  id: number; title: string; status: string; add_time: string; update_time: string; stage_id: number;
  person_id?: { name?: string; email?: Array<{ value: string }>; phone?: Array<{ value: string }> } | null;
  [k: string]: unknown;
}

async function pd(path: string) {
  const r = await fetch(`https://api.pipedrive.com/v1${path}${path.includes('?') ? '&' : '?'}api_token=${token}`);
  return r.json() as Promise<{ data?: unknown; additional_data?: { pagination?: { more_items_in_collection?: boolean; next_start?: number } } }>;
}

function normalizePhone(p: string): string | null {
  const d = p.replace(/\D/g, '');
  if (d.startsWith('972') && d.length === 12) return `0${d.slice(3)}`;
  if (d.startsWith('0') && d.length === 10 && d[1] === '5') return d;
  return null;
}

async function main() {
  const since = new Date(); since.setMonth(since.getMonth() - MONTHS);
  const fields = (await pd('/dealFields')).data as Array<{ key: string; name: string }>;
  const adKey = fields.find((f) => f.name === 'מודעה')?.key;
  const rows: Array<Record<string, string>> = [];
  const seenPhones = new Set<string>();
  let start = 0, scanned = 0, stopped = false;
  const stageNames: Record<number, string> = {};
  for (const s of ((await pd('/stages')).data as Array<{ id: number; name: string }>) || []) stageNames[s.id] = s.name;

  while (!stopped) {
    const j = await pd(`/deals?status=all_not_deleted&sort=add_time%20DESC&limit=500&start=${start}`);
    const deals = (j.data as Deal[]) || [];
    for (const d of deals) {
      const t = new Date(d.add_time.replace(' ', 'T') + 'Z');
      if (t < since) { stopped = true; break; }
      scanned += 1;
      if (d.status === 'won') continue;
      const phones = d.person_id?.phone?.map((p) => p.value).filter(Boolean) ?? [];
      const phone = phones.map(normalizePhone).find(Boolean) as string | undefined;
      if (!phone || seenPhones.has(phone)) continue;
      seenPhones.add(phone);
      const ageDays = Math.round((Date.now() - t.getTime()) / 86_400_000);
      if (d.status === 'open' && ageDays < 30) continue; // still being worked
      rows.push({
        deal_id: String(d.id),
        name: d.person_id?.name || d.title,
        phone,
        email: d.person_id?.email?.[0]?.value || '',
        status: d.status,
        stage: stageNames[d.stage_id] || String(d.stage_id),
        created: d.add_time.slice(0, 10),
        age_days: String(ageDays),
        source: adKey ? String(d[adKey] ?? '') : '',
      });
    }
    if (!j.additional_data?.pagination?.more_items_in_collection) break;
    start = j.additional_data.pagination.next_start ?? start + 500;
  }

  const header = ['deal_id', 'name', 'phone', 'email', 'status', 'stage', 'created', 'age_days', 'source'];
  const csv = '﻿' + [header.join(','), ...rows.map((r) => header.map((h) => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\r\n');
  fs.writeFileSync(OUT, csv, 'utf8');
  const byStatus: Record<string, number> = {};
  for (const r of rows) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  const bySource: Record<string, number> = {};
  for (const r of rows) bySource[r.source || '—'] = (bySource[r.source || '—'] || 0) + 1;
  console.log(`scanned ${scanned} deals from the last ${MONTHS} months → ${rows.length} unique phones eligible`);
  console.log('by status:', JSON.stringify(byStatus));
  console.log('top sources:', JSON.stringify(Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 8)));
  console.log('csv:', OUT);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
