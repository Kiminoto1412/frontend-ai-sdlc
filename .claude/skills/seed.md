---
description: Manage the Farmart SQLite seed data — inspect current DB state, reset and re-seed, or add new seed rows.
---

# Seed Data Skill

You are helping the developer manage the Farmart SQLite seed data in `farmart.db`.

## What the seed creates

When `farmart.db` doesn't exist or its `products` table is empty, `src/lib/db.ts → seedIfEmpty()` inserts:

- **8 categories** (fruits-vegetables, breads-sweets, frozen-seafoods, raw-meats, wines-alcohol-drinks, coffees-teas, milks-dairies, pet-foods)
- **15 products** with flags `is_best_seller`, `is_top_saver`, `is_just_landing`
- **5 product images** for `ice-birds-beer-350ml` and `british-beef-mince`
- **8 related-product pairs**
- `sale_ends_at` = 5 hours after seed time for all `is_top_saver = 1` products

## How to respond based on the user's request

### "Show me what's in the database" / "What seed data is loaded?"

Run these bash commands and summarise the results:

```bash
cd /Users/paruj.lap/Desktop/learn/frontend-ai-sdlc
node -e "
const DB = require('better-sqlite3');
const db = new DB('data/farmart.db');
const cats = db.prepare('SELECT slug, label FROM categories').all();
const prods = db.prepare('SELECT id, title, price, is_best_seller, is_top_saver, is_just_landing FROM products').all();
const imgs = db.prepare('SELECT COUNT(*) as c FROM product_images').get();
const rel = db.prepare('SELECT COUNT(*) as c FROM related_products').get();
const users = db.prepare('SELECT COUNT(*) as c FROM users').get();
const cart = db.prepare('SELECT COUNT(*) as c FROM cart_items').get();
console.log('Categories:', cats.length);
console.log('Products:', prods.length);
console.log('Images:', imgs.c);
console.log('Related pairs:', rel.c);
console.log('Users:', users.c);
console.log('Cart items:', cart.c);
console.log('\\nProduct breakdown:');
prods.forEach(p => console.log(
  p.id.padEnd(32),
  'BS:', p.is_best_seller, ' TS:', p.is_top_saver, ' JL:', p.is_just_landing,
  ' $'+p.price
));
"
```

### "Reset the database" / "Re-seed" / "Start fresh"

Warn the user that this will delete all data (including users and cart items), then — if confirmed — run:

```bash
cd /Users/paruj.lap/Desktop/learn/frontend-ai-sdlc
rm -f data/farmart.db data/farmart.db-shm data/farmart.db-wal
```

Then instruct them to hit any page in the dev server (or restart `npm run dev`) to trigger automatic re-seeding.

### "Add a new product to the seed data"

Edit `src/lib/db.ts` inside the `products` array in `seedIfEmpty()`. Each product follows this structure:

```typescript
[
  "product-id",          // TEXT PRIMARY KEY (kebab-case slug)
  "Badge Text or null",  // badge: TEXT | null
  "Brand Name",          // brand: TEXT
  "Product Title",       // title: TEXT
  "category-slug",       // category_slug: TEXT (must match categories table)
  "unit description",    // unit: TEXT  e.g. "500g pack"
  9.99,                  // price: REAL
  12.99,                 // original_price: REAL | null (null = no discount)
  4.5,                   // rating: REAL (0–5)
  100,                   // reviews: INTEGER
  "Description text.",   // description: TEXT
  75,                    // sold_percent: REAL | null
  "Sold: 15/20",         // sold_text: TEXT | null
  1,                     // is_best_seller: 0 | 1
  0,                     // is_top_saver: 0 | 1 (also needs saleEndsAt to be non-null)
  0,                     // is_just_landing: 0 | 1
  null,                  // sale_ends_at: TEXT | null  (use `saleEndsAt` variable for top-saver)
  "🥦",                  // icon: TEXT (emoji)
  "bg-green-100",        // icon_bg: TEXT (Tailwind bg class)
]
```

After editing, reset the DB so the seed runs again with the new product.

### "Change the sale end time"

The `sale_ends_at` value for `is_top_saver = 1` products is computed at seed time:

```typescript
// src/lib/db.ts — inside seedIfEmpty()
const saleEnd = db.prepare("SELECT datetime('now', '+5 hours') as t").get() as { t: string };
```

To change the duration, edit `'+5 hours'` to any valid SQLite datetime modifier (e.g. `'+2 days'`). Then reset the DB.

### "Add a product image"

Edit the `images` array in `seedIfEmpty()`:

```typescript
["product-id", "🍎", "bg-red-100", 0],  // sort_order 0 = primary image
```

### "Add related products"

Edit the `related` array in `seedIfEmpty()`:

```typescript
["product-id", "related-product-id"],
```

The relationship is one-directional; add both directions if needed.

## Files involved

- `src/lib/db.ts` — single source of truth for schema + seed
- `data/farmart.db` — the SQLite file (git-ignored; `data/` folder itself is committed with `.gitkeep`)
- `scripts/reset-db.ts` — convenience script: `npm run db:reset`
