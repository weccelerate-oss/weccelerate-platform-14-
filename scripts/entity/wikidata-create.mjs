// Create the WeCcelerate item on Wikidata via the MediaWiki API.
// Values are the ones verified in docs/GEO-ENTITY-SETUP.md (2026-09-14).
const API = 'https://www.wikidata.org/w/api.php';
const UA = 'WeCcelerate-entity-setup/1.0 (https://weccelerate.co.il; info@weccelerate.co.il)';
const DRY = process.argv.includes('--dry');

const REG = 'https://www.checkid.co.il/company/%D7%95%D7%95%D7%99%D7%A1%D7%9C%D7%A8%D7%99%D7%99%D7%98-%D7%91%D7%A2~%D7%9E-515962819';
const ABOUT = 'https://weccelerate.co.il/about';

const ref = (url) => [{ snaks: { P854: [{ snaktype: 'value', property: 'P854', datavalue: { type: 'string', value: url } }] } }];
const item = (prop, qid, r) => ({ mainsnak: { snaktype: 'value', property: prop, datavalue: { type: 'wikibase-entityid', value: { 'entity-type': 'item', 'numeric-id': Number(qid.slice(1)) } } }, type: 'statement', rank: 'normal', ...(r ? { references: ref(r) } : {}) });
const str = (prop, value, r) => ({ mainsnak: { snaktype: 'value', property: prop, datavalue: { type: 'string', value } }, type: 'statement', rank: 'normal', ...(r ? { references: ref(r) } : {}) });
const mono = (prop, text, language) => ({ mainsnak: { snaktype: 'value', property: prop, datavalue: { type: 'monolingualtext', value: { text, language } } }, type: 'statement', rank: 'normal' });
const time = (prop, iso, precision, r) => ({ mainsnak: { snaktype: 'value', property: prop, datavalue: { type: 'time', value: { time: iso, timezone: 0, before: 0, after: 0, precision, calendarmodel: 'http://www.wikidata.org/entity/Q1985727' } } }, type: 'statement', rank: 'normal', ...(r ? { references: ref(r) } : {}) });

const data = {
  labels: { en: { language: 'en', value: 'WeCcelerate' }, he: { language: 'he', value: 'וויסלרייט' } },
  descriptions: { en: { language: 'en', value: 'Israeli venture builder and startup accelerator' }, he: { language: 'he', value: 'בונה מיזמים ומאיץ סטארטאפים ישראלי' } },
  aliases: {
    he: [{ language: 'he', value: 'וויסלרייט בע״מ' }],
    en: [{ language: 'en', value: 'WeCcelerate Ltd.' }, { language: 'en', value: 'Weccelerate' }, { language: 'en', value: 'We Accelerate' }],
  },
  claims: {
    P31: [item('P31', 'Q4830453', REG)],
    P17: [item('P17', 'Q801')],
    P10889: [str('P10889', '515962819', REG)],
    P571: [time('P571', '+2018-00-00T00:00:00Z', 9, ABOUT)],
    P159: [item('P159', 'Q33935')],
    P856: [str('P856', 'https://weccelerate.co.il')],
    P1448: [mono('P1448', 'וויסלרייט בע״מ', 'he')],
    P4264: [str('P4264', 'weccelerate')],
    P2013: [str('P2013', 'weccelerate')],
  },
};

async function call(params, cookie) {
  const body = new URLSearchParams({ format: 'json', ...params });
  const res = await fetch(API, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}) }, body });
  const setCookie = res.headers.get('set-cookie') || '';
  return { json: await res.json(), setCookie };
}

// 1. token (anonymous session)
const t = await call({ action: 'query', meta: 'tokens', type: 'csrf' });
const cookie = t.setCookie.split(/,(?=[^ ;]+=)/).map((c) => c.split(';')[0]).join('; ');
const token = t.json?.query?.tokens?.csrftoken;
console.log('token:', token === '+\\' ? 'anonymous (+\\)' : token ? 'session token' : 'NONE', '| cookies:', cookie ? 'yes' : 'no');

if (DRY) { console.log('DRY RUN — payload:', JSON.stringify(data).length, 'bytes'); process.exit(0); }

// 2. create
const r = await call({ action: 'wbeditentity', new: 'item', token, summary: 'Create item for WeCcelerate Ltd. (Israeli company no. 515962819) with registry and press references', data: JSON.stringify(data) }, cookie);
if (r.json.error) { console.log('ERROR:', JSON.stringify(r.json.error).slice(0, 600)); process.exit(1); }
console.log('CREATED:', r.json.entity?.id, '| claims:', Object.keys(r.json.entity?.claims || {}).join(','), '| https://www.wikidata.org/wiki/' + r.json.entity?.id);
