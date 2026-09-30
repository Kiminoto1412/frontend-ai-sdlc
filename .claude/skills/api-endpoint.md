---
description: Add or change a REST endpoint under src/app/api/. Carries the route-handler conventions, the response-shape contract, and the checklist of every file that must be updated alongside it (OpenAPI spec, tests, docs). Use whenever creating, modifying, or removing an API route.
---

# API Endpoint Skill

You are adding or changing a REST endpoint in the Farmart Next.js 16 App Router project.

## Where things live

| Path | Role |
|---|---|
| `src/app/api/**/route.ts` | Route handlers (Web `Request`/`Response`) |
| `src/lib/db.ts` | All query helpers — add the DB function here, not in the route |
| `src/app/api/openapi.json/route.ts` | Hand-maintained OpenAPI 3.0 spec that feeds `/docs` |
| `src/app/api/__tests__/` | Integration tests (mocked DB + session) |

## Conventions

**Route handlers export HTTP-named functions.** A handler that does no `await` can be a plain `function`:

```typescript
import { NextResponse } from "next/server";
import { queryJustLanding } from "@/lib/db";

export function GET() {
  const data = queryJustLanding();
  return NextResponse.json({ data });
}
```

**Dynamic params are a `Promise`** (Next.js 16):

```typescript
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  // …
}
```

**Keep SQL out of route handlers.** Add a typed helper to `src/lib/db.ts` and call it from the route. Routes handle HTTP concerns — parsing, auth, status codes; `db.ts` owns persistence.

### Response shapes

Follow the shape the existing endpoints already use, because components destructure it directly:

| Kind | Shape |
|---|---|
| Collection | `{ data: Row[] }` |
| Paginated collection | `{ data: Row[], pagination: { page, limit, total, totalPages } }` |
| Collection with metadata | `{ data: Row[], saleEndsAt: string \| null }` (see top-savers) |
| Single resource | the object itself, optionally with embedded relations (`/api/products/:id` returns `{ ...product, images, related }`) |
| Error | `{ message: string }` — note the key is **`message`**, not `error` |
| Empty success | `new NextResponse(null, { status: 204 })` (see wishlist DELETE) |

### Status codes in use

`200` ok · `201` created (register, wishlist add) · `204` deleted, no body · `400` bad input · `401` missing/invalid JWT · `404` not found · `409` duplicate (wishlist composite PK conflict)

### Auth

- **Session-cookie routes** (cart): `const sessionId = await getOrCreateSessionId()` from `@/lib/session`.
- **Public routes** (products, categories, auth): neither.
- **JWT routes** (wishlist) use exactly this pattern — `verifyToken` resolves to a payload carrying `userId`, or `null`:

```typescript
import { verifyToken, extractToken } from "@/lib/auth";

const token = extractToken(request);
const auth = token ? await verifyToken(token) : null;
if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// use auth.userId
```

`POST /api/auth/login` and `/register` respond with `{ token, expiresIn: 86400 }`.

## Checklist — do all of these

1. **`src/lib/db.ts`** — add the query helper with an explicit return type.
2. **`src/app/api/<path>/route.ts`** — the handler. Validate input; return the conventional shape.
3. **`src/app/api/openapi.json/route.ts`** — add the path, parameters, request body, and response schemas. `/docs` is generated from this file and is the project's authoritative API reference, so an endpoint missing here is invisible to anyone exploring the API. This is the step people forget.
4. **Tests** in `src/app/api/__tests__/` — mock `@/lib/db` and `@/lib/session`; cover the success path plus each error status the handler can return. Use `/test` for the mock patterns.
5. **`ONBOARDING.md`** — add the row to the API Endpoints table (the human-facing summary).
6. Run `npm test` **and** `npx tsc --noEmit` — Vitest does not typecheck, so mocks can drift from the real signature while tests still pass.

`AGENTS.md` deliberately does **not** list endpoints — the spec in step 3 is the single source of truth, so there is no table there to update.

If the endpoint required a schema change, switch to `/database` for that checklist too.

## Verifying by hand

```bash
npm run dev
curl -s http://localhost:3000/api/<path> | python3 -m json.tool
```

Session-cookie routes need a cookie jar:

```bash
curl -s -c /tmp/jar -b /tmp/jar http://localhost:3000/api/cart | python3 -m json.tool
```

JWT routes need a token from login:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.c","password":"secret123"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/wishlist | python3 -m json.tool
```

Then check it renders in Swagger UI at `http://localhost:3000/docs`.
