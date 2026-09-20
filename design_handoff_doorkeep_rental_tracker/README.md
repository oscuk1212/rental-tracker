# Handoff: Doorkeep — Rental Tracker

## Overview

Doorkeep is a multi-currency web app for a landlord who owns several real estate properties (in this design: 6 properties split across the US in USD and Nigeria in NGN). It tracks income (rents) and expenses (mortgages, taxes, insurance, repairs, utilities, fees) per property and per tenant, converts everything to a base reporting currency, and provides dashboard/reports for monthly, quarterly, and yearly views.

The design covers **12 screens**: Login, Dashboard, Properties list, Property detail, Tenants list, Tenant detail (with WhatsApp reminder flow), Income, Expenses (with receipt upload), Reports (with CSV + tax export), Settings, Users & Roles, Audit log, and a baked-in "Docs & Deploy Guide" screen aimed at the landlord.

## About the Design Files

The files in this bundle are **design references created in HTML** — clickable prototypes that show intended look, layout, states, and behavior. They are **not** production code to lift-and-ship. The task is to **recreate these designs in the target codebase's environment**, following that codebase's established patterns (component library, routing, form handling, data-fetching, auth). If there is no existing codebase yet, the recommended target is:

- **Frontend:** Next.js 14 (App Router) + React + Tailwind
- **Backend:** Next.js API routes (serverless)
- **Database + Auth + Storage:** Supabase (Postgres + Auth + Storage)
- **Hosting:** Vercel (free tier; auto SSL)
- **WhatsApp reminders:** Twilio WhatsApp Business API
- **FX rates:** openexchangerates.org (free tier)

This stack is what the in-app Docs screen instructs the landlord to deploy to, so any deviation should be communicated so the Docs screen can be updated to match.

## Fidelity

**High-fidelity.** Exact colors, spacing, typography, component structure, hover states, empty states, and the flow between screens are all defined here. However, the prototype:
- Uses React 18 with inline styles + CSS variables for theming (no Tailwind, no design tokens file) — the developer should port the CSS-variable palette below into the target codebase's token system.
- Uses mock data in `data.js` — the developer must implement real API calls / Supabase queries in its place.
- Uses `localStorage` for route persistence and tweak state — real routing (Next.js App Router or React Router) should replace this.
- Ships with an in-page "Tweaks" panel used purely for design review (accent color, dark mode, base currency, FX rate) — this is **not** part of the shipped product. Only Settings screen controls should persist.

## Screens / Views

### 0. App Shell (persistent chrome)

- **Layout:** Two-column: fixed left sidebar (220px), then a flex column with a topbar (18px 28px padding, bottom-border) and a scrollable content area.
- **Sidebar** (`var(--surface-1)` bg, `1px solid var(--border)` right):
  - 26×26 accent-colored logo tile with building icon + "Doorkeep" wordmark (14px, 600 weight).
  - Nav items (in this order, with 10px 8px padding, 8px border-radius, active item gets `var(--surface-2)` bg and accent-colored icon):
    - Dashboard, Properties, Tenants, Income, Expenses, Reports,
    - `---` separator,
    - Settings, Users & Roles, Audit log, Docs & Deploy
  - Bottom user card: 28px circular avatar with gradient bg, "You" + "Owner · Admin" subtext.
- **Topbar:** Screen title (18px, 600, letter-spacing -0.3) + subtitle (12.5px, `--fg-3`), right side has a "Sign out" ghost button.
- **Route persistence:** current route + optional param stored in `localStorage` under `rt.route` and `rt.param`. Replace with real router.

### 1. Login

- Centered card, 380px wide.
- Logo tile (34×34, 9px radius, accent bg) + "Doorkeep" title + subtitle "Rental income & expense tracker".
- H1: "Sign in to your portfolio" (22px, 600, letter-spacing -0.3).
- Fields: Email, Password, "Keep me signed in for 30 days" checkbox.
- Primary CTA: "Sign in →" full-width, large.
- Below: "Forgot password?" + "Sign up" links in accent color.
- Info block explaining that production uses Supabase Auth (email+password + magic link) with HTTPS via Vercel.

### 2. Dashboard

- **5 KPI cards** in a single row (`grid-template-columns: repeat(5, 1fr)`, gap 14px):
  1. Total income · 6mo (tone: good/green)
  2. Total expenses · 6mo (tone: bad/red)
  3. Net cash flow (tone follows sign)
  4. Active properties
  5. Active tenants
- **KPI card style:** `--surface-1` bg, `1px solid --border`, 12px radius, 18px padding. Label: 11.5px uppercase `--fg-3` with 0.5 letter-spacing. Value: 26px, 600 weight, tabular-nums, letter-spacing -0.5. Sub: 12px `--fg-3`.
- **Row 2 — 2 cards** (`grid-template-columns: 1.4fr 1fr`):
  - **Monthly cash flow** (left): 6 grouped bar pairs (income green + expenses red-with-0.7-opacity, 22px wide, 6px gap). 200px tall area. Height scaled to `maxBar`. Month labels below in 11px `--fg-3`.
  - **Net by property** (right): For each active property, a row with name + net-value on top (color-coded), and a stacked income/expense bar (6px tall, 3px radius) below. Sorted by net descending. Click row → navigate to property detail.
- **Row 3 — 2 cards** (equal split):
  - **Recent activity**: first 5 rows of the audit log. Rows separated by 1px `--border` dividers.
  - **Attention needed**: cards for late/missed rent and expiring leases. Warn cards have `color-mix(in oklab, var(--warn) 8%, transparent)` bg. Missed-payment card includes a "Remind" button (soft variant, WhatsApp icon).

### 3. Properties — List

- Filter bar: search input (32px left-padded, magnifier icon), "Filters" ghost button, spacer, primary "Add property" button (plus icon).
- Table columns:
  - **Property** — name (500 weight) + "address, city" (11.5px `--fg-3`)
  - **Type** — "{type} · {units}u"
  - **Location** — "city, country"
  - **Tenants** — right-aligned numeric
  - **Net (base)** — right-aligned, colored by sign
  - **Status** — Pill (good=Active, neutral=Inactive)
- Row click → property detail. Row hover: `--surface-2` bg.
- **Add-property modal (640px wide):** 2-column form with all fields: name, type (select), address, city, state, country, units, purchase date, currency, purchase price, lender, mortgage balance, interest rate, monthly payment, notes textarea. "Cancel" (ghost) + "Save property" (primary) footer.

### 4. Property Detail

- Breadcrumb: "Properties › {name}" (clickable Properties link, chevron icon).
- Header: H1 name (22px, 600) + address subtitle; right side has status Pill + "Edit" ghost button.
- **4 KPIs:** Type, Income 6mo, Expenses 6mo, Net 6mo.
- **2 cards** (equal split):
  - **Purchase & mortgage** — 2-column definition list (`auto 1fr` grid, 10/20px gap). Rows: Purchase date, Purchase price (Money component), Lender, Mortgage balance, Interest rate, Monthly payment. Notes shown below in italic `--surface-2` block.
  - **Linked tenants** — clickable rows, each showing name + unit, lease dates, rent amount + status pill.
- **Recent transactions** table: 8 latest income + expense rows, unified with a "Type" pill (Rent=good, else the category), and signed amount (+ for income, − for expenses).

### 5. Tenants — List

- Right-aligned "Add tenant" primary button.
- Table columns:
  - **Tenant** — 30px circular initials avatar + name + email underneath
  - **Property** — property name + unit
  - **Rent** — "{amount}/mo" right-aligned tabular
  - **Lease ends** — date
  - **Method** — payment method
  - **Status** — Pill (good=active, neutral=moved out)
- Row click → tenant detail.
- **Add-tenant modal (640px):** 2-column form: full name (spans both), phone, email, property (select), unit, lease start/end, monthly rent + currency, deposit, payment method.

### 6. Tenant Detail (with WhatsApp reminder)

- Breadcrumb: "Tenants › {name}".
- Header: 52px initials avatar + H1 name + phone/email subtitle. Right side:
  - **"Send WhatsApp reminder"** soft-variant button with WhatsApp icon → opens modal
  - **"Edit"** ghost button
- **4 KPIs:** Monthly rent (+ deposit sub), Payment method, Lease end (+ start sub), Status.
- **Payment history card:**
  - 6-column grid of month cards (2026-03 → 2026-08). Each cell colored by status:
    - **Paid** — `color-mix(in oklab, var(--good) 15%, transparent)` bg, `--good` text
    - **Late** — `color-mix(in oklab, var(--warn) 18%, transparent)` bg, `--warn` text
    - **Missed** — `color-mix(in oklab, var(--bad) 15%, transparent)` bg, `--bad` text
  - Below: full history table (period, date paid, amount, method, reference, status pill).
- **WhatsApp reminder modal (520px):**
  - Recipient row (name + phone, `--surface-2` bg).
  - Message textarea pre-filled with:
    > "Hi {firstName}, this is a friendly reminder that your rent for {propertyName} ({amount}) is due. Please let me know once payment is sent. Thank you!"
  - Explanatory note: "Opens WhatsApp with the pre-filled message. In production this uses the WhatsApp Business API (via Twilio or Meta Cloud API) for automated reminders on a schedule."
  - Footer: Cancel (ghost) + "Send via WhatsApp" (primary, WhatsApp icon).
  - **Production implementation:** POST `/api/whatsapp/remind` with `{tenant_id, message}`. Uses Twilio Programmable Messaging (`whatsapp:` channel) or Meta Cloud API. Log the send in `audit_log`.

### 7. Income

- **3 KPIs:** Total income (base currency), By currency (multi-value showing native totals), Records count + late count.
- Table card with a filter strip at top (`--surface-2` bg):
  - Property select, Currency select, spacer, "Export CSV" ghost, "Record income" primary.
- Table columns: Date, Property, Tenant, Period covered, Amount (Money component showing both currencies), Method, Ref (monospace), Late pill if applicable.
- **Record-income modal (600px):** Property + Tenant selects, Amount + Currency, Date paid, Period covered, Payment method, Reference, Notes textarea.

### 8. Expenses (with receipt upload)

- **KPI + breakdown row** (`1fr 2fr`):
  - Total expenses KPI (bad tone).
  - **Breakdown by category** card: stacked segmented bar (10px tall, 5px radius) with 7-color rotation, followed by a legend chip row.
- Table card with filter strip: Property select, Type select ("all" + Mortgage/Repair/Maintenance/Tax/Insurance/Utility/Fee), spacer, "Export CSV", "Log expense" primary.
- Table columns: Date, Property, Type (pill), Payee, Amount (Money), Recurring (accent pill "Monthly" or "One-time"), Receipt (file icon + truncated filename in accent color, or "—").
- **Log-expense modal (640px):** Property select, Expense type select, Vendor/Payee (spans both), Amount + Currency, Date, Frequency (One-time/Monthly/Quarterly/Annual), Notes.
- **Receipt upload zone** (inside modal, spans both columns):
  - 1.5px dashed `--border`, 10px radius, 24px padding, `--surface-2` bg, centered content.
  - Icon tile (12px padding, 10px radius, `--surface-1` bg, accent-colored upload icon).
  - Copy: "Drop receipt here, or **browse**" (browse is accent + underlined).
  - Sub: "PDF, PNG, JPG · Max 10MB · Stored securely in Supabase Storage".
  - **Production implementation:** POST `/api/expenses/:id/receipt` (multipart form) → uploads to Supabase Storage bucket `receipts/{property_id}/{expense_id}.{ext}`, returns signed URL, saves in `expenses.receipt_url`.

### 9. Reports (CSV + tax export)

- Filter row: Period select (August 2026 / Q3 2026 / Q2 2026 / YTD 2026), Group by (Property/Tenant/Category), Base currency, spacer, "Export CSV" ghost, "Tax export (Schedule E / FIRS)" soft.
- **3 KPIs:** Income / Expenses / Net cash flow for the selected period.
- **Net cash flow by property table** with a small stacked mini-bar in the last column (income + expense, each 5px tall).
- **Row of 2 cards:**
  - **Income by tenant** — horizontal bar list, accent-colored bars.
  - **Expenses by category** — horizontal bar list, bad-colored bars.
- **Tax export modal (560px):**
  - Jurisdiction select with 4 options:
    - 🇺🇸 US · IRS Schedule E (Form 1040)
    - 🇳🇬 Nigeria · FIRS Personal Income Tax
    - 🇬🇧 UK · SA105 Property pages
    - Custom (raw columns)
  - Tax year select
  - "Included" info block listing what the export contains
  - Two side-by-side download buttons: Download CSV (soft), Download PDF (primary)

### 10. Settings

- 2×2 grid of cards:
  - **Reporting & currency** — Base currency select, USD→NGN rate input (with hint about historical transactions keeping their rate), auto-fetch info block.
  - **Profile** — Name, Email, Phone inputs + Change password ghost button.
  - **Notifications** — 5 toggle rows (Rent due 5 days before, Rent late alert, Lease expiring 60 days, Auto-send WhatsApp reminder, Weekly receipts digest).
  - **Data & backup** — Download all data CSV, Download receipts ZIP, Delete account (danger variant).

### 11. Users & Roles

- Header row: helper text + "Invite user" primary button.
- **3 role cards** (equal split): Admin (Owner), Accountant, Viewer — each with a permissions bulleted list.
- **Team table:**
  - User (avatar + name + email), Role (accent pill for Admin, neutral otherwise), Status (good=active, warn=invited), Last active, Actions ("Change role" ghost, "Remove" danger — hidden for Admin).
- **Invite modal (480px):** Email, Role select (Accountant/Viewer/Admin), Personal note textarea. Info block about magic-link email.

### 12. Audit log

- Single table card with header + "Export" ghost button.
- Columns:
  - **Timestamp** — monospace 12px `--fg-3`
  - **User**
  - **Action** — Pill tone: bad=Deleted*, good=Created*, warn=Edited*/Updated*, else neutral
  - **Target** — wrappable text
- 7 seeded rows: create, edit, export, invite, FX-update, delete, view.

### 13. Docs & Deploy Guide (in-app)

- Centered 900px column, 28/40px padding. Long-form onboarding doc for the non-technical landlord. Sections:
  - Header: eyebrow "For the landlord" + H1 "Getting your app online — free, in about an hour"
  - **The stack you'll use** — recommends Vercel + Supabase, alt Netlify + NeonDB; 4-row comparison table
  - **The 7 steps — start to finish** — numbered list, each step with a 30px round accent-colored badge:
    1. Create your accounts (Vercel + Supabase)
    2. Push code to GitHub
    3. Connect GitHub to Vercel
    4. Create Supabase database (get Project URL + anon + service_role keys)
    5. Set environment variables in Vercel — env block includes `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON`, `SUPABASE_SERVICE_ROLE`, `NEXTAUTH_SECRET`
    6. Run `supabase/schema.sql` + `supabase/rls.sql` in Supabase SQL Editor
    7. Sign in and test
  - **Example URLs** — my-rental-tracker.vercel.app / doorkeep.vercel.app / landlord-books.netlify.app / etc.
  - **Inviting your accountant or manager** — step-by-step with role explanations
  - **Architecture (for your developer)** — tech stack list, data model (env-block SQL DDL summary), API endpoints table
  - **Security checklist** — 6 bullets (HTTPS, RLS, bcrypt, env vars, audit log, backups)
  - Bottom callout in `color-mix(in oklab, var(--accent) 8%, transparent)` bg — support pointer to vercel.com/help

## Interactions & Behavior

### Navigation

- Sidebar item click → set route + clear param.
- Row click on properties/tenants/dashboard-per-property → navigate to detail with param.
- Breadcrumbs are clickable back-buttons.
- No animation on route change (instant swap).

### Forms

- All "Add …" and "Log …" buttons open modals (see modal spec below).
- Modal Cancel closes without saving. Modal primary CTA in the prototype also closes — in production, submit to API then close on success, show toast on error.
- Field validation not implemented in prototype — production should validate:
  - Required: name, amount (>0), dates, currency
  - Amount: positive number
  - Dates: lease_end > lease_start
  - Email: valid format
  - Phone: E.164 format for WhatsApp use

### Modal

- Fixed overlay: `position: absolute; inset: 0; background: rgba(15,17,22,0.4); backdrop-filter: blur(2px); z-index: 40; display: flex; align-items: center; justify-content: center`
- Modal panel: `--surface-1` bg, 14px radius, `1px solid --border`, shadow `0 24px 60px rgba(0,0,0,.2)`, max 88% height with scroll, configurable width (default 560px, 92% max width).
- Header: 16px 20px padding, bottom-border, title (14px, 600) + close button (X icon).
- Body: 20px padding.
- Backdrop click closes; body click stops propagation.

### Money display (multi-currency)

Every monetary value uses the `<Money>` component:
- Shows amount in original currency: `{symbol}{rounded.toLocaleString('en-US')}`
- If original ≠ base currency, appends `≈ {converted}` in 0.85em `--fg-3`.
- Conversion: relative-to-USD rate table `{USD:1, NGN: (from settings, default 1585), EUR: 0.92, GBP: 0.78}`. Formula: `usd = amount / rates[from]; result = usd * rates[to]`.
- Currency symbols: USD=`$`, NGN=`₦`, EUR=`€`, GBP=`£`.
- All numeric cells use `font-variant-numeric: tabular-nums`.

### Table

- Header row: `--surface-2` bg, 11px 500 uppercase `--fg-3` with 0.5 letter-spacing, 10/14 padding, 1px `--border` bottom.
- Body row: 12/14 padding, 1px `--border` bottom, hover fills with `--surface-2` if clickable.
- Numeric columns: right-aligned + tabular-nums.
- Empty state: single row with `colSpan`, 30px padding, centered `--fg-3` text.

### Pills

- Padding: 3/9, 999px radius, 11.5px, 500 weight, 0.1 letter-spacing, 6px gap for icon.
- Tones:
  - `neutral`: `--pill-bg` bg, `--fg-2` fg
  - `good`: `color-mix(in oklab, var(--good) 14%, transparent)` bg, `--good` fg
  - `warn`: `color-mix(in oklab, var(--warn) 16%, transparent)` bg, `--warn` fg
  - `bad`: `color-mix(in oklab, var(--bad) 14%, transparent)` bg, `--bad` fg
  - `accent`: `color-mix(in oklab, var(--accent) 14%, transparent)` bg, `--accent` fg

### Buttons

- Base: inline-flex, 7px gap, `inherit` font-family, 500 weight.
- Sizes:
  - `sm`: 5/10 padding, 12px font, 7px radius
  - `md`: 8/14 padding, 13px font, 8px radius (default)
  - `lg`: 11/18 padding, 14px font, 10px radius
- Variants:
  - `primary`: `--accent` bg, `--accent-fg` text, 1px `--accent` border
  - `ghost`: transparent bg, `--fg-1` text, 1px `--border` border
  - `soft`: `--surface-2` bg, `--fg-1` text, 1px `--border` border
  - `danger`: transparent bg, `--bad` text, 1px `color-mix(in oklab, var(--bad) 40%, --border)` border
  - `link`: transparent bg, `--accent` text, 1px transparent border
- Press: `transform: translateY(1px)` (40ms).
- Optional leading icon (14px).

### Inputs / Selects

- Padding 9/11, 8px radius, 1px `--border`, `--surface-1` bg, `--fg-1` text, 13px font.
- Focus: `outline: 2px solid --accent; outline-offset: 1px`.
- Label above (12px 500 `--fg-2`), optional hint below (11px `--fg-3`).
- Select uses a custom SVG chevron background positioned right 10px center, `padding-right: 30px`, `appearance: none`.

### Dashboard chart

- Bar chart: manual layout, no dependency. Two 22px-wide bars per month, 6px gap. Height percentage against max value. 170px canvas.
- Legend below: 10×10 color swatch + label.

### Payment-history strip (tenant detail)

- 6-column CSS grid, 8px gap. Each cell: 10/12 padding, 8px radius. Two-line content: month label (11px `--fg-3`), status (13px 600, tone color).

## State Management

Prototype uses React Context (`StoreProvider` / `useStore`) holding: properties, tenants, income, expenses, users, audit, route, param. All setters are exposed but not wired to persistence.

**In production, replace with:**
- **Server state:** React Query / SWR against Supabase (Postgres via `@supabase/supabase-js`). Enable Realtime for income/expenses so multiple users see updates.
- **Route state:** Next.js App Router file-based routes (`/properties`, `/properties/[id]`, etc.), not localStorage.
- **Auth state:** Supabase Auth session via `@supabase/auth-helpers-nextjs`. Wrap protected routes in a server-side check.
- **UI state:** local `useState` per component.

### Data model (Supabase Postgres)

```sql
users             (id uuid pk, email text unique, name text, role text,           -- 'admin'|'accountant'|'viewer'
                   portfolio_id uuid fk, created_at timestamptz default now())
portfolios        (id uuid pk, owner_id uuid fk, name text, created_at)

properties        (id uuid pk, portfolio_id uuid fk, name text, address text,
                   city text, state text, country text, type text, units int,
                   purchase_date date, purchase_price numeric, currency text,
                   lender text, mortgage_balance numeric, interest_rate numeric,
                   monthly_payment numeric, active bool default true, notes text)

tenants           (id uuid pk, property_id uuid fk, name text, phone text,
                   email text, unit text, lease_start date, lease_end date,
                   rent numeric, currency text, deposit numeric,
                   method text, status text)                                       -- 'active'|'moved out'

income            (id uuid pk, property_id uuid fk, tenant_id uuid fk,
                   amount numeric, currency text, date_paid date, period text,
                   method text, reference text, notes text, late bool)

expenses          (id uuid pk, property_id uuid fk, type text,                     -- Mortgage|Repair|Maintenance|Tax|Insurance|Utility|Fee
                   payee text, amount numeric, currency text, date date,
                   recurring bool, receipt_url text, notes text)

fx_rates          (id uuid pk, from_ccy text, to_ccy text, rate numeric,
                   effective_date date)

audit_log         (id uuid pk, user_id uuid fk, action text, target_table text,
                   target_id uuid, ts timestamptz default now(), diff jsonb)

invitations       (id uuid pk, email text, role text, token text unique,
                   portfolio_id uuid fk, expires_at timestamptz, accepted_at timestamptz)
```

Add Row-Level Security policies so each row is only visible/editable to members of its `portfolio_id`. See in-app Docs screen for the outline.

### Main API endpoints

```
POST  /api/auth/signup                POST /api/auth/login    POST /api/auth/logout
GET   /api/properties                 POST /api/properties
GET   /api/properties/:id             PATCH /api/properties/:id             DELETE /api/properties/:id
GET   /api/tenants                    POST /api/tenants                     ...
GET   /api/income                     POST /api/income                      ...
GET   /api/expenses                   POST /api/expenses                    ...
POST  /api/expenses/:id/receipt       (multipart → Supabase Storage)
GET   /api/reports?period=Q3&groupBy=property
GET   /api/reports/export.csv         GET /api/reports/tax-export.pdf?jurisdiction=us_schedule_e&year=2026
POST  /api/users/invite               GET  /api/users                       PATCH /api/users/:id
GET   /api/audit
POST  /api/whatsapp/remind            body: { tenant_id, message } → Twilio
GET   /api/fx?from=USD&to=NGN         (openexchangerates.org, cached 1h)
```

## Design Tokens

### Color palette

The prototype uses CSS variables applied to a theme wrapper. Two themes (light default, dark) × 5 accent choices. **The developer only needs to ship the "warm" accent + light and dark modes** — the other accents were design-exploration tweaks.

**Light theme:**
| Token | Value |
|---|---|
| `--surface-0` (page bg) | `#faf9f7` |
| `--surface-1` (cards)    | `#ffffff` |
| `--surface-2` (subtle)   | `#f2efea` |
| `--fg-1` (primary text)  | `#1a1a1c` |
| `--fg-2` (secondary)     | `#4a4a50` |
| `--fg-3` (tertiary)      | `#8a8a92` |
| `--border`               | `#e7e3dc` |
| `--good` (income/success)| `#3d8f5f` |
| `--bad` (expense/error)  | `#c74a3c` |
| `--warn`                 | `#a37a1a` |
| `--pill-bg`              | `#eeeae2` |

**Dark theme:**
| Token | Value |
|---|---|
| `--surface-0` | `#0f1114` |
| `--surface-1` | `#161a1f` |
| `--surface-2` | `#1e232a` |
| `--fg-1`      | `#e8e8ea` |
| `--fg-2`      | `#b6b8bc` |
| `--fg-3`      | `#7c8088` |
| `--border`    | `#282d34` |
| `--good`      | `#7cc499` |
| `--bad`       | `#e07a6d` |
| `--warn`      | `#e0b467` |
| `--pill-bg`   | `#252a31` |

**Accent (warm/terracotta — primary brand):**
| Token | Value |
|---|---|
| `--accent`    | `#c26749` |
| `--accent-fg` | `#ffffff` |

Alternate accents from the prototype's tweak panel (skip unless requested): slate `#3b5876`, ink `#111111`, olive `#5b6b3a`, plum `#6b4066`.

Category-bar palette for the expense-breakdown card (7 colors, rotate):
`["#d97757", "#b3543a", "#e19478", "#8b3a25", "#f0b39b", "#c26749", "#6b2b1c"]`

### Typography

- **Font stack:** `ui-sans-serif, "Inter var", "Segoe UI", -apple-system, sans-serif`
- **Sizes:** 11 (uppercase headers), 11.5 (subtext, meta), 12 (form labels), 12.5 (small copy), 13 (body / table cells), 13.5 (card titles), 14 (button/modal headers), 17 (h2 in Docs), 18 (topbar title), 22 (screen H1), 26 (KPI value), 28 (Docs H1)
- **Weights:** 400 default, 500 medium (labels, active nav), 600 semibold (headers, KPIs)
- **Letter-spacing:** −0.5 on 26px KPI value, −0.3/−0.4 on H1/H2, +0.5 uppercase labels, +0.8 eyebrow labels
- **Numerics:** `font-variant-numeric: tabular-nums` on every KPI value, table money column, chart labels
- **Monospace** (audit timestamps, refs, code blocks): `ui-monospace, monospace`

### Spacing

- Screen padding: 28px
- Card padding: 20px default, 24px for Docs cards, 18px for KPI cards, 0 for tables-inside-cards
- Section gap: 18px (grid gaps between rows), 14px (KPI row), 10px (buttons row)
- Form grid gap: 14px
- Border radius: 4px (mono chip), 7px (sm button), 8px (input/button/pill card), 9px (small logo), 10px (lg button), 12px (KPI card, big card), 14px (modal), 999px (pill)

### Shadows

- Modal: `0 24px 60px rgba(0,0,0,.2)`
- Chrome browser window (prototype only): `0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)`

### Icons

All icons are inline SVG (24×24 viewBox, `stroke-width: 1.6`, `stroke-linecap: round`, `stroke-linejoin: round`, currentColor). Set defined inline in `ui.jsx`:

`dashboard, building, users, income, expense, report, settings, shield, log, book, plus, search, chevron, chevronD, close, download, filter, check, edit, trash, whatsapp, file, upload, external`

**Recommendation:** replace with Lucide React (`lucide-react` package) — most names map 1:1 (`Home`, `Building2`, `Users`, `TrendingUp`, `TrendingDown`, `BarChart3`, `Settings`, `Shield`, `FileText`, `BookOpen`, `Plus`, `Search`, `ChevronRight`, `ChevronDown`, `X`, `Download`, `Filter`, `Check`, `Pencil`, `Trash2`, `MessageCircle` for WhatsApp, `File`, `Upload`, `ExternalLink`).

## Assets

- **No external images or media** used. Everything is inline SVG + CSS.
- **Avatars:** initials (first + first letters of split names, uppercased) rendered in a 30–52px circle with `--surface-2` bg. Landlord's own avatar uses a gradient `linear-gradient(135deg, #d97757, #b3543a)` with white "YO" text.
- **Browser window frame** (from `browser_window.jsx`): design-time chrome only, remove for production.

## Files

Files included in this handoff bundle (all copied into this folder):

- `Doorkeep Rental Tracker.html` — HTML entry: mounts React, loads all scripts, defines global styles + scrollbar theming
- `app.jsx` — root `<App>`: theme wiring (CSS variables from tweak state), route switch across all screens, tweak panel (design-time only), browser-frame shell
- `ui.jsx` — shared atoms: `StoreProvider`/`useStore` context, `Icon`, `Pill`, `Button`, `Input`, `Select`, `Card`, `KPI`, `Table`, `Modal`, `Money`, `Sidebar`, `Topbar`, `EmptyState`, plus `convert()` and `fmt()` helpers
- `data.js` — seed data (6 properties, 8 tenants, 6 months of income, 6 months of expenses, 3 users, audit log entries) and currency-symbol lookup
- `screens_core.jsx` — Dashboard, Properties list, Property detail, Tenants list, Tenant detail (with WhatsApp modal)
- `screens_txn.jsx` — Income, Expenses (with receipt-upload zone), Reports (with tax-export modal)
- `screens_admin.jsx` — Settings, Users & Roles (with invite modal), Audit log, Login, Docs & Deploy Guide
- `browser_window.jsx` — design-time browser-window chrome (remove in production)
- `tweaks_panel.jsx` — design-time tweak panel (remove in production)

To view the prototype locally, open `Doorkeep Rental Tracker.html` in a modern browser served over HTTP (Babel-in-browser needs same-origin script tags). A quick way: `python3 -m http.server` then open `http://localhost:8000/Doorkeep%20Rental%20Tracker.html`.
