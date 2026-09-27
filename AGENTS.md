<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Farmart project rules

## Database

- SQLite file is at `data/farmart.db` (git-ignored). The `data/` directory is committed via `data/.gitkeep`.
- The DB is **created and seeded automatically** on the first request — no migration step.
- Reset: `npm run db:reset` then `npm run dev`. Seed inserts 8 categories, 15 products, images, related-product pairs.
- `better-sqlite3` is a native module. `next.config.ts` must keep `serverExternalPackages: ["better-sqlite3"]` — do not remove it.
- `getDb()` from `src/lib/db.ts` is a singleton for the server process lifetime. **Never import `getDb` from a client component** (`"use client"` file) — it will crash at runtime.

## Server component data fetching

Server components call the project's own API routes via `fetch()`, not by importing DB helpers directly:

```typescript
import { apiBase } from "@/lib/api-url";
// inside an async server component:
const res = await fetch(apiBase() + "/api/products/best-sellers", { cache: "no-store" });
const { data } = await res.json();
```

These calls are server-to-server — they do **not** appear in the browser Network tab; look in the terminal running `npm run dev`.

**Exceptions:** `Header` (uses `getCartSummary`) and `src/app/cart/page.tsx` (uses `getCartItems`) call `getDb()` directly. These are server components only, so the pattern is safe, but new server components should use the fetch pattern for consistency.

`generateStaticParams` in `product/[id]/page.tsx` also calls `getDb()` directly (build-time only — no request context available there).

## Client component pattern

Client components (`"use client"`) interact with API routes via `fetch()` and refresh server-rendered content with `router.refresh()`:

```typescript
"use client";
import { useRouter } from "next/navigation";
// inside handler:
await fetch("/api/cart/items", { method: "POST", body: JSON.stringify({ productId, quantity }) });
router.refresh();
```

## Next.js 16 API changes

- `searchParams` in page components is a **`Promise`** — always `await searchParams` before reading properties.
- `params` in dynamic route components is a **`Promise`** — always `await params` before use.

## Auth & session

- Cart is anonymous — session ID in cookie `farmart_session` (UUID). Use `getOrCreateSessionId()` (API routes) or `getSessionId()` (server components, read-only) from `src/lib/session.ts`.
- Wishlist requires `Authorization: Bearer <jwt>` header. JWT helpers in `src/lib/auth.ts`: `signToken(userId)`, `verifyToken(token)`, `extractToken(request)`.
- `cookies()` from `next/headers` only works in Route Handlers and Server Components — never in tests without mocking.

## Tests

- Unit + integration tests live in `src/lib/__tests__/` and `src/app/api/__tests__/`, run with `npm test` (Vitest, Node env).
- Always mock `@/lib/db` and `@/lib/session` in API route tests — never hit the real DB.
- Mock pattern for DB: `vi.mock('@/lib/db', () => ({ getDb: vi.fn(), queryProducts: vi.fn(), ... }))`.
- Mock pattern for session: `vi.mock('@/lib/session', () => ({ getOrCreateSessionId: vi.fn().mockResolvedValue('sess-test') }))`.
- Component tests run as Storybook `play` functions (Chromium via Playwright): `npx vitest --project storybook run`.
