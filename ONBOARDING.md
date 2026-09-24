# Farmart — Developer Onboarding

Farmart is a Next.js 16 App Router grocery storefront. It uses SQLite for persistence with auto-seeding, a REST API layer, JWT auth, and anonymous cart sessions.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Database | SQLite via `better-sqlite3` (WAL mode, file: `data/farmart.db`) |
| Auth | JWT via `jose`, bcryptjs for password hashing |
| Cart session | Anonymous cookie `farmart_session` (UUID) |
| Tests | Vitest — `unit` project (Node env) + `storybook` project (Chromium) |

## Prerequisites

```bash
nvm use          # switches to Node 22 (from .nvmrc)
node -v          # expect v22.x
```

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
```

The SQLite database (`farmart.db`) is **created and seeded automatically** the first time the dev server handles any request. No manual migration step needed.

---

## Seed Data Reference

Seed runs once when the `products` table is empty. It inserts the following data.

### Categories (8)

| Slug | Label | Icon |
|---|---|---|
| `fruits-vegetables` | Fruits & Vegetables | 🍊 |
| `breads-sweets` | Breads & Sweets | 🍞 |
| `frozen-seafoods` | Frozen Seafoods | 🦐 |
| `raw-meats` | Raw Meats | 🥩 |
| `wines-alcohol-drinks` | Wines & Alcohol Drinks | 🍷 |
| `coffees-teas` | Coffees & Teas | ☕ |
| `milks-dairies` | Milks & Dairies | 🥛 |
| `pet-foods` | Pet Foods | 🐾 |

### Products (15)

| ID | Title | Category | Price | Best Seller | Top Saver | Just Landing |
|---|---|---|---|---|---|---|
| `ice-birds-beer-350ml` | Ice Bird's Beer 350ml x 24 Pack | wines-alcohol-drinks | $89.90 | ✓ | ✓ | — |
| `british-beef-mince` | British Beef Mince | raw-meats | $9.99 | ✓ | ✓ | — |
| `aloe-sweet-bananas` | Aloe Sweet Bananas | fruits-vegetables | $18.29 | ✓ | — | — |
| `10-yellow-watermelons` | 10 Yellow Watermelons | fruits-vegetables | $5.90 | ✓ | — | — |
| `organic-foods-pastry-sifted` | Organic Foods & Pastry Sifted | breads-sweets | $3.29 | ✓ | — | — |
| `oatmeal-cookies` | Oatmeal Cookies | breads-sweets | $4.28 | ✓ | — | — |
| `canned-royal-white-tofu` | Canned Royal White Tofu | milks-dairies | $2.15 | ✓ | — | — |
| `farmart-farmhouse-soft-white` | Farmart Farmhouse Soft White | breads-sweets | $12.70 | — | ✓ | — |
| `ice-bergs-beer-oranges` | Ice Berg's Beer 350ml Oranges | fruits-vegetables | $12.35 | — | ✓ | — |
| `jumbo-frozen-shrimp` | Jumbo Frozen Shrimp Pack | frozen-seafoods | $14.50 | — | — | ✓ |
| `smoked-bacon-strips` | Smoked Bacon Strips 500g | raw-meats | $7.40 | — | — | ✓ |
| `cold-pressed-olive-oil` | Cold Pressed Olive Oil 1L | milks-dairies | $11.20 | — | — | ✓ |
| `wildflower-honey-jar` | Wildflower Honey Jar 350g | milks-dairies | $6.75 | — | — | ✓ |
| `breakfast-cereal-box` | Breakfast Cereal Box 400g | breads-sweets | $3.95 | — | — | ✓ |
| `sparkling-water-pack` | Sparkling Water Pack x6 | milks-dairies | $4.60 | — | — | ✓ |

**Top Saver products** (`is_top_saver = 1`) also get `sale_ends_at` set to 5 hours after seed time.

**Product images** are seeded for `ice-birds-beer-350ml` (3 images) and `british-beef-mince` (2 images).

**Related products** are seeded as:
- `ice-birds-beer-350ml` → `british-beef-mince`, `aloe-sweet-bananas`, `oatmeal-cookies`, `10-yellow-watermelons`
- `british-beef-mince` → `ice-birds-beer-350ml`, `aloe-sweet-bananas`, `oatmeal-cookies`, `organic-foods-pastry-sifted`

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List products (`q`, `category`, `sort`, `minPrice`, `maxPrice`, `page`, `limit`) |
| GET | `/api/products/best-sellers` | — | Best-seller products (optional `category`) |
| GET | `/api/products/top-savers` | — | Sale products with `saleEndsAt` |
| GET | `/api/products/just-landing` | — | New arrivals |
| GET | `/api/products/:id` | — | Product detail + images + related |
| GET | `/api/categories` | — | All categories |
| GET | `/api/cart` | cookie | Cart for current session |
| DELETE | `/api/cart` | cookie | Clear cart |
| POST | `/api/cart/items` | cookie | Add/upsert `{ productId, quantity }` |
| PUT | `/api/cart/items/:productId` | cookie | Update quantity (0 = remove) |
| DELETE | `/api/cart/items/:productId` | cookie | Remove item |
| POST | `/api/auth/register` | — | Register `{ email, password }` → JWT |
| POST | `/api/auth/login` | — | Login `{ email, password }` → JWT |
| GET | `/api/wishlist` | Bearer JWT | Get wishlist |
| POST | `/api/wishlist` | Bearer JWT | Add `{ productId }` |
| DELETE | `/api/wishlist/:productId` | Bearer JWT | Remove from wishlist |

Interactive docs at **[http://localhost:3000/docs](http://localhost:3000/docs)** (Swagger UI).

ER diagram at **[http://localhost:3000/mermaid.html](http://localhost:3000/mermaid.html)**.

---

## Commands

```bash
npm run dev              # Next.js dev server — http://localhost:3000
npm run build            # Production build
npm test                 # Run 50 unit + integration tests (Vitest, Node env)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run storybook        # Component explorer — http://localhost:6006
npx tsc --noEmit         # TypeScript check
npm run lint             # ESLint
```

---

## Database Management

The DB file lives at `data/farmart.db` (git-ignored). The `data/` directory is committed with a `.gitkeep` so the folder exists in fresh checkouts.

**Reset seed data** (delete and let the server re-seed on next request):

```bash
npm run db:reset
# then restart: npm run dev
```

Or manually:

```bash
rm data/farmart.db data/farmart.db-shm data/farmart.db-wal
# restart npm run dev → DB auto-recreates and re-seeds
```

---

## Key Source Files

| Path | Purpose |
|---|---|
| `src/lib/db.ts` | SQLite singleton, schema, seed, all query helpers |
| `src/lib/auth.ts` | `signToken`, `verifyToken`, `extractToken` |
| `src/lib/session.ts` | Cart session cookie helpers |
| `src/lib/api-url.ts` | `apiBase()` for server-component fetch calls |
| `src/app/api/` | All REST API route handlers |
| `src/app/page.tsx` | Homepage (reads `searchParams` for category/search) |
| `src/app/product/[id]/page.tsx` | Product detail page |
| `src/components/` | All UI components (flat, colocated with `.stories.tsx`) |
| `src/app/api/__tests__/` | API integration tests (mocked DB + session) |
| `src/lib/__tests__/` | Library unit tests |

---

## Architecture Notes

- **Server components** fetch data via `fetch()` to the project's own API routes (server-to-server — not visible in browser Network tab).
- **Client components** (`"use client"`) interact via `fetch()` to API routes and call `router.refresh()` to trigger server-component re-renders.
- Cart works without a login — session ID is stored in the `farmart_session` cookie.
- Wishlist requires a JWT `Bearer` token in the `Authorization` header.
- `generateStaticParams` in the product detail page still calls `getDb()` directly (build-time operation).
