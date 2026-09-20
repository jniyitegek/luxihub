# Higa Lux Rwanda (LuxHub)

Quality assurance, directory and booking platform for accredited Rwandan hospitality
businesses — luxury lodges, fine dining and safari expeditions.

Built with Next.js 14 (App Router), Prisma and PostgreSQL.

---

## Quick start

```bash
npm install
cp .env.example .env          # then fill in the values below
npm run db:migrate            # create the schema
npm run db:seed               # optional: demo data
npm run dev
```

The app runs at http://localhost:3000.

### Required environment variables

The server validates its configuration once at startup (`src/lib/env.ts`) and refuses to
boot on anything invalid, so a misconfigured deployment fails immediately and visibly
rather than falling back to an insecure default.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `DIRECT_DATABASE_URL` | yes | Direct (non-pooled) connection, used by migrations. Same value as above when you are not behind PgBouncer. |
| `JWT_SECRET` | yes | ≥ 32 chars, unique per environment. `openssl rand -base64 48` |
| `RATING_IP_SALT` | in production | Salt for the hashed visitor IPs used in anti-spam. Generate the same way. |
| `NEXT_PUBLIC_APP_ENV` | yes | `development` \| `staging` \| `production`. Defaults to `production` when unset, so an unconfigured deployment is safe by default. |
| `NEXT_PUBLIC_APP_URL` | yes | Absolute public URL. Payment callbacks are built from it. |
| `NEXT_PUBLIC_DEMO_MODE` | no | `true` enables the seeded logins, quick-fill and role switcher. Rejected outright when `NEXT_PUBLIC_APP_ENV=production`. |

See `.env.example` for the complete annotated list, including the payment and media
settings below.

> `NEXT_PUBLIC_APP_ENV` — not `NODE_ENV` — decides the security posture. `next build`
> sets `NODE_ENV=production` even for a local smoke test, so keying off it would make a
> local production build indistinguishable from a real deployment.

---

## Payments

Payment rails are configured independently so you can go live on mobile money while
cards are still being certified:

```env
PAYMENTS_MOMO_PROVIDER=mtn_momo      # mtn_momo | flutterwave | manual
PAYMENTS_CARD_PROVIDER=flutterwave   # flutterwave | manual
```

| Rail | Gateway | What it does |
|---|---|---|
| `mtn_momo` | MTN MoMo Collections | Pushes a USSD prompt to the payer, then settles on callback or status poll. |
| `flutterwave` | Flutterwave Standard | Hosted checkout for cards and aggregated Airtel Money. |
| `manual` | — | Records the payment as `PENDING` for back-office reconciliation. **Never auto-approves.** |

`manual` is the default. A rail whose credentials are missing falls back to `manual`
rather than approving the payment.

### How settlement works

A reservation is **held, not confirmed**, until a gateway confirms the money moved:

1. `POST /api/payments/process` derives the amount **from the booking**, never from the
   request body, and asks the gateway to collect it.
2. The gateway responds asynchronously — on its webhook, or on a status poll from the
   checkout UI.
3. `settlePayment()` applies the outcome in one transaction: payment row, booking status,
   and the loyalty award. It is idempotent, so a retried webhook cannot double-credit.

Webhook bodies are **never trusted on their own**. Each one is authenticated
(`verif-hash` for Flutterwave, a shared secret in the callback URL for MTN), then the
transaction is re-read from the gateway API before anything is settled. A forged
"successful" callback cannot confirm a booking.

### Registering webhooks

| Gateway | URL |
|---|---|
| MTN MoMo | `https://<your-domain>/api/payments/webhooks/mtn-momo?secret=<MTN_MOMO_CALLBACK_SECRET>` |
| Flutterwave | `https://<your-domain>/api/payments/webhooks/flutterwave` (set the secret hash to `FLUTTERWAVE_WEBHOOK_HASH`) |

Both endpoints return 404 while their rail is disabled.

---

## Media hosting

`next/image` only optimises hosts you allow. Point `NEXT_PUBLIC_IMAGE_HOSTS` at your own
object storage (S3, Cloudinary, Vercel Blob):

```env
NEXT_PUBLIC_IMAGE_HOSTS="cdn.higalux.rw,res.cloudinary.com"
```

The Unsplash hosts behind the seeded demo photography are allowed **only** while demo
mode is on, so a production build cannot quietly keep depending on them. Migrate the
seeded image URLs to your own storage before go-live.

---

## Deploying

```bash
npm ci
npm run db:deploy      # apply migrations (uses DIRECT_DATABASE_URL)
npm run build
npm start
```

Pre-flight checklist:

- [ ] `NEXT_PUBLIC_APP_ENV=production` and `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] `JWT_SECRET` and `RATING_IP_SALT` are freshly generated and unique to this environment
- [ ] `NEXT_PUBLIC_APP_URL` is the real public URL (payment callbacks depend on it)
- [ ] Payment rails point at live credentials, and webhooks are registered
- [ ] Database backups and point-in-time recovery are enabled
- [ ] The seeded demo accounts have been removed or had their passwords rotated
- [ ] `/privacy`, `/terms` and `/legal` have been reviewed by counsel

> **Do not run `npm run db:seed` against production.** It deletes every record first and
> refuses to run when `NODE_ENV=production` unless `ALLOW_PRODUCTION_SEED=true`.

### Scaling note

Rate limiting (`src/lib/rateLimit.ts`) counts in process memory, so on a horizontally
scaled or serverless deployment the effective limit is `limit × instances`. That is an
adequate brute-force speed bump; for a strict global limit, back `consume()` with Redis
or Upstash.

---

## Roles

| Role | Access |
|---|---|
| `CUSTOMER` | Own bookings, payments, loyalty and reviews. Self-registers at `/login`. |
| `PARTNER` | Own listings, packages, reservations, payouts, subscriptions, Academy enrolments. |
| `ADMIN` | Everything, plus QA audits and certification. |

Partner and administrator accounts are provisioned by the Higa Lux team — `/api/auth/register`
only ever creates a `CUSTOMER`, regardless of what the request body asks for.

Route access is enforced twice: `src/middleware.ts` guards navigation at the edge, and
every API route re-checks authorisation against the database. The middleware is a
convenience; the API is the authority.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:seed` | Reset and seed demo data — **destructive** |

### Demo accounts

Only available when `NEXT_PUBLIC_DEMO_MODE=true` outside production. Password
`password123`, or whatever you set as `SEED_PASSWORD` when seeding.

| Email | Role |
|---|---|
| `admin@higalux.rw` | ADMIN |
| `partner@retreat.rw` | PARTNER |
| `customer@higalux.rw` | CUSTOMER |
