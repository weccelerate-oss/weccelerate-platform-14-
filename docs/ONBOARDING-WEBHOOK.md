# Entrepreneur Onboarding Webhook

When the Google Form at <https://docs.google.com/forms/d/1G98etG6F7e7P4SB0e4DK-LE7WSm-oRo2n9TtmsQoH0Y/edit> is submitted, the data should flow to:

```
POST https://weccelerate.co.il/api/onboarding/entrepreneur
```

That endpoint:

1. Validates a shared secret in the `x-onboarding-secret` header.
2. Runs the lead spam filter (same one used on contact forms).
3. Creates a `User` row with `role=ENTREPRENEUR`, generates an 8-char temp password, and stores the original form payload in `intakeFormData`.
4. Sends a Hebrew welcome email (via Resend) with the email + temp password + login link.
5. Marks `mustChangePassword=true` so the user is forced to pick a permanent password on first login (handled by `/onboarding/set-password`).
6. Is **idempotent**: submitting the same email twice returns the existing user and does NOT resend the email automatically (the admin can do that via /admin/users → Reset Password).

---

## Required environment variables

| Variable | Purpose |
|---|---|
| `ONBOARDING_WEBHOOK_SECRET` | Shared secret. Must match the header value Zapier (or whatever) sends. Generate with `openssl rand -hex 32`. |
| `RESEND_API_KEY` | For the welcome email. If missing, the user is still created but no email goes out. |
| `RESEND_FROM_EMAIL` | The `From:` address. Defaults to `onboarding@resend.dev`. Use a verified domain. |
| `AUTH_URL` | Full URL to the portal (e.g. `https://weccelerate.co.il`). Used in the email's login link. |

---

## Request schema

```json
{
  "name":    "ישראלה ישראלי",
  "email":   "founder@example.com",
  "phone":   "+972-50-123-4567",
  "company": "MyStartup",
  "message": "טקסט חופשי מהטופס",
  "source":  "google_form",
  "raw":     { "<any extra Google-Form fields>": "..." }
}
```

- `name` and `email` are required.
- `raw` is stored verbatim under `User.intakeFormData` so the admin can see exactly what the entrepreneur wrote.
- `source` becomes `User.provisionedSource` for filtering in `/admin/users` (a `🤖 auto · google_form` badge appears there).

---

## Response

### 200 — success

```json
{
  "ok": true,
  "userId": "ckxyz...",
  "created": true,
  "emailSent": true,
  "spamScore": 12,
  "spamDecision": "pass"
}
```

`created: false` means the email already had an account — idempotent reply.

### 401 — bad/missing secret

### 400 — validation error (missing name/email, invalid email format)

### 422 — spam filter rejected the submission (score ≥ 61). The integration should treat this as a permanent failure and stop retrying.

---

## Wiring Google Forms → webhook (no Zapier required)

Use Google Apps Script — it's built into every Google Form, free, and doesn't depend on any third-party service. The drop-in script lives at [`docs/onboarding-apps-script.gs`](onboarding-apps-script.gs).

**Setup (one time, ~5 minutes):**

1. Open the form in edit mode:
   <https://docs.google.com/forms/d/1G98etG6F7e7P4SB0e4DK-LE7WSm-oRo2n9TtmsQoH0Y/edit>
2. Click the **⋮** menu (top right) → **Script editor**.
3. Replace the placeholder code with the contents of `docs/onboarding-apps-script.gs`. Save (Ctrl/Cmd+S) and name it `WeCcelerate Onboarding`.
4. Left sidebar → **Project Settings (⚙)** → scroll to **Script Properties** → **Add script property**:
   - Property: `ONBOARDING_WEBHOOK_SECRET`
   - Value: the secret from Vercel (the one set in `.env`)
   Save.
5. Left sidebar → **Triggers (⏰)** → **Add Trigger**:
   - Choose function: `handleFormSubmit`
   - Event source: `From form`
   - Event type: `On form submit`
   Save. Google will ask for `UrlFetch` + `Forms` permissions — approve.
6. **Test**: in the script editor, pick `testWebhook` from the function dropdown → **Run**. Open **Executions** to see the response. A `200` log line means it works.
7. Submit the form once with a real email. You should receive the Hebrew welcome email + see the new user in `/admin/users` with the `🤖 auto · google_form` badge.

**If your form's question titles differ from the defaults**, edit the `FIELD_MAP` constant at the top of the script — each webhook field accepts multiple possible titles, first match wins.

---

## (Alternative) Zapier wiring

If for some reason you can't use Apps Script:

1. **Trigger**: "New Response in Spreadsheet" — point at the response sheet of the Google Form.
2. **Action**: "Webhooks by Zapier → POST"
   - URL: `https://weccelerate.co.il/api/onboarding/entrepreneur`
   - Method: `POST`
   - Headers:
     - `Content-Type: application/json`
     - `x-onboarding-secret: <ONBOARDING_WEBHOOK_SECRET>`
   - Body type: `JSON`
   - Body:
     ```json
     {
       "name": "{{name_column}}",
       "email": "{{email_column}}",
       "phone": "{{phone_column}}",
       "company": "{{company_column}}",
       "message": "{{message_column}}",
       "source": "google_form",
       "raw": { "<every other column>": "..." }
     }
     ```
3. Turn on the Zap.

---

## cURL test

```bash
curl -X POST https://weccelerate.co.il/api/onboarding/entrepreneur \
  -H "Content-Type: application/json" \
  -H "x-onboarding-secret: $ONBOARDING_WEBHOOK_SECRET" \
  -d '{
    "name": "טסט יזם",
    "email": "test+'"$(date +%s)"'@example.com",
    "phone": "+972501234567",
    "company": "Test Co",
    "source": "manual_curl"
  }'
```

Health-check (no auth required):

```bash
curl https://weccelerate.co.il/api/onboarding/entrepreneur
```

---

## What the entrepreneur sees

1. Fills the Google Form, hits submit.
2. Within ~60 seconds receives an email in Hebrew with their temp password + login link.
3. Clicks "כניסה לפורטל" → lands on `/login`.
4. Enters email + temp password → NextAuth signs them in.
5. Because `mustChangePassword=true`, the portal layout (`app/(portal)/portal/layout.tsx`) redirects them to `/onboarding/set-password`.
6. They pick a permanent password (strength validated server-side).
7. Server clears `mustChangePassword=false`, signs them out, redirects to `/login?reset=true` (green "password updated" banner).
8. They log in with the new password → straight into `/portal`.

The temp password is single-use in spirit (not enforced) — once changed, the flag is cleared and they go through the normal flow.

---

## Admin surfaces

- `/admin/users` shows two new badges next to provisioned entrepreneurs:
  - `🤖 auto · google_form` — purple, identifies auto-provisioned accounts.
  - `⏳ ממתין להחלפת סיסמה` — amber, present until the user picks a permanent password.
- `ActivityLog` rows:
  - `user.provisioned` — full audit on creation.
  - `user.welcome_email_failed` — if Resend rejected the email.
  - `user.password_set_first_login` — when the user clears the flag.
  - `onboarding.spam_blocked` — webhook submissions the spam filter dropped.

---

## Migration (one-time)

After deploying, run:

```bash
npx prisma db:push --config prisma/prisma.config.ts
npx prisma generate --config prisma/prisma.config.ts
```

This adds the four new `User` columns: `mustChangePassword`, `intakeFormData`, `provisionedAt`, `provisionedSource`. All four are backwards-compatible (defaults or nullable) so existing rows aren't affected.
