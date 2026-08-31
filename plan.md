# MyloNex Lite — B2B Textile Sourcing & RFQ Marketplace
## Full-Stack Developer Assessment — Build Plan

**Timeline:** 48–72 hours
**Deliverables:** Public GitHub repo (clean history) + Live deployed URL + Demo credentials + README + (optional) 2-min Loom walkthrough

---

## 1. Architecture Overview

A single Next.js application (no microservices) handling both frontend and backend via App Router + Server Actions/API Routes, backed by PostgreSQL through Prisma.

```
Browser (Next.js App Router, React, Tailwind)
        │
        ▼
Server Actions / API Routes (auth, validation, business rules)
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL (Neon/Supabase — hosted)
```

Two roles — **BUYER** and **SUPPLIER** — with server-enforced RBAC (never trust client-sent role). A demo login/role switcher lets reviewers flip between perspectives instantly.

---

## 2. Database Entities & Relationships

```
User (id, name, email, passwordHash, role[BUYER|SUPPLIER], createdAt, updatedAt)
   │ 1
   │
   │ *                                  * │
Fabric (id, name, gsm, weave,     Inquiry (id, buyerId→User, fabricId→Fabric,
composition, width,                       type[SAMPLE_REQUEST|BULK_RFQ],
productionStatus[READY_STOCK|             quantity, requiredDispatchDate,
RUNNING_PRODUCTION|MADE_TO_ORDER],        deliveryLocation, targetPrice, remarks,
moq, dispatchMinDays, dispatchMaxDays,    status[PENDING_QUOTE|QUOTED|
certifications String[], description,     ORDER_CONFIRMED|IN_PRODUCTION|
createdAt, updatedAt)                     DISPATCHED|QUOTE_REJECTED],
   │ 1                                    createdAt, updatedAt)
   │ *                                       │ 1
   └──────────────────────────────────►      │ 1 (accepted quote)
                                              ▼
                                     Quote (id, inquiryId→Inquiry,
                                     supplierId→User, pricePerMeter,
                                     estimatedDispatchTimeline,
                                     paymentTerms, remarks,
                                     createdAt, updatedAt)
                                              │ 1
                                              ▼ (on accept)
                                     Order (id, inquiryId→Inquiry,
                                     quoteId→Quote, buyerId→User,
                                     supplierId→User,
                                     status[ORDER_CONFIRMED|
                                     IN_PRODUCTION|DISPATCHED],
                                     createdAt, updatedAt)
```

Design notes:
- `Inquiry` supports multiple `Quote`s (extensible for multi-supplier bidding later), but the demo flow uses one.
- `Order` is only created once a quote is accepted — keeps RFQ negotiation state separate from fulfillment state, which is a cleaner domain split than overloading `Inquiry.status`.
- `certifications` as `String[]` (Postgres native array) — no need to normalize for 4 seed fabrics.

---

## 3. End-to-End Workflow

```
BUYER: Browse/Search/Filter catalog → View fabric detail
     → Submit Sample Request or Bulk RFQ (qty validated ≥ MOQ, server + client)
     → Inquiry created, status = PENDING_QUOTE

SUPPLIER: Sees inquiry in dashboard → Opens detail
     → Creates Quote (price/m, dispatch timeline, payment terms, remarks)
     → Inquiry status → QUOTED

BUYER: Views quote in "My Inquiries" → compares target vs supplier price
     → Accept → Order created, status = ORDER_CONFIRMED
     → Reject → Inquiry status = QUOTE_REJECTED

SUPPLIER: Start Production → Order status = IN_PRODUCTION
     → Mark Dispatched → Order status = DISPATCHED

BUYER: Sees full lifecycle stepper reflect all 5 stages.
```

Every mutating action re-validates: authentication → role → ownership → business rule (MOQ, valid state transition) **on the server**, regardless of what the UI already checked.

---

## 4. Proposed Folder Structure

```
app/
  login/
  catalog/
    page.tsx
    [id]/page.tsx
  buyer/
    inquiries/
      page.tsx
      [id]/page.tsx
  supplier/
    inquiries/
      page.tsx
      [id]/page.tsx
  api/
    auth/[...nextauth]/route.ts
components/
  ui/            (button, card, badge, toast, stepper, empty-state)
  fabric/        (fabric-card, fabric-filters, fabric-detail)
  inquiry/       (inquiry-form, inquiry-card)
  quote/         (quote-builder, quote-comparison)
  order/         (lifecycle-stepper)
lib/
  auth/          (NextAuth config, session helpers)
  db/            (prisma client singleton)
  validations/   (zod schemas)
  permissions/   (role guards used in server actions/routes)
prisma/
  schema.prisma
  seed.ts
types/
public/
.env.example
README.md
```

---

## 5. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14+ App Router, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Server Actions (primary) + a couple of API routes where REST semantics help |
| Database | PostgreSQL (Neon or Supabase, hosted) |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials provider) with a seeded demo buyer/supplier |
| Validation | Zod |
| Deployment | Vercel (app) + Neon/Supabase (DB) |
| Testing (bonus) | Vitest or Jest for MOQ validation + RBAC logic |

---

## 6. Environment Variables

```
DATABASE_URL=            # Postgres connection string (Neon/Supabase)
NEXTAUTH_SECRET=         # random secret for session signing
NEXTAUTH_URL=            # http://localhost:3000 in dev, deployed URL in prod
```

Documented in `.env.example`, never committed with real values.

---

## 7. Phased Implementation Plan

### Phase 0 — Kickoff
- Confirm scope against both source docs (internal prompt + official assessment PDF); official PDF's timeline (48–72h) and stack flexibility take precedence where they differ.
- Init repo, initial commit.

### Phase 1 — Project Setup
- `create-next-app` (TypeScript, App Router, Tailwind).
- Install Prisma, NextAuth, Zod, bcrypt (or argon2) for password hashing.
- Set up `.env.local` / `.env.example`.
- Configure Prisma with hosted Postgres, confirm `prisma db push` connects.
- **Verify:** app boots on `localhost:3000`, DB connection succeeds.

### Phase 2 — Database Schema & Seed
- Write `prisma/schema.prisma`: `User`, `Fabric`, `Inquiry`, `Quote`, `Order` + enums (`Role`, `ProductionStatus`, `InquiryType`, `InquiryStatus`, `OrderStatus`).
- Write `prisma/seed.ts`: demo buyer (Arjun Mehta, ABC Apparel), demo supplier (Kyal Textile Mills), 4 required fabrics with realistic composition/weave/width/dispatch ranges.
- **Verify:** `npx prisma db seed` populates correctly; inspect via Prisma Studio.

### Phase 3 — Authentication & RBAC
- NextAuth Credentials provider backed by seeded users (hashed passwords).
- Session includes `role`.
- Middleware/server-side guards: `/buyer/*` → BUYER only, `/supplier/*` → SUPPLIER only.
- Demo login screen: "Continue as Buyer" / "Continue as Supplier" buttons plus visible demo credentials.
- **Verify:** login as each role; confirm cross-role route access is blocked server-side (test by hitting the other role's route directly).

### Phase 4 — Fabric Catalog
- `/catalog`: responsive grid of fabric cards (name, GSM, production badge, MOQ, dispatch window, certification badges).
- Search (name) + filters (production status, GSM range, certification) synced to URL query params (`?search=&status=&certification=`).
- `/catalog/[id]`: full spec detail, "Request Sample" / "Request Bulk Quote" CTAs.
- **Verify:** refreshing/copy-pasting a filtered URL reproduces the same view.

### Phase 5 — RFQ Engine
- Inquiry modal/page: type toggle (Sample Request / Bulk RFQ), quantity, required dispatch date, delivery location, optional target price + remarks.
- Zod schema shared client + server; MOQ check client-side (instant feedback) **and** re-validated server-side inside the server action.
- On submit: create `Inquiry` with `status = PENDING_QUOTE`, toast confirmation.
- **Verify:** submitting below MOQ is blocked both in UI and via direct action call; at/above MOQ succeeds.

### Phase 6 — Supplier Dashboard & Quote Builder
- `/supplier/inquiries`: list of open inquiries with key fields + status badge.
- `/supplier/inquiries/[id]`: full inquiry detail (fabric, buyer requirements, target price, remarks).
- Quote builder: price/meter, dispatch timeline, payment terms, remarks → creates `Quote`, flips `Inquiry.status → QUOTED`.
- Server enforces: authenticated, role = SUPPLIER, inquiry exists and is in a quotable state.
- **Verify:** quote appears immediately in buyer's view; re-quoting an already-quoted inquiry is rejected server-side.

### Phase 7 — Buyer Quote Comparison
- `/buyer/inquiries`: list of buyer's own inquiries with status.
- `/buyer/inquiries/[id]`: quote comparison card — target price vs supplier price with a visually obvious delta (e.g. `+₹15/m`).
- Accept → creates `Order` (`ORDER_CONFIRMED`), persisted server-side; ownership check (only inquiry's buyer can act).
- Reject → `Inquiry.status = QUOTE_REJECTED`, persisted.
- **Verify:** another buyer account cannot accept/reject someone else's inquiry (direct action call test).

### Phase 8 — Order Lifecycle
- Visual stepper component: RFQ Submitted → Quote Received → Order Confirmed → In Production → Dispatched.
- Supplier-side controls on confirmed orders: "Start Production" → `IN_PRODUCTION`, "Mark Dispatched" → `DISPATCHED`.
- Enforce valid, forward-only transitions (no skipping/reversing stages).
- **Verify:** buyer sees stepper update live/on refresh as supplier progresses the order.

### Phase 9 — UI/UX Polish
- Loading, error, and empty states everywhere (no blank screens).
- Toast notifications on all mutating actions.
- Role-aware nav (Catalog/My Inquiries for buyer; Inquiries/Orders for supplier), current role clearly displayed.
- Responsive pass (desktop-first, verify tablet/mobile don't break).
- Accessible forms (labels, focus states).

### Phase 10 — Testing (bonus, after core is solid)
- Unit test: MOQ validation (below/at/above MOQ).
- If time allows: role authorization guard tests, quote creation, accept-quote transition, invalid state-transition rejection.

### Phase 11 — Deployment
- Production build (`next build`) — fix all TS/lint errors.
- Provision hosted Postgres (Neon/Supabase), run migrations + seed against it.
- Deploy to Vercel, set env vars in dashboard.
- Full smoke test of the complete demo scenario (Section 8 below) against the **live** URL.

### Phase 12 — Documentation
- `README.md`: overview, business problem, features, tech stack, architecture, schema explanation, roles, auth, RFQ/quote/order workflows, local setup, env vars, seed instructions, run commands, demo credentials, deployment URL, bonus features implemented, known limitations.
- Ensure `.env.example` is present and accurate; confirm no secrets in git history.

### Phase 13 — Optional Bonuses (only if 1–9 are fully solid)
1. PDF export of accepted quotation/invoice.
2. Toast notification simulating "new quote received" on the buyer side.
3. Dockerfile + docker-compose.yml for local setup.

---

## 8. Mandatory Demo Scenario (must work end-to-end before calling it done)

1. Login as Buyer → Catalog → search "Cotton" → filter "Ready Stock".
2. Open "Organic Cotton Poplin 40s" → Request Bulk Quote.
3. Qty 5,000m, dispatch 20 Sept 2026, delivery Mumbai, target ₹230/m → Submit → `PENDING_QUOTE`.
4. Switch to Supplier → Inquiries → open new inquiry → Quote: ₹245/m, 15–20 days, 50% advance/50% before dispatch, remarks → Submit → `QUOTED`.
5. Switch to Buyer → My Inquiries → see quote, compare ₹230 vs ₹245 → Accept → `ORDER_CONFIRMED`.
6. Switch to Supplier → Start Production → `IN_PRODUCTION` → Mark Dispatched → `DISPATCHED`.
7. Switch to Buyer → lifecycle stepper shows all 5 stages complete.

---

## 9. Priority Order If Time Runs Short

1. Auth + RBAC
2. DB + seed data
3. Fabric catalog
4. Search/filtering
5. RFQ creation + MOQ validation
6. Supplier dashboard + quote creation
7. Buyer quote comparison + accept/reject
8. Order lifecycle
9. UI polish
10. Deployment
11. README
12. Tests → PDF → Realtime toast → Docker (bonuses, in that order)

---

## 10. Pre-Submission Checklist

- [ ] Buyer & Supplier login work; sessions persist; cross-role routes blocked server-side
- [ ] All 4 seed fabrics present with correct metadata
- [ ] Search + filters work and sync to URL; refresh/copy-paste reproduces state
- [ ] Sample Request & Bulk RFQ both submit; MOQ validated client + server
- [ ] Supplier sees new inquiries; quote builder creates a valid quote; status → QUOTED
- [ ] Buyer sees quote, target-vs-supplier comparison, accept/reject persist correctly
- [ ] Order lifecycle stepper reflects all 5 stages accurately
- [ ] Loading/error/empty states everywhere; toasts on mutations
- [ ] Responsive on desktop/tablet/mobile
- [ ] No secrets committed; `.env.example` present
- [ ] `npx prisma db seed` works from a clean clone
- [ ] Production build has no TS/lint errors
- [ ] Live deployment verified against the full demo scenario
- [ ] README complete with demo credentials and deployment URL
