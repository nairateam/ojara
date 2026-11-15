# Ojara

Online stores for small businesses in Nigeria. Merchants create a store, customers buy from it, and
Paystack handles payments.

This repository is a pnpm + Turborepo monorepo:

```
ojara/
├─ apps/
│  ├─ web/            Next.js 16: marketing site, storefronts, merchant dashboard, admin console
│  └─ api/            NestJS 12 API (REST + OpenAPI), Prisma 7, Better Auth, BullMQ
├─ packages/
│  ├─ shared/         Zod schemas, constants (plans, statuses, reserved slugs), host + money utils
│  ├─ email/          React Email templates (welcome, verify email, password reset, order)
│  ├─ tsconfig/       Shared TypeScript configs
│  └─ eslint-config/  Shared ESLint flat configs
├─ infra/postgres/    Postgres init script (creates the restricted app role)
├─ docker-compose.yml Local Postgres, Redis and Mailpit
└─ docs/              DECISIONS.md, DESIGN_NOTES.md
```

- **Why things are the way they are:** [`docs/DECISIONS.md`](docs/DECISIONS.md)
- **Which design screen lives where:** [`docs/DESIGN_NOTES.md`](docs/DESIGN_NOTES.md)

## Prerequisites

- **Node.js 26.13.1** (see `.nvmrc`; with nvm: `nvm install && nvm use`)
- **pnpm 12.21.0** (`npm i -g pnpm@12.21.0`, or `corepack enable`)
- Postgres 18, Redis and an email transport. Pick one of:
  - **Docker** (recommended): `pnpm infra:up` starts Postgres, Redis and Mailpit.
  - **Hosted services** (no Docker): e.g. Neon (Postgres), Upstash (Redis), Resend (email).
    See [Running without Docker](#running-without-docker).

## Getting started

```bash
pnpm install

# 1. Environment files (never commit the copies)
cp .env.example .env                    # docker-compose settings
cp apps/api/.env.example apps/api/.env  # API settings
cp apps/web/.env.example apps/web/.env  # web settings
#    Then, in both app .env files, set INTERNAL_API_TOKEN to the same random value, and set
#    BETTER_AUTH_SECRET in apps/api/.env:  openssl rand -base64 32

# 2. Infrastructure, schema and demo data
pnpm infra:up      # Postgres + Redis + Mailpit (Docker)
pnpm db:migrate    # applies migrations, including the row-level security policies
pnpm db:seed       # plans, a platform admin, and the demo store

# 3. Run everything
pnpm dev           # web on :3000, API on :4000
```

Then open:

| URL                                  | What                                                    |
| ------------------------------------ | ------------------------------------------------------- |
| http://ojara.localhost:3000          | Marketing site                                          |
| http://app.ojara.localhost:3000      | Merchant dashboard (`/login`, `/signup`, `/onboarding`) |
| http://admin.ojara.localhost:3000    | Admin console (`/login`)                                |
| http://demo.ojara.localhost:3000     | The seeded demo store ("Adùnní Threads")                |
| http://anything.ojara.localhost:3000 | Friendly "store not found" page                         |
| http://api.ojara.localhost:4000/docs | API docs (Swagger UI, non-production only)              |
| http://localhost:8025                | Mailpit inbox (local emails)                            |

Seeded accounts (local only):

| Role                               | Email                  | Password                                     |
| ---------------------------------- | ---------------------- | -------------------------------------------- |
| Merchant (owner of the demo store) | `demo@ojara.localhost` | `Demo-Merchant-123`                          |
| Platform admin                     | `SEED_ADMIN_EMAIL`     | `SEED_ADMIN_PASSWORD` (from `apps/api/.env`) |

Platform admins must set up two-step sign-in (an authenticator app) on first sign-in; the admin
console sends you to `/security` to do it.

## How local subdomains work

Ojara routes by host name: the root domain is the marketing site, `app.` is the merchant dashboard,
`admin.` is the admin console, and any other sub-domain is a store (`{store-slug}.ojara.localhost`).

Modern browsers (Chrome, Edge, Firefox, Safari) resolve every `*.localhost` name to `127.0.0.1`
without hosts-file changes, so `demo.ojara.localhost:3000` just works. For command-line tools that
don't, use `curl --resolve demo.ojara.localhost:3000:127.0.0.1 http://demo.ojara.localhost:3000/`.

Under the hood, `apps/web/src/proxy.ts` rewrites each host to an internal route group and, for
stores, resolves the host through the API (`GET /v1/internal/tenants/resolve`) and caches the
result for 60 seconds.

The session cookie is shared across `*.ojara.localhost`, so browsers must reach the API as
`api.ojara.localhost:4000` (already the default `NEXT_PUBLIC_API_URL`), not `localhost:4000`.

**Port 3000 taken?** Run the web app on another port, e.g.
`pnpm --filter @ojara/web exec next dev --port 3001`, and add the matching origins
(`http://app.ojara.localhost:3001`, …) to `CORS_ORIGINS` in `apps/api/.env`.

## Running without Docker

Any Postgres 18, Redis and email provider work. With hosted services:

1. **Postgres (e.g. Neon).** Put the owner connection string (connection pooling **off**) in
   `DATABASE_MIGRATION_URL`. Create the restricted runtime role and use it for `DATABASE_URL`:
   ```sql
   CREATE ROLE ojara_app LOGIN PASSWORD '<strong random password>'
     NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
   GRANT CONNECT ON DATABASE <db> TO ojara_app;
   GRANT USAGE ON SCHEMA public TO ojara_app;
   ```
   Then `pnpm db:deploy && pnpm db:seed`. The app must **never** connect as the owner: on Neon the
   owner can bypass row-level security. Use `sslmode=verify-full` in the URLs.
2. **Redis (e.g. Upstash).** Put the `rediss://…` URL in `REDIS_URL`. The queue workers are tuned
   to keep idle commands low (see `apps/api/src/common/queue/worker-options.ts`).
3. **Email.** Set `RESEND_API_KEY` and an `EMAIL_FROM` on a domain verified in Resend. With no
   Resend key and no Mailpit, emails (including their links) are printed to the API log.

## Scripts

Run from the repository root.

| Script                              | What it does                                                                |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`                          | Web (:3000) and API (:4000) in watch mode                                   |
| `pnpm build`                        | Build every package and app                                                 |
| `pnpm lint`                         | ESLint everywhere                                                           |
| `pnpm typecheck`                    | TypeScript everywhere                                                       |
| `pnpm test`                         | Unit tests (Vitest)                                                         |
| `pnpm test:integration`             | Tenant-isolation tests against a migrated database (Prisma extension + RLS) |
| `pnpm db:migrate`                   | Create/apply migrations in development (`prisma migrate dev`)               |
| `pnpm db:deploy`                    | Apply existing migrations (CI, hosted databases, production)                |
| `pnpm db:seed`                      | Seed plans, the admin and the demo store (idempotent)                       |
| `pnpm db:reset`                     | Drop and recreate the database, then re-seed (**destroys data**)            |
| `pnpm infra:up` / `pnpm infra:down` | Start / stop Postgres, Redis and Mailpit in Docker                          |
| `pnpm format`                       | Prettier                                                                    |

A pre-commit hook (Husky + lint-staged) lints and formats staged files.

On Windows, if `nest start --watch` stops with "process … could not be terminated", run the built
API instead: `pnpm --filter @ojara/api build && node apps/api/dist/main.js`.

## Architecture in brief

- **Tenancy:** one database, shared schema, `storeId` on every tenant table, isolated twice: a
  Prisma extension scopes every query to the current store (from an AsyncLocalStorage context set
  by `StoreAccessGuard`), and Postgres row-level security enforces the same boundary for the
  restricted `ojara_app` role. Platform-level work opts out explicitly with
  `TenantContext.runAsSystem(reason, fn)`.
- **Auth:** Better Auth (email + password with verification, optional Google, two-step sign-in,
  password reset, breached-password check, rate limits stored in Postgres). Sessions are httpOnly
  cookies shared across sub-domains. Roles: `PLATFORM_ADMIN` globally; `OWNER | MANAGER | STAFF`
  per store.
- **Background work:** BullMQ queues on Redis: `email` (every email) and `payments` (Paystack
  webhooks). A scheduled job placeholder reconciles pending payments.
- **Money** is always integer kobo (`formatKobo` for display). Currency is per store (`NGN`).
- **Media:** Cloudinary behind an `ImageService` interface; browsers upload directly with a signed
  payload, and only `public_id`s are stored.
- **Payments:** Paystack webhook (raw-body HMAC check, idempotent) is the source of truth for
  payment status; the `PaystackClient` methods are typed stubs.

## Environment variables

Every variable is documented in the example files:

- [`.env.example`](.env.example): Docker Compose (local Postgres, Redis, Mailpit)
- [`apps/api/.env.example`](apps/api/.env.example): API (database, Redis, auth, email, Cloudinary, Paystack, Google)
- [`apps/web/.env.example`](apps/web/.env.example): web (root domain, API URLs, Cloudinary cloud name)

Both apps validate their environment with Zod at startup and refuse to boot with a clear list of
problems.

## CI

`.github/workflows/ci.yml`: install → lint → typecheck → unit tests → migrate a Postgres service
container (with the restricted app role) → tenant-isolation integration tests → build.
