# MyloNex Lite — B2B Textile Sourcing & RFQ Marketplace

A single Next.js application for textile buyers and suppliers to discover fabrics, create RFQs, exchange quotes and track orders from RFQ to dispatch.

## Business Problem

Textile sourcing is fragmented — buyers struggle to discover fabrics by spec and suppliers handle RFQs manually. MyloNex Lite centralizes catalog browsing, MOQ-aware RFQ creation, quote negotiation and fulfillment tracking in one workflow with server-enforced business rules.

## Features

- **Fabric Catalog** — responsive grid with production badge, GSM, MOQ, dispatch window, certifications; detail page with full specs
- **Search & Filters** — name search + production status + certification + GSM, synced to URL (`?search=&status=&certification=`) for shareable state
- **RFQ Engine** — Sample Request / Bulk RFQ toggle, quantity validated ≥ MOQ on client and server, inquiry `PENDING_QUOTE`
- **Supplier Dashboard** — lists all inquiries, quote builder (price/m, dispatch timeline, payment terms), flips inquiry to `QUOTED`
- **Buyer Quote Comparison** — target vs supplier price with delta (`+₹15/m`), Accept creates `Order` (`ORDER_CONFIRMED`), Reject → `QUOTE_REJECTED`
- **Order Lifecycle** — stepper visualizes 5 stages: RFQ Submitted → Quote Received → Order Confirmed → In Production → Dispatched; supplier controls enforce forward-only transitions
- **Auth & RBAC** — NextAuth Credentials with seeded demo users, sessions carry `role`, middleware + server guards block cross-role access
- **Polish** — loading skeletons, error boundaries, empty states, toast notifications, role-aware nav, responsive Tailwind UI

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Backend | Server Actions + API Routes |
| DB | PostgreSQL |
| ORM | Prisma 5.22 |
| Auth | NextAuth.js 4 Credentials provider, bcryptjs, JWT |
| Validation | Zod 3 (shared client/server) |
| Testing | Vitest |
| Deployment | Render (Web Service + PostgreSQL) |

## Architecture

```
Browser (Next.js App Router)
   → Server Actions / API Routes (auth, Zod, RBAC, MOQ, state-machine)
   → Prisma
   → PostgreSQL
```

Two roles `BUYER` / `SUPPLIER` — server never trusts client-sent role.

## Database Schema

- **User** `id, name, email, passwordHash, role[BUYER|SUPPLIER]`
- **Fabric** `id, name, gsm, weave, composition, width, productionStatus[READY_STOCK|RUNNING_PRODUCTION|MADE_TO_ORDER], moq, dispatchMinDays, dispatchMaxDays, certifications String[], description`
- **Inquiry** `id, buyerId→User, fabricId→Fabric, type[SAMPLE_REQUEST|BULK_RFQ], quantity, requiredDispatchDate, deliveryLocation, targetPrice, remarks, status[PENDING_QUOTE|QUOTED|ORDER_CONFIRMED|IN_PRODUCTION|DISPATCHED|QUOTE_REJECTED]`
- **Quote** `id, inquiryId→Inquiry, supplierId→User, pricePerMeter, estimatedDispatchTimeline, paymentTerms, remarks` (Inquiry supports multiple quotes for future bidding)
- **Order** `id, inquiryId→Inquiry unique, quoteId→Quote unique, buyerId, supplierId, status[ORDER_CONFIRMED|IN_PRODUCTION|DISPATCHED]` — created only on accept, separates negotiation from fulfillment; `certifications` uses Postgres native array

See `prisma/schema.prisma:1-120` and `prisma/seed.ts:1-80`

## Roles & Auth

- `BUYER` — browse catalog, create inquiries, compare quotes, accept/reject, view lifecycle
- `SUPPLIER` — view inquiries, create quotes, progress orders

NextAuth Credentials provider (`src/lib/auth.ts:6-28`) hashes passwords with bcrypt, JWT callbacks attach `id`/`role` to session (`src/lib/auth.ts:32-46`). Middleware (`src/middleware.ts:5-20`) redirects unauthenticated to `/login` and mismatched roles to `?error=Forbidden`; server pages also call `getServerSession` + role checks for defense in depth (`src/lib/permissions.ts:4-13`).

## Workflows

**RFQ:** Buyer picks fabric → modal validates qty ≥ MOQ (`src/lib/validations.ts:12-14` both client and `src/lib/actions.ts:18-24` server) → `Inquiry` PENDING_QUOTE  
**Quote:** Supplier opens inquiry → `createQuote` validates `PENDING_QUOTE` then creates `Quote` + flips to QUOTED  
**Decision:** Buyer sees delta → `acceptQuote` creates `Order` ORDER_CONFIRMED or `rejectQuote` → QUOTE_REJECTED (ownership checked)  
**Fulfillment:** Supplier `updateOrderStatus` enforces `ORDER_CONFIRMED→IN_PRODUCTION→DISPATCHED` only, also updates `Inquiry.status` for stepper sync

## Local Setup

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env
# Edit DATABASE_URL (local Docker Postgres example below) + NEXTAUTH_SECRET + NEXTAUTH_URL

# 3. DB — start Postgres (Docker)
docker run --name mylonex-postgres -e POSTGRES_USER=mylonex -e POSTGRES_PASSWORD=mylonex123 -e POSTGRES_DB=mylonex -p 5433:5432 -d postgres:16
# Or use existing local Postgres and create db mylonex

# 4. Push schema + seed
npx prisma db push
npx prisma db seed   # also npm run db:seed

# 5. Run
npm run dev   # http://localhost:3000
npm run build # production check
npm test      # vitest — MOQ and Zod validation
```

Env vars (`.env.example:1-3`):

```
DATABASE_URL=postgresql://mylonex:mylonex123@localhost:5433/mylonex
NEXTAUTH_SECRET=random-32-char-secret
NEXTAUTH_URL=http://localhost:3000
```

## Demo Credentials

- **Buyer:** `buyer@mylonex.demo` / `buyer123` — Arjun Mehta (ABC Apparel)
- **Supplier:** `supplier@mylonex.demo` / `supplier123` — Kyal Textile Mills

## Demo Scenario (must pass)

1. Login as Buyer → Catalog → search "Cotton" → filter "Ready Stock" → open "Organic Cotton Poplin 40s"
2. Request Bulk Quote: qty 5000m, dispatch 20 Sept 2026, Mumbai, target ₹230/m → Submit → PENDING_QUOTE
3. Switch to Supplier → Inquiries → open new inquiry → Quote ₹245/m, 15–20 days, 50% advance/50% before dispatch → Submit → QUOTED
4. Switch to Buyer → My Inquiries → compare ₹230 vs ₹245 (+₹15) → Accept → ORDER_CONFIRMED
5. Switch to Supplier → Start Production → IN_PRODUCTION → Mark Dispatched → DISPATCHED
6. Buyer stepper shows all 5 stages complete

## Scripts

- `npm run dev` — dev server
- `npm run build` / `start` — production
- `npm run db:push` / `db:seed` — prisma
- `npm test` — vitest
- `npm run lint` — eslint

## Deployment (Render)

Live: **https://mylonex-lite-gb9i.onrender.com**

- **Web Service:** `mylonex-lite` (Node 20) — Build `npm install && npx prisma generate && npm run build`, Start `npm start`
- **PostgreSQL:** `mylonex_db` (Oregon) — Internal `DATABASE_URL` for service, External `?sslmode=require` for local `prisma db push/seed`
- **Env:** `DATABASE_URL`, `NEXTAUTH_URL=https://mylonex-lite-gb9i.onrender.com`, `NEXTAUTH_SECRET` (generated)
- Seed: `DATABASE_URL=<External> npx prisma db push && npm run db:seed` → 4 spec fabrics (130/50, 155/1200, 180/6000, 340/100)

## Bonus Features

- ✅ **Visual Aesthetics** — Polished UI with dark mode, hover shadows, micro-interactions (`tailwind.config.ts:4`, `globals.css:5`, `button.tsx:14`)
- ✅ **PDF Exporter** — Downloadable quotation/invoice via `jspdf` (`src/components/order/quote-pdf.tsx:1`) on Buyer Quote Comparison
- ✅ **Realtime Updates** — Polling toast for quote arrivals (`src/app/api/quotes/route.ts:1` + `src/components/realtime/quote-notifier.tsx:1` mounted in `layout.tsx:18`)
- ✅ **Automated Testing** — Vitest MOQ + Zod validation (`src/lib/validations.test.ts:4`, `npm test` 7/7)
- ⏳ **Dockerization** — Dockerfile + docker-compose (not yet)

## License

Internal assessment — not licensed for reuse.
