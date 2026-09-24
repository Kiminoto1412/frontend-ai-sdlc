// server-only: never import this from client components
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "farmart.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    setupSchema(_db);
    seedIfEmpty(_db);
  }
  return _db;
}

function setupSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      badge TEXT,
      brand TEXT NOT NULL,
      title TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      unit TEXT,
      price REAL NOT NULL,
      original_price REAL,
      rating REAL NOT NULL DEFAULT 4,
      reviews INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      sold_percent REAL,
      sold_text TEXT,
      is_best_seller INTEGER NOT NULL DEFAULT 0,
      is_top_saver INTEGER NOT NULL DEFAULT 0,
      is_just_landing INTEGER NOT NULL DEFAULT 0,
      sale_ends_at TEXT,
      icon TEXT NOT NULL DEFAULT '📦',
      icon_bg TEXT NOT NULL DEFAULT 'bg-zinc-100',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      icon TEXT NOT NULL,
      icon_bg TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS related_products (
      product_id TEXT NOT NULL,
      related_id TEXT NOT NULL,
      PRIMARY KEY (product_id, related_id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      UNIQUE(session_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS wishlist_items (
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, product_id)
    );
  `);
}

function seedIfEmpty(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }).c;
  if (count > 0) return;

  const insertCategory = db.prepare(
    "INSERT INTO categories (slug, label, icon) VALUES (?, ?, ?)"
  );
  const categories = [
    ["fruits-vegetables", "Fruits & Vegetables", "🍊"],
    ["breads-sweets", "Breads & Sweets", "🍞"],
    ["frozen-seafoods", "Frozen Seafoods", "🦐"],
    ["raw-meats", "Raw Meats", "🥩"],
    ["wines-alcohol-drinks", "Wines & Alcohol Drinks", "🍷"],
    ["coffees-teas", "Coffees & Teas", "☕"],
    ["milks-dairies", "Milks & Dairies", "🥛"],
    ["pet-foods", "Pet Foods", "🐾"],
  ];
  for (const cat of categories) insertCategory.run(...cat);

  const saleEnd = db
    .prepare("SELECT datetime('now', '+5 hours') as t")
    .get() as { t: string };
  const saleEndsAt = saleEnd.t;

  const insertProduct = db.prepare(`
    INSERT INTO products (id, badge, brand, title, category_slug, unit, price, original_price,
      rating, reviews, description, sold_percent, sold_text,
      is_best_seller, is_top_saver, is_just_landing, sale_ends_at, icon, icon_bg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products: Parameters<typeof insertProduct.run>[] = [
    ["ice-birds-beer-350ml", "Sale 12%", "Ice Bird's Brewery", "Ice Bird's Beer 350ml x 24 Pack", "wines-alcohol-drinks", "24 cans x 350ml", 89.9, 102.0, 4, 18, "A crisp, refreshing lager brewed in small batches. Sold as a 24-can case — perfect for stocking up before the weekend. Best served chilled.", 62, "Sold: 20/32", 1, 1, 0, saleEndsAt, "🍺", "bg-amber-100"],
    ["british-beef-mince", "Sale 20%", "MeatFarm", "British Beef Mince (Specially Fed)", "raw-meats", "500g pack", 9.99, 12.5, 5, 33, "Specially fed British beef, minced fresh daily with 10% fat content. Ideal for burgers, bolognese, and shepherd's pie. Keep refrigerated and use within 2 days.", 40, "Sold: 12/30", 1, 1, 0, saleEndsAt, "🥩", "bg-rose-100"],
    ["aloe-sweet-bananas", null, "Brand Name", "Aloe Sweet Bananas", "fruits-vegetables", "1 bunch", 18.29, null, 4, 21, "Fresh sweet bananas, hand-picked and ripened to perfection.", null, null, 1, 0, 0, null, "🍌", "bg-yellow-100"],
    ["10-yellow-watermelons", null, "Brand Name", "10 Yellow Watermelons", "fruits-vegetables", "10 pieces", 5.9, null, 4, 14, "Sweet yellow-fleshed watermelons, harvested fresh.", null, null, 1, 0, 0, null, "🍋", "bg-lime-100"],
    ["organic-foods-pastry-sifted", null, "Farmart", "Organic Foods & Pastry Sifted", "breads-sweets", "500g bag", 3.29, null, 4, 8, "Fine organic flour, triple-sifted for perfect baking results.", null, null, 1, 0, 0, null, "🌾", "bg-amber-100"],
    ["oatmeal-cookies", null, "Farmart", "Oatmeal Cookies", "breads-sweets", "300g pack", 4.28, null, 5, 19, "Freshly baked oatmeal cookies with a perfect crunch.", null, null, 1, 0, 0, null, "🍪", "bg-orange-100"],
    ["canned-royal-white-tofu", null, "Brand Name", "Canned Royal White Tofu", "milks-dairies", "400g can", 2.15, null, 4, 11, "Smooth white tofu, packaged in a convenient pull-top can.", null, null, 1, 0, 0, null, "🥫", "bg-sky-100"],
    ["farmart-farmhouse-soft-white", null, "Farmart", "Farmart Farmhouse Soft White", "breads-sweets", "800g loaf", 12.7, 14.2, 5, 27, "Soft white sandwich bread, baked fresh with simple ingredients.", 80, "Sold: 24/30", 0, 1, 0, saleEndsAt, "🍞", "bg-orange-100"],
    ["ice-bergs-beer-oranges", null, "Ice Berg's Farm", "Ice Berg's Beer 350ml Oranges", "fruits-vegetables", "29 pieces", 12.35, 13.9, 4, 15, "Sweet navel oranges from Ice Berg's farm, sold in bulk.", 55, "Sold: 16/29", 0, 1, 0, saleEndsAt, "🍊", "bg-yellow-100"],
    ["jumbo-frozen-shrimp", "New", "Ocean Farm", "Jumbo Frozen Shrimp Pack", "frozen-seafoods", "500g pack", 14.5, null, 5, 6, "Wild-caught jumbo shrimp, flash-frozen at sea for maximum freshness.", null, null, 0, 0, 1, null, "🦐", "bg-orange-100"],
    ["smoked-bacon-strips", null, "MeatFarm", "Smoked Bacon Strips 500g", "raw-meats", "500g pack", 7.4, null, 4, 12, "Traditionally smoked bacon with a rich, deep flavour.", null, null, 0, 0, 1, null, "🥓", "bg-rose-100"],
    ["cold-pressed-olive-oil", null, "Farmart", "Cold Pressed Olive Oil 1L", "milks-dairies", "1L bottle", 11.2, null, 5, 22, "Extra virgin olive oil, cold pressed from hand-harvested olives.", null, null, 0, 0, 1, null, "🍶", "bg-sky-100"],
    ["wildflower-honey-jar", null, "Brand Name", "Wildflower Honey Jar 350g", "milks-dairies", "350g jar", 6.75, null, 4, 17, "Raw wildflower honey, unpasteurised to preserve natural enzymes.", null, null, 0, 0, 1, null, "🍯", "bg-yellow-100"],
    ["breakfast-cereal-box", null, "Farmart", "Breakfast Cereal Box 400g", "breads-sweets", "400g box", 3.95, null, 4, 9, "Wholesome multigrain breakfast cereal, lightly sweetened.", null, null, 0, 0, 1, null, "📦", "bg-amber-100"],
    ["sparkling-water-pack", null, "Brand Name", "Sparkling Water Pack x6", "milks-dairies", "6 x 500ml", 4.6, null, 4, 13, "Naturally carbonated sparkling water, sourced from an alpine spring.", null, null, 0, 0, 1, null, "🧊", "bg-teal-100"],
  ];

  for (const p of products) insertProduct.run(...p);

  const insertImage = db.prepare(
    "INSERT INTO product_images (product_id, icon, icon_bg, sort_order) VALUES (?, ?, ?, ?)"
  );
  const images: [string, string, string, number][] = [
    ["ice-birds-beer-350ml", "🍺", "bg-amber-100", 0],
    ["ice-birds-beer-350ml", "🧊", "bg-sky-100", 1],
    ["ice-birds-beer-350ml", "📦", "bg-orange-100", 2],
    ["british-beef-mince", "🥩", "bg-rose-100", 0],
    ["british-beef-mince", "🍔", "bg-red-50", 1],
  ];
  for (const img of images) insertImage.run(...img);

  const insertRelated = db.prepare(
    "INSERT INTO related_products (product_id, related_id) VALUES (?, ?)"
  );
  const related: [string, string][] = [
    ["ice-birds-beer-350ml", "british-beef-mince"],
    ["ice-birds-beer-350ml", "aloe-sweet-bananas"],
    ["ice-birds-beer-350ml", "oatmeal-cookies"],
    ["ice-birds-beer-350ml", "10-yellow-watermelons"],
    ["british-beef-mince", "ice-birds-beer-350ml"],
    ["british-beef-mince", "aloe-sweet-bananas"],
    ["british-beef-mince", "oatmeal-cookies"],
    ["british-beef-mince", "organic-foods-pastry-sifted"],
  ];
  for (const r of related) insertRelated.run(...r);
}

export type ProductRow = {
  id: string;
  badge: string | null;
  brand: string;
  title: string;
  category_slug: string;
  unit: string | null;
  price: number;
  original_price: number | null;
  rating: number;
  reviews: number;
  description: string | null;
  sold_percent: number | null;
  sold_text: string | null;
  is_best_seller: number;
  is_top_saver: number;
  is_just_landing: number;
  sale_ends_at: string | null;
  icon: string;
  icon_bg: string;
};

export type CategoryRow = {
  slug: string;
  label: string;
  icon: string;
};

export type ImageRow = {
  icon: string;
  icon_bg: string;
  sort_order: number;
};

export function queryProducts(opts: {
  category?: string;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}): { data: ProductRow[]; pagination: { page: number; limit: number; total: number; totalPages: number } } {
  const db = getDb();
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (opts.category) {
    conditions.push("category_slug = ?");
    params.push(opts.category);
  }
  if (opts.q) {
    conditions.push("(title LIKE ? OR brand LIKE ?)");
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.minPrice != null) {
    conditions.push("price >= ?");
    params.push(opts.minPrice);
  }
  if (opts.maxPrice != null) {
    conditions.push("price <= ?");
    params.push(opts.maxPrice);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortMap: Record<string, string> = {
    price_asc: "price ASC",
    price_desc: "price DESC",
    rating_desc: "rating DESC",
    newest: "created_at DESC",
  };
  const orderBy = sortMap[opts.sort ?? ""] ?? "created_at DESC";

  const total = (
    db.prepare(`SELECT COUNT(*) as c FROM products ${where}`).get(...params) as { c: number }
  ).c;

  const data = db
    .prepare(`SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as ProductRow[];

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export function queryBestSellers(category?: string): ProductRow[] {
  const db = getDb();
  if (category && category !== "all") {
    return db
      .prepare("SELECT * FROM products WHERE is_best_seller = 1 AND category_slug = ? ORDER BY rating DESC")
      .all(category) as ProductRow[];
  }
  return db
    .prepare("SELECT * FROM products WHERE is_best_seller = 1 ORDER BY rating DESC")
    .all() as ProductRow[];
}

export function queryTopSavers(): { saleEndsAt: string | null; data: ProductRow[] } {
  const db = getDb();
  const data = db
    .prepare("SELECT * FROM products WHERE is_top_saver = 1 ORDER BY sold_percent DESC")
    .all() as ProductRow[];
  const saleEndsAt = data[0]?.sale_ends_at ?? null;
  return { saleEndsAt, data };
}

export function queryJustLanding(): ProductRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM products WHERE is_just_landing = 1 ORDER BY created_at DESC")
    .all() as ProductRow[];
}

export function queryCategories(): CategoryRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM categories ORDER BY slug").all() as CategoryRow[];
}

export function getProductDetail(id: string): ProductRow | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined) ?? null;
}

export function getProductImages(productId: string): ImageRow[] {
  const db = getDb();
  return db
    .prepare("SELECT icon, icon_bg, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order")
    .all(productId) as ImageRow[];
}

export function getRelatedProducts(productId: string): ProductRow[] {
  const db = getDb();
  return db
    .prepare(`
      SELECT p.* FROM products p
      INNER JOIN related_products r ON r.related_id = p.id
      WHERE r.product_id = ?
    `)
    .all(productId) as ProductRow[];
}

export function getCartItems(sessionId: string): { product: ProductRow; quantity: number }[] {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT p.*, ci.quantity
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.session_id = ?
    `)
    .all(sessionId) as (ProductRow & { quantity: number })[];
  return rows.map(({ quantity, ...product }) => ({ product, quantity }));
}

export function getCartSummary(sessionId: string): { itemCount: number; subtotal: number } {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT COALESCE(SUM(ci.quantity), 0) as item_count,
             COALESCE(SUM(p.price * ci.quantity), 0) as subtotal
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.session_id = ?
    `)
    .get(sessionId) as { item_count: number; subtotal: number };
  return { itemCount: row.item_count, subtotal: row.subtotal };
}
