import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockRun = vi.fn();
const mockAll = vi.fn();
const mockPrepare = vi.fn(() => ({ run: mockRun, all: mockAll, get: vi.fn() }));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn(),
  getProductDetail: vi.fn(),
}));

import * as db from "@/lib/db";

beforeEach(() => {
  vi.mocked(db.getDb).mockReturnValue({ prepare: mockPrepare } as never);
  vi.mocked(db.getProductDetail).mockReturnValue({
    id: "p1", badge: null, brand: "B", title: "T", category_slug: "cat",
    unit: "kg", price: 1, original_price: null, rating: 4, reviews: 10,
    description: "", sold_percent: null, sold_text: null, is_best_seller: 0,
    is_top_saver: 0, is_just_landing: 0, sale_ends_at: null, icon: "🍎",
    icon_bg: "#fff", created_at: "2024-01-01",
  } as ReturnType<typeof db.getProductDetail>);
  mockRun.mockReset().mockReturnValue({ changes: 1 });
  mockAll.mockReset().mockReturnValue([]);
});

async function authHeader() {
  const token = await signToken("user-test-1");
  return { Authorization: `Bearer ${token}` };
}

// ---------------------------------------------------------------------------
// GET /api/wishlist
// ---------------------------------------------------------------------------
describe("GET /api/wishlist", () => {
  it("returns 200 with wishlist items for authenticated user", async () => {
    mockAll.mockReturnValue([{ id: "p1", title: "Apple" }]);
    const { GET } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      headers: await authHeader(),
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("returns 401 when no token is provided", async () => {
    const { GET } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const { GET } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      headers: { Authorization: "Bearer invalid.token.here" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/wishlist
// ---------------------------------------------------------------------------
describe("POST /api/wishlist", () => {
  it("returns 201 when a valid product is added", async () => {
    const { POST } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: "p1" }),
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toMatch(/added/i);
  });

  it("returns 401 without authentication", async () => {
    const { POST } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: "p1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when productId is missing", async () => {
    const { POST } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when product does not exist", async () => {
    vi.mocked(db.getProductDetail).mockReturnValue(null);
    const { POST } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: "ghost" }),
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 409 when item is already in wishlist", async () => {
    mockRun.mockImplementation(() => {
      throw new Error("UNIQUE constraint failed");
    });
    const { POST } = await import("@/app/api/wishlist/route");
    const req = new NextRequest("http://localhost:3000/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId: "p1" }),
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});
