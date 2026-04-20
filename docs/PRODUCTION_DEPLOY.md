# מדריך דיפלוי לפרודקשן — WeCcelerate Platform

**מצב נוכחי:** הקוד נדחף ל-`main` ב-GitHub. Vercel מחובר לענף ויעלה כל commit אוטומטית. המדריך הזה מכסה את 4 השלבים שצריך לבצע **פעם אחת** כדי שהכל יעבוד.

---

## שלב A — הגדרת Database פרודקשן

1. צרי DB ב-[Supabase](https://supabase.com) / [Neon](https://neon.tech) / [Railway](https://railway.app). הכי מומלץ: **Supabase** (חינמי לתחילת דרך).
2. קחי את `Connection string` ושמרי אותו. תצטרכי **שני ערכים:**
   - `DATABASE_URL` — עם pooling (`?pgbouncer=true&connection_limit=1`)
   - `DIRECT_URL` — ישיר (בלי pooling)
3. הריצי אחרי הדיפלוי הראשון (פעם אחת):
   ```bash
   # מקומית, עם DATABASE_URL של פרודקשן ב-env
   npx prisma db push
   ```
   זה יסנכרן את כל הטבלאות (לא מוחק דאטה).

---

## שלב B — Environment Variables ב-Vercel

Vercel Dashboard → Project → **Settings → Environment Variables** → בחרי **Production** scope.

### 🔴 חובה (בלי זה האתר לא עובד)

```bash
DATABASE_URL            = postgres://...          # מ-Supabase/Neon
DIRECT_URL              = postgres://...          # אותו DB, ללא pooling
AUTH_SECRET             = [openssl rand -base64 32]  # חדש לפרודקשן!
AUTH_URL                = https://weccelerate.co.il
AUTH_TRUST_HOST         = true
NEXTAUTH_SECRET         = [=AUTH_SECRET]
NEXTAUTH_URL            = https://weccelerate.co.il
```

### 🟧 חשוב (פיצ׳רים מרכזיים)

```bash
ZAPIER_WEBHOOK_URL      = https://hooks.zapier.com/...
PIPEDRIVE_API_TOKEN     = [מ-Pipedrive]
PIPEDRIVE_COMPANY_DOMAIN = [company-name.pipedrive.com]
PIPEDRIVE_WEBHOOK_SECRET = [secret שלך]
RESEND_API_KEY          = re_...                  # מ-Resend
RESEND_FROM_EMAIL       = WeCcelerate <noreply@weccelerate.co.il>
CRON_SECRET             = [openssl rand -base64 32]
```

### 🟨 אופציונלי

```bash
ANTHROPIC_API_KEY       = sk-ant-api03-...        # ל-/infratech
YOUTUBE_API_KEY         = [Google Cloud Console]
GOOGLE_SITE_VERIFICATION = [מ-Search Console]
```

**הערה:** `AUTH_SECRET` של פרודקשן חייב להיות **שונה** מזה של dev. צרי חדש עם:
```bash
openssl rand -base64 32
```

---

## שלב C — DNS + דומיינים

### 1. הדומיין הראשי: `weccelerate.co.il`

Vercel Dashboard → **Settings → Domains** → הוסיפי:

| דומיין | סוג רשומה | ערך |
|---------|-----------|-----|
| `weccelerate.co.il` | A | `76.76.21.21` |
| `www.weccelerate.co.il` | CNAME | `cname.vercel-dns.com` |
| `leumit.weccelerate.co.il` | CNAME | `cname.vercel-dns.com` |
| `biz.weccelerate.co.il` | CNAME | `cname.vercel-dns.com` |
| `landing.weccelerate.co.il` | CNAME | `cname.vercel-dns.com` |

**טיפ:** במקום 4 רשומות CNAME נפרדות, אפשרי wildcard אחד:
```
*.weccelerate.co.il  CNAME  cname.vercel-dns.com
```

### 2. הדומיין המשני: `wecc-ltd.com` (redirect)

כבר כתוב קוד שעושה redirect 308 אוטומטית. צריך רק להצביע את ה-DNS:

```
wecc-ltd.com        A      76.76.21.21
www.wecc-ltd.com    CNAME  cname.vercel-dns.com
*.wecc-ltd.com      CNAME  cname.vercel-dns.com   (אופציונלי, לסאבדומיינים)
```

ואז ב-Vercel → **Settings → Domains** → הוסיפי:
- `wecc-ltd.com`
- `www.wecc-ltd.com`

(Vercel ינפיק SSL תעודה אוטומטית.)

ה-middleware שלנו ב-[middleware.ts](../middleware.ts) יזהה את הדומיין וייעשה redirect 308 ל-`weccelerate.co.il` עם שמירה על path, query, וסאבדומיין.

---

## שלב D — Search Console + Analytics

לאחר שהדומיינים פעילים:

1. **Google Search Console** — הוסיפי כ-property:
   - `https://weccelerate.co.il` (main)
   - `https://leumit.weccelerate.co.il`
   - `https://biz.weccelerate.co.il`
   - `https://landing.weccelerate.co.il`
2. **אימות** — בחרי "HTML tag", העתיקי את ה-code, ושימי ב-Vercel env var `GOOGLE_SITE_VERIFICATION`.
3. **הגשת sitemap** לכל property:
   - `https://weccelerate.co.il/sitemap.xml`
4. **Google Analytics 4** — ID כבר מוטמע: `G-BQDD91KSJG` ב-[app/layout.tsx](../app/layout.tsx:204). אם זה השלך — מצוין. אם לא — החליפי ל-ID שלך.

---

## שלב E — בדיקות אחרי הדיפלוי

לאחר שהדיפלוי הושלם ו-DNS התעדכן (עד 30 דקות), בדקי:

```bash
# 1. הדפים הראשיים
curl -I https://weccelerate.co.il
curl -I https://leumit.weccelerate.co.il
curl -I https://biz.weccelerate.co.il
curl -I https://landing.weccelerate.co.il

# 2. redirect מ-wecc-ltd.com (צריך 308)
curl -I https://wecc-ltd.com
# Expected: HTTP/2 308 + Location: https://weccelerate.co.il/

# 3. health check
curl https://weccelerate.co.il/api/health

# 4. sitemap
curl https://weccelerate.co.il/sitemap.xml | head -20

# 5. robots
curl https://weccelerate.co.il/robots.txt
```

### בדיקות ידניות בדפדפן

- [ ] עמוד ראשי נטען + תמונות מוצגות
- [ ] `/contact` — שליחת טופס → מגיע ל-admin dashboard + ל-Zapier
- [ ] `/login` — אימות עובד
- [ ] `/admin` — admin dashboard נגיש (אחרי login)
- [ ] `/portal` — portal נגיש למשתמשים רשומים
- [ ] כל סאבדומיין מציג את הדף המתאים
- [ ] הטפסים בסאבדומיינים שולחים לידים עם source מזוהה נכון
- [ ] `wecc-ltd.com` → redirect ל-weccelerate.co.il
- [ ] מצב mobile — responsive על 375px רוחב
- [ ] RTL — כיוון טקסט נכון

---

## בעיות נפוצות ופתרונות

### הדיפלוי נכשל ב-Vercel — "Prisma Client not generated"

```bash
# ב-Vercel → Settings → Build & Development → Build Command:
prisma generate && next build
```

### האתר עולה אבל דף /events / /blog מחזיר שגיאה

ה-DB לא סונכרן. הריצי מקומית מול ה-DATABASE_URL של פרודקשן:
```bash
DATABASE_URL="postgres://prod..." npx prisma db push
```

### שגיאת NextAuth "CallbackRouteError"

האימייל `AUTH_URL` לא תואם. ודאי ש:
- `AUTH_URL=https://weccelerate.co.il` (בלי trailing slash)
- `AUTH_TRUST_HOST=true`
- `AUTH_SECRET` זהה ל-`NEXTAUTH_SECRET`

### לידים לא מגיעים ל-Zapier

- ודאי `ZAPIER_WEBHOOK_URL` מוגדר ב-Vercel
- בדקי ב-Zapier → Task History שה-webhook התקבל
- גם בלי Zapier — הלידים נשמרים ב-DB (`admin → לוח בקרה`)

### SSL cert ב-`wecc-ltd.com` לא נוצר

Vercel דורשים אימות בעלות על הדומיין. לאחר הוספתו ב-Vercel, יכול לקחת עד שעה שהתעודה תיווצר. אם עובר יום — בדקי שה-DNS באמת מצביע ל-Vercel (דרך `dig wecc-ltd.com +short`).

---

## Checklist סופי לפני "Go Live"

- [ ] `npm run build` מקומי מצליח
- [ ] כל משתני ה-env ב-Vercel (🔴 + 🟧)
- [ ] `prisma db push` הורץ על DB פרודקשן
- [ ] 4 הדומיינים (main + 3 subs) מוגדרים ב-Vercel ו-DNS
- [ ] 2 דומיינים נוספים (wecc-ltd.com + www) מוגדרים
- [ ] SSL פעיל על כולם (ירוק ב-Vercel dashboard)
- [ ] Search Console — 4 properties אומתו + sitemap הוגש
- [ ] טופס ליד דמה נשלח ומגיע ל-Zapier + לדשבורד
- [ ] `/admin` נגיש רק למשתמשי ADMIN
- [ ] GA4 `G-BQDD91KSJG` רושם visits

---

## עלויות מעריכות (התחלה)

| שירות | עלות | תוכנית |
|-------|------|--------|
| Vercel Hobby | $0 | מספיק לתחילת דרך |
| Vercel Pro | $20/חודש | אם תרצי commercial usage או subdomains רבים |
| Supabase Free | $0 | 500MB DB, 2GB bandwidth |
| Supabase Pro | $25/חודש | לגיבויים נקודתיים + ביצועים טובים |
| Resend Free | $0 | 3000 אימיילים/חודש |
| Pipedrive | ~$15/user/חודש | כבר קיים אצלך |
| Anthropic API (infratech) | Pay-per-use | ~$1-10/חודש לשימוש נמוך |
| Domain `weccelerate.co.il` | ~60 ₪/שנה | כבר קיים |
| Domain `wecc-ltd.com` | ~$15/שנה | כבר קיים |

**סה"כ לתחילת דרך:** ~$0 עד שמגיעים לתעבורה גבוהה.

---

## בעתיד — טרם-משיקים

פיצ׳רים שכדאי להוסיף אבל לא קריטיים לדיפלוי הראשון:

1. **Rate limiting** ב-API routes (Upstash Redis — $0 לתחילת דרך)
2. **Error monitoring** (Sentry או Vercel Analytics)
3. **Backup strategy** ל-DB (Supabase Pro עושה אוטומטית)
4. **CDN ל-תמונות** (Cloudflare Images / Vercel Image Optimization)
5. **WAF / DDoS protection** (Cloudflare עדיף)
6. **Staging environment** (ענף `staging` ב-Vercel preview)

---

**מסמך זה עודכן:** אפריל 2026
**קומיט אחרון:** [`8dc3489`](https://github.com/weccelerate-oss/weccelerate-platform-14-/commit/8dc3489)
