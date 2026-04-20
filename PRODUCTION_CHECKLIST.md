# 🚀 Production Deployment Checklist

## ✅ BEFORE DEPLOYING TO VERCEL

### 1. Environment Variables (Add to Vercel Project Settings)

```
AUTH_SECRET=Ou426Xc8yI4bMNpdDGB6xhDLXCGt73FqAVnTHdKSaH8=
AUTH_TRUST_HOST=true
NEXTAUTH_SECRET=UITaJPzpMIW0WShsu16YHQ5a78ZTobfAU8tV99JiPlc=
CRON_SECRET=hhyFnHgonWSJ+LOeaHThWqwxdZPjvhnu5yiLctItFTE=

# Database (Get from Supabase/PostgreSQL provider)
DATABASE_URL=postgresql://user:password@host:5432/weccelerate
DIRECT_URL=postgresql://user:password@host:5432/weccelerate

# Email
RESEND_API_KEY=re_xxx... (from https://resend.com)
RESEND_FROM_EMAIL=WeCcelerate <noreply@weccelerate.co.il>

# Google Cloud (for file uploads)
GOOGLE_CLOUD_PROJECT_ID=xxx
GOOGLE_CLOUD_STORAGE_BUCKET=xxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_DRIVE_PORTAL_FOLDER_ID=xxx (Google Drive folder ID)

# YouTube API (for video sync cron)
YOUTUBE_API_KEY=AIzaSyXxx...

# Pipedrive CRM
PIPEDRIVE_API_TOKEN=xxx (from Pipedrive settings)
PIPEDRIVE_WEBHOOK_SECRET=hhyFnHgonWSJ+LOeaHThWqwxdZPjvhnu5yiLctItFTE= (rotate this!)
PIPEDRIVE_COMPANY_DOMAIN=weccelerate (subdomain)

# Optional
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/...
NEXT_PUBLIC_WHATSAPP_PHONE=972XXXXXXXXX
VERCEL_OIDC_TOKEN=xxx
```

### 2. Database Setup

```bash
# Run migrations in production
npm run db:migrate:prod

# Seed data if needed
npm run db:seed
```

### 3. Create Admin User

```bash
# Use the script we created
npx tsx scripts/set-admin-password.ts admin@weccelerate.co.il "YOUR_STRONG_PASSWORD_HERE"
```

### 4. Domain Configuration

**In Vercel Project Settings:**
- Add `weccelerate.co.il` as primary domain
- Add `wecc-ltd.com` as secondary domain (auto-redirects to primary)

**In Your DNS Provider (GoDaddy, Cloudflare, etc.):**
```
weccelerate.co.il     CNAME  cname.vercel-dns.com
wecc-ltd.com          CNAME  cname.vercel-dns.com
```

### 5. Security Fixes Applied ✅

- [x] Added auth check to `/api/debug-pipedrive` (admin-only)
- [x] Added auth check to `/api/analytics/summary` (admin-only)
- [x] Added 301 redirects from wecc-ltd.com to weccelerate.co.il
- [x] Generated strong AUTH_SECRET and NEXTAUTH_SECRET
- [x] Generated strong CRON_SECRET for scheduled jobs

### 6. API Keys Rotation Needed

**CRITICAL:** Before going live, generate/rotate:
- [ ] PIPEDRIVE_WEBHOOK_SECRET - Use random value
- [ ] YouTube API Key - Restrict to your domain only
- [ ] Google Service Account Key - Create new one in GCP Console
- [ ] Resend API Key - Generate new one

### 7. Test in Staging

```bash
npm run build
npm run start

# Test locally:
# - Login flow
# - File uploads
# - Email sending (forgot password)
# - Cron jobs (they run in Vercel, not locally)
# - Pipedrive webhooks
```

### 8. Enable Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry, or Vercel's own)
- [ ] Database monitoring (Supabase/PostgreSQL provider)
- [ ] Cron job logs checked daily

### 9. Backup Strategy

- [ ] Database backup enabled at provider
- [ ] Google Drive files backed up
- [ ] GCS bucket versioning enabled

### 10. Final Checks

- [ ] .env.local NOT committed to git
- [ ] No console.log statements in production code
- [ ] HTTPS enabled on all domains
- [ ] SEO tags verified
- [ ] Mobile responsiveness tested
- [ ] All images loading from CDN
- [ ] Performance optimized (check Vercel Analytics)

---

## 📋 Post-Deployment

### Daily
- Check cron job logs
- Monitor error rates in Vercel

### Weekly
- Check analytics in admin panel
- Verify database performance

### Monthly
- Review user activity
- Check for failed webhooks

---

## 🚨 Known Issues Being Tracked

- [ ] TODO: Send welcome emails with temp password for new users
- [ ] TODO: Implement structured logging (replace console.log)
- [ ] Consider: Move next-auth from beta to stable when available

---

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org
