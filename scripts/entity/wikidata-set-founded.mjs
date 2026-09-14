// Set the inception year (P571) on the WeCcelerate item to 2016.
// Usage: node scripts/entity/wikidata-set-founded.mjs        (anonymous edit)
//        node scripts/entity/wikidata-set-founded.mjs --dry  (show current value only)
const API = 'https://www.wikidata.org/w/api.php';
const UA = 'WeCcelerate-entity-setup/1.0 (https://weccelerate.co.il; info@weccelerate.co.il)';
const QID = 'Q141451357';
const YEAR = '+2016-00-00T00:00:00Z';
const DRY = process.argv.includes('--dry');

async function call(params, cookie) {
  const res = await fetch(API, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}) }, body: new URLSearchParams({ format: 'json', ...params }) });
  return { json: await res.json(), setCookie: res.headers.get('set-cookie') || '' };
}

const claims = await call({ action: 'wbgetclaims', entity: QID, property: 'P571' });
const claim = claims.json?.claims?.P571?.[0];
if (!claim) { console.log('no P571 claim on', QID); process.exit(1); }
console.log('current P571:', claim.mainsnak.datavalue.value.time, '| claim id:', claim.id);
if (claim.mainsnak.datavalue.value.time === YEAR) { console.log('already 2016 — nothing to do'); process.exit(0); }
if (DRY) process.exit(0);

const t = await call({ action: 'query', meta: 'tokens', type: 'csrf' });
const cookie = t.setCookie.split(/,(?=[^ ;]+=)/).map((c) => c.split(';')[0]).join('; ');
const token = t.json?.query?.tokens?.csrftoken;
const value = JSON.stringify({ time: YEAR, timezone: 0, before: 0, after: 0, precision: 9, calendarmodel: 'http://www.wikidata.org/entity/Q1985727' });
const r = await call({ action: 'wbsetclaimvalue', claim: claim.id, snaktype: 'value', value, token, summary: 'Correct inception year to 2016 (company statement; LinkedIn and the official site agree)' }, cookie);
if (r.json.error) { console.log('ERROR:', JSON.stringify(r.json.error).slice(0, 400)); process.exit(1); }
console.log('UPDATED P571 ->', r.json.claim?.mainsnak?.datavalue?.value?.time, '| https://www.wikidata.org/wiki/' + QID);
