# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Farmart — a Next.js (App Router) storefront for an online grocery store. See `PLAN.md` for the full feature roadmap/business goals and `DESIGN.md` for the visual design system (colors, typography, component conventions, do's/don'ts). **Read `DESIGN.md` before writing any UI** — it's the authority on styling, not this file.

## Node version

Use Node from `.nvmrc` (currently `22`): `nvm use`. Storybook 10 requires Node 20.19+/22.12+, which is higher than Next.js's own minimum (18.18+), so the project pins the higher version to keep one Node version working for everything.

## Commands

```bash
npm run dev              # Next.js dev server (Turbopack) — http://localhost:3000
npm run build             # production build
npm run start             # serve the production build
npm run lint               # ESLint (flat config, includes eslint-plugin-storybook)
npx tsc --noEmit           # typecheck (no dedicated package.json script)

npm test                   # run all backend unit + integration tests (Vitest, Node env)
npm run test:watch         # same, watch mode
npm run test:coverage      # same + coverage report

npm run storybook          # Storybook dev server — http://localhost:6006
npm run build-storybook    # static Storybook build → storybook-static/

npx vitest --project storybook run                          # run all component (play-function) tests
npx vitest --project storybook run src/components/Foo.stories.tsx   # run a single story file's tests

npm run db:reset           # delete data/farmart.db so the next server request re-seeds it

npx @google/design.md lint DESIGN.md   # validate DESIGN.md's YAML frontmatter/tokens (0 errors, 0 warnings expected)
```

Storybook and `npm run dev` are **independent servers on different ports** — you don't need one running to use the other.

## Architecture

### Pages & Routes

- **App Router only** (`src/app/`) — no `pages/` directory. UI routes:
  - `/` — homepage (`src/app/page.tsx`), assembled from section components in `src/components/`. Accepts `searchParams` (`category`, `q`) as a `Promise` for server-component filtering.
  - `/product/[id]` (`src/app/product/[id]/page.tsx`) — dynamic product detail page; `params` is a `Promise` (Next.js 16 async params API — `await params` before use). Uses `generateStaticParams` (calls `getDb()` directly at build time) + fetches live data via `/api/products/:id` at runtime.
  - `/cart` (`src/app/cart/page.tsx`) — server component, reads session cookie, renders cart items.
  - `/docs` (`src/app/docs/page.tsx`) — Swagger UI served from `/api/openapi.json`.
  - `/schema` (`src/app/schema/page.tsx`) — redirects to `/mermaid.html` (static file in `public/`).
  - `/design` (`src/app/design/page.tsx`) — live style-guide page; keep in sync with `DESIGN.md`.
  - `/overview` (`src/app/overview/page.tsx`) — `@xyflow/react` diagram of all routes and links.

- **REST API** (`src/app/api/`) — all route handlers are standard Next.js Route Handlers (Web `Request` / `Response`). Key groups:
  - `GET /api/products` — paginated list with `q`, `category`, `sort`, `minPrice`, `maxPrice` filters
  - `GET /api/products/best-sellers`, `/top-savers`, `/just-landing`, `/:id`
  - `GET /api/categories`
  - `GET|DELETE /api/cart`, `POST /api/cart/items`, `PUT|DELETE /api/cart/items/:productId`
  - `POST /api/auth/register`, `POST /api/auth/login`
  - `GET|POST /api/wishlist` (JWT required), `DELETE /api/wishlist/:productId` (JWT required)
  - `GET /api/openapi.json` — OpenAPI 3.0 spec

### Backend

- **Database**: SQLite via `better-sqlite3`, WAL mode. File lives at `data/farmart.db` (git-ignored; `data/.gitkeep` is committed so the directory exists in fresh checkouts). The DB is **created and seeded automatically** on the first request — no migration step needed.
  - Singleton: `src/lib/db.ts → getDb()`. Schema and seed live in the same file.
  - Seed: 8 categories, 15 products, 5 product images, 8 related-product pairs.
  - `next.config.ts` must declare `serverExternalPackages: ["better-sqlite3"]` for Turbopack.
- **Auth**: JWT via `jose` (`src/lib/auth.ts`). Secret from `process.env.JWT_SECRET` (falls back to a dev default). Helpers: `signToken(userId)`, `verifyToken(token)`, `extractToken(request)`.
- **Cart session**: Anonymous cookie `farmart_session` (UUID) — no login required. `src/lib/session.ts` exports `getOrCreateSessionId()` (sets cookie, for API routes) and `getSessionId()` (read-only, for server components).
- **Internal fetch helper**: `src/lib/api-url.ts → apiBase()` returns `process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"`. Server components use this to call the project's own API routes via `fetch()` — these calls are server-to-server and are **not visible in the browser Network tab**.

### Components

- **`src/components/`** — flat directory, no subfolders or barrel file. Every component is colocated with its own `*.stories.tsx` Storybook file.
- **Server components** (async, no `"use client"`): `BestSeller`, `TopSaver`, `CategoryGrid`, `JustLanding` — fetch data via `fetch(apiBase() + "/api/...")` with `cache: "no-store"`. **Exceptions**: `Header` and `src/app/cart/page.tsx` call `getDb()` directly (via `getCartSummary` and `getCartItems` respectively) instead of going through the API — they're server-only so this is safe, but it's an inconsistency to be aware of.
- **Client components** (`"use client"`): `AddToCartButton`, `CartItemRow`, `ProductActions`, `RegisterForm`, `SearchBar`, `PageFlowOverview` — call API routes via `fetch()` and trigger server re-renders with `router.refresh()`.
- Reusable primitives: `Dialog`, `Rating`, `QuantitySelector`, `Breadcrumbs`, `ProductGallery` — check `DESIGN.md` §4 and reuse these before building a new equivalent.

### Tests

Two Vitest projects (configured in `vitest.config.ts`):

| Project | Command | Environment | What it covers |
|---|---|---|---|
| `unit` | `npm test` | Node | Backend lib unit tests + API route integration tests (mocked DB) |
| `storybook` | `npx vitest --project storybook run` | Chromium (Playwright) | Component `play` function tests |

Backend tests live in `src/lib/__tests__/` and `src/app/api/__tests__/`. They mock `@/lib/db` and `@/lib/session` — never hit the real DB.

### Styling

- **Tailwind CSS v4, CSS-first config** — no `tailwind.config.js`. Theme tokens defined as CSS variables in `src/app/globals.css` under `@theme inline` (`--brand`, `--brand-dark`, `--brand-soft`). Path alias `@/*` → `./src/*` (see `tsconfig.json`).
- **`.storybook/preview.tsx`** imports `src/app/globals.css` so stories render with actual Tailwind output.

## Gotchas

- The `<!-- BEGIN:nextjs-agent-rules -->…<!-- END -->` block in `AGENTS.md` is written and **overwritten by `next dev` itself** on every start (`node_modules/next/dist/server/lib/generate-agent-files.js`). Don't rely on hand-edits to `AGENTS.md` persisting — durable, repo-specific instructions belong in this file (`CLAUDE.md`) instead.
- **`better-sqlite3` is a native module** — `next.config.ts` must keep `serverExternalPackages: ["better-sqlite3"]`, otherwise Turbopack will try to bundle it and fail.
- **Server component fetch calls are server-to-server** — they don't appear in the browser Network tab. They do appear in the terminal where `npm run dev` is running.
- **DB singleton is process-scoped** — `getDb()` in `src/lib/db.ts` holds a single connection for the lifetime of the Next.js server process. Do not import `getDb` from client components.
- **`generateStaticParams`** in `product/[id]/page.tsx` calls `getDb()` directly (it runs at build time, not at request time, so the API-fetch pattern doesn't apply there).
- **Cookie APIs require the Next.js runtime** — `getOrCreateSessionId()` (and `getSessionId()`) call `cookies()` from `next/headers`, which only works inside Route Handlers and Server Components. Tests must mock `@/lib/session` to avoid this dependency.
- **`searchParams` is a `Promise`** in Next.js 16 App Router pages — always `await searchParams` before reading properties.
- **Reset the DB** with `npm run db:reset` then restart the dev server; the seed runs automatically on the first request. The DB file is at `data/farmart.db` and is git-ignored.

## Schema change rule

**Every time a table or column is added, removed, or renamed**, update ALL of the following before considering the feature done:

1. `src/lib/db.ts` — `setupSchema()` SQL + exported TypeScript types + `seedIfEmpty()` if needed
2. `docs/er-diagram.md` — Mermaid `erDiagram` block + Tables summary
3. `public/mermaid.html` — the `const diagram` string inside the `<script>` block (keep `/mermaid.html` in sync with the docs)
4. `.claude/skills/database.md` — ER diagram block + Table Reference section (keeps the `/database` skill accurate for future sessions)
5. This file (`CLAUDE.md`) — Backend section if the architecture changes

Use `/database` (the database skill) to check the current diagram, verify nothing is out of sync, and get the update checklist.
- **`src/data/products.ts`** is a legacy file (two hardcoded `ProductDetail` objects + `getProductById`) left over from before the SQLite backend existed. The product detail page no longer uses it (it calls the API instead), but the file still compiles. Don't add to it; prefer the DB.
- **Static assets** in `public/`: generic Next.js SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) plus `mermaid.html` — a standalone page that renders the ER diagram from `docs/er-diagram.md` (reachable at `http://localhost:3000/mermaid.html`).
- **Storybook** uses `@storybook/nextjs-vite` framework with addons: `chromatic`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`, and `@storybook/addon-mcp`. Config is in `.storybook/main.ts` and `.storybook/preview.tsx`.
- **`vitest.shims.d.ts`** at the project root re-exports Vitest globals (`describe`, `it`, `expect`, etc.) for TypeScript — needed so story `play` functions get proper types without importing from `vitest` directly.
