import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCategories = [
  { slug: "fruits-vegetables", label: "Fruits & Vegetables", icon: "🥦" },
  { slug: "frozen-seafoods", label: "Frozen Seafoods", icon: "🦐" },
];

vi.mock("@/lib/db", () => ({
  queryCategories: vi.fn(),
}));

import * as db from "@/lib/db";

beforeEach(() => {
  vi.mocked(db.queryCategories).mockReturnValue(
    mockCategories as ReturnType<typeof db.queryCategories>
  );
});

describe("GET /api/categories", () => {
  it("returns 200 with all categories", async () => {
    const { GET } = await import("@/app/api/categories/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].slug).toBe("fruits-vegetables");
    expect(body.data[1].slug).toBe("frozen-seafoods");
  });

  it("returns category objects with slug, label, icon", async () => {
    const { GET } = await import("@/app/api/categories/route");
    const res = await GET();
    const { data } = await res.json();
    for (const cat of data) {
      expect(cat).toHaveProperty("slug");
      expect(cat).toHaveProperty("label");
      expect(cat).toHaveProperty("icon");
    }
  });
});
