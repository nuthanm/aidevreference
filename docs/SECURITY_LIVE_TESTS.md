# Live security audit — 32 tests

**Site:** https://www.aidevreference.com

Open the site with `www`, press **F12 → Console**, use **relative** URLs (`/api/...`) unless a full URL is required.

For personal filled-in results, copy this file to `local/my-audit-YYYY-MM-DD.md` (the `local/` folder is gitignored).

Audit date: ___________  
Result: ☐ 32/32 pass  

**Before merging to `main`:** run all 32 tests on staging/preview, then re-run on production after deploy. See [Security verification guide](SECURITY_VERIFICATION.md) for the full maintainer workflow.

---

## Core tests (1–16)

### TEST 1 — Unauthorized catalog sync

```javascript
fetch("/api/catalog/sync", { method: "POST" })
  .then(async (r) => ({ status: r.status, body: await r.json() }))
  .then(console.log)
```

**Secure:** `{ status: 401, body: { ok: false, error: "Unauthorized" } }`  
**Your result:** ___________

---

### TEST 2 — Unauthorized broadcast

```javascript
fetch("/api/notify/broadcast", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ version: "security-test", notes: ["Unauthorized test"] })
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `401` + `"Unauthorized"`  
**Your result:** ___________

---

### TEST 3 — Unauthorized auto-broadcast

```javascript
fetch("/api/notify/auto-broadcast", { method: "POST" })
  .then(async (r) => ({ status: r.status, body: await r.json() }))
  .then(console.log)
```

**Secure:** `401` + `"Unauthorized"`  
**Your result:** ___________

---

### TEST 4 — Unauthorized resend confirm

```javascript
fetch("/api/notify/resend-confirm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "you+testA@gmail.com" })
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `401` + `"Unauthorized"`  
**Your result:** ___________

---

### TEST 5 — Unauthorized feedback resolve (POST)

```javascript
fetch("/api/feedback/resolve", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: "fake-token-for-test" })
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `401` + `"Unauthorized"`  
**Your result:** ___________

---

### TEST 6 — Public data leak

Open in tabs; Ctrl+F for `@`, `password`, `postgresql`:

1. https://www.aidevreference.com/api/catalog  
2. https://www.aidevreference.com/api/notify/stats  
3. https://www.aidevreference.com/api/releases  

**Secure:** Public catalog + aggregate stats only (no emails/secrets)  
**Your result:** ___________

---

### TEST 7 — Cross-user token (IDOR)

1. Subscribe + confirm `you+testA@gmail.com` (open email link → click **Confirm subscription** button)  
2. Subscribe + confirm `you+testB@gmail.com`  
3. Open **B’s** unsubscribe link only → click **Unsubscribe**  
4. Confirm A still subscribed  

**Secure:** Each token affects only its own account  
**Your result:** ___________

---

### TEST 8 — Invalid confirm token

Open:
```
https://www.aidevreference.com/api/notify/confirm?token=0000000000000000000000000000000000000000000000000000000000000000
```

**Secure:** "Invalid confirmation link" (400) — no subscription created  
**Your result:** ___________

---

### TEST 9 — Invalid resolve token

Open:
```
https://www.aidevreference.com/api/feedback/resolve?token=not-a-real-token
```

**Secure:** "Invalid resolve link" — no email sent  
**Your result:** ___________

---

### TEST 10 — SQL injection

Feedback form message:
```
' UNION SELECT email FROM subscribers --
```

**Secure:** "Suspicious input is not allowed"  
**Your result:** ___________

---

### TEST 11 — XSS

Feedback form message:
```html
<img src=x onerror=alert('XSS')>
```

**Secure (production):** Blocked at validation — **"Suspicious input is not allowed"**  
**Also secure:** Accepted but escaped on resolve page with no alert popup  
**Your result:** ___________

---

### TEST 12 — Honeypot

```javascript
fetch("/api/notify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "bot-security-test@example.com",
    acceptPolicies: true,
    website: "http://im-a-bot.com",
    formStartedAt: Date.now() - 5000
  })
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure (production):** `"CAPTCHA verification failed"` (CAPTCHA runs before honeypot)  
**Also secure:** `"Spam detection triggered. Please try again."` (when CAPTCHA skipped + honeypot filled)  
**Your result:** ___________

---

### TEST 13 — CAPTCHA required

```javascript
fetch("/api/notify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "nocaptcha-security-test@example.com",
    acceptPolicies: true,
    formStartedAt: Date.now() - 5000
  })
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `{ ok: false, error: "CAPTCHA verification failed" }`  
**Your result:** ___________

---

### TEST 14 — Rate limit

Submit feedback form 13 times (different emails/messages, CAPTCHA each time).

**Secure:** 13th returns "Too many requests. Please try later."  
**Your result:** ___________

---

### TEST 15 — Error leak

```javascript
fetch("/api/feedback", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{ this is not valid json"
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `{ ok: false, error: "Invalid request payload." }` — no stack trace  
**Your result:** ___________

---

### TEST 16 — Vercel deployment config

Vercel → Production env vars set: `ADMIN_BROADCAST_KEY`, `CRON_BROADCAST_KEY`, `TURNSTILE_*`, `DATABASE_URL`, `SMTP_*`, `MAIL_*`

Re-run Tests 1–5 → all `401`.

**Secure:** All keys set to real random values (not `replace_with_*`); admin tests blocked  
**Your result:** ___________

---

## P0 — Placeholder secret rejection (17–18)

### TEST 17 — Placeholder admin key treated as missing

On a **preview/staging** deployment where `ADMIN_BROADCAST_KEY=replace_with_secure_random_key` (intentionally bad for this test only):

```javascript
fetch("/api/catalog/sync", {
  method: "POST",
  headers: { "x-admin-key": "replace_with_secure_random_key" }
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `401` — placeholder values are never accepted, even if they match the env var  
**Your result:** ___________

---

### TEST 18 — Production build rejects placeholder secrets

Run locally or in CI with placeholder env vars:

```bash
NODE_ENV=production \
ADMIN_BROADCAST_KEY=replace_with_secure_random_key \
CRON_BROADCAST_KEY=replace_with_secure_random_key \
TURNSTILE_SECRET_KEY=replace_with_turnstile_secret_key \
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require \
SMTP_HOST=smtp.example.com SMTP_USER=user SMTP_PASS=pass \
NEXT_PUBLIC_SITE_URL=https://example.com \
npm run build
```

**Secure:** Build fails with `Production security configuration is invalid`  
**Your result:** ___________

---

## P1 — Rate limiting & dependencies (19–21)

### TEST 19 — Shared rate limit (Upstash, optional)

If `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in production, rate limits apply across all serverless instances. Verify in Vercel env vars.

**Secure:** Upstash vars set in production (recommended) OR you accept in-memory fallback with Cloudflare/Vercel edge rate limiting  
**Your result:** ___________

---

### TEST 20 — npm audit in CI

GitHub → Actions → **Security Audit** workflow on your PR/branch.

**Secure:** Workflow passes (`npm audit --audit-level=high`, lint, production build)  
**Your result:** ___________

---

### TEST 21 — Next.js security patch level

In repo root:

```bash
node -p "require('./package.json').dependencies.next"
```

**Secure:** `15.5.20` or newer 15.5.x  
**Your result:** ___________

---

## P2 — CSRF-safe tokens, enumeration, auth hardening (22–28)

### TEST 22 — Confirm link does not auto-confirm on GET (prefetch safe)

1. Subscribe a new test email but **do not** click confirm yet  
2. Open the confirm link in the browser (GET only)  
3. Page shows **"Confirm subscription"** button — subscription still **pending** in DB/email  

**Secure:** GET shows confirmation page only; no side effect until POST/button click  
**Your result:** ___________

---

### TEST 23 — Unsubscribe link does not auto-unsubscribe on GET

1. Use a confirmed subscriber’s unsubscribe link  
2. Open link (GET only) — page shows **Unsubscribe** button  
3. Subscriber still receives emails until button is clicked  

**Secure:** GET shows confirmation page only  
**Your result:** ___________

---

### TEST 24 — Resolve link does not auto-resolve on GET

1. Submit feedback on staging; copy admin resolve link from email  
2. Open link (GET only) — page shows **Mark as resolved** button  
3. Requester has **not** received resolution email yet  

**Secure:** GET shows confirmation page only  
**Your result:** ___________

---

### TEST 25 — Email enumeration blocked

Run both requests; compare responses:

```javascript
const payload = (email) => ({
  email,
  acceptPolicies: true,
  formStartedAt: Date.now() - 5000,
  captchaToken: "YOUR_VALID_TURNSTILE_TOKEN"
});

Promise.all([
  fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload("already-subscribed@your-test.com")) }).then(r => r.json()),
  fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload("brand-new-test@your-test.com")) }).then(r => r.json()),
]).then(console.log);
```

**Secure:** Both return `{ ok: true, message: "If this email can receive updates, check your inbox..." }` — no `alreadySubscribed` or `pendingConfirmation` flags  
**Your result:** ___________

---

### TEST 26 — Admin auth brute-force rate limit

Run 21 times with wrong key:

```javascript
for (let i = 1; i <= 21; i++) {
  fetch("/api/catalog/sync", {
    method: "POST",
    headers: { "x-admin-key": "wrong-key-" + i }
  }).then(async (r) => console.log(i, r.status, await r.json()));
}
```

**Secure:** After ~20 failures, returns `429` + `"Too many failed authentication attempts"`  
**Your result:** ___________

---

### TEST 27 — Resolve page escapes email (XSS defense)

1. Submit feedback with email like `test+<script>alert(1)</script>@example.com` (if validation allows) OR resolve any request and inspect HTML source after POST resolve  
2. View page source on resolve success page  

**Secure:** Email shown as escaped text (`&lt;script&gt;`) — no script execution  
**Your result:** ___________

---

### TEST 28 — Resolution note length limit

Open (replace `VALID_TOKEN` with a real resolve token):

```
https://www.aidevreference.com/api/feedback/resolve?token=VALID_TOKEN&note=AAAA...(2001 chars)
```

**Secure:** `400` — note must be 2000 characters or fewer  
**Your result:** ___________

---

## P3 — Security headers & consistency (29–32)

### TEST 29 — Security headers on pages

```javascript
fetch("/").then(r => {
  console.log({
    "x-frame-options": r.headers.get("x-frame-options"),
    "x-content-type-options": r.headers.get("x-content-type-options"),
    "referrer-policy": r.headers.get("referrer-policy"),
    "content-security-policy": r.headers.get("content-security-policy"),
  });
});
```

**Secure:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` set, CSP present  
**Your result:** ___________

---

### TEST 30 — Token action pages use no-referrer

Open any confirm/unsubscribe/resolve link → View page source.

**Secure:** `<meta name="referrer" content="no-referrer" />` present — reduces token leakage via Referer  
**Your result:** ___________

---

### TEST 31 — Placeholder cron key rejected

On staging with `CRON_BROADCAST_KEY=replace_with_secure_random_key`:

```javascript
fetch("/api/notify/auto-broadcast", {
  method: "POST",
  headers: { "x-cron-key": "replace_with_secure_random_key" }
}).then(async (r) => ({ status: r.status, body: await r.json() })).then(console.log)
```

**Secure:** `401`  
**Your result:** ___________

---

### TEST 32 — CSRF via GET img tag blocked

Simulate email-client prefetch (GET only, no POST):

```javascript
fetch("/api/notify/unsubscribe?token=0000000000000000000000000000000000000000000000000000000000000000")
  .then(r => r.text())
  .then(html => console.log(html.includes("Unsubscribe") && !html.includes("You will no longer receive")));
```

**Secure:** Response is a confirmation **form page**, not immediate "You will no longer receive" success message  
**Your result:** ___________

---

## Results summary

| # | Pass? |
|---|-------|
| 1 | ☐ |
| 2 | ☐ |
| 3 | ☐ |
| 4 | ☐ |
| 5 | ☐ |
| 6 | ☐ |
| 7 | ☐ |
| 8 | ☐ |
| 9 | ☐ |
| 10 | ☐ |
| 11 | ☐ |
| 12 | ☐ |
| 13 | ☐ |
| 14 | ☐ |
| 15 | ☐ |
| 16 | ☐ |
| 17 | ☐ |
| 18 | ☐ |
| 19 | ☐ |
| 20 | ☐ |
| 21 | ☐ |
| 22 | ☐ |
| 23 | ☐ |
| 24 | ☐ |
| 25 | ☐ |
| 26 | ☐ |
| 27 | ☐ |
| 28 | ☐ |
| 29 | ☐ |
| 30 | ☐ |
| 31 | ☐ |
| 32 | ☐ |

**Next re-test due:** ___________ (recommended: 3–6 months)

---

## Pre-merge checklist (maintainers)

1. Run Tests **1–32** on Vercel **preview** with real test emails you control  
2. Confirm GitHub **Security Audit** workflow is green on your PR  
3. Confirm production env vars use **random** keys (never `replace_with_*`)  
4. Merge to `main` → wait for deploy → re-run Tests **1–16** and **29–31** on production  
5. Record pass/fail in `local/my-audit-YYYY-MM-DD.md` if desired  

See also: [Security verification guide](SECURITY_VERIFICATION.md)
