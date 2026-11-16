# Design notes

How the Ojara designs map onto the web app (`apps/web`), what each screen's status is, and where
the implementation departs from the designs.

- **Design source:** `~/Desktop/Startup/ojara design` (PNG exports, editable HTML per section,
  `tokens/ojara-terra.tokens.json`). The folder is read-only; nothing in it was modified.
- **Theme:** "Terra". Two brand colours, paper `#EBEDDF` and forest `#333A2F`, plus tints; status
  colours are the only exception. Storefronts use the merchant's brand instead (see below).
- **Single source of truth for tokens:** `apps/web/src/app/globals.css` (CSS variables + Tailwind
  v4 `@theme`). shadcn/ui's semantic variables are mapped onto the Terra tokens there.

## Status legend

| Status              | Meaning                                                                                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI built**        | The screen is implemented as a real route matching the design, with static sample data from `apps/web/src/mock/*`. Buttons that would change data (Save, Publish, Pay…) do nothing yet. |
| **UI built + live** | As above, and wired to the API (real data or real actions).                                                                                                                             |
| **Component**       | A foundation board: implemented as shared components, not a page.                                                                                                                       |
| **Not in Phase 1**  | Not implemented.                                                                                                                                                                        |

> The original brief asked only for layout shells. All screens were later built out as full
> static UI at the product owner's request, so most screens are "UI built" rather than "shell".

## Hosts and route groups

Next.js `proxy.ts` rewrites each host to an internal route group (visible URLs never include the
internal prefix):

| Host (local)                                              | Route group                              | Internal prefix      |
| --------------------------------------------------------- | ---------------------------------------- | -------------------- |
| `ojara.localhost:3000`                                    | `(marketing)`                            | `/marketing`         |
| `app.ojara.localhost:3000`                                | `(auth)`, `(onboarding)`, `(dashboard)`  | `/dash`              |
| `admin.ojara.localhost:3000`                              | `(auth)`, `(admin)`                      | `/admin-site`        |
| `{slug}.ojara.localhost:3000` or a verified custom domain | `(storefront)` → `(shop)` / `(checkout)` | `/store-site/{host}` |
| anything else                                             | friendly 404                             | —                    |

## Screen map

### 00 Foundations and 07 Logo

| Screen                   | Status         | Where                                                                                                                                                                                                                           |
| ------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00.01 Button – Primary   | Component      | `components/ui/button.tsx` (`variant="primary"`)                                                                                                                                                                                |
| 00.02 Button – Secondary | Component      | `components/ui/button.tsx` (`variant="secondary"`)                                                                                                                                                                              |
| 00.03 Badge – Fulfilment | Component      | `components/ui/badge.tsx` → `FulfilmentBadge`, `StatusPill`                                                                                                                                                                     |
| 00.04 Badge – Payment    | Component      | `components/ui/badge.tsx` → `PaymentBadge`                                                                                                                                                                                      |
| 00.05 Top Bar            | Component      | `components/app/top-bar.tsx`                                                                                                                                                                                                    |
| 00.06 Sidebar            | Component      | `components/dashboard/merchant-sidebar.tsx`, `components/app/sidebar-nav.tsx`                                                                                                                                                   |
| 00.07 System States      | Component      | `components/dashboard/system-states.tsx`, `components/app/empty-state.tsx`, `components/ui/feedback.tsx` (Alert, Toast); used on Orders (loading skeleton, payment failed), Products (plan limit), order detail (success toast) |
| 07 Logo Concepts         | Not in Phase 1 | Screens use the text wordmark (`components/brand/wordmark.tsx`). The OJ monogram is marked "Favourite · on hold" in the designs, so it is not used; a provisional favicon is in `app/icon.svg`.                                 |

### 01 Public site — `(marketing)` on the root domain

Rebuilt to the premium redesign (`ojara design - customer-facing`, screens 08–14): forest hero card
with the nav inside, Bricolage + Instrument Serif italic headings, closing CTA + footer card. Hero
height is capped at the viewport on desktop. Scroll reveal, marquee and hover motion are in
`site-motion.tsx` + `globals.css` (off for reduced motion). Sample copy lives in `mock/site-*.ts`.

| Screen          | Route                                                   | Status              |
| --------------- | ------------------------------------------------------- | ------------------- |
| 08 Home         | `/` (responsive)                                        | Built               |
| 09 Pricing      | `/pricing` (plans from `PLANS`; yearly = 10× monthly)   | Built               |
| 10 How it works | `/how-it-works`                                         | Built               |
| 11 About        | `/about` (Careers hidden: no jobs)                      | Built               |
| 12 Stores       | `/stores` (search, category, city, sort on sample data) | Built               |
| 13 Blog         | —                                                       | Hidden: no blog yet |
| 14 Contact      | `/contact` (message form hidden: no backend)            | Built               |
| Help centre     | `/help`, `/help/[slug]` (old content, new hero/nav)     | Built               |

Hidden until they exist: blog, newsletter sign-up, social links, video tour, contact form, free
trial wording, pricing rows for features Ojara doesn't have (templates, abandoned-cart reminders,
analytics, WhatsApp order alerts), GIG Logistics / Google Sheets integrations.

### 02 Auth and onboarding — `(auth)` and `(onboarding)` on `app.` (admin login on `admin.`)

| Screen                                 | Route                                    | Status                                                                           |
| -------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| 02.01 Log In                           | `/login`                                 | UI built + live (email + password, two-step code, Google when configured)        |
| 02.02 Sign Up                          | `/signup`                                | UI built + live (phone field not sent anywhere yet)                              |
| 02.03 Reset Password                   | `/reset-password`, `/reset-password/new` | UI built + live — **by emailed link, not SMS code** (see conflicts)              |
| 02.04 Onboarding 1 – Business Details  | `/onboarding`                            | **Live**: creates the draft store (address generated from the name) / updates it |
| 02.05 Onboarding 2 – Store Setup       | `/onboarding/store`                      | **Live**: name, address (live availability check), brand colour; logo later      |
| 02.06 Onboarding 3 – Add Products      | `/onboarding/products`                   | UI + saved progress; "coming soon" note (needs image uploads)                    |
| 02.07 Onboarding 4 – Get Paid          | `/onboarding/payments`                   | UI + saved progress; "coming soon" note (needs Paystack decision)                |
| 02.08 Onboarding 5 – Delivery          | `/onboarding/delivery`                   | **Live**: same editor as 03.11; saves, then continues                            |
| 02.09 Onboarding 6 – Preview & Publish | `/onboarding/publish`                    | **Live**: real checklist; publishes the store (owner only)                       |

### 03 Merchant app (desktop) and 04 Merchant app (mobile) — `(dashboard)` on `app.`

| Screen                               | Route                                            | Status                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 03.01 Dashboard                      | `/`                                              | UI built                                                                                                                                               |
| 03.02 Dashboard – Notifications Open | bell in the top bar (popover)                    | UI built                                                                                                                                               |
| 03.03 Orders                         | `/orders` (`?tab=`, `?order=`, `?q=`, `?page=`)  | Live (real orders; mock filters/export/bulk select removed)                                                                                            |
| 03.04 Products                       | `/products`                                      | **Live**: tabs with counts, search (name/SKU), paging, plan usage; no photos yet                                                                       |
| 03.05 Edit Product                   | `/products/[id]`, `/products/new`                | **Live**: details, prices, options → variants (stock/price/SKU/on-off), status, category, inventory; archive/restore; photos and collections not built |
| 03.06 Inventory                      | `/inventory`                                     | UI built                                                                                                                                               |
| 03.07 Customers                      | `/customers` (`?customer=`)                      | UI built                                                                                                                                               |
| 03.08 Reports                        | `/reports`                                       | UI built                                                                                                                                               |
| 03.09 Categories                     | `/categories` (`?category=`)                     | **Live**: create/edit, menu on/off, order (up/down buttons, not drag), archive/restore, products list; cover images not built                          |
| 03.10 Storefront Editor              | `/storefront` (`?device=mobile`)                 | UI built                                                                                                                                               |
| 03.11 Delivery                       | `/delivery`                                      | **Live**: zones (charge, arrives, covers, on/off), free-delivery threshold, pickup, processing notes; checkout preview                                 |
| 03.12 Payments                       | `/payments` (`?tab=payouts`, `?tab=refunds`)     | UI built                                                                                                                                               |
| 03.13 Domains                        | `/domains`                                       | UI built                                                                                                                                               |
| 03.14 Help & Support                 | `/help`                                          | UI built                                                                                                                                               |
| 03.15 Settings – Store Details       | `/settings`                                      | UI built                                                                                                                                               |
| 03.16 Settings – Plan & Billing      | `/settings/billing`                              | UI built                                                                                                                                               |
| 03.17 Settings – Staff               | `/settings/staff`                                | UI built                                                                                                                                               |
| 03.18 Settings – Notifications       | `/settings/notifications`                        | UI built                                                                                                                                               |
| 03.19 Settings – Policies            | `/settings/policies` (`?policy=`)                | UI built                                                                                                                                               |
| 04.01 Home (mobile)                  | `/` (responsive; mobile header + bottom tab bar) | UI built                                                                                                                                               |
| 04.02 Orders (mobile)                | `/orders` (responsive cards)                     | Live                                                                                                                                                   |
| 04.03 Order Detail (mobile)          | `/orders/[id]` (two-column on desktop)           | Live                                                                                                                                                   |

### 05 Storefront — `(storefront)` on `{slug}.` / custom domains

`(shop)` pages get the announcement bar, header and footer; `(checkout)` pages get the minimal
checkout header (or a brand-only header for the result pages).

| Screen                    | Route                                                                           | Status                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 05.01 Home                | `/`                                                                             | **Live**: newest products, category tiles, newest photo as hero; hero copy / story band wait for the storefront editor               |
| 05.02 Category            | `/shop`, `/shop/[category]` (`?q=` search)                                      | **Live**: category, price range, in stock, sort, search, pages; size/colour filters dropped (merchant-named options)                 |
| 05.03 Product             | `/products/[slug]`                                                              | **Live**: photos, option pickers, per-variant price/availability, add to cart, related; delivery rows removed (no delivery data yet) |
| 05.04 Cart                | `/cart`                                                                         | **Live**: cart saved in the browser; "Order on WhatsApp" until online checkout                                                       |
| 05.05 Checkout            | `/checkout`                                                                     | Live; redirects to the cart unless the store has a payout account and a delivery option                                              |
| 05.06 Order Confirmed     | `/checkout/confirmed`                                                           | Live (`?reference=`; paid / confirming with auto-refresh)                                                                            |
| 05.07 Payment Failed      | `/checkout/failed`                                                              | Live (`?reference=`)                                                                                                                 |
| 05.08 Track Order         | `/track`                                                                        | UI built; shows "coming soon" until orders exist                                                                                     |
| 05.09 Our Story & Contact | `/about`                                                                        | **Live** (contact channels from the store); story half waits for the storefront editor                                               |
| 05.10 Returns Policy      | `/policies/[policy]` (returns, delivery, size-guide, privacy, terms)            | **Live** layout; text says the policy isn’t published yet (merchant policies not built); size guide dropped                          |
| 05.11 Temporarily Closed  | shown automatically for DISABLED/SUSPENDED stores; preview at `/closed-preview` | UI built + live                                                                                                                      |
| 05.12 Mobile – Home       | `/` (responsive, WhatsApp button)                                               | **Live** (as 05.01)                                                                                                                  |
| 05.13 Mobile – Product    | `/products/[slug]` (sticky Add to cart)                                         | **Live** (as 05.03)                                                                                                                  |
| 05.14 Mobile – Cart       | `/cart` (sticky Checkout)                                                       | **Live** (as 05.04)                                                                                                                  |
| 05.15 Mobile – Checkout   | `/checkout` (sticky Pay)                                                        | UI built; redirects to the cart until payments                                                                                       |

### 06 Admin console — `(admin)` on `admin.`

| Screen                | Route                      | Status   |
| --------------------- | -------------------------- | -------- |
| 06.01 Overview        | `/`                        | UI built |
| 06.02 Merchants       | `/merchants`               | UI built |
| 06.03 Merchant Detail | `/merchants/[id]`          | UI built |
| 06.04 Subscriptions   | `/subscriptions` (`?tab=`) | UI built |
| 06.05 Plans           | `/plans`                   | UI built |
| 06.06 Reports & Abuse | `/reports` (`?case=`)      | UI built |
| 06.07 Support Tickets | `/support` (`?ticket=`)    | UI built |
| 06.08 Announcements   | `/announcements`           | UI built |
| 06.09 Audit Log       | `/audit-log`               | UI built |
| 06.10 Admin Settings  | `/settings`                | UI built |

## Pages not in the designs

Built with the same tokens and components:

| Page                          | Route                                                 | Why                                                               |
| ----------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| Store not found (404)         | any unknown host or path                              | Friendly 404 for unknown subdomains and paths                     |
| Service unavailable           | shown by the proxy when the API can't resolve a store | Storefront resilience                                             |
| Admin log in                  | `admin.` `/login`                                     | Admins sign in on the admin host; 02.01 layout without Google/SMS |
| Admin two-step setup          | `admin.` `/security`                                  | Admins must enrol an authenticator app before using the console   |
| Choose a new password         | `app.` `/reset-password/new`                          | Landing page for the emailed reset link                           |
| Mobile "More" tab             | `app.` `/more`                                        | The 04.xx tab bar has a "More" tab with no designed screen        |
| Dashboard section placeholder | `app.` `/[...section]`                                | Catch-all for nav items without a screen yet                      |

## Assets

- **Brand assets:** none to copy. Every screen uses a text wordmark (Bricolage Grotesque 700 +
  dot), icons are lucide (`lucide-react`), and the merchant logo is a coloured tile with an initial.
- **Sample photography:** `html/images/generated*.png` (JPEG data) copied to
  `apps/web/public/mock/generated*.jpg`, resized to ≤1600px and recompressed (15.8 MB → 2.5 MB).
  Demo content only; real product images will come from Cloudinary.
- **App screenshots** used on marketing pages: 9 files copied to `apps/web/public/mock/screens/`
  (recompressed, 2.5 MB → 0.7 MB).
- **Fonts:** Inter, Bricolage Grotesque (with the optical-size axis), JetBrains Mono and Fraunces,
  all via `next/font/google`. No substitutions were needed.
- **Instagram icon:** lucide-react 1.x has no brand icons, so a small inline SVG is used.

## Conflicts between the designs and the product rules

Rule applied: designs win on visuals and layout; the brief/PRD wins on behaviour and data. All of
these are also listed in `docs/DECISIONS.md`.

| Topic                      | Design                                                                                                                             | Implementation                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Store status               | Admin shows "Live", "Onboarding", "Draft", "Suspended pending review"; DISABLED never appears                                      | Enum stays `DRAFT / PUBLISHED / DISABLED / SUSPENDED`; labels map DRAFT→"Onboarding", PUBLISHED→"Live", DISABLED→"Closed". "Draft" vs "Onboarding" is an **open question**. |
| Unpaid payment             | No "Unpaid" badge is designed                                                                                                      | `PaymentBadge` shows UNPAID with a muted dashed circle                                                                                                                      |
| Fulfilment labels          | Tabs say "Ready"; storefront uses customer wording                                                                                 | Merchant labels in `FULFILMENT_LABELS`; storefront uses `CUSTOMER_FULFILMENT_LABELS` (Order placed / Being prepared / On its way / Delivered)                               |
| Staff seats                | Pricing says Professional adds staff; billing shows Starter "1 of 1"; admin matrix Free 1 / Starter 1 (pending 2) / Professional 5 | `PLANS` uses 1 / 1 / 5 (published values)                                                                                                                                   |
| Professional product limit | "Unlimited (fair use)"                                                                                                             | Capped at 5,000 per the admin Plans footnote                                                                                                                                |
| Password reset             | SMS 6-digit code                                                                                                                   | Emailed one-time link until an SMS provider is chosen                                                                                                                       |
| Category counts            | Home and category page disagree (6 vs 5, 18 vs 17)                                                                                 | Counts computed from the sample catalogue                                                                                                                                   |
| Mobile tab badge           | `#333A2F` text on a `#5E6559` badge (unreadable)                                                                                   | Paper-coloured text                                                                                                                                                         |

## Known visual gaps

- A few headings wrap at a different word than in the PNGs (font rendering differences).
- Some cards have slightly looser vertical spacing than the designs; the Storefront Editor's
  preview area uses the shared page padding rather than the design's 20/28.
- The admin console has no mobile navigation (none was designed).
- Pages were compared against the PNGs with headless-Chrome screenshots at 1440 px and 390 px,
  not pixel-diffed.
