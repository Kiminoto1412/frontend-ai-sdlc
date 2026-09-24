import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------
const mockProduct = {
  id: "p1",
  badge: "SALE",
  brand: "FarmBrand",
  title: "Fresh Apple",
  category_slug: "fruits-vegetables",
  unit: "kg",
  price: 1.99,
  original_price: 2.99,
  rating: 4.5,
  reviews: 120,
  description: "Crisp red apples",
  sold_percent: 70,
  sold_text: "70% sold",
  is_best_seller: 1,
  is_top_saver: 1,
  is_just_landing: 1,
  sale_ends_at: "2099-12-31T23:59:59Z",
  icon: "🍎",
  icon_bg: "#fff",
  created_at: "2024-01-01",
};

const mockImage = { id: 1, product_id: "p1", icon: "🍎", icon_bg: "#fff", sort_order: 1 };

// ---------------------------------------------------------------------------
// Mock @/lib/db — hoisted before any import
// ---------------------------------------------------------------------------
vi.mock("@/lib/db", () => ({
  queryProducts: vi.fn(),
  queryBestSellers: vi.fn(),
  queryTopSavers: vi.fn(),
  queryJustLanding: vi.fn(),
  getProductDetail: vi.fn(),
  getProductImages: vi.fn(),
  getRelatedProducts: vi.fn(),
  queryCategories: vi.fn(),
  getCartItems: vi.fn(),
  getCartSummary: vi.fn(),
  getDb: vi.fn(),
}));

import * as db from "@/lib/db";

beforeEach(() => {
  vi.mocked(db.queryProducts).mockReturnValue({ data: [mockProduct], total: 1 } as ReturnType<typeof db.queryProducts>);
  vi.mocked(db.queryBestSellers).mockReturnValue([mockProduct] as ReturnType<typeof db.queryBestSellers>);
  vi.mocked(db.queryTopSavers).mockReturnValue({ saleEndsAt: mockProduct.sale_ends_at, data: [mockProduct] } as ReturnType<typeof db.queryTopSavers>);
  vi.mocked(db.queryJustLanding).mockReturnValue([mockProduct] as ReturnType<typeof db.queryJustLanding>);
  vi.mocked(db.getProductDetail).mockReturnValue(mockProduct as ReturnType<typeof db.getProductDetail>);
  vi.mocked(db.getProductImages).mockReturnValue([mockImage] as ReturnType<typeof db.getProductImages>);
  vi.mocked(db.getRelatedProducts).mockReturnValue([] as ReturnType<typeof db.getRelatedProducts>);
});

// ---------------------------------------------------------------------------
// GET /api/products
// ---------------------------------------------------------------------------
describe("GET /api/products", () => {
  it("returns 200 with product list", async () => {
    const { GET } = await import("@/app/api/products/route");
    const req = new NextRequest("http://localhost:3000/api/products");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("p1");
  });

  it("passes q param to queryProducts", async () => {
    const { GET } = await import("@/app/api/products/route");
    const req = new NextRequest("http://localhost:3000/api/products?q=apple");
    await GET(req);
    expect(vi.mocked(db.queryProducts)).toHaveBeenCalledWith(
      expect.objectContaining({ q: "apple" })
    );
  });

  it("passes category param to queryProducts", async () => {
    const { GET } = await import("@/app/api/products/route");
    const req = new NextRequest("http://localhost:3000/api/products?category=fruits-vegetables");
    await GET(req);
    expect(vi.mocked(db.queryProducts)).toHaveBeenCalledWith(
      expect.objectContaining({ category: "fruits-vegetables" })
    );
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/best-sellers
// ---------------------------------------------------------------------------
describe("GET /api/products/best-sellers", () => {
  it("returns 200 with best-seller products", async () => {
    const { GET } = await import("@/app/api/products/best-sellers/route");
    const req = new NextRequest("http://localhost:3000/api/products/best-sellers");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("p1");
  });

  it("passes category param when provided", async () => {
    const { GET } = await import("@/app/api/products/best-sellers/route");
    const req = new NextRequest(
      "http://localhost:3000/api/products/best-sellers?category=fruits-vegetables"
    );
    await GET(req);
    expect(vi.mocked(db.queryBestSellers)).toHaveBeenCalledWith("fruits-vegetables");
  });

  it("passes undefined when category is absent", async () => {
    const { GET } = await import("@/app/api/products/best-sellers/route");
    const req = new NextRequest("http://localhost:3000/api/products/best-sellers");
    await GET(req);
    expect(vi.mocked(db.queryBestSellers)).toHaveBeenCalledWith(undefined);
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/top-savers
// ---------------------------------------------------------------------------
describe("GET /api/products/top-savers", () => {
  it("returns 200 with saleEndsAt and data", async () => {
    const { GET } = await import("@/app/api/products/top-savers/route");
    const req = new NextRequest("http://localhost:3000/api/products/top-savers");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.saleEndsAt).toBe(mockProduct.sale_ends_at);
    expect(body.data).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/just-landing
// ---------------------------------------------------------------------------
describe("GET /api/products/just-landing", () => {
  it("returns 200 with just-landing products", async () => {
    const { GET } = await import("@/app/api/products/just-landing/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("p1");
  });
});

// ---------------------------------------------------------------------------
// GET /api/products/[id]
// ---------------------------------------------------------------------------
describe("GET /api/products/[id]", () => {
  it("returns 200 with product detail, images, and related", async () => {
    const { GET } = await import("@/app/api/products/[id]/route");
    const req = new NextRequest("http://localhost:3000/api/products/p1");
    const res = await GET(req, { params: Promise.resolve({ id: "p1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("p1");
    expect(body.images).toHaveLength(1);
    expect(Array.isArray(body.related)).toBe(true);
  });

  it("returns 404 for an unknown product id", async () => {
    vi.mocked(db.getProductDetail).mockReturnValue(null);
    const { GET } = await import("@/app/api/products/[id]/route");
    const req = new NextRequest("http://localhost:3000/api/products/unknown");
    const res = await GET(req, { params: Promise.resolve({ id: "unknown" }) });
    expect(res.status).toBe(404);
  });
});
