# Production readiness — remediation record

Resolution of every finding in `codebase_analysis.md`, plus defects found while
implementing them. Verified against a live PostgreSQL instance and a production build.

---

## 1. Shipping blockers

### 1 — SQLite persistence
`prisma/schema.prisma` now uses `postgresql` with `env("DATABASE_URL")` and a separate
`directUrl` for migrations behind a connection pooler. An initial migration is committed
at `prisma/migrations/`, and `db:migrate` / `db:deploy` scripts were added. Indexes were
added on every foreign key and on the columns the directory, leaderboard and dashboards
filter and sort by.

### 2 — Hardcoded fallback JWT secret
Removed. `src/lib/env.ts` validates the whole environment once at startup and refuses to
boot if `JWT_SECRET` is missing or under 32 characters. Token handling moved from
`jsonwebtoken` to `jose` (`src/lib/session.ts`) so the same verification runs in the Edge
middleware; `jsonwebtoken` was removed from the dependency tree. Tokens now carry issuer,
audience and subject claims, all verified. bcrypt cost raised 10 → 12.

### 3 — Demo role-switching endpoint
Gated twice: the deployment must have demo mode on — which `env.ts` refuses to allow when
`NEXT_PUBLIC_APP_ENV=production` — and the caller must already hold a session for one of
the seeded demo accounts. The switcher UI is hidden in the same conditions.

### 4 — Missing middleware / unprotected routes
`src/middleware.ts` verifies the session at the edge and enforces role access on
`/admin/*`, `/partner/*` and `/customer/*`, redirecting a signed-in user to their own
portal rather than to a login screen they have already passed. Stale cookies are cleared.
Signed-in users are bounced off `/login`. Every API route re-checks authorisation against
the database independently — the middleware is a convenience, not the authority.

### 5 — Partner dashboard business isolation leak
`|| data.businesses[0]` removed. The dashboard renders only listings whose `ownerId`
matches the signed-in partner, shows a listing switcher when they own several, and shows
an onboarding prompt when they own none. Booking figures are filtered to the selected
listing, so an administrator viewing the page no longer sees platform-wide revenue
attributed to one property.

### 6 — Simulated payment gateway
Replaced with a gateway abstraction (`src/lib/payments/`) implementing MTN MoMo
Collections and Flutterwave Standard, plus a `manual` reconciliation rail that records a
payment as `PENDING` and **never** self-approves. Mobile money and cards are configured
independently; a rail with missing credentials falls back to `manual`.

- The charged amount is derived from the booking, never from the request body.
- A reservation is confirmed only once a gateway reports settlement.
- `settlePayment()` applies payment, booking status and loyalty in one transaction and is
  idempotent, so retried webhooks cannot double-credit.
- Webhooks are authenticated (`verif-hash`; shared secret for MTN) **and** the transaction
  is re-read from the gateway API before settling — a forged callback cannot confirm a
  booking. Verified: a signed forged webhook left the booking `PENDING`/`UNPAID`.
- A retry on an in-flight payment resolves the existing transaction instead of starting a
  second one.
- The checkout UI polls `/api/payments/{ref}/status` instead of assuming success.

### 7 — Missing registration
`POST /api/auth/register` added, with password rules, honeypot-free validation, per-IP
throttling, duplicate detection and terms acceptance. The role is never read from the
request body — self-registration only ever creates a `CUSTOMER`. The login page now
performs a real signup instead of signing into a seeded account.

---

## 2. Hardcoded values and dev shortcuts

- **Auto-fill login** — removed. An empty form no longer signs anyone in as
  `customer@higalux.rw`.
- **Quick-fill buttons** — shown only when demo mode is on outside production.
- **Testimonials** — now fetched from `/api/testimonials`, which returns verified reviews
  attached to completed bookings, so the "only guests who stayed" claim is true. The seed
  creates those bookings and reviews as real rows.
- **Footer** — newsletter posts to `/api/newsletter` (honeypot, rate limit, resubscribe
  handling); social icons are read from env and omitted when unconfigured rather than
  linking to `#`; Privacy / Terms / Legal / Sitemap now point at real pages.
- **Academy enrolment** — the `business.findFirst()` fallback that attached a staff
  enrolment to an unrelated partner's business is gone; enrolment requires a listing the
  caller owns. A certificate number is no longer issued at enrolment; it follows
  completion.
- **Booking widget** — no longer falls back to a hardcoded guest identity
  (`Clarisse Mutoni` / `customer@higalux.rw`); an anonymous visitor is sent to sign in.
  Default dates were fixed literals that had already fallen into the past.
- **Sidebar avatar initials** — derived from the signed-in user instead of hardcoded to
  the three demo people.
- **Unsplash assets** — `next/image` hosts are now driven by `NEXT_PUBLIC_IMAGE_HOSTS`.
  The Unsplash hosts are permitted only in demo mode, so a production build cannot
  quietly keep depending on them. Migrating the seeded image URLs to your own storage is
  the remaining step, documented in the README.

---

## 3. Additional defects found and fixed

Not in the original report.

| Severity | Issue | Fix |
|---|---|---|
| **Critical** | `PATCH /api/bookings/[id]` had no authorisation at all — any signed-in user could set any booking to any status, including marking an unpaid stay `COMPLETED`. | Role-scoped transitions: guests may only cancel their own; hosts and admins confirm or complete; illegal transitions rejected. |
| **Critical** | `PATCH /api/support` let any authenticated user read and reply on **any** ticket by id. | Reporters are restricted to their own tickets; only admins move a ticket through its workflow. |
| **High** | `PATCH /api/reviews` let any partner reply to any review on the platform. | Restricted to the owner of the reviewed listing. |
| **High** | `POST /api/bookings` trusted a client-supplied `businessId` independent of the offering, so a reservation could be attributed to a different listing than the one being charged for. | The business is resolved from the offering. Availability, capacity, listing status and date sanity are now enforced. |
| **High** | `GET /api/academy` returned enrolment rows — participant names and emails — to unauthenticated callers. | Removed from the public response. |
| **Medium** | Pending and suspended listings were publicly reachable. | Hidden from the directory and detail route; still visible to the owner and admins. |
| **Medium** | Partners could self-assign `VERIFIED` status and a `LUXE_VERIFIED` badge by creating a listing. | New listings start `PENDING`/`NONE`; certification comes only from an audit. |
| **Medium** | Loyalty redemption read the balance and debited it in separate queries. | Moved into one transaction. |
| **Medium** | `/api/ratings` constructed a fresh `PrismaClient` per request through a `getDb()` workaround, leaking connections. | Removed; `src/lib/prisma.ts` is a clean singleton. |
| **Medium** | The public rating IP hash used a hardcoded salt compiled into the bundle. | Salt moved to `RATING_IP_SALT`, mandatory in production. |
| **Medium** | Every route returned raw `error.message`, leaking Prisma and internal detail. | Central `handleRouteError` — full detail logged server-side, generic message returned in production. |
| **Medium** | No rate limiting anywhere; login was open to unlimited brute force. | Per-IP and per-account throttling on login, registration, ratings and newsletter. Login also equalises response timing so the endpoint cannot be used to enumerate registered emails. |
| **Medium** | No request validation; bodies were destructured and trusted. | Zod schemas on every mutating route, with field-level errors surfaced to the UI. |
| **Low** | New listings defaulted to `ratingAvg 4.9` and `responseRate 98%`, showing fabricated social proof on a property with no reviews. Unaudited listings scored as near-certified. | Defaults are now zero; the UI shows "Newly listed" / "Awaiting reviews"; the quality engine no longer substitutes an optimistic audit score. |
| **Low** | Seed wrote `planTier: 'ELITE_AMBASSADOR'`, which no plan catalogue recognised. | Corrected to `ELITE`; aggregates are recomputed from seeded reviews so no listing advertises a review count it cannot show. |
| **Low** | `npm run db:seed` would wipe any database it was pointed at. | Refuses to run against production without an explicit override. |
| **Low** | No security headers. | HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy; `X-Powered-By` removed; `no-store` on all API responses. |
| **Low** | No `robots.txt` or sitemap; authenticated routes were crawlable. | Both added; dashboards and API disallowed. |

---

## 4. Verification

Run against a live PostgreSQL database and a production build:

- Middleware guards: anonymous → `/login?next=…`; wrong-role → own portal.
- Cross-tenant isolation: a partner cannot read another partner's bookings, add packages
  to their listings, or alter their reservations.
- Privilege escalation: customers cannot run audits, create listings, reply as partners,
  or self-assign a role at signup.
- Payments: an unsettled payment leaves the booking `PENDING`/`UNPAID` and awards no
  loyalty points; a settled one confirms exactly once and is idempotent across webhook
  replays; a signed but forged webhook cannot confirm a booking; unsigned webhooks are
  rejected 401 and disabled rails return 404.
- Booking rules: past check-in, over-capacity, cancelled-booking payment and
  review-before-completion are all rejected.
- Certification: badges are derived from the audit score server-side; a failing score
  removes the listing from the public directory.
- Production posture: demo mode is refused when `NEXT_PUBLIC_APP_ENV=production`; the
  role switcher returns 403; no demo credentials appear in the login page; the session
  cookie is `Secure; HttpOnly; SameSite=Lax`.
- `tsc --noEmit` clean, `next lint` clean (3 pre-existing warnings), production build
  succeeds.

---

## 5. Remaining before go-live

These need credentials, infrastructure or a human decision, and cannot be completed from
the codebase alone:

1. Provision PostgreSQL, set `DATABASE_URL` / `DIRECT_DATABASE_URL`, run `npm run db:deploy`.
2. Generate `JWT_SECRET` and `RATING_IP_SALT` per environment.
3. Obtain MTN MoMo and Flutterwave production credentials, switch the rails off `manual`,
   and register the webhook URLs.
4. Move the seeded Unsplash image URLs to your own object storage and set
   `NEXT_PUBLIC_IMAGE_HOSTS`.
5. Have counsel review `/privacy`, `/terms` and `/legal` — they are drafted from what the
   application actually does, but they are not legal advice.
6. Remove or rotate the seeded demo accounts.
7. Wire up transactional email (booking confirmations, the manual-payment instructions
   the checkout copy promises, newsletter delivery). No mail provider is integrated.
8. Add error tracking and uptime monitoring.
9. Back the rate limiter with Redis if you run more than one instance and need a strict
   global limit.
