# Decisions

Choices made while scaffolding Ojara, why, and what is still open. Newest context first in each
section. Dates are 2026.

## Open questions (need a product decision)

1. **Who holds customer money?** Either Ojara collects payments and pays merchants out (Ojara
   holds funds: likely needs a licence/escrow arrangement and payout logic), or each store gets a
   Paystack **subaccount** and Paystack splits the money at checkout (funds go straight to the
   merchant; Ojara never holds them). The schema supports both (`Store.paystackSubaccountCode`,
   `PaystackClient.createSubaccount` stub). The onboarding "Get paid" step (02.07) collects bank
   details, which fits subaccounts. **Recommendation: subaccounts.**
2. **"Draft" vs "Onboarding" store status.** The admin designs show both; the data model has one
   (`DRAFT`, labelled "Onboarding"). Should they be separate statuses?
3. **What does `DISABLED` mean?** It never appears in the designs. Currently it is the merchant's
   "temporarily close store" state (storefront shows 05.11).
4. **Staff seats per plan.** Designs disagree (see `docs/DESIGN_NOTES.md`). `PLANS` uses
   Free 1 / Starter 1 / Professional 5.
5. **SMS provider** (for SMS sign-in codes and SMS password reset in the designs, and the SMS
   notification toggles). Not chosen; email is used meanwhile.
6. **Sending domain.** `EMAIL_FROM` uses `hello@kinosmartng.com` (verified in Resend). To send from
   `ojara.kinosmartng.com` or a future Ojara domain, verify that domain in Resend first.
7. **Production root domain.** Designs use `{store}.ojara.store`. Needs registering, plus wildcard
   DNS and TLS for `*.ojara.store`.

## Runtime and tooling versions

All versions pinned exactly (`save-exact=true`). Chosen on 2026-11-15 as the latest stable release
unless noted.

| Package                | Version    | Note                                                                                                                                    |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js                | 26.13.1    | Current LTS (`.nvmrc`, `engines`)                                                                                                       |
| pnpm                   | 12.21.0    | `packageManager`                                                                                                                        |
| turbo                  | 2.11.11    |                                                                                                                                         |
| typescript             | **6.0.3**  | 7.0.2 is latest, but typescript-eslint (<6.1), ts-jest (<7), @nestjs/swagger (^5.5 \|\| ^6) and openapi-typescript don't support it yet |
| eslint                 | **9.39.5** | 10.x is latest, but eslint-config-next's react / jsx-a11y / import plugins only support ≤9                                              |
| @eslint/js             | 9.39.5     | matches ESLint 9                                                                                                                        |
| typescript-eslint      | 8.72.2     |                                                                                                                                         |
| eslint-config-prettier | 10.1.8     |                                                                                                                                         |
| globals                | 17.14.0    |                                                                                                                                         |
| prettier               | 3.10.1     |                                                                                                                                         |
| husky                  | 9.1.7      |                                                                                                                                         |
| lint-staged            | 17.6.0     |                                                                                                                                         |
| vitest                 | 5.1.0      | Used by every package (NestJS 12's default for ESM projects)                                                                            |
| @types/node            | 26.6.6     |                                                                                                                                         |

### Web (`apps/web`)

| Package                              | Version       | Note                                                                                   |
| ------------------------------------ | ------------- | -------------------------------------------------------------------------------------- |
| next                                 | 16.4.6        | App Router, `proxy.ts` (formerly middleware)                                           |
| react / react-dom                    | 19.3.1        |                                                                                        |
| @types/react / @types/react-dom      | 19.3.0        |                                                                                        |
| eslint-config-next                   | 16.4.6        |                                                                                        |
| tailwindcss / @tailwindcss/turbopack | 4.3.5         | Tailwind v4 via the Turbopack loader (create-next-app 16.4 default; no PostCSS config) |
| tw-animate-css                       | 1.4.0         |                                                                                        |
| shadcn (CLI + CSS)                   | 4.23.0        | `radix-nova` style, components restyled to Terra                                       |
| cn                                   | 0.5.2         | shadcn's class merger; configured with Ojara's font-size tokens                        |
| radix-ui                             | 1.8.1         |                                                                                        |
| class-variance-authority             | 0.7.1         |                                                                                        |
| lucide-react                         | 1.73.0        | Icons used by the designs                                                              |
| zod                                  | 4.6.7         |                                                                                        |
| server-only                          | 0.0.1         |                                                                                        |
| qrcode / @types/qrcode               | 1.5.4 / 1.5.6 | Admin two-step setup QR code                                                           |

### API (`apps/api`)

| Package                                         | Version                          | Note                                                                                                                                                                              |
| ----------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| @nestjs/common, core, platform-express, testing | 12.5.0                           | NestJS 12 is ESM-only; the API is ESM                                                                                                                                             |
| @nestjs/cli / @nestjs/schematics                | 12.0.13                          |                                                                                                                                                                                   |
| @nestjs/swagger                                 | 12.1.2                           | Converts Zod 4.2+ schemas to OpenAPI natively                                                                                                                                     |
| @nestjs/bullmq                                  | 12.0.2                           |                                                                                                                                                                                   |
| bullmq                                          | 6.7.6                            |                                                                                                                                                                                   |
| @nestjs/schedule                                | 12.0.4                           |                                                                                                                                                                                   |
| @nestjs/throttler                               | 6.7.1                            | Custom Redis storage with in-memory fallback                                                                                                                                      |
| nestjs-pino / pino / pino-http / pino-pretty    | 5.3.1 / 10.4.0 / 11.0.0 / 13.2.0 |                                                                                                                                                                                   |
| helmet                                          | 8.3.0                            |                                                                                                                                                                                   |
| prisma / @prisma/client / @prisma/adapter-pg    | **7.10.1**                       | `latest` on npm is 8.0.0-rc.33 (a release candidate); 7.10.1 is the latest stable                                                                                                 |
| pg / @types/pg                                  | 8.23.1                           |                                                                                                                                                                                   |
| ioredis                                         | 6.0.0                            |                                                                                                                                                                                   |
| better-auth                                     | **1.7.23**                       | 1.7.25 is latest, but pnpm 12's default `minimumReleaseAge` (24 h supply-chain policy) rejected 1.7.24/1.7.25, published <24 h earlier. Kept the policy; upgrade when convenient. |
| resend                                          | 6.38.1                           |                                                                                                                                                                                   |
| cloudinary                                      | 2.11.0                           |                                                                                                                                                                                   |
| zod                                             | 4.6.7                            |                                                                                                                                                                                   |
| reflect-metadata / rxjs                         | 0.2.2 / 7.8.2                    |                                                                                                                                                                                   |
| supertest / @types/supertest                    | 7.3.2 / 7.2.1                    |                                                                                                                                                                                   |
| tsx                                             | 4.23.15                          | Seed script                                                                                                                                                                       |

### Packages

| Package     | Version | Note                                                                                       |
| ----------- | ------- | ------------------------------------------------------------------------------------------ |
| react-email | 6.11.13 | Components and `render` now ship in `react-email`; `@react-email/components` is deprecated |

### Infrastructure images (`docker-compose.yml`)

| Service  | Image                     | Note                            |
| -------- | ------------------------- | ------------------------------- |
| Postgres | `postgres:18.7-alpine`    | 19 is still a release candidate |
| Redis    | `redis:8.10.3-alpine`     |                                 |
| Mailpit  | `axllent/mailpit:v1.33.1` |                                 |

## Deviations from the brief

| Brief                                                                   | What we did                                                                                                                                            | Why                                                                                                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `nestjs-zod` "or equivalent"                                            | NestJS 12's built-in `StandardSchemaValidationPipe` + `@Body({ schema })`                                                                              | nestjs-zod doesn't support NestJS 12; the built-in pipe does the same job, and Swagger reads the Zod schemas directly                    |
| Typed client generated from OpenAPI "or a thin typed fetch wrapper"     | Thin typed fetch wrapper (`apps/web/src/lib/api`) validating responses with the shared Zod schemas                                                     | openapi-typescript requires TypeScript 5; sharing Zod schemas gives compile-time and runtime checks with no codegen step                 |
| "Jest or Vitest for API"                                                | Vitest everywhere                                                                                                                                      | NestJS 12's default for ESM; one test runner across the repo                                                                             |
| Every module has a controller                                           | `database` and `email` have none                                                                                                                       | They are infrastructure; exposing them over HTTP would be wrong. `config` exposes `GET /v1/config/public`.                               |
| Docker Compose for local infra                                          | Compose is provided and is the recommended setup; the current dev machine instead uses **Neon** (Postgres), **Upstash** (Redis) and **Resend** (email) | Docker isn't installed on the dev machine. The app works with either.                                                                    |
| Shells only for UI                                                      | All 70 design screens built as static UI with sample data                                                                                              | Requested by the product owner after the scaffold                                                                                        |
| `next/image` with Cloudinary                                            | Custom `loaderFile` mapping widths to the four named presets                                                                                           | The official integration (`next-cloudinary`) is heavier than needed; presets limit transformation usage                                  |
| Cache Components (`cacheComponents: true`, the create-next-app default) | Off                                                                                                                                                    | It forces Suspense / `'use cache'` around every `params` and `headers()` read. Revisit when storefront pages render real catalogue data. |
| SMS password reset (design 02.03)                                       | Emailed one-time link                                                                                                                                  | No SMS provider yet                                                                                                                      |
| API runs as `tsx` / watch on Windows                                    | Use `pnpm --filter @ojara/api build && node dist/main.js` if `nest start --watch` crashes                                                              | Nest's watcher sometimes fails to kill its child process on Windows                                                                      |

## Architecture and security decisions

### Multi-tenancy

- **Shared schema, `storeId` on every tenant table**, two isolation layers:
  1. **Application:** `TenantContext` (AsyncLocalStorage) + a Prisma client extension that injects
     `storeId` into every query on tenant models, rejects writes/filters for another store
     (`CrossTenantAccessError`) and refuses queries with no tenant context. Platform-admin and
     system work must opt out explicitly with `TenantContext.runAsSystem(reason, fn)`.
  2. **Database:** Postgres RLS on every tenant table with `FORCE ROW LEVEL SECURITY`, keyed on
     `current_setting('app.current_store_id')`, set per query with `set_config(…, true)` (the
     transaction-local equivalent of `SET LOCAL`, which can't take bind parameters).
- The API connects as **`ojara_app`, a role without superuser or BYPASSRLS**. Migrations and the
  seed use the owner role. On Neon the owner (`neondb_owner`) has BYPASSRLS, so it must never be
  the runtime role.
- **`runForStore` / `runAsSystem` await inside the scope.** Prisma queries are lazy, so returning an
  un-awaited query from the callback would execute it outside the tenant scope. Found by the
  integration test; fixed.
- **Bypass flag is defence against bugs, not a compromised server.** `app.bypass_rls` can be set by
  any connection holding the app's credentials.
- **Limitation:** each extended-client query runs in its own short batch transaction. For
  multi-statement atomic work use `PrismaService.tenantTransaction()`.
- Tables use snake_case names (`@@map`); columns keep Prisma's camelCase.

### Authentication (Better Auth)

- **Integration:** Better Auth's Node handler is mounted on Express before Nest's body parser
  (`bootstrap.ts`) at `/v1/auth/*`. A global `SessionGuard`, plus `RolesGuard`, `StoreAccessGuard`
  and `InternalTokenGuard`. The community `@thallesp/nestjs-better-auth` was not used: it needs
  `bodyParser: false`, which conflicts with the raw-body Paystack webhook.
- **Cookies:** httpOnly session cookies shared across `*.ROOT_DOMAIN`, so the API must be on
  `api.ROOT_DOMAIN` in browsers (`api.ojara.localhost:4000` locally).
- **Password hashing:** Better Auth's default scrypt (memory-hard, OWASP-listed). Argon2id was
  considered and not needed.
- **Platform admins:** two-step sign-in (authenticator app + backup codes) is mandatory. Admin
  routes and admin access to any store return `TWO_FACTOR_REQUIRED` until it is enabled, and
  admins can only obtain sessions through password + second factor (Google and email-link
  sign-in are refused for them). Admin powers expire 8 hours after sign-in
  (`ADMIN_SESSION_MAX_HOURS`), enforced by the API guard from `session.createdAt`. Better Auth's
  sliding refresh would undo a shortened `expiresAt`.
- **Rate limiting:** Better Auth limits auth endpoints (sign-in/sign-up 5/min, reset 3 per 5 min,
  2FA 5/min) and stores counters in **Postgres**, so limits hold across instances without Redis.
  The client IP comes from the connection (Express `trust proxy` via `TRUST_PROXY`) and is passed
  in a server-set header, so clients can't choose their own bucket. The API-wide limit
  (120/min) uses Redis with an in-memory fallback and is keyed on the same client IP.
- **Server-rendered calls:** the web server calls the API on a browser's behalf (session, stores),
  forwarding the browser's cookie and its IP in `x-ojara-forwarded-for`. The API honours that
  header only alongside a valid `x-internal-token`; otherwise every page load would share the web
  server's rate-limit bucket. The web server takes the rightmost `X-Forwarded-For` entry. Next.js
  fills that header from the socket when it is absent but passes a client-supplied one through, so
  **in production Next must sit behind a proxy/load balancer that sets or appends
  `X-Forwarded-For`**. Otherwise a visitor can choose their page-load bucket. Auth endpoints
  are unaffected (browsers call Better Auth directly).
- **Leaked passwords:** Have I Been Pwned check on sign-up and reset (k-anonymity: only a 5-character
  hash prefix leaves the server). `PASSWORD_BREACH_CHECK=false` disables it offline.
- **Password reset:** emailed one-time link, 1 hour, revokes all sessions, transactional; the same
  response whether or not the email exists.
- **Google sign-in:** enabled only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set; new
  users land on onboarding. Account linking is on, with no forced linking for unverified emails.
  Not yet configured.
- **Customers never get accounts.**

### Email and queues

- Every email goes through the BullMQ `email` queue (6 attempts, exponential backoff, idempotency
  key as the job id; Resend also receives the key as `Idempotency-Key`). Transport: Resend if
  `RESEND_API_KEY` is set, else Mailpit's HTTP API, else the log.
- Workers use `drainDelay: 300` and `stalledInterval: 5 min` (`common/queue/worker-options.ts`) to
  keep idle Redis traffic low on per-command-billed providers such as Upstash. New jobs still start
  immediately; a job abandoned by a crashed worker is retried after up to ~5 minutes.
- BullMQ 6 also supports a Postgres backend; dropping Redis entirely is a possible future
  simplification.

### Media

- `ImageService` interface; `CloudinaryImageService` signs direct browser uploads into a
  server-chosen folder `ojara/{env}/{storeId}/{kind}`, checks plan limits (file size, images per
  product) first, and only `public_id`, width, height and format are stored. Delivery URLs use four
  named presets (`thumb`, `card`, `detail`, `logo`) with `f_auto,q_auto`.

### Payments

- `POST /v1/webhooks/paystack` verifies HMAC-SHA512 over the raw body, stores a `WebhookEvent`
  first (unique on provider + event id), then enqueues processing. A duplicate of an unprocessed
  event is re-enqueued, so an event stored while Redis was down still gets processed.
  **The webhook, not the browser redirect, is the source of truth for payment status.**
- Paystack has no top-level event id; `event:data.id` (or reference) is used.

### Web

- Host routing in `proxy.ts`; tenant resolution via `GET /v1/internal/tenants/resolve` with an
  in-memory TTL cache (60 s; misses 10 s). TODO: move to Redis with invalidation on store changes.
- Storefront pages are Server Components with minimal client JS (quantity stepper, gallery, active
  nav link only).
- Signed-in surfaces are gated in three layers:
  - **`proxy.ts` (optimistic):** sends visitors with no session cookie to `/login?next=…`; only
    same-site relative paths are accepted as `next`.
  - **Layouts and pages (verified):** call `requireMerchant()`, `requireAdmin()` or
    `requireUser()` (`lib/auth/guards.ts`), which check the session with the API. Merchants without
    a store go to `/onboarding`, admins without two-factor to `/security`, and non-admins on the
    admin host see "No admin access". Pages call these too, because layouts don't re-run on
    client-side navigation.
  - **The API:** the security boundary, it re-checks every call.

  The active store is the `ojara_store` cookie, else the first membership; the switcher that
  sets it is not built yet. `/security` is in its own route group, outside the admin shell that
  redirects to it.

- **Catalogue** (`apps/api/src/catalog`, dashboard Products and Categories):
  - **Variants:**
    - Every product has at least one variant, which holds its stock. A simple product has one
      variant with no options.
    - A product has up to 3 option groups (`products.options`, e.g. Size: S/M/L) and up to 100
      variants. Each variant may override the product's price.
  - **Saving** replaces the whole variant set:
    - Variants are matched by option combination, so a size that survives keeps its id.
    - Removed variants are deleted; order items keep their own snapshot, so past orders are
      unaffected.
    - SKUs are unique per store, and a clash returns `SKU_TAKEN`.
  - **Plan rules:** these are enforced by the API and mirrored in the UI.
    - The Free plan allows 20 products, not counting archived ones (`PLAN_LIMIT_REACHED`).
      Restoring a product counts against the limit.
    - Sale prices need Starter (`PLAN_FEATURE_LOCKED`, `PLANS[...].limits.promotions`).
  - **Archiving:**
    - An archived product stays archived when edited; only Restore brings it back, as a draft.
    - Categories are archived rather than deleted. Their products keep the category and can still
      be saved with it.
  - **Not built yet:** menu order uses up/down buttons rather than drag-and-drop. Photos and
    category covers wait for real Cloudinary keys. Collections have no model yet.
- **Product photos:**
  1. The browser asks `POST /media/sign`, which checks plan limits and signs the upload into the
     store's folder.
  2. The browser uploads straight to Cloudinary.
  3. The browser calls `POST …/products/:id/images`. The API re-reads the file from Cloudinary
     (folder, size, dimensions) instead of trusting the browser, and checks the limits again. An
     upload that breaks them is deleted.
  - Removing a photo deletes the file. That deletion is best effort: a leftover file only costs
    storage.
  - Photo changes apply immediately, not on "Save changes". The first photo is the cover.
  - TODO: a cleanup job for uploads that were never registered (for example, a closed tab).
- **Storefront:**
  - Shopper data comes from `GET /v1/internal/storefront/:storeId/*`. These endpoints take the
    internal token, no session, are rate-limited per shopper, and only return published products
    of published stores.
  - Prices and availability are pure functions (`storefront-pricing.ts`):
    - A variant's own price wins.
    - The sale price applies only if the plan allows promotions.
    - Stock rules follow the product's settings.
  - Listing filters and sorts in memory, which is fine within plan product limits.
  - The cart lives in the shopper's browser (`localStorage`; each store is its own origin). It
    only snapshots prices; checkout will re-price.
  - Until checkout exists:
    - The cart offers "Order on WhatsApp" with the items pre-filled.
    - `/checkout*` redirects to the cart.
    - `/track` says tracking is coming soon.
  - Content merchants can't write yet (hero copy, story, announcement bar, policies) uses neutral
    defaults built from the store, rather than the design's sample text.
- **Database waking up:** Prisma transactions may take up to 10 s to start (default 2 s). Neon
  suspends idle compute, and the first query after a quiet period failed while it resumed.
- **Onboarding** (`app/(onboarding)/dash/onboarding`):
  - **Saving:** each step's Continue posts to a Server Action (`actions.ts`). It authenticates,
    takes the store from the session (never from the form), re-validates with the shared Zod
    schemas and calls the API, which checks the store role and validates again.
  - **The form:** submits through a transition rather than the `action` prop, so a validation
    error doesn't wipe what the merchant typed.
  - **Step 1** creates the store as a DRAFT on the Free plan. Its address is generated from the
    name (`suggestStoreSlug`, numbered when taken), and the merchant can change it in step 2,
    which checks availability live.
  - **Progress:** `stores.onboardingStep` holds the furthest step reached and never moves
    backwards. Steps beyond it redirect, so the flow can't be skipped by URL.
  - **Not built yet:** steps 3–5 (products, payments, delivery) say "coming soon" and record
    progress only. Logo upload waits for real Cloudinary keys.
  - **Step 6** publishes the store (owner only), which sets `onboardingCompletedAt`.
  - **Leaving early:** "Save & exit" goes to the dashboard, which shows a "Finish setting up"
    banner until the store is published.
  - This keeps the existing `DRAFT` status for unfinished stores rather than adding an
    `ONBOARDING` status, which is still an open question.
- **Storefront tenant header:** the proxy passes the resolved store to the storefront layout
  URI-encoded. Header values must be Latin-1, and names such as "Ọjà Èkó" crashed the storefront
  when sent as raw JSON.
- **Tenant cache:** stores that aren't live are cached for at most 10 s, so a newly published
  store is reachable within seconds.
- Env validated with Zod at boot in both apps.
- `cn` is taught the custom font-size tokens; without it, `text-ui`/`text-2xs` etc. were dropped
  next to text colours. The 15 px size token is `text-title` (`text-card` clashed with the card
  colour).

## Design-versus-brief conflicts

Listed with the decision taken in `docs/DESIGN_NOTES.md` → "Conflicts between the designs and the
product rules": store status labels, missing Unpaid badge, fulfilment wording, staff seats,
Professional's fair-use cap, SMS vs email password reset, category counts, mobile tab badge
contrast.
