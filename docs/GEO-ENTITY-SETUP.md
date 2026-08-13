# Entity Setup — the off-site work that actually fixes Google & ChatGPT

Created 2026-08-12. Companion to `MANUAL-ACTIONS-FOR-ALON.md`.

The on-site work is done and is close to exhausted. What remains is off-site,
and it is the part that determines whether an AI engine *knows* WeCcelerate
exists. Everything below is prepared to be pasted — the values are verified
against the Israeli company registry and against Wikidata's own property list.

**Do these in order.** Step 0 is a hard prerequisite: the fixes are currently
only in the working tree, so the live site still serves the old contradictory
data.

---

## Step 0 — Deploy, then push to Bing (prerequisite)

Nothing below matters while production still serves `foundingDate: 2016` and a
sitemap full of dead hosts.

1. Merge and deploy the current branch. (Quit OneDrive first — this repo lives
   inside a synced folder and OneDrive corrupts `.git` mid-operation.)
2. Confirm the live schema actually changed:
   ```bash
   curl -s https://weccelerate.co.il/ | grep -o '"foundingDate":"[^"]*"'   # expect 2018
   curl -s https://weccelerate.co.il/ | grep -o '"value":"515962819"'       # expect a hit
   curl -s https://weccelerate.co.il/sitemap.xml | grep -c 'biz\.weccelerate'  # expect 0
   ```
3. Push the changed URLs to Bing via IndexNow — **this is the one that matters
   for ChatGPT**, because ChatGPT Search is served by Bing's index:
   ```bash
   curl -X POST https://weccelerate.co.il/api/indexnow/submit \
     -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
     -d '{"urls":["https://weccelerate.co.il/","https://weccelerate.co.il/about","https://weccelerate.co.il/team","https://weccelerate.co.il/faq","https://weccelerate.co.il/llms.txt"]}'
   ```
4. In Google Search Console, use URL Inspection → "Request indexing" on the
   homepage. There is no IndexNow for Google.

---

## Step 1 — Wikidata 🔥 highest leverage

This is the single most valuable item on the list. Wikidata is the entity
backbone that search engines and language models read; nothing on your own
domain substitutes for it. It is free and takes about fifteen minutes.

### Before you start — the one real risk

Wikidata's notability policy requires an item to describe a "clearly
identifiable entity" that "can be described using serious and publicly
available references." A registered company with a registry record and national
press coverage qualifies — but items on small companies **do** get nominated for
deletion when they are created bare, with no sources. So add the references in
the same session you create the item. That is what makes it stick.

### Option A — QuickStatements (fastest)

Go to <https://quickstatements.toolforge.org/>, log in with a Wikimedia
account, choose "Import V1 commands", and paste this batch verbatim:

```
CREATE
LAST	Len	"WeCcelerate"
LAST	Den	"Israeli venture builder and startup accelerator"
LAST	Lhe	"וויסלרייט"
LAST	Dhe	"בונה מיזמים ומאיץ סטארטאפים ישראלי"
LAST	Ahe	"וויסלרייט בע״מ"
LAST	Aen	"WeCcelerate Ltd."
LAST	P31	Q4830453	S854	"https://www.checkid.co.il/company/%D7%95%D7%95%D7%99%D7%A1%D7%9C%D7%A8%D7%99%D7%99%D7%98-%D7%91%D7%A2~%D7%9E-515962819"
LAST	P17	Q801
LAST	P10889	"515962819"	S854	"https://www.checkid.co.il/company/%D7%95%D7%95%D7%99%D7%A1%D7%9C%D7%A8%D7%99%D7%99%D7%98-%D7%91%D7%A2~%D7%9E-515962819"
LAST	P571	+2018-00-00T00:00:00Z/9	S854	"https://weccelerate.co.il/about"
LAST	P159	Q33935
LAST	P856	"https://weccelerate.co.il"
LAST	P1448	he:"וויסלרייט בע״מ"
LAST	P4264	"weccelerate"
LAST	P2013	"weccelerate"
```

`Len`/`Den` = English label/description, `Lhe`/`Dhe` = Hebrew, `Ahe`/`Aen` =
alias. `S854` attaches a reference URL to the statement above it.

**The alias lines are the whole point of this exercise** — they are what teaches
every downstream consumer that "וויסלרייט" and "WeCcelerate" are one entity.
That is precisely the link ChatGPT failed to make.

### Option B — by hand

Create the item at <https://www.wikidata.org/wiki/Special:NewItem>, then add:

| Property | Value | Note |
|---|---|---|
| **P31** instance of | `Q4830453` (business) | Wikidata's recommended value for companies |
| **P17** country | `Q801` (Israel) | |
| **P10889** Israeli Company Number | `515962819` | A dedicated property for exactly this. Strongest anchor available. |
| **P571** inception | `2018` (year precision) | |
| **P159** headquarters location | `Q33935` (Tel Aviv) | |
| **P856** official website | `https://weccelerate.co.il` | |
| **P1448** official name | `וויסלרייט בע״מ` (Hebrew) | |
| **P4264** LinkedIn company ID | `weccelerate` | |
| **P2013** Facebook username | `weccelerate` | |
| **P2088** Crunchbase organization ID | *add after Step 2* | Only once the slug is corrected |
| **P452** industry | venture capital / business incubator | Optional |
| **P1454** legal form | Israeli private company | Optional |

**Aliases to set** (Item → "Also known as"):
- Hebrew: `וויסלרייט בע״מ`
- English: `WeCcelerate Ltd.`, `Weccelerate`, `We Accelerate`

**Do not** add founders (P112) or CEO (P169) yet. Those need separate Person
items, and creating items for individuals raises the notability bar
considerably. The company item is what matters; add people later if it survives.

### References to attach

Use these as `reference URL` (P854) on the statements:

- Registry: https://www.checkid.co.il/company/וויסלרייט-בע~מ-515962819
- Registry (mirror): https://next.obudget.org/i/org/company/515962819
- Reshet 13 feature: https://13tv.co.il/item/special/recommended/business/hc5vm-902788257/
- LinkedIn: https://il.linkedin.com/company/weccelerate
- Official site: https://weccelerate.co.il

---

## Step 2 — Crunchbase slug

The profile is live but sits under `crunchbase.com/organization/weccelerat` —
**missing the final E**. That means the profile string does not match the brand
string a model looks up, which defeats most of its value.

1. Contact Crunchbase support and ask for the permalink to be corrected to
   `weccelerate`. (Profile → Edit → the permalink field is support-only.)
2. Once corrected, update the two `sameAs` arrays in
   `components/seo/GeoSchema.tsx` — the Organization node and the LocalBusiness
   node both carry the old slug.
3. Add `P2088` to the Wikidata item with the corrected slug.

While you are in the profile, make sure the founding year says **2018** and the
description mentions both `WeCcelerate` and `וויסלרייט`. A Crunchbase profile
that disagrees with the site is worse than no profile.

---

## Step 3 — Google Business Profile

This is what produces a Knowledge Panel, which is Google's version of "knowing
who you are". Create and **verify** at <https://business.google.com>.

| Field | Value |
|---|---|
| Business name | `WeCcelerate` |
| Category | Business management consultant *(primary)*; add Venture capital company |
| Address | HaRakevet 58, Tel Aviv |
| Phone | +972-55-564-7538 |
| Website | https://weccelerate.co.il |
| Opening hours | Sun–Thu 09:00–18:00 |
| Description | `WeCcelerate (וויסלרייט) הוא Venture Builder ומאיץ סטארטאפים ישראלי, ח.פ 515962819. ליווי מעטפת 360° מרעיון לסטארטאפ — ייעוץ עסקי, פיתוח מוצר, שיווק, הכנה למשקיעים, ומסלול MedTech בשותפות עם לאומית שירותי בריאות.` |

Every value must match the site exactly. Google scores entity confidence on
consistency across sources — a mismatch here is actively harmful, not neutral.

---

## Step 4 — as7.co.il legacy site

`weccelerate.as7.co.il` still serves a full legacy copy of the site, its TLS
certificate **has expired**, and it is still indexed and still appearing in
search results.

Two problems at once: every crawler and browser hits a certificate error, and a
second indexed copy of the brand splits entity authority between two hosts.

**Preferred fix**: renew the certificate and 301-redirect the entire host to
`https://weccelerate.co.il`. A redirect transfers the accumulated signal rather
than discarding it.

**Acceptable fix**: take the host offline entirely.

**Do not** simply leave it — an expired certificate on a brand-adjacent domain
is one of the exact patterns reputation systems flag, which is relevant given
the CyberGuard history documented in `MANUAL-ACTIONS-FOR-ALON.md`.

---

## Step 5 — Make the two names travel together

The root failure was that no source pairs the Hebrew string with the English
one. Fix that everywhere you control:

- **LinkedIn company "About"** — open with `WeCcelerate (וויסלרייט)` and include
  the company number. LinkedIn is heavily represented in training data.
- **Press** — Calcalist, Globes, Geektime and Reshet 13 already cover you. When
  you next brief any of them, ask for `WeCcelerate (וויסלרייט)` on first mention
  rather than one form alone.
- **Directories** — Start-Up Nation Central, IATI, PitchBook, Dealroom. Same
  founding year, same company number, both name forms, every time.

---

## How to measure this

Do not judge by asking ChatGPT with search disabled — that queries the model's
training memory, which cannot change until the next training cycle and may
never include a company this size.

Judge by this instead, roughly three weeks after Steps 0–3:

1. Ask ChatGPT and Perplexity **with web search enabled**: "מי זה וויסלרייט?"
   Success = they answer correctly and cite weccelerate.co.il.
2. Search Google for `וויסלרייט` and check whether a Knowledge Panel appears.
3. Check whether the Wikidata item survived without a deletion nomination.

If (1) still fails after the site is deployed and indexed, the bottleneck is
retrieval rather than entity data, and it is worth re-investigating.

### Honest expectation

Steps 0–4 remove every reason an engine would distrust or fail to resolve the
entity, and they are genuinely necessary. They do not guarantee recall. Getting
into a model's parametric memory — so that ChatGPT answers correctly *without*
searching — requires the brand to appear across many independent sources at
training time. That is a matter of months and sustained press, not a
configuration change.
