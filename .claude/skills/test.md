---
description: Write or fix Farmart backend tests and work with coverage. Carries the two-project Vitest layout, every mock pattern (db, session, bcryptjs, JWT), the real return-type shapes mocks must match, and the coverage scope and thresholds. Use whenever writing, debugging, or measuring tests.
---

# Test Skill

You are writing or fixing tests in the Farmart project.

## Two Vitest projects

Configured in `vitest.config.ts`:

| Project | Command | Environment | Covers |
|---|---|---|---|
| `unit` | `npm test` | Node | `src/lib/__tests__/` + `src/app/api/__tests__/` |
| `storybook` | `npx vitest --project storybook run` | Chromium via Playwright | `play` functions in `src/components/*.stories.tsx` |

The `unit` project only picks up `src/**/*.test.ts`. Component tests are never `.test.ts` files — they live in stories (use `/component` for those).

## The rule that catches people

**Vitest does not typecheck.** `npm test` can pass while `npx tsc --noEmit` fails, because a mock's shape drifts from the real function signature it stands in for. Always run both.

Mocks are asserted with `as ReturnType<typeof db.someFn>`, which TypeScript checks for plausibility — so a wrong shape is a compile error, not a silent pass.

## Mock patterns

### Database — always mock it, never touch the real DB

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  queryProducts: vi.fn(),
  queryBestSellers: vi.fn(),
  getProductDetail: vi.fn(),
  getDb: vi.fn(),
}));

import * as db from "@/lib/db";
```

`vi.mock` is hoisted above the imports, so the factory must list every export the route under test uses. Wire return values in `beforeEach` with `vi.mocked(...)`.

For routes that run raw SQL through `getDb()`, mock the statement chain:

```typescript
const mockRun = vi.fn();
const mockGet = vi.fn();
const mockAll = vi.fn();
const mockPrepare = vi.fn(() => ({ run: mockRun, get: mockGet, all: mockAll }));
const mockDb = { prepare: mockPrepare, exec: vi.fn() };

beforeEach(() => {
  vi.mocked(db.getDb).mockReturnValue(mockDb as never);
  mockRun.mockReset();
  mockGet.mockReset();
  mockAll.mockReset();
});
```

### Session — always mock it

`getOrCreateSessionId()` calls `cookies()` from `next/headers`, which only works inside the Next.js request runtime and throws in tests.

```typescript
vi.mock("@/lib/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("sess-test-123"),
}));
```

### bcryptjs — mock it so hashing doesn't slow the suite

Note the `default` wrapper; the routes use the default export.

```typescript
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$mock$hash"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));
```

### JWT — use the real thing

`signToken` is fast and has no I/O, so generate genuine tokens rather than mocking `jose`:

```typescript
import { signToken } from "@/lib/auth";

async function authHeader() {
  const token = await signToken("user-test-1");
  return { Authorization: `Bearer ${token}` };
}
```

## Return-type shapes mocks must match

These are the ones that have actually broken:

```typescript
// getCartItems — nested, NOT a flat joined row
type CartItems = { product: ProductRow; quantity: number }[];

// queryProducts — needs the full pagination object, NOT a bare `total`
type Products = {
  data: ProductRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

// queryTopSavers — collection plus metadata
type TopSavers = { saleEndsAt: string | null; data: ProductRow[] };

// getCartSummary
type CartSummary = { itemCount: number; subtotal: number };

// getProductDetail / queryBestSellers / queryJustLanding / getRelatedProducts
// → ProductRow | null, and ProductRow[] respectively
```

When in doubt, read the signature in `src/lib/db.ts` rather than guessing — that file is the contract.

## Calling a route handler in a test

Import the handler and hand it a real `NextRequest`:

```typescript
import { NextRequest } from "next/server";
import { GET } from "@/app/api/products/route";

const res = await GET(new NextRequest("http://localhost:3000/api/products?limit=5"));
expect(res.status).toBe(200);
const json = await res.json();
expect(json.data).toHaveLength(1);
```

Dynamic routes take params as a `Promise`:

```typescript
const res = await DELETE(
  new NextRequest("http://localhost:3000/api/cart/items/p1", { method: "DELETE" }),
  { params: Promise.resolve({ productId: "p1" }) },
);
```

## Coverage

```bash
npm run test:coverage
```

Scoped in `vitest.config.ts` to the code the `unit` project actually exercises:

- **Included** — `src/app/api/**/*.ts`, `src/lib/auth.ts`, `src/lib/api-url.ts`
- **Excluded deliberately** — components (covered by the `storybook` project instead), and `src/lib/db.ts` / `src/lib/session.ts` (always mocked, so they would report 0% and drag the totals down)

Thresholds, enforced — the command exits non-zero below any of them:

| Metric | Threshold |
|---|---|
| Statements | 80% |
| Lines | 80% |
| Functions | 75% |
| Branches | 70% |

Reporters: `text` (terminal), `html` → `coverage/index.html`, `json-summary`.

**If a threshold fails**, add the missing test — don't lower the threshold. If a file genuinely has nothing to test (a static spec object, for instance), exclude that path in `vitest.config.ts` and say why in a comment.

Known 0% files: `api/openapi.json/route.ts` (a static spec, no logic) and `api/wishlist/[productId]/route.ts` (the DELETE handler has no test yet — a real gap worth filling).

## Before declaring done

```bash
npm test             # all unit + integration tests
npx tsc --noEmit     # mocks still match real signatures
```
