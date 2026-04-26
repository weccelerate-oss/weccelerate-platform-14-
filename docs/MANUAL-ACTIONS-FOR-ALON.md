# Manual Actions for Alon (CEO)

Non-code tasks that `Claude` cannot perform for security / authorization
reasons. These are prerequisites for the GEO/AEO strategy to take full effect.

Ordered by priority.

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

## 🟡 P0 — Crunchbase slug correction (in progress)

Current Crunchbase profile URL: `https://www.crunchbase.com/organization/weccelerat`
(missing final **E**).

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
> - Founded: 2016
>
> Thanks,
> Alon Pinchas, Founder & CEO

**Also confirm in Crunchbase**: Founded year is set to **2016** (canonical),
not 2020.

---

## P1 — Real LinkedIn URLs for founders

Needed to populate `sameAs` in the Team page Person schema. Send me the
verified URLs and I'll add them to `app/sites/main/team/page.tsx`:

- [ ] Alon Pinchas — LinkedIn URL: `_____________________`
- [ ] Avraham Hinoch — LinkedIn URL: `_____________________`
- [ ] Ido Sabag — LinkedIn URL: `_____________________`

Until then the `sameAs` field is intentionally omitted (empty `sameAs`
hurts entity recognition).

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

## Reference — updated automatically by Claude

This file is maintained by the code-change workflow. When a new manual
action is discovered during audits, it will be appended here with the
date and the file/line that triggered it.
