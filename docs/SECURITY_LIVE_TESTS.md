# Live security audit — 16 tests

**Site:** https://www.aidevreference.com

Open the site with `www`, press **F12 → Console**, use **relative** URLs (`/api/...`).

For personal filled-in results, copy this file to `local/my-audit-YYYY-MM-DD.md` (the `local/` folder is gitignored).

Audit date: ___________  
Result: ☐ 16/16 pass  

---

## TEST 1 — Unauthorized catalog sync

```javascript
fetch("/api/catalog/sync", { method: "POST" })
  .then(async (r) => ({ status: r.status, body: await r.json() }))
  .then(console.log)
```

**Secure:** `{ status: 401, body: { ok: false, error: "Unauthorized" } }`  
**Your result:** ___________

---

## TEST 2 — Unauthorized broadcast

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

## TEST 3 — Unauthorized auto-broadcast

```javascript
fetch("/api/notify/auto-broadcast", { method: "POST" })
  .then(async (r) => ({ status: r.status, body: await r.json() }))
  .then(console.log)
```

**Secure:** `401` + `"Unauthorized"`  
**Your result:** ___________

---

## TEST 4 — Unauthorized resend confirm

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

## TEST 5 — Unauthorized feedback resolve (POST)

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

## TEST 6 — Public data leak

Open in tabs; Ctrl+F for `@`, `password`, `postgresql`:

1. https://www.aidevreference.com/api/catalog  
2. https://www.aidevreference.com/api/notify/stats  
3. https://www.aidevreference.com/api/releases  

**Secure:** Public catalog + aggregate stats only (no emails/secrets)  
**Your result:** ___________

---

## TEST 7 — Cross-user token (IDOR)

1. Subscribe + confirm `you+testA@gmail.com`  
2. Subscribe + confirm `you+testB@gmail.com`  
3. Open **B’s** unsubscribe link only  
4. Confirm A still subscribed  

**Secure:** Each token affects only its own account  
**Your result:** ___________

---

## TEST 8 — Invalid confirm token

Open:
```
https://www.aidevreference.com/api/notify/confirm?token=0000000000000000000000000000000000000000000000000000000000000000
```

**Secure:** "Invalid confirmation link" (400)  
**Your result:** ___________

---

## TEST 9 — Invalid resolve token

Open:
```
https://www.aidevreference.com/api/feedback/resolve?token=not-a-real-token
```

**Secure:** "Invalid resolve link"  
**Your result:** ___________

---

## TEST 10 — SQL injection

Feedback form message:
```
' UNION SELECT email FROM subscribers --
```

**Secure:** "Suspicious input is not allowed"  
**Your result:** ___________

---

## TEST 11 — XSS

Feedback form message:
```html
<img src=x onerror=alert('XSS')>
```

**Secure (production):** Blocked at validation — **"Suspicious input is not allowed"**  
**Also secure:** Accepted but escaped on resolve page with no alert popup  
**Your result:** ___________

---

## TEST 12 — Honeypot

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

## TEST 13 — CAPTCHA required

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

## TEST 14 — Rate limit

Submit feedback form 13 times (different emails/messages, CAPTCHA each time).

**Secure:** 13th returns "Too many requests. Please try later."  
**Your result:** ___________

---

## TEST 15 — Error leak

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

## TEST 16 — Vercel deployment config

Vercel → Production env vars set: `ADMIN_BROADCAST_KEY`, `CRON_BROADCAST_KEY`, `TURNSTILE_*`, `DATABASE_URL`, `SMTP_*`, `MAIL_*`

Re-run Tests 1–5 → all `401`.

**Secure:** All keys set; admin tests blocked  
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

**Next re-test due:** ___________ (recommended: 3–6 months)
