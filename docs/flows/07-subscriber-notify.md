# Subscriber notify flow

Email signup, confirmation, and unsubscribe for release notifications.

## Signup flow

```mermaid
sequenceDiagram
  participant User
  participant Form as NotifyForm
  participant API as POST /api/notify
  participant DB as subscribers
  participant SMTP as Mail

  User->>Form: email + policies + CAPTCHA
  Form->>API: submit
  API->>DB: create/refresh pending subscriber
  API->>SMTP: admin alert (new subscriber)
  API->>SMTP: confirmation email to user
  API-->>Form: ok
  Form-->>User: check inbox to confirm
```

## Confirmation flow

```mermaid
sequenceDiagram
  participant User
  participant API as GET /api/notify/confirm
  participant DB as subscribers
  participant SMTP as Mail

  User->>API: click link ?token=
  API->>DB: mark confirmed
  API->>SMTP: welcome email + unsubscribe link
  API-->>User: success HTML page
```

Token expires after **48 hours**. User can re-submit on `/feedback` to get a new link.

## Unsubscribe flow

```mermaid
flowchart LR
  A["User clicks unsubscribe\nin any email"] --> B["GET /api/notify/unsubscribe?token="]
  B --> C["Delete subscriber row"]
  C --> D["Success page"]
```

## Resend confirm (backfill)

For subscribers who signed up before deploy or never confirmed:

**One email:**

```bash
curl -X POST "https://your-domain.com/api/notify/resend-confirm" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{"email":"subscriber@example.com"}'
```

**All pending subscribers:**

```bash
curl -X POST "https://your-domain.com/api/notify/resend-confirm" \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_BROADCAST_KEY" \
  -d '{"allPending":true}'
```

```mermaid
flowchart LR
  A["POST resend-confirm"] --> B["Refresh confirm token"]
  B --> C["Send verification email"]
  C --> D["User clicks confirm"]
  D --> E["Confirmed → receives broadcasts"]
```

## Subscriber states

```mermaid
stateDiagram-v2
  [*] --> Pending: POST /api/notify
  Pending --> Confirmed: click confirm link
  Pending --> Pending: resend-confirm
  Confirmed --> [*]: unsubscribe
```

| State | Receives release broadcasts? |
|-------|------------------------------|
| Pending | **No** — must confirm first |
| Confirmed | **Yes** |

## API reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/notify` | Turnstile | Start subscription |
| `GET` | `/api/notify/confirm?token=` | Token | Confirm subscription |
| `GET` | `/api/notify/unsubscribe?token=` | Token | Unsubscribe |
| `POST` | `/api/notify/resend-confirm` | `x-admin-key` | Resend confirmation |
| `GET` | `/api/notify/stats` | None | Subscriber counts |

## Related guides

- [Feedback & resolve](06-feedback-and-resolve.md)
- [Release broadcast](08-release-broadcast.md)
