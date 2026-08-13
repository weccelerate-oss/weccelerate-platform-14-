# Manual Actions for Alon (CEO)

Non-code tasks that `Claude` cannot perform for security / authorization
reasons. These are prerequisites for the GEO/AEO strategy to take full effect.

Ordered by priority.

---

## 🛡️ Reputation Recovery — Active Re-Evaluation Requests

CyberGuard and similar anti-phishing systems flagged `weccelerate.co.il`
because of cross-source contradictions (founding year, missing Crunchbase
slug match). After fixing the on-site contradictions on 2026-04-26, you
submitted re-evaluation requests to:

| Reputation system | Submission URL | Submitted |
|---|---|---|
| Google Safe Browsing | https://safebrowsing.google.com/safebrowsing/report_error/ | ✅ 2026-04-26 |
| FortiGuard (Fortinet) | https://www.fortiguard.com/faq/thank-you/wfrating-submission | ✅ 2026-04-26 |

**Check verdict in 7-14 days**:
- Google: re-test https://transparencyreport.google.com/safe-browsing/search?url=weccelerate.co.il
- FortiGuard: re-test https://www.fortiguard.com/webfilter?q=weccelerate.co.il

### Other reputation systems still to submit (recommended order)

These cover the remaining ~80% of browser/AV reputation surface. Submit each
with the same wording: "Site was flagged due to legacy data inconsistencies
that have been resolved. Please re-evaluate."

| Priority | System | Submission URL | Why it matters |
|---|---|---|---|
| 🔥 High | **Microsoft SmartScreen** | https://feedback.smartscreen.microsoft.com/feedback.aspx | Edge browser, Outlook attachments, Defender |
| 🔥 High | **Norton SafeWeb** | https://safeweb.norton.com/report | Norton Antivirus, browser extensions |
| 🔥 High | **Webroot BrightCloud** | https://www.brightcloud.com/tools/change-request.php | Many ISPs and corporate firewalls |
| Medium | **McAfee SiteAdvisor** | https://www.trustedsource.org/en/feedback/url | McAfee AV, Trellix |
| Medium | **Cisco Talos** | https://talosintelligence.com/reputation_center/sender_ip | Cisco Umbrella, Snort, enterprise networks |
| Medium | **Sucuri SiteCheck** | https://sucuri.net/website-security/ | Many website firewalls and CMS hosts |
| Low | **Trend Micro Site Safety** | https://global.sitesafety.trendmicro.com/ | Trend Micro AV |
| Low | **Sophos** | https://www.sophos.com/en-us/threat-center/reassessment-request | Sophos AV/firewalls |
| Low | **Kaspersky** | https://opentip.kaspersky.com/ | Kaspersky AV |
| Low | **ESET** | https://help.eset.com/eset_kb/en-us/SOLN3585.html | ESET AV |

**Pattern**: For each, look up `weccelerate.co.il` first to see the current
verdict. If it's flagged, click "report incorrect classification" / "request
re-evaluation". Most respond within 5-15 business days.

### Self-monitoring tools (no account needed)

Run these monthly to spot new reputation issues before they spread:
- https://urlscan.io/?q=weccelerate.co.il — visual scan + verdict from 30+ engines
- https://www.virustotal.com/gui/home/url — same idea, separate engine pool
- https://www.urlvoid.com/scan/weccelerate.co.il — aggregator

**If any engine shows new red flags**: triangulate the cause (check the
response payload — usually it cites a specific source like "domain registered
recently" or "low reputation score"), fix the source, then submit
re-evaluation.

---

## ✅ Resolved — Founding year (2026-04-26)

Confirmed by Alon (CEO) on 2026-04-26: **WeCcelerate Ltd. was incorporated
in 2016**. All canonical surfaces (`config/seo.ts`, `components/seo/GeoSchema.tsx`,
`public/llms.txt`, `public/llms-full.txt`, `scripts/seed-news.ts`,
`prisma/seed.ts`) have been aligned. Earlier records that quoted 2017
(B7Net article) or 2020 (legacy schema default) are incorrect.

The B7Net news record is intentionally still excluded from seed data —
its excerpt contradicts the canonical year and we do not rewrite
journalists' quotes.

---

## 🟡 P0 — Crunchbase slug correction (profile edits done; slug rename pending)

**Update 2026-04-26**: Alon confirmed he completed Crunchbase profile edits
(founding year aligned to 2016, leadership, description). The remaining
question is whether the URL slug itself was renamed.

Current Crunchbase profile URL: `https://www.crunchbase.com/organization/weccelerat`
(missing final **E**).

### Quick check (do this now, takes 30 seconds)

Open https://www.crunchbase.com/organization/weccelerate (with the **E**) in
an incognito tab.
- **If it loads our profile** → slug renamed successfully. Update the
  hardcoded URLs (see "If yes" steps below).
- **If it shows 404 or "claim this profile"** → slug still old; only content
  was edited. Continue waiting on Crunchbase support, OR send the email
  template below.

**Status (2026-04-26)**: Alon confirmed he has performed edits on the
Crunchbase profile. Profile content (founding year, leadership, description)
should now be aligned with the rest of our surfaces. The URL slug correction
(`weccelerat` → `weccelerate`) requires Crunchbase support and may still be
pending.

**Verify slug status weekly until corrected**:
1. Visit https://www.crunchbase.com/organization/weccelerat — does it now
   redirect to `/weccelerate`? If yes, the slug fix landed.
2. If yes — update the URL in:
   - `components/seo/GeoSchema.tsx` (×2 in `sameAs` arrays)
   - `lib/seo.ts` (`SOCIAL_LINKS.crunchbase`)
   - `app/sites/main/about/page.tsx` (`sameAs` array)
   - `public/llms.txt` (Social Media section)
   - `public/llms-full.txt` (Social Media section)
3. If no — keep the current URL (Crunchbase profile is still resolvable
   under the old slug — content lives there) and email
   `support@crunchbase.com`:

> Subject: Slug change request — typo in our organization URL
>
> Hi Crunchbase team,
>
> Our organization profile is at `/organization/weccelerat` but our
> legal/trading name is **WeCcelerate Ltd.** (note the second **E** at
> the end). Could you please change the URL slug from `weccelerat` to
> `weccelerate` to match our canonical brand?
>
> Verification:
> - Website: https://weccelerate.co.il
> - LinkedIn: https://www.linkedin.com/company/weccelerate
> - Press reference: https://www.globes.co.il/news/article.aspx?did=1001426009
> - Founded: 2018
> - Leumit × WeCcelerate MedTech partnership launched: 2022
>
> Thanks,
> Alon Pinchas, Founder & CEO

**Also confirm in Crunchbase**: Founded year is set to **2018** (canonical),
not 2016 or 2020.

---

## ✅ Resolved — LinkedIn URLs for founders (2026-05-10)

Verified and added to `lib/seo/founders.ts` + `components/seo/GeoSchema.tsx`:

- ✅ Alon Pinchas:   https://www.linkedin.com/in/alon-pinhas-589a97172/
- ✅ Avraham Hinoch: https://www.linkedin.com/in/avraham-heinoch-20168a231/
- ✅ Ido Sabag:      https://www.linkedin.com/in/ido-sabag-382b641b3/

Person schema on every page now includes `sameAs` pointing to the
founder's LinkedIn — strongest entity-recognition signal for Google
Knowledge Graph and LLMs.

---

## ✅ Resolved — Social profiles (2026-04-23)

Per direct confirmation from the owner, WeCcelerate operates **five**
official social profiles. Brand-name handles on Twitter/X are **not
company-owned** and have been removed from every public surface. GitHub
is not user-facing and is intentionally omitted from social profile
arrays (it is a dev concern, not an entity-recognition signal).

Active, confirmed profiles (present in all `sameAs` arrays + footer +
llms.txt + llms-full.txt + team page):

- ✅ `https://www.linkedin.com/company/weccelerate`
- ✅ `https://www.facebook.com/weccelerate`
- ✅ `https://www.instagram.com/weccelerate.ltd`
- ✅ `https://www.youtube.com/@WeCcelerate.Ltd1`
- ✅ `https://www.tiktok.com/@weccelerate`

Excluded by design:
- ❌ Twitter / X — not operated by the company
- ❌ GitHub — not user-facing; would dilute entity-recognition signals
- ❌ Crunchbase — pending slug fix (`weccelerat` → `weccelerate`); see
  P0 above. Will be added to `sameAs` once the slug is corrected.

If a new profile is opened in the future (e.g. an official Threads or
X account), add the URL to:
1. `components/seo/GeoSchema.tsx` — both `sameAs` arrays (Organization + LocalBusiness)
2. `lib/seo.ts` — `SOCIAL_LINKS` constant
3. `public/llms.txt` + `public/llms-full.txt` — Social Media section
4. `app/sites/main/HomepageContent.tsx` — footer icon row
5. `app/sites/main/about/page.tsx` — Organization sameAs

Then re-run the IndexNow submit so the updated schema gets re-crawled.

---

## P1 — Bing Webmaster Tools

1. Sign up: https://www.bing.com/webmasters/
2. Add property: `https://weccelerate.co.il`
3. Verification method: **HTML meta tag** (easiest).
4. Copy the verification code.
5. Set env var `BING_SITE_VERIFICATION` in Vercel (already wired into
   metadata via `lib/seo/metadata.ts`).
6. Deploy and click "Verify" in Bing.
7. Submit sitemap: `https://weccelerate.co.il/sitemap.xml`

---

## P1 — Google Business Profile

1. https://business.google.com → add business.
2. Name: WeCcelerate (exact case).
3. Category: Business Consultant.
4. Address: HaRakevet 58, Tel Aviv (or mark as service-area business).
5. Hours: Sun-Thu 09:00–18:00.
6. Verification: mail or phone.
7. Once verified, add real photos (logo, office, team).

This unlocks Google Knowledge Panel eligibility.

---

## P1 — Perplexity Brand Dashboard

Perplexity lets brands claim their entity:
1. https://www.perplexity.ai/business/brand
2. Search "WeCcelerate" → claim if listed.
3. Upload brand assets + verified URLs.

---

## P2 — numberOfEmployees

Decide on honest range. Currently omitted from Organization schema because
`min:10 / max:50` was unverified. Send me the right range and I'll add it.

---

## P2 — Awards (if any real ones)

Former schema had fabricated awards ("Top 10 Israeli Business Accelerators
2024", "HealthTech Innovation Partner - Leumit 2023") — removed. If
WeCcelerate has earned **real, verifiable awards** with public URLs, send
them and I'll add a clean `award` array.

---

## P1 — IndexNow submit-all (one-time, after first deploy of Phase B)

Phase B code is live: [lib/seo/indexnow.ts](../lib/seo/indexnow.ts) and
[app/api/indexnow/submit/route.ts](../app/api/indexnow/submit/route.ts).
The verification file `public/a7f3c912b8e04d569f1a2c3b4d5e6f78.txt` is
published.

**One-time submit of all sitemap URLs to Bing + Yandex** (pushes all 15
guides, services, press, etc. for instant indexing):

```bash
# 1. Set ADMIN_TOKEN (strong random string) in Vercel env and locally:
export ADMIN_TOKEN="$(openssl rand -hex 32)"

# 2. Verify the endpoint is live:
curl https://weccelerate.co.il/api/indexnow/submit \
  -H "x-admin-token: $ADMIN_TOKEN"

# 3. Submit every URL from the live sitemap:
curl -s https://weccelerate.co.il/sitemap.xml \
  | grep -oP '(?<=<loc>)[^<]+' \
  | jq -R -s -c 'split("\n") | map(select(length > 0))' \
  | xargs -I {} curl -X POST https://weccelerate.co.il/api/indexnow/submit \
      -H "x-admin-token: $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"urls":{}}'
```

**Per-new-guide submit** (run after publishing any new `/guides/[slug]`):

```bash
curl -X POST https://weccelerate.co.il/api/indexnow/submit \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://weccelerate.co.il/guides/NEW-SLUG"]}'
```

**Expected result**: Bing and Yandex index the pages within minutes.
ChatGPT Search (Bing-backed) and Perplexity start citing within 1–3 days
instead of 2–4 weeks.

---

## P3 — `.env` secrets

These env vars are wired in code but need real values in Vercel:

- [ ] `GOOGLE_SITE_VERIFICATION` — from Google Search Console meta tag
- [ ] `BING_SITE_VERIFICATION` — from Bing Webmaster Tools (see P1 above)
- [ ] `YANDEX_VERIFICATION` — from Yandex Webmaster (optional, for RU/CIS)
- [ ] `ADMIN_TOKEN` — strong random string for the IndexNow API endpoint
  (now built — see "IndexNow submit-all" above). Generate with
  `openssl rand -hex 32`.
- [ ] `INDEXNOW_KEY` — **not required**; defaults to the committed
  `a7f3c912b8e04d569f1a2c3b4d5e6f78`. Set only if rotating the key
  (remember to rename the corresponding `public/<KEY>.txt` file).

---

## P0 — Apply Prisma schema push (Phase C — bot analytics)

Phase C adds a new Prisma model `BotVisit` used to power
`/admin/bot-analytics`. The project uses `db:push` (not formal migrations),
so after deploying the code:

```bash
# 1. Pull to your local machine + install deps
git pull
npm install

# 2. Apply schema (idempotent — safe to re-run):
npm run db:push

# 3. Verify the table exists:
npm run db:studio
# → check "bot_visits" table appears
```

On Vercel, the Prisma client regenerates on every deploy via the
`postinstall` hook. No manual action needed on Vercel beyond ensuring
`DATABASE_URL` is set.

**Until `db:push` runs**: `/admin/bot-analytics` shows a friendly warning
banner ("table does not exist — run db:push") instead of 500-ing.

---

## P1 — IndexNow push after Phase D/E/F deploy

You now have:
- 10 new Hebrew guides (Phase D)
- 5 new English guides (Phase E)
- Dynamic OG images for every guide (Phase F)

After Vercel deploys this PR, push the new URLs to Bing/Yandex:

```bash
# Hebrew guides (10 new)
curl -X POST https://weccelerate.co.il/api/indexnow/submit \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"urls":[
    "https://weccelerate.co.il/guides/safe-vs-convertible-note",
    "https://weccelerate.co.il/guides/cap-table-hesber",
    "https://weccelerate.co.il/guides/heskem-meyasdim",
    "https://weccelerate.co.il/guides/esop-ovdim",
    "https://weccelerate.co.il/guides/grants-rashut-hachadshanut",
    "https://weccelerate.co.il/guides/delaware-flip",
    "https://weccelerate.co.il/guides/product-market-fit",
    "https://weccelerate.co.il/guides/customer-discovery",
    "https://weccelerate.co.il/guides/eichut-mhir-saas",
    "https://weccelerate.co.il/guides/digital-therapeutics-israel"
  ]}'

# English guides (5 new) + hub
curl -X POST https://weccelerate.co.il/api/indexnow/submit \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"urls":[
    "https://weccelerate.co.il/en/guides",
    "https://weccelerate.co.il/en/guides/what-is-venture-builder",
    "https://weccelerate.co.il/en/guides/medtech-startup-israel",
    "https://weccelerate.co.il/en/guides/helsinki-committee-israel",
    "https://weccelerate.co.il/en/guides/fda-510k-israeli-startups",
    "https://weccelerate.co.il/en/guides/raise-funding-israel"
  ]}'
```

---

## P2 — Verify OG images on social preview

After Vercel deploys, verify the dynamic OG image route works:

```bash
# Quick visual check — save and inspect locally
curl "https://weccelerate.co.il/og?slug=rayon-le-startup" -o og-he.png
curl "https://weccelerate.co.il/og?slug=what-is-venture-builder&locale=en" -o og-en.png
```

Then run the URLs through the Twitter Card Validator and Facebook Debugger:
- https://cards-dev.twitter.com/validator
- https://developers.facebook.com/tools/debug/

For LinkedIn, paste the URL into a draft post and verify the preview image.

**If Facebook Debugger shows the old `/opengraph-image.jpg`**: click "Scrape
again" to force a refresh. LinkedIn cache can take 7-30 days to refresh on
its own — no force-refresh button currently.

---

## 🧭 Entity Resolution — why ChatGPT answers "I don't know" (added 2026-08-12)

**Trigger**: a user asked ChatGPT "מי זה וויסלרייט?" and got back "I could not
find a reliable source identifying a company by that name." ChatGPT guessed the
English spelling was "Whistleright" and never reached WeCcelerate.

**This is not an indexing problem.** A plain web search for "וויסלרייט" returns,
on page one: weccelerate.co.il, the LinkedIn company page, a Reshet 13 feature,
the Israeli company registry, the YouTube channel and leumitweccelerate.com. The
site is indexed and findable. What failed is *entity resolution*: nothing told
the model that the Hebrew string "וויסלרייט" resolves to the English brand
"WeCcelerate", so it invented a back-transliteration and gave up.

### Fixed in code on 2026-08-12 (no action needed from you)

| What was wrong | Where | Now |
|---|---|---|
| Site contradicted **itself** on the founding year — JSON-LD on every page emitted `2016` while llms.txt, llms-full.txt and the FAQ schema all said `2018` | `components/seo/GeoSchema.tsx`, `config/seo.ts`, `public/llms-full.txt` (which disagreed with itself, line 9 vs 166), `lib/seo/guides-catalog.ts` | All surfaces now say **2018** |
| llms.txt declared the year `2019` "incorrect" — but 2019 is what the **official Israeli registrar** publishes. The site was effectively telling AI engines the government record is wrong | `lib/seo/llms-base.ts` | Now explains that founding (2018) and legal registration (17.1.2019) are two different facts that do not conflict |
| Company number (ח.פ) — the single strongest unambiguous entity anchor — appeared nowhere in the schema | `components/seo/GeoSchema.tsx` | `identifier: 515962819` added to both Organization and LocalBusiness |
| No mapping from the Hebrew name to the English brand anywhere a model would read it | `lib/seo/llms-base.ts`, `lib/seo/faq-catalog.ts`, `public/llms-full.txt` | Explicit "וויסלרייט = WeCcelerate, NOT Whistleright" statement, plus a new FAQ entry that renders into FAQPage schema |
| Founder name split across two spellings — schema said "Alon Pinchas", his own LinkedIn says "Pinhas" — so one person read as two weak entities. Same for Hinoch/Heinoch and Ido/Eido Sabag | `components/seo/GeoSchema.tsx`, `lib/seo/llms-base.ts` | Both spellings listed as `alternateName`; llms.txt states they are the same person |
| `sitemap.xml` submitted `biz.weccelerate.co.il` and `leumit.weccelerate.co.il` — **both are NXDOMAIN**, so every Googlebot/Bingbot sitemap fetch ended at a dead host | `app/sitemap.ts` | Dead subdomains removed from the sitemap |
| llms.txt and the FAQ told AI engines to *cite* `biz.weccelerate.co.il` — a host that does not exist | `lib/seo/llms-base.ts`, `lib/seo/faq-catalog.ts`, `public/llms-full.txt` | Repointed to live URLs on the main domain |

Note the connection to the CyberGuard section above: that flag was attributed to
"cross-source contradictions (founding year...)". The founding-year contradiction
was never actually resolved in 2026-04 — the schema kept emitting 2016. It is
resolved now.

### ⚠️ Needs a decision from you

1. **Founding year — confirm 2018.** Three dates were live in the codebase: 2016
   (schema, with a comment saying you confirmed it on 2026-04-26), 2018 (llms.txt
   and FAQ, and owner-confirmed 2026-05-14), and 2019-01-17 (the registrar's
   filing date for ח.פ 515962819). I standardised on **2018** because it is the
   later of the two owner confirmations and it already appeared on more surfaces.
   **If 2016 is actually correct, tell me and I will flip all of it back** — but
   it must be one number everywhere, and llms.txt must stop calling the
   registrar's 2019 wrong.

2. **Registered address.** The company register lists **לוריא צבי 11, באר שבע**.
   The site publishes **HaRakevet 58, Tel Aviv**. I left Tel Aviv as the schema
   address (changing it would move the business in Google local results — your
   call, not mine) and documented the registered address in llms.txt so the two
   read as complementary rather than contradictory. Confirm this is how you want it.

3. **The three subdomains.** `biz.`, `leumit.` and `landing.weccelerate.co.il`
   have no DNS records, but the route code exists in the repo and middleware
   already maps the hostnames. Either provision the DNS (and I will re-add them
   to the sitemap) or confirm they are abandoned so the code can be retired.

### 🔴 Off-site actions — this is what actually moves GEO now

> **Paste-ready runbook: [`GEO-ENTITY-SETUP.md`](./GEO-ENTITY-SETUP.md)** — exact
> Wikidata statements (verified property IDs), Crunchbase and Google Business
> Profile field values, the as7 redirect, and the deploy + IndexNow sequence
> that has to happen first.

The on-site work is close to exhausted. Brand-name recall in an LLM is won by
*third-party corroboration*, because that is what the model absorbed during
training. Ranked by impact:

| Priority | Action | Why |
|---|---|---|
| 🔥 P0 | **Create a Wikidata item** for WeCcelerate Ltd. (free, no notability bar as strict as Wikipedia's). Include: company number 515962819, founding year, founders, official website, LinkedIn. | Wikidata is the entity backbone every major model and search engine reads. This is the single highest-leverage item on the list, and nothing on the site can substitute for it. |
| 🔥 P0 | **Fix the Crunchbase slug.** The profile is live under `crunchbase.com/organization/weccelerat` (missing the final E). Ask Crunchbase support to correct it to `weccelerate`, then update the two `sameAs` arrays in `components/seo/GeoSchema.tsx`. | Crunchbase is a primary training source for company entities. A misspelled slug means the profile does not match the brand string models look up. |
| 🔥 P0 | **weccelerate.as7.co.il has an expired TLS certificate** and still serves a legacy copy of the site (200 only when certificate validation is disabled). It is still indexed and still surfaces in search. | Every crawler and browser hits a security error, and a second indexed copy of the brand splits entity authority. Either renew the certificate and 301 the whole host to weccelerate.co.il, or take it down. Redirecting is better — it transfers the accumulated signal. |
| High | **Google Business Profile** for the Tel Aviv office, verified. | Feeds the Google Knowledge Panel, which is a strong secondary entity anchor. |
| High | **Get the Hebrew name into press copy.** Ask outlets that already cover you (Calcalist, Globes, Geektime, Reshet 13) to write "WeCcelerate (וויסלרייט)" rather than one form alone. | This is exactly the string pairing that was missing. Press text is heavily weighted in training data. |
| Medium | Claim/complete profiles on Start-Up Nation Central, IATI, PitchBook, Dealroom, LinkedIn "About". | Each adds an independent corroborating source for the same facts. Make sure the founding year and company number match the site exactly — mismatches are worse than absence. |

**Timeline expectation**: sitemap and llms.txt changes are picked up within days
(IndexNow pushes to Bing, which is what ChatGPT Search reads). Wikidata and
Crunchbase influence *search-grounded* answers within weeks. Getting into a
model's *parametric* memory — so ChatGPT answers "וויסלרייט" correctly without
searching — takes a training cycle and cannot be rushed. Judge progress by
whether ChatGPT/Perplexity answer correctly **with** web search enabled.

---

## Reference — updated automatically by Claude

This file is maintained by the code-change workflow. When a new manual
action is discovered during audits, it will be appended here with the
date and the file/line that triggered it.
