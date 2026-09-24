import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("@/lib/session", () => ({
  getOrCreateSessionId: vi.fn().mockResolvedValue("sess-test-123"),
}));

const mockRun = vi.fn();
const mockGet = vi.fn();
const mockAll = vi.fn();
const mockPrepare = vi.fn(() => ({ run: mockRun, get: mockGet, all: mockAll }));
const mockDb = { prepare: mockPrepare, exec: vi.fn() };

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
  getProductDetail: vi.fn(),
  getCartItems: vi.fn(),
  getCartSummary: vi.fn(),
}));

import * as db from "@/lib/db";
import * as session from "@/lib/session";

const cartItems = [
  {
    id: 1,
    session_id: "sess-test-123",
    product_id: "p1",
    quantity: 2,
    title: "Fresh Apple",
    price: 1.99,
    icon: "🍎",
    icon_bg: "#fff",
  },
];

beforeEach(() => {
  vi.mocked(db.getDb).mockReturnValue(mockDb as never);
  vi.mocked(db.getCartItems).mockReturnValue(cartItems as ReturnType<typeof db.getCartItems>);
  vi.mocked(db.getCartSummary).mockReturnValue({ itemCount: 1, subtotal: 3.98 });
  vi.mocked(db.getProductDetail).mockReturnValue({
    id: "p1", badge: null, brand: "FarmBrand", title: "Fresh Apple",
    category_slug: "fruits-vegetables", unit: "kg", price: 1.99,
    original_price: null, rating: 4.5, reviews: 100, description: "",
    sold_percent: null, sold_text: null, is_best_seller: 1, is_top_saver: 0,
    is_just_landing: 0, sale_ends_at: null, icon: "🍎", icon_bg: "#fff",
    created_at: "2024-01-01",
  } as ReturnType<typeof db.getProductDetail>);
  vi.mocked(session.getOrCreateSessionId).mockResolvedValue("sess-test-123");
  mockRun.mockReset();
  mockGet.mockReset();
  mockAll.mockReset();
});

// ---------------------------------------------------------------------------
// GET /api/cart
// ---------------------------------------------------------------------------
describe("GET /api/cart", () => {
  it("returns 200 with cart items and summary", async () => {
    const { GET } = await import("@/app/api/cart/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.itemCount).toBe(1);
    expect(body.subtotal).toBeCloseTo(3.98);
    expect(body.items).toHaveLength(1);
    expect(body.freeDeliveryThreshold).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/cart
// ---------------------------------------------------------------------------
describe("DELETE /api/cart", () => {
  it("returns 204 and clears cart items", async () => {
    const { DELETE } = await import("@/app/api/cart/route");
    const res = await DELETE();
    expect(res.status).toBe(204);
    expect(mockPrepare).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM cart_items")
    );
    expect(mockRun).toHaveBeenCalledWith("sess-test-123");
  });
});

// ---------------------------------------------------------------------------
// POST /api/cart/items
// ---------------------------------------------------------------------------
describe("POST /api/cart/items", () => {
  it("returns 200 and adds a valid item", async () => {
    const { POST } = await import("@/app/api/cart/items/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId: "p1", quantity: 2 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toBeDefined();
    expect(body.itemCount).toBe(1);
  });

  it("returns 400 when productId is missing", async () => {
    const { POST } = await import("@/app/api/cart/items/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when quantity is less than 1", async () => {
    const { POST } = await import("@/app/api/cart/items/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId: "p1", quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when product does not exist", async () => {
    vi.mocked(db.getProductDetail).mockReturnValue(null);
    const { POST } = await import("@/app/api/cart/items/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId: "nonexistent", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 400 for malformed JSON body", async () => {
    const { POST } = await import("@/app/api/cart/items/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/cart/items/[productId]
// ---------------------------------------------------------------------------
describe("PUT /api/cart/items/[productId]", () => {
  it("returns 200 and updates quantity", async () => {
    const { PUT } = await import("@/app/api/cart/items/[productId]/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items/p1", {
      method: "PUT",
      body: JSON.stringify({ quantity: 3 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: Promise.resolve({ productId: "p1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toBeDefined();
  });

  it("removes item when quantity is 0", async () => {
    vi.mocked(db.getCartItems).mockReturnValue([]);
    vi.mocked(db.getCartSummary).mockReturnValue({ itemCount: 0, subtotal: 0 });
    const { PUT } = await import("@/app/api/cart/items/[productId]/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items/p1", {
      method: "PUT",
      body: JSON.stringify({ quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: Promise.resolve({ productId: "p1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.itemCount).toBe(0);
    // Verify DELETE SQL was used for quantity 0
    expect(mockPrepare).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM cart_items")
    );
  });

  it("returns 400 for negative quantity", async () => {
    const { PUT } = await import("@/app/api/cart/items/[productId]/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items/p1", {
      method: "PUT",
      body: JSON.stringify({ quantity: -1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: Promise.resolve({ productId: "p1" }) });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/cart/items/[productId]
// ---------------------------------------------------------------------------
describe("DELETE /api/cart/items/[productId]", () => {
  it("returns 200 and removes the item", async () => {
    vi.mocked(db.getCartItems).mockReturnValue([]);
    vi.mocked(db.getCartSummary).mockReturnValue({ itemCount: 0, subtotal: 0 });
    const { DELETE } = await import("@/app/api/cart/items/[productId]/route");
    const req = new NextRequest("http://localhost:3000/api/cart/items/p1");
    const res = await DELETE(req, { params: Promise.resolve({ productId: "p1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.itemCount).toBe(0);
  });
});
