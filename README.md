# WealthTrack — Multi-Asset Wealth Management Platform (US Market)
### Atomic Design Edition

A read-only tracking and educational wealth management dashboard consolidating **equities, digital assets, fixed-income instruments, real estate, and cash** into one unified view with net worth, allocation, returns, and capital gains tracking.

> **Notice:** For informational and educational purposes only. Not financial, investment, or tax advice. Does not execute trades or custody funds.

---

## Tech Stack
- **Framework:** Next.js (App Router) + React 19 + TypeScript (Strict)
- **Styling:** Tailwind CSS (v4) with centralized Design Tokens
- **Database & ORM:** PostgreSQL / SQLite with Prisma ORM
- **Financial Math:** `decimal.js` (no floating-point rounding errors for money/quantities)
- **Validation:** Zod schemas
- **Testing:** Vitest + React Testing Library + `@testing-library/jest-dom` + `jsdom`
- **Charts:** Recharts
- **Icons:** `lucide-react` (isolated strictly inside the `Icon` atom)

---

## Getting Started

### 1. Prerequisites
- Node.js >= 20 (Node 24 recommended)
- npm >= 10

### 2. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
*(By default, `.env` uses SQLite (`file:./dev.db`) for instant zero-dependency local development. For PostgreSQL, launch via Docker Compose: `docker-compose up -d` and set `DATABASE_URL` in `.env`)*

### 3. Database Initialization & Seeding
Push the database schema and seed sample multi-asset portfolio data:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```
**Demo Account:** `demo@wealthtrack.dev` / `demo1234`

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the main dashboard overview, or [http://localhost:3000/dev/components](http://localhost:3000/dev/components) for the Atomic Design Component Gallery.

---

## Verification & Guardrails

Run all linters, type checks, design token guards, and test suites with a single command:
```bash
npm run check
```

Or run individual tasks:
- `npm run lint` — ESLint including Atomic Design layer boundary rules (`no-restricted-imports`)
- `npm run typecheck` — Strict TypeScript checking (`tsc --noEmit`)
- `npm run check:tokens` — Guardrail verifying no raw hex colors or arbitrary Tailwind values exist in `src/components` or `src/app`
- `npm run test` — Vitest unit test suite (atoms, molecules, formatters, tokens)
